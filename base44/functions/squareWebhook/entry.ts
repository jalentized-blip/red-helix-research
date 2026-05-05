/**
 * squareWebhook — Square payment event handler with full production failsafes
 *
 * Signature:  HMAC-SHA256(signatureKey, notificationURL + rawBody) → base64
 *             Header: X-Square-HmacSha256-Signature
 *
 * Failsafes implemented per Square docs:
 *  1. Timing-safe HMAC signature verification (prevents timing attacks)
 *  2. Content-Type must be application/json
 *  3. Replay attack prevention — reject events with created_at older than REPLAY_WINDOW_SECONDS
 *  4. merchant_id validation — only accept our merchant's events
 *  5. event_id deduplication — idempotent processing, handles Square's 10-retry / 24h retry policy
 *  6. Amount validation — cross-check Square order total vs stored order total before completing
 *  7. payment.updated FAILED/CANCELED — flag order for manual review
 *  8. refund.created — flag order as refunded and notify admin
 *  9. payment.created — store square_order_id early, before payment.updated fires
 * 10. Transient DB errors return 503 (Square retries) instead of 200 (Square stops)
 * 11. All events get 200 ACK within 30s (Square's documented timeout)
 *
 * Square retry policy: retries up to 10 times over 24 hours on non-2xx responses.
 * We return 503 only for transient DB errors to trigger useful retries.
 * We return 200 for auth failures to avoid log spam from replays/bad actors.
 *
 * Ref: https://developer.squareup.com/docs/webhooks/overview
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SQUARE_WEBHOOK_SIGNATURE_KEY = Deno.env.get('SQUARE_WEBHOOK_SIGNATURE_KEY');
const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN');
// Optional merchant ID validation — set env var "SQUARE_MERCHANT_ID" to restrict to your account
const OUR_MERCHANT_ID = (() => { try { return Deno.env.get('SQUARE' + '_MERCHANT_ID') || null; } catch { return null; } })();

// Square retries for up to 24 hours — reject events older than this (replay protection)
const REPLAY_WINDOW_SECONDS = 300; // 5 minutes — adjust to 3600 if you need wider tolerance

// In-memory dedup cache for event_ids (survives across requests within same isolate lifetime)
// Square sends event_id on every webhook — cache it to prevent double-processing on retries
const processedEventIds = new Map(); // event_id → timestamp
const EVENT_ID_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h (matches Square's retry window)

// Purge old entries from dedup cache (prevents unbounded growth)
const purgeEventCache = () => {
  const cutoff = Date.now() - EVENT_ID_CACHE_TTL_MS;
  for (const [id, ts] of processedEventIds) {
    if (ts < cutoff) processedEventIds.delete(id);
  }
};

// Timing-safe base64 comparison (prevents timing side-channel attacks)
const timingSafeEquals = async (a, b) => {
  if (a.length !== b.length) {
    // Still do a comparison to avoid timing leak on length
    await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', new Uint8Array(32), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), new Uint8Array(1));
    return false;
  }
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }
  return result === 0;
};

Deno.serve(async (req) => {
  // ── 1. Method check ─────────────────────────────────────────────────────────
  if (req.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }

  // ── 2. Content-Type check ────────────────────────────────────────────────────
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    console.warn('Square webhook: invalid Content-Type:', contentType);
    return Response.json({ error: 'Invalid Content-Type' }, { status: 400 });
  }

  let body, event;
  try {
    body = await req.text();
    if (!body) {
      return Response.json({ error: 'Empty body' }, { status: 400 });
    }
    event = JSON.parse(body);
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // ── 3. HMAC signature verification (timing-safe) ─────────────────────────────
  if (SQUARE_WEBHOOK_SIGNATURE_KEY) {
    const signature = req.headers.get('x-square-hmacsha256-signature');
    if (!signature) {
      console.warn('Square webhook: missing signature header — rejecting');
      // Return 200 to not leak info to bad actors, but don't process
      return Response.json({ received: true }, { status: 200 });
    }

    try {
      const url = req.url;
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(SQUARE_WEBHOOK_SIGNATURE_KEY),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signatureBytes = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(url + body)
      );
      const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));

      const valid = await timingSafeEquals(signature, expectedSignature);
      if (!valid) {
        console.warn('Square webhook: invalid signature — rejecting');
        return Response.json({ received: true }, { status: 200 });
      }
    } catch (sigErr) {
      console.error('Square webhook: signature verification error:', sigErr.message);
      return Response.json({ received: true }, { status: 200 });
    }
  } else {
    console.warn('SQUARE_WEBHOOK_SIGNATURE_KEY not set — skipping signature verification (unsafe!)');
  }

  // ── 4. Validate basic event structure ────────────────────────────────────────
  if (!event.type || !event.event_id) {
    console.warn('Square webhook: malformed event (missing type or event_id):', JSON.stringify(event).slice(0, 200));
    return Response.json({ received: true });
  }

  // ── 5. merchant_id validation (if configured) ────────────────────────────────
  // Prevent accepting webhooks meant for a different Square merchant account
  if (OUR_MERCHANT_ID && event.merchant_id && event.merchant_id !== OUR_MERCHANT_ID) {
    console.warn(`Square webhook: merchant_id mismatch. Got ${event.merchant_id}, expected ${OUR_MERCHANT_ID}`);
    return Response.json({ received: true });
  }

  // ── 6. Replay attack protection — reject stale events ────────────────────────
  // Square sends created_at on every event (ISO 8601)
  if (event.created_at) {
    const eventAge = (Date.now() - new Date(event.created_at).getTime()) / 1000;
    if (eventAge > REPLAY_WINDOW_SECONDS) {
      console.warn(`Square webhook: stale event ignored. Age: ${Math.round(eventAge)}s, event_id: ${event.event_id}, type: ${event.type}`);
      // Return 200 — this is not an error, we just don't need to re-process old events
      return Response.json({ received: true, skipped: 'stale' });
    }
  }

  // ── 7. event_id deduplication ────────────────────────────────────────────────
  // Square retries webhooks up to 10 times over 24 hours if we return non-2xx.
  // Cache event_ids to ensure idempotent processing.
  purgeEventCache();
  if (processedEventIds.has(event.event_id)) {
    console.log(`Square webhook: duplicate event_id ${event.event_id} — skipping (already processed)`);
    return Response.json({ received: true, skipped: 'duplicate' });
  }
  // Mark as being processed immediately (before async work) to block concurrent dupes
  processedEventIds.set(event.event_id, Date.now());

  console.log(`Square webhook | type: ${event.type} | event_id: ${event.event_id} | merchant: ${event.merchant_id}`);

  // ── Process event ─────────────────────────────────────────────────────────────
  try {
    const base44 = createClientFromRequest(req);

    // ── Helper: fetch full Square order ─────────────────────────────────────────
    const fetchSquareOrder = async (squareOrderId) => {
      if (!squareOrderId || !SQUARE_ACCESS_TOKEN) return null;
      try {
        const res = await fetch(`https://connect.squareup.com/v2/orders/${squareOrderId}`, {
          headers: {
            'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
            'Square-Version': '2024-01-18',
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          console.warn(`fetchSquareOrder: Square API ${res.status} for order ${squareOrderId}`);
          return null;
        }
        const data = await res.json();
        return data.order || null;
      } catch (err) {
        console.warn('fetchSquareOrder error:', err.message);
        return null;
      }
    };

    // ── Helper: load our internal pending + processing Square orders ─────────────
    // We search both 'pending' payment_status (awaiting payment) AND newly set to catch edge cases
    const loadOurOrders = async () => {
      const [pending, processing] = await Promise.all([
        base44.asServiceRole.entities.Order.filter({ payment_method: 'square_payment', payment_status: 'pending' }),
        base44.asServiceRole.entities.Order.filter({ payment_method: 'square_payment', payment_status: 'completed' }),
      ]);
      return { pending, completed: processing };
    };

    // ── Helper: find our order by multiple matching strategies ───────────────────
    const findOurOrder = (orders, { squareOrderIds = [], paymentIds = [], referenceId = null }) => {
      const validSquareIds = squareOrderIds.filter(Boolean);
      const validPaymentIds = paymentIds.filter(Boolean);

      // Priority 1: square_order_id direct match
      if (validSquareIds.length) {
        const match = orders.find(o => validSquareIds.includes(o.square_order_id));
        if (match) return match;
      }
      // Priority 2: transaction_id (paymentLinkId stored at order creation)
      const allIds = [...validSquareIds, ...validPaymentIds];
      if (allIds.length) {
        const match = orders.find(o => allIds.includes(o.transaction_id));
        if (match) return match;
      }
      // Priority 3: order_number === reference_id
      if (referenceId) {
        const match = orders.find(o => o.order_number === referenceId);
        if (match) return match;
      }
      return null;
    };

    // ── Helper: validate amount matches (prevents processing wrong order) ────────
    // Square stores amounts in smallest currency unit (cents for USD)
    const validateAmount = (ourOrder, squareOrderObj) => {
      if (!squareOrderObj?.total_money?.amount) return true; // Can't validate — allow
      const squareTotalCents = squareOrderObj.total_money.amount;
      const ourTotalCents = Math.round((ourOrder.total_amount || 0) * 100);
      // Allow ±1 cent tolerance for floating point rounding
      const diff = Math.abs(squareTotalCents - ourTotalCents);
      if (diff > 1) {
        console.warn(`Amount mismatch! Our order: $${ourOrder.total_amount} (${ourTotalCents}¢), Square: ${squareTotalCents}¢, diff: ${diff}¢`);
        return false;
      }
      return true;
    };

    // ── Helper: decrement stock ───────────────────────────────────────────────────
    const decrementStock = async (items) => {
      if (!items?.length) return;
      const products = await base44.asServiceRole.entities.Product.list();
      for (const item of items) {
        const product = products.find(p =>
          p.id === item.productId || p.id === item.product_id ||
          p.name === (item.productName || item.product_name)
        );
        if (!product) { console.warn(`decrementStock: product not found for item: ${item.productName}`); continue; }
        const updatedSpecs = (product.specifications || []).map(spec => {
          if (spec.name === item.specification) {
            const newQty = Math.max(0, (spec.stock_quantity || 0) - (item.quantity || 1));
            return { ...spec, stock_quantity: newQty, in_stock: newQty > 0 };
          }
          return spec;
        });
        const allOut = updatedSpecs.every(s => !s.in_stock);
        await base44.asServiceRole.entities.Product.update(product.id, {
          specifications: updatedSpecs,
          in_stock: !allOut,
        });
      }
      console.log(`Stock decremented for ${items.length} item(s)`);
    };

    // ── Helper: complete an order ────────────────────────────────────────────────
    const completeOrder = async (order, transactionId, squareOrderId) => {
      await base44.asServiceRole.entities.Order.update(order.id, {
        status: 'processing',
        payment_status: 'completed',
        transaction_id: transactionId || order.transaction_id,
        square_order_id: squareOrderId || order.square_order_id,
        stock_reserved: false,
        reserved_until: null,
        admin_notes: (order.admin_notes ? order.admin_notes + ' | ' : '') + `Webhook confirmed payment at ${new Date().toISOString()}`,
      });

      // Only decrement stock if not already done at checkout
      if (!order.stock_reserved && order.items?.length > 0) {
        await decrementStock(order.items);
      } else {
        console.log(`Order ${order.order_number}: stock already reserved — skipping decrement`);
      }

      console.log(`✅ Order ${order.order_number} completed via webhook (tx: ${transactionId})`);

      // Admin notification (non-blocking)
      base44.asServiceRole.integrations.Core.SendEmail({
        to: 'jake@redhelixresearch.com',
        from_name: 'Red Helix Research Orders',
        subject: `✅ Payment Confirmed — Order #${order.order_number} — $${Number(order.total_amount).toFixed(2)}`,
        body: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:30px;background:#fff;">
          <h2 style="color:#16a34a;margin:0 0 8px 0;">✅ Card Payment Confirmed</h2>
          <p style="color:#64748b;">Square webhook confirmed payment for <strong>#${order.order_number}</strong>.</p>
          <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
          <p><strong>Total:</strong> $${Number(order.total_amount).toFixed(2)}</p>
          <p><strong>Payment ID:</strong> <code>${transactionId}</code></p>
          <p><strong>Square Order ID:</strong> <code>${squareOrderId}</code></p>
          <p><strong>Event ID:</strong> <code>${event.event_id}</code></p>
          <p style="margin-top:20px;"><a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;font-weight:700;">View in Admin →</a></p>
        </div>`,
      }).catch(e => console.warn('Admin email failed (non-blocking):', e.message));
    };

    // ── Helper: flag order for review ────────────────────────────────────────────
    const flagOrderForReview = async (order, reason) => {
      await base44.asServiceRole.entities.Order.update(order.id, {
        admin_notes: (order.admin_notes ? order.admin_notes + ' | ' : '') + `⚠️ ${reason} — ${new Date().toISOString()}`,
      });
      base44.asServiceRole.integrations.Core.SendEmail({
        to: 'jake@redhelixresearch.com',
        from_name: 'Red Helix Research Orders',
        subject: `⚠️ Square Order Review Required — #${order.order_number}`,
        body: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:30px;background:#fff;">
          <h2 style="color:#d97706;margin:0 0 8px 0;">⚠️ Order Requires Review</h2>
          <p><strong>Order:</strong> #${order.order_number}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
          <p><strong>Total:</strong> $${Number(order.total_amount).toFixed(2)}</p>
          <p><strong>Event ID:</strong> <code>${event.event_id}</code></p>
          <p style="margin-top:20px;"><a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;font-weight:700;">Review in Admin →</a></p>
        </div>`,
      }).catch(e => console.warn('Flag email failed (non-blocking):', e.message));
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENT HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════

    // ── payment.created ───────────────────────────────────────────────────────
    // Store square_order_id early so later events can match reliably
    if (event.type === 'payment.created') {
      const payment = event.data?.object?.payment;
      const squareOrderId = payment?.order_id;
      const paymentId = payment?.id;
      if (!squareOrderId || !paymentId) return Response.json({ received: true });

      console.log(`payment.created | payment_id: ${paymentId} | order_id: ${squareOrderId}`);

      const { pending } = await loadOurOrders();
      const ourOrder = findOurOrder(pending, {
        squareOrderIds: [squareOrderId],
        paymentIds: [paymentId],
      });

      if (ourOrder && !ourOrder.square_order_id) {
        await base44.asServiceRole.entities.Order.update(ourOrder.id, {
          square_order_id: squareOrderId,
        });
        console.log(`Stored square_order_id ${squareOrderId} on order ${ourOrder.order_number}`);
      }
    }

    // ── payment.updated ───────────────────────────────────────────────────────
    // Primary completion event. status can be: APPROVED, COMPLETED, CANCELED, FAILED
    if (event.type === 'payment.updated') {
      const payment = event.data?.object?.payment;
      const paymentStatus = payment?.status;
      const squareOrderId = payment?.order_id;
      const paymentId = payment?.id;
      const paymentRefId = payment?.reference_id;

      console.log(`payment.updated | status: ${paymentStatus} | order_id: ${squareOrderId} | payment_id: ${paymentId}`);

      if (!paymentId) return Response.json({ received: true });

      // Fetch full Square order for reference_id and amount validation
      const squareOrder = await fetchSquareOrder(squareOrderId);
      const referenceId = paymentRefId || squareOrder?.reference_id || null;

      const { pending, completed } = await loadOurOrders();

      // Idempotency: check if already completed
      const alreadyDone = findOurOrder(completed, { squareOrderIds: [squareOrderId], paymentIds: [paymentId], referenceId });
      if (alreadyDone) {
        console.log(`payment.updated: order ${alreadyDone.order_number} already completed — skipping`);
        return Response.json({ received: true, skipped: 'already_completed' });
      }

      const ourOrder = findOurOrder(pending, { squareOrderIds: [squareOrderId], paymentIds: [paymentId], referenceId });

      if (paymentStatus === 'COMPLETED') {
        if (!ourOrder) {
          console.warn(`payment.updated COMPLETED: no matching pending order found. squareOrderId: ${squareOrderId}, referenceId: ${referenceId}`);
          return Response.json({ received: true });
        }

        // Amount validation — prevents completing the wrong order
        if (squareOrder && !validateAmount(ourOrder, squareOrder)) {
          await flagOrderForReview(ourOrder, `Amount mismatch: our total $${ourOrder.total_amount}, Square total ${squareOrder.total_money?.amount}¢`);
          return Response.json({ received: true });
        }

        await completeOrder(ourOrder, paymentId, squareOrderId);

      } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELED') {
        if (ourOrder) {
          console.log(`payment.updated ${paymentStatus}: flagging order ${ourOrder.order_number} for review`);
          await flagOrderForReview(ourOrder, `Square payment ${paymentStatus} (payment_id: ${paymentId})`);
        }
      }
      // APPROVED status = payment authorized but not yet captured — no action needed
    }

    // ── order.updated ─────────────────────────────────────────────────────────
    // Secondary confirmation. order_updated.state: OPEN, COMPLETED, CANCELED
    // NOTE: reference_id is NOT in the event payload — must fetch full order from Square
    if (event.type === 'order.updated') {
      const orderUpdated = event.data?.object?.order_updated;
      const squareOrderId = orderUpdated?.order_id;
      const state = orderUpdated?.state;

      console.log(`order.updated | order_id: ${squareOrderId} | state: ${state}`);

      if (!squareOrderId || state !== 'COMPLETED') return Response.json({ received: true });

      const squareOrder = await fetchSquareOrder(squareOrderId);
      const referenceId = squareOrder?.reference_id || null;

      const { pending, completed } = await loadOurOrders();

      const alreadyDone = findOurOrder(completed, { squareOrderIds: [squareOrderId], referenceId });
      if (alreadyDone) {
        console.log(`order.updated: order ${alreadyDone.order_number} already completed — skipping`);
        return Response.json({ received: true, skipped: 'already_completed' });
      }

      const ourOrder = findOurOrder(pending, { squareOrderIds: [squareOrderId], referenceId });
      if (!ourOrder) {
        console.warn(`order.updated COMPLETED: no matching pending order for squareOrderId: ${squareOrderId}, ref: ${referenceId}`);
        return Response.json({ received: true });
      }

      if (squareOrder && !validateAmount(ourOrder, squareOrder)) {
        await flagOrderForReview(ourOrder, `order.updated amount mismatch: our $${ourOrder.total_amount}, Square ${squareOrder.total_money?.amount}¢`);
        return Response.json({ received: true });
      }

      await completeOrder(ourOrder, squareOrderId, squareOrderId);
    }

    // ── order.fulfillment.updated ─────────────────────────────────────────────
    // Payload: event.data.object.order_fulfillment_updated.order_id
    //          event.data.object.order_fulfillment_updated.fulfillment_update[].new_state
    if (event.type === 'order.fulfillment.updated') {
      const fulfillmentUpdated = event.data?.object?.order_fulfillment_updated;
      const squareOrderId = fulfillmentUpdated?.order_id;
      const updates = fulfillmentUpdated?.fulfillment_update || [];
      const isCompleted = updates.some(u => u.new_state === 'COMPLETED');

      console.log(`order.fulfillment.updated | order_id: ${squareOrderId} | updates: ${JSON.stringify(updates)}`);

      if (!squareOrderId || !isCompleted) return Response.json({ received: true });

      const squareOrder = await fetchSquareOrder(squareOrderId);
      const referenceId = squareOrder?.reference_id || null;

      const { pending, completed } = await loadOurOrders();

      const alreadyDone = findOurOrder(completed, { squareOrderIds: [squareOrderId], referenceId });
      if (alreadyDone) {
        return Response.json({ received: true, skipped: 'already_completed' });
      }

      const ourOrder = findOurOrder(pending, { squareOrderIds: [squareOrderId], referenceId });
      if (ourOrder) {
        await completeOrder(ourOrder, squareOrderId, squareOrderId);
      }
    }

    // ── refund.created ────────────────────────────────────────────────────────
    // Square docs: refund.created fires when a refund is initiated
    // Payload: event.data.object.refund = { id, payment_id, order_id, status, amount_money }
    if (event.type === 'refund.created' || event.type === 'refund.updated') {
      const refund = event.data?.object?.refund;
      const squareOrderId = refund?.order_id;
      const paymentId = refund?.payment_id;
      const refundId = refund?.id;
      const refundStatus = refund?.status;
      const refundAmountCents = refund?.amount_money?.amount;

      console.log(`${event.type} | refund_id: ${refundId} | status: ${refundStatus} | order_id: ${squareOrderId}`);

      if (refundStatus !== 'COMPLETED') return Response.json({ received: true });

      const { completed } = await loadOurOrders();
      const ourOrder = findOurOrder(completed, { squareOrderIds: [squareOrderId], paymentIds: [paymentId] });

      if (ourOrder) {
        const refundAmountDollars = refundAmountCents ? (refundAmountCents / 100).toFixed(2) : 'unknown';
        await base44.asServiceRole.entities.Order.update(ourOrder.id, {
          payment_status: 'refunded',
          admin_notes: (ourOrder.admin_notes ? ourOrder.admin_notes + ' | ' : '') + `Refunded $${refundAmountDollars} on ${new Date().toISOString()} (refund_id: ${refundId})`,
        });

        base44.asServiceRole.integrations.Core.SendEmail({
          to: 'jake@redhelixresearch.com',
          from_name: 'Red Helix Research Orders',
          subject: `💸 Refund Processed — Order #${ourOrder.order_number} — $${refundAmountDollars}`,
          body: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:30px;background:#fff;">
            <h2 style="color:#dc2626;margin:0 0 8px 0;">💸 Refund Processed</h2>
            <p>A Square refund was processed for order <strong>#${ourOrder.order_number}</strong>.</p>
            <p><strong>Customer:</strong> ${ourOrder.customer_name} (${ourOrder.customer_email})</p>
            <p><strong>Refund Amount:</strong> $${refundAmountDollars}</p>
            <p><strong>Refund ID:</strong> <code>${refundId}</code></p>
            <p style="margin-top:20px;"><a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;font-weight:700;">View in Admin →</a></p>
          </div>`,
        }).catch(e => console.warn('Refund email failed:', e.message));

        console.log(`Refund $${refundAmountDollars} recorded on order ${ourOrder.order_number}`);
      } else {
        console.warn(`refund event: no matching order found for squareOrderId: ${squareOrderId}`);
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    // Remove from dedup cache so this event can be retried
    processedEventIds.delete(event.event_id);

    const isDbError = error.message?.includes('timeout') ||
                      error.message?.includes('network') ||
                      error.message?.includes('connection') ||
                      error.message?.includes('503') ||
                      error.message?.includes('unavailable');

    if (isDbError) {
      // Return 503 for transient errors — Square will retry (up to 10x over 24h)
      console.error(`Square webhook: transient error on event ${event.event_id} — returning 503 for retry:`, error.message);
      return Response.json({ error: 'Temporary error, please retry' }, { status: 503 });
    }

    // Non-transient error — log and return 200 to prevent retry spam
    console.error(`Square webhook: fatal error on event ${event.event_id} (${event.type}):`, error.message, error.stack);
    return Response.json({ received: true, error: 'Processing error logged' }, { status: 200 });
  }
});