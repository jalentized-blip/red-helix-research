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
    <div className="min-h-screen bg-white pt-32 pb-20 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-slate-200 rounded-[40px] p-12 text-center shadow-2xl shadow-slate-200/50"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="w-24 h-24 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm"
          >
            <Check className="w-12 h-12 text-green-600" />
          </motion.div>

          <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">Payment Received</h1>
          <p className="text-slate-500 text-lg mb-10 max-w-lg mx-auto font-medium">
            Your transaction has been successfully detected and confirmed on the blockchain.
          </p>

          {(transactionId || orderNumber) && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-10 space-y-4 text-left">
              {orderNumber && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Number</p>
                  <p className="text-slate-900 font-mono text-lg font-bold break-all">{orderNumber}</p>
                </div>
              )}
              {transactionId && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaction ID</p>
                  <p className="text-slate-600 font-mono text-xs break-all bg-white p-3 rounded-lg border border-slate-200">{transactionId}</p>
                </div>
              )}
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-red-600" />
              </div>
              <p className="font-bold text-slate-900 mb-1">Check your email</p>
              <p className="text-xs text-slate-500 font-medium">Order confirmation and details incoming</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-red-600" />
              </div>
              <p className="font-bold text-slate-900 mb-1">Shipping soon</p>
              <p className="text-xs text-slate-500 font-medium">Same-day processing & shipping</p>
            </motion.div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 mb-10 border border-slate-100">
            <p className="text-slate-600 font-medium text-sm mb-6 leading-relaxed">
              Your order has been recorded and our team is verifying your payment. You'll receive a confirmation email shortly with tracking information.
            </p>
            <ul className="text-left space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="font-medium">Payment confirmed on blockchain</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="font-medium">Order processing started</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="font-medium">Shipping within 24 hours</span>
              </li>
            </ul>
          </div>

          <Link to={createPageUrl('Home')}>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-8 rounded-xl shadow-lg shadow-red-600/20 text-lg transition-all hover:-translate-y-1">
              Return to Homepage
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}