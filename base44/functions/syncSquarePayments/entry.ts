/**
 * syncSquarePayments — Admin utility
 * Polls Square's Orders API to find completed payments for orders stuck in awaiting_payment.
 * Useful for catching any payments that Square webhooks may have missed.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN');
const SQUARE_LOCATION_ID = Deno.env.get('SQUARE_LOCATION_ID');

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    // Allow both admin users and the scheduler (no user context) to call this
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!SQUARE_ACCESS_TOKEN) {
      return Response.json({ error: 'Square not configured' }, { status: 500 });
    }

    // Get all awaiting_payment Square orders
    const awaitingOrders = await base44.asServiceRole.entities.Order.filter({
      status: 'awaiting_payment',
      payment_method: 'square_payment',
    });

    if (awaitingOrders.length === 0) {
      return Response.json({ message: 'No awaiting Square orders found', synced: 0 });
    }

    console.log(`Found ${awaitingOrders.length} awaiting Square orders`);

    // Get location ID
    let locationId = SQUARE_LOCATION_ID;
    if (!locationId) {
      const locRes = await fetch('https://connect.squareup.com/v2/locations', {
        headers: { 'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`, 'Square-Version': '2024-01-18' },
      });
      const locData = await locRes.json();
      locationId = locData.locations?.[0]?.id;
    }

    // Get all products for stock decrement
    const products = await base44.asServiceRole.entities.Product.list();

    const decrementStock = async (items) => {
      for (const item of items) {
        const product = products.find(p =>
          p.id === item.productId || p.id === item.product_id ||
          p.name === (item.productName || item.product_name)
        );
        if (!product) continue;
        const updatedSpecs = product.specifications?.map(spec => {
          if (spec.name === item.specification) {
            const newQty = Math.max(0, (spec.stock_quantity || 0) - (item.quantity || 1));
            return { ...spec, stock_quantity: newQty, in_stock: newQty > 0 };
          }
          return spec;
        }) || [];
        const allOut = updatedSpecs.every(s => !s.in_stock);
        await base44.asServiceRole.entities.Product.update(product.id, {
          specifications: updatedSpecs,
          in_stock: !allOut,
        });
      }
    };

    let synced = 0;
    const results = [];

    for (const order of awaitingOrders) {
      try {
        // Search Square for this order by reference_id (our order number)
        const searchRes = await fetch('https://connect.squareup.com/v2/orders/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'Square-Version': '2024-01-18',
          },
          body: JSON.stringify({
            location_ids: [locationId],
            query: {
              filter: {
                state_filter: { states: ['COMPLETED'] },
              },
            },
            limit: 500,
          }),
        });

        const searchData = await searchRes.json();
        const squareOrders = searchData.orders || [];

        // Match by reference_id (our order number) or by square_order_id stored on record
        const matchedSquareOrder = squareOrders.find(sq =>
          sq.reference_id === order.order_number ||
          sq.id === order.square_order_id ||
          sq.id === order.transaction_id
        );

        if (matchedSquareOrder) {
          // Found a completed Square order — mark ours as processing
          await base44.asServiceRole.entities.Order.update(order.id, {
            status: 'processing',
            payment_status: 'completed',
            square_order_id: matchedSquareOrder.id,
          });

          // Decrement stock
          if (order.items?.length > 0) {
            await decrementStock(order.items);
          }

          // Send admin notification
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: 'jake@redhelixresearch.com',
              from_name: 'Red Helix Research Orders',
              subject: `✅ Card Payment Synced — Order #${order.order_number} — $${Number(order.total_amount).toFixed(2)}`,
              body: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:30px;background:#fff;">
                <h2 style="color:#16a34a;">✅ Card Payment Synced (Manual Sync)</h2>
                <p>Square confirmed payment for order <strong>#${order.order_number}</strong> via manual sync.</p>
                <p><strong>Customer:</strong> ${order.customer_name}</p>
                <p><strong>Total:</strong> $${Number(order.total_amount).toFixed(2)}</p>
                <p><strong>Square Order ID:</strong> ${matchedSquareOrder.id}</p>
                <p><a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;font-weight:700;">View in Admin →</a></p>
              </div>`,
            });
          } catch {}

          synced++;
          results.push({ order_number: order.order_number, status: 'synced', square_order_id: matchedSquareOrder.id });
          console.log(`Synced order ${order.order_number} from Square`);
        } else {
          results.push({ order_number: order.order_number, status: 'not_found_in_square' });
        }
      } catch (err) {
        console.warn(`Failed to sync order ${order.order_number}:`, err.message);
        results.push({ order_number: order.order_number, status: 'error', error: err.message });
      }
    }

    return Response.json({ synced, total_checked: awaitingOrders.length, results });
  } catch (error) {
    console.error('syncSquarePayments error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});