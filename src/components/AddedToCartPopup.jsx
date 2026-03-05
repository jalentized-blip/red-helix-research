import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AddedToCartPopup({ item, onClose, onContinue }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [item]);

  if (!item) return null;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 99999, width: 'calc(100vw - 2rem)', maxWidth: '400px' }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Green top bar */}
            <div className="h-1.5 bg-gradient-to-r from-green-400 to-green-500 w-full" />

            <div className="px-5 pt-4 pb-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm leading-tight">Added to Cart!</p>
                    <p className="text-[11px] text-slate-500 font-medium">{item.productName} — {item.specification}</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={onContinue || onClose}
                  className="px-4 py-2.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  Keep Shopping
                </button>
                <Link
                  to={createPageUrl('Cart')}
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl bg-[#8B2635] text-white font-black text-xs uppercase tracking-widest hover:bg-[#6B1827] transition-all flex items-center justify-center gap-1.5"
                >
                  View Cart
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}