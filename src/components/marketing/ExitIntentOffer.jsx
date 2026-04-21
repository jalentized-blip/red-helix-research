import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const STORAGE_KEY = 'rhr_exit_intent_shown';

export default function ExitIntentOffer() {
  const [show, setShow] = useState(false);

  const handleMouseLeave = useCallback((e) => {
    if (e.clientY <= 5) {
      const shown = sessionStorage.getItem(STORAGE_KEY);
      if (!shown) {
        setShow(true);
        sessionStorage.setItem(STORAGE_KEY, '1');
      }
    }
  }, []);

  useEffect(() => {
    // Only activate after 15 seconds on page
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 15000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseLeave]);

  const close = () => setShow(false);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="relative bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>

            {/* Top stripe */}
            <div className="bg-gradient-to-r from-[#8B2635] to-[#6B1827] px-8 py-6 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1 mb-3">
                <Zap className="w-3.5 h-3.5 text-white" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">Wait — Before You Go</span>
              </div>
              <h2 className="text-3xl font-black text-white leading-tight">
                FREE SHIPPING<br />
                <span className="text-red-200 text-xl font-bold">on your first order over $100</span>
              </h2>
            </div>

            <div className="p-8 text-center">
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                You're this close to research-grade peptides with <strong>99%+ HPLC-verified purity</strong>. 
                We'll cover shipping on orders over $100 — no code needed, applied automatically.
              </p>

              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "99%+ Purity", sub: "HPLC Verified" },
                  { label: "3rd-Party COA", sub: "Every Batch" },
                  { label: "Fast Dispatch", sub: "24–48h" },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs font-black text-slate-800">{item.label}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{item.sub}</p>
                  </div>
                ))}
              </div>

              <Link to={createPageUrl('Products')} onClick={close}>
                <button className="w-full bg-[#8B2635] hover:bg-[#6B1827] text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-colors shadow-lg shadow-[#8B2635]/20 mb-3">
                  Browse Products →
                </button>
              </Link>
              <button
                onClick={close}
                className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors underline"
              >
                No thanks, I'll pass on free shipping
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}