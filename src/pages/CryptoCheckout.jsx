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

  // Auto-detect payment by monitoring wallet address for incoming transactions
  useEffect(() => {
    if (!walletAddress || paymentCleared) return;

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
  }, [walletAddress, selectedCrypto, cryptoAmount, finalTotal, paymentCleared]);

  // Poll for manual transaction ID verification
  useEffect(() => {
    if (!transactionId || paymentCleared) return;

    const pollPayment = async () => {
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Verify cryptocurrency transaction ID "${transactionId}" on ${selectedCrypto} blockchain. Confirm: 1) Transaction exists, 2) Received amount is ${cryptoAmount} ${selectedCrypto}, 3) Destination matches payment address, 4) Has at least 1 confirmation. Return JSON with "valid" (boolean - true only if all 4 criteria met), "confirmed" (boolean), and "error" (string or null).`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              confirmed: { type: 'boolean' },
              error: { type: ['string', 'null'] },
            },
            required: ['valid', 'confirmed', 'error'],
          },
        });

        if (result.valid && result.confirmed) {
          setPaymentCleared(true);
          setPaymentDetected(true);
          setTimeout(() => {
            window.location.href = `${createPageUrl('PaymentCompleted')}?txid=${encodeURIComponent(transactionId)}`;
          }, 1500);
        } else if (result.error) {
          console.error('Transaction validation error:', result.error);
        }
      } catch (error) {
        console.error('Error checking payment:', error);
      }
    };

    pollPayment();
    const interval = setInterval(pollPayment, 10000);
    return () => clearInterval(interval);
  }, [transactionId, selectedCrypto, cryptoAmount, paymentCleared]);



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

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-blue-400 mb-4">How This Works</h3>
          <div className="space-y-3 text-sm text-stone-300">
            <p>
              <span className="font-semibold text-blue-400">Step 1:</span> Choose your cryptocurrency and copy the payment address below.
            </p>
            <p>
              <span className="font-semibold text-blue-400">Step 2:</span> Send exactly the amount shown from your wallet. Make sure the amount matches perfectly.
            </p>
            <p>
              <span className="font-semibold text-blue-400">Step 3:</span> We have two ways to confirm your payment:
            </p>
            <ul className="ml-4 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">→</span>
                <span><strong>Automatic detection:</strong> Provide your wallet address and we'll watch for your payment automatically (fastest method).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">→</span>
                <span><strong>Manual verification:</strong> Paste your transaction ID and we'll verify it matches your order amount.</span>
              </li>
            </ul>
            <p className="text-xs text-stone-400 pt-2">
              Once confirmed, you'll be redirected to a success page and sent an email with your order details and tracking information.
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

            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-stone-300 block">Transaction ID <span className="text-red-600">*</span></label>
              <div className="relative">
                <Input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                  required
                />
                <Button
                  onClick={() => {
                    if (transactionId.trim()) {
                      const pollPayment = async () => {
                        try {
                          const result = await base44.integrations.Core.InvokeLLM({
                            prompt: `Validate this cryptocurrency transaction ID: "${transactionId}". Check if it exists on the blockchain AND verify the transaction amount matches exactly ${finalTotal.toFixed(2)} USD (or equivalent in ${selectedCrypto}). Return a JSON object with "valid" (boolean - true only if both transaction exists AND amount matches), "exists" (boolean), "amountMatches" (boolean), and "actualAmount" (number or null).`,
                            add_context_from_internet: true,
                            response_json_schema: {
                              type: 'object',
                              properties: {
                                valid: { type: 'boolean' },
                                exists: { type: 'boolean' },
                                amountMatches: { type: 'boolean' },
                                actualAmount: { type: ['number', 'null'] },
                              },
                              required: ['valid', 'exists', 'amountMatches', 'actualAmount'],
                            },
                          });

                          if (result.valid) {
                            setPaymentCleared(true);
                            setPaymentDetected(true);
                            setTimeout(() => {
                              window.location.href = `${createPageUrl('PaymentCompleted')}?txid=${encodeURIComponent(transactionId)}`;
                            }, 1500);
                          } else if (result.exists && !result.amountMatches) {
                            setPaymentDetected(true);
                            alert(`Transaction found but amount mismatch. Expected: $${finalTotal.toFixed(2)}, Actual: $${result.actualAmount || 'unknown'}`);
                          } else if (!result.exists) {
                            alert('Transaction ID not found on blockchain');
                          }
                        } catch (error) {
                          console.error('Error checking payment:', error);
                          alert('Failed to validate transaction. Please try again.');
                        }
                      };
                      pollPayment();
                    }
                  }}
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-700 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Check
                </Button>
              </div>
              <p className="text-xs text-stone-500">Required for order confirmation</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-300 block">Product Name <span className="text-red-600">*</span></label>
              <Input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
                className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                required
              />
              <p className="text-xs text-stone-500">Specify the product you're purchasing</p>
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

            {/* Payment Status */}
            {transactionId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 rounded-lg p-4 border ${
                  paymentCleared
                    ? 'bg-green-600/20 border-green-600/50'
                    : paymentDetected
                    ? 'bg-amber-600/20 border-amber-600/50'
                    : 'bg-stone-800/50 border-stone-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {paymentCleared ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-600">Payment Cleared</p>
                        <p className="text-xs text-green-600/80">Transaction confirmed on blockchain</p>
                      </div>
                    </>
                  ) : paymentDetected ? (
                    <>
                      <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                      <div>
                        <p className="font-semibold text-amber-600">Payment Detected</p>
                        <p className="text-xs text-amber-600/80">Waiting for blockchain confirmation...</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-stone-400" />
                      <div>
                        <p className="font-semibold text-stone-400">Checking for payment...</p>
                        <p className="text-xs text-stone-500">Auto-checking every 10 seconds</p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}


          </motion.div>
        </div>
      </div>
    </div>
  );
}