/**
 * recoverOrderSpec — Admin tool to reconstruct an order's items from its
 * OrderSnapshot capture-at-checkout-start record.
 *
 * Actions:
 *   - lookup:          { order_number } → return the snapshot for one order
 *   - repair:          { order_number, confirm: true } → overwrite Order.items
 *                      with snapshot.items (requires confirm to avoid mistakes)
 *   - audit:           { limit? } → list Orders whose items array is empty or
 *                      where >=1 item is missing a specification, paired with
 *                      whether a snapshot exists for that order
 *
 * All actions require admin role.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const isCorruptItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return true;
  return items.some(it => !it || !it.productName || !it.specification);
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'lookup') {
      const { order_number } = body;
      if (!order_number) return Response.json({ error: 'order_number required' }, { status: 400 });

      const snapshots = await base44.asServiceRole.entities.OrderSnapshot.filter({ order_number });
      const snapshot = (snapshots || []).sort((a, b) => {
        const at = new Date(a.captured_at || a.created_date || 0).getTime();
        const bt = new Date(b.captured_at || b.created_date || 0).getTime();
        return bt - at;
      })[0] || null;

      const orders = await base44.asServiceRole.entities.Order.filter({ order_number });
      const order = orders?.[0] || null;

      return Response.json({
        order_number,
        has_snapshot: !!snapshot,
        snapshot,
        order_items: order?.items || null,
        items_look_corrupt: order ? isCorruptItems(order.items) : null,
      });
    }

    if (action === 'repair') {
      const { order_number, confirm } = body;
      if (!order_number) return Response.json({ error: 'order_number required' }, { status: 400 });
      if (confirm !== true) return Response.json({ error: 'Pass confirm: true to apply changes' }, { status: 400 });

      const snapshots = await base44.asServiceRole.entities.OrderSnapshot.filter({ order_number });
      const snapshot = (snapshots || []).sort((a, b) => {
        const at = new Date(a.captured_at || a.created_date || 0).getTime();
        const bt = new Date(b.captured_at || b.created_date || 0).getTime();
        return bt - at;
      })[0];
      if (!snapshot) return Response.json({ error: 'No snapshot found for order' }, { status: 404 });

      const orders = await base44.asServiceRole.entities.Order.filter({ order_number });
      const order = orders?.[0];
      if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

      const before = order.items;
      await base44.asServiceRole.entities.Order.update(order.id, {
        items: snapshot.items,
        admin_notes: (order.admin_notes ? order.admin_notes + ' | ' : '') + `Items repaired from OrderSnapshot at ${new Date().toISOString()} by ${user.email}`,
      });

      return Response.json({
        success: true,
        order_number,
        items_before: before,
        items_after: snapshot.items,
      });
    }

    if (action === 'audit') {
      const limit = Math.min(Math.max(parseInt(body.limit) || 100, 1), 500);
      const allOrders = await base44.asServiceRole.entities.Order.list();
      const corrupted = allOrders
        .filter(o => isCorruptItems(o.items))
        .slice(0, limit);

      const orderNumbers = corrupted.map(o => o.order_number).filter(Boolean);
      const snapshots = await base44.asServiceRole.entities.OrderSnapshot.list();
      const snapshotByOrder = new Map();
      for (const s of snapshots) {
        if (!s.order_number) continue;
        const existing = snapshotByOrder.get(s.order_number);
        const sTime = new Date(s.captured_at || s.created_date || 0).getTime();
        const eTime = existing ? new Date(existing.captured_at || existing.created_date || 0).getTime() : -1;
        if (sTime > eTime) snapshotByOrder.set(s.order_number, s);
      }

      const report = corrupted.map(o => ({
        order_number: o.order_number,
        customer_email: o.customer_email,
        total_amount: o.total_amount,
        items_count: Array.isArray(o.items) ? o.items.length : 0,
        has_snapshot: snapshotByOrder.has(o.order_number),
        recoverable: snapshotByOrder.has(o.order_number),
      }));

      return Response.json({
        scanned: allOrders.length,
        corrupted_count: corrupted.length,
        recoverable_count: report.filter(r => r.recoverable).length,
        orders: report,
      });
    }

    return Response.json({ error: 'Invalid action — use lookup, repair, or audit' }, { status: 400 });

  } catch (error) {
    console.error('recoverOrderSpec error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
