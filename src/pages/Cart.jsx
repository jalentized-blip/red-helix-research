import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getCart, removeFromCart, updateCartQuantity, getCartTotal, clearCart, addPromoCode, addPromoCodeAsync, getPromoCode, removePromoCode, getDiscountAmount, validatePromoCode, validatePromoCodeAsync, loadAffiliateCodes, validateCartStock, hasMothersDay5AminoInCart, hasCustomerUsedPromo } from '@/components/utils/cart';
import { Trash2, ShoppingBag, ArrowLeft, X, Check, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import SEO from '@/components/SEO';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(getPromoCode());
  const [promoError, setPromoError] = useState('');
  const [promoFocused, setPromoFocused] = useState(false);
  const [showAffiliateMessage, setShowAffiliateMessage] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showAgreementError, setShowAgreementError] = useState(false);
  const [removedItems, setRemovedItems] = useState([]);
  const [isValidatingStock, setIsValidatingStock] = useState(false);
  const [promoReady, setPromoReady] = useState(false);
  const [mothersDayBundle, setMothersDayBundle] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    // Pre-load affiliate codes from DB so they validate at checkout
    loadAffiliateCodes(base44);

    // Re-hydrate welcome discount cache if a code is already stored
    // This ensures getDiscountAmount works correctly after page refresh
    const storedPromo = getPromoCode();
    if (storedPromo) {
      validatePromoCodeAsync(storedPromo, base44).then(() => {
        setPromoReady(true); // trigger re-render now that cache is populated
      });
    } else {
      setPromoReady(true);
    }

    checkAuth();
    setCartItems(getCart());
    setAppliedPromo(getPromoCode());

    // Auto-apply MOTHERSDAY bundle if 5 Amino 1 MQ 5mg is in cart and code not expired
    const checkMothersDay = () => {
      if (hasMothersDay5AminoInCart()) {
        const existing = getPromoCode();
        if (!existing) {
          addPromoCode('MOTHERSDAY');
          setAppliedPromo('MOTHERSDAY');
          setMothersDayBundle(true);
        } else if (existing === 'MOTHERSDAY') {
          setMothersDayBundle(true);
        }
      } else {
        // If they removed the qualifying item, remove the auto-applied MOTHERSDAY code
        if (getPromoCode() === 'MOTHERSDAY') {
          removePromoCode();
          setAppliedPromo(null);
        }
        setMothersDayBundle(false);
      }
    };
    checkMothersDay();

    // Validate cart stock — auto-remove out-of-stock items
    setIsValidatingStock(true);
    validateCartStock(base44).then(({ removed }) => {
      if (removed.length > 0) {
        setCartItems(getCart());
        setRemovedItems(removed);
      }
    }).finally(() => setIsValidatingStock(false));
    const handleCartUpdate = () => {
      setCartItems(getCart());
      // Re-check bundle eligibility when cart changes
      if (hasMothersDay5AminoInCart()) {
        const existing = getPromoCode();
        if (!existing) {
          addPromoCode('MOTHERSDAY');
          setAppliedPromo('MOTHERSDAY');
          setMothersDayBundle(true);
        } else if (existing === 'MOTHERSDAY') {
          setMothersDayBundle(true);
        }
      } else {
        if (getPromoCode() === 'MOTHERSDAY') {
          removePromoCode();
          setAppliedPromo(null);
        }
        setMothersDayBundle(false);
      }
    };
    const handlePromoUpdate = () => setAppliedPromo(getPromoCode());
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('promoUpdated', handlePromoUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('promoUpdated', handlePromoUpdate);
    };
  }, []);

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
    setCartItems(getCart());
  };

  const handleUpdateQuantity = (itemId, newQty) => {
    updateCartQuantity(itemId, newQty);
    setCartItems(getCart());
  };

  const handleClearCart = () => {
    clearCart();
    setCartItems([]);
  };

  const handleApplyPromo = async () => {
    const upperCode = promoCode.toUpperCase();
    // Check 1-per-IP limit for one-time promos like MOTHERSDAY
    if (upperCode === 'MOTHERSDAY') {
      const alreadyUsed = await hasCustomerUsedPromo(upperCode);
      if (alreadyUsed) {
        setPromoError('This promo code has already been used on a previous order');
        return;
      }
    }
    // Try async validation first (checks DB affiliate codes + WelcomeDiscount table)
    const promoDetails = await validatePromoCodeAsync(promoCode, base44);
    if (promoDetails) {
      await addPromoCodeAsync(promoCode, base44);
      setAppliedPromo(upperCode);
      setPromoReady(true);
      setPromoCode('');
      setPromoError('');
      if (promoDetails?.isAffiliate) {
        setShowAffiliateMessage(true);
      }
    } else {
      setPromoError('Invalid or expired promo code');
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setAppliedPromo(null);
    setPromoError('');
    setShowAffiliateMessage(false);
  };

  const SHIPPING_COST = 15.00;
  const subtotal = getCartTotal();
  // promoReady ensures we only compute discount after the async cache is populated
  const discount = (appliedPromo && promoReady) ? getDiscountAmount(appliedPromo, subtotal) : 0;
  const finalTotal = subtotal - discount + SHIPPING_COST;

  return (
    <div className="min-h-screen bg-white pt-24 lg:pt-32 pb-20 px-4">
      <SEO
        title="Shopping Cart"
        description="Review your research peptide order before checkout."
        noindex={true}
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-[#8B2635] hover:text-[#6B1827] mb-6 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" />
            ← Continue Shopping
          </Link>
          <h1 className="text-4xl font-black text-black uppercase tracking-tight mb-6">Your Cart</h1>

          {/* Checkout Steps */}
          {cartItems.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#8B2635] text-white text-xs font-black flex items-center justify-center">1</div>
                <span className="text-xs font-bold text-[#8B2635]">Cart</span>
              </div>
              <div className="flex-1 h-px bg-slate-200 mx-1 max-w-[60px]" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-400 text-xs font-black flex items-center justify-center">2</div>
                <span className="text-xs font-bold text-slate-400">Your Info</span>
              </div>
              <div className="flex-1 h-px bg-slate-200 mx-1 max-w-[60px]" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-400 text-xs font-black flex items-center justify-center">3</div>
                <span className="text-xs font-bold text-slate-400">Payment</span>
              </div>
            </div>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl md:rounded-[40px] border border-slate-100">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2 font-semibold">Your cart is empty</p>
            <p className="text-slate-400 text-sm mb-6">Add a product from the shop to get started.</p>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-[#8B2635] hover:bg-[#6B1827] text-white font-bold px-8 py-6 rounded-2xl shadow-lg shadow-[#8B2635]/20">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {removedItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-amber-800 uppercase tracking-wide mb-1">⚠ Items Removed from Cart</p>
                      <p className="text-xs text-amber-700 mb-2">The following items are no longer available and were removed:</p>
                      <ul className="space-y-1">
                        {removedItems.map((name, i) => (
                          <li key={i} className="text-xs font-bold text-amber-800">• {name}</li>
                        ))}
                      </ul>
                    </div>
                    <button onClick={() => setRemovedItems([])} className="text-amber-500 hover:text-amber-700 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white border border-slate-100 rounded-2xl md:rounded-[32px] p-4 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-black">{item.productName}</h3>
                      <p className="text-slate-400 text-sm mt-1 font-bold uppercase tracking-wider">{item.specification}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-[#ef4444] hover:text-[#8B2635] transition-colors p-2 hover:bg-[#fef2f2] rounded-xl"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black hover:border-[#8B2635] hover:text-[#8B2635] transition-colors text-lg"
                      >−</button>
                      <span className="w-6 text-center font-black text-black text-lg">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black hover:border-[#8B2635] hover:text-[#8B2635] transition-colors text-lg"
                      >+</button>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#8B2635]">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase">${item.price} per unit</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl md:rounded-[40px] p-5 md:p-8 sticky top-24 lg:top-32 shadow-sm">
                <h2 className="text-xl font-black text-black mb-6 uppercase tracking-tight">Summary</h2>

                {/* Mother's Day Bundle Banner */}
                {mothersDayBundle && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-pink-50 border border-pink-200 rounded-2xl text-center"
                  >
                    <p className="text-sm font-black text-pink-700 mb-0.5">🌸 Mother's Day Bundle Applied!</p>
                    <p className="text-xs text-pink-600 font-medium">10% off automatically applied for your 5 Amino 1 MQ 5mg order</p>
                  </motion.div>
                )}

                {/* Promo Code Section */}
                <div className="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  {showAffiliateMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 p-3 bg-[#8B2635] border border-[#ef4444] rounded-xl text-center"
                    >
                      <p className="text-xs font-bold text-white">
                        Affiliate discount applied! 💜
                      </p>
                    </motion.div>
                  )}
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-black text-green-600">{appliedPromo}</span>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-green-600 hover:text-green-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Promo Code</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase());
                            setPromoError('');
                          }}
                          onFocus={() => setPromoFocused(true)}
                          onBlur={() => setPromoFocused(false)}
                          placeholder="CODE"
                          className="min-w-0 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-black placeholder-slate-300 font-bold focus:outline-none focus:border-[#8B2635] focus:ring-1 focus:ring-[#8B2635]/20 transition-all"
                        />
                        {(promoCode || promoFocused) && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Button
                              onClick={handleApplyPromo}
                              size="sm"
                              className="bg-[#8B2635] hover:bg-[#6B1827] text-white font-bold h-full px-4 rounded-xl"
                            >
                              Apply
                            </Button>
                          </motion.div>
                        )}
                      </div>
                      {promoError && (
                        <p className="text-xs text-red-500">{promoError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Pricing Details */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-slate-500 font-bold uppercase tracking-wider text-xs">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-bold uppercase tracking-wider text-xs">
                    <span>Shipping Fee</span>
                    <span>${SHIPPING_COST.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold uppercase tracking-wider text-xs">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between text-black">
                      <span className="text-lg font-black uppercase tracking-tight">Total</span>
                      <span className="text-2xl font-black text-[#8B2635]">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Agreement and Checkout */}
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => {
                            setAgreedToTerms(e.target.checked);
                            setShowAgreementError(false);
                          }}
                          className="w-5 h-5 rounded border-slate-300 text-[#8B2635] focus:ring-[#8B2635] cursor-pointer"
                        />
                      </div>
                      <span className="text-sm text-slate-600 font-medium leading-relaxed group-hover:text-slate-800 transition-colors">
                        I confirm these products are for <span className="text-[#8B2635] font-bold">research and laboratory use only</span> — not for human consumption.
                      </span>
                    </label>
                  </div>

                  {showAgreementError && (
                    <p className="text-[#8B2635] text-[10px] font-black uppercase tracking-widest text-center animate-bounce">
                      Please confirm research use only terms
                    </p>
                  )}

                  <Button
                  onClick={async () => {
                    if (!agreedToTerms) {
                      setShowAgreementError(true);
                      return;
                    }
                    // Re-validate stock right before checkout as final failsafe
                    setIsValidatingStock(true);
                    const { removed } = await validateCartStock(base44);
                    setIsValidatingStock(false);
                    if (removed.length > 0) {
                      setCartItems(getCart());
                      setRemovedItems(removed);
                      return; // Stop checkout — let user review
                    }
                    const freshCart = getCart();
                    if (freshCart.length === 0) return; // Cart emptied — don't proceed
                    // Meta Pixel: InitiateCheckout event
                    if (typeof window !== 'undefined' && window.fbq) {
                      window.fbq('track', 'InitiateCheckout', {
                        value: finalTotal,
                        currency: 'USD',
                        num_items: freshCart.length,
                        content_ids: freshCart.map(i => i.productId),
                      });
                    }
                    navigate(createPageUrl('CustomerInfo'));
                  }}
                  disabled={isValidatingStock}
                  className={`w-full font-black py-4 rounded-2xl shadow-lg shadow-[#8B2635]/20 transition-all text-base relative group ${isValidatingStock ? 'bg-slate-200 text-slate-400 cursor-wait' : agreedToTerms ? 'bg-[#8B2635] hover:bg-[#6B1827] text-white hover:scale-[1.02] active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                  {isValidatingStock ? 'Checking availability...' : <>Proceed to Checkout <ArrowRight className="w-4 h-4 ml-1" /></>}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full text-slate-400 hover:text-[#8B2635] font-bold text-xs uppercase tracking-widest mt-2"
                    onClick={handleClearCart}
                  >
                    Clear Cart
                  </Button>

                  {/* Info Box */}
                  <div className="mt-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
                    <p className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[10px] flex-shrink-0">✓</span> Same-day shipping on most orders
                    </p>
                    <p className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[10px] flex-shrink-0">✓</span> 99%+ purity, lab tested
                    </p>
                    <p className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[10px] flex-shrink-0">✓</span> Secure, encrypted checkout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}