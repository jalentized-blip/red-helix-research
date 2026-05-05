/**
 * syncSquarePayments — Scheduled + Admin utility
 * Polls Square to find completed payments for orders stuck in awaiting_payment.
 * Runs on a 15-minute schedule and can also be triggered manually by admin.
 *
 * Failsafes:
 * - Idempotency: checks payment_status before decrementing stock
 * - Direct lookup by square_order_id (most reliable)
 * - Fallback search by reference_id (our order number)
 * - Stale order detection: cancels orders >72h old with no payment
 * - Double-decrement prevention via payment_status guard
 * - Per-order error isolation (one failure won't stop others)
 * - Customer email on successful sync
 * - Admin email on sync or stale cancellation
 * - All DB/Square errors caught and logged individually
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN');
const SQUARE_LOCATION_ID = Deno.env.get('SQUARE_LOCATION_ID');
const STALE_ORDER_HOURS = 72; // Cancel awaiting_payment orders older than this

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

    if (!SQUARE_ACCESS_TOKEN) {
      return Response.json({ error: 'Square not configured' }, { status: 500 });
    }

    // ── Resolve location ID ──────────────────────────────────────
    let locationId = SQUARE_LOCATION_ID;
    if (!locationId) {
      try {
        const locRes = await fetch('https://connect.squareup.com/v2/locations', {
          headers: { 'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`, 'Square-Version': '2024-01-18' },
        });
        const locData = await locRes.json();
        locationId = locData.locations?.[0]?.id;
        if (!locationId) throw new Error('No location found');
      } catch (err) {
        return Response.json({ error: `Failed to resolve Square location: ${err.message}` }, { status: 500 });
      }
    }

    // ── Load all awaiting Square orders ──────────────────────────
    let awaitingOrders = [];
    try {
      awaitingOrders = await base44.asServiceRole.entities.Order.filter({
        status: 'awaiting_payment',
        payment_method: 'square_payment',
      });
    } catch (err) {
      return Response.json({ error: `Failed to load orders: ${err.message}` }, { status: 500 });
    }

    if (awaitingOrders.length === 0) {
      return Response.json({ message: 'No awaiting Square orders', synced: 0, cancelled: 0 });
    }

    console.log(`Found ${awaitingOrders.length} awaiting Square orders`);

    // ── Load products once for stock decrement ───────────────────
    let products = [];
    try {
      products = await base44.asServiceRole.entities.Product.list();
    } catch (err) {
      console.warn('Failed to load products — stock decrement will be skipped:', err.message);
    }

    // ── Helper: decrement stock (idempotent per order) ───────────
    const decrementStock = async (items) => {
      if (!products.length || !items?.length) return;
      for (const item of items) {
        try {
          const product = products.find(p =>
            p.id === item.productId || p.id === item.product_id ||
            p.name === (item.productName || item.product_name)
          );
          if (!product) {
            console.warn(`Product not found for item: ${item.productName}`);
            continue;
          }
          const updatedSpecs = (product.specifications || []).map(spec => {
            if (spec.name === item.specification) {
              const newQty = Math.max(0, (spec.stock_quantity || 0) - (item.quantity || 1));
              return { ...spec, stock_quantity: newQty, in_stock: newQty > 0 };
            }
            return spec;
          });
          const allOut = updatedSpecs.length > 0 && updatedSpecs.every(s => !s.in_stock);
          await base44.asServiceRole.entities.Product.update(product.id, {
            specifications: updatedSpecs,
            in_stock: !allOut,
          });
        } catch (err) {
          console.warn(`Stock decrement failed for ${item.productName}:`, err.message);
        }
      }
    };

    // ── Helper: look up a Square order by its ID directly ────────
    const lookupSquareOrderById = async (squareOrderId) => {
      if (!squareOrderId) return null;
      try {
        const res = await fetch(`https://connect.squareup.com/v2/orders/${squareOrderId}`, {
          headers: { 'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`, 'Square-Version': '2024-01-18' },
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.order || null;
      } catch {
        return null;
      }
    };

    // ── Helper: search Square orders by reference_id (fallback) ──
    const searchSquareByReference = async (orderNumber) => {
      if (!orderNumber) return null;
      try {
        const res = await fetch('https://connect.squareup.com/v2/orders/search', {
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
                date_time_filter: {
                  updated_at: {
                    start_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // last 30 days
                  },
                },
              },
            },
            limit: 100,
          }),
        });
        const data = await res.json();
        const orders = data.orders || [];
        return orders.find(sq =>
          sq.reference_id === orderNumber ||
          sq.id === orderNumber
        ) || null;
      } catch {
        return null;
      }
    };

    // ── Helper: check if order is stale ─────────────────────────
    const isStale = (order) => {
      if (!order.created_date) return false;
      const ageHours = (Date.now() - new Date(order.created_date).getTime()) / 3600000;
      return ageHours > STALE_ORDER_HOURS;
    };

    // ── Process each order ───────────────────────────────────────
    let synced = 0;
    let cancelled = 0;
    const results = [];

    for (const order of awaitingOrders) {
      try {
        // IDEMPOTENCY GUARD: skip if already completed (race condition safety)
        if (order.payment_status === 'completed') {
          console.log(`Order ${order.order_number} already completed — skipping`);
          results.push({ order_number: order.order_number, status: 'already_completed' });
          continue;
        }

        // ── STEP 1: Try direct lookup by square_order_id (most reliable) ──
        let squareOrder = await lookupSquareOrderById(order.square_order_id);

        // ── STEP 2: Fallback — try direct lookup by transaction_id ──
        if (!squareOrder || squareOrder.state !== 'COMPLETED') {
          squareOrder = await lookupSquareOrderById(order.transaction_id);
        }

        // ── STEP 3: Fallback — search by reference_id (order number) ──
        if (!squareOrder || squareOrder.state !== 'COMPLETED') {
          squareOrder = await searchSquareByReference(order.order_number);
        }

        if (squareOrder && squareOrder.state === 'COMPLETED') {
          // ── Payment confirmed — update order ──
          try {
            await base44.asServiceRole.entities.Order.update(order.id, {
              status: 'processing',
              payment_status: 'completed',
              square_order_id: squareOrder.id,
            });
          } catch (dbErr) {
            console.error(`Failed to update order ${order.order_number}:`, dbErr.message);
            results.push({ order_number: order.order_number, status: 'db_error', error: dbErr.message });
            continue;
          }

          // ── Decrement stock (idempotent — only if not already completed) ──
          if (order.items?.length > 0) {
            await decrementStock(order.items);
          }

          // ── Customer confirmation email ──
          try {
            if (order.customer_email) {
              await base44.asServiceRole.integrations.Core.SendEmail({
                to: order.customer_email,
                from_name: 'Red Helix Research',
                subject: `✅ Payment Confirmed — Order #${order.order_number}`,
                body: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:30px;background:#fff;">
                  <h2 style="color:#16a34a;">Payment Confirmed!</h2>
                  <p>Hi ${order.customer_name || 'there'},</p>
                  <p>Your payment for order <strong>#${order.order_number}</strong> ($${Number(order.total_amount).toFixed(2)}) has been confirmed. We're processing your order now and will send a shipping notification once it ships.</p>
                  <p style="color:#64748b;font-size:12px;">Questions? Email <a href="mailto:jake@redhelixresearch.com" style="color:#dc2626;">jake@redhelixresearch.com</a></p>
                </div>`,
              });
            }
          } catch (emailErr) {
            console.warn('Customer email failed (non-blocking):', emailErr.message);
          }

          // ── Admin notification ──
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: 'jake@redhelixresearch.com',
              from_name: 'Red Helix Research Orders',
              subject: `✅ Payment Synced — Order #${order.order_number} — $${Number(order.total_amount).toFixed(2)}`,
              body: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:30px;background:#fff;">
                <h2 style="color:#16a34a;">✅ Card Payment Synced</h2>
                <p>Square confirmed payment for <strong>#${order.order_number}</strong> via auto-sync.</p>
                <p><strong>Customer:</strong> ${order.customer_name}</p>
                <p><strong>Email:</strong> ${order.customer_email}</p>
                <p><strong>Total:</strong> $${Number(order.total_amount).toFixed(2)}</p>
                <p><strong>Square Order ID:</strong> ${squareOrder.id}</p>
                <p><a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;font-weight:700;">View in Admin →</a></p>
              </div>`,
            });
          } catch {}

          synced++;
          results.push({ order_number: order.order_number, status: 'synced', square_order_id: squareOrder.id });
          console.log(`Synced order ${order.order_number}`);

        } else if (isStale(order)) {
          // ── Order is old and unpaid — cancel it ──
          try {
            await base44.asServiceRole.entities.Order.update(order.id, {
              status: 'cancelled',
              payment_status: 'abandoned',
              admin_notes: `${order.admin_notes ? order.admin_notes + ' | ' : ''}Auto-cancelled: no Square payment found after ${STALE_ORDER_HOURS}h`,
            });
          } catch (dbErr) {
            console.warn(`Failed to cancel stale order ${order.order_number}:`, dbErr.message);
            results.push({ order_number: order.order_number, status: 'cancel_db_error', error: dbErr.message });
            continue;
          }

          // ── Admin notification for cancellation ──
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: 'jake@redhelixresearch.com',
              from_name: 'Red Helix Research Orders',
              subject: `🚫 Stale Order Cancelled — #${order.order_number} — $${Number(order.total_amount).toFixed(2)}`,
              body: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:30px;background:#fff;">
                <h2 style="color:#dc2626;">Stale Order Auto-Cancelled</h2>
                <p>Order <strong>#${order.order_number}</strong> had no Square payment after ${STALE_ORDER_HOURS} hours and was automatically cancelled.</p>
                <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
                <p><strong>Total:</strong> $${Number(order.total_amount).toFixed(2)}</p>
                <p>If payment was actually received, please manually update the order status in Admin.</p>
                <p><a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;font-weight:700;">View in Admin →</a></p>
              </div>`,
            });
          } catch {}

          cancelled++;
          results.push({ order_number: order.order_number, status: 'cancelled_stale' });
          console.log(`Cancelled stale order ${order.order_number}`);

        } else {
          results.push({ order_number: order.order_number, status: 'pending_payment' });
        }
      } catch (err) {
        console.warn(`Error processing order ${order.order_number}:`, err.message);
        results.push({ order_number: order.order_number, status: 'error', error: err.message });
      }
    }

    console.log(`Sync complete: ${synced} synced, ${cancelled} cancelled, ${awaitingOrders.length} total checked`);
    return Response.json({
      synced,
      cancelled,
      total_checked: awaitingOrders.length,
      results,
    });

  } catch (error) {
    console.error('syncSquarePayments fatal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});