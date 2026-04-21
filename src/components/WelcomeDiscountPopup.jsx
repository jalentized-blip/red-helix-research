import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Copy, Check, Gift, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Generate a browser fingerprint from stable signals
const getBrowserFingerprint = () => {
  const signals = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || '',
    navigator.platform || '',
  ].join('|');

  let hash = 0;
  for (let i = 0; i < signals.length; i++) {
    const char = signals.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'NEWRHR-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const POPUP_SHOWN_KEY = 'rhr_welcome_popup_shown';
const WELCOME_CODE_KEY = 'rhr_welcome_code';

export default function WelcomeDiscountPopup() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  const close = useCallback(() => setShow(false), []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [close]);

  useEffect(() => {
    const shown = sessionStorage.getItem(POPUP_SHOWN_KEY);
    if (shown) return;

    const timer = setTimeout(async () => {
      // Check if user already has a valid welcome code stored
      const existingCode = localStorage.getItem(WELCOME_CODE_KEY);
      if (existingCode) {
        try {
          const records = await base44.entities.WelcomeDiscount.filter({ code: existingCode });
          if (records.length > 0) {
            const record = records[0];
            const expired = record.expires_at && new Date(record.expires_at) < new Date();
            if (record.used || expired) {
              localStorage.removeItem(WELCOME_CODE_KEY);
            } else {
              // Valid code — show code step directly (already claimed email)
              setCode(existingCode);
              setStep('code');
              setShow(true);
              sessionStorage.setItem(POPUP_SHOWN_KEY, '1');
              return;
            }
          }
        } catch {
          sessionStorage.setItem(POPUP_SHOWN_KEY, '1');
          return;
        }
      }

      // Check fingerprint — has this device already claimed?
      const fp = getBrowserFingerprint();
      try {
        const existing = await base44.entities.WelcomeDiscount.filter({ fingerprint: fp });
        if (existing.length > 0) {
          const valid = existing.find(r => !r.used && new Date(r.expires_at) > new Date());
          if (valid) {
            localStorage.setItem(WELCOME_CODE_KEY, valid.code);
            setCode(valid.code);
            setStep('code');
            setShow(true);
            sessionStorage.setItem(POPUP_SHOWN_KEY, '1');
            return;
          }
          setAlreadyClaimed(true);
        }
      } catch {
        // DB unavailable — still show
      }

      setShow(true);
      sessionStorage.setItem(POPUP_SHOWN_KEY, '1');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setLoading(true);

    const fp = getBrowserFingerprint();
    const newCode = generateCode();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    try {
      // Save discount record with email
      await base44.entities.WelcomeDiscount.create({
        code: newCode,
        fingerprint: fp,
        email: trimmed,
        expires_at: expiresAt,
        used: false,
      });

      // Add to mailing list (avoid duplicate emails)
      try {
        const existing = await base44.entities.MailingList.filter({ email: trimmed });
        if (existing.length === 0) {
          await base44.entities.MailingList.create({
            email: trimmed,
            source: 'welcome_discount',
            discount_code: newCode,
            subscribed: true,
            tags: ['welcome_discount'],
          });
        }
      } catch { /* non-critical */ }

      // Send welcome email with code
      try {
        await base44.functions.invoke('sendWelcomeDiscountEmail', {
          email: trimmed,
          code: newCode,
          expires_at: expiresAt,
        });
      } catch { /* non-critical — still show code */ }

      // Register in local cart system
      localStorage.setItem(WELCOME_CODE_KEY, newCode);
      const dynPromos = JSON.parse(localStorage.getItem('rhr_dynamic_promos') || '{}');
      dynPromos[newCode] = { discount: 0.10, label: '10% off single vials', singleVialsOnly: true, isWelcome: true };
      localStorage.setItem('rhr_dynamic_promos', JSON.stringify(dynPromos));

      setCode(newCode);
      setStep('code');
    } catch {
      setEmailError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-br from-[#8B2635] to-[#6B1827] p-8 pb-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
                Welcome Gift
              </h2>
              <p className="text-red-200 text-sm font-medium">
                First-time visitor exclusive
              </p>
            </div>

            {/* Body */}
            <div className="p-8">
              {alreadyClaimed ? (
                <div className="text-center">
                  <p className="text-slate-600 font-medium text-sm mb-4">
                    It looks like this device has already claimed a welcome discount. Check your email or contact us for help.
                  </p>
                  <button
                    onClick={close}
                    className="w-full bg-[#8B2635] text-white font-black uppercase tracking-widest text-sm py-3 rounded-xl hover:bg-[#6B1827] transition-colors"
                  >
                    Got It
                  </button>
                </div>
              ) : step === 'email' ? (
                <>
                  <p className="text-slate-700 font-semibold text-center mb-1">
                    Get <span className="text-[#8B2635] font-black text-xl">10% OFF</span> your first order
                  </p>
                  <p className="text-slate-500 text-xs text-center mb-6 leading-relaxed">
                    Enter your email to unlock your code — we'll also send it to you so you never lose it. Valid on <strong>single vials only</strong>.
                  </p>

                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#8B2635] transition-colors"
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                    {emailError && (
                      <p className="text-[#8B2635] text-xs font-medium">{emailError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-[#8B2635] text-white font-black uppercase tracking-widest text-sm py-3.5 rounded-xl hover:bg-[#6B1827] transition-colors shadow-lg shadow-[#8B2635]/20 disabled:opacity-60"
                    >
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                      ) : (
                        <>Unlock My 10% Code <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </form>

                  <p className="text-[10px] text-slate-400 text-center mt-4 leading-relaxed">
                    By submitting you agree to receive occasional research updates & promotions. Unsubscribe anytime. Single vials only — excludes kits.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-700 font-semibold text-center mb-1">
                    Here's your <span className="text-[#8B2635] font-black">10% OFF</span> code!
                  </p>
                  <p className="text-slate-500 text-xs text-center mb-6 leading-relaxed">
                    We've also emailed it to you. Use at checkout — valid on <strong>single vials only</strong>.
                  </p>

                  {/* Code display */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-dashed border-[#8B2635]/30 rounded-2xl mb-6">
                    <Tag className="w-5 h-5 text-[#8B2635] flex-shrink-0" />
                    <span className="flex-1 text-xl font-black text-slate-900 tracking-widest">
                      {code}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8B2635] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#6B1827] transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <button
                    onClick={close}
                    className="w-full bg-[#8B2635] text-white font-black uppercase tracking-widest text-sm py-3.5 rounded-xl hover:bg-[#6B1827] transition-colors shadow-lg shadow-[#8B2635]/20"
                  >
                    Shop Now & Save 10%
                  </button>

                  <p className="text-[10px] text-slate-400 text-center mt-4 leading-relaxed">
                    Discount applies to single vial products only. Not valid on kits, bundles, or combined with other offers. One-time use. Expires in 30 days.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}