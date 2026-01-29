import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Mail, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function PaymentCompleted() {
  const [transactionId, setTransactionId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txid = params.get('txid');
    const order = params.get('order');
    
    // Try URL params first, then fallback to localStorage
    const finalTxId = (txid && txid !== 'null') ? txid : (localStorage.getItem('lastTransactionId') || '');
    const finalOrder = (order && order !== 'null') ? order : (localStorage.getItem('lastOrderNumber') || '');
    
    setTransactionId(finalTxId);
    setOrderNumber(finalOrder);
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

          <h1 className="text-4xl font-black text-green-600 mb-3">Payment Received</h1>
          <p className="text-stone-400 text-lg mb-8">
            Your transaction has been successfully detected and confirmed on the blockchain.
          </p>

          {(transactionId || orderNumber) && (
            <div className="bg-stone-800/50 rounded-lg p-4 mb-8 space-y-3">
              {orderNumber && (
                <div>
                  <p className="text-xs text-stone-500 mb-1">Order Number</p>
                  <p className="text-amber-50 font-mono text-sm break-all">{orderNumber}</p>
                </div>
              )}
              {transactionId && (
                <div>
                  <p className="text-xs text-stone-500 mb-1">Transaction ID</p>
                  <p className="text-amber-50 font-mono text-sm break-all">{transactionId}</p>
                </div>
              )}
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-stone-800/50 rounded-lg p-4 border border-stone-700"
            >
              <Mail className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-stone-300">Check your email</p>
              <p className="text-xs text-stone-500 mt-1">Order confirmation and details incoming</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-stone-800/50 rounded-lg p-4 border border-stone-700"
            >
              <Package className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-stone-300">Shipping soon</p>
              <p className="text-xs text-stone-500 mt-1">Same-day processing & shipping</p>
            </motion.div>
          </div>

          <div className="bg-stone-800/50 rounded-lg p-6 mb-8">
            <p className="text-stone-400 text-sm mb-4">
              Your order has been recorded and our team is verifying your payment. You'll receive a confirmation email shortly with tracking information.
            </p>
            <ul className="text-left space-y-2 text-sm text-stone-400">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                Payment confirmed on blockchain
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                Order processing started
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                Shipping within 24 hours
              </li>
            </ul>
          </div>

          <Link to={createPageUrl('Home')}>
            <Button className="w-full bg-red-700 hover:bg-red-600 text-amber-50 font-semibold py-6">
              Back to Shop
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}