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
const STALE_ORDER_HOURS = 168; // Cancel awaiting_payment orders older than 7 days (was 72h — increased to prevent false cancellations)

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

    // Route stock changes through the canonical decrementStock function. Two
    // paths writing the specifications array let concurrent admin price edits
    // get clobbered (read-modify-write race), and the inline copy had drifted
    // from the canonical pre-flight check.
    const decrementStock = async (items, orderNumber) => {
      if (!items?.length) return { ok: true };
      try {
        const res = await base44.asServiceRole.functions.invoke('decrementStock', {
          action: 'decrement',
          items,
          orderNumber,
        });
        const data = res?.data || res;
        if (data && data.success === false) {
          return { ok: false, reason: data.error || 'decrement failed', outOfStock: data.outOfStock || [] };
        }
        return { ok: true, skipped: data?.skipped || [], errors: data?.errors || [] };
      } catch (err) {
        console.warn(`Stock decrement failed for order ${orderNumber}:`, err.message);
        return { ok: false, reason: err.message };
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

    // ── Helper: search Square orders by reference_id or amount (fallback) ──
    const searchSquareByReference = async (orderNumber, amountCents = null) => {
      if (!orderNumber && !amountCents) return null;
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
                    start_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                  },
                },
              },
            },
            limit: 200,
          }),
        });
        const data = await res.json();
        const orders = data.orders || [];

        // 1. Match by reference_id (our order number set at Square order creation)
        const byRef = orders.find(sq => sq.reference_id === orderNumber || sq.id === orderNumber);
        if (byRef) return byRef;

        // 2. Amount-based fuzzy match — find COMPLETED Square order with exact same total
        // Only use this if we have an amount and it's unique among recent orders
        if (amountCents) {
          const amountMatches = orders.filter(sq => {
            const sqTotal = sq.total_money?.amount;
            return sqTotal === amountCents;
          });
          if (amountMatches.length === 1) {
            console.log(`Amount-matched Square order ${amountMatches[0].id} for order ${orderNumber} ($${(amountCents/100).toFixed(2)})`);
            return amountMatches[0];
          }
        }

        return null;
      } catch {
        return null;
      }
    };

    // ── Helper: search Square Payments API by email or amount ───
    const searchSquarePaymentsByEmailOrAmount = async (customerEmail, amountCents) => {
      try {
        // Search recent payments (last 30 days)
        const beginTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const res = await fetch('https://connect.squareup.com/v2/payments?limit=100&begin_time=' + encodeURIComponent(beginTime), {
          headers: {
            'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
            'Square-Version': '2024-01-18',
          },
        });
        if (!res.ok) return null;
        const data = await res.json();
        const payments = data.payments || [];

        // Filter to COMPLETED payments only
        const completed = payments.filter(p => p.status === 'COMPLETED');

        // 1. Match by customer email
        if (customerEmail) {
          const byEmail = completed.find(p =>
            p.buyer_email_address?.toLowerCase() === customerEmail.toLowerCase() &&
            p.amount_money?.amount === amountCents
          );
          if (byEmail) {
            console.log(`Payment API email+amount match for ${customerEmail}: payment ${byEmail.id}`);
            return byEmail;
          }
          // Looser: just email match (in case amount differs slightly due to rounding)
          const byEmailOnly = completed.filter(p =>
            p.buyer_email_address?.toLowerCase() === customerEmail.toLowerCase()
          );
          if (byEmailOnly.length === 1) {
            console.log(`Payment API email-only match for ${customerEmail}: payment ${byEmailOnly[0].id}`);
            return byEmailOnly[0];
          }
        }

        // 2. Match by exact amount (only if unique)
        if (amountCents) {
          const byAmount = completed.filter(p => p.amount_money?.amount === amountCents);
          if (byAmount.length === 1) {
            console.log(`Payment API amount-only match ($${(amountCents/100).toFixed(2)}): payment ${byAmount[0].id}`);
            return byAmount[0];
          }
        }

        return null;
      } catch (err) {
        console.warn('Payment API search failed:', err.message);
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

        // ── STEP 3: Fallback — search by reference_id or amount ──
        const amountCents = order.total_amount ? Math.round(order.total_amount * 100) : null;
        if (!squareOrder || squareOrder.state !== 'COMPLETED') {
          squareOrder = await searchSquareByReference(order.order_number, amountCents);
        }

        // ── STEP 4: Fallback — search Payments API by customer email/amount ──
        let matchedPayment = null;
        if (!squareOrder || squareOrder.state !== 'COMPLETED') {
          matchedPayment = await searchSquarePaymentsByEmailOrAmount(order.customer_email, amountCents);
        }

        const isCompleted = (squareOrder && squareOrder.state === 'COMPLETED') || matchedPayment;

        if (isCompleted) {
          const squareIdToStore = squareOrder?.state === 'COMPLETED'
            ? squareOrder.id
            : (matchedPayment?.order_id || matchedPayment?.id || order.square_order_id);
          // ── Payment confirmed — update order ──
          try {
            await base44.asServiceRole.entities.Order.update(order.id, {
              status: 'processing',
              payment_status: 'completed',
              square_order_id: squareIdToStore,
              stock_reserved: false,
              reserved_until: null,
            });
          } catch (dbErr) {
            console.error(`Failed to update order ${order.order_number}:`, dbErr.message);
            results.push({ order_number: order.order_number, status: 'db_error', error: dbErr.message });
            continue;
          }

          // ── Decrement stock only if not already reserved at checkout ──
          // Payment is already confirmed; if decrement fails we can't reverse
          // the completion, but we MUST annotate the order so admin knows to
          // fulfill manually or refund.
          if (order.items?.length > 0 && !order.stock_reserved) {
            const stockResult = await decrementStock(order.items, order.order_number);
            if (!stockResult.ok || (stockResult.errors && stockResult.errors.length > 0)) {
              const reason = stockResult.reason || (stockResult.errors || []).join('; ');
              const oos = stockResult.outOfStock ? ` Out of stock: ${stockResult.outOfStock.join(', ')}.` : '';
              try {
                await base44.asServiceRole.entities.Order.update(order.id, {
                  admin_notes: `${order.admin_notes ? order.admin_notes + ' | ' : ''}STOCK SYNC FAILED at ${new Date().toISOString()}: ${reason}.${oos} Admin must manually fulfill or refund.`,
                });
              } catch (noteErr) {
                console.error(`Failed to annotate stock failure on order ${order.order_number}:`, noteErr.message);
              }
              try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                  to: 'jake@redhelixresearch.com',
                  from_name: 'Red Helix Research Orders',
                  subject: `⚠ Stock decrement FAILED — Order #${order.order_number} — paid but inventory not updated`,
                  body: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:30px;background:#fff;"><h2 style="color:#d97706;">Stock Sync Failed</h2><p>Order <strong>#${order.order_number}</strong> was paid via Square but stock could not be decremented:</p><pre style="background:#f8fafc;padding:10px;border-radius:6px;">${reason}${oos}</pre><p>Admin must fulfill manually or refund. <a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;">View order</a></p></div>`,
                });
              } catch {}
            }
          } else {
            console.log(`Order ${order.order_number} already had stock reserved at checkout — skipping decrement`);
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
                <p><strong>Square Order ID:</strong> ${squareIdToStore}</p>
                <p><strong>Match method:</strong> ${squareOrder?.state === 'COMPLETED' ? 'Order lookup' : 'Payments API'}</p>
                <p><a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;font-weight:700;">View in Admin →</a></p>
              </div>`,
            });
          } catch {}

          synced++;
          results.push({ order_number: order.order_number, status: 'synced', square_order_id: squareIdToStore, match_method: squareOrder?.state === 'COMPLETED' ? 'order_lookup' : 'payments_api' });
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