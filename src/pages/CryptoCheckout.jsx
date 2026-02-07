import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
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
  BTC: '33QDmSuWizuiLr7aH5ZEDc6cn7dB4r11ZY',
  ETH: '0x30eD305B89b6207A5fa907575B395c9189728EbC',
  USDT: '0x30eD305B89b6207A5fa907575B395c9189728EbC',
  USDC: '0x30eD305B89b6207A5fa907575B395c9189728EbC',
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
      // Check for standard ethereum provider
      if (window.ethereum) {
        // If it's an array of providers (e.g. Coinbase + MetaMask both installed)
        if (Array.isArray(window.ethereum.providers)) {
          return window.ethereum; 
        }
        return window.ethereum;
      }
      
      // Check for specific injections
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

    // Try immediately
    let p = check();
    if (p) return p;

    // Retry for 2 seconds (20 attempts x 100ms)
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      p = check();
      if (p) return p;
    }
    
    // Fallback to generic window.ethereum
    if (window.ethereum) return window.ethereum;
    
    // Last resort
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

      // Find provider with retry logic
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
      const order = await base44.entities.Order.create({
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
          zip: customerInfo?.shippingZip || customerInfo?.zip
        },
        wallet_type: connectedWallet?.name || 'manual',
        promo_code: promoCode,
        created_by: userEmail || customerInfo?.email || 'guest@redhelix.com'
      });

      // Send customer email
      const customerEmail = userEmail || customerInfo?.email;
      if (customerEmail) {
        await base44.integrations.Core.SendEmail({
          from_name: 'Jake - Red Helix Research',
          to: customerEmail,
          subject: `Order Confirmation - ${orderNumber}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #8B2635;">Thank You for Your Order!</h2>
              <p>Hi ${customerName},</p>
              <p>We've received your order and it's being processed.</p>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Order #${orderNumber}</h3>
                <p><strong>Payment:</strong> ${cryptoAmount} ${selectedCrypto}</p>
                <p><strong>Transaction ID:</strong> ${txHash}</p>
                <p><strong>Total:</strong> $${totalUSD.toFixed(2)} USD</p>
              </div>
              ${customerInfo ? `
                <h3>Shipping Address:</h3>
                <p>${customerInfo.firstName} ${customerInfo.lastName}<br>
                ${customerInfo.shippingAddress}<br>
                ${customerInfo.shippingCity}, ${customerInfo.shippingState} ${customerInfo.shippingZip}</p>
              ` : ''}
              <p>You will receive tracking information once your order ships.</p>
            </div>
          `
        });
      }

      // Admin notifications and emails
      const allUsers = await base44.entities.User.list();
      const admins = allUsers.filter(u => u.role === 'admin');

      // Create order items list for email
      const orderItemsList = cartItems.map(item => 
        `<li>${item.productName} (${item.specification}) x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`
      ).join('');

      for (const admin of admins) {
        // Create notification in database
        await base44.entities.Notification.create({
          type: 'blockchain_confirmed',
          admin_email: admin.email,
          customer_name: customerName,
          customer_email: customerEmail || 'guest@redhelix.com',
          order_id: order.id,
          order_number: orderNumber,
          total_amount: totalUSD,
          crypto_currency: selectedCrypto,
          transaction_id: txHash,
          message_preview: `Blockchain confirmed: ${orderNumber} ($${totalUSD.toFixed(2)}) - ${selectedCrypto} - Needs tracking`,
          requires_tracking: true,
          read: false
        });

        // Send email to admin
        await base44.integrations.Core.SendEmail({
          from_name: 'Jake - Red Helix Research',
          to: admin.email,
          subject: `New Order Received - ${orderNumber}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #8B2635;">New Order Notification</h2>
              <p>A new order has been placed and confirmed on the blockchain.</p>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Order #${orderNumber}</h3>
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>Email:</strong> ${customerEmail || 'guest@redhelix.com'}</p>
                <p><strong>Phone:</strong> ${customerInfo?.phone || 'N/A'}</p>
                <p><strong>Payment Method:</strong> ${selectedCrypto}</p>
                <p><strong>Payment Amount:</strong> ${cryptoAmount} ${selectedCrypto}</p>
                <p><strong>Transaction ID:</strong> ${txHash}</p>
                <p><strong>Total:</strong> $${totalUSD.toFixed(2)} USD</p>
                <p><strong>Status:</strong> Processing - Needs Tracking</p>
              </div>
              <h3>Order Items:</h3>
              <ul>
                ${orderItemsList}
              </ul>
              ${customerInfo ? `
                <h3>Shipping Address:</h3>
                <p>${customerInfo.firstName} ${customerInfo.lastName}<br>
                ${customerInfo.shippingAddress}<br>
                ${customerInfo.shippingCity}, ${customerInfo.shippingState} ${customerInfo.shippingZip}</p>
              ` : ''}
              <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                Please process this order and add tracking information as soon as possible.
              </p>
            </div>
          `
        });
      }

      clearCart();
      localStorage.removeItem('customerInfo');
      localStorage.removeItem('abandonedCartSent');
      localStorage.setItem('lastOrderComplete', Date.now().toString());
      localStorage.setItem('lastOrderNumber', orderNumber);
      localStorage.setItem('lastTransactionId', txHash);

    } catch (error) {
      console.error('Order processing error:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualVerification = () => {
    if (!transactionId.trim()) return;
    
    // Auto-complete test orders
    if (window.__isTestOrder) {
      const testTxId = transactionId || `TEST-${Date.now().toString(36).toUpperCase()}`;
      setTransactionId(testTxId);
      setStage(CHECKOUT_STAGE.CONFIRMING);
      setVerificationStatus('checking');
      setTimeout(() => {
        setVerificationStatus('verified');
        setVerificationMessage('Test payment confirmed!');
        processSuccessfulPayment(testTxId);
      }, 2000);
      return;
    }
    
    handleTransactionDetected(transactionId);
  };

  const resetWalletConnection = () => {
    setConnectionState('idle');
    setConnectionError('');
    setConnectedWallet(null);
    setWalletAddress('');
  };

  const renderPaymentMethodSelection = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h2 className="text-xl font-bold text-amber-50 mb-4">Select Payment Method</h2>
      
      {/* Bank ACH Option */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => {
          setPaymentMethod('bank_ach');
          setStage(CHECKOUT_STAGE.BANK_ACH);
        }}
        className="w-full p-6 rounded-lg border-2 transition-all text-left border-stone-700 bg-stone-800/50 hover:border-green-600/50 group"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-600/20">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-amber-50 text-lg">Bank Account (ACH)</p>
              <p className="text-xs text-stone-400">Direct bank transfer via Plaid</p>
            </div>
          </div>
          <span className="text-xs bg-green-600/30 text-green-400 px-3 py-1 rounded-full font-semibold">
            Recommended
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-400 mt-3">
          <Shield className="w-3 h-3 text-green-500" />
          <span>Secure • Fast • No fees</span>
        </div>
      </motion.button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-stone-700" />
        <span className="text-xs text-stone-500 font-semibold">OR PAY WITH CRYPTO</span>
        <div className="flex-1 h-px bg-stone-700" />
      </div>

      {/* Crypto Options */}
      <div className="grid grid-cols-2 gap-3">
        {CRYPTO_OPTIONS.map((crypto) => (
          <motion.button
            key={crypto.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setPaymentMethod('crypto');
              setSelectedCrypto(crypto.id);
              setStage(CHECKOUT_STAGE.CONNECT_WALLET);
            }}
            className="p-4 rounded-lg border-2 transition-all text-left border-stone-700 bg-stone-800/50 hover:border-red-600/50"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: `${crypto.color}20`, color: crypto.color }}>
                {crypto.icon}
              </div>
              <div>
                <p className="font-semibold text-amber-50">{crypto.symbol}</p>
                <p className="text-xs text-stone-500">{crypto.name}</p>
              </div>
            </div>
            <p className="text-xs text-stone-400">{crypto.network}</p>
          </motion.button>
        ))}
      </div>
      
      <div className="mt-4">
        <PCIComplianceBadge variant="compact" />
      </div>
    </motion.div>
  );

  const renderCryptoSelection = () => renderPaymentMethodSelection();

  const renderWalletConnection = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => { setSelectedCrypto(null); setStage(CHECKOUT_STAGE.SELECT_CRYPTO); resetWalletConnection(); }} className="text-stone-400 hover:text-amber-50">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-amber-50">Connect Your Wallet</h2>
      </div>

      <div className="bg-stone-800/50 rounded-lg p-6 text-center">
        {isLoadingRate ? (
          <div className="flex items-center justify-center gap-3 py-4">
            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
            <span className="text-stone-400">Calculating {selectedCrypto} amount...</span>
          </div>
        ) : (
          <>
            <p className="text-stone-400 mb-2">Amount to pay</p>
            <p className="text-4xl font-bold text-amber-50 mb-1">{cryptoAmount} {selectedCrypto}</p>
            <p className="text-sm text-stone-500">≈ ${totalUSD.toFixed(2)} USD</p>
          </>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-sm text-stone-400">Select a wallet for seamless {selectedCrypto} payment:</p>
        {availableWallets.map((wallet) => (
          <motion.button
            key={wallet.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              if (!wallet.isInstalled && wallet.deepLink) {
                window.open(wallet.deepLink, '_blank');
              } else {
                connectWallet(wallet);
              }
            }}
            disabled={connectionState === 'connecting'}
            className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${wallet.isInstalled ? 'bg-stone-800/80 border-stone-600 hover:border-red-600/50' : 'bg-stone-800/40 border-stone-700/50 opacity-75 hover:opacity-100'} ${connectionState === 'connecting' ? 'opacity-50 cursor-wait' : ''}`}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${wallet.color}20` }}>
              {wallet.icon}
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-50">{wallet.name}</span>
                {wallet.isRecommended && wallet.id !== 'manual' && (
                  <span className="text-xs bg-red-600/30 text-red-400 px-2 py-0.5 rounded">Recommended</span>
                )}
              </div>
              <p className="text-xs text-stone-500">
                {wallet.id === 'manual' ? 'Copy address and pay manually' : wallet.isInstalled ? 'Detected - Click to connect' : 'Click to download'}
              </p>
            </div>
            {wallet.isInstalled && wallet.id !== 'manual' ? (
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            ) : !wallet.isInstalled && wallet.deepLink && wallet.id !== 'manual' ? (
              <ExternalLink className="w-5 h-5 text-stone-500" />
            ) : null}
          </motion.button>
        ))}
      </div>

      {connectionState === 'error' && (
        <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-400">Connection Failed</p>
              <p className="text-xs text-red-400/70 mt-1">{connectionError}</p>
            </div>
          </div>
          
          {availableWallets.find(w => w.name === connectionError.split(' ')[0])?.deepLink && (
             <a 
               href={availableWallets.find(w => w.name === connectionError.split(' ')[0])?.deepLink} 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 text-xs text-red-400 hover:text-red-300 underline mt-2 mb-1"
             >
               <ExternalLink className="w-3 h-3" />
               Install Extension
             </a>
          )}

          <div className="flex gap-4 mt-3">
            <button onClick={resetWalletConnection} className="text-xs text-red-400 hover:text-red-300 underline">Try again</button>
            <button onClick={() => connectWallet(WALLET_CONFIGS.manual)} className="text-xs text-amber-500 hover:text-amber-400 font-medium underline">Use Manual Payment Instead</button>
          </div>
        </div>
      )}

      {connectionState === 'connecting' && (
        <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <p className="text-sm text-blue-400">Connecting... Please check your wallet</p>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderPayment = () => {
    const crypto = CRYPTO_OPTIONS.find(c => c.id === selectedCrypto);
    const paymentAddress = PAYMENT_ADDRESSES[selectedCrypto];
    const isCashApp = connectedWallet?.isCashApp;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => { setStage(CHECKOUT_STAGE.CONNECT_WALLET); resetWalletConnection(); }} className="text-stone-400 hover:text-amber-50">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-amber-50">Complete Payment</h2>
          </div>
          {connectedWallet && !connectedWallet.isManual && (
            <div className="flex items-center gap-2 text-green-500 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>{connectedWallet.name} Connected</span>
            </div>
          )}
          {isCashApp && (
            <div className="flex items-center gap-2 text-green-500 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Cash App Payment</span>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-red-900/30 to-stone-800/50 rounded-lg p-6 border border-red-600/30">
          <p className="text-stone-400 text-sm mb-2">Send exactly</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-amber-50">{cryptoAmount} {selectedCrypto}</p>
            <button onClick={() => copyToClipboard(cryptoAmount)} className="p-2 hover:bg-stone-700 rounded transition-colors">
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-stone-400" />}
            </button>
          </div>
          <p className="text-xs text-stone-500 mt-2">≈ ${totalUSD.toFixed(2)} USD</p>
        </div>

        <div className="bg-stone-800/50 rounded-lg p-4">
          <p className="text-stone-400 text-sm mb-2">To this {selectedCrypto} address</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-amber-50 text-sm break-all font-mono bg-stone-900 p-3 rounded">{paymentAddress}</code>
            <button onClick={() => copyToClipboard(paymentAddress)} className="p-3 bg-red-700 hover:bg-red-600 rounded transition-colors">
              <Copy className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {isCashApp && (
            <div className="mt-4 p-4 bg-stone-900 rounded-lg border border-green-600/30">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="w-5 h-5 text-green-500" />
                <p className="text-sm font-semibold text-green-400">Scan with Cash App</p>
              </div>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin:${paymentAddress}?amount=${cryptoAmount}`}
                  alt="Bitcoin QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-xs text-stone-400 mt-3">
                Open Cash App → Tap Bitcoin → Scan QR Code
              </p>
            </div>
          )}
        </div>

        {crypto?.isStablecoin && (
          <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-200">Network Important</p>
                <p className="text-xs text-yellow-200/70">Send {selectedCrypto} on Ethereum (ERC-20) only.</p>
              </div>
            </div>
          </div>
        )}

        {connectedWallet && !connectedWallet.isManual && autoVerifyEnabled && (
          <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Zap className="w-5 h-5 text-green-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-400">Auto-Detection Active</p>
                <p className="text-xs text-green-400/70">Monitoring your wallet for the payment.</p>
              </div>
            </div>
          </div>
        )}

        {(connectedWallet?.isManual || isCashApp) && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-stone-300 block mb-2">
                {isCashApp ? 'Your Cash App Bitcoin Address (optional)' : 'Your Wallet Address (optional)'}
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={isCashApp ? "Enter your Cash App Bitcoin address" : "Enter your sending wallet address"}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-amber-50 placeholder:text-stone-500 focus:outline-none focus:border-red-600"
              />
              {isCashApp && (
                <p className="text-xs text-stone-500 mt-2">
                  Find this in Cash App → Bitcoin → ⚙️ → Copy Bitcoin Address
                </p>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-stone-700 pt-4">
          {window.__isTestOrder ? (
            <>
              <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 mb-3">
                <p className="text-sm font-semibold text-yellow-200">🧪 Test Mode Active</p>
                <p className="text-xs text-yellow-200/70 mt-1">Click verify with any text to complete test order</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter any test transaction ID"
                  className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-amber-50 placeholder:text-stone-500 focus:outline-none focus:border-red-600"
                />
                <Button onClick={handleManualVerification} className="bg-red-700 hover:bg-red-600 text-amber-50 px-6">
                  Complete Test Order
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-stone-400 mb-3">Already sent? Enter your transaction ID:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID/hash"
                  className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-amber-50 placeholder:text-stone-500 focus:outline-none focus:border-red-600"
                />
                <Button onClick={handleManualVerification} disabled={!transactionId.trim()} className="bg-red-700 hover:bg-red-600 text-amber-50 px-6">
                  Verify
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="bg-stone-800/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-stone-400" />
            <p className="text-sm font-semibold text-stone-300">Confirmation Time</p>
          </div>
          <p className="text-xs text-stone-500">{crypto?.confirmations}</p>
        </div>
      </motion.div>
    );
  };

  const renderConfirming = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-20 h-20 mx-auto mb-6">
        <Loader2 className="w-20 h-20 text-red-600" />
      </motion.div>
      <h2 className="text-2xl font-bold text-amber-50 mb-2">Verifying Payment</h2>
      <p className="text-stone-400 mb-6">{verificationMessage}</p>
      <div className="bg-stone-800/50 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-xs text-stone-500 mb-1">Transaction ID</p>
        <p className="text-amber-50 font-mono text-sm break-all">{transactionId}</p>
      </div>
      {retryCount >= 3 && (
        <div className="mt-6 bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-yellow-200">
            Having trouble? Contact support on <a href="https://discord.gg/s78Jeajp" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-100">Discord</a>
          </p>
        </div>
      )}
    </motion.div>
  );

  const renderCompleted = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="w-20 h-20 mx-auto mb-6 bg-green-600/20 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </motion.div>
      <h2 className="text-3xl font-bold text-green-500 mb-2">Payment Confirmed!</h2>
      <p className="text-stone-400 mb-6">Your order has been confirmed and is being processed.</p>
      <p className="text-sm text-stone-500">Redirecting to order confirmation...</p>
    </motion.div>
  );

  const renderOrderSummary = () => (
    <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-6 sticky top-32">
      {customerInfo && (
        <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 mb-6">
          <p className="text-xs font-semibold text-green-400 mb-2">✓ Shipping to:</p>
          <p className="text-xs text-stone-300">{customerInfo.firstName} {customerInfo.lastName}</p>
          <p className="text-xs text-stone-300">{customerInfo.shippingAddress}</p>
          <p className="text-xs text-stone-300">{customerInfo.shippingCity}, {customerInfo.shippingState} {customerInfo.shippingZip}</p>
        </div>
      )}
      <h3 className="text-lg font-bold text-amber-50 mb-4">Order Summary</h3>
      <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-stone-400 truncate mr-2">{item.productName} ({item.specification}) x{item.quantity}</span>
            <span className="text-amber-50 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-stone-700 pt-4 space-y-2">
        <div className="flex justify-between text-sm"><span className="text-stone-400">Subtotal</span><span className="text-amber-50">${subtotal.toFixed(2)}</span></div>
        {discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-500">Discount</span><span className="text-green-500">-${discount.toFixed(2)}</span></div>}
        <div className="flex justify-between text-sm"><span className="text-stone-400">Shipping</span><span className="text-amber-50">${SHIPPING_COST.toFixed(2)}</span></div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-stone-700"><span className="text-amber-50">Total</span><span className="text-red-600">${totalUSD.toFixed(2)}</span></div>
        {cryptoAmount && selectedCrypto && (
          <div className="bg-stone-800/50 rounded-lg p-3 mt-3">
            <p className="text-xs text-stone-500">Crypto Amount</p>
            <p className="text-xl font-bold text-red-600 font-mono">{cryptoAmount} {selectedCrypto}</p>
          </div>
        )}
      </div>
      <div className="mt-6 bg-stone-800/50 rounded-lg p-4 text-xs text-stone-400 space-y-2">
        <p className="flex items-center gap-2"><span className="text-red-600">✓</span> Same-day shipping</p>
        <p className="flex items-center gap-2"><span className="text-red-600">✓</span> Lab tested products</p>
        <p className="flex items-center gap-2"><span className="text-red-600">✓</span> Money-back guarantee</p>
      </div>
      
      <div className="mt-4">
        <PCIComplianceBadge variant="compact" />
      </div>
    </div>
  );

  const renderStage = () => {
    switch (stage) {
      case CHECKOUT_STAGE.SELECT_CRYPTO: return renderCryptoSelection();
      case CHECKOUT_STAGE.CONNECT_WALLET: return renderWalletConnection();
      case CHECKOUT_STAGE.PAYMENT: return renderPayment();
      case CHECKOUT_STAGE.CONFIRMING: return renderConfirming();
      case CHECKOUT_STAGE.COMPLETED: return renderCompleted();
      default: return renderCryptoSelection();
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link to={createPageUrl('CustomerInfo')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Shipping Info
          </Link>
          <h1 className="text-4xl font-black text-amber-50">Crypto Checkout</h1>
          <p className="text-stone-400 mt-2">Fast, secure cryptocurrency payment with automatic wallet detection</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2">
            {[
              { stage: CHECKOUT_STAGE.SELECT_CRYPTO, label: 'Select' },
              { stage: CHECKOUT_STAGE.CONNECT_WALLET, label: 'Connect' },
              { stage: CHECKOUT_STAGE.PAYMENT, label: 'Pay' },
              { stage: CHECKOUT_STAGE.CONFIRMING, label: 'Confirm' },
            ].map((step, index) => {
              const stages = [CHECKOUT_STAGE.SELECT_CRYPTO, CHECKOUT_STAGE.CONNECT_WALLET, CHECKOUT_STAGE.PAYMENT, CHECKOUT_STAGE.CONFIRMING, CHECKOUT_STAGE.COMPLETED];
              const currentIndex = stages.indexOf(stage);
              const stepIndex = stages.indexOf(step.stage);
              const isActive = stepIndex <= currentIndex;

              return (
                <React.Fragment key={step.stage}>
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${isActive ? 'bg-red-600 text-white' : 'bg-stone-800 text-stone-500'}`}>
                      {isActive && stepIndex < currentIndex ? <Check className="w-4 h-4" /> : index + 1}
                    </div>
                    <span className={`text-xs mt-1 ${isActive ? 'text-amber-50' : 'text-stone-500'}`}>{step.label}</span>
                  </div>
                  {index < 3 && <div className={`flex-1 h-1 rounded ${stepIndex < currentIndex ? 'bg-red-600' : 'bg-stone-800'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-6">
              <AnimatePresence mode="wait">{renderStage()}</AnimatePresence>
            </div>
          </div>
          <div className="lg:col-span-1">{renderOrderSummary()}</div>
        </div>

        <div className="fixed bottom-6 right-6 z-50"><CryptoWalletHelp /></div>
      </div>
    </div>
  );
}