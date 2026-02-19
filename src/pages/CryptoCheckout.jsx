import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Copy,
  Check,
  AlertCircle,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Shield,
  Clock,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Smartphone,
  QrCode,
  ShieldCheck,
  Lock,
  LinkIcon,
  Info,
  CreditCard,
  Mail,
  Send,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getCart,
  getCartTotal,
  clearCart,
  getPromoCode,
  getDiscountAmount,
  getAffiliateInfo,
  resolveAffiliateInfo,
  validatePromoCode,
  loadAffiliateCodes,
  validateCartStock
} from '@/components/utils/cart';
import { trackPurchase } from '@/utils/hubspotAnalytics';
import { base44 } from '@/api/base44Client';
import { recordAffiliateOrder } from '@/components/utils/affiliateStore';
import PCIComplianceBadge from '@/components/PCIComplianceBadge';
import PlaidACHCheckout from '@/components/payment/PlaidACHCheckout';
import TurnstileWidget from '@/components/TurnstileWidget';

// Payment wallet addresses
const PAYMENT_ADDRESSES = {
  BTC: '3BuLwoGXiWx56RD7GsP98Nu6i9G2igYHss',
  ETH: '0x30eD305B89b6207A5fa907575B395c9189728EbC',
  USDT: '0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c',
  USDC: '0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c',
};

const CRYPTO_OPTIONS = [
  {
    id: 'USDT',
    name: 'Tether (USDT)',
    symbol: 'USDT',
    icon: '₮',
    color: '#26A17B',
    network: 'Ethereum (ERC-20)',
    minConfirmations: 12,
    isStablecoin: true,
    description: 'Stablecoin — always $1.00',
    badge: 'Easiest',
  },
  {
    id: 'USDC',
    name: 'USD Coin (USDC)',
    symbol: 'USDC',
    icon: '$',
    color: '#2775CA',
    network: 'Ethereum (ERC-20)',
    minConfirmations: 12,
    isStablecoin: true,
    description: 'Stablecoin — always $1.00',
    badge: 'Popular',
  },
  {
    id: 'BTC',
    name: 'Bitcoin (BTC)',
    symbol: 'BTC',
    icon: '₿',
    color: '#F7931A',
    network: 'Bitcoin Network',
    minConfirmations: 3,
    isStablecoin: false,
    description: 'The original cryptocurrency',
    badge: null,
  },
  {
    id: 'ETH',
    name: 'Ethereum (ETH)',
    symbol: 'ETH',
    icon: 'Ξ',
    color: '#627EEA',
    network: 'Ethereum Mainnet',
    minConfirmations: 12,
    isStablecoin: false,
    description: 'Smart contract platform',
    badge: null,
  },
];

const SHIPPING_COST = 15.00;

// Simple step indicator
function StepIndicator({ currentStep }) {
  const steps = [
    { num: 1, label: 'Choose Coin' },
    { num: 2, label: 'Send Payment' },
    { num: 3, label: 'Confirm' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((step, i) => (
        <React.Fragment key={step.num}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${
              currentStep === step.num
                ? 'bg-[#dc2626] text-white scale-110 shadow-lg shadow-red-200'
                : currentStep > step.num
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 text-slate-400'
            }`}>
              {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${
              currentStep === step.num ? 'text-slate-900' : 'text-slate-400'
            }`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 sm:w-12 h-0.5 rounded-full ${
              currentStep > step.num ? 'bg-green-500' : 'bg-slate-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Beginner help tooltip
function HelpTip({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors ml-1"
      >
        <HelpCircle className="w-3 h-3 text-slate-500" />
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-xl">
          {children}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
        </div>
      )}
    </span>
  );
}

export default function CryptoCheckout() {
  const navigate = useNavigate();

  // Data
  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [promoCode, setPromoCode] = useState(null);

  // Stable order number — generated once, persists across re-renders
  const orderNumberRef = useRef(null);
  if (!orderNumberRef.current) {
    orderNumberRef.current = `RDR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  // Flow: 'select_method' | 'pick_coin' | 'send_payment' | 'confirm' | 'bank_ach' | 'square_payment' | 'completed' | 'failed'
  const [step, setStep] = useState('select_method');
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [cryptoAmount, setCryptoAmount] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  // Transaction
  const [transactionId, setTransactionId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // UI
  const [copied, setCopied] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);
  const [showNewTooltip, setShowNewTooltip] = useState(false);

  // Square payment link
  const [squareEmail, setSquareEmail] = useState('');
  const [squareSending, setSquareSending] = useState(false);
  const [squareSent, setSquareSent] = useState(false);
  const [squareError, setSquareError] = useState('');
  const [showSquareDisclaimer, setShowSquareDisclaimer] = useState(false);
  const [squareDisclaimerAccepted, setSquareDisclaimerAccepted] = useState(false);
  const [squareRefundPolicyAccepted, setSquareRefundPolicyAccepted] = useState(false);
  const [consentTimestamp, setConsentTimestamp] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState(null);

  const txVerifyRef = useRef(null);

  // Timer for rate expiration
  useEffect(() => {
    if (step === 'send_payment') {
      setTimeLeft(900);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Redirect on completion
  useEffect(() => {
    if (step === 'completed') {
      const orderNumber = localStorage.getItem('lastOrderNumber');
      const txHash = localStorage.getItem('lastTransactionId');
      const timer = setTimeout(() => {
        window.location.href = `${createPageUrl('PaymentCompleted')}?txid=${txHash}&order=${orderNumber}`;
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Init
  useEffect(() => {
    const init = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        if (!authenticated) {
          base44.auth.redirectToLogin(createPageUrl('Cart'));
          return;
        }
      } catch {
        base44.auth.redirectToLogin(createPageUrl('Cart'));
        return;
      }

      const cart = getCart();
      const customer = JSON.parse(localStorage.getItem('customerInfo') || 'null');
      const promo = getPromoCode();

      if (cart.length === 0) { navigate(createPageUrl('Cart')); return; }
      if (!customer) { navigate(createPageUrl('CustomerInfo')); return; }

      // Validate stock — remove out-of-stock items before checkout
      try {
        const removed = await validateCartStock(base44);
        if (removed.length > 0) {
          const updatedCart = getCart();
          if (updatedCart.length === 0) {
            alert('All items in your cart are no longer available. Redirecting to cart.');
            navigate(createPageUrl('Cart'));
            return;
          }
          alert('The following items were removed because they are no longer available:\n\n' + removed.join('\n'));
        }
      } catch (_) {}

      setCartItems(getCart());
      setCustomerInfo(customer);
      setPromoCode(promo);
      if (customer?.email) setSquareEmail(customer.email);
    };
    init();
  }, [navigate]);

  // Fetch exchange rate
  useEffect(() => {
    if (!selectedCrypto) return;
    const crypto = CRYPTO_OPTIONS.find(c => c.id === selectedCrypto);

    const fetchRate = async () => {
      setIsLoadingRate(true);
      if (crypto?.isStablecoin) {
        setExchangeRate(1);
        setCryptoAmount(totalUSD.toFixed(2));
        setIsLoadingRate(false);
        return;
      }

      try {
        const coinIds = { BTC: 'bitcoin', ETH: 'ethereum' };
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds[selectedCrypto]}&vs_currencies=usd`);
        const data = await response.json();
        const rate = data[coinIds[selectedCrypto]]?.usd;
        if (rate) {
          setExchangeRate(rate);
          setCryptoAmount((totalUSD / rate).toFixed(8));
        } else throw new Error('Rate not found');
      } catch {
        const fallback = { BTC: 95000, ETH: 3200 };
        const rate = fallback[selectedCrypto] || 1;
        setExchangeRate(rate);
        setCryptoAmount((totalUSD / rate).toFixed(8));
      }
      setIsLoadingRate(false);
    };

    fetchRate();
  }, [selectedCrypto]);

  // Auto-verify transaction
  useEffect(() => {
    if (!transactionId || verificationStatus === 'verified' || step !== 'confirm') return;

    txVerifyRef.current = setInterval(async () => {
      await verifyTransaction(transactionId);
    }, 10000);
    verifyTransaction(transactionId);

    return () => { if (txVerifyRef.current) clearInterval(txVerifyRef.current); };
  }, [transactionId, step]);

  // Calculate totals
  const subtotal = getCartTotal();
  const discount = promoCode ? getDiscountAmount(promoCode, subtotal) : 0;
  const totalUSD = subtotal - discount + SHIPPING_COST;

  const verifyTransaction = async (txHash) => {
    setVerificationStatus('checking');
    setVerificationMessage('Checking the blockchain for your payment...');

    try {
      const result = await base44.functions.invoke('verifyCryptoTransaction', {
        txHash,
        crypto: selectedCrypto,
        expectedAmount: parseFloat(cryptoAmount)
      });

      if (result?.verified && result?.status === 'confirmed') {
        setVerificationStatus('verified');
        setVerificationMessage('Payment confirmed!');
        clearInterval(txVerifyRef.current);
        await processSuccessfulPayment(txHash);
      } else if (result?.status === 'pending') {
        const crypto = CRYPTO_OPTIONS.find(c => c.id === selectedCrypto);
        setVerificationMessage(`Waiting for network confirmations (${result.confirmations || 0}/${crypto?.minConfirmations || 3})... This can take a few minutes.`);
      } else if (result?.status === 'failed') {
        setVerificationStatus('failed');
        setVerificationMessage(result.message || 'We couldn\'t verify this transaction. Please double-check your transaction ID.');
      }
    } catch {
      setRetryCount(prev => prev + 1);
      if (retryCount >= 3) {
        setVerificationMessage('Having trouble verifying. Please contact support with your transaction ID.');
      }
    }
  };

  const processSuccessfulPayment = async (txHash, method = 'cryptocurrency') => {
    setStep('completed');

    try {
      const orderNumber = `RDR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      let userEmail = null;
      try { const user = await base44.auth.me(); userEmail = user?.email; } catch {}

      const customerName = customerInfo?.firstName && customerInfo?.lastName
        ? `${customerInfo.firstName} ${customerInfo.lastName}`
        : customerInfo?.name || 'Guest Customer';

      const affiliateInfo = await resolveAffiliateInfo();

      // Update stock
      const products = await base44.entities.Product.list();
      for (const item of cartItems) {
        const product = products.find(p => p.name === item.productName);
        if (product) {
          const updatedSpecs = product.specifications.map(spec => {
            if (spec.name === item.specification) {
              return {
                ...spec,
                stock_quantity: Math.max(0, (spec.stock_quantity || 0) - item.quantity),
                in_stock: (spec.stock_quantity || 0) - item.quantity > 0
              };
            }
            return spec;
          });
          const allOutOfStock = updatedSpecs.every(spec => !spec.in_stock);
          await base44.entities.Product.update(product.id, {
            specifications: updatedSpecs,
            in_stock: !allOutOfStock
          });
        }
      }

      // Build order
      const orderPayload = {
        order_number: orderNumber,
        customer_email: userEmail || customerInfo?.email || 'guest@redhelix.com',
        customer_name: customerName,
        customer_phone: customerInfo?.phone,
        items: cartItems.map(item => ({
          product_id: item.productId,
          product_name: item.productName,
          specification: item.specification,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: subtotal,
        discount_amount: discount,
        shipping_cost: SHIPPING_COST,
        total_amount: totalUSD,
        payment_method: method,
        payment_status: 'completed',
        transaction_id: txHash,
        crypto_currency: method === 'cryptocurrency' ? selectedCrypto : null,
        crypto_amount: method === 'cryptocurrency' ? cryptoAmount : null,
        crypto_address: method === 'cryptocurrency' ? PAYMENT_ADDRESSES[selectedCrypto] : null,
        status: 'processing',
        shipping_address: {
          address: customerInfo?.shippingAddress || customerInfo?.address,
          city: customerInfo?.shippingCity || customerInfo?.city,
          state: customerInfo?.shippingState || customerInfo?.state,
          zip: customerInfo?.shippingZip || customerInfo?.zip,
          country: customerInfo?.shippingCountry || customerInfo?.country || 'USA',
        },
      };

      if (affiliateInfo) {
        orderPayload.affiliate_code = affiliateInfo.code;
        orderPayload.affiliate_email = affiliateInfo.email;
        orderPayload.affiliate_name = affiliateInfo.name;
        orderPayload.affiliate_commission = parseFloat((totalUSD * 0.10).toFixed(2));
      }

      const referralCode = localStorage.getItem('rdr_referral_code');
      if (referralCode) {
        orderPayload.referral_code = referralCode;
      }

      await base44.entities.Order.create(orderPayload);

      // ─── BLOCKCHAIN CONFIRMED: Credit affiliate rewards ───
      if (affiliateInfo) {
        try {
          await recordAffiliateOrder(base44, {
            ...affiliateInfo,
            customerEmail: userEmail || customerInfo?.email || 'guest@redhelixresearch.com',
          }, orderNumber, totalUSD);
        } catch (affError) {
          console.error('Affiliate tracking error (non-blocking):', affError);
        }
      }

      // ─── BLOCKCHAIN CONFIRMED: Send referral reward notification ───
      if (referralCode) {
        try {
          const discountCode = 'REFER' + Math.random().toString(36).substring(2, 8).toUpperCase();
          await base44.integrations.Core.SendEmail({
            from_name: 'Red Helix Research - Referral System',
            to: 'jakehboen95@gmail.com',
            subject: 'Referral Purchase Confirmed - Issue 10% Discount Code',
            body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
              '<h2 style="color: #dc2626;">Referral Purchase Confirmed on Blockchain!</h2>' +
              '<div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0;">' +
              '<p><strong>Referral Code Used:</strong> ' + referralCode + '</p>' +
              '<p><strong>Order Number:</strong> ' + orderNumber + '</p>' +
              '<p><strong>Order Total:</strong> $' + totalUSD.toFixed(2) + '</p>' +
              '<p><strong>Buyer Email:</strong> ' + (userEmail || customerInfo?.email) + '</p>' +
              '<p><strong>Payment Method:</strong> ' + (method === 'cryptocurrency' ? selectedCrypto + ' (blockchain verified)' : method) + '</p>' +
              '<p><strong>Suggested Discount Code:</strong> ' + discountCode + ' (10% off, one-time use)</p>' +
              '</div>' +
              '<p style="color: #64748b; font-size: 14px;">Payment has been <strong>confirmed on the blockchain</strong>. ' +
              'Please send the referrer a thank-you email with a <strong>one-time 10% discount code</strong>.</p>' +
              '</div>'
          });
          localStorage.removeItem('rdr_referral_code');
        } catch (refError) {
          console.error('Referral tracking error (non-blocking):', refError);
        }
      }

      trackPurchase({
        order_number: orderNumber,
        customer_email: userEmail || customerInfo?.email,
        total_amount: totalUSD,
        items: cartItems
      });

      localStorage.setItem('lastOrderNumber', orderNumber);
      localStorage.setItem('lastTransactionId', txHash);
      clearCart();
    } catch (error) {
      console.error('Order creation error:', error);
    }
  };

  const copyToClipboard = (text, type = 'address') => {
    navigator.clipboard.writeText(text);
    if (type === 'amount') {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSelectCrypto = (cryptoId) => {
    setSelectedCrypto(cryptoId);
    setStep('send_payment');
  };

  const handleSubmitTx = () => {
    if (!transactionId.trim()) return;
    setStep('confirm');
  };

  // Current step number for indicator
  const stepNumber = step === 'pick_coin' ? 1 : step === 'send_payment' ? 2 : step === 'confirm' ? 3 : 0;

  return (
    <div className="min-h-screen bg-white pt-28 pb-20 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.02]">
        <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-[#dc2626] rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-[-10%] w-[400px] h-[400px] bg-slate-400 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link to={createPageUrl('CustomerInfo')}>
            <Button variant="outline" className="mb-6 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-bold uppercase tracking-wider text-xs">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
            Checkout
          </h1>
          <p className="text-lg text-slate-500 font-medium mt-2">Choose how you'd like to pay</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main */}
          <div className="flex-1">
            <AnimatePresence mode="wait">

              {/* ───── SELECT METHOD ───── */}
              {step === 'select_method' && (
                <motion.div key="method" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                  {/* Crypto option */}
                  <button
                    onClick={() => setStep('pick_coin')}
                    className="w-full group p-6 bg-white border-2 border-slate-200 rounded-2xl text-left hover:border-[#dc2626] hover:shadow-lg transition-all flex items-center gap-5"
                  >
                    <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">₿</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-[#dc2626] transition-colors">
                        Pay with Crypto
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">Bitcoin, Ethereum, USDT, or USDC</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#dc2626] transition-colors" />
                  </button>

                  {/* Bank ACH option */}
                  <button
                    onClick={() => setStep('bank_ach')}
                    className="w-full group p-6 bg-white border-2 border-slate-200 rounded-2xl text-left hover:border-[#dc2626] hover:shadow-lg transition-all flex items-center gap-5"
                  >
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <LinkIcon className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-[#dc2626] transition-colors">
                        Bank Transfer (ACH)
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">Connect your bank securely</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#dc2626] transition-colors" />
                  </button>

                  {/* Card payment option */}
                  <button
                    onClick={() => setShowSquareDisclaimer(true)}
                    className="w-full group p-6 bg-white border-2 border-slate-200 rounded-2xl text-left hover:border-[#dc2626] hover:shadow-lg transition-all flex items-center gap-5"
                  >
                    <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CreditCard className="w-7 h-7 text-[#dc2626]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-[#dc2626] transition-colors">
                        Pay with Card
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">We'll email you a secure payment link</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#dc2626] transition-colors" />
                  </button>

                  {/* Security note */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <Shield className="w-5 h-5 text-[#dc2626] flex-shrink-0" />
                    <p className="text-xs text-slate-500 font-medium">All payments are encrypted and securely processed.</p>
                  </div>

                  {/* Card payment disclaimer + consent modal */}
                  <AnimatePresence>
                    {showSquareDisclaimer && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={(e) => { if (e.target === e.currentTarget && squareDisclaimerAccepted && squareRefundPolicyAccepted) setShowSquareDisclaimer(false); }}
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] flex flex-col"
                        >
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 border-b border-amber-100 flex-shrink-0">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-amber-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Order Agreement</h3>
                                <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Please Read Before Continuing</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-6 space-y-4 overflow-y-auto">
                            <p className="text-sm text-slate-600 leading-relaxed">
                              Card payments are currently handled through a <strong className="text-slate-900">secure payment link service</strong> powered by Square. We'll email you a secure link to complete your purchase — your card details are never shared with us.
                            </p>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">No Refund / No Return Policy</h4>
                              <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                                <li>• <strong>All sales are final — no refunds or returns</strong> due to potential degradation of research materials</li>
                                <li>• Damaged shipments are eligible for a <strong>one-time exchange</strong> — contact us within 48 hours with photos</li>
                                <li>• Please contact <strong>jake@redhelixresearch.com</strong> to resolve any issues <strong>before</strong> contacting your bank</li>
                              </ul>
                            </div>

                            <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-[#dc2626] transition-colors">
                              <input
                                type="checkbox"
                                checked={squareDisclaimerAccepted}
                                onChange={(e) => setSquareDisclaimerAccepted(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#dc2626] focus:ring-[#dc2626] flex-shrink-0"
                              />
                              <span className="text-xs text-slate-700 font-semibold leading-relaxed">
                                I have reviewed my order and confirm it is correct. I understand card payments are processed via a secure payment link.
                              </span>
                            </label>

                            <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-[#dc2626] transition-colors">
                              <input
                                type="checkbox"
                                checked={squareRefundPolicyAccepted}
                                onChange={(e) => setSquareRefundPolicyAccepted(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#dc2626] focus:ring-[#dc2626] flex-shrink-0"
                              />
                              <span className="text-xs text-slate-700 font-semibold leading-relaxed">
                                I agree to the <a href="/Policies" target="_blank" className="text-[#dc2626] underline">no-refund policy</a> and understand that all sales are final with no refunds or returns. Exchanges are available only for damaged shipments. I will contact Red Helix Research support before initiating any payment dispute.
                              </span>
                            </label>
                          </div>
                          <div className="p-6 pt-0 flex gap-3 flex-shrink-0">
                            <button
                              onClick={() => { setShowSquareDisclaimer(false); setSquareDisclaimerAccepted(false); setSquareRefundPolicyAccepted(false); }}
                              className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-500 uppercase tracking-wider hover:border-slate-300 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => { setConsentTimestamp(new Date().toISOString()); setShowSquareDisclaimer(false); setStep('square_payment'); }}
                              disabled={!squareDisclaimerAccepted || !squareRefundPolicyAccepted}
                              className="flex-1 py-3 px-4 rounded-xl bg-[#dc2626] text-white text-sm font-black uppercase tracking-wider hover:bg-[#b91c1c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              I Agree & Continue
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* New to crypto? */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <button onClick={() => setShowNewTooltip(!showNewTooltip)} className="flex items-center gap-2 w-full text-left">
                      <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-bold text-blue-700">New to crypto? Tap here for a quick guide</span>
                    </button>
                    {showNewTooltip && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 text-sm text-blue-700 space-y-2 overflow-hidden">
                        <p><strong>1.</strong> Download a crypto app like <strong>Coinbase</strong> or <strong>Cash App</strong> on your phone.</p>
                        <p><strong>2.</strong> Buy some crypto (we recommend <strong>USDT</strong> — it's always worth $1, so no surprises).</p>
                        <p><strong>3.</strong> Come back here, pick your coin, and we'll give you an address to send to.</p>
                        <p><strong>4.</strong> After sending, paste the transaction ID and you're done!</p>
                        <p className="text-blue-500 text-xs mt-2">It takes about 5 minutes your first time. After that, it's faster than a credit card.</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ───── PICK COIN ───── */}
              {step === 'pick_coin' && (
                <motion.div key="pick" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <StepIndicator currentStep={1} />

                  <button onClick={() => setStep('select_method')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-[#dc2626] font-bold mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Which crypto do you have?</h2>
                  <p className="text-slate-500 font-medium mb-6 text-sm">Pick the coin you want to pay with. Not sure? <strong>USDT is the easiest</strong> — it's always worth $1.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CRYPTO_OPTIONS.map((crypto) => (
                      <button
                        key={crypto.id}
                        onClick={() => handleSelectCrypto(crypto.id)}
                        className="group p-5 bg-white border-2 border-slate-200 rounded-2xl flex items-center gap-4 hover:border-[#dc2626] hover:shadow-lg transition-all text-left"
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${crypto.color}12`, color: crypto.color }}
                        >
                          {crypto.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{crypto.symbol}</h4>
                            {crypto.badge && (
                              <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-full">{crypto.badge}</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-medium truncate">{crypto.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#dc2626]" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ───── SEND PAYMENT ───── */}
              {step === 'send_payment' && selectedCrypto && (
                <motion.div key="send" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <StepIndicator currentStep={2} />

                  <button onClick={() => { setStep('pick_coin'); setSelectedCrypto(null); }} className="flex items-center gap-1 text-sm text-slate-400 hover:text-[#dc2626] font-bold mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Change coin
                  </button>

                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                        Send {selectedCrypto}
                      </h2>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">{formatTime(timeLeft)}</span>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-sm text-blue-700 font-medium">
                        <strong>How it works:</strong> Open your crypto app (Coinbase, Cash App, etc.), tap <strong>Send</strong>, paste the address below, enter the exact amount, and hit send. That's it!
                      </p>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Amount to Send
                        <HelpTip>This is the exact amount of {selectedCrypto} to send. Make sure you send this exact amount so we can match your payment.</HelpTip>
                      </label>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex-1">
                          <span className="text-3xl font-black text-slate-900 tracking-tight">
                            {isLoadingRate ? <Loader2 className="w-6 h-6 animate-spin inline" /> : cryptoAmount}
                          </span>
                          <span className="text-lg font-black text-[#dc2626] ml-2 uppercase">{selectedCrypto}</span>
                          <p className="text-sm text-slate-400 font-medium mt-0.5">= ${totalUSD.toFixed(2)} USD</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(cryptoAmount, 'amount')}
                          className="rounded-lg border-slate-200 text-xs font-bold"
                        >
                          {copiedAmount ? <Check className="w-4 h-4 text-green-500" /> : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
                        </Button>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Send To This Address
                        <HelpTip>Copy this address and paste it into the "To" or "Recipient" field in your crypto app. Double-check it matches!</HelpTip>
                      </label>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <code className="flex-1 text-xs sm:text-sm font-bold text-slate-900 break-all select-all">
                          {PAYMENT_ADDRESSES[selectedCrypto]}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(PAYMENT_ADDRESSES[selectedCrypto])}
                          className="rounded-lg border-slate-200 text-xs font-bold flex-shrink-0"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
                        </Button>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center pt-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Or scan with your crypto app</p>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedCrypto === 'BTC' ? 'bitcoin' : 'ethereum'}:${PAYMENT_ADDRESSES[selectedCrypto]}?amount=${cryptoAmount}`}
                          alt="Payment QR Code"
                          className="w-40 h-40"
                        />
                      </div>
                    </div>

                    {/* Network warning */}
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-[#dc2626]">Important: Send on the correct network</p>
                        <p className="text-xs text-red-600 mt-1">
                          Make sure you're sending on <strong>{CRYPTO_OPTIONS.find(c => c.id === selectedCrypto)?.network}</strong>.
                          Sending on the wrong network means your funds can't be recovered.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* TX Hash input */}
                  <div className="mt-6 bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Already sent it?</h3>
                    <p className="text-sm text-slate-500 font-medium mb-4">
                      Paste your transaction ID below. You can find it in your crypto app under "Activity" or "Transaction History."
                      <HelpTip>A transaction ID (or "hash") is a long string of letters and numbers that proves your payment was sent. Every crypto transaction has one. Look in your wallet app's history/activity tab.</HelpTip>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Paste your transaction ID here"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]/20 transition-all font-medium text-sm"
                      />
                      <Button
                        onClick={handleSubmitTx}
                        disabled={!transactionId.trim()}
                        className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs h-auto shadow-lg shadow-red-200 hover:shadow-red-300 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all"
                      >
                        Verify Payment
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ───── CONFIRM ───── */}
              {step === 'confirm' && (
                <motion.div key="confirming" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border-2 border-slate-200 rounded-2xl p-8 md:p-12 text-center">
                  <StepIndicator currentStep={3} />

                  <div className="max-w-sm mx-auto">
                    {verificationStatus !== 'failed' ? (
                      <>
                        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Loader2 className="w-10 h-10 text-[#dc2626] animate-spin" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">Checking Your Payment</h2>
                        <p className="text-slate-500 font-medium mb-6 text-sm">{verificationMessage || 'Looking for your transaction on the blockchain...'}</p>

                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                          <motion.div
                            initial={{ width: "5%" }}
                            animate={{ width: "95%" }}
                            transition={{ duration: 30, ease: "linear" }}
                            className="h-full bg-[#dc2626] rounded-full"
                          />
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                          This usually takes 1-5 minutes. You can stay on this page — we'll update automatically.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <AlertCircle className="w-10 h-10 text-[#dc2626]" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">Couldn't Verify</h2>
                        <p className="text-slate-500 font-medium mb-6 text-sm">{verificationMessage}</p>
                        <div className="flex flex-col gap-3">
                          <Button
                            onClick={() => { setStep('send_payment'); setVerificationStatus('idle'); setRetryCount(0); }}
                            className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-widest text-xs py-3"
                          >
                            Try Again
                          </Button>
                          <p className="text-xs text-slate-400">
                            If this keeps happening, contact support with your transaction ID: <span className="font-mono text-slate-600 break-all">{transactionId}</span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ───── BANK ACH ───── */}
              {step === 'bank_ach' && (
                <motion.div key="ach" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8">
                  <button onClick={() => setStep('select_method')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-[#dc2626] font-bold mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <div className="max-w-md mx-auto text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LinkIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">Bank Transfer</h2>
                    <p className="text-slate-500 font-medium mb-8 text-sm">Connect your bank account securely.</p>

                    <PlaidACHCheckout
                      order={{
                        order_number: orderNumberRef.current,
                        total_amount: totalUSD,
                        items: cartItems,
                        customer_email: squareEmail || customerInfo?.email || '',
                      }}
                      billingInfo={{
                        phone: customerInfo?.phone || '',
                        address: customerInfo?.address || customerInfo?.shippingAddress || '',
                        city: customerInfo?.city || customerInfo?.shippingCity || '',
                        state: customerInfo?.state || customerInfo?.shippingState || '',
                        zip: customerInfo?.zip || customerInfo?.shippingZip || '',
                        country: customerInfo?.country || customerInfo?.shippingCountry || 'US',
                      }}
                      onSuccess={async (data) => {
                        const paymentId = data?.payment_id || data?.id || `ACH-${Date.now()}`;
                        await processSuccessfulPayment(paymentId, 'bank_ach');
                      }}
                    />

                    <div className="mt-8 flex justify-center gap-4">
                      <PCIComplianceBadge variant="minimal" />
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">256-bit Encrypted</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ───── SQUARE PAYMENT LINK ───── */}
              {step === 'square_payment' && (
                <motion.div key="square" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8">
                  <button onClick={() => { setStep('select_method'); setSquareSent(false); setSquareError(''); }} className="flex items-center gap-1 text-sm text-slate-400 hover:text-[#dc2626] font-bold mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <div className="max-w-md mx-auto text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <CreditCard className="w-8 h-8 text-[#dc2626]" />
                    </div>

                    {!squareSent ? (
                      <>
                        <h2 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">Pay with Card</h2>
                        <p className="text-slate-500 font-medium mb-8 text-sm">
                          We'll send a secure Square payment link to your email. Click the link to complete your purchase with any debit or credit card.
                        </p>

                        {/* Order total */}
                        <div className="p-4 bg-slate-50 rounded-xl mb-6">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Total</span>
                            <span className="text-2xl font-black text-slate-900">${totalUSD.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Email input */}
                        <div className="text-left mb-6">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              value={squareEmail}
                              onChange={(e) => setSquareEmail(e.target.value)}
                              placeholder="your@email.com"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#dc2626] transition-all"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2 font-medium">
                            We'll send your payment link to this email address.
                          </p>
                        </div>

                        {/* Cloudflare Turnstile bot protection */}
                        <div className="flex justify-center mb-4">
                          <TurnstileWidget
                            action="checkout"
                            theme="light"
                            onSuccess={(token) => setTurnstileToken(token)}
                            onError={() => setTurnstileToken(null)}
                            onExpired={() => setTurnstileToken(null)}
                          />
                        </div>

                        {squareError && (
                          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4 text-left">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-xs text-red-600 font-bold">{squareError}</p>
                          </div>
                        )}

                        <Button
                          onClick={async () => {
                            if (!squareEmail?.trim() || !squareEmail.includes('@')) {
                              setSquareError('Please enter a valid email address.');
                              return;
                            }
                            if (!turnstileToken) {
                              setSquareError('Please complete the security verification.');
                              return;
                            }
                            setSquareError('');
                            setSquareSending(true);
                            try {
                              // 1. Create dynamic Square checkout link via direct function call
                              const fnRes = await fetch('https://red-helix-research-f58be972.base44.app/functions/createSquareCheckout', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  items: cartItems.map(item => ({
                                    productName: item.productName,
                                    specification: item.specification,
                                    price: item.price,
                                    quantity: item.quantity,
                                  })),
                                  customerEmail: squareEmail.trim(),
                                  customerName: customerInfo?.firstName ? `${customerInfo.firstName} ${customerInfo.lastName || ''}`.trim() : undefined,
                                  orderNumber: orderNumberRef.current,
                                  promoCode: promoCode || undefined,
                                  discountAmount: discount > 0 ? discount : undefined,
                                  shippingCost: SHIPPING_COST,
                                  // Cloudflare Turnstile verification token
                                  turnstileToken,
                                  // Chargeback evidence — consent + device info
                                  consentTimestamp: consentTimestamp || new Date().toISOString(),
                                  consentVersion: 'v2-2025-02',
                                  userAgent: navigator.userAgent,
                                  screenResolution: `${window.screen.width}x${window.screen.height}`,
                                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                  language: navigator.language,
                                  shippingAddress: customerInfo ? {
                                    address: customerInfo.shippingAddress || customerInfo.address,
                                    city: customerInfo.shippingCity || customerInfo.city,
                                    state: customerInfo.shippingState || customerInfo.state,
                                    zip: customerInfo.shippingZip || customerInfo.zip,
                                    country: customerInfo.shippingCountry || customerInfo.country || 'USA',
                                  } : undefined,
                                  billingAddress: customerInfo ? {
                                    address: customerInfo.address,
                                    city: customerInfo.city,
                                    state: customerInfo.state,
                                    zip: customerInfo.zip,
                                    country: customerInfo.country || 'USA',
                                  } : undefined,
                                }),
                              });
                              const fnData = await fnRes.json();
                              if (!fnRes.ok || !fnData?.checkoutUrl) {
                                throw new Error(fnData?.error || 'Failed to create checkout link');
                              }
                              const checkoutUrl = fnData.checkoutUrl;

                              // 2. Create order record with Square payment link evidence
                              try {
                                const squareAffiliateInfo = await resolveAffiliateInfo();
                                const orderPayload = {
                                  order_number: orderNumberRef.current,
                                  customer_email: squareEmail.trim(),
                                  customer_name: customerInfo?.firstName ? `${customerInfo.firstName} ${customerInfo.lastName || ''}`.trim() : '',
                                  customer_phone: customerInfo?.phone,
                                  items: cartItems.map(item => ({
                                    product_id: item.productId,
                                    product_name: item.productName,
                                    specification: item.specification,
                                    quantity: item.quantity,
                                    price: item.price,
                                  })),
                                  subtotal: subtotal,
                                  discount_amount: discount,
                                  shipping_cost: SHIPPING_COST,
                                  total_amount: totalUSD,
                                  payment_method: 'square_payment',
                                  payment_status: 'pending',
                                  transaction_id: fnData.paymentLinkId || null,
                                  status: 'awaiting_payment',
                                  shipping_address: {
                                    address: customerInfo?.shippingAddress || customerInfo?.address,
                                    city: customerInfo?.shippingCity || customerInfo?.city,
                                    state: customerInfo?.shippingState || customerInfo?.state,
                                    zip: customerInfo?.shippingZip || customerInfo?.zip,
                                    country: customerInfo?.shippingCountry || customerInfo?.country || 'USA',
                                  },
                                };
                                if (squareAffiliateInfo) {
                                  orderPayload.affiliate_code = squareAffiliateInfo.code;
                                  orderPayload.affiliate_email = squareAffiliateInfo.email;
                                  orderPayload.affiliate_name = squareAffiliateInfo.name;
                                  orderPayload.affiliate_commission = parseFloat((totalUSD * 0.10).toFixed(2));
                                }
                                await base44.entities.Order.create(orderPayload);
                              } catch (orderErr) {
                                console.warn('Failed to create order record:', orderErr);
                              }

                              // 3. Build and send email with dynamic checkout URL
                              const itemListHtml = cartItems.map(item =>
                                `<tr>
                                  <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;font-weight:600;">${item.productName}</td>
                                  <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12px;color:#94a3b8;text-align:center;">${item.specification || ''}</td>
                                  <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12px;color:#94a3b8;text-align:center;">x${item.quantity}</td>
                                  <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;font-weight:700;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>`
                              ).join('');

                              const emailBody = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<tr>
<td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:36px 40px;text-align:center;">
  <div style="width:50px;height:50px;background-color:#dc2626;border-radius:14px;display:inline-block;line-height:50px;margin-bottom:16px;">
    <span style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-1px;">RH</span>
  </div>
  <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0 0 6px 0;letter-spacing:-0.5px;">Your Payment Link</h1>
  <p style="color:#94a3b8;font-size:12px;font-weight:600;margin:0;letter-spacing:1px;text-transform:uppercase;">Red Helix Research | Order ${orderNumberRef.current}</p>
</td>
</tr>
<tr>
<td style="padding:32px 40px 0 40px;">
  <p style="color:#334155;font-size:15px;font-weight:600;margin:0 0 6px 0;">Hi ${customerInfo?.firstName || 'there'},</p>
  <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 16px 0;">Here's your secure payment link for your Red Helix Research order. Click the button below to complete your purchase.</p>
  <div style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;margin:0 0 24px 0;">
    <p style="color:#92400e;font-size:13px;line-height:1.6;margin:0 0 8px 0;font-weight:700;">Yeah, we know... a payment link email isn't exactly the checkout experience of the future.</p>
    <p style="color:#a16207;font-size:12px;line-height:1.6;margin:0;">We're a small team laser-focused on bringing you research-grade products at fair prices — and right now that means our checkout is a little unconventional. We're actively building out <strong style="color:#92400e;">direct credit card processing</strong> and <strong style="color:#92400e;">ACH bank payments</strong> so you can pay right on-site without the extra step. Until then, this secure link gets the job done, and your patience means the world to us.</p>
  </div>
</td>
</tr>
<tr>
<td style="padding:0 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <tr style="background-color:#f8fafc;">
      <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Item</th>
      <th style="padding:10px 8px;text-align:center;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Spec</th>
      <th style="padding:10px 8px;text-align:center;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Qty</th>
      <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Price</th>
    </tr>
    ${itemListHtml}
    <tr style="background-color:#f8fafc;">
      <td colspan="3" style="padding:12px;font-size:13px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">Total</td>
      <td style="padding:12px;font-size:18px;font-weight:900;color:#dc2626;text-align:right;">$${totalUSD.toFixed(2)}</td>
    </tr>
  </table>
</td>
</tr>
<tr>
<td style="padding:28px 40px;" align="center">
  <a href="${checkoutUrl}" target="_blank" style="display:inline-block;background-color:#dc2626;color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;padding:16px 48px;border-radius:12px;letter-spacing:0.5px;text-transform:uppercase;box-shadow:0 4px 14px rgba(220,38,38,0.3);">
    Complete Payment
  </a>
  <p style="color:#94a3b8;font-size:11px;margin:12px 0 0 0;font-weight:500;">This charge will appear as <strong>RED HELIX RESEARCH</strong> on your card statement.</p>
</td>
</tr>
<tr>
<td style="padding:0 40px;">
  <div style="background-color:#f8fafc;border-radius:10px;padding:16px;text-align:center;">
    <p style="color:#64748b;font-size:12px;line-height:1.5;margin:0;">
      If the button above doesn't work, copy and paste this link into your browser:<br/>
      <a href="${checkoutUrl}" style="color:#dc2626;font-weight:700;word-break:break-all;">${checkoutUrl}</a>
    </p>
  </div>
</td>
</tr>
<tr>
<td style="padding:16px 40px;">
  <div style="background-color:#f1f5f9;border-radius:10px;padding:14px 16px;">
    <p style="color:#64748b;font-size:11px;font-weight:700;margin:0 0 6px 0;text-transform:uppercase;letter-spacing:0.5px;">No Refund Policy</p>
    <p style="color:#94a3b8;font-size:11px;line-height:1.6;margin:0;">All sales are final — no refunds or returns due to potential degradation of research materials. We offer exchanges for damaged shipments only (contact us within 48 hours with photos). If you have any issues, please contact us at <a href="mailto:jake@redhelixresearch.com" style="color:#dc2626;font-weight:700;">jake@redhelixresearch.com</a> <strong>before</strong> contacting your bank — we resolve most issues within 24 hours.</p>
  </div>
</td>
</tr>
<tr>
<td style="background-color:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="color:#94a3b8;font-size:11px;margin:0;font-weight:500;">Red Helix Research | <a href="mailto:jake@redhelixresearch.com" style="color:#dc2626;text-decoration:none;">jake@redhelixresearch.com</a></p>
</td>
</tr>
</table>
</td></tr></table>
</body>
</html>`;

                              await base44.integrations.Core.SendEmail({
                                from_name: 'Red Helix Research',
                                to: squareEmail.trim(),
                                subject: `Your Payment Link — Order $${totalUSD.toFixed(2)}`,
                                body: emailBody,
                              });

                              setSquareSent(true);
                              setTurnstileToken(null); // Reset — tokens are single-use
                            } catch (err) {
                              console.error('Square checkout error:', err);
                              const errMsg = err?.response?.data?.error || err?.data?.error || err?.message || 'Failed to create checkout. Please try again.';
                              setSquareError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
                              setTurnstileToken(null); // Reset on error for re-verification
                            } finally {
                              setSquareSending(false);
                            }
                          }}
                          disabled={squareSending || !squareEmail?.trim() || !turnstileToken}
                          className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-widest text-xs py-6 shadow-lg shadow-[#dc2626]/20 disabled:opacity-50"
                        >
                          {squareSending ? (
                            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating Checkout...</>
                          ) : (
                            <><Send className="w-4 h-4 mr-2" /> Send Payment Link</>
                          )}
                        </Button>

                        <div className="mt-6 flex justify-center gap-4">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full">
                            <ShieldCheck className="w-3 h-3 text-slate-500" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Powered by Square</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full">
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Secure Payment</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* ── Success state ── */
                      <>
                        <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">
                          Payment Link <span className="text-green-500">Sent!</span>
                        </h2>
                        <p className="text-slate-500 font-medium mb-2 text-sm">
                          We've sent a secure payment link to:
                        </p>
                        <p className="text-lg font-black text-slate-900 mb-6">{squareEmail}</p>

                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6 text-left">
                          <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-2">What's Next?</h4>
                          <ol className="text-sm text-blue-700 font-medium space-y-1.5 list-decimal list-inside">
                            <li>Check your email inbox (and spam folder)</li>
                            <li>Click the <strong>"Complete Payment"</strong> button in the email</li>
                            <li>Enter your card details on the secure Square checkout page</li>
                            <li>You'll receive an order confirmation once payment is complete</li>
                          </ol>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => { setSquareSent(false); setSquareError(''); }}
                            variant="outline"
                            className="flex-1 border-slate-200 rounded-xl font-black uppercase tracking-widest text-xs py-5"
                          >
                            <Mail className="w-4 h-4 mr-2" /> Resend
                          </Button>
                          <Link to={createPageUrl('Home')} className="flex-1">
                            <Button className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-widest text-xs py-5">
                              Continue Shopping
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ───── COMPLETED ───── */}
              {step === 'completed' && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border-2 border-green-200 rounded-2xl p-8 md:p-12 text-center">
                  <div className="max-w-sm mx-auto">
                    <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-3">
                      Payment <span className="text-green-500">Confirmed!</span>
                    </h2>
                    <p className="text-slate-500 font-medium mb-8 text-sm">Your order has been placed and is being processed.</p>

                    <div className="p-4 bg-slate-50 rounded-xl text-left space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold uppercase rounded-full">Processing</span>
                      </div>
                      {transactionId && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase">Transaction</span>
                          <span className="text-xs font-mono text-slate-600 truncate ml-4 max-w-[180px]">{transactionId}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs font-bold uppercase tracking-wider">Redirecting to your receipt...</span>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ───── SIDEBAR ───── */}
          <div className="lg:w-80 space-y-4">
            {/* Order Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-28">
              <h3 className="text-lg font-black text-slate-900 mb-5 uppercase tracking-tight">Order Summary</h3>

              <div className="space-y-4 mb-5">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.productName}</h4>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{item.specification} × {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-900 font-bold">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-600 font-bold">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="text-slate-900 font-bold">${SHIPPING_COST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="text-base font-black text-slate-900 uppercase">Total</span>
                  <span className="text-xl font-black text-[#dc2626]">${totalUSD.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Security badge */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="w-5 h-5 text-[#dc2626]" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Secure Checkout</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-500" />
                  <span className="text-[10px] font-medium text-slate-500">Encrypted transactions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-500" />
                  <span className="text-[10px] font-medium text-slate-500">Blockchain verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-500" />
                  <span className="text-[10px] font-medium text-slate-500">Discrete packaging</span>
                </div>
              </div>
            </div>

            {/* Need help */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Need Help?</h4>
              <p className="text-xs text-slate-500">
                Email <strong>support@redhelixresearch.com</strong> or check our{' '}
                <Link to={createPageUrl('ExpandedFAQ')} className="text-[#dc2626] font-bold hover:underline">FAQ</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
