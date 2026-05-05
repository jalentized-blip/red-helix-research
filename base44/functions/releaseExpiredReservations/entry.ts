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
      // Filter to those whose reservation has expired — skip Zelle orders (they await manual confirmation)
      expiredOrders = reservedOrders.filter(order => {
        if (order.payment_method === 'zelle') return false; // never auto-cancel Zelle
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

    // Load products once
    let products = [];
    try {
      products = await base44.asServiceRole.entities.Product.list();
    } catch (err) {
      return Response.json({ error: `Failed to load products: ${err.message}` }, { status: 500 });
    }

    let released = 0;
    const results = [];

    for (const order of expiredOrders) {
      try {
        // Restore stock for each item
        if (order.items?.length > 0 && products.length > 0) {
          for (const item of order.items) {
            try {
              const product = products.find(p =>
                p.id === item.productId || p.id === item.product_id ||
                p.name === (item.productName || item.product_name)
              );
              if (!product) continue;

              const updatedSpecs = (product.specifications || []).map(spec => {
                if (spec.name === item.specification) {
                  const restored = (spec.stock_quantity || 0) + (item.quantity || 1);
                  return { ...spec, stock_quantity: restored, in_stock: restored > 0 };
                }
                return spec;
              });

              // Update the in-memory product so subsequent items in this loop see updated qty
              product.specifications = updatedSpecs;

              await base44.asServiceRole.entities.Product.update(product.id, {
                specifications: updatedSpecs,
                in_stock: updatedSpecs.some(s => s.in_stock),
              });
            } catch (itemErr) {
              console.warn(`Failed to restore stock for ${item.productName}:`, itemErr.message);
            }
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