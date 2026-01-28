import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Mail, Package, Truck, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function PaymentCompleted() {
  const [transactionId, setTransactionId] = useState('');
  const [isWalletPayment, setIsWalletPayment] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTransactionId(params.get('txid') || '');
    setIsWalletPayment(params.get('wallet') === 'connected');
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-stone-900/50 border border-green-600/30 rounded-lg p-8 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="w-20 h-20 bg-green-600/20 border border-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-green-600" />
          </motion.div>

          <h1 className="text-4xl font-black text-green-600 mb-3">Payment Confirmed!</h1>
          <p className="text-stone-400 text-lg mb-4">
            {isWalletPayment
              ? 'Your wallet payment has been successfully processed.'
              : 'Your transaction has been successfully detected and confirmed on the blockchain.'}
          </p>

          {/* Tracking Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-600/40 rounded-lg p-6 mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-purple-400">Tracking Information</h2>
            </div>
            <div className="bg-stone-900/50 rounded-lg p-4 border border-purple-600/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <p className="text-amber-400 font-semibold">Within 48 Hours</p>
              </div>
              <p className="text-stone-300 text-sm">
                Your tracking number will be provided within the next <span className="text-purple-400 font-semibold">48 hours</span>.
              </p>
              <p className="text-stone-500 text-xs mt-2">
                You'll receive an email notification when your order ships.
              </p>
            </div>
          </motion.div>

          {transactionId && (
            <div className="bg-stone-800/50 rounded-lg p-4 mb-8">
              <p className="text-xs text-stone-500 mb-1">Transaction ID</p>
              <p className="text-amber-50 font-mono text-sm break-all">{transactionId}</p>
              {transactionId.startsWith('0x') && (
                <a
                  href={`https://etherscan.io/tx/${transactionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-2"
                >
                  View on Etherscan <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-stone-800/50 rounded-lg p-4 border border-stone-700"
            >
              <Mail className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-stone-300 font-semibold">Check Email</p>
              <p className="text-xs text-stone-500 mt-1">Confirmation sent</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-stone-800/50 rounded-lg p-4 border border-stone-700"
            >
              <Package className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-stone-300 font-semibold">Processing</p>
              <p className="text-xs text-stone-500 mt-1">Order being prepared</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-stone-800/50 rounded-lg p-4 border border-stone-700"
            >
              <Truck className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-stone-300 font-semibold">Shipping Soon</p>
              <p className="text-xs text-stone-500 mt-1">Tracking in 48 hrs</p>
            </motion.div>
          </div>

          {/* Status Checklist */}
          <div className="bg-stone-800/50 rounded-lg p-6 mb-8">
            <h3 className="text-sm font-semibold text-stone-300 mb-4 text-left">Order Status</h3>
            <ul className="text-left space-y-3 text-sm text-stone-400">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-500" />
                </div>
                <span>Payment confirmed on blockchain</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-500" />
                </div>
                <span>Order recorded in our system</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-blue-400">Processing & packaging your order</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-stone-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-3 h-3 text-stone-500" />
                </div>
                <span className="text-stone-500">Tracking number (within 48 hours)</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 bg-stone-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-3 h-3 text-stone-500" />
                </div>
                <span className="text-stone-500">Shipped & on the way</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to={createPageUrl('OrderTracking')} className="flex-1">
              <Button variant="outline" className="w-full border-purple-600/50 text-purple-400 hover:bg-purple-600/10 hover:text-purple-300 py-6">
                <Truck className="w-4 h-4 mr-2" />
                Track My Order
              </Button>
            </Link>
            <Link to={createPageUrl('Home')} className="flex-1">
              <Button className="w-full bg-red-700 hover:bg-red-600 text-amber-50 font-semibold py-6">
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Support Info */}
          <p className="text-xs text-stone-500 mt-6">
            Questions? Contact us on{' '}
            <a href="https://discord.gg/s78Jeajp" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-500 underline">
              Discord
            </a>
            {' '}for support.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
