import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Wallet,
  Copy,
  Check,
  AlertCircle,
  ArrowLeft,
  Loader2,
  RefreshCw,
  ExternalLink,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Zap,
  Link as LinkIcon,
  QrCode,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getCart,
  getCartTotal,
  clearCart,
  getPromoCode,
  getDiscountAmount
} from '@/components/utils/cart';
import { trackPurchase } from '@/utils/hubspotAnalytics';
import CryptoWalletHelp from '@/components/crypto/CryptoWalletHelp';
import { base44 } from '@/api/base44Client';
import PCIComplianceBadge from '@/components/PCIComplianceBadge';
import PlaidACHCheckout from '@/components/payment/PlaidACHCheckout';

// Supported wallet configurations
const WALLET_CONFIGS = {
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '💰',
    color: '#0052FF',
    deepLink: 'https://www.coinbase.com/wallet',
    chains: ['ETH', 'BTC', 'USDT', 'USDC'],
    detectProvider: () => typeof window !== 'undefined' && (window.ethereum?.isCoinbaseWallet || window.coinbaseWalletExtension),
  },
  cashapp: {
    id: 'cashapp',
    name: 'Cash App',
    icon: '💚',
    color: '#00D632',
    deepLink: null,
    chains: ['BTC'],
    detectProvider: () => true,
  },
  manual: {
    id: 'manual',
    name: 'Manual Payment',
    icon: '📋',
    color: '#78716c',
    deepLink: null,
    chains: ['ETH', 'BTC', 'USDT', 'USDC'],
    detectProvider: () => true,
  },
};

// Supported cryptocurrencies with their configurations
const CRYPTO_OPTIONS = [
  {
    id: 'BTC',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    color: '#F7931A',
    network: 'Bitcoin Network',
    confirmations: '3-6 confirmations (~30-60 min)',
    minConfirmations: 3,
  },
  {
    id: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'Ξ',
    color: '#627EEA',
    network: 'Ethereum Mainnet',
    confirmations: '12 confirmations (~3-5 min)',
    minConfirmations: 12,
  },
  {
    id: 'USDT',
    name: 'Tether USD',
    symbol: 'USDT',
    icon: '₮',
    color: '#26A17B',
    network: 'Ethereum (ERC-20)',
    confirmations: '12 confirmations (~3-5 min)',
    minConfirmations: 12,
    isStablecoin: true,
  },
  {
    id: 'USDC',
    name: 'USD Coin',
    symbol: 'USDC',
    icon: '$',
    color: '#2775CA',
    network: 'Ethereum (ERC-20)',
    confirmations: '12 confirmations (~3-5 min)',
    minConfirmations: 12,
    isStablecoin: true,
  },
];

// Payment wallet addresses
const PAYMENT_ADDRESSES = {
  BTC: '3BuLwoGXiWx56RD7GsP98Nu6i9G2igYHss',
  ETH: '0x30eD305B89b6207A5fa907575B395c9189728EbC',
  USDT: '0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c',
  USDC: '0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c',
};

// Checkout stages
const CHECKOUT_STAGE = {
  SELECT_PAYMENT: 'select_payment',
  SELECT_CRYPTO: 'select_crypto',
  CONNECT_WALLET: 'connect_wallet',
  PAYMENT: 'payment',
  BANK_ACH: 'bank_ach',
  CONFIRMING: 'confirming',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const SHIPPING_COST = 15.00;

export default function CryptoCheckout() {
  const navigate = useNavigate();

  // Cart and customer data
  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [promoCode, setPromoCode] = useState(null);

  // Payment state
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [cryptoAmount, setCryptoAmount] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [stage, setStage] = useState(CHECKOUT_STAGE.SELECT_PAYMENT);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [orderData] = useState(() => ({
    order_number: `ORD-${Date.now()}`,
    total_amount: 0,
    items: [],
    shipping_address: null
  }));

  // Wallet connection
  const [availableWallets, setAvailableWallets] = useState([]);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [connectionState, setConnectionState] = useState('idle');
  const [connectionError, setConnectionError] = useState('');

  // Transaction state
  const [transactionId, setTransactionId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [autoVerifyEnabled, setAutoVerifyEnabled] = useState(true);

  // UI state
  const [copied, setCopied] = useState(false);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Refs for intervals
  const walletMonitorRef = useRef(null);
  const txVerifyRef = useRef(null);
  
  // Redirect effect for completed stage
  useEffect(() => {
    if (stage === CHECKOUT_STAGE.COMPLETED) {
      const orderNumber = localStorage.getItem('lastOrderNumber');
      const txHash = localStorage.getItem('lastTransactionId');
      
      const timer = setTimeout(() => {
        window.location.href = `${createPageUrl('PaymentCompleted')}?txid=${txHash}&order=${orderNumber}`;
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Initialize data on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        if (!authenticated) {
          base44.auth.redirectToLogin(createPageUrl('Cart'));
          return false;
        }
        return true;
      } catch (error) {
        base44.auth.redirectToLogin(createPageUrl('Cart'));
        return false;
      }
    };

    const init = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) return;

      const cart = getCart();
      const customer = JSON.parse(localStorage.getItem('customerInfo') || 'null');
      const promo = getPromoCode();

      if (cart.length === 0) {
        navigate(createPageUrl('Cart'));
        return;
      }

      if (!customer) {
        navigate(createPageUrl('CustomerInfo'));
        return;
      }

      setCartItems(cart);
      setCustomerInfo(customer);
      setPromoCode(promo);

      // Update order data
      const subtotal = getCartTotal();
      const discount = promo ? getDiscountAmount(promo, subtotal) : 0;
      const total = subtotal - discount + SHIPPING_COST;
      
      orderData.total_amount = total;
      orderData.items = cart;
      orderData.shipping_address = customer;

      // Check if this is a test order
      const isTestOrder = cart.every(item => item.productName.includes('TEST PRODUCT'));
      if (isTestOrder) {
        window.__isTestOrder = true;
      }
    };

    init();
  }, [navigate]);

  // Detect available wallets when crypto is selected
  useEffect(() => {
    if (!selectedCrypto) return;

    const detectWallets = () => {
      const detected = [];
      Object.values(WALLET_CONFIGS).forEach(wallet => {
        if (wallet.chains.includes(selectedCrypto)) {
          const isInstalled = wallet.detectProvider();
          detected.push({
            ...wallet,
            isInstalled,
            isRecommended: wallet.id === 'coinbase',
          });
        }
      });

      detected.sort((a, b) => {
        if (a.id === 'manual') return 1;
        if (b.id === 'manual') return -1;
        if (a.isInstalled !== b.isInstalled) return b.isInstalled ? 1 : -1;
        if (a.isRecommended !== b.isRecommended) return b.isRecommended ? 1 : -1;
        return a.name.localeCompare(b.name);
      });

      setAvailableWallets(detected);
    };

    detectWallets();
  }, [selectedCrypto]);

  // Calculate totals
  const subtotal = getCartTotal();
  const discount = promoCode ? getDiscountAmount(promoCode, subtotal) : 0;
  const totalUSD = subtotal - discount + SHIPPING_COST;

  // Fetch exchange rate when crypto is selected
  useEffect(() => {
    if (!selectedCrypto) return;

    const fetchExchangeRate = async () => {
      setIsLoadingRate(true);
      const crypto = CRYPTO_OPTIONS.find(c => c.id === selectedCrypto);

      if (crypto?.isStablecoin) {
        setExchangeRate(1);
        setCryptoAmount(totalUSD.toFixed(2));
        setIsLoadingRate(false);
        return;
      }

      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `What is the current ${selectedCrypto} to USD exchange rate? Return ONLY a JSON object with format: {"rate": <number>}. The rate should be how many USD 1 ${selectedCrypto} equals.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: { rate: { type: 'number' } },
            required: ['rate']
          }
        });

        if (response?.rate) {
          setExchangeRate(response.rate);
          const amount = (totalUSD / response.rate).toFixed(8);
          setCryptoAmount(amount);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        const fallbackRates = { BTC: 95000, ETH: 3200 };
        const rate = fallbackRates[selectedCrypto] || 1;
        setExchangeRate(rate);
        setCryptoAmount((totalUSD / rate).toFixed(8));
      }

      setIsLoadingRate(false);
    };

    fetchExchangeRate();
  }, [selectedCrypto, totalUSD]);

  // Helper to find any available provider
  const getAnyProvider = () => {
    if (typeof window === 'undefined') return null;
    
    try {
      if (window.ethereum) {
        if (Array.isArray(window.ethereum.providers)) {
          return window.ethereum; 
        }
        return window.ethereum;
      }
      
      if (window.coinbaseWalletExtension) return window.coinbaseWalletExtension;
      if (window.phantom?.ethereum) return window.phantom.ethereum;
      if (window.solana) return window.solana; 
    } catch (error) {
      console.warn('Provider detection error:', error);
    }
    
    return null;
  };

  // Helper to find specific provider with retries
  const findProvider = async (walletId) => {
    const check = () => {
      if (typeof window === 'undefined') return null;
      
      try {
        let provider = null;
        if (walletId === 'coinbase') {
          if (window.ethereum?.isCoinbaseWallet) provider = window.ethereum;
          else if (window.coinbaseWalletExtension) provider = window.coinbaseWalletExtension;
          else if (window.ethereum?.providers?.find(p => p.isCoinbaseWallet)) provider = window.ethereum.providers.find(p => p.isCoinbaseWallet);
        }
        
        return provider;
      } catch (error) {
        console.warn('Provider check error:', error);
        return null;
      }
    };

    let p = check();
    if (p) return p;

    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      p = check();
      if (p) return p;
    }
    
    if (window.ethereum) return window.ethereum;
    return getAnyProvider();
  };

  // Connect wallet function
  const connectWallet = useCallback(async (wallet) => {
    setConnectionState('connecting');
    setConnectionError('');

    try {
      if (wallet.id === 'manual' || wallet.id === 'cashapp') {
        setConnectedWallet({ ...wallet, isManual: true, isCashApp: wallet.id === 'cashapp' });
        setStage(CHECKOUT_STAGE.PAYMENT);
        setConnectionState('connected');
        return;
      }

      const provider = await findProvider(wallet.id);

      if (provider) {
        try {
          const accounts = await provider.request({ method: 'eth_requestAccounts' });

          if (accounts && accounts.length > 0) {
            const address = accounts[0];
            setWalletAddress(address);
            setConnectedWallet({ ...wallet, provider, address });
            setStage(CHECKOUT_STAGE.PAYMENT);
            setConnectionState('connected');

            try {
              const balanceHex = await provider.request({
                method: 'eth_getBalance',
                params: [address, 'latest'],
              });
              const balance = parseInt(balanceHex, 16) / 1e18;
              setConnectedWallet(prev => ({ ...prev, balance }));
            } catch (e) {
              console.warn('Could not fetch balance');
            }
          } else {
            throw new Error('No accounts returned');
          }
        } catch (reqError) {
          throw reqError;
        }
      } else {
        setConnectionState('error');
        setConnectionError(`${wallet.name} not detected. Please install it first.`);
      }
    } catch (error) {
      setConnectionState('error');
      
      if (error.code === 4001) {
        setConnectionError('Connection rejected. Please approve the connection request in your wallet.');
      } else if (error.code === -32002) {
        setConnectionError('Connection pending. Please check your wallet extension.');
      } else {
        setConnectionError(error.message || 'Failed to connect wallet.');
      }
    }
  }, []);

  // Auto-monitor wallet for transactions
  useEffect(() => {
    if (stage !== CHECKOUT_STAGE.PAYMENT || !autoVerifyEnabled) return;
    if (!walletAddress && !connectedWallet?.isManual) return;

    const monitorAddress = walletAddress || connectedWallet?.address;
    if (!monitorAddress) return;

    walletMonitorRef.current = setInterval(async () => {
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Monitor ${selectedCrypto} wallet address "${monitorAddress}" for outgoing transactions to "${PAYMENT_ADDRESSES[selectedCrypto]}" in the last 30 minutes. Look for amount approximately ${cryptoAmount} ${selectedCrypto}. Return JSON: {"found": boolean, "txHash": string or null, "confirmed": boolean}`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              found: { type: 'boolean' },
              txHash: { type: ['string', 'null'] },
              confirmed: { type: 'boolean' }
            },
            required: ['found']
          }
        });

        if (result?.found && result?.txHash) {
          setTransactionId(result.txHash);
          clearInterval(walletMonitorRef.current);
          handleTransactionDetected(result.txHash);
        }
      } catch (error) {
        console.warn('Wallet monitoring error:', error);
      }
    }, 8000);

    return () => {
      if (walletMonitorRef.current) clearInterval(walletMonitorRef.current);
    };
  }, [stage, autoVerifyEnabled, walletAddress, connectedWallet, selectedCrypto, cryptoAmount]);

  // Auto-verify transaction ID
  useEffect(() => {
    if (!transactionId || verificationStatus === 'verified') return;
    if (stage !== CHECKOUT_STAGE.CONFIRMING) return;

    txVerifyRef.current = setInterval(async () => {
      await verifyTransaction(transactionId);
    }, 10000);

    verifyTransaction(transactionId);

    return () => {
      if (txVerifyRef.current) clearInterval(txVerifyRef.current);
    };
  }, [transactionId, stage]);

  const handleTransactionDetected = async (txHash) => {
    setStage(CHECKOUT_STAGE.CONFIRMING);
    setVerificationStatus('checking');
  };

  const verifyTransaction = async (txHash) => {
    setVerificationStatus('checking');
    setVerificationMessage('Verifying transaction on blockchain...');

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Verify this ${selectedCrypto} blockchain transaction:
Transaction ID: ${txHash}
Expected recipient: ${PAYMENT_ADDRESSES[selectedCrypto]}
Expected amount: approximately ${cryptoAmount} ${selectedCrypto}

Check if transaction exists, is sent to correct address, amount is correct (within 2% tolerance), and has sufficient confirmations.
Return JSON: {"verified": boolean, "confirmations": number, "status": "pending"|"confirmed"|"failed", "message": string}`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            verified: { type: 'boolean' },
            confirmations: { type: 'number' },
            status: { type: 'string' },
            message: { type: 'string' }
          },
          required: ['verified', 'status']
        }
      });

      if (result?.verified && result?.status === 'confirmed') {
        setVerificationStatus('verified');
        setVerificationMessage('Payment confirmed!');
        clearInterval(txVerifyRef.current);
        await processSuccessfulPayment(txHash);
      } else if (result?.status === 'pending') {
        const crypto = CRYPTO_OPTIONS.find(c => c.id === selectedCrypto);
        setVerificationMessage(`Waiting for confirmations (${result.confirmations || 0}/${crypto?.minConfirmations || 3})`);
      } else if (result?.status === 'failed') {
        setVerificationStatus('failed');
        setVerificationMessage(result.message || 'Transaction verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setRetryCount(prev => prev + 1);
      if (retryCount >= 3) {
        setVerificationMessage('Having trouble verifying. Please contact support with your transaction ID.');
      }
    }
  };

  const processSuccessfulPayment = async (txHash) => {
    setStage(CHECKOUT_STAGE.COMPLETED);

    try {
      const orderNumber = `RDR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      let userEmail = null;
      try {
        const user = await base44.auth.me();
        userEmail = user?.email;
      } catch (e) {}

      const customerName = customerInfo?.firstName && customerInfo?.lastName
        ? `${customerInfo.firstName} ${customerInfo.lastName}`
        : customerInfo?.name || 'Guest Customer';

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

      // Create order
      await base44.entities.Order.create({
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
      });

      // Track purchase in HubSpot
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-red-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-[-10%] w-[600px] h-[600px] bg-slate-400 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-12"
            >
              <Link to={createPageUrl('CustomerInfo')}>
                <Button variant="outline" className="mb-8 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-bold uppercase tracking-wider text-xs">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Customer Info
                </Button>
              </Link>
              
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-4 uppercase tracking-tighter leading-none">
                Secure <span className="text-red-600">Checkout</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium">Select your preferred clinical research payment method.</p>
            </motion.div>

            <AnimatePresence mode="wait">
              {/* STAGE: Select Payment Method */}
              {stage === CHECKOUT_STAGE.SELECT_PAYMENT && (
                <motion.div
                  key="select_payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <button
                      onClick={() => setStage(CHECKOUT_STAGE.SELECT_CRYPTO)}
                      className="group p-8 bg-white border border-slate-200 rounded-[40px] text-left hover:border-red-600 hover:shadow-2xl transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                        <Wallet className="w-32 h-32 text-slate-900" />
                      </div>
                      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Wallet className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight group-hover:text-red-600 transition-colors">Cryptocurrency</h3>
                      <p className="text-slate-500 font-medium leading-relaxed">Pay with Bitcoin, Ethereum, or Stablecoins. Fast, private, and secure.</p>
                      <div className="mt-6 inline-flex items-center text-red-600 font-black uppercase tracking-widest text-xs">
                        Select Crypto <ChevronDown className="w-4 h-4 ml-2" />
                      </div>
                    </button>

                    <button
                      onClick={() => setStage(CHECKOUT_STAGE.BANK_ACH)}
                      className="group p-8 bg-white border border-slate-200 rounded-[40px] text-left hover:border-red-600 hover:shadow-2xl transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-32 h-32 text-slate-900" />
                      </div>
                      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <LinkIcon className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight group-hover:text-red-600 transition-colors">Bank Transfer</h3>
                      <p className="text-slate-500 font-medium leading-relaxed">Connect your bank account securely via Plaid for instant ACH payment.</p>
                      <div className="mt-6 inline-flex items-center text-red-600 font-black uppercase tracking-widest text-xs">
                        Link Account <ChevronDown className="w-4 h-4 ml-2" />
                      </div>
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 flex items-center gap-6">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Clinical Security Standards</h4>
                      <p className="text-sm text-slate-500 font-medium">All transactions are encrypted and processed through secure research fulfillment protocols.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STAGE: Select Crypto */}
              {stage === CHECKOUT_STAGE.SELECT_CRYPTO && (
                <motion.div
                  key="select_crypto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => setStage(CHECKOUT_STAGE.SELECT_PAYMENT)}
                    className="mb-8 text-slate-500 hover:text-red-600 font-black uppercase tracking-widest text-xs p-0"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to methods
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CRYPTO_OPTIONS.map((crypto) => (
                      <button
                        key={crypto.id}
                        onClick={() => {
                          setSelectedCrypto(crypto.id);
                          setStage(CHECKOUT_STAGE.CONNECT_WALLET);
                        }}
                        className="group p-6 bg-white border border-slate-200 rounded-[32px] flex items-center gap-6 hover:border-red-600 hover:shadow-xl transition-all text-left"
                      >
                        <div 
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${crypto.color}15`, color: crypto.color }}
                        >
                          {crypto.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{crypto.name}</h4>
                          <p className="text-sm text-slate-500 font-medium">{crypto.network}</p>
                        </div>
                        <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-red-600 -rotate-90 transition-colors" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STAGE: Bank ACH */}
              {stage === CHECKOUT_STAGE.BANK_ACH && (
                <motion.div
                  key="bank_ach"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 shadow-xl shadow-slate-100"
                >
                  <Button
                    variant="ghost"
                    onClick={() => setStage(CHECKOUT_STAGE.SELECT_PAYMENT)}
                    className="mb-8 text-slate-500 hover:text-red-600 font-black uppercase tracking-widest text-xs p-0"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to methods
                  </Button>

                  <div className="max-w-md mx-auto text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-100">
                      <LinkIcon className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Bank Connection</h2>
                    <p className="text-slate-500 font-medium mb-10">Securely link your bank account via Plaid for instant research material funding.</p>
                    
                    <PlaidACHCheckout 
                      totalAmount={totalUSD}
                      onSuccess={async (paymentId) => {
                        await processSuccessfulPayment(paymentId);
                      }}
                    />

                    <div className="mt-12 flex flex-wrap justify-center gap-6 opacity-50 grayscale hover:grayscale-0 transition-all">
                      <PCIComplianceBadge />
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                        <Lock className="w-4 h-4 text-slate-600" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">256-bit Encrypted</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STAGE: Connect Wallet */}
              {stage === CHECKOUT_STAGE.CONNECT_WALLET && (
                <motion.div
                  key="connect_wallet"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <Button
                      variant="ghost"
                      onClick={() => setStage(CHECKOUT_STAGE.SELECT_CRYPTO)}
                      className="text-slate-500 hover:text-red-600 font-black uppercase tracking-widest text-xs p-0"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to crypto
                    </Button>
                    <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-600" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Paying with {selectedCrypto}</span>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {availableWallets.map((wallet) => (
                      <button
                        key={wallet.id}
                        onClick={() => connectWallet(wallet)}
                        disabled={connectionState === 'connecting'}
                        className="group p-6 bg-white border border-slate-200 rounded-[32px] flex items-center gap-6 hover:border-red-600 hover:shadow-xl transition-all text-left disabled:opacity-50"
                      >
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {wallet.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{wallet.name}</h4>
                            {wallet.isRecommended && (
                              <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Recommended</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 font-medium">
                            {wallet.isInstalled ? 'Installed & Ready' : 'External Wallet'}
                          </p>
                        </div>
                        {connectionState === 'connecting' ? (
                          <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                        ) : (
                          <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-red-600 transition-colors" />
                        )}
                      </button>
                    ))}
                  </div>

                  {connectionError && (
                    <div className="mt-8 p-6 bg-red-600 border border-red-500 rounded-[24px] flex items-start gap-4">
                      <AlertCircle className="w-6 h-6 text-white flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Connection Error</h4>
                        <p className="text-sm text-red-50 font-medium">{connectionError}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STAGE: Payment (QR & Address) */}
              {stage === CHECKOUT_STAGE.PAYMENT && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 shadow-xl shadow-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                      <Zap className="w-48 h-48 text-slate-900" />
                    </div>

                    <div className="flex flex-col md:flex-row gap-12 relative z-10">
                      {/* QR Code Column */}
                      <div className="flex flex-col items-center">
                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-[40px] shadow-inner mb-6 group transition-all hover:bg-white hover:shadow-xl">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedCrypto === 'BTC' ? 'bitcoin' : 'ethereum'}:${PAYMENT_ADDRESSES[selectedCrypto]}?amount=${cryptoAmount}`}
                            alt="Payment QR Code"
                            className="w-48 h-48 group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full">
                          <Clock className="w-4 h-4 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Rate expires in 15:00</span>
                        </div>
                      </div>

                      {/* Details Column */}
                      <div className="flex-1 space-y-8">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Amount to send</label>
                          <div className="flex items-baseline gap-3">
                            <span className="text-5xl font-black text-slate-900 tracking-tighter">
                              {isLoadingRate ? '...' : cryptoAmount}
                            </span>
                            <span className="text-2xl font-black text-red-600 uppercase">{selectedCrypto}</span>
                          </div>
                          <p className="text-slate-500 font-medium mt-1">≈ ${totalUSD.toFixed(2)} USD</p>
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Recipient Address</label>
                          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-red-600 transition-all">
                            <code className="flex-1 text-sm font-bold text-slate-900 break-all">
                              {PAYMENT_ADDRESSES[selectedCrypto]}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(PAYMENT_ADDRESSES[selectedCrypto])}
                              className="text-red-600 hover:bg-red-50 rounded-xl"
                            >
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="p-6 bg-red-600 border border-red-500 rounded-3xl">
                          <div className="flex items-center gap-3 mb-3">
                            <ShieldCheck className="w-5 h-5 text-white" />
                            <h4 className="text-sm font-black text-white uppercase tracking-tight">Security Protocol</h4>
                          </div>
                          <p className="text-xs text-white font-medium leading-relaxed">
                            Please ensure you are sending on the <strong>{CRYPTO_OPTIONS.find(c => c.id === selectedCrypto)?.network}</strong>. 
                            Sending to the wrong network will result in permanent loss of laboratory funds.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manual TX Input */}
                  <div className="bg-slate-50 border border-slate-200 rounded-[40px] p-8 md:p-12 shadow-xl shadow-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
                      <RefreshCw className="w-32 h-32 text-slate-900" />
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Manual Verification</h3>
                      <p className="text-slate-500 font-medium mb-8">If your wallet doesn't auto-verify, enter your transaction hash below.</p>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Enter Transaction ID / Hash"
                          className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-600 transition-all font-bold"
                        />
                        <Button
                          onClick={() => setStage(CHECKOUT_STAGE.CONFIRMING)}
                          disabled={!transactionId}
                          className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs h-auto shadow-xl shadow-red-600/20 disabled:opacity-50"
                        >
                          Verify Payment
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STAGE: Confirming */}
              {stage === CHECKOUT_STAGE.CONFIRMING && (
                <motion.div
                  key="confirming"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-slate-200 rounded-[40px] p-12 md:p-20 text-center shadow-xl shadow-slate-100"
                >
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-red-100 relative">
                      <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-4 border-white rounded-full flex items-center justify-center shadow-md">
                        <ShieldCheck className="w-4 h-4 text-red-600" />
                      </div>
                    </div>

                    <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Verifying Transaction</h2>
                    <p className="text-xl text-slate-500 font-medium mb-8">{verificationMessage}</p>

                    <div className="space-y-4">
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 10, repeat: Infinity }}
                          className="h-full bg-red-600"
                        />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Blockchain confirmation in progress</p>
                    </div>

                    {verificationStatus === 'failed' && (
                      <div className="mt-12">
                        <Button
                          variant="outline"
                          onClick={() => setStage(CHECKOUT_STAGE.PAYMENT)}
                          className="border-red-600 text-red-600 hover:bg-red-50 rounded-full px-8 py-6 font-black uppercase tracking-widest text-xs"
                        >
                          Return to Payment
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STAGE: Completed */}
              {stage === CHECKOUT_STAGE.COMPLETED && (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-slate-200 rounded-[40px] p-12 md:p-20 text-center shadow-2xl shadow-slate-200"
                >
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-green-50 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-green-100">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 mb-4 uppercase tracking-tighter leading-none">Discovery <span className="text-green-500">Confirmed</span></h2>
                    <p className="text-xl text-slate-500 font-medium mb-12">Your research materials have been funded and are entering fulfillment.</p>
                    
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] text-left space-y-4 mb-10">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Status</span>
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full">Processing</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment ID</span>
                        <span className="text-xs font-bold text-slate-900 truncate ml-4">{transactionId || 'Confirmed via Bank'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Redirecting to receipt...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:w-96 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-xl shadow-slate-100"
            >
              <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight flex items-center justify-between">
                Order Summary
                <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Secure</span>
              </h3>

              <div className="space-y-6 mb-8">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.productName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.specification} × {item.quantity}</p>
                    </div>
                    <span className="text-sm font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Research Subtotal</span>
                  <span className="text-slate-900 font-bold">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">Protocol Discount</span>
                    <span className="text-green-600 font-bold">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Secure Shipping</span>
                  <span className="text-slate-900 font-bold">${SHIPPING_COST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-lg font-black text-slate-900 uppercase tracking-tight">Total Funding</span>
                  <span className="text-2xl font-black text-red-600">${totalUSD.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <ShieldCheck className="w-32 h-32 text-white" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4 relative z-10">Research Integrity</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed relative z-10">
                Red Helix Research enforces strict chain-of-custody protocols. All research materials are handled in 
                compliance with clinical documentation standards.
              </p>
              <div className="mt-6 space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Temperature Controlled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Discrete Packaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Verified Purity</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
