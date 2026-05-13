/**
 * lookupSquareOrder — Admin tool to look up a Square order by our reference_id
 * (order number), Square order id, or buyer email.
 *
 * Body (any one of these required):
 *   { referenceId: "ORD-1234" }      our order number used at checkout creation
 *   { squareOrderId: "...id..." }    Square's internal order id
 *   { buyerEmail: "x@y.com" }        search recent payments for this buyer email
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN');

const sqHeaders = () => ({
  'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'Square-Version': '2026-01-22',
});

const formatLineItems = (lineItems) =>
  (lineItems || []).map(li => ({
    name: li.name,
    quantity: li.quantity,
    unit_price_usd: (li.base_price_money?.amount || 0) / 100,
    line_total_usd: (li.total_money?.amount || 0) / 100,
  }));

const buildResult = (sqOrder, payment) => ({
  square_order_id: sqOrder?.id,
  reference_id: sqOrder?.reference_id,
  state: sqOrder?.state,
  buyer_email: payment?.buyer_email_address || null,
  order_total_usd: (sqOrder?.total_money?.amount || payment?.amount_money?.amount || 0) / 100,
  created_at: sqOrder?.created_at || payment?.created_at,
  shipping_address: payment?.shipping_address || null,
  items: formatLineItems(sqOrder?.line_items),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!SQUARE_ACCESS_TOKEN) {
      return Response.json({ error: 'Square not configured' }, { status: 500 });
    }

    const { referenceId, squareOrderId, buyerEmail } = await req.json();
    if (!referenceId && !squareOrderId && !buyerEmail) {
      return Response.json({ error: 'Provide referenceId, squareOrderId, or buyerEmail' }, { status: 400 });
    }

    if (squareOrderId) {
      const res = await fetch(`https://connect.squareup.com/v2/orders/${squareOrderId}`, { headers: sqHeaders() });
      const data = await res.json();
      if (!data.order) return Response.json({ error: 'Square order not found', details: data }, { status: 404 });
      return Response.json(buildResult(data.order, null));
    }

    if (referenceId) {
      const res = await fetch('https://connect.squareup.com/v2/orders/search', {
        method: 'POST',
        headers: sqHeaders(),
        body: JSON.stringify({
          query: {
            filter: {
              date_time_filter: {
                updated_at: {
                  start_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                },
              },
            },
          },
          return_entries: false,
          limit: 500,
        }),
      });
      const data = await res.json();
      const orders = data.orders || [];
      const matched = orders.find(o => o.reference_id === referenceId || o.id === referenceId);
      if (!matched) return Response.json({ error: 'No Square order matches that referenceId in last 90 days' }, { status: 404 });
      return Response.json(buildResult(matched, null));
    }

    // buyerEmail path — scan recent payments and resolve each to its order
    const paymentResponse = await fetch('https://connect.squareup.com/v2/payments?limit=100', { headers: sqHeaders() });
    const paymentData = await paymentResponse.json();
    const matchingPayments = (paymentData.payments || []).filter(p =>
      p.buyer_email_address && p.buyer_email_address.toLowerCase() === buyerEmail.toLowerCase()
    );
    if (matchingPayments.length === 0) {
      return Response.json({ error: 'No recent Square payments for that buyer email' }, { status: 404 });
    }

    const results = [];
    for (const p of matchingPayments) {
      if (!p.order_id) continue;
      const orderRes = await fetch(`https://connect.squareup.com/v2/orders/${p.order_id}`, { headers: sqHeaders() });
      const orderJson = await orderRes.json();
      if (orderJson.order) results.push(buildResult(orderJson.order, p));
    }
    return Response.json({ buyer_email: buyerEmail, count: results.length, results });

  } catch (error) {
    console.error('lookupSquareOrder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
