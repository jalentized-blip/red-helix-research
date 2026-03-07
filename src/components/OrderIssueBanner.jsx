import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'order_issue_form_submitted_linda';
const TARGET_EMAIL = 'lindaograce86@hotmail.com';

export default function OrderIssueBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) return;
        const user = await base44.auth.me();

        if (user?.email === TARGET_EMAIL) {
          // For the target user, hide once they've submitted the form
          const alreadySubmitted = localStorage.getItem(STORAGE_KEY) === 'true';
          if (!alreadySubmitted) setShow(true);
        } else if (user?.role === 'admin') {
          // Admins always see it (for testing/preview purposes)
          setShow(true);
        }
      } catch {}
    };
    check();
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-[72px] left-0 right-0 z-[67] bg-amber-500 text-white px-4 py-3 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-bold truncate">
                <span className="font-black uppercase tracking-tight">Action Required:</span>{' '}
                Our order system was temporarily down when you placed your order. Please submit your order details.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                to={createPageUrl('Account')}
                className="flex items-center gap-1.5 bg-white text-amber-600 hover:bg-amber-50 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                Fill Out Form <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setShow(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}