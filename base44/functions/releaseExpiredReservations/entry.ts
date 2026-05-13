/**
 * releaseExpiredReservations — Scheduled every 5 minutes
 * Finds orders where stock was reserved but payment was never completed,
 * and the 15-minute reservation window has expired.
 * Restores the stock quantities for those items and marks the order as cancelled.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Allow admin users OR the scheduler (no user context)
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();

    // Find all orders with expired stock reservations that are still unpaid
    let expiredOrders = [];
    try {
      const reservedOrders = await base44.asServiceRole.entities.Order.filter({
        stock_reserved: true,
        payment_status: 'pending',
      });
      // Filter to those whose reservation has expired
      // IMPORTANT: Skip Zelle (manual confirmation — stock already decremented at submission)
      // Skip Square (handled by syncSquarePayments + webhook)
      // Skip awaiting_payment/awaiting_confirmation statuses (still in-progress)
      expiredOrders = reservedOrders.filter(order => {
        if (order.payment_method === 'zelle') return false; // never auto-cancel Zelle — stock already decremented
        if (order.payment_method === 'square_payment') return false; // webhook handles these
        if (order.status === 'awaiting_payment' || order.status === 'awaiting_confirmation') return false;
        if (!order.reserved_until) return true; // no expiry set — treat as expired
        return new Date(order.reserved_until) < now;
      });
    } catch (err) {
      return Response.json({ error: `Failed to load reserved orders: ${err.message}` }, { status: 500 });
    }

    if (expiredOrders.length === 0) {
      return Response.json({ message: 'No expired reservations', released: 0 });
    }

    console.log(`Found ${expiredOrders.length} expired stock reservations`);

    let released = 0;
    const results = [];

    for (const order of expiredOrders) {
      try {
        // Restore stock via dedicated backend function (keeps logic in one place)
        if (order.items?.length > 0) {
          try {
            await base44.asServiceRole.functions.invoke('decrementStock', {
              action: 'restore',
              items: order.items,
              orderNumber: order.order_number,
            });
          } catch (stockErr) {
            console.warn(`Failed to restore stock for order ${order.order_number}:`, stockErr.message);
          }
        }

        // Mark the order: stock no longer reserved, cancel it
        await base44.asServiceRole.entities.Order.update(order.id, {
          stock_reserved: false,
          status: 'cancelled',
          payment_status: 'abandoned',
          admin_notes: `${order.admin_notes ? order.admin_notes + ' | ' : ''}Stock reservation expired — order auto-cancelled at ${now.toISOString()}`,
        });

        released++;
        results.push({ order_number: order.order_number, status: 'released' });
        console.log(`Released reservation for order ${order.order_number}`);

      } catch (err) {
        console.warn(`Failed to release reservation for ${order.order_number}:`, err.message);
        results.push({ order_number: order.order_number, status: 'error', error: err.message });
      }
    }

    return Response.json({ released, total_checked: expiredOrders.length, results });

  } catch (error) {
    console.error('releaseExpiredReservations fatal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});