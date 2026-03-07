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

    // Also fetch Square catalog to resolve item names
    const catalogRes = await fetch('https://connect.squareup.com/v2/catalog/list?types=ITEM,ITEM_VARIATION', {
      headers: {
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Square-Version': '2024-01-18',
      },
    });
    const catalogData = await catalogRes.json();
    const catalogItems = catalogData.objects || [];

    const items = (linda?.order?.line_items || []).map(li => ({
      name: li.name,
      quantity: li.quantity,
      unit_price_usd: (li.base_price_money?.amount || 0) / 100,
      line_total_usd: (li.total_money?.amount || 0) / 100,
    }));

    return Response.json({
      customer: 'Grace Lindao (lindaograce86@gmail.com)',
      order_total_usd: (linda?.payment?.amount_money?.amount || 0) / 100,
      created_at: linda?.payment?.created_at,
      shipping_address: linda?.payment?.shipping_address || null,
      items,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});