import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const orders = await base44.asServiceRole.entities.Order.filter({ status: 'awaiting_payment' });

    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Never DELETE square_payment orders here — Square retries webhook delivery
    // for up to 24h and out-of-band confirmations can arrive even later. Deleting
    // the row makes payment.updated/order.updated unmatchable and orders silently
    // vanish. syncSquarePayments owns the square_payment lifecycle (mark cancelled
    // after 7 days, keep the record). This admin button only cleans non-Square carts.
    const toDelete = orders.filter(order => {
      if (order.payment_method === 'square_payment') return false;
      const createdAt = new Date(order.created_date);
      return createdAt < twoHoursAgo;
    });

    for (const order of toDelete) {
      await base44.asServiceRole.entities.Order.delete(order.id);
    }

    console.log(`Deleted ${toDelete.length} abandoned carts out of ${orders.length} checked`);

    return Response.json({
      success: true,
      deleted: toDelete.length,
      checked: orders.length,
    });
  } catch (error) {
    console.error('deleteAbandonedCarts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});