/**
 * Affiliate Data Store
 *
 * Affiliate definitions are stored as a hardcoded list (+ localStorage overrides
 * for admin-created affiliates).
 *
 * Commission tracking and transaction history are derived from ACTUAL Order
 * records in Base44 — orders already store affiliate_code, affiliate_email,
 * affiliate_name, and affiliate_commission fields.  This means the admin
 * always sees real data computed from real orders, regardless of which browser
 * or device the customer used to place the order.
 */

import { base44 as base44Client } from '@/api/base44Client';

// ─── CONSTANTS ───

const AFFILIATES_KEY = 'rdr_affiliates_overrides';
const DELETED_KEY = 'rdr_affiliates_deleted';

const POINTS_REWARD_RATE = 0.015; // 1.5% of order total
const COMMISSION_RATE = 0.10;     // 10% of order total

// ─── HARDCODED AFFILIATES (PRIMARY DATABASE) ───
const HARDCODED_AFFILIATES = [
  {
    id: 'aff_melissa_thomas',
    code: 'MELLISA10',
    affiliate_name: 'Melissa Thomas',
    affiliate_email: 'mizzmariee3@gmail.com',
    discount_percent: 10,
    commission_percent: 10,
    is_active: true,
    total_points: 0,
    total_commission: 0,
    total_orders: 0,
    total_revenue: 0,
  },
  {
    id: 'aff_jessica_vice',
    code: 'PEPMOMMA',
    affiliate_name: 'Jessica Vice',
    affiliate_email: 'Flicka2591@yahoo.com',
    discount_percent: 10,
    commission_percent: 10,
    is_active: true,
    total_points: 0,
    total_commission: 0,
    total_orders: 0,
    total_revenue: 0,
  },
];

// ─── HELPERS ───

function generateId() {
  return `aff_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
}

function getOverrides() {
  try {
    const data = localStorage.getItem(AFFILIATES_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveOverrides(overrides) {
  localStorage.setItem(AFFILIATES_KEY, JSON.stringify(overrides));
}

function getDeletedIds() {
  try {
    const data = localStorage.getItem(DELETED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveDeletedIds(ids) {
  localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
}

// Build affiliate list from hardcoded + overrides, minus deleted
function buildAffiliateList() {
  const overrides = getOverrides();
  const deletedIds = getDeletedIds();
  const hardcodedIds = new Set(HARDCODED_AFFILIATES.map(a => a.id));

  const result = HARDCODED_AFFILIATES
    .filter(aff => !deletedIds.includes(aff.id))
    .map(aff => {
      const override = overrides[aff.id];
      if (override) {
        return { ...aff, ...override };
      }
      return { ...aff };
    });

  // Add any affiliates created via admin (stored only in overrides)
  for (const [id, data] of Object.entries(overrides)) {
    if (!hardcodedIds.has(id) && !deletedIds.includes(id) && data.code) {
      result.push(data);
    }
  }

  return result;
}

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
  const affiliates = buildAffiliateList();

  // Merge live stats from actual Order records
  const stats = await computeAffiliateStats();

  return affiliates.map(aff => {
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
}

export async function createAffiliate(base44, data) {
  const id = generateId();
  const newAffiliate = {
    ...data,
    id,
    created_date: new Date().toISOString(),
    total_points: data.total_points || 0,
    total_commission: data.total_commission || 0,
    total_orders: data.total_orders || 0,
    total_revenue: data.total_revenue || 0,
  };

  // Store in localStorage (persistent across browser refreshes)
  const overrides = getOverrides();
  overrides[id] = newAffiliate;
  saveOverrides(overrides);

  // Remove from deleted list if it was previously deleted
  const deletedIds = getDeletedIds();
  const filtered = deletedIds.filter(did => did !== id);
  if (filtered.length !== deletedIds.length) saveDeletedIds(filtered);

  return newAffiliate;
}

export async function updateAffiliate(base44, id, data) {
  // Get current affiliate data
  const affiliates = buildAffiliateList();
  const current = affiliates.find(a => a.id === id);
  
  // Merge with updates and store in localStorage (persistent)
  const overrides = getOverrides();
  overrides[id] = { ...(current || {}), ...(overrides[id] || {}), ...data };
  saveOverrides(overrides);

  return { id, ...overrides[id] };
}

export async function deleteAffiliate(base44, id) {
  // Mark as deleted in localStorage (persistent)
  const deletedIds = getDeletedIds();
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    saveDeletedIds(deletedIds);
  }

  // Remove from overrides
  const overrides = getOverrides();
  delete overrides[id];
  saveOverrides(overrides);
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
  // Subscribe to Order changes and recompute affiliate stats
  try {
    return base44Client.entities.Order.subscribe(async () => {
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
  const affiliates = buildAffiliateList();
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
}

/** Look up full affiliate details by ID (for order recording — keeps PII out of promo flow). */
export async function getAffiliateById(affiliateId) {
  if (!affiliateId) return null;
  const affiliates = buildAffiliateList();
  return affiliates.find(a => a.id === affiliateId) || null;
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
    const affiliates = buildAffiliateList();
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
      for (const aff of affiliates) {
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
  return 'orders';
}

export function resetBase44Check() {
  // No-op
}