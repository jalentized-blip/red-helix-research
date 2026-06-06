import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Loader2, ShieldAlert, CheckCircle2, Database, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const SECTIONS = [
  { icon: '📦', label: 'All Orders', desc: 'Every order with items, status, payment, shipping, tracking, promo/affiliate codes' },
  { icon: '🛍️', label: 'Products & Specifications', desc: 'Full catalog — every spec, price, cost price, stock qty, visibility flags, images' },
  { icon: '👤', label: 'Customer Profiles', desc: 'Derived per-customer records: lifetime spend, order history, addresses, tags' },
  { icon: '🤝', label: 'Affiliates & Payments', desc: 'All affiliate accounts, codes, commission records, payout history, click logs' },
  { icon: '🎟️', label: 'Promo Codes', desc: 'Every promo code with discount %, usage counts, expiry, active status' },
  { icon: '📧', label: 'Mailing List', desc: 'All subscribers, source, discount codes issued, unsubscribe status, tags' },
  { icon: '🎫', label: 'Welcome Discounts', desc: 'Generated discount codes, fingerprints, usage records' },
  { icon: '🧾', label: 'Order Snapshots', desc: 'Checkout-captured order data (immutable at time of purchase)' },
  { icon: '✉️', label: 'Order Communications', desc: 'Every email sent to customers per order' },
  { icon: '🔬', label: 'COAs (Official & User)', desc: 'Certificates of Analysis — official and user-uploaded, with batch numbers' },
  { icon: '📢', label: 'Banner Messages', desc: 'All promotional banner content and CTA configurations' },
  { icon: '💬', label: 'Support Conversations', desc: 'Customer support thread metadata' },
  { icon: '🌟', label: 'Testimonials', desc: 'All customer testimonials and review data' },
  { icon: '🗳️', label: 'Wish List Items', desc: 'Community product requests with vote counts' },
  { icon: '📊', label: 'Analytics Summary', desc: 'Revenue by month, top products, payment method breakdown, affiliate stats' },
  { icon: '🛒', label: 'Add-to-Cart Logs', desc: 'SKU validation events and price mismatch logs' },
  { icon: '📝', label: 'Forum Threads', desc: 'All community forum thread data' },
];

export default function AdminDataExport() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setIsAdmin(u?.role === 'admin')).catch(() => setIsAdmin(false));
  }, []);

  const handleExport = async () => {
    setLoading(true);
    setStatus(null);
    setMessage('');
    try {
      const response = await base44.functions.invoke('exportFullData', {});
      // response.data is already a parsed JS object from the SDK
      const json = JSON.stringify(response.data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RedHelixResearch_FullExport_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('success');
      setMessage('Full export downloaded successfully! This file contains everything needed for migration.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-[#8B2635] mx-auto" />
          <p className="text-slate-700 font-bold text-lg">Admin access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-4"
        >
          <div className="w-16 h-16 bg-[#8B2635]/10 rounded-full flex items-center justify-center mx-auto">
            <Database className="w-8 h-8 text-[#8B2635]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Full Site Data Export</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Downloads a single <strong>.json</strong> file containing 100% of your business data — every order, customer, product, affiliate, promo code, mailing list subscriber, COA, and derived analytics. Ready to import into any new platform.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-bold text-sm">Sensitive Data</p>
              <p className="text-amber-700 text-xs mt-0.5">This file contains all customer emails, addresses, order history, and financial records. Store it securely and do not share it.</p>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={loading || isAdmin === null}
            className="w-full bg-[#8B2635] hover:bg-[#6B1827] text-white font-black text-base py-6 rounded-xl shadow-lg shadow-red-900/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Exporting all data... (may take 30–60s)
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download Full Data Export (.json)
              </span>
            )}
          </Button>

          {status === 'success' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 justify-center text-green-600 text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" />
              {message}
            </motion.div>
          )}
          {status === 'error' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#8B2635] text-sm font-bold">
              ✗ {message}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow border border-slate-200 p-6"
        >
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">What's included in the export</p>
          <div className="space-y-3">
            {SECTIONS.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg leading-none mt-0.5">{s.icon}</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">{s.label}</p>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto flex-shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </motion.div>

        <p className="text-center text-[11px] text-slate-400">Admin only — all data fetched server-side. No data is cached or stored by this tool.</p>
      </div>
    </div>
  );
}