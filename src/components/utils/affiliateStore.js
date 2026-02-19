/**
 * Affiliate Data Store
 *
 * HARDCODED_AFFILIATES is the primary source of truth for all affiliates.
 * To add a new affiliate, add an entry to the array below.
 * To remove one, delete it from the array (or mark is_active: false).
 *
 * localStorage is used only for:
 *   - Runtime stat updates (points, commission, orders, revenue)
 *   - Tracking deleted hardcoded affiliates (so admin delete works without code changes)
 *   - Transaction history
 */

const AFFILIATES_KEY = 'rdr_affiliates_overrides';
const DELETED_KEY = 'rdr_affiliates_deleted';
const TRANSACTIONS_KEY = 'rdr_affiliate_transactions';

// ─── HARDCODED AFFILIATES (PRIMARY DATABASE) ───
// Add new affiliates here. They will always exist unless explicitly deleted via admin.
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
];

// ─── HELPERS ───

function generateId() {
  return `aff_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
}

// Get stat overrides from localStorage (points, commission, etc.)
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

// Get list of deleted affiliate IDs
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

function getStoredTransactions() {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTransactions(transactions) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

// Build the live affiliate list from hardcoded + overrides, minus deleted
function buildAffiliateList() {
  const overrides = getOverrides();
  const deletedIds = getDeletedIds();
  const hardcodedIds = new Set(HARDCODED_AFFILIATES.map(a => a.id));

  // Start with hardcoded affiliates, applying any stat overrides
  const result = HARDCODED_AFFILIATES
    .filter(aff => !deletedIds.includes(aff.id))
    .map(aff => {
      const override = overrides[aff.id];
      if (override) {
        return { ...aff, ...override };
      }
      return { ...aff };
    });

  // Add any affiliates that were created via admin (stored only in overrides)
  for (const [id, data] of Object.entries(overrides)) {
    if (!hardcodedIds.has(id) && !deletedIds.includes(id) && data.code) {
      result.push(data);
    }
  }

  return result;
}

// ─── DETECT IF BASE44 ENTITIES EXIST ───

let base44Available = null;
let base44LastCheck = 0;
const BASE44_RECHECK_INTERVAL = 30000;

async function checkBase44Entities(base44) {
  if (base44Available === true) return true;
  if (base44Available === false && (Date.now() - base44LastCheck) < BASE44_RECHECK_INTERVAL) {
    return false;
  }
  try {
    await base44.entities.AffiliateCode.list();
    base44Available = true;
    base44LastCheck = Date.now();
    return true;
  } catch (err) {
    console.error('[AffiliateStore] Base44 entity check failed:', err?.message || err);
    base44Available = false;
    base44LastCheck = Date.now();
    return false;
  }
}

export function resetBase44Check() {
  base44Available = null;
  base44LastCheck = 0;
}

// ─── AFFILIATE CODE OPERATIONS ───

export async function listAffiliates() {
  // Always return from hardcoded + overrides (Base44 entities are bonus if available)
  return buildAffiliateList();
}

export async function createAffiliate(base44, data) {
  // Add to hardcoded list at runtime by storing in overrides with a new ID
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

  // Add to the hardcoded array at runtime so it shows immediately
  HARDCODED_AFFILIATES.push(newAffiliate);

  // Also persist the full record as an override so it survives page reload
  const overrides = getOverrides();
  overrides[id] = newAffiliate;
  saveOverrides(overrides);

  // Remove from deleted list if re-adding
  const deletedIds = getDeletedIds();
  const filtered = deletedIds.filter(did => did !== id);
  if (filtered.length !== deletedIds.length) saveDeletedIds(filtered);

  return newAffiliate;
}

export async function updateAffiliate(base44, id, data) {
  // Update the override for this affiliate
  const overrides = getOverrides();
  overrides[id] = { ...(overrides[id] || {}), ...data };
  saveOverrides(overrides);

  // Also update the runtime hardcoded array
  const idx = HARDCODED_AFFILIATES.findIndex(a => a.id === id);
  if (idx !== -1) {
    HARDCODED_AFFILIATES[idx] = { ...HARDCODED_AFFILIATES[idx], ...data };
  }

  return { id, ...data };
}

export async function deleteAffiliate(base44, id) {
  // Add to deleted list
  const deletedIds = getDeletedIds();
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    saveDeletedIds(deletedIds);
  }

  // Remove from runtime hardcoded array
  const idx = HARDCODED_AFFILIATES.findIndex(a => a.id === id);
  if (idx !== -1) {
    HARDCODED_AFFILIATES.splice(idx, 1);
  }

  // Clean up override
  const overrides = getOverrides();
  delete overrides[id];
  saveOverrides(overrides);
}

// ─── AFFILIATE TRANSACTION OPERATIONS ───

export async function listTransactions() {
  return getStoredTransactions();
}

export async function createTransaction(base44, data) {
  const transactions = getStoredTransactions();
  const newTx = {
    ...data,
    id: generateId(),
    created_date: new Date().toISOString(),
  };
  transactions.push(newTx);
  saveTransactions(transactions);
  return newTx;
}

export async function updateTransaction(base44, id, data) {
  const transactions = getStoredTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...data };
    saveTransactions(transactions);
    return transactions[index];
  }
  throw new Error('Transaction not found');
}

// ─── SUBSCRIBE (no-op — data is local) ───

export function subscribeAffiliates(base44, callback) {
  return () => {};
}

export function subscribeTransactions(base44, callback) {
  return () => {};
}

// ─── LOAD AFFILIATE CODES FOR PROMO VALIDATION ───

export async function loadActiveAffiliateCodes() {
  const affiliates = await listAffiliates();
  const codes = {};
  if (affiliates && Array.isArray(affiliates)) {
    affiliates.forEach(aff => {
      if (aff.is_active && aff.code) {
        codes[aff.code.toUpperCase()] = {
          discount: (aff.discount_percent || 15) / 100,
          label: `${aff.discount_percent || 15}% off`,
          isAffiliate: true,
          affiliateId: aff.id,
          // PII (email, name) not included here — resolved at order time via getAffiliateById()
        };
      }
    });
  }
  return codes;
}

/** Look up full affiliate details by ID (for order recording — keeps PII out of promo flow). */
export async function getAffiliateById(affiliateId) {
  if (!affiliateId) return null;
  const affiliates = await listAffiliates();
  return affiliates.find(a => a.id === affiliateId) || null;
}

// ─── UPDATE AFFILIATE TOTALS AFTER AN ORDER ───

export async function recordAffiliateOrder(base44, affiliateInfo, orderNumber, totalUSD) {
  const pointsEarned = parseFloat((totalUSD * 0.015).toFixed(2));
  const commission = parseFloat((totalUSD * 0.10).toFixed(2));

  // Create transaction
  await createTransaction(base44, {
    affiliate_email: affiliateInfo.email,
    affiliate_name: affiliateInfo.name,
    affiliate_code: affiliateInfo.code,
    order_number: orderNumber,
    order_total: totalUSD,
    commission_amount: commission,
    points_earned: pointsEarned,
    customer_email: affiliateInfo.customerEmail || 'guest@redhelixresearch.com',
    status: 'pending',
  });

  // Update affiliate totals
  const affiliates = await listAffiliates();
  const affiliateRecord = affiliates.find(
    a => a.affiliate_email === affiliateInfo.email && a.code === affiliateInfo.code
  );

  if (affiliateRecord) {
    await updateAffiliate(base44, affiliateRecord.id, {
      total_points: (affiliateRecord.total_points || 0) + pointsEarned,
      total_commission: (affiliateRecord.total_commission || 0) + commission,
      total_orders: (affiliateRecord.total_orders || 0) + 1,
      total_revenue: (affiliateRecord.total_revenue || 0) + totalUSD,
    });
  }

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
  const transactions = await listTransactions();
  return transactions.filter(
    t => t.affiliate_code?.toUpperCase() === affiliateCode.toUpperCase()
  );
}

// ─── STORAGE MODE INFO ───

export function getStorageMode() {
  return 'hardcoded';
}
