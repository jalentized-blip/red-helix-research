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

    const base44 = createClientFromRequest(req);

    // Handle payment.updated — check if payment status is COMPLETED
    if (event.type === 'payment.updated' || event.type === 'payment.completed') {
      const payment = event.data?.object?.payment;
      const paymentStatus = payment?.status; // "COMPLETED", "FAILED", etc.
      const squareOrderId = payment?.order_id;

      console.log('Payment event:', event.type, '| status:', paymentStatus, '| squareOrderId:', squareOrderId);

      if (paymentStatus === 'COMPLETED' && squareOrderId) {
        // Fetch all awaiting_payment orders (payment_method may not always be set)
        const allOrders = await base44.asServiceRole.entities.Order.filter({
          status: 'awaiting_payment',
        });

        console.log(`Found ${allOrders.length} awaiting_payment Square orders`);

        const matchedOrder = allOrders.find(o => o.transaction_id === squareOrderId);

        if (matchedOrder) {
          await base44.asServiceRole.entities.Order.update(matchedOrder.id, {
            status: 'processing',
            payment_status: 'completed',
            transaction_id: payment?.id || squareOrderId,
          });
          console.log(`Order ${matchedOrder.order_number} updated to processing via payment.updated`);
        } else {
          // Fallback: try matching by any awaiting_payment Square order (most recent)
          // This handles cases where the Square order_id wasn't stored at checkout
          if (allOrders.length > 0) {
            const mostRecent = allOrders.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
            await base44.asServiceRole.entities.Order.update(mostRecent.id, {
              status: 'processing',
              payment_status: 'completed',
              transaction_id: squareOrderId,
            });
            console.log(`Fallback: Order ${mostRecent.order_number} updated to processing`);
          } else {
            console.warn('No matching order found for Square order ID:', squareOrderId);
          }
        }
      }
    }

    // Handle checkout.payment_link.completed
    if (event.type === 'checkout.payment_link.completed') {
      const paymentLinkId = event.data?.object?.payment_link?.id;
      const squareOrderId = event.data?.object?.payment_link?.order_id;

      console.log('Payment link completed. linkId:', paymentLinkId, 'orderId:', squareOrderId);

      if (paymentLinkId || squareOrderId) {
      const allOrders = await base44.asServiceRole.entities.Order.filter({
        status: 'awaiting_payment',
      });

        const matchedOrder = allOrders.find(o =>
          o.transaction_id === paymentLinkId || o.transaction_id === squareOrderId
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

    // Handle order.fulfillment.updated
    if (event.type === 'order.fulfillment.updated') {
      const squareOrderId = event.data?.object?.order_id;
      const fulfillmentState = event.data?.object?.fulfillment?.state;

      console.log('Fulfillment updated. squareOrderId:', squareOrderId, '| state:', fulfillmentState);

      if (squareOrderId) {
        const allOrders = await base44.asServiceRole.entities.Order.filter({
          payment_method: 'square_payment',
          status: 'awaiting_payment',
        });

        const matchedOrder = allOrders.find(o => o.transaction_id === squareOrderId);
        if (matchedOrder) {
          await base44.asServiceRole.entities.Order.update(matchedOrder.id, {
            status: 'processing',
            payment_status: 'completed',
          });
          console.log(`Order ${matchedOrder.order_number} updated to processing via fulfillment event`);
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Square webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});