const CART_KEY = 'rdr_cart';

/**
 * SINGLE SOURCE OF TRUTH for spec stock status.
 * A spec is in stock if and only if:
 *   - spec.in_stock is not explicitly false, AND
 *   - stock_quantity is not exactly 0 (unlimited = -1 or undefined = allowed)
 * This is used everywhere to prevent drift between the two fields.
 */
export const isSpecInStock = (spec) => {
  if (!spec) return false;
  if (spec.in_stock === false) return false;
  if (spec.stock_quantity === 0) return false;
  return true;
};

export const getCart = () => {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

export const addToCart = (product, specification) => {
  // FAILSAFE: Block adding any out-of-stock spec using the shared truth function
  if (!isSpecInStock(specification)) {
    console.warn('[CART] Blocked attempt to add out-of-stock spec:', specification?.name);
    return getCart();
  }
  const cart = getCart();
  const item = {
    id: `${product.id}-${specification.name}`,
    productId: product.id,
    productName: product.name,
    specification: specification.name,
    price: specification.price,
    quantity: 1,
    addedAt: new Date().toISOString(),
  };

  // Check if item already exists
  const existingItem = cart.find(c => c.id === item.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(item);
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));

  // Meta Pixel: AddToCart event
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: specification.price,
      currency: 'USD',
    });
  }

  return cart;
};

export const updateCartQuantity = (itemId, newQuantity) => {
  const cart = getCart();
  if (newQuantity <= 0) {
    return removeFromCart(itemId);
  }
  const item = cart.find(c => c.id === itemId);
  if (item) {
    item.quantity = newQuantity;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  }
  return cart;
};

export const removeFromCart = (itemId) => {
  const cart = getCart();
  const filtered = cart.filter(item => item.id !== itemId);
  localStorage.setItem(CART_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('cartUpdated'));
  return filtered;
};

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('cartUpdated'));
};

export const getCartCount = () => {
  return getCart().length;
};

export const getCartTotal = () => {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
};

// Static promo codes - always available (non-affiliate discounts only)
const STATIC_PROMO_CODES = {
  'SAVE10': { discount: 0.10, label: '10% off' },
  'SAVE20': { discount: 0.20, label: '20% off' },
  'WELCOME': { discount: 0.15, label: '15% off first order' },
  'FIRSTDAY15': { discount: 0.15, label: '15% off' },
  'INDO88': { discount: 0.10, label: '10% off' },
  // Affiliate codes are loaded dynamically from the database — do NOT hardcode them here
};

import { loadActiveAffiliateCodes, getAffiliateById } from '@/components/utils/affiliateStore';

// Cache for affiliate codes loaded from DB or localStorage
let affiliateCodesCache = null;
let affiliateCacheTime = 0;
const CACHE_DURATION = 15000; // 15 second cache for faster pickup of new codes

// Load affiliate codes (uses affiliateStore which falls back to localStorage)
export const loadAffiliateCodes = async (base44) => {
  const now = Date.now();
  if (affiliateCodesCache && (now - affiliateCacheTime) < CACHE_DURATION) {
    return affiliateCodesCache;
  }

  try {
    const codes = await loadActiveAffiliateCodes(base44);
    affiliateCodesCache = codes;
    affiliateCacheTime = now;
    return codes;
  } catch (error) {
    console.warn('Failed to load affiliate codes:', error);
    // Return cached codes if available, empty object only as last resort
    return affiliateCodesCache || {};
  }
};

// Clear the affiliate cache (call when affiliates are updated)
export const clearAffiliateCache = () => {
  affiliateCodesCache = null;
  affiliateCacheTime = 0;
};

// Get all promo codes (static + dynamic affiliate codes)
export const getAllPromoCodes = async (base44) => {
  const affiliateCodes = base44 ? await loadAffiliateCodes(base44) : {};
  return { ...STATIC_PROMO_CODES, ...affiliateCodes };
};

// Load dynamic promo codes (welcome discount codes stored in localStorage)
const getDynamicPromoCodes = () => {
  try {
    return JSON.parse(localStorage.getItem('rhr_dynamic_promos') || '{}');
  } catch {
    return {};
  }
};

// Synchronous validation against static codes only (for immediate UI)
export const validatePromoCode = (code) => {
  const upper = code.toUpperCase();
  // Check static codes first
  if (STATIC_PROMO_CODES[upper]) return STATIC_PROMO_CODES[upper];
  // Check cached affiliate codes
  if (affiliateCodesCache && affiliateCodesCache[upper]) return affiliateCodesCache[upper];
  // Check dynamic promo codes (welcome discount codes)
  const dynamic = getDynamicPromoCodes();
  if (dynamic[upper]) return dynamic[upper];
  return null;
};

// Async validation that checks both static and DB codes
export const validatePromoCodeAsync = async (code, base44) => {
  const upper = code.toUpperCase();
  // Check static codes first
  if (STATIC_PROMO_CODES[upper]) return STATIC_PROMO_CODES[upper];
  // Load and check affiliate codes from DB
  const affiliateCodes = await loadAffiliateCodes(base44);
  if (affiliateCodes[upper]) return affiliateCodes[upper];
  // Check dynamic welcome codes against DB to verify not used/expired
  const dynamic = getDynamicPromoCodes();
  if (dynamic[upper]) {
    if (base44) {
      try {
        const records = await base44.entities.WelcomeDiscount.filter({ code: upper });
        if (records.length > 0) {
          const record = records[0];
          const expired = record.expires_at && new Date(record.expires_at) < new Date();
          if (record.used || expired) return null; // Code used or expired
        }
      } catch { /* DB check failed, allow it */ }
    }
    return dynamic[upper];
  }
  return null;
};

export const getDiscountAmount = (code, total) => {
  const promo = validatePromoCode(code);
  if (!promo) return 0;
  if (promo.singleVialsOnly) {
    // Only discount items that are single vials (not 10-vial kits)
    const cart = getCart();
    const singleVialTotal = cart.reduce((sum, item) => {
      const isKit = item.specification?.toLowerCase().includes('10 vial') || item.productId === 'kits-product';
      return isKit ? sum : sum + item.price * item.quantity;
    }, 0);
    return singleVialTotal * promo.discount;
  }
  return total * promo.discount;
};

export const addPromoCode = (code) => {
  if (validatePromoCode(code)) {
    localStorage.setItem('rdr_promo', code.toUpperCase());
    // Store minimal affiliate reference (no PII — resolved at order time)
    const promo = validatePromoCode(code);
    if (promo?.isAffiliate) {
      localStorage.setItem('rdr_affiliate', JSON.stringify({
        code: code.toUpperCase(),
        id: promo.affiliateId,
      }));
    } else {
      localStorage.removeItem('rdr_affiliate');
    }
    window.dispatchEvent(new Event('promoUpdated'));
    return true;
  }
  return false;
};

// Async version that checks DB affiliate codes too
export const addPromoCodeAsync = async (code, base44) => {
  const promo = await validatePromoCodeAsync(code, base44);
  if (promo) {
    localStorage.setItem('rdr_promo', code.toUpperCase());
    if (promo.isAffiliate) {
      localStorage.setItem('rdr_affiliate', JSON.stringify({
        code: code.toUpperCase(),
        id: promo.affiliateId,
      }));
    } else {
      localStorage.removeItem('rdr_affiliate');
    }
    window.dispatchEvent(new Event('promoUpdated'));
    return true;
  }
  return false;
};

export const getPromoCode = () => {
  return localStorage.getItem('rdr_promo');
};

export const getAffiliateInfo = () => {
  try {
    const info = localStorage.getItem('rdr_affiliate');
    return info ? JSON.parse(info) : null;
  } catch {
    return null;
  }
};

/** Resolve full affiliate info (including PII) at order time from affiliate list. */
export const resolveAffiliateInfo = async () => {
  const basic = getAffiliateInfo();
  if (!basic?.code) return null;

  // Try by ID first
  if (basic.id) {
    try {
      const full = await getAffiliateById(basic.id);
      if (full) {
        return {
          code: basic.code,
          id: basic.id,
          email: full.affiliate_email,
          name: full.affiliate_name,
        };
      }
    } catch (err) {
      console.warn('Failed to resolve affiliate by ID:', err);
    }
  }

  // Fallback: look up by code directly from the affiliate list
  try {
    const { loadActiveAffiliateCodes: loadCodes } = await import('@/components/utils/affiliateStore');
    // We need the full affiliate list, not just the promo codes
    const { listAffiliates } = await import('@/components/utils/affiliateStore');
    const affiliates = await listAffiliates();
    const match = affiliates.find(a => a.code?.toUpperCase() === basic.code.toUpperCase());
    if (match) {
      return {
        code: basic.code,
        id: match.id,
        email: match.affiliate_email,
        name: match.affiliate_name,
      };
    }
  } catch (err) {
    console.warn('Failed to resolve affiliate by code:', err);
  }

  return null;
};

export const removePromoCode = () => {
  localStorage.removeItem('rdr_promo');
  localStorage.removeItem('rdr_affiliate');
  window.dispatchEvent(new Event('promoUpdated'));
};

// Validate cart items against live product stock — removes out-of-stock items
// Returns { removed: string[], warnings: string[] }
export const validateCartStock = async (base44) => {
  const cart = getCart();
  if (cart.length === 0) return { removed: [], warnings: [] };

  // Retry up to 3 times in case of transient network errors
  let products = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      products = await base44.entities.Product.list();
      break;
    } catch (err) {
      if (attempt === 3) {
        console.warn('[CART] Stock validation failed after 3 attempts — skipping removal to protect cart:', err);
        // FAILSAFE: Do NOT remove items if we can't confirm stock status
        return { removed: [], warnings: [] };
      }
      await new Promise(r => setTimeout(r, 500 * attempt)); // back-off
    }
  }

  if (!products || !Array.isArray(products)) {
    console.warn('[CART] Products list invalid — skipping removal');
    return { removed: [], warnings: [] };
  }

  const removed = [];
  const warnings = [];

  const validCart = cart.filter(item => {
    // Safety: skip malformed cart items
    if (!item || !item.productId && !item.productName) {
      warnings.push('Skipped malformed cart item');
      return false;
    }

    // Find the product by ID first, then fall back to name
    const product = products.find(p => p.id === item.productId) 
      || products.find(p => p.name === item.productName);

    if (!product) {
      // FAILSAFE: If product not found in DB, keep it — could be a DB load issue
      // Only remove if we're very sure (product was explicitly deleted/hidden)
      console.warn(`[CART] Product not found in DB for item: ${item.productName} — keeping in cart`);
      warnings.push(`${item.productName} could not be verified (kept in cart)`);
      return true; // keep
    }

    // Whole product is hidden or deleted — remove
    if (product.hidden || product.is_deleted) {
      removed.push(`${item.productName} (${item.specification})`);
      return false;
    }

    // Check if the specific specification exists and is in stock
    const spec = product.specifications?.find(s => s.name === item.specification);

    if (!spec) {
      // FAILSAFE: Spec not found could be a data mismatch — keep item, warn
      console.warn(`[CART] Spec "${item.specification}" not found for "${item.productName}" — keeping in cart`);
      warnings.push(`${item.productName} (${item.specification}) spec could not be verified (kept)`);
      return true; // keep
    }

    // Spec is explicitly hidden — remove
    if (spec.hidden) {
      removed.push(`${item.productName} (${item.specification})`);
      return false;
    }

    // Authoritative stock check using shared isSpecInStock function
    if (!isSpecInStock(spec)) {
      removed.push(`${item.productName} (${item.specification})`);
      return false;
    }

    return true;
  });

  if (removed.length > 0) {
    localStorage.setItem(CART_KEY, JSON.stringify(validCart));
    window.dispatchEvent(new Event('cartUpdated'));
  }

  return { removed, warnings };
};