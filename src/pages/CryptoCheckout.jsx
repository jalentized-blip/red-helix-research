import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Copy, Check, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { getCartTotal, getPromoCode, getDiscountAmount } from '@/components/utils/cart';
import { base44 } from '@/api/base44Client';

export default function CryptoCheckout() {
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [copied, setCopied] = useState(false);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(true);

  const SHIPPING_COST = 15.00;
  const subtotal = getCartTotal();
  const appliedPromo = getPromoCode();
  const discount = appliedPromo ? getDiscountAmount(appliedPromo, subtotal) : 0;
  const finalTotal = subtotal - discount + SHIPPING_COST;

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: 'Get the current exchange rates for BTC, ETH, USDT, and USDC in USD. Return ONLY a JSON object with keys "BTC", "ETH", "USDT", "USDC" and their current USD values as numbers.',
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              BTC: { type: 'number' },
              ETH: { type: 'number' },
              USDT: { type: 'number' },
              USDC: { type: 'number' },
            },
            required: ['BTC', 'ETH', 'USDT', 'USDC'],
          },
        });
        setExchangeRates(result);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        // Fallback rates if API fails
        setExchangeRates({
          BTC: 42500,
          ETH: 2500,
          USDT: 1,
          USDC: 1,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  const cryptoAmount = exchangeRates ? (finalTotal / exchangeRates[selectedCrypto]).toFixed(8) : '0';
  const paymentAddress = '1A1z7agoat2GPFH7g2oh3KfsTUxfzAXXXX'; // Placeholder address

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(paymentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Cart')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <h1 className="text-4xl font-black text-amber-50">Crypto Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900/50 border border-stone-700 rounded-lg p-6 space-y-6"
          >
            {loading && (
              <div className="flex items-center justify-center gap-2 text-stone-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Fetching live exchange rates...</span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-amber-50 mb-4">Payment Method</h2>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-300 block">Select Cryptocurrency</label>
                <div className="grid grid-cols-2 gap-2">
                  {exchangeRates && Object.keys(exchangeRates).map((crypto) => (
                    <button
                      key={crypto}
                      onClick={() => setSelectedCrypto(crypto)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedCrypto === crypto
                          ? 'border-red-600 bg-red-600/20 text-red-600 font-semibold'
                          : 'border-stone-700 bg-stone-800/50 text-stone-300 hover:border-red-600/50'
                      }`}
                    >
                      {crypto}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-amber-50 mb-3">Amount to Send</h3>
              <div className="bg-stone-800/50 border border-stone-700 rounded-lg p-4">
                <p className="text-sm text-stone-400 mb-1">Pay exactly:</p>
                <p className="text-3xl font-black text-red-600 font-mono">{cryptoAmount}</p>
                <p className="text-xs text-stone-500 mt-2">{selectedCrypto}</p>
                <p className="text-xs text-stone-400 mt-1">≈ ${finalTotal.toFixed(2)} USD</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-amber-50 mb-3">Send to Address</h3>
              <div className="bg-stone-800/50 border border-stone-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <code className="text-xs text-stone-300 break-all flex-1">{paymentAddress}</code>
                  <button
                    onClick={handleCopyAddress}
                    className="p-2 hover:bg-stone-700 rounded transition-colors flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-stone-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
              <p className="text-sm text-amber-600">
                ⚠️ Send the exact amount from the address above. Incorrect amounts or addresses may result in lost funds.
              </p>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-stone-900/50 border border-stone-700 rounded-lg p-6 sticky top-32 h-fit"
          >
            <h2 className="text-xl font-bold text-amber-50 mb-6">Order Summary</h2>

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
                <span>Shipping</span>
                <span>${SHIPPING_COST.toFixed(2)}</span>
              </div>
              <div className="border-t border-stone-700 pt-3 flex justify-between text-amber-50 font-bold text-lg">
                <span>Total (USD)</span>
                <span className="text-red-600">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-stone-800/50 rounded-lg p-4 space-y-2 mb-6">
              <p className="text-sm font-semibold text-stone-300">Crypto Amount</p>
              <p className="text-2xl font-black text-red-600 font-mono">{cryptoAmount}</p>
              <p className="text-xs text-stone-400">{selectedCrypto}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-300 block">Your Wallet Address (Optional)</label>
              <Input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="For order updates"
                className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
              />
              <p className="text-xs text-stone-500">Provide your wallet to track the order</p>
            </div>

            <div className="mt-6 bg-stone-800/50 rounded-lg p-4 text-xs text-stone-400 space-y-2">
              <p className="flex items-center gap-2">
                <span className="text-red-600">✓</span> Same-day shipping
              </p>
              <p className="flex items-center gap-2">
                <span className="text-red-600">✓</span> Lab tested products
              </p>
              <p className="flex items-center gap-2">
                <span className="text-red-600">✓</span> Confirmation via email
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}