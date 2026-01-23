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

// Promo codes - manage from here
const PROMO_CODES = {
  'SAVE10': { discount: 0.10, label: '10% off' },
  'SAVE20': { discount: 0.20, label: '20% off' },
  'WELCOME': { discount: 0.15, label: '15% off first order' },
  'FIRSTDAY15': { discount: 0.15, label: '15% off' },
};

export const validatePromoCode = (code) => {
  return PROMO_CODES[code.toUpperCase()] || null;
};

export const getDiscountAmount = (code, total) => {
  const promo = validatePromoCode(code);
  return promo ? total * promo.discount : 0;
};

export const addPromoCode = (code) => {
  if (validatePromoCode(code)) {
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