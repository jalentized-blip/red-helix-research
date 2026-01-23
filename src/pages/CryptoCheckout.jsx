import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { getCartTotal, getPromoCode, getDiscountAmount } from '@/components/utils/cart';
import { base44 } from '@/api/base44Client';

export default function CryptoCheckout() {
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [productName, setProductName] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [copied, setCopied] = useState(false);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentDetected, setPaymentDetected] = useState(false);
  const [paymentCleared, setPaymentCleared] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formApplied, setFormApplied] = useState(false);

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

  // Calculate progress based on transaction stages
  let progress = 0;
  if (walletAddress) progress = 25;
  if (transactionId) progress = 50;
  if (paymentDetected) progress = 75;
  if (paymentCleared) progress = 100;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(paymentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyForm = () => {
    setFormApplied(true);
  };

  const handleCancelForm = () => {
    setFormApplied(false);
    setPaymentDetected(false);
    setPaymentCleared(false);
  };

  // Auto-detect payment by monitoring wallet address for incoming transactions
  useEffect(() => {
    if (!walletAddress || !formApplied || paymentCleared) return;

    const pollWalletPayment = async () => {
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Monitor the ${selectedCrypto} wallet address "${walletAddress}" for incoming transactions. Check if any transaction has been received in the last 30 minutes with an amount equal to or greater than ${cryptoAmount} ${selectedCrypto} (≈$${finalTotal.toFixed(2)} USD). Return a JSON object with "paymentDetected" (boolean), "transactionId" (string or null), "amount" (number or null), "confirmed" (boolean), and "confirmations" (number or null). Only return true if amount matches and has at least 1 confirmation.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              paymentDetected: { type: 'boolean' },
              transactionId: { type: ['string', 'null'] },
              amount: { type: ['number', 'null'] },
              confirmed: { type: 'boolean' },
              confirmations: { type: ['number', 'null'] },
            },
            required: ['paymentDetected', 'transactionId', 'amount', 'confirmed', 'confirmations'],
          },
        });

        if (result.paymentDetected && result.transactionId) {
          setTransactionId(result.transactionId);
          setPaymentDetected(true);
          if (result.confirmed && result.confirmations >= 1) {
            setPaymentCleared(true);
            setTimeout(() => {
              window.location.href = `${createPageUrl('PaymentCompleted')}?txid=${encodeURIComponent(result.transactionId)}`;
            }, 1500);
          }
        }
      } catch (error) {
        console.error('Error monitoring wallet:', error);
      }
    };

    pollWalletPayment();
    const interval = setInterval(pollWalletPayment, 8000);
    return () => clearInterval(interval);
  }, [walletAddress, selectedCrypto, cryptoAmount, finalTotal, paymentCleared, formApplied]);

  // Auto-verify transaction ID when entered
  useEffect(() => {
    if (!transactionId || !formApplied || paymentCleared) return;

    const pollTransactionId = async () => {
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Verify cryptocurrency transaction ID "${transactionId}" on ${selectedCrypto} blockchain. Confirm: 1) Transaction exists, 2) Received amount equals exactly ${cryptoAmount} ${selectedCrypto} (or ~${finalTotal.toFixed(2)} USD), 3) Has at least 1 confirmation. Return JSON with "valid" (boolean - true only if all 3 criteria met), "confirmed" (boolean), "amount" (number or null), and "error" (string or null).`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              confirmed: { type: 'boolean' },
              amount: { type: ['number', 'null'] },
              error: { type: ['string', 'null'] },
            },
            required: ['valid', 'confirmed', 'amount', 'error'],
          },
        });

        if (result.valid && result.confirmed) {
          setPaymentCleared(true);
          setPaymentDetected(true);
          setTimeout(() => {
            window.location.href = `${createPageUrl('PaymentCompleted')}?txid=${encodeURIComponent(transactionId)}`;
          }, 1500);
        } else if (result.amount && result.amount !== parseFloat(cryptoAmount)) {
          setPaymentDetected(true);
        }
      } catch (error) {
        console.error('Error verifying transaction:', error);
      }
    };

    pollTransactionId();
    const interval = setInterval(pollTransactionId, 10000);
    return () => clearInterval(interval);
  }, [transactionId, selectedCrypto, cryptoAmount, finalTotal, paymentCleared]);





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

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-blue-400 mb-4">How It Works</h3>
          <div className="space-y-3 text-sm text-stone-300">
            <p>
              <span className="font-semibold text-blue-400">1.</span> Choose your cryptocurrency type.
            </p>
            <p>
              <span className="font-semibold text-blue-400">2.</span> Copy the payment address and send exactly the amount shown.
            </p>
            <p>
              <span className="font-semibold text-blue-400">3.</span> Enter your wallet address so we can automatically detect your payment.
            </p>
            <p>
              <span className="font-semibold text-blue-400">4.</span> We verify the transaction on the blockchain and automatically confirm your order. You'll be redirected and sent a confirmation email.
            </p>
            <p className="text-xs text-amber-600 pt-2 font-semibold">
              ⚠️ Payment detection works best when sending from a single wallet address. Make sure the sending address exactly matches what you enter.
            </p>
          </div>
        </motion.div>

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
              <label className="text-sm font-semibold text-stone-300 block">Your Wallet Address <span className="text-red-600">*</span></label>
              <Input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Your sending wallet address"
                className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                required
              />
              <p className="text-xs text-stone-500">We'll automatically detect your payment from this wallet</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-300 block">Transaction ID <span className="text-red-600">*</span></label>
              <Input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Paste your transaction ID"
                className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                required
              />
              <p className="text-xs text-stone-500">Auto-verified against blockchain</p>
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

          {/* Progress Bar */}
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-stone-900/50 border border-stone-700 rounded-lg p-6"
          >
          <div className="mb-4">
          <p className="text-sm font-semibold text-stone-300 mb-2">Transaction Progress</p>
          <div className="w-full bg-stone-800 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`h-full transition-colors ${
                paymentCleared
                  ? 'bg-green-600'
                  : paymentDetected
                  ? 'bg-amber-600'
                  : 'bg-red-600'
              }`}
            />
          </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
          <div className={`text-center ${walletAddress ? 'text-amber-50' : 'text-stone-500'}`}>
            <p className="font-semibold">Wallet</p>
            <p>25%</p>
          </div>
          <div className={`text-center ${transactionId ? 'text-amber-50' : 'text-stone-500'}`}>
            <p className="font-semibold">TX ID</p>
            <p>50%</p>
          </div>
          <div className={`text-center ${paymentDetected ? 'text-amber-50' : 'text-stone-500'}`}>
            <p className="font-semibold">Detected</p>
            <p>75%</p>
          </div>
          <div className={`text-center ${paymentCleared ? 'text-green-600' : 'text-stone-500'}`}>
            <p className="font-semibold">Confirmed</p>
            <p>100%</p>
          </div>
          </div>
          </motion.div>
          </div>
          );
          }