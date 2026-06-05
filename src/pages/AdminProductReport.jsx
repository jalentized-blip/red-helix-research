import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminProductReport() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      setIsAdmin(user?.role === 'admin');
    }).catch(() => setIsAdmin(false));
  }, []);

  const handleDownload = async () => {
    setLoading(true);
    setStatus(null);
    setMessage('');
    try {
      const response = await base44.functions.invoke('generateProductReportPDF', {}, { responseType: 'arraybuffer' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RedHelixResearch_ProductReport_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('success');
      setMessage('PDF downloaded successfully!');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Failed to generate PDF.');
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 p-10 max-w-lg w-full text-center space-y-6"
      >
        <div className="space-y-2">
          <div className="w-16 h-16 bg-[#8B2635]/10 rounded-full flex items-center justify-center mx-auto">
            <FileDown className="w-8 h-8 text-[#8B2635]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Product Catalog Report PDF</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Generates a comprehensive PDF of your full product catalog including every specification, pricing, stock levels, cost prices, and catalog metadata.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">What's included</p>
          {[
            'Catalog summary (totals, stock units, price range)',
            'Products breakdown by category',
            'Low stock alerts (≤5 units)',
            'Every product: name, description, category, badge',
            'All specifications: price, cost price, stock qty, visibility',
            'In-stock flags, hidden status, featured flag, record IDs',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-slate-600">{item}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={handleDownload}
          disabled={loading || isAdmin === null}
          className="w-full bg-[#8B2635] hover:bg-[#6B1827] text-white font-black text-base py-6 rounded-xl shadow-lg shadow-red-900/20 transition-all"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating PDF...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FileDown className="w-5 h-5" />
              Download Full Product Report PDF
            </span>
          )}
        </Button>

        {status === 'success' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 text-sm font-bold">
            ✓ {message}
          </motion.p>
        )}
        {status === 'error' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#8B2635] text-sm font-bold">
            ✗ {message}
          </motion.p>
        )}

        <p className="text-[11px] text-slate-400">Admin only — all data is fetched server-side and not cached.</p>
      </motion.div>
    </div>
  );
}