import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

    // Handle payment completed events
    if (event.type === 'payment.completed' || event.type === 'order.fulfillment.updated') {
      const base44 = createClientFromRequest(req);

      let paymentLinkId = null;
      let squareOrderId = null;

      if (event.type === 'payment.completed') {
        const payment = event.data?.object?.payment;
        squareOrderId = payment?.order_id;
      } else if (event.type === 'order.fulfillment.updated') {
        squareOrderId = event.data?.object?.order_id;
      }

      console.log('Square order ID:', squareOrderId);

      if (squareOrderId) {
        // Find our order by transaction_id (payment_link_id stored at checkout time)
        const allOrders = await base44.asServiceRole.entities.Order.filter({
          payment_method: 'square_payment',
          status: 'awaiting_payment',
        });

        console.log(`Found ${allOrders.length} awaiting_payment Square orders`);

        // Try to match by square order ID stored in transaction_id
        const matchedOrder = allOrders.find(o => o.transaction_id === squareOrderId || o.transaction_id === paymentLinkId);

        if (matchedOrder) {
          await base44.asServiceRole.entities.Order.update(matchedOrder.id, {
            status: 'processing',
            payment_status: 'completed',
            transaction_id: squareOrderId,
          });
          console.log(`Order ${matchedOrder.order_number} updated to processing`);
        } else {
          console.warn('No matching order found for Square order ID:', squareOrderId);
        }
      }
    }

    // Handle checkout.payment_link.completed
    if (event.type === 'checkout.payment_link.completed') {
      const base44 = createClientFromRequest(req);
      const paymentLinkId = event.data?.object?.payment_link?.id;
      const orderId = event.data?.object?.payment_link?.order_id;

      console.log('Payment link completed. linkId:', paymentLinkId, 'orderId:', orderId);

      if (paymentLinkId || orderId) {
        const allOrders = await base44.asServiceRole.entities.Order.filter({
          payment_method: 'square_payment',
          status: 'awaiting_payment',
        });

        const matchedOrder = allOrders.find(o =>
          o.transaction_id === paymentLinkId || o.transaction_id === orderId
        );

        if (matchedOrder) {
          await base44.asServiceRole.entities.Order.update(matchedOrder.id, {
            status: 'processing',
            payment_status: 'completed',
          });
          console.log(`Order ${matchedOrder.order_number} updated to processing via payment_link event`);
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Square webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});