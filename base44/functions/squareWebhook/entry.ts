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
    const findSquareOrder = async (ids = [], orderNumber = null) => {
      const validIds = ids.filter(Boolean);

      // Fetch awaiting_payment, pending, AND recently processing square orders
      const [awaitingOrders, processingOrders] = await Promise.all([
        base44.asServiceRole.entities.Order.filter({ payment_method: 'square_payment', payment_status: 'pending' }),
        base44.asServiceRole.entities.Order.filter({ payment_method: 'square_payment', payment_status: 'completed' }),
      ]);

      // Check if already processed (idempotency guard)
      const alreadyProcessed = processingOrders.find(o =>
        (validIds.length > 0 && (validIds.includes(o.transaction_id) || validIds.includes(o.square_order_id))) ||
        (orderNumber && o.order_number === orderNumber)
      );
      if (alreadyProcessed) {
        console.log(`Order ${alreadyProcessed.order_number} already processed — skipping duplicate webhook.`);
        return { order: alreadyProcessed, alreadyDone: true };
      }

      const allCandidates = awaitingOrders.filter(o => o.payment_method === 'square_payment');

      // 1. Match by square_order_id (most reliable — set at link creation)
      if (validIds.length > 0) {
        const bySquareOrderId = allCandidates.find(o => validIds.includes(o.square_order_id));
        if (bySquareOrderId) return { order: bySquareOrderId, alreadyDone: false };

        // 2. Match by transaction_id (paymentLinkId stored at order creation)
        const byTransactionId = allCandidates.find(o => validIds.includes(o.transaction_id));
        if (byTransactionId) return { order: byTransactionId, alreadyDone: false };
      }

      // 3. Match by order_number (reference_id set in Square API — most reliable fallback)
      if (orderNumber) {
        const byOrderNumber = allCandidates.find(o => o.order_number === orderNumber);
        if (byOrderNumber) return { order: byOrderNumber, alreadyDone: false };
      }

      // 4. Fallback: search ALL square awaiting_payment orders if no match (defensive)
      if (validIds.length > 0) {
        const allAwaiting = awaitingOrders;
        const fallback = allAwaiting.find(o =>
          validIds.includes(o.transaction_id) || validIds.includes(o.square_order_id)
        );
        if (fallback) return { order: fallback, alreadyDone: false };
      }

      console.warn('No matching awaiting_payment order found for IDs:', validIds, 'orderNumber:', orderNumber);
      return null;
    };

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
          const updatedSpecs = product.specifications?.map(spec => {
            if (spec.name === item.specification) {
              const newQty = Math.max(0, (spec.stock_quantity || 0) - (item.quantity || 1));
              return { ...spec, stock_quantity: newQty, in_stock: newQty > 0 };
            }
            return spec;
          }) || [];
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

    const markOrderComplete = async (order, transactionId) => {
      await base44.asServiceRole.entities.Order.update(order.id, {
        status: 'processing',
        payment_status: 'completed',
        transaction_id: transactionId || order.transaction_id,
        stock_reserved: false,
        reserved_until: null,
      });

      // Decrement stock only if NOT already reserved/decremented at checkout
      if (!order.stock_reserved && order.items?.length > 0) {
        await decrementStock(order.items);
      } else {
        console.log(`Order ${order.order_number} had stock_reserved=true — skipping decrement`);
      }
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
      // reference_id is our order number, set on the Square Order at creation
      const referenceId = payment?.reference_id || null;

      console.log('Payment event:', event.type, '| status:', paymentStatus, '| squareOrderId:', squareOrderId, '| paymentId:', paymentId, '| referenceId:', referenceId);

      if (paymentStatus === 'COMPLETED') {
        const result = await findSquareOrder([squareOrderId, paymentId, referenceId], referenceId);
        if (result && !result.alreadyDone) {
          await markOrderComplete(result.order, paymentId || squareOrderId);
        }
      }
    }

    // Handle checkout.payment_link.completed
    if (event.type === 'checkout.payment_link.completed') {
      const paymentLinkId = event.data?.object?.payment_link?.id;
      const squareOrderId = event.data?.object?.payment_link?.order_id;
      // The reference_id on the Square order is our order number
      const referenceId = event.data?.object?.payment_link?.payment_note || null;

      console.log('Payment link completed. linkId:', paymentLinkId, 'orderId:', squareOrderId, 'referenceId:', referenceId);

      const result = await findSquareOrder([paymentLinkId, squareOrderId], referenceId);
      if (result && !result.alreadyDone) {
        await markOrderComplete(result.order, paymentLinkId || squareOrderId);
      }
    }

    // Handle order.updated — catches Square order state changes
    if (event.type === 'order.updated') {
      const squareOrderId = event.data?.object?.order_updated?.order_id;
      const state = event.data?.object?.order_updated?.state;
      // reference_id is our order number stored on the Square order
      const referenceId = event.data?.object?.order_updated?.reference_id || null;
      console.log('Order updated. squareOrderId:', squareOrderId, '| state:', state, '| referenceId:', referenceId);

      if (squareOrderId && state === 'COMPLETED') {
        const result = await findSquareOrder([squareOrderId], referenceId);
        if (result && !result.alreadyDone) {
          await markOrderComplete(result.order, squareOrderId);
        }
      }
    }

    // Handle order.fulfillment.updated
    if (event.type === 'order.fulfillment.updated') {
      const squareOrderId = event.data?.object?.order_id;
      const fulfillmentState = event.data?.object?.fulfillment?.state;
      const referenceId = event.data?.object?.reference_id || null;
      console.log('Fulfillment updated. squareOrderId:', squareOrderId, '| state:', fulfillmentState, '| referenceId:', referenceId);

      if (squareOrderId && (fulfillmentState === 'COMPLETED' || fulfillmentState === 'PREPARED')) {
        const result = await findSquareOrder([squareOrderId], referenceId);
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