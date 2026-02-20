const CART_KEY = 'rdr_cart';

export const getCart = () => {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

export const addToCart = (product, specification) => {
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

// Static promo codes - always available
const STATIC_PROMO_CODES = {
  'SAVE10': { discount: 0.10, label: '10% off' },
  'SAVE20': { discount: 0.20, label: '20% off' },
  'WELCOME': { discount: 0.15, label: '15% off first order' },
  'FIRSTDAY15': { discount: 0.15, label: '15% off' },
  'INDO88': { discount: 0.10, label: '10% off' },
  'MELLISA10': { discount: 0.10, label: '10% off (Affiliate)', isAffiliate: true, affiliateId: 'aff_melissa_thomas' },
  'PEPMOMMA': { discount: 0.10, label: '10% off (Affiliate)', isAffiliate: true, affiliateId: 'aff_jessica_vice' },
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

// Synchronous validation against static codes only (for immediate UI)
export const validatePromoCode = (code) => {
  const upper = code.toUpperCase();
  // Check static codes first
  if (STATIC_PROMO_CODES[upper]) return STATIC_PROMO_CODES[upper];
  // Check cached affiliate codes
  if (affiliateCodesCache && affiliateCodesCache[upper]) return affiliateCodesCache[upper];
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
  return null;
};

export const getDiscountAmount = (code, total) => {
  const promo = validatePromoCode(code);
  return promo ? total * promo.discount : 0;
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
export const validateCartStock = async (base44) => {
  const cart = getCart();
  if (cart.length === 0) return [];

  try {
    const products = await base44.entities.Product.list();
    const removed = [];

    const validCart = cart.filter(item => {
      // Find the product by ID or name
      const product = products.find(p => p.id === item.productId || p.name === item.productName);
      if (!product) {
        removed.push(item.productName || 'Unknown product');
        return false;
      }

      // Check if the specific variant/specification is still in stock
      const spec = product.specifications?.find(s => s.name === item.specification);
      if (!spec || spec.in_stock === false || spec.stock_quantity === 0) {
        removed.push(`${item.productName} (${item.specification})`);
        return false;
      }

      return true;
    });

    if (removed.length > 0) {
      localStorage.setItem(CART_KEY, JSON.stringify(validCart));
      window.dispatchEvent(new Event('cartUpdated'));
    }

    return removed;
  } catch (err) {
    console.warn('[CART] Failed to validate stock:', err);
    return [];
  }
};
