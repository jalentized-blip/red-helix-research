/**
 * Checkout Failsafe Utilities
 * 
 * Ensures order data is NEVER lost, even if DB writes fail.
 * Every checkout flow should call these at key moments.
 */

import { base44 } from '@/api/base44Client';

const SNAPSHOT_KEY = 'rhr_checkout_snapshot';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

/**
 * Save checkout snapshot to localStorage immediately when checkout begins.
 * Also sends a backup email to admin with all order details.
 */
export const saveCheckoutSnapshot = async (snapshotData) => {
  // 1. Always save to localStorage first (instant, never fails)
  try {
    const snapshot = {
      ...snapshotData,
      saved_at: new Date().toISOString(),
      status: 'in_progress',
    };
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch (e) {
    console.warn('[FAILSAFE] localStorage snapshot failed:', e);
  }

  // 2. Send admin backup email via backend (non-blocking)
  try {
    await base44.functions.invoke('saveCheckoutSnapshot', snapshotData);
  } catch (e) {
    console.warn('[FAILSAFE] Admin snapshot email failed (non-critical):', e);
  }
};

/**
 * Mark snapshot as completed (order successfully in DB).
 * Call this AFTER a successful Order.create.
 */
export const markSnapshotComplete = (orderNumber) => {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (raw) {
      const snapshot = JSON.parse(raw);
      if (snapshot.orderNumber === orderNumber) {
        snapshot.status = 'completed';
        snapshot.completed_at = new Date().toISOString();
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
      }
    }
  } catch (e) {
    console.warn('[FAILSAFE] markSnapshotComplete failed:', e);
  }
};

/**
 * Clear completed snapshot from localStorage.
 * Call this after everything is done successfully.
 */
export const clearCheckoutSnapshot = () => {
  try {
    localStorage.removeItem(SNAPSHOT_KEY);
  } catch (e) {}
};

/**
 * Create an order with automatic retry on failure.
 * Checks for duplicate orders (same order_number) before creating.
 * Falls back to sending an emergency admin email with full order details
 * if all retries are exhausted.
 */
// Fire mark_promo_used with a small retry so a transient blip doesn't leave
// a single-use welcome code reusable. Server side is idempotent.
const markPromoUsedWithRetry = async (promoCode, orderNumber) => {
  if (!promoCode) return;
  const attempts = 3;
  for (let i = 1; i <= attempts; i++) {
    try {
      await base44.functions.invoke('validateOrder', {
        action: 'mark_promo_used',
        code: promoCode,
        orderNumber,
      });
      return;
    } catch (err) {
      if (i === attempts) {
        console.warn(`[FAILSAFE] mark_promo_used gave up after ${attempts} tries for ${promoCode}:`, err);
      } else {
        await new Promise(r => setTimeout(r, 500 * i));
      }
    }
  }
};

export const createOrderWithRetry = async (orderPayload) => {
  let lastError = null;

  // Deduplication check: if an order with this number already exists, don't create another
  try {
    const existing = await base44.entities.Order.filter({ order_number: orderPayload.order_number });
    if (existing && existing.length > 0) {
      console.log(`[FAILSAFE] Order ${orderPayload.order_number} already exists — skipping duplicate create.`);
      markSnapshotComplete(orderPayload.order_number);
      // Also mark promo used on the dedup path — if the first submit fired
      // this and the retry didn't, we'd leak a single-use code.
      markPromoUsedWithRetry(orderPayload.promo_code, orderPayload.order_number);
      return existing[0];
    }
  } catch (checkErr) {
    console.warn('[FAILSAFE] Duplicate check failed (proceeding with create):', checkErr);
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const order = await base44.entities.Order.create(orderPayload);
      markSnapshotComplete(orderPayload.order_number);
      markPromoUsedWithRetry(orderPayload.promo_code, orderPayload.order_number);
      return order;
    } catch (err) {
      lastError = err;
      console.error(`[FAILSAFE] Order.create attempt ${attempt}/${MAX_RETRIES} failed:`, err);
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
      }
    }
  }

  // All retries failed — send emergency admin email
  console.error('[FAILSAFE] All retries exhausted. Sending emergency admin email.');
  try {
    const itemsText = (orderPayload.items || [])
      .map(i => `${i.productName} (${i.specification || '—'}) x${i.quantity} = $${(i.price * i.quantity).toFixed(2)}`)
      .join(', ');

    const addr = orderPayload.shipping_address || {};
    const addrText = [addr.address, addr.city, addr.state, addr.zip].filter(Boolean).join(', ');

    await base44.integrations.Core.SendEmail({
      to: 'jake@redhelixresearch.com',
      from_name: 'Red Helix Research — EMERGENCY ORDER ALERT',
      subject: `🚨 EMERGENCY: Order DB Write Failed — ${orderPayload.order_number} — ${orderPayload.customer_name} — $${Number(orderPayload.total_amount).toFixed(2)}`,
      body: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#fff;">
  <div style="background:#fef2f2;border:2px solid #dc2626;border-radius:12px;padding:16px;margin-bottom:24px;">
    <h2 style="margin:0 0 4px;color:#dc2626;font-size:18px;">🚨 EMERGENCY: Order DB Write Failed</h2>
    <p style="margin:0;color:#7f1d1d;font-size:13px;">The customer completed payment but the order could not be saved to the database after ${MAX_RETRIES} attempts. <strong>You MUST manually create this order in the admin panel immediately.</strong></p>
    <p style="margin:8px 0 0;color:#7f1d1d;font-size:12px;">Error: ${lastError?.message || 'Unknown error'}</p>
  </div>

  <h3 style="color:#0f172a;">Full Order Details</h3>
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
    <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;width:35%;">Order #</td><td style="font-weight:900;color:#dc2626;">${orderPayload.order_number}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;">Customer</td><td style="font-weight:700;">${orderPayload.customer_name}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;">Email</td><td>${orderPayload.customer_email}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;">Phone</td><td>${orderPayload.customer_phone || 'N/A'}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;">Payment</td><td>${orderPayload.payment_method}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;">TX ID</td><td style="font-family:monospace;font-size:11px;">${orderPayload.transaction_id || 'N/A'}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;">Ship To</td><td>${addrText}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;">Items</td><td>${itemsText}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;">Total</td><td style="font-size:18px;font-weight:900;color:#dc2626;">$${Number(orderPayload.total_amount).toFixed(2)}</td></tr>
  </table>

  <p style="color:#dc2626;font-weight:700;font-size:13px;">Action required: Go to Admin Order Management and create this order manually.</p>
  <p><a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;font-weight:900;">Admin Order Management →</a></p>
</div>`,
    });
  } catch (emailErr) {
    console.error('[FAILSAFE] Emergency email also failed:', emailErr);
  }

  // Throw so the caller knows, but order data is now safe in admin email + localStorage
  throw lastError;
};