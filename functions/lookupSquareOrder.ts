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
    const paymentResponse = await fetch('https://connect.squareup.com/v2/payments?limit=200', {
      headers: {
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Square-Version': '2024-01-18',
      },
    });
    const paymentData = await paymentResponse.json();
    const payments = paymentData.payments || [];

    // Find payments with note or reference matching RH-QD4987
    const matchedPayments = payments.filter(p =>
      p.note?.includes(referenceId) ||
      p.reference_id === referenceId ||
      p.order_id === referenceId
    );

    return Response.json({
      orders: matched,
      all_orders_count: orders.length,
      matched_payments: matchedPayments,
      all_payments_count: payments.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});