/**
 * Affiliate Data Store
 *
 * Provides CRUD operations for affiliate data.
 * Tries Base44 entities first; falls back to localStorage if entities don't exist.
 * This ensures the affiliate system works even without creating Base44 entities.
 */

const AFFILIATES_KEY = 'rdr_affiliates';
const TRANSACTIONS_KEY = 'rdr_affiliate_transactions';

// ─── HELPERS ───

function generateId() {
  return `aff_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
}

function getStoredAffiliates() {
  try {
    const data = localStorage.getItem(AFFILIATES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAffiliates(affiliates) {
  localStorage.setItem(AFFILIATES_KEY, JSON.stringify(affiliates));
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

// ─── DETECT IF BASE44 ENTITIES EXIST ───

let base44Available = null; // null = unknown, true/false = tested

async function checkBase44Entities(base44) {
  if (base44Available !== null) return base44Available;
  try {
    await base44.entities.AffiliateCode.list();
    base44Available = true;
    return true;
  } catch {
    base44Available = false;
    return false;
  }
}

// Reset the check (useful after entity creation)
export function resetBase44Check() {
  base44Available = null;
}

// ─── AFFILIATE CODE OPERATIONS ───

export async function listAffiliates(base44) {
  try {
    if (await checkBase44Entities(base44)) {
      return await base44.entities.AffiliateCode.list();
    }
  } catch {
    // fall through to localStorage
  }
  return getStoredAffiliates();
}

export async function createAffiliate(base44, data) {
  try {
    if (await checkBase44Entities(base44)) {
      return await base44.entities.AffiliateCode.create(data);
    }
  } catch {
    // fall through to localStorage
  }

  // localStorage fallback
  const affiliates = getStoredAffiliates();
  const newAffiliate = {
    ...data,
    id: generateId(),
    created_date: new Date().toISOString(),
  };
  affiliates.push(newAffiliate);
  saveAffiliates(affiliates);
  return newAffiliate;
}

export async function updateAffiliate(base44, id, data) {
  try {
    if (await checkBase44Entities(base44)) {
      return await base44.entities.AffiliateCode.update(id, data);
    }
  } catch {
    // fall through to localStorage
  }

  const affiliates = getStoredAffiliates();
  const index = affiliates.findIndex(a => a.id === id);
  if (index !== -1) {
    affiliates[index] = { ...affiliates[index], ...data };
    saveAffiliates(affiliates);
    return affiliates[index];
  }
  throw new Error('Affiliate not found');
}

export async function deleteAffiliate(base44, id) {
  try {
    if (await checkBase44Entities(base44)) {
      return await base44.entities.AffiliateCode.delete(id);
    }
  } catch {
    // fall through to localStorage
  }

  const affiliates = getStoredAffiliates();
  const filtered = affiliates.filter(a => a.id !== id);
  saveAffiliates(filtered);
}

// ─── AFFILIATE TRANSACTION OPERATIONS ───

export async function listTransactions(base44) {
  try {
    if (await checkBase44Entities(base44)) {
      return await base44.entities.AffiliateTransaction.list();
    }
  } catch {
    // fall through to localStorage
  }
  return getStoredTransactions();
}

export async function createTransaction(base44, data) {
  try {
    if (await checkBase44Entities(base44)) {
      return await base44.entities.AffiliateTransaction.create(data);
    }
  } catch {
    // fall through to localStorage
  }

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
  try {
    if (await checkBase44Entities(base44)) {
      return await base44.entities.AffiliateTransaction.update(id, data);
    }
  } catch {
    // fall through to localStorage
  }

  const transactions = getStoredTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...data };
    saveTransactions(transactions);
    return transactions[index];
  }
  throw new Error('Transaction not found');
}

// ─── SUBSCRIBE (no-op for localStorage, real-time for Base44) ───

export function subscribeAffiliates(base44, callback) {
  try {
    if (base44Available === true) {
      return base44.entities.AffiliateCode.subscribe(callback);
    }
  } catch {
    // no-op
  }
  // Return a no-op unsubscribe
  return () => {};
}

export function subscribeTransactions(base44, callback) {
  try {
    if (base44Available === true) {
      return base44.entities.AffiliateTransaction.subscribe(callback);
    }
  } catch {
    // no-op
  }
  return () => {};
}

// ─── LOAD AFFILIATE CODES FOR PROMO VALIDATION ───

export async function loadActiveAffiliateCodes(base44) {
  const affiliates = await listAffiliates(base44);
  const codes = {};
  if (affiliates && Array.isArray(affiliates)) {
    affiliates.forEach(aff => {
      if (aff.is_active && aff.code) {
        codes[aff.code.toUpperCase()] = {
          discount: (aff.discount_percent || 15) / 100,
          label: `${aff.discount_percent || 15}% off`,
          isAffiliate: true,
          affiliateEmail: aff.affiliate_email,
          affiliateId: aff.id,
          affiliateName: aff.affiliate_name,
        };
      }
    });
  }
  return codes;
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
  const affiliates = await listAffiliates(base44);
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

// ─── STORAGE MODE INFO ───

export function getStorageMode() {
  if (base44Available === true) return 'base44';
  if (base44Available === false) return 'localStorage';
  return 'unknown';
}
