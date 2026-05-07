import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Copy, Check, Gift, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// ─── Storage helpers (safe for private browsing / Safari ITP) ────────────────
const safeStorage = {
  get: (store, key) => { try { return store.getItem(key); } catch { return null; } },
  set: (store, key, val) => { try { store.setItem(key, val); } catch { /* quota or private mode */ } },
  remove: (store, key) => { try { store.removeItem(key); } catch { /* ignore */ } },
};
const ls = { get: (k) => safeStorage.get(localStorage, k), set: (k, v) => safeStorage.set(localStorage, k, v), remove: (k) => safeStorage.remove(localStorage, k) };

// ─── Keys ────────────────────────────────────────────────────────────────────
const NEVER_SHOW_KEY   = 'rhr_welcome_never_show';
const WELCOME_CODE_KEY = 'rhr_welcome_code';
const WELCOME_EXP_KEY  = 'rhr_welcome_code_exp';
const SHOWN_DATE_KEY   = 'rhr_welcome_shown_date'; // persist across tabs, reset daily

// ─── Helpers ─────────────────────────────────────────────────────────────────
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const arr = new Uint8Array(6);
  crypto.getRandomValues(arr); // cryptographically random — not Math.random()
  return 'NEWRHR-' + Array.from(arr, (b) => chars[b % chars.length]).join('');
};

const isCodeExpired = (isoExpiry) => {
  if (!isoExpiry) return true;
  try { return new Date(isoExpiry) < new Date(); } catch { return true; }
};

// iOS Safari: clipboard.writeText fails after async gaps — use execCommand fallback
const copyToClipboard = async (text) => {
  // Preferred: modern async API (Chrome, FF, Edge)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* fall through */ }
  }
  // Fallback: document.execCommand (synchronous, works on iOS Safari)
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
    document.body.appendChild(el);
    el.focus();
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch { return false; }
};

const todayStr = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// ─── Component ───────────────────────────────────────────────────────────────
export default function WelcomeDiscountPopup() {
  const [show, setShow]               = useState(false);
  const [step, setStep]               = useState('email'); // 'email' | 'code'
  const [email, setEmail]             = useState('');
  const [emailError, setEmailError]   = useState('');
  const [code, setCode]               = useState('');
  const [copied, setCopied]           = useState(false);
  const [loading, setLoading]         = useState(false);

  const submitLock = useRef(false);   // prevents double-submit within same render cycle
  const dialogRef  = useRef(null);
  const inputRef   = useRef(null);

  // ── Determine whether to show ──────────────────────────────────────────────
  useEffect(() => {
    // Hard-dismissed by user
    if (ls.get(NEVER_SHOW_KEY)) return;

    // Already shown today (persists across tabs — prevents re-trigger on every new tab)
    const shownDate = ls.get(SHOWN_DATE_KEY);
    if (shownDate === todayStr()) return;

    // Already has a valid (non-expired) local code
    const existingCode = ls.get(WELCOME_CODE_KEY);
    const existingExp  = ls.get(WELCOME_EXP_KEY);
    if (existingCode && !isCodeExpired(existingExp)) return;

    // If stored code is expired, clean it up so they can get a fresh one
    if (existingCode && isCodeExpired(existingExp)) {
      ls.remove(WELCOME_CODE_KEY);
      ls.remove(WELCOME_EXP_KEY);
    }

    // Delay popup — wait for ResearchDisclaimerGate and page to fully settle
    const timer = setTimeout(() => {
      ls.set(SHOWN_DATE_KEY, todayStr());
      setShow(true);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  // ── Focus trap: keep focus inside dialog when open ──────────────────────────
  useEffect(() => {
    if (!show) return;
    // Focus input after animation settles
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, [show]);

  // ── Escape key handler ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!show) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closePopup(false);
      // Basic focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [show]);

  const closePopup = useCallback((permanent = false) => {
    if (permanent) ls.set(NEVER_SHOW_KEY, '1');
    setShow(false);
  }, []);

  // ── Email submission ────────────────────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    // Debounce / double-submit guard
    if (submitLock.current || loading) return;

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setEmailError('');
    setLoading(true);
    submitLock.current = true;

    try {
      // ── Idempotency check: email already has a code? ───────────────────────
      // Runs FIRST before creating anything — prevents duplicate DB records on double-tap
      try {
        const byEmail = await base44.entities.WelcomeDiscount.filter({ email: trimmed });
        const validRecord = byEmail.find(r => r.code && !isCodeExpired(r.expires_at));
        if (validRecord) {
          // Restore to local storage and skip creation
          applyCodeLocally(validRecord.code, validRecord.expires_at);
          setCode(validRecord.code);
          setStep('code');
          return; // finally runs setLoading(false)
        }
      } catch { /* DB unavailable — fall through to create */ }

      // ── Generate code & create record ──────────────────────────────────────
      const newCode   = generateCode();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await base44.entities.WelcomeDiscount.create({
        code:        newCode,
        fingerprint: '', // removed — was causing false-positive collision suppression
        email:       trimmed,
        expires_at:  expiresAt,
        used:        false,
      });

      // ── Apply to local cart system ──────────────────────────────────────────
      applyCodeLocally(newCode, expiresAt);

      // ── Mailing list (non-critical, fire-and-forget) ────────────────────────
      base44.entities.MailingList.filter({ email: trimmed })
        .then(existing => {
          if (existing.length === 0) {
            return base44.entities.MailingList.create({
              email:         trimmed,
              source:        'welcome_discount',
              discount_code: newCode,
              subscribed:    true,
              tags:          ['welcome_discount'],
            });
          }
        })
        .catch(() => { /* non-critical */ });

      // ── Welcome email (non-critical, fire-and-forget) ───────────────────────
      base44.functions.invoke('sendWelcomeDiscountEmail', {
        email,
        code:       newCode,
        expires_at: expiresAt,
      }).catch(() => { /* non-critical — code is already shown on screen */ });

      setCode(newCode);
      setStep('code');

    } catch {
      setEmailError('Something went wrong. Please try again.');
      submitLock.current = false; // allow retry on error
    } finally {
      setLoading(false);
      // Note: submitLock stays true after success to prevent re-submission
    }
  };

  const applyCodeLocally = (code, expiresAt) => {
    ls.set(WELCOME_CODE_KEY, code);
    ls.set(WELCOME_EXP_KEY, expiresAt);
    try {
      const dynPromos = JSON.parse(ls.get('rhr_dynamic_promos') || '{}');
      dynPromos[code] = { discount: 0.10, label: '10% off single vials', singleVialsOnly: true, isWelcome: true };
      ls.set('rhr_dynamic_promos', JSON.stringify(dynPromos));
    } catch { /* storage quota */ }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closePopup(false); }}
          aria-modal="true"
          role="dialog"
          aria-label="Welcome discount offer"
        >
          <motion.div
            ref={dialogRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => closePopup(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              aria-label="Close welcome offer"
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
              {step === 'email' ? (
                <>
                  <p className="text-slate-700 font-semibold text-center mb-1">
                    Get <span className="text-[#8B2635] font-black text-xl">10% OFF</span> your first order
                  </p>
                  <p className="text-slate-500 text-xs text-center mb-6 leading-relaxed">
                    Enter your email to unlock your code — we'll also send it to you so you never lose it.{' '}
                    Valid on <strong>single vials only</strong>.
                  </p>

                  <form onSubmit={handleEmailSubmit} className="space-y-3" noValidate>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        ref={inputRef}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#8B2635] transition-colors"
                        disabled={loading}
                        aria-label="Email address"
                        aria-describedby={emailError ? 'email-error' : undefined}
                        aria-invalid={!!emailError}
                      />
                    </div>

                    {emailError && (
                      <p id="email-error" className="text-[#8B2635] text-xs font-medium" role="alert">
                        {emailError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-[#8B2635] text-white font-black uppercase tracking-widest text-sm py-3.5 rounded-xl hover:bg-[#6B1827] transition-colors shadow-lg shadow-[#8B2635]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Generating...</>
                      ) : (
                        <>Unlock My 10% Code <ArrowRight className="w-4 h-4" aria-hidden="true" /></>
                      )}
                    </button>
                  </form>

                  <p className="text-[10px] text-slate-400 text-center mt-4 leading-relaxed">
                    By submitting you agree to receive occasional research updates &amp; promotions. Unsubscribe anytime.
                    Single vials only — excludes kits.
                  </p>

                  <button
                    onClick={() => closePopup(true)}
                    className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 mt-3 transition-colors"
                  >
                    No thanks, don't show again
                  </button>
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
                    <Tag className="w-5 h-5 text-[#8B2635] flex-shrink-0" aria-hidden="true" />
                    <span className="flex-1 text-xl font-black text-slate-900 tracking-widest select-all" aria-label={`Discount code: ${code}`}>
                      {code}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8B2635] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#6B1827] transition-colors"
                      aria-label={copied ? 'Code copied' : 'Copy code to clipboard'}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <button
                    onClick={() => closePopup(false)}
                    className="w-full bg-[#8B2635] text-white font-black uppercase tracking-widest text-sm py-3.5 rounded-xl hover:bg-[#6B1827] transition-colors shadow-lg shadow-[#8B2635]/20"
                  >
                    Shop Now &amp; Save 10%
                  </button>

                  <p className="text-[10px] text-slate-400 text-center mt-4 leading-relaxed">
                    Discount applies to single vial products only. Not valid on kits, bundles, or combined with other offers.
                    One-time use. Expires in 30 days.
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