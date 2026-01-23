import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getCart, removeFromCart, getCartTotal, clearCart, addPromoCode, getPromoCode, removePromoCode, getDiscountAmount, validatePromoCode } from '@/components/utils/cart';
import { Trash2, ShoppingBag, ArrowLeft, X, Check, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(getPromoCode());
  const [promoError, setPromoError] = useState('');
  const [promoFocused, setPromoFocused] = useState(false);

  useEffect(() => {
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
    if (addPromoCode(promoCode)) {
      setAppliedPromo(promoCode.toUpperCase());
      setPromoCode('');
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setAppliedPromo(null);
    setPromoError('');
  };

  const SHIPPING_COST = 15.00;
  const subtotal = getCartTotal();
  const discount = appliedPromo ? getDiscountAmount(appliedPromo, subtotal) : 0;
  const finalTotal = subtotal - discount + SHIPPING_COST;

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <h1 className="text-4xl font-black text-amber-50">Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-stone-600 mx-auto mb-4" />
            <p className="text-stone-400 text-lg mb-6">Your cart is empty</p>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-red-700 hover:bg-red-600 text-amber-50">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-stone-900/50 border border-stone-700 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-amber-50">{item.productName}</h3>
                      <p className="text-stone-400 text-sm mt-1">{item.specification}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-stone-300">
                      <span className="text-sm">Qty: {item.quantity}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-stone-400">${item.price} each</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-6 sticky top-32">
                <h2 className="text-xl font-bold text-amber-50 mb-6">Order Summary</h2>

                {/* Promo Code Section */}
                <div className="mb-6 p-4 bg-stone-800/50 rounded-lg">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-green-600/20 border border-green-600/50 rounded p-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">{appliedPromo}</span>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-green-600 hover:text-green-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-stone-300 block">Promo Code</label>
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
                          placeholder="Enter code"
                          className="flex-1 bg-stone-700 border border-stone-600 rounded px-3 py-2 text-sm text-amber-50 placeholder-stone-500 focus:outline-none focus:border-red-600"
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
                              className="bg-red-700 hover:bg-red-600 text-amber-50"
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

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-stone-300">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-300">
                    <span>FedEx Shipping</span>
                    <span>${SHIPPING_COST.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-stone-700 pt-3 flex justify-between text-amber-50 font-bold text-lg">
                    <span>Total</span>
                    <span className="text-red-600">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate(createPageUrl('CustomerInfo'))}
                  className="w-full bg-red-700 hover:bg-red-600 text-amber-50 font-semibold py-6 mb-3 gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-stone-700 text-stone-300 hover:text-red-600"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </Button>

                {/* Info Box */}
                <div className="mt-6 bg-stone-800/50 rounded-lg p-4 text-xs text-stone-400 space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="text-red-600">✓</span> Same-day shipping
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-red-600">✓</span> Lab tested products
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-red-600">✓</span> Money-back guarantee
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