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

// Promo code validation - delegated to server-side for security
// The validateOrder serverless function holds the actual promo code list

// Client-side cache for validated promo codes (validated by server)
let _validatedPromoCache = null;

export const validatePromoCode = async (code) => {
  try {
    const { base44 } = await import('@/api/base44Client');
    const result = await base44.functions.invoke('validateOrder', {
      action: 'validate_promo',
      code: code
    });
    if (result?.valid) {
      _validatedPromoCache = { code: code.toUpperCase(), discount: result.discount, label: result.label };
      return _validatedPromoCache;
    }
    return null;
  } catch {
    return null;
  }
};

export const getDiscountAmount = (code, total) => {
  // Use cached server-validated promo data
  if (_validatedPromoCache && _validatedPromoCache.code === code.toUpperCase()) {
    return total * _validatedPromoCache.discount;
  }
  return 0;
};

export const addPromoCode = async (code) => {
  const result = await validatePromoCode(code);
  if (result) {
    localStorage.setItem('rdr_promo', code.toUpperCase());
    window.dispatchEvent(new Event('promoUpdated'));
    return true;
  }
  return false;
};

export const getPromoCode = () => {
  return localStorage.getItem('rdr_promo');
};

export const removePromoCode = () => {
  localStorage.removeItem('rdr_promo');
  window.dispatchEvent(new Event('promoUpdated'));
};