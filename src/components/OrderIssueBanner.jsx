import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'order_issue_form_submitted_linda';
const SESSION_DISMISS_KEY = 'order_issue_modal_dismissed';
const TARGET_EMAIL = 'lindaograce86@hotmail.com';

export default function OrderIssueBanner({ adminViewAsUser = false }) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(SESSION_DISMISS_KEY) === 'true'
  );

  useEffect(() => {
    const check = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) return;
        const user = await base44.auth.me();

        if (user?.email === TARGET_EMAIL) {
          const alreadySubmitted = localStorage.getItem(STORAGE_KEY) === 'true';
          if (!alreadySubmitted) setShow(true);
        } else if (user?.role === 'admin' && !adminViewAsUser) {
          setShow(true);
        }
      } catch {}
    };
    check();
  }, [adminViewAsUser]);

  if (!show || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-amber-500 px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-black text-base uppercase tracking-tight leading-tight">
                Action Required
              </h2>
              <p className="text-amber-100 text-xs font-semibold mt-0.5">Order System Issue — Please Read</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <p className="text-slate-700 text-sm font-medium leading-relaxed mb-6">
              Our order management system was <strong>temporarily down</strong> when you placed your most recent order. 
              Your order details may not have been fully captured.
              <br /><br />
              Please visit your <strong>Account page</strong> and fill out the short order form so we can ensure your order is processed correctly.
            </p>

            <Link
              to={createPageUrl('Account')}
              onClick={() => { sessionStorage.setItem(SESSION_DISMISS_KEY, 'true'); setDismissed(true); }}
              className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-sm px-6 py-4 rounded-2xl transition-colors shadow-lg shadow-amber-200"
            >
              Go to My Account & Fill Out Form <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setDismissed(true)}
              className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors py-2"
            >
              Remind me later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}