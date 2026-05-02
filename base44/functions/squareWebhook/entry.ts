import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SQUARE_WEBHOOK_SIGNATURE_KEY = Deno.env.get('SQUARE_WEBHOOK_SIGNATURE_KEY');

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.text();

    // Verify Square webhook signature if key is configured
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
    console.log('Square webhook event type:', event.type);

    const base44 = createClientFromRequest(req);

    // ─── Helper: find a Square order by all possible ID fields ───
    const findSquareOrder = async (ids = []) => {
      const validIds = ids.filter(Boolean);
      if (validIds.length === 0) return null;

      // Fetch both awaiting_payment AND processing orders (avoid reprocessing already-done orders)
      const [awaitingOrders, processingOrders] = await Promise.all([
        base44.asServiceRole.entities.Order.filter({ status: 'awaiting_payment' }),
        base44.asServiceRole.entities.Order.filter({ status: 'processing', payment_method: 'square_payment' }),
      ]);

      const allCandidates = [...awaitingOrders];

      // Check if already processed (idempotency guard)
      const alreadyProcessed = processingOrders.find(o =>
        validIds.includes(o.transaction_id) || validIds.includes(o.admin_notes)
      );
      if (alreadyProcessed) {
        console.log(`Order ${alreadyProcessed.order_number} already processed — skipping duplicate webhook.`);
        return { order: alreadyProcessed, alreadyDone: true };
      }

      // Match by transaction_id (stores paymentLinkId at checkout creation time)
      const matched = allCandidates.find(o => validIds.includes(o.transaction_id));
      if (matched) return { order: matched, alreadyDone: false };

      console.warn('No matching awaiting_payment order found for IDs:', validIds);
      return null;
    };

    const markOrderComplete = async (order, transactionId) => {
      await base44.asServiceRole.entities.Order.update(order.id, {
        status: 'processing',
        payment_status: 'completed',
        transaction_id: transactionId || order.transaction_id,
      });
      console.log(`Order ${order.order_number} marked as processing (tx: ${transactionId})`);

      // Send admin notification for Square payment completion
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

    // Handle payment.updated / payment.completed
    if (event.type === 'payment.updated' || event.type === 'payment.completed') {
      const payment = event.data?.object?.payment;
      const paymentStatus = payment?.status;
      const squareOrderId = payment?.order_id;
      const paymentId = payment?.id;

      console.log('Payment event:', event.type, '| status:', paymentStatus, '| squareOrderId:', squareOrderId, '| paymentId:', paymentId);

      if (paymentStatus === 'COMPLETED') {
        const result = await findSquareOrder([squareOrderId, paymentId]);
        if (result && !result.alreadyDone) {
          await markOrderComplete(result.order, paymentId || squareOrderId);
        }
      }
    }

    // Handle checkout.payment_link.completed
    if (event.type === 'checkout.payment_link.completed') {
      const paymentLinkId = event.data?.object?.payment_link?.id;
      const squareOrderId = event.data?.object?.payment_link?.order_id;

      console.log('Payment link completed. linkId:', paymentLinkId, 'orderId:', squareOrderId);

      const result = await findSquareOrder([paymentLinkId, squareOrderId]);
      if (result && !result.alreadyDone) {
        await markOrderComplete(result.order, paymentLinkId || squareOrderId);
      }
    }

    // Handle order.updated — catches Square order state changes
    if (event.type === 'order.updated') {
      const squareOrderId = event.data?.object?.order_updated?.order_id;
      const state = event.data?.object?.order_updated?.state;
      console.log('Order updated. squareOrderId:', squareOrderId, '| state:', state);

      if (squareOrderId && state === 'COMPLETED') {
        const result = await findSquareOrder([squareOrderId]);
        if (result && !result.alreadyDone) {
          await markOrderComplete(result.order, squareOrderId);
        }
      }
    }

    // Handle order.fulfillment.updated
    if (event.type === 'order.fulfillment.updated') {
      const squareOrderId = event.data?.object?.order_id;
      const fulfillmentState = event.data?.object?.fulfillment?.state;
      console.log('Fulfillment updated. squareOrderId:', squareOrderId, '| state:', fulfillmentState);

      if (squareOrderId && (fulfillmentState === 'COMPLETED' || fulfillmentState === 'PREPARED')) {
        const result = await findSquareOrder([squareOrderId]);
        if (result && !result.alreadyDone) {
          await markOrderComplete(result.order, squareOrderId);
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Square webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});