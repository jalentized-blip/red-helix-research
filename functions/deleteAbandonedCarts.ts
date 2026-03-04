import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const orders = await base44.asServiceRole.entities.Order.filter({ status: 'awaiting_payment' });

    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const stale = orders.filter(o => new Date(o.created_date).getTime() < twoHoursAgo);

    let deleted = 0;
    for (const order of stale) {
      await base44.asServiceRole.entities.Order.delete(order.id);
      deleted++;
    }

    return Response.json({ success: true, deleted, checked: orders.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});