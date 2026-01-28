import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Wallet, Check, X, Loader2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Supported wallet configurations
const WALLET_CONFIGS = {
  metamask: {
    id: 'metamask',
    name: 'MetaMask',
    icon: '/wallets/metamask.svg',
    color: '#F6851B',
    deepLink: 'https://metamask.io/download/',
    chains: ['ETH', 'USDT', 'USDC'],
    detectProvider: () => typeof window !== 'undefined' && window.ethereum?.isMetaMask,
  },
  trustwallet: {
    id: 'trustwallet',
    name: 'Trust Wallet',
    icon: '/wallets/trustwallet.svg',
    color: '#3375BB',
    deepLink: 'https://trustwallet.com/download',
    chains: ['ETH', 'BTC', 'USDT', 'USDC'],
    detectProvider: () => typeof window !== 'undefined' && window.ethereum?.isTrust,
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '/wallets/coinbase.svg',
    color: '#0052FF',
    deepLink: 'https://www.coinbase.com/wallet',
    chains: ['ETH', 'BTC', 'USDT', 'USDC'],
    detectProvider: () => typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet,
  },
  phantom: {
    id: 'phantom',
    name: 'Phantom',
    icon: '/wallets/phantom.svg',
    color: '#AB9FF2',
    deepLink: 'https://phantom.app/download',
    chains: ['ETH', 'USDT', 'USDC'],
    detectProvider: () => typeof window !== 'undefined' && window.phantom?.ethereum,
  },
  walletconnect: {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '/wallets/walletconnect.svg',
    color: '#3B99FC',
    deepLink: null,
    chains: ['ETH', 'BTC', 'USDT', 'USDC'],
    detectProvider: () => true, // Always available via QR
  },
  manual: {
    id: 'manual',
    name: 'Manual Payment',
    icon: null,
    color: '#78716c',
    deepLink: null,
    chains: ['ETH', 'BTC', 'USDT', 'USDC'],
    detectProvider: () => true,
  },
};

// Connection states
const CONNECTION_STATE = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
  TIMEOUT: 'timeout',
};

export default function WalletConnector({
  isOpen,
  onClose,
  onWalletConnected,
  selectedCrypto,
  requiredAmount,
}) {
  const [availableWallets, setAvailableWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [connectionState, setConnectionState] = useState(CONNECTION_STATE.IDLE);
  const [connectedAddress, setConnectedAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [connectionTimeout, setConnectionTimeout] = useState(null);

  // Detect available wallets on mount
  useEffect(() => {
    const detectWallets = () => {
      const detected = [];

      Object.values(WALLET_CONFIGS).forEach(wallet => {
        if (wallet.chains.includes(selectedCrypto)) {
          const isInstalled = wallet.detectProvider();
          detected.push({
            ...wallet,
            isInstalled,
            isRecommended: wallet.id === 'metamask' || wallet.id === 'trustwallet',
          });
        }
      });

      // Sort: installed first, then recommended, then alphabetical
      detected.sort((a, b) => {
        if (a.isInstalled !== b.isInstalled) return b.isInstalled ? 1 : -1;
        if (a.isRecommended !== b.isRecommended) return b.isRecommended ? 1 : -1;
        return a.name.localeCompare(b.name);
      });

      setAvailableWallets(detected);
    };

    detectWallets();
  }, [selectedCrypto]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (connectionTimeout) clearTimeout(connectionTimeout);
    };
  }, [connectionTimeout]);

  const connectWallet = useCallback(async (wallet) => {
    setSelectedWallet(wallet);
    setConnectionState(CONNECTION_STATE.CONNECTING);
    setErrorMessage('');

    // Set 30 second timeout for connection
    const timeout = setTimeout(() => {
      setConnectionState(CONNECTION_STATE.TIMEOUT);
      setErrorMessage('Connection timed out. Please try again or use manual payment.');
    }, 30000);
    setConnectionTimeout(timeout);

    try {
      if (wallet.id === 'manual') {
        // Manual payment - no wallet connection needed
        clearTimeout(timeout);
        setConnectionState(CONNECTION_STATE.CONNECTED);
        onWalletConnected({
          wallet: wallet,
          address: null,
          balance: null,
          isManual: true,
        });
        return;
      }

      // Attempt wallet connection
      let provider = null;
      let accounts = [];

      if (wallet.id === 'metamask' && window.ethereum?.isMetaMask) {
        provider = window.ethereum;
      } else if (wallet.id === 'coinbase' && window.ethereum?.isCoinbaseWallet) {
        provider = window.ethereum;
      } else if (wallet.id === 'phantom' && window.phantom?.ethereum) {
        provider = window.phantom.ethereum;
      } else if (wallet.id === 'trustwallet' && window.ethereum?.isTrust) {
        provider = window.ethereum;
      } else if (wallet.id === 'walletconnect') {
        // WalletConnect would use its own modal - simplified here
        clearTimeout(timeout);
        setConnectionState(CONNECTION_STATE.CONNECTED);
        onWalletConnected({
          wallet: wallet,
          address: null,
          balance: null,
          isWalletConnect: true,
        });
        return;
      }

      if (provider) {
        // Request account access
        accounts = await provider.request({ method: 'eth_requestAccounts' });

        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          setConnectedAddress(address);

          // Get balance
          let balance = null;
          try {
            const balanceHex = await provider.request({
              method: 'eth_getBalance',
              params: [address, 'latest'],
            });
            balance = parseInt(balanceHex, 16) / 1e18;
            setWalletBalance(balance);
          } catch (balanceError) {
            console.warn('Could not fetch balance:', balanceError);
          }

          clearTimeout(timeout);
          setConnectionState(CONNECTION_STATE.CONNECTED);

          onWalletConnected({
            wallet: wallet,
            address: address,
            balance: balance,
            provider: provider,
            isManual: false,
          });
        } else {
          throw new Error('No accounts returned from wallet');
        }
      } else {
        // Wallet not installed - offer to open download link
        clearTimeout(timeout);
        setConnectionState(CONNECTION_STATE.ERROR);
        setErrorMessage(`${wallet.name} is not installed. Please install it first.`);
      }
    } catch (error) {
      clearTimeout(timeout);
      setConnectionState(CONNECTION_STATE.ERROR);

      if (error.code === 4001) {
        setErrorMessage('Connection rejected. Please approve the connection request in your wallet.');
      } else if (error.code === -32002) {
        setErrorMessage('Connection request pending. Please check your wallet extension.');
      } else {
        setErrorMessage(error.message || 'Failed to connect wallet. Please try again.');
      }
    }
  }, [onWalletConnected]);

  const resetConnection = () => {
    setSelectedWallet(null);
    setConnectionState(CONNECTION_STATE.IDLE);
    setConnectedAddress(null);
    setWalletBalance(null);
    setErrorMessage('');
    if (connectionTimeout) clearTimeout(connectionTimeout);
  };

  const renderWalletList = () => (
    <div className="space-y-3">
      <p className="text-sm text-stone-400 mb-4">
        Select a wallet to connect for seamless {selectedCrypto} payment
      </p>

      {availableWallets.map((wallet) => (
        <motion.button
          key={wallet.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => connectWallet(wallet)}
          className={`
            w-full flex items-center gap-4 p-4 rounded-lg border transition-all
            ${wallet.isInstalled
              ? 'bg-stone-800/80 border-stone-600 hover:border-red-600/50'
              : 'bg-stone-800/40 border-stone-700/50 opacity-75 hover:opacity-100'
            }
          `}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${wallet.color}20` }}
          >
            {wallet.icon ? (
              <img
                src={wallet.icon}
                alt={wallet.name}
                className="w-8 h-8"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <Wallet
              className="w-6 h-6"
              style={{ color: wallet.color, display: wallet.icon ? 'none' : 'block' }}
            />
          </div>

          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-50">{wallet.name}</span>
              {wallet.isRecommended && wallet.id !== 'manual' && (
                <span className="text-xs bg-red-600/30 text-red-400 px-2 py-0.5 rounded">
                  Recommended
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              {wallet.id === 'manual'
                ? 'Copy address and pay manually'
                : wallet.isInstalled
                  ? 'Detected - Click to connect'
                  : 'Not installed'
              }
            </p>
          </div>

          {wallet.isInstalled && wallet.id !== 'manual' && (
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          )}
        </motion.button>
      ))}
    </div>
  );

  const renderConnecting = () => (
    <div className="text-center py-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 mx-auto mb-6"
      >
        <Loader2 className="w-16 h-16 text-red-600" />
      </motion.div>

      <h3 className="text-xl font-bold text-amber-50 mb-2">
        Connecting to {selectedWallet?.name}
      </h3>
      <p className="text-stone-400 text-sm mb-4">
        Please approve the connection request in your wallet...
      </p>

      <div className="bg-stone-800/50 rounded-lg p-4 text-left text-xs text-stone-500">
        <p className="mb-2">• Check your wallet extension for a popup</p>
        <p className="mb-2">• Make sure to approve the connection</p>
        <p>• This may take a few moments</p>
      </div>

      <Button
        variant="outline"
        onClick={resetConnection}
        className="mt-6 border-stone-700 text-stone-300"
      >
        Cancel
      </Button>
    </div>
  );

  const renderConnected = () => (
    <div className="text-center py-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-16 h-16 mx-auto mb-6 bg-green-600/20 rounded-full flex items-center justify-center"
      >
        <Check className="w-10 h-10 text-green-500" />
      </motion.div>

      <h3 className="text-xl font-bold text-green-500 mb-2">
        Wallet Connected
      </h3>

      {connectedAddress && (
        <div className="bg-stone-800/50 rounded-lg p-4 mb-4">
          <p className="text-xs text-stone-500 mb-1">Connected Address</p>
          <p className="text-amber-50 font-mono text-sm break-all">
            {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
          </p>
          {walletBalance !== null && (
            <p className="text-xs text-stone-400 mt-2">
              Balance: {walletBalance.toFixed(4)} ETH
            </p>
          )}
        </div>
      )}

      <p className="text-stone-400 text-sm mb-6">
        You can now proceed with your {selectedCrypto} payment
      </p>

      <Button
        onClick={onClose}
        className="w-full bg-red-700 hover:bg-red-600 text-amber-50"
      >
        Continue to Payment
      </Button>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 mx-auto mb-6 bg-red-600/20 rounded-full flex items-center justify-center"
      >
        <AlertCircle className="w-10 h-10 text-red-500" />
      </motion.div>

      <h3 className="text-xl font-bold text-red-500 mb-2">
        Connection Failed
      </h3>

      <p className="text-stone-400 text-sm mb-4">
        {errorMessage}
      </p>

      {selectedWallet?.deepLink && !selectedWallet.detectProvider() && (
        <a
          href={selectedWallet.deepLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 text-sm mb-4"
        >
          <ExternalLink className="w-4 h-4" />
          Download {selectedWallet.name}
        </a>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={resetConnection}
          className="flex-1 border-stone-700 text-stone-300"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button
          onClick={() => connectWallet(WALLET_CONFIGS.manual)}
          className="flex-1 bg-stone-700 hover:bg-stone-600 text-amber-50"
        >
          Manual Payment
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (connectionState) {
      case CONNECTION_STATE.CONNECTING:
        return renderConnecting();
      case CONNECTION_STATE.CONNECTED:
        return renderConnected();
      case CONNECTION_STATE.ERROR:
      case CONNECTION_STATE.TIMEOUT:
        return renderError();
      default:
        return renderWalletList();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-stone-900 border border-stone-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-50 flex items-center gap-3">
            <Wallet className="w-6 h-6 text-red-600" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-stone-400">
            {connectionState === CONNECTION_STATE.IDLE
              ? `Connect your wallet to pay ${requiredAmount} ${selectedCrypto}`
              : connectionState === CONNECTION_STATE.CONNECTED
                ? 'Wallet successfully connected'
                : 'Processing connection...'
            }
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={connectionState}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export { WALLET_CONFIGS, CONNECTION_STATE };
