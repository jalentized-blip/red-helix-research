/**
 * Affiliate Data Store
 *
 * Uses Base44 entities (AffiliateCode + AffiliateTransaction) as the
 * primary data store.  The SEED_AFFILIATES array below is only used to
 * auto-create the initial affiliate record if one doesn't already exist
 * in the database.
 */

import { base44 as base44Client } from '@/api/base44Client';

// ─── SEED DATA (created in Base44 on first load if missing) ───

const SEED_AFFILIATES = [
  {
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

// ─── ONE-TIME SEED CHECK ───

let seeded = false;

async function ensureSeedAffiliates(b44) {
  if (seeded) return;
  try {
    const b = b44 || base44Client;
    for (const seed of SEED_AFFILIATES) {
      const existing = await b.entities.AffiliateCode.filter({ code: seed.code });
      if (!existing || existing.length === 0) {
        await b.entities.AffiliateCode.create(seed);
        console.log(`[AffiliateStore] Seeded affiliate: ${seed.code}`);
      }
    }
    seeded = true;
  } catch (err) {
    console.warn('[AffiliateStore] Seed check failed:', err);
  }
}

// ─── CLEAN UP LEGACY LOCALSTORAGE (one-time) ───

try {
  localStorage.removeItem('rdr_affiliates_overrides');
  localStorage.removeItem('rdr_affiliates_deleted');
  localStorage.removeItem('rdr_affiliate_transactions');
} catch {}

// ─── AFFILIATE CODE OPERATIONS ───

export async function listAffiliates(b44) {
  const b = b44 || base44Client;
  await ensureSeedAffiliates(b);
  try {
    const affiliates = await b.entities.AffiliateCode.list('-created_date', 200);
    return affiliates || [];
  } catch (err) {
    console.error('[AffiliateStore] Failed to list affiliates:', err);
    return [];
  }
}

export async function createAffiliate(b44, data) {
  const b = b44 || base44Client;
  return await b.entities.AffiliateCode.create({
    code: data.code,
    affiliate_name: data.affiliate_name,
    affiliate_email: data.affiliate_email,
    discount_percent: data.discount_percent || 15,
    commission_percent: data.commission_percent || 10,
    is_active: data.is_active !== false,
    total_points: data.total_points || 0,
    total_commission: data.total_commission || 0,
    total_orders: data.total_orders || 0,
    total_revenue: data.total_revenue || 0,
    notes: data.notes || '',
  });
}

export async function updateAffiliate(b44, id, data) {
  const b = b44 || base44Client;
  return await b.entities.AffiliateCode.update(id, data);
}

export async function deleteAffiliate(b44, id) {
  const b = b44 || base44Client;
  return await b.entities.AffiliateCode.delete(id);
}

// ─── AFFILIATE TRANSACTION OPERATIONS ───

export async function listTransactions(b44) {
  const b = b44 || base44Client;
  try {
    const transactions = await b.entities.AffiliateTransaction.list('-created_date', 500);
    return transactions || [];
  } catch (err) {
    console.error('[AffiliateStore] Failed to list transactions:', err);
    return [];
  }
}

export async function createTransaction(b44, data) {
  const b = b44 || base44Client;
  return await b.entities.AffiliateTransaction.create({
    affiliate_email: data.affiliate_email,
    affiliate_name: data.affiliate_name,
    affiliate_code: data.affiliate_code,
    order_number: data.order_number,
    order_total: data.order_total,
    commission_amount: data.commission_amount,
    points_earned: data.points_earned,
    customer_email: data.customer_email,
    status: data.status || 'pending',
  });
}

export async function updateTransaction(b44, id, data) {
  const b = b44 || base44Client;
  return await b.entities.AffiliateTransaction.update(id, data);
}

// ─── SUBSCRIBE (real-time via Base44 WebSocket) ───

export function subscribeAffiliates(b44, callback) {
  const b = b44 || base44Client;
  try {
    return b.entities.AffiliateCode.subscribe(async () => {
      try {
        const affiliates = await b.entities.AffiliateCode.list('-created_date', 200);
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

export function subscribeTransactions(b44, callback) {
  const b = b44 || base44Client;
  try {
    return b.entities.AffiliateTransaction.subscribe(async () => {
      try {
        const transactions = await b.entities.AffiliateTransaction.list('-created_date', 500);
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

export async function loadActiveAffiliateCodes(b44) {
  const b = b44 || base44Client;
  try {
    await ensureSeedAffiliates(b);
    const affiliates = await b.entities.AffiliateCode.filter(
      { is_active: true },
      '-created_date',
      200
    );
    const codes = {};
    if (affiliates && Array.isArray(affiliates)) {
      affiliates.forEach(aff => {
        if (aff.code) {
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
  } catch (err) {
    console.error('[AffiliateStore] Failed to load active affiliate codes:', err);
    return {};
  }
}

/** Look up full affiliate details by ID (for order recording — keeps PII out of promo flow). */
export async function getAffiliateById(affiliateId) {
  if (!affiliateId) return null;
  try {
    const affiliate = await base44Client.entities.AffiliateCode.get(affiliateId);
    return affiliate || null;
  } catch (err) {
    console.warn('[AffiliateStore] Failed to get affiliate by ID:', err);
    // Fallback: try listing and finding by ID
    try {
      const affiliates = await base44Client.entities.AffiliateCode.list('-created_date', 200);
      return (affiliates || []).find(a => a.id === affiliateId) || null;
    } catch {
      return null;
    }
  }
}

// ─── UPDATE AFFILIATE TOTALS AFTER AN ORDER ───

export async function recordAffiliateOrder(b44, affiliateInfo, orderNumber, totalUSD) {
  const b = b44 || base44Client;
  const pointsEarned = parseFloat((totalUSD * 0.015).toFixed(2));
  const commission = parseFloat((totalUSD * 0.10).toFixed(2));

  // Create transaction in Base44
  await createTransaction(b, {
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

  // Update affiliate totals in Base44
  try {
    const affiliates = await b.entities.AffiliateCode.filter({ code: affiliateInfo.code });
    const affiliateRecord = affiliates?.[0];

    if (affiliateRecord) {
      await b.entities.AffiliateCode.update(affiliateRecord.id, {
        total_points: (affiliateRecord.total_points || 0) + pointsEarned,
        total_commission: (affiliateRecord.total_commission || 0) + commission,
        total_orders: (affiliateRecord.total_orders || 0) + 1,
        total_revenue: (affiliateRecord.total_revenue || 0) + totalUSD,
      });
    }
  } catch (err) {
    console.warn('[AffiliateStore] Failed to update affiliate totals:', err);
    // Transaction was already created, so this is non-fatal
  }

  return { pointsEarned, commission };
}

// ─── AFFILIATE LOOKUP BY EMAIL (for account dashboard) ───

export async function getAffiliateByEmail(b44, email) {
  if (!email) return null;
  const b = b44 || base44Client;
  try {
    const results = await b.entities.AffiliateCode.filter({ affiliate_email: email });
    if (results && results.length > 0) return results[0];
    // Fallback: case-insensitive search via full list
    const all = await b.entities.AffiliateCode.list('-created_date', 200);
    return (all || []).find(
      a => a.affiliate_email?.toLowerCase() === email.toLowerCase()
    ) || null;
  } catch (err) {
    console.warn('[AffiliateStore] Failed to get affiliate by email:', err);
    return null;
  }
}

export async function getTransactionsForAffiliate(b44, affiliateCode) {
  if (!affiliateCode) return [];
  const b = b44 || base44Client;
  try {
    const transactions = await b.entities.AffiliateTransaction.filter(
      { affiliate_code: affiliateCode.toUpperCase() },
      '-created_date',
      500
    );
    return transactions || [];
  } catch (err) {
    console.warn('[AffiliateStore] Failed to get transactions for affiliate:', err);
    return [];
  }
}

// ─── STORAGE MODE INFO ───

export function getStorageMode() {
  return 'base44';
}

export function resetBase44Check() {
  // No-op — Base44 is now the only storage mode
}
