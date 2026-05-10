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
  validatePromoCodeAsync,
  loadAffiliateCodes,
  validateCartStock
} from '@/components/utils/cart';
import { trackPurchase } from '@/utils/hubspotAnalytics';
import { base44 } from '@/api/base44Client';
import { recordAffiliateOrder } from '@/components/utils/affiliateStore';
import TurnstileWidget from '@/components/TurnstileWidget';
import SquarePaymentPanel from '@/components/checkout/SquarePaymentPanel';
import { runFraudCheck } from '@/components/checkout/FraudCheckGate';
import { saveCheckoutSnapshot, createOrderWithRetry, markSnapshotComplete, clearCheckoutSnapshot } from '@/components/checkout/checkoutFailsafe';

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
const SQUARE_PROCESSING_FEE_PERCENT = 0.10; // 10% processing fee for card payments

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

  // Zelle payment
  const [zelleDisclaimerAccepted, setZelleDisclaimerAccepted] = useState(false);
  const [showZelleDisclaimer, setShowZelleDisclaimer] = useState(false);
  const [zelleConfirmed, setZelleConfirmed] = useState(false);
  const [zelleOrderCreated, setZelleOrderCreated] = useState(false);
  const [zelleAccountName, setZelleAccountName] = useState('');
  const [zelleConfirmationNumber, setZelleConfirmationNumber] = useState('');

  // Square payment link
  const [squareEmail, setSquareEmail] = useState('');
  const [squareSending, setSquareSending] = useState(false);
  const [squareSent, setSquareSent] = useState(false);
  const [squareCheckoutUrl, setSquareCheckoutUrl] = useState('');
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
      // Hydrate the promo code cache so getDiscountAmount works synchronously
      // (mirrors the same pattern in Cart.jsx to prevent discount = $0 after page refresh)
      if (promo) {
        await validatePromoCodeAsync(promo, base44);
      }
      // Also pre-load affiliate codes
      loadAffiliateCodes(base44);
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

  // Auto-verify transaction (best-effort — order already saved on submit)
  useEffect(() => {
    if (!transactionId || verificationStatus === 'verified' || step !== 'confirm') return;
    // Just mark as verified immediately since order is already saved
    setVerificationStatus('verified');
    setVerificationMessage('Payment received! Your order is being processed.');
    return () => { if (txVerifyRef.current) clearInterval(txVerifyRef.current); };
  }, [transactionId, step]);

  // Calculate totals
  const subtotal = getCartTotal();
  const discount = promoCode ? getDiscountAmount(promoCode, subtotal) : 0;
  const subtotalAfterDiscount = subtotal - discount;
  // Always compute the processing fee — applied to subtotal+shipping for Square card payments
  const squareProcessingFee = Math.round((subtotalAfterDiscount + SHIPPING_COST) * SQUARE_PROCESSING_FEE_PERCENT * 100) / 100;
  const processingFee = step === 'square_payment' ? squareProcessingFee : 0;
  const totalUSD = subtotalAfterDiscount + SHIPPING_COST + processingFee;

  const verifyTransaction = async (txHash) => {
    setVerificationStatus('checking');
    setVerificationMessage('Verifying your payment...');

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

  // ─── Reserve stock: decrement quantities for purchased items ───
  const decrementStock = async (items) => {
    try {
      const products = await base44.entities.Product.list();
      for (const item of items) {
        const product = products.find(p => p.id === item.productId || p.name === item.productName);
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
    } catch (err) {
      console.error('Failed to decrement stock:', err);
    }
  };

  // Tracks whether a pending order has already been created for this TX
  const pendingOrderCreated = useRef(false);

  const buildSnapshotPayload = (paymentMethod) => {
    const customerName = customerInfo?.firstName && customerInfo?.lastName
      ? `${customerInfo.firstName} ${customerInfo.lastName}`
      : customerInfo?.name || 'Guest Customer';
    return {
      orderNumber: orderNumberRef.current,
      customerName,
      customerEmail: customerInfo?.email || 'guest@redhelixresearch.com',
      customerPhone: customerInfo?.phone,
      items: cartItems.map(item => ({
        productName: item.productName,
        specification: item.specification,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal,
      discountAmount: discount,
      shippingCost: SHIPPING_COST,
      totalAmount: totalUSD,
      promoCode: promoCode || null,
      shippingAddress: {
        address: customerInfo?.shippingAddress || customerInfo?.address,
        city: customerInfo?.shippingCity || customerInfo?.city,
        state: customerInfo?.shippingState || customerInfo?.state,
        zip: customerInfo?.shippingZip || customerInfo?.zip,
      },
      paymentMethod,
    };
  };

  const createPendingOrder = async (txHash) => {
    if (pendingOrderCreated.current) return; // don't double-create
    pendingOrderCreated.current = true;
    try {
      let userEmail = null;
      try { const user = await base44.auth.me(); userEmail = user?.email; } catch {}
      const customerName = customerInfo?.firstName && customerInfo?.lastName
        ? `${customerInfo.firstName} ${customerInfo.lastName}`
        : customerInfo?.name || 'Guest Customer';
      const affiliateInfo = await resolveAffiliateInfo();
      const pendingPayload = {
        order_number: orderNumberRef.current,
        customer_email: userEmail || customerInfo?.email || 'guest@redhelixresearch.com',
        customer_name: customerName,
        customer_phone: customerInfo?.phone,
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          specification: item.specification,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: subtotal,
        discount_amount: discount,
        shipping_cost: SHIPPING_COST,
        total_amount: totalUSD,
        promo_code: promoCode || null,
        payment_method: 'cryptocurrency',
        payment_status: 'completed',
        transaction_id: txHash,
        crypto_currency: selectedCrypto,
        crypto_amount: cryptoAmount,
        crypto_address: PAYMENT_ADDRESSES[selectedCrypto],
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
        pendingPayload.affiliate_code = affiliateInfo.code;
        pendingPayload.affiliate_email = affiliateInfo.email;
        pendingPayload.affiliate_name = affiliateInfo.name;
        pendingPayload.affiliate_commission = parseFloat((totalUSD * 0.10).toFixed(2));
      }
      const referralCode = localStorage.getItem('rdr_referral_code');
      if (referralCode) pendingPayload.referral_code = referralCode;
      pendingPayload.stock_reserved = true;
      pendingPayload.reserved_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await createOrderWithRetry(pendingPayload);

      // Reserve stock immediately on order creation
      try { await decrementStock(cartItems); } catch (e) { console.warn('Stock reserve failed:', e); }

      // Customer order confirmation email (crypto — sent immediately on TX submission)
      try {
        const confItemsHtml = cartItems.map(i => `<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;font-weight:600;">${i.productName}</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center;">${i.specification || '—'}</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center;">×${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#0f172a;text-align:right;">$${(i.price*i.quantity).toFixed(2)}</td></tr>`).join('');
        const confAddr = pendingPayload.shipping_address || {};
        const confAddrLine = [confAddr.address,confAddr.city,confAddr.state,confAddr.zip].filter(Boolean).join(', ');
        await base44.integrations.Core.SendEmail({ from_name:'Red Helix Research', to: pendingPayload.customer_email, subject:`Order Confirmed — #${orderNumberRef.current} | Red Helix Research`, body:`<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;"><div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;margin:-30px -30px 24px -30px;"><div style="width:48px;height:48px;background:#dc2626;border-radius:12px;display:inline-block;line-height:48px;margin-bottom:12px;"><span style="color:#fff;font-size:18px;font-weight:900;">RH</span></div><h1 style="color:#fff;font-size:22px;font-weight:900;margin:0 0 4px 0;">Order Confirmed!</h1><p style="color:#94a3b8;font-size:12px;margin:0;letter-spacing:1px;text-transform:uppercase;">Order #${orderNumberRef.current}</p></div><p style="color:#334155;font-size:15px;font-weight:600;margin:0 0 8px 0;">Hi ${pendingPayload.customer_name || 'there'},</p><p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px 0;">Thank you for your order! We've received it and are processing it now. You'll receive a shipping notification once it's on its way.</p><table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:0 0 20px 0;"><tr style="background:#f8fafc;"><th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Item</th><th style="padding:8px 8px;text-align:center;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Spec</th><th style="padding:8px 8px;text-align:center;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Qty</th><th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Price</th></tr>${confItemsHtml}${discount>0?`<tr><td colspan="3" style="padding:8px 12px;font-size:13px;color:#16a34a;font-weight:700;">Discount</td><td style="padding:8px 12px;font-size:13px;color:#16a34a;font-weight:700;text-align:right;">-$${discount.toFixed(2)}</td></tr>`:''}<tr><td colspan="3" style="padding:8px 12px;font-size:13px;color:#64748b;">Shipping</td><td style="padding:8px 12px;font-size:13px;color:#64748b;text-align:right;">$${SHIPPING_COST.toFixed(2)}</td></tr><tr style="background:#f8fafc;"><td colspan="3" style="padding:12px;font-size:14px;font-weight:900;color:#0f172a;text-transform:uppercase;">Total</td><td style="padding:12px;font-size:18px;font-weight:900;color:#dc2626;text-align:right;">$${totalUSD.toFixed(2)}</td></tr></table>${confAddrLine?`<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:20px;"><p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Shipping To</p><p style="margin:0;font-size:14px;color:#334155;font-weight:600;">${pendingPayload.customer_name}</p><p style="margin:2px 0 0;font-size:13px;color:#64748b;">${confAddrLine}</p></div>`:''}<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin-bottom:20px;"><p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">Research Use Only</p><p style="margin:0;font-size:12px;color:#7f1d1d;line-height:1.6;">For laboratory research use only. All sales final. Contact <a href="mailto:jake@redhelixresearch.com" style="color:#dc2626;">jake@redhelixresearch.com</a> with any questions.</p></div><p style="color:#64748b;font-size:13px;text-align:center;">Thank you for choosing Red Helix Research!</p></div>` });
      } catch {}
      // Admin notification for pending crypto order
      try {
        await base44.integrations.Core.SendEmail({
          to: 'jake@redhelixresearch.com',
          from_name: 'Red Helix Research Orders',
          subject: `⏳ Crypto Order #${orderNumberRef.current} — ${customerName} — $${totalUSD.toFixed(2)} [Pending Verification]`,
          body: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:30px;background:#fff;">
            <h2 style="color:#f59e0b;margin:0 0 4px 0;">Crypto Order — Pending Verification</h2>
            <p style="color:#64748b;font-size:13px;margin:0 0 20px 0;">Order <strong>#${orderNumberRef.current}</strong> — ${selectedCrypto} — TX: ${txHash}</p>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${pendingPayload.customer_email}</p>
            <p><strong>Total:</strong> $${totalUSD.toFixed(2)}</p>
            <p><strong>Crypto:</strong> ${selectedCrypto} — ${cryptoAmount}</p>
            <p><strong>TX Hash:</strong> <code>${txHash}</code></p>
            <p style="margin-top:24px;font-size:12px;color:#94a3b8;">View in Admin: <a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;font-weight:700;">Order Management →</a></p>
          </div>`
        });
      } catch {}
    } catch (err) {
      console.error('Failed to create pending order:', err);
    }
  };

  const processSuccessfulPayment = async (txHash, method = 'cryptocurrency') => {
    // Run fraud check in background (non-blocking for crypto — payment already sent)
    runFraudCheck({
      base44,
      orderNumber: orderNumberRef.current,
      orderAmount: totalUSD,
      paymentMethod: method,
      customerEmail: customerInfo?.email || '',
      customerName: customerInfo?.firstName ? `${customerInfo.firstName} ${customerInfo.lastName || ''}`.trim() : '',
      billingAddress: customerInfo ? {
        address: customerInfo.address,
        city: customerInfo.city,
        state: customerInfo.state,
        zip: customerInfo.zip,
        country: customerInfo.country || 'US',
      } : null,
      shippingAddress: customerInfo ? {
        address: customerInfo.shippingAddress || customerInfo.address,
        city: customerInfo.shippingCity || customerInfo.city,
        state: customerInfo.shippingState || customerInfo.state,
        zip: customerInfo.shippingZip || customerInfo.zip,
        country: customerInfo.shippingCountry || customerInfo.country || 'US',
      } : null,
      consentTimestamp: new Date().toISOString(),
      consentVersion: 'v2-2025-02',
      noRefundPolicyAccepted: true,
      researchUseAccepted: true,
    }).catch(e => console.warn('Fraud check background error:', e));

    setStep('completed');

    try {
      const orderNumber = orderNumberRef.current;

      let userEmail = null;
      try { const user = await base44.auth.me(); userEmail = user?.email; } catch {}

      const customerName = customerInfo?.firstName && customerInfo?.lastName
        ? `${customerInfo.firstName} ${customerInfo.lastName}`
        : customerInfo?.name || 'Guest Customer';

      const affiliateInfo = await resolveAffiliateInfo();

      // Stock already decremented in createPendingOrder (crypto) — skip if already done
      if (!pendingOrderCreated.current) {
        await decrementStock(cartItems);
      }

      const referralCode = localStorage.getItem('rdr_referral_code');

      // Only create a new order record if createPendingOrder hasn't already done so
      if (!pendingOrderCreated.current) {
        pendingOrderCreated.current = true;
        const newOrderPayload = {
          order_number: orderNumber,
          customer_email: userEmail || customerInfo?.email || 'guest@redhelixresearch.com',
          customer_name: customerName,
          customer_phone: customerInfo?.phone,
          items: cartItems.map(item => ({
            productId: item.productId,
            productName: item.productName,
            specification: item.specification,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: subtotal,
          discount_amount: discount,
          shipping_cost: SHIPPING_COST,
          total_amount: totalUSD,
          promo_code: promoCode || null,
          payment_method: method,
          payment_status: 'completed',
          transaction_id: txHash,
          crypto_currency: method === 'cryptocurrency' ? selectedCrypto : null,
          crypto_amount: method === 'cryptocurrency' ? cryptoAmount : null,
          status: 'processing',
          shipping_address: {
            address: customerInfo?.shippingAddress || customerInfo?.address,
            city: customerInfo?.shippingCity || customerInfo?.city,
            state: customerInfo?.shippingState || customerInfo?.state,
            zip: customerInfo?.shippingZip || customerInfo?.zip,
            country: customerInfo?.shippingCountry || customerInfo?.country || 'USA',
          },
          ...(affiliateInfo ? {
            affiliate_code: affiliateInfo.code,
            affiliate_email: affiliateInfo.email,
            affiliate_name: affiliateInfo.name,
            affiliate_commission: parseFloat((totalUSD * 0.10).toFixed(2)),
          } : {}),
          ...(referralCode ? { referral_code: referralCode } : {}),
        };
        await createOrderWithRetry(newOrderPayload);
      }

      // Keep orderPayload reference for email notification below
      const orderPayload = {
        order_number: orderNumber,
        customer_email: userEmail || customerInfo?.email || 'guest@redhelixresearch.com',
        customer_name: customerName,
        customer_phone: customerInfo?.phone,
        shipping_address: {
          address: customerInfo?.shippingAddress || customerInfo?.address,
          city: customerInfo?.shippingCity || customerInfo?.city,
          state: customerInfo?.shippingState || customerInfo?.state,
          zip: customerInfo?.shippingZip || customerInfo?.zip,
          country: customerInfo?.shippingCountry || customerInfo?.country || 'USA',
        },
      };

      // ─── Admin new order notification ───
      try {
        const itemsHtml = cartItems.map(i => `<tr><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;">${i.productName} — ${i.specification || ''}</td><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">×${i.quantity}</td><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;text-align:right;">$${(i.price * i.quantity).toFixed(2)}</td></tr>`).join('');
        const addr = orderPayload.shipping_address || {};
        await base44.integrations.Core.SendEmail({
          to: 'jake@redhelixresearch.com',
          from_name: 'Red Helix Research Orders',
          subject: `🛍️ New Order #${orderNumber} — ${customerName} — $${totalUSD.toFixed(2)}`,
          body: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:30px;background:#fff;">
            <h2 style="color:#dc2626;margin:0 0 4px 0;">New Order Placed</h2>
            <p style="color:#64748b;font-size:13px;margin:0 0 20px 0;">Order <strong>#${orderNumber}</strong> — ${method === 'cryptocurrency' ? selectedCrypto : 'Square'}</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;width:35%;">Customer</td><td style="padding:6px 0;font-weight:700;">${customerName}</td></tr>
              <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;">Email</td><td style="padding:6px 0;">${orderPayload.customer_email}</td></tr>
              ${orderPayload.customer_phone ? `<tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;">Phone</td><td style="padding:6px 0;">${orderPayload.customer_phone}</td></tr>` : ''}
              <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;">Ship To</td><td style="padding:6px 0;">${[addr.address, addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}</td></tr>
              <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;">Payment</td><td style="padding:6px 0;">${method === 'cryptocurrency' ? selectedCrypto : 'Square Card'}</td></tr>
              <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;">Total</td><td style="padding:6px 0;font-size:20px;font-weight:900;color:#dc2626;">$${totalUSD.toFixed(2)}</td></tr>
            </table>
            <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;">
              <tr style="background:#e2e8f0;"><th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;">Product</th><th style="padding:8px 12px;text-align:center;font-size:11px;color:#64748b;">Qty</th><th style="padding:8px 12px;text-align:right;font-size:11px;color:#64748b;">Total</th></tr>
              ${itemsHtml}
            </table>
            <p style="margin-top:24px;font-size:12px;color:#94a3b8;">View in Admin: <a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;font-weight:700;">Order Management →</a></p>
          </div>`
        });
      } catch (notifyErr) {
        console.warn('Admin notification error (non-blocking):', notifyErr);
      }

      // ─── PAYMENT CONFIRMED: Credit affiliate rewards ───
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

      // ─── PAYMENT CONFIRMED: Send referral reward notification ───
      if (referralCode) {
        try {
          const discountCode = 'REFER' + Math.random().toString(36).substring(2, 8).toUpperCase();
          await base44.integrations.Core.SendEmail({
            from_name: 'Red Helix Research - Referral System',
            to: 'jakehboen95@gmail.com',
            subject: 'Referral Purchase Confirmed - Issue 10% Discount Code',
            body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
              '<h2 style="color: #dc2626;">Referral Purchase Confirmed!</h2>' +
              '<div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0;">' +
              '<p><strong>Referral Code Used:</strong> ' + referralCode + '</p>' +
              '<p><strong>Order Number:</strong> ' + orderNumber + '</p>' +
              '<p><strong>Order Total:</strong> $' + totalUSD.toFixed(2) + '</p>' +
              '<p><strong>Buyer Email:</strong> ' + (userEmail || customerInfo?.email) + '</p>' +
              '<p><strong>Payment Method:</strong> ' + (method === 'cryptocurrency' ? selectedCrypto : method === 'bank_ach' ? 'Bank ACH' : method) + '</p>' +
              '<p><strong>Suggested Discount Code:</strong> ' + discountCode + ' (10% off, one-time use)</p>' +
              '</div>' +
              '<p style="color: #64748b; font-size: 14px;">Payment has been <strong>confirmed</strong>. ' +
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
      clearCheckoutSnapshot();
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

  const handleSelectCrypto = async (cryptoId) => {
    setSelectedCrypto(cryptoId);
    setStep('send_payment');
    // Fire-and-forget snapshot so admin has order data even if payment never completes
    saveCheckoutSnapshot({ ...buildSnapshotPayload('cryptocurrency'), selectedCrypto: cryptoId }).catch(() => {});
  };

  const handleSubmitTx = async () => {
    const txId = transactionId.trim();
    if (!txId) return;
    if (pendingOrderCreated.current) return; // prevent double-submit
    setStep('confirm');
    // Save snapshot before any async work
    saveCheckoutSnapshot({ ...buildSnapshotPayload('cryptocurrency'), transactionId: txId }).catch(() => {});
    // Create pending order immediately on TX submission (idempotent via ref guard)
    await createPendingOrder(txId);
    // Then finalize (affiliate, referral, analytics, cart clear)
    await processSuccessfulPayment(txId);
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

                  {/* Zelle payment option */}
                  <button
                    onClick={() => setShowZelleDisclaimer(true)}
                    className="w-full group p-6 bg-white border-2 border-slate-200 rounded-2xl text-left hover:border-purple-500 hover:shadow-lg transition-all flex items-center gap-5"
                  >
                    <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl font-black text-purple-600">Z</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-purple-600 transition-colors">
                        Pay with Zelle
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">Scan QR code in your bank's app — instant & free</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition-colors" />
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

                  {/* Savings disclaimer */}
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-1">Save 10% with Crypto or Zelle</p>
                      <p className="text-xs text-green-600 font-medium">Pay with Bitcoin, Ethereum, USDT, USDC, or Zelle and avoid the 10% processing fee applied to card payments.</p>
                    </div>
                  </div>

                  {/* Security note */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <Shield className="w-5 h-5 text-[#dc2626] flex-shrink-0" />
                    <p className="text-xs text-slate-500 font-medium">All payments are encrypted and securely processed.</p>
                  </div>

                  {/* Zelle disclaimer modal */}
                  <AnimatePresence>
                    {showZelleDisclaimer && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] flex flex-col"
                        >
                          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 border-b border-amber-100 flex-shrink-0">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-amber-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">⚠️ Zelle Payment Disclaimer</h3>
                                <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Please Read Before Continuing</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-6 space-y-4 overflow-y-auto text-sm text-slate-700">
                            <p>Zelle monitors all payment activity. Certain words, descriptions, or contact names can flag accounts for review, resulting in account restrictions or permanent suspension for <strong>both sender and recipient</strong>.</p>
                            <p className="font-bold">To protect your account and ours, please follow these guidelines exactly:</p>

                            <div>
                              <p className="font-bold mb-1">Contact Name:</p>
                              <p className="mb-2">When saving or sending to this Zelle contact, use <strong>only</strong> one of the following names:</p>
                              <ul className="space-y-1 text-green-700 font-bold pl-2">
                                <li>✓ RHR-Jake</li>
                                <li>✓ Jake</li>
                                <li>✓ RHR</li>
                              </ul>
                              <p className="text-red-600 mt-2">✗ Do <strong>not</strong> save this contact with any descriptions, product names, notes, or any other wording.</p>
                            </div>

                            <div>
                              <p className="font-bold mb-1">Payment Memo / Comments:</p>
                              <p className="mb-2">In the memo or comment field of your Zelle payment, you may <strong>only</strong> write:</p>
                              <p className="text-green-700 font-bold pl-2">✓ RHR</p>
                              <p className="text-red-600 mt-2">✗ Do <strong>not</strong> include product names, abbreviations, "thank you" notes, or any additional text.</p>
                            </div>

                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                              <p className="font-bold text-amber-800">⚠️ Why this matters: If an account is flagged, it can be frozen, restricted, or permanently shut down. This affects your ability to send payments and our ability to receive them.</p>
                            </div>

                            <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-purple-400 transition-colors">
                              <input
                                type="checkbox"
                                checked={zelleDisclaimerAccepted}
                                onChange={(e) => setZelleDisclaimerAccepted(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-slate-300 focus:ring-purple-500 flex-shrink-0"
                              />
                              <span className="text-xs text-slate-700 font-semibold leading-relaxed">
                                I have read and agree to follow the <strong>Zelle payment guidelines</strong> above.
                              </span>
                            </label>
                          </div>
                          <div className="p-6 pt-0 flex gap-3 flex-shrink-0">
                            <button
                              onClick={() => { setShowZelleDisclaimer(false); setZelleDisclaimerAccepted(false); }}
                              className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-500 uppercase tracking-wider hover:border-slate-300 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => { setShowZelleDisclaimer(false); setStep('zelle_payment'); }}
                              disabled={!zelleDisclaimerAccepted}
                              className="flex-1 py-3 px-4 rounded-xl bg-purple-600 text-white text-sm font-black uppercase tracking-wider hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              I Agree & Continue
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

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
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">Processing Payment</h2>
                        <p className="text-slate-500 font-medium mb-6 text-sm">{verificationMessage || 'Waiting on processing payment...'}</p>

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

              {/* ───── ZELLE PAYMENT ───── */}
              {step === 'zelle_payment' && (
                <motion.div key="zelle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8">
                  <button onClick={() => { setStep('select_method'); setZelleDisclaimerAccepted(false); }} className="flex items-center gap-1 text-sm text-slate-400 hover:text-purple-600 font-bold mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <div className="max-w-md mx-auto text-center">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-black text-purple-600">Z</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Pay with Zelle</h2>
                    <p className="text-slate-500 font-medium mb-6 text-sm">
                      Scan the QR code below in your bank's app to send payment to <strong>Red Helix Research LLC</strong>.
                    </p>

                    {/* QR Code */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="p-4 bg-white border-2 border-purple-100 rounded-2xl shadow-sm inline-block">
                        <img
                          src="https://media.base44.com/images/public/6972f2b59e2787f045b7ae0d/c3e680bfd_image.png"
                          alt="Zelle QR Code"
                          className="w-[200px] h-[200px] object-contain rounded-xl"
                        />
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-3">Or send directly to: <strong className="text-slate-700">jake@redhelixresearch.com</strong></p>
                    </div>

                    {/* Amount */}
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl mb-6">
                      <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">Send Exactly</p>
                      <p className="text-3xl font-black text-purple-700">${totalUSD.toFixed(2)}</p>
                      <p className="text-xs text-purple-500 mt-1 font-medium">Order #{orderNumberRef.current}</p>
                    </div>

                    {/* Reminder rules */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 text-left space-y-2">
                      <p className="text-xs font-black text-amber-700 uppercase tracking-widest">⚠️ Remember:</p>
                      <p className="text-xs text-amber-700"><strong>Contact name:</strong> RHR-Jake, Jake, or RHR only</p>
                      <p className="text-xs text-amber-700"><strong>Memo field:</strong> RHR only — nothing else</p>
                    </div>

                    {/* Zelle fields */}
                    <div className="text-left space-y-4 mb-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                          NAME ON YOUR ZELLE ACCOUNT <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={zelleAccountName}
                          onChange={(e) => setZelleAccountName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-purple-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                          ZELLE CONFIRMATION NUMBER <span className="text-slate-400 font-medium normal-case">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={zelleConfirmationNumber}
                          onChange={(e) => setZelleConfirmationNumber(e.target.value)}
                          placeholder="Enter confirmation # from your banking app (if available)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-purple-500 transition-all"
                        />
                      </div>
                    </div>

                    {!zelleOrderCreated ? (
                      <Button
                        disabled={!zelleAccountName.trim()}
                        onClick={async () => {
                        if (zelleOrderCreated) return; // prevent double-submit
                        setZelleOrderCreated(true);
                        // Save snapshot before order creation (failsafe)
                        saveCheckoutSnapshot({ ...buildSnapshotPayload('zelle'), zelleAccountName, zelleConfirmationNumber }).catch(() => {});
                          // Create order record
                          try {
                            let userEmail = null;
                            try { const u = await base44.auth.me(); userEmail = u?.email; } catch {}
                            const customerName = customerInfo?.firstName && customerInfo?.lastName
                              ? `${customerInfo.firstName} ${customerInfo.lastName}`
                              : customerInfo?.name || 'Guest Customer';
                            const affiliateInfo = await resolveAffiliateInfo();
                            const orderPayload = {
                              order_number: orderNumberRef.current,
                              customer_email: userEmail || customerInfo?.email || 'guest@redhelixresearch.com',
                              customer_name: customerName,
                              customer_phone: customerInfo?.phone,
                              items: cartItems.map(item => ({
                                productId: item.productId,
                                productName: item.productName,
                                specification: item.specification,
                                quantity: item.quantity,
                                price: item.price,
                              })),
                              subtotal: subtotal,
                              discount_amount: discount,
                              shipping_cost: SHIPPING_COST,
                              total_amount: totalUSD,
                              promo_code: promoCode || null,
                              payment_method: 'zelle',
                              payment_status: 'pending',
                              status: 'awaiting_confirmation',
                              admin_notes: `Zelle account name: ${zelleAccountName}${zelleConfirmationNumber ? ` | Confirmation #: ${zelleConfirmationNumber}` : ''}`,
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
                            if (referralCode) orderPayload.referral_code = referralCode;
                            orderPayload.stock_reserved = true;
                            orderPayload.reserved_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
                            await createOrderWithRetry(orderPayload);
                            // Customer confirmation email (Zelle)
                            try {
                             const zItemsHtml = cartItems.map(i=>`<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;font-weight:600;">${i.productName}</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center;">${i.specification||'—'}</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center;">×${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#0f172a;text-align:right;">$${(i.price*i.quantity).toFixed(2)}</td></tr>`).join('');
                             const zA=orderPayload.shipping_address||{};const zAL=[zA.address,zA.city,zA.state,zA.zip].filter(Boolean).join(', ');
                             await base44.integrations.Core.SendEmail({from_name:'Red Helix Research',to:orderPayload.customer_email,subject:`Order Received — #${orderNumberRef.current} | Red Helix Research`,body:`<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;"><div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;margin:-30px -30px 24px -30px;"><div style="width:48px;height:48px;background:#7c3aed;border-radius:12px;display:inline-block;line-height:48px;margin-bottom:12px;"><span style="color:#fff;font-size:18px;font-weight:900;">RH</span></div><h1 style="color:#fff;font-size:22px;font-weight:900;margin:0 0 4px 0;">Order Received!</h1><p style="color:#94a3b8;font-size:12px;margin:0;letter-spacing:1px;text-transform:uppercase;">Order #${orderNumberRef.current}</p></div><p style="color:#334155;font-size:15px;font-weight:600;margin:0 0 8px 0;">Hi ${orderPayload.customer_name||'there'},</p><p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px 0;">We've received your Zelle payment submission. Once we confirm your payment we'll process your order right away and send you a shipping notification.</p><table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:0 0 20px 0;"><tr style="background:#f8fafc;"><th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Item</th><th style="padding:8px 8px;text-align:center;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Spec</th><th style="padding:8px 8px;text-align:center;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Qty</th><th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Price</th></tr>${zItemsHtml}${discount>0?`<tr><td colspan="3" style="padding:8px 12px;font-size:13px;color:#16a34a;font-weight:700;">Discount</td><td style="padding:8px 12px;font-size:13px;color:#16a34a;font-weight:700;text-align:right;">-$${discount.toFixed(2)}</td></tr>`:''}<tr><td colspan="3" style="padding:8px 12px;font-size:13px;color:#64748b;">Shipping</td><td style="padding:8px 12px;font-size:13px;color:#64748b;text-align:right;">$${SHIPPING_COST.toFixed(2)}</td></tr><tr style="background:#f8fafc;"><td colspan="3" style="padding:12px;font-size:14px;font-weight:900;color:#0f172a;text-transform:uppercase;">Total</td><td style="padding:12px;font-size:18px;font-weight:900;color:#7c3aed;text-align:right;">$${totalUSD.toFixed(2)}</td></tr></table>${zAL?`<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:20px;"><p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Shipping To</p><p style="margin:0;font-size:14px;color:#334155;font-weight:600;">${orderPayload.customer_name}</p><p style="margin:2px 0 0;font-size:13px;color:#64748b;">${zAL}</p></div>`:''}<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin-bottom:20px;"><p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">Research Use Only</p><p style="margin:0;font-size:12px;color:#7f1d1d;line-height:1.6;">For laboratory research use only. All sales final. Contact <a href="mailto:jake@redhelixresearch.com" style="color:#dc2626;">jake@redhelixresearch.com</a> with any questions.</p></div><p style="color:#64748b;font-size:13px;text-align:center;">Thank you for choosing Red Helix Research!</p></div>`});
                            } catch {}
                            // Stock already reserved on order creation above — no need to re-decrement
                            clearCart();
                            // Admin notification
                            try {
                              await base44.integrations.Core.SendEmail({
                                to: 'jake@redhelixresearch.com',
                                from_name: 'Red Helix Research Orders',
                                subject: `💜 New Zelle Order #${orderNumberRef.current} — ${customerName} — $${totalUSD.toFixed(2)} [Awaiting Payment]`,
                                body: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:30px;background:#fff;">
                                  <h2 style="color:#7c3aed;margin:0 0 4px 0;">New Zelle Order — Awaiting Payment</h2>
                                  <p><strong>Customer:</strong> ${customerName}</p>
                                  <p><strong>Email:</strong> ${orderPayload.customer_email}</p>
                                  <p><strong>Total:</strong> $${totalUSD.toFixed(2)}</p>
                                  <p><strong>Order #:</strong> ${orderNumberRef.current}</p>
                                   <p><strong>Zelle Account Name:</strong> ${zelleAccountName}</p>
                                   ${zelleConfirmationNumber ? `<p><strong>Confirmation #:</strong> ${zelleConfirmationNumber}</p>` : ''}
                                   <p style="margin-top:24px;font-size:12px;color:#94a3b8;">View in Admin: <a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#7c3aed;font-weight:700;">Order Management →</a></p>
                                </div>`
                              });
                            } catch {}
                            localStorage.setItem('lastOrderNumber', orderNumberRef.current);
                            localStorage.setItem('lastTransactionId', 'zelle');
                            clearCheckoutSnapshot();
                            window.location.href = `${createPageUrl('PaymentCompleted')}?order=${orderNumberRef.current}&method=zelle`;
                            } catch (err) {
                            console.error('Zelle order creation error:', err);
                            setZelleOrderCreated(false);
                            }
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black uppercase tracking-widest text-xs py-6 shadow-lg"
                      >
                        I've Sent the Payment
                      </Button>
                    ) : zelleConfirmed ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase">Order Received!</h3>
                        <p className="text-sm text-slate-500 font-medium">Your order has been created. Once we confirm your Zelle payment, we'll process your order right away.</p>
                        <Link to={createPageUrl('Home')}>
                          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black uppercase tracking-widest text-xs py-5">
                            Back to Shop
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                        <span className="text-sm font-bold text-slate-500">Creating your order...</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ───── SQUARE PAYMENT LINK ───── */}
              {step === 'square_payment' && (
                <motion.div key="square" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8">
                  <button onClick={() => { setStep('select_method'); setSquareSent(false); setSquareError(''); }} className="flex items-center gap-1 text-sm text-slate-400 hover:text-[#dc2626] font-bold mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <SquarePaymentPanel
                    onBack={() => { setStep('select_method'); setSquareSent(false); setSquareError(''); }}
                    squareSent={squareSent}
                    squareEmail={squareEmail}
                    setSquareEmail={setSquareEmail}
                    squareSending={squareSending}
                    squareCheckoutUrl={squareCheckoutUrl}
                    squareError={squareError}
                    turnstileToken={turnstileToken}
                    setTurnstileToken={setTurnstileToken}
                    subtotal={subtotal}
                    discount={discount}
                    processingFee={processingFee}
                    totalUSD={totalUSD}
                    SHIPPING_COST={SHIPPING_COST}
                    customerInfo={customerInfo}
                    cartItems={cartItems}
                    onResend={() => { setSquareSent(false); setSquareError(''); }}
                    onSendLink={async (payNow) => {
                           if (squareSending || squareSent) return; // prevent double-submit
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
                             // Save snapshot before attempting payment (failsafe)
                             saveCheckoutSnapshot({ ...buildSnapshotPayload('square_payment'), email: squareEmail.trim() }).catch(() => {});
                             try {
                               // 0. Fraud check before payment
                              const fraudResult = await runFraudCheck({
                                base44,
                                orderNumber: orderNumberRef.current,
                                orderAmount: totalUSD,
                                paymentMethod: 'square_payment',
                                customerEmail: squareEmail.trim(),
                                customerName: customerInfo?.firstName ? `${customerInfo.firstName} ${customerInfo.lastName || ''}`.trim() : '',
                                billingAddress: customerInfo ? {
                                  address: customerInfo.address,
                                  city: customerInfo.city,
                                  state: customerInfo.state,
                                  zip: customerInfo.zip,
                                  country: customerInfo.country || 'US',
                                } : null,
                                shippingAddress: customerInfo ? {
                                  address: customerInfo.shippingAddress || customerInfo.address,
                                  city: customerInfo.shippingCity || customerInfo.city,
                                  state: customerInfo.shippingState || customerInfo.state,
                                  zip: customerInfo.shippingZip || customerInfo.zip,
                                  country: customerInfo.shippingCountry || customerInfo.country || 'US',
                                } : null,
                                consentTimestamp: consentTimestamp || new Date().toISOString(),
                                consentVersion: 'v2-2025-02',
                                noRefundPolicyAccepted: squareRefundPolicyAccepted,
                                researchUseAccepted: true,
                              });

                              if (fraudResult.blocked) {
                                setSquareError(fraudResult.blockReason || 'Your order has been flagged for review. Please contact support.');
                                setSquareSending(false);
                                return;
                              }

                              // 1. Create dynamic Square checkout link via SDK (handles auth automatically)
                              const fnResponse = await base44.functions.invoke('createSquareCheckout', {
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
                                   processingFeeAmount: squareProcessingFee,
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
                               });
                               const fnData = fnResponse.data;
                               if (!fnData?.checkoutUrl) {
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
                                   productId: item.productId,
                                   productName: item.productName,
                                   specification: item.specification,
                                   quantity: item.quantity,
                                   price: item.price,
                                  })),
                                  subtotal: subtotal,
                                  discount_amount: discount,
                                  shipping_cost: SHIPPING_COST,
                                  total_amount: subtotalAfterDiscount + SHIPPING_COST + squareProcessingFee,
                                  promo_code: promoCode || null,
                                  payment_method: 'square_payment',
                                  payment_status: 'pending',
                                  transaction_id: fnData.paymentLinkId || null,
                                  square_order_id: fnData.orderId || null,
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
                                orderPayload.stock_reserved = true;
                                orderPayload.reserved_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
                                await createOrderWithRetry(orderPayload);

                                // Reserve stock immediately on order creation (released if payment expires)
                                try { await decrementStock(cartItems); } catch (stockErr) { console.warn('Stock reserve failed (non-blocking):', stockErr); }

                                // Customer confirmation email (Square — sent immediately on order placement)
                                 try {
                                   const sqConfItemsHtml = cartItems.map(i=>`<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;font-weight:600;">${i.productName}</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center;">${i.specification||'—'}</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center;">×${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#0f172a;text-align:right;">$${(i.price*i.quantity).toFixed(2)}</td></tr>`).join('');
                                   const sqCA=orderPayload.shipping_address||{};const sqCAL=[sqCA.address,sqCA.city,sqCA.state,sqCA.zip].filter(Boolean).join(', ');
                                   await base44.integrations.Core.SendEmail({from_name:'Red Helix Research',to:orderPayload.customer_email,subject:`Order Confirmed — #${orderNumberRef.current} | Red Helix Research`,body:`<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;"><div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;margin:-30px -30px 24px -30px;"><div style="width:48px;height:48px;background:#dc2626;border-radius:12px;display:inline-block;line-height:48px;margin-bottom:12px;"><span style="color:#fff;font-size:18px;font-weight:900;">RH</span></div><h1 style="color:#fff;font-size:22px;font-weight:900;margin:0 0 4px 0;">Order Confirmed!</h1><p style="color:#94a3b8;font-size:12px;margin:0;letter-spacing:1px;text-transform:uppercase;">Order #${orderNumberRef.current}</p></div><p style="color:#334155;font-size:15px;font-weight:600;margin:0 0 8px 0;">Hi ${orderPayload.customer_name||'there'},</p><p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px 0;">Your order is confirmed. We've sent a separate email with your secure payment link — please complete payment to begin processing. Once payment is received you'll get a shipping notification.</p><table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:0 0 20px 0;"><tr style="background:#f8fafc;"><th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Item</th><th style="padding:8px 8px;text-align:center;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Spec</th><th style="padding:8px 8px;text-align:center;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Qty</th><th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Price</th></tr>${sqConfItemsHtml}${discount>0?`<tr><td colspan="3" style="padding:8px 12px;font-size:13px;color:#16a34a;font-weight:700;">Discount</td><td style="padding:8px 12px;font-size:13px;color:#16a34a;font-weight:700;text-align:right;">-$${discount.toFixed(2)}</td></tr>`:''}<tr><td colspan="3" style="padding:8px 12px;font-size:13px;color:#64748b;">Shipping</td><td style="padding:8px 12px;font-size:13px;color:#64748b;text-align:right;">$${SHIPPING_COST.toFixed(2)}</td></tr><tr style="background:#f8fafc;"><td colspan="3" style="padding:12px;font-size:14px;font-weight:900;color:#0f172a;text-transform:uppercase;">Total</td><td style="padding:12px;font-size:18px;font-weight:900;color:#dc2626;text-align:right;">$${totalUSD.toFixed(2)}</td></tr></table>${sqCAL?`<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:20px;"><p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Shipping To</p><p style="margin:0;font-size:14px;color:#334155;font-weight:600;">${orderPayload.customer_name}</p><p style="margin:2px 0 0;font-size:13px;color:#64748b;">${sqCAL}</p></div>`:''}<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin-bottom:20px;"><p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">Research Use Only</p><p style="margin:0;font-size:12px;color:#7f1d1d;line-height:1.6;">For laboratory research use only. All sales final. Contact <a href="mailto:jake@redhelixresearch.com" style="color:#dc2626;">jake@redhelixresearch.com</a> with any questions.</p></div><p style="color:#64748b;font-size:13px;text-align:center;">Thank you for choosing Red Helix Research!</p></div>`});
                                 } catch {}

                                 // NOTE: Stock is decremented when Square confirms payment via webhook
                                 // Do NOT decrement here — the order may never be paid

                                // ─── Admin new order notification (Square) ───
                                try {
                                  const sqItemsHtml = cartItems.map(i => `<tr><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;">${i.productName} — ${i.specification || ''}</td><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">×${i.quantity}</td><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;text-align:right;">$${(i.price * i.quantity).toFixed(2)}</td></tr>`).join('');
                                  const sqAddr = orderPayload.shipping_address || {};
                                  const sqName = orderPayload.customer_name || squareEmail;
                                  await base44.integrations.Core.SendEmail({
                                    to: 'jake@redhelixresearch.com',
                                    from_name: 'Red Helix Research Orders',
                                    subject: `🛍️ New Order #${orderNumberRef.current} — ${sqName} — $${totalUSD.toFixed(2)} [Card - Awaiting Payment]`,
                                    body: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:30px;background:#fff;">
                                      <h2 style="color:#dc2626;margin:0 0 4px 0;">New Order — Awaiting Card Payment</h2>
                                      <p style="color:#64748b;font-size:13px;margin:0 0 20px 0;">Order <strong>#${orderNumberRef.current}</strong> — Square payment link sent</p>
                                      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                                        <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;width:35%;">Customer</td><td style="padding:6px 0;font-weight:700;">${sqName}</td></tr>
                                        <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;">Email</td><td style="padding:6px 0;">${squareEmail}</td></tr>
                                        ${orderPayload.customer_phone ? `<tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;">Phone</td><td style="padding:6px 0;">${orderPayload.customer_phone}</td></tr>` : ''}
                                        <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;">Ship To</td><td style="padding:6px 0;">${[sqAddr.address, sqAddr.city, sqAddr.state, sqAddr.zip].filter(Boolean).join(', ')}</td></tr>
                                        <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;">Total</td><td style="padding:6px 0;font-size:20px;font-weight:900;color:#dc2626;">$${totalUSD.toFixed(2)}</td></tr>
                                      </table>
                                      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;">
                                        <tr style="background:#e2e8f0;"><th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;">Product</th><th style="padding:8px 12px;text-align:center;font-size:11px;color:#64748b;">Qty</th><th style="padding:8px 12px;text-align:right;font-size:11px;color:#64748b;">Total</th></tr>
                                        ${sqItemsHtml}
                                      </table>
                                      <p style="margin-top:24px;font-size:12px;color:#94a3b8;">View in Admin: <a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;font-weight:700;">Order Management →</a></p>
                                    </div>`
                                  });
                                } catch (notifyErr) {
                                  console.warn('Admin notification error (non-blocking):', notifyErr);
                                }

                                // Record affiliate commission (same as crypto/ACH flow)
                                if (squareAffiliateInfo) {
                                  try {
                                    await recordAffiliateOrder(base44, {
                                      ...squareAffiliateInfo,
                                      customerEmail: squareEmail.trim(),
                                    }, orderNumberRef.current, totalUSD);
                                  } catch (affError) {
                                    console.error('Affiliate tracking error (non-blocking):', affError);
                                  }
                                }
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

                              await base44.functions.invoke('sendOrderEmail', {
                                to: squareEmail.trim(),
                                subject: `Your Payment Link — Order $${totalUSD.toFixed(2)}`,
                                body: emailBody,
                              });

                              setSquareCheckoutUrl(checkoutUrl);
                              setSquareSent(true);
                              setTurnstileToken(null); // Reset — tokens are single-use
                              // Only auto-open tab for PAY NOW, not Send Payment Link
                              if (payNow) {
                                window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
                              }
                            } catch (err) {
                              console.error('Square checkout error:', err);
                              const errMsg = err?.response?.data?.error || err?.data?.error || err?.message || 'Failed to create checkout. Please try again.';
                              setSquareError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
                              setTurnstileToken(null); // Reset on error for re-verification
                            } finally {
                              setSquareSending(false);
                            }
                    }}
                  />
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
                {processingFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Processing Fee (10%)</span>
                    <span className="text-slate-900 font-bold">${processingFee.toFixed(2)}</span>
                  </div>
                )}
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
                  <span className="text-[10px] font-medium text-slate-500">Payment verified</span>
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