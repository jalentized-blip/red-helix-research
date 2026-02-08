import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getCart, removeFromCart, getCartTotal, clearCart, addPromoCode, getPromoCode, removePromoCode, getDiscountAmount, validatePromoCode } from '@/components/utils/cart';
import { Trash2, ShoppingBag, ArrowLeft, X, Check, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

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
    
    checkAuth();
    setCartItems(getCart());
    setAppliedPromo(getPromoCode());
    const handleCartUpdate = () => setCartItems(getCart());
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

  const handleClearCart = () => {
    clearCart();
    setCartItems([]);
  };

  const handleApplyPromo = () => {
    const promoDetails = validatePromoCode(promoCode);
    if (addPromoCode(promoCode)) {
      setAppliedPromo(promoCode.toUpperCase());
      setPromoCode('');
      setPromoError('');
      if (promoDetails?.isAffiliate) {
        setShowAffiliateMessage(true);
      }
    } else {
      setPromoError('Invalid promo code');
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
  const discount = appliedPromo ? getDiscountAmount(appliedPromo, subtotal) : 0;
  const finalTotal = subtotal - discount + SHIPPING_COST;

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 mb-6 font-bold">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-slate-100">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-6 font-semibold">Your research cart is empty</p>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-6 rounded-2xl shadow-lg shadow-red-600/20">
                Browse Peptides
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{item.productName}</h3>
                      <p className="text-slate-400 text-sm mt-1 font-bold uppercase tracking-wider">{item.specification}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-300 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-slate-500 font-bold">
                      <span className="text-sm">Quantity: {item.quantity}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-red-600">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase">${item.price} per unit</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-slate-50 border border-slate-100 rounded-[40px] p-8 sticky top-32 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Summary</h2>

                {/* Promo Code Section */}
                <div className="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  {showAffiliateMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 p-3 bg-red-50 border border-red-100 rounded-xl text-center"
                    >
                      <p className="text-xs font-bold text-red-600">
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
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-300 font-bold focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/20 transition-all"
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
                              className="bg-red-600 hover:bg-red-700 text-white font-bold h-full px-4 rounded-xl"
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
                    <div className="flex justify-between text-slate-900">
                      <span className="text-lg font-black uppercase tracking-tight">Total</span>
                      <span className="text-2xl font-black text-red-600">${finalTotal.toFixed(2)}</span>
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
                          className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-600 cursor-pointer"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider group-hover:text-slate-700 transition-colors">
                        I confirm that these products are for <span className="text-red-600">RESEARCH AND LABORATORY USE ONLY</span>. Not for human consumption.
                      </span>
                    </label>
                  </div>

                  {showAgreementError && (
                    <p className="text-red-600 text-[10px] font-black uppercase tracking-widest text-center animate-bounce">
                      Please confirm research use only terms
                    </p>
                  )}

                  <Button
                    onClick={() => {
                      if (!agreedToTerms) {
                        setShowAgreementError(true);
                        return;
                      }
                      if (!isAuthenticated) {
                        base44.auth.redirectToLogin(createPageUrl('Cart'));
                        return;
                      }
                      navigate(createPageUrl('CustomerInfo'));
                    }}
                    className={`w-full font-black py-8 rounded-2xl shadow-lg shadow-red-600/20 transition-all text-lg uppercase tracking-widest relative group ${agreedToTerms ? 'bg-red-600 hover:bg-red-700 text-white hover:scale-[1.02] active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                    Checkout <ArrowRight className="w-5 h-5 ml-2" />
                    {!isAuthenticated && !isCheckingAuth && (
                      <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl font-bold uppercase tracking-widest">
                        Please sign in to checkout
                      </span>
                    )}
                  </Button>

                <Button
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-red-600 font-bold text-xs uppercase tracking-widest mt-2"
                  onClick={handleClearCart}
                >
                  Clear Research Cart
                </Button>

                {/* Info Box */}
                <div className="mt-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
                  <p className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[10px]">✓</span> Same-day shipping
                  </p>
                  <p className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[10px]">✓</span> Lab tested purity
                  </p>
                  <p className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[10px]">✓</span> Secure Laboratory Supply
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}