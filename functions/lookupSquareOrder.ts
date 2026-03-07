import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { referenceId } = await req.json();

    // Search Square orders by reference_id
    const response = await fetch('https://connect.squareup.com/v2/orders/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify({
        query: {
          filter: {
            customer_filter: {},
          },
        },
        return_entries: false,
        limit: 500,
      }),
    });

    const data = await response.json();
    const orders = data.orders || [];

    // Filter by reference_id matching our pattern
    const matched = orders.filter(o =>
      o.reference_id === referenceId ||
      (o.line_items || []).some(li => li.catalog_object_id === referenceId || li.uid === referenceId || (li.metadata && Object.values(li.metadata).includes(referenceId))) ||
      o.id === referenceId
    );

    // Also search payments if no order match
    // Fetch all payments
    const paymentResponse = await fetch('https://connect.squareup.com/v2/payments?limit=200', {
      headers: {
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Square-Version': '2024-01-18',
      },
    });
    const paymentData = await paymentResponse.json();
    const payments = paymentData.payments || [];

    // For each payment, fetch the full order to get customer/line item details
    const fullOrders = [];
    for (const p of payments) {
      if (p.order_id) {
        const orderRes = await fetch(`https://connect.squareup.com/v2/orders/${p.order_id}`, {
          headers: {
            'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
            'Square-Version': '2024-01-18',
          },
        });
        const orderJson = await orderRes.json();
        if (orderJson.order) {
          fullOrders.push({ payment: p, order: orderJson.order });
        }
      }
    }

    const linda = fullOrders.find(e => e.payment.buyer_email_address === 'lindaograce86@gmail.com');

    return Response.json({
      line_items: linda?.order?.line_items || [],
      order_note: linda?.payment?.note || null,
      total: linda?.payment?.amount_money,
      shipping_address: linda?.payment?.shipping_address || null,
      billing_address: linda?.payment?.billing_address || null,
      created_at: linda?.payment?.created_at,
      order_id: linda?.payment?.order_id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});