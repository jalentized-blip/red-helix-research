/**
 * squareWebhook — Receives Square payment event notifications
 *
 * Signature verification:
 *   HMAC-SHA256(signatureKey, notificationURL + body) → base64 → compare to X-Square-HmacSha256-Signature
 *
 * Events handled:
 *   payment.updated        → payment.data.object.payment: { id, status, order_id }
 *   order.updated          → event.data.object.order_updated: { order_id, state }
 *                            NOTE: reference_id is on the full Order object, NOT order_updated — so we fetch it
 *   order.fulfillment.updated → event.data.object.order_fulfillment_updated: { order_id, fulfillment: { state } }
 *
 * Reference: https://developer.squareup.com/docs/webhooks/v2webhook-events-tech-ref
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SQUARE_WEBHOOK_SIGNATURE_KEY = Deno.env.get('SQUARE_WEBHOOK_SIGNATURE_KEY');
const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN');

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.text();

    // ── Verify Square webhook signature ─────────────────────────────────────
    // Square signs: HMAC-SHA256(signatureKey, notificationURL + body), base64-encoded
    if (SQUARE_WEBHOOK_SIGNATURE_KEY) {
      const signature = req.headers.get('x-square-hmacsha256-signature');
      if (!signature) {
        console.warn('Missing Square webhook signature');
        return Response.json({ error: 'Missing signature' }, { status: 401 });
      }

      const url = req.url;
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(SQUARE_WEBHOOK_SIGNATURE_KEY),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signatureBytes = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(url + body)
      );
      const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));

      if (signature !== expectedSignature) {
        console.warn('Invalid Square webhook signature');
        return Response.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    console.log('Square webhook event type:', event.type, '| event_id:', event.event_id);

    const base44 = createClientFromRequest(req);

    // ── Helper: fetch full Square order to get reference_id ─────────────────
    const fetchSquareOrderReferenceId = async (squareOrderId) => {
      if (!squareOrderId || !SQUARE_ACCESS_TOKEN) return null;
      try {
        const res = await fetch(`https://connect.squareup.com/v2/orders/${squareOrderId}`, {
          headers: {
            'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
            'Square-Version': '2024-01-18',
          },
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.order?.reference_id || null;
      } catch {
        return null;
      }
    };

    // ── Helper: find our internal order matching a Square payment ────────────
    const findSquareOrder = async (ids = [], referenceId = null) => {
      const validIds = ids.filter(Boolean);

      // Load all pending Square orders
      const [pendingOrders, completedOrders] = await Promise.all([
        base44.asServiceRole.entities.Order.filter({ payment_method: 'square_payment', payment_status: 'pending' }),
        base44.asServiceRole.entities.Order.filter({ payment_method: 'square_payment', payment_status: 'completed' }),
      ]);

      // Idempotency guard — skip if already completed
      const alreadyProcessed = completedOrders.find(o =>
        (validIds.length > 0 && (validIds.includes(o.transaction_id) || validIds.includes(o.square_order_id))) ||
        (referenceId && o.order_number === referenceId)
      );
      if (alreadyProcessed) {
        console.log(`Order ${alreadyProcessed.order_number} already processed — skipping duplicate webhook.`);
        return { order: alreadyProcessed, alreadyDone: true };
      }

      // 1. Match by square_order_id (most reliable — set at checkout link creation)
      if (validIds.length > 0) {
        const bySquareOrderId = pendingOrders.find(o => validIds.includes(o.square_order_id));
        if (bySquareOrderId) return { order: bySquareOrderId, alreadyDone: false };

        // 2. Match by transaction_id (paymentLinkId stored at order creation)
        const byTransactionId = pendingOrders.find(o => validIds.includes(o.transaction_id));
        if (byTransactionId) return { order: byTransactionId, alreadyDone: false };
      }

      // 3. Match by reference_id (our order number set as reference_id on the Square Order)
      if (referenceId) {
        const byRef = pendingOrders.find(o => o.order_number === referenceId);
        if (byRef) return { order: byRef, alreadyDone: false };
      }

      console.warn('No matching pending Square order found for IDs:', validIds, 'referenceId:', referenceId);
      return null;
    };

    // ── Helper: decrement stock ──────────────────────────────────────────────
    const decrementStock = async (items) => {
      if (!items?.length) return;
      try {
        const products = await base44.asServiceRole.entities.Product.list();
        for (const item of items) {
          const product = products.find(p =>
            p.id === item.productId || p.id === item.product_id ||
            p.name === (item.productName || item.product_name)
          );
          if (!product) continue;
          const updatedSpecs = (product.specifications || []).map(spec => {
            if (spec.name === item.specification) {
              const newQty = Math.max(0, (spec.stock_quantity || 0) - (item.quantity || 1));
              return { ...spec, stock_quantity: newQty, in_stock: newQty > 0 };
            }
            return spec;
          });
          const allOut = updatedSpecs.every(s => !s.in_stock);
          await base44.asServiceRole.entities.Product.update(product.id, {
            specifications: updatedSpecs,
            in_stock: !allOut,
          });
        }
        console.log('Stock decremented for', items.length, 'item(s)');
      } catch (err) {
        console.warn('Stock decrement failed (non-blocking):', err.message);
      }
    };

    // ── Helper: mark order complete ──────────────────────────────────────────
    const markOrderComplete = async (order, transactionId) => {
      await base44.asServiceRole.entities.Order.update(order.id, {
        status: 'processing',
        payment_status: 'completed',
        transaction_id: transactionId || order.transaction_id,
        stock_reserved: false,
        reserved_until: null,
      });

      // Decrement stock only if NOT already decremented at checkout (stock_reserved=true means already done)
      if (!order.stock_reserved && order.items?.length > 0) {
        await decrementStock(order.items);
      } else {
        console.log(`Order ${order.order_number} had stock_reserved=true — skipping stock decrement`);
      }
      console.log(`Order ${order.order_number} marked as processing (tx: ${transactionId})`);

      // Admin notification
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: 'jake@redhelixresearch.com',
          from_name: 'Red Helix Research Orders',
          subject: `✅ Card Payment Confirmed — Order #${order.order_number} — $${Number(order.total_amount).toFixed(2)}`,
          body: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:30px;background:#fff;">
            <h2 style="color:#16a34a;margin:0 0 8px 0;">✅ Card Payment Confirmed</h2>
            <p style="color:#64748b;">Square has confirmed payment for order <strong>#${order.order_number}</strong>.</p>
            <p><strong>Customer:</strong> ${order.customer_name}</p>
            <p><strong>Email:</strong> ${order.customer_email}</p>
            <p><strong>Total:</strong> $${Number(order.total_amount).toFixed(2)}</p>
            <p><strong>TX ID:</strong> <code>${transactionId || order.transaction_id}</code></p>
            <p style="margin-top:20px;"><a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;font-weight:700;">View in Admin →</a></p>
          </div>`,
        });
      } catch (e) {
        console.warn('Admin notification failed (non-blocking):', e.message);
      }
    };

    // ── Event: payment.updated ───────────────────────────────────────────────
    // Payload: event.data.object.payment = { id, status, order_id, reference_id? }
    // The payment.reference_id is rarely set — order.reference_id is more reliable.
    if (event.type === 'payment.updated') {
      const payment = event.data?.object?.payment;
      const paymentStatus = payment?.status;
      const squareOrderId = payment?.order_id;       // Square's order ID
      const paymentId = payment?.id;                  // Square's payment ID
      const paymentRefId = payment?.reference_id;     // Rarely populated on payment

      console.log('payment.updated | status:', paymentStatus, '| order_id:', squareOrderId, '| payment_id:', paymentId);

      if (paymentStatus === 'COMPLETED') {
        // Try to get reference_id from the full Square order (most reliable source)
        const referenceId = paymentRefId || await fetchSquareOrderReferenceId(squareOrderId);
        const result = await findSquareOrder([squareOrderId, paymentId], referenceId);
        if (result && !result.alreadyDone) {
          await markOrderComplete(result.order, paymentId || squareOrderId);
        }
      }
    }

    // ── Event: order.updated ─────────────────────────────────────────────────
    // Payload: event.data.object.order_updated = { order_id, state, version, updated_at }
    // NOTE: reference_id is NOT in order_updated — must fetch the full order from Square API
    if (event.type === 'order.updated') {
      const orderUpdated = event.data?.object?.order_updated;
      const squareOrderId = orderUpdated?.order_id;
      const state = orderUpdated?.state;

      console.log('order.updated | order_id:', squareOrderId, '| state:', state);

      if (squareOrderId && state === 'COMPLETED') {
        // Fetch full order from Square to get reference_id (our order number)
        const referenceId = await fetchSquareOrderReferenceId(squareOrderId);
        const result = await findSquareOrder([squareOrderId], referenceId);
        if (result && !result.alreadyDone) {
          await markOrderComplete(result.order, squareOrderId);
        }
      }
    }

    // ── Event: order.fulfillment.updated ─────────────────────────────────────
    // Payload: event.data.object.order_fulfillment_updated = { order_id, fulfillment_update: [{ fulfillment_uid, old_state, new_state }] }
    if (event.type === 'order.fulfillment.updated') {
      const fulfillmentUpdated = event.data?.object?.order_fulfillment_updated;
      const squareOrderId = fulfillmentUpdated?.order_id;
      const updates = fulfillmentUpdated?.fulfillment_update || [];
      const isCompleted = updates.some(u => u.new_state === 'COMPLETED');

      console.log('order.fulfillment.updated | order_id:', squareOrderId, '| updates:', JSON.stringify(updates));

      if (squareOrderId && isCompleted) {
        const referenceId = await fetchSquareOrderReferenceId(squareOrderId);
        const result = await findSquareOrder([squareOrderId], referenceId);
        if (result && !result.alreadyDone) {
          await markOrderComplete(result.order, squareOrderId);
        }
      }
    }

    // Always return 200 quickly so Square doesn't retry
    return Response.json({ received: true });

  } catch (error) {
    console.error('Square webhook error:', error);
    // Still return 200 to prevent Square from retrying on our processing errors
    return Response.json({ received: true, error: error.message }, { status: 200 });
  }
});