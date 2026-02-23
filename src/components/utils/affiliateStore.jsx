/**
 * Affiliate Data Store
 *
 * Affiliate definitions are stored in Base44 entities (site-wide, permanent).
 * Commission tracking and transaction history are derived from ACTUAL Order
 * records in Base44 — orders store affiliate_code, affiliate_email,
 * affiliate_name, and affiliate_commission fields.
 */

import { base44 as base44Client } from '@/api/base44Client';

// ─── CONSTANTS ───

const POINTS_REWARD_RATE = 0.015; // 1.5% of order total
const COMMISSION_RATE = 0.10;     // 10% of order total

// ─── FETCH LIVE STATS FROM ORDER RECORDS ───

/**
 * Scan all Order records in Base44 and compute affiliate stats
 * (commission, orders, revenue, points) from orders that have affiliate_code set.
 */
async function computeAffiliateStats() {
  try {
    const orders = await base44Client.entities.Order.list('-created_date');
    const statsByCode = {};

    for (const order of (orders || [])) {
      const code = order.affiliate_code;
      if (!code) continue;
      // Skip cancelled orders
      if (order.status === 'cancelled') continue;

      const upperCode = code.toUpperCase();
      if (!statsByCode[upperCode]) {
        statsByCode[upperCode] = {
          total_orders: 0,
          total_revenue: 0,
          total_commission: 0,
          total_points: 0,
        };
      }

      const total = order.total_amount || 0;
      statsByCode[upperCode].total_orders += 1;
      statsByCode[upperCode].total_revenue += total;
      statsByCode[upperCode].total_commission += order.affiliate_commission || parseFloat((total * COMMISSION_RATE).toFixed(2));
      statsByCode[upperCode].total_points += parseFloat((total * POINTS_REWARD_RATE).toFixed(2));
    }

    return statsByCode;
  } catch (err) {
    console.warn('[AffiliateStore] Failed to compute stats from orders:', err);
    return {};
  }
}

/**
 * Build transactions list from Order records that have affiliate_code set.
 */
async function buildTransactionsFromOrders() {
  try {
    const orders = await base44Client.entities.Order.list('-created_date');
    const transactions = [];

    for (const order of (orders || [])) {
      if (!order.affiliate_code) continue;

      const total = order.total_amount || 0;
      transactions.push({
        id: `tx_${order.id}`,
        affiliate_email: order.affiliate_email || '',
        affiliate_name: order.affiliate_name || '',
        affiliate_code: order.affiliate_code,
        order_number: order.order_number || '',
        order_total: total,
        commission_amount: order.affiliate_commission || parseFloat((total * COMMISSION_RATE).toFixed(2)),
        points_earned: parseFloat((total * POINTS_REWARD_RATE).toFixed(2)),
        customer_email: order.customer_email || '',
        status: order.status === 'cancelled' ? 'cancelled' : 'pending',
        created_date: order.created_date,
      });
    }

    return transactions;
  } catch (err) {
    console.warn('[AffiliateStore] Failed to build transactions from orders:', err);
    return [];
  }
}

// ─── AFFILIATE CODE OPERATIONS ───

export async function listAffiliates() {
  try {
    // Fetch all affiliates from Base44 entities (site-wide, permanent)
    const affiliates = await base44Client.entities.Affiliate.list();

    // Merge live stats from actual Order records
    const stats = await computeAffiliateStats();

    return (affiliates || []).map(aff => {
      const liveStats = stats[aff.code?.toUpperCase()];
      if (liveStats) {
        return {
          ...aff,
          total_orders: liveStats.total_orders,
          total_revenue: liveStats.total_revenue,
          total_commission: liveStats.total_commission,
          total_points: liveStats.total_points,
        };
      }
      return aff;
    });
  } catch (err) {
    console.error('[AffiliateStore] Failed to list affiliates:', err);
    return [];
  }
}

export async function createAffiliate(base44, data) {
  try {
    // Create in Base44 entities (permanent, site-wide)
    const newAffiliate = await base44Client.entities.Affiliate.create({
      affiliate_name: data.affiliate_name,
      affiliate_email: data.affiliate_email,
      code: data.code,
      discount_percent: data.discount_percent || 15,
      is_active: data.is_active !== false,
      notes: data.notes || '',
      total_points: 0,
      total_commission: 0,
      total_orders: 0,
      total_revenue: 0,
    });

    return newAffiliate;
  } catch (err) {
    console.error('[AffiliateStore] Failed to create affiliate:', err);
    throw err;
  }
}

export async function updateAffiliate(base44, id, data) {
  try {
    // Update in Base44 entities (permanent, site-wide)
    await base44Client.entities.Affiliate.update(id, data);
    return { id, ...data };
  } catch (err) {
    console.error('[AffiliateStore] Failed to update affiliate:', err);
    throw err;
  }
}

export async function deleteAffiliate(base44, id) {
  try {
    // Delete from Base44 entities (permanent, site-wide)
    await base44Client.entities.Affiliate.delete(id);
  } catch (err) {
    console.error('[AffiliateStore] Failed to delete affiliate:', err);
    throw err;
  }
}

// ─── TRANSACTION OPERATIONS (derived from Orders) ───

export async function listTransactions() {
  return await buildTransactionsFromOrders();
}

export async function createTransaction(base44, data) {
  // No-op — transactions are now derived from Order records.
  // The Order.create() call in checkout already stores affiliate_code/commission.
  return {
    ...data,
    id: generateId(),
    created_date: new Date().toISOString(),
  };
}

export async function updateTransaction(base44, id, data) {
  // No-op — transaction status is derived from order status
  return { id, ...data };
}

// ─── SUBSCRIBE ───

export function subscribeAffiliates(base44, callback) {
  // Subscribe to Affiliate entity changes
  try {
    return base44Client.entities.Affiliate.subscribe(async () => {
      try {
        const affiliates = await listAffiliates();
        callback(affiliates || []);
      } catch (err) {
        console.warn('[AffiliateStore] Subscribe refresh failed:', err);
      }
    });
  } catch (err) {
    console.warn('[AffiliateStore] Subscribe affiliates failed:', err);
    return () => {};
  }
}

export function subscribeTransactions(base44, callback) {
  // Subscribe to Order changes and rebuild transaction list
  try {
    return base44Client.entities.Order.subscribe(async () => {
      try {
        const transactions = await buildTransactionsFromOrders();
        callback(transactions || []);
      } catch (err) {
        console.warn('[AffiliateStore] Subscribe refresh failed:', err);
      }
    });
  } catch (err) {
    console.warn('[AffiliateStore] Subscribe transactions failed:', err);
    return () => {};
  }
}

// ─── LOAD AFFILIATE CODES FOR PROMO VALIDATION ───

export async function loadActiveAffiliateCodes() {
  try {
    const affiliates = await base44Client.entities.Affiliate.list();
    const codes = {};
    if (affiliates && Array.isArray(affiliates)) {
      affiliates.forEach(aff => {
        if (aff.is_active && aff.code) {
          codes[aff.code.toUpperCase()] = {
            discount: (aff.discount_percent || 15) / 100,
            label: `${aff.discount_percent || 15}% off`,
            isAffiliate: true,
            affiliateId: aff.id,
          };
        }
      });
    }
    return codes;
  } catch (err) {
    console.error('[AffiliateStore] Failed to load affiliate codes:', err);
    return {};
  }
}

/** Look up full affiliate details by ID (for order recording — keeps PII out of promo flow). */
export async function getAffiliateById(affiliateId) {
  if (!affiliateId) return null;
  try {
    const affiliates = await base44Client.entities.Affiliate.list();
    return affiliates.find(a => a.id === affiliateId) || null;
  } catch (err) {
    console.error('[AffiliateStore] Failed to get affiliate by ID:', err);
    return null;
  }
}

// ─── UPDATE AFFILIATE TOTALS AFTER AN ORDER ───

export async function recordAffiliateOrder(base44, affiliateInfo, orderNumber, totalUSD) {
  // Stats are now computed live from Order records, so we don't need to
  // store separate transaction records or update affiliate totals.
  // The Order.create() call in checkout already stores:
  //   affiliate_code, affiliate_email, affiliate_name, affiliate_commission
  // This function is kept for backward compatibility.
  const pointsEarned = parseFloat((totalUSD * POINTS_REWARD_RATE).toFixed(2));
  const commission = parseFloat((totalUSD * COMMISSION_RATE).toFixed(2));
  return { pointsEarned, commission };
}

// ─── AFFILIATE LOOKUP BY EMAIL (for account dashboard) ───

export async function getAffiliateByEmail(base44, email) {
  if (!email) return null;
  const affiliates = await listAffiliates();
  return affiliates.find(
    a => a.affiliate_email?.toLowerCase() === email.toLowerCase()
  ) || null;
}

export async function getTransactionsForAffiliate(base44, affiliateCode) {
  if (!affiliateCode) return [];
  const transactions = await buildTransactionsFromOrders();
  return transactions.filter(
    t => t.affiliate_code?.toUpperCase() === affiliateCode.toUpperCase()
  );
}

// ─── BACKFILL: Tag old orders that used an affiliate promo but missing affiliate_code ───

export async function backfillAffiliateOrders() {
  try {
    const orders = await base44Client.entities.Order.list('-created_date');
    const affiliates = await base44Client.entities.Affiliate.list();
    let patched = 0;

    for (const order of (orders || [])) {
      // Skip orders that already have affiliate_code set
      if (order.affiliate_code) continue;
      // Skip orders with no discount
      if (!order.discount_amount || order.discount_amount <= 0) continue;

      const subtotal = order.subtotal || order.total_amount || 0;
      if (subtotal <= 0) continue;

      // Calculate what discount percentage was applied
      const discountPercent = Math.round((order.discount_amount / subtotal) * 100);

      // Try to match to an affiliate by discount percentage
      for (const aff of (affiliates || [])) {
        if (aff.discount_percent === discountPercent) {
          const commission = parseFloat((order.total_amount * COMMISSION_RATE).toFixed(2));
          try {
            await base44Client.entities.Order.update(order.id, {
              affiliate_code: aff.code,
              affiliate_email: aff.affiliate_email,
              affiliate_name: aff.affiliate_name,
              affiliate_commission: commission,
            });
            patched++;
          } catch (err) {
            console.warn(`[Backfill] Failed to patch order ${order.order_number}:`, err);
          }
          break; // Only match one affiliate per order
        }
      }
    }

    return { patched, total: (orders || []).length };
  } catch (err) {
    console.error('[AffiliateStore] Backfill failed:', err);
    return { patched: 0, total: 0, error: err.message };
  }
}

// ─── STORAGE MODE INFO ───

export function getStorageMode() {
  return 'base44-entities';
}

export function resetBase44Check() {
  // No-op - no longer needed with Base44 entities
}