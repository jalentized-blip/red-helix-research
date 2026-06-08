import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Lock, CreditCard, Smartphone, DollarSign, Code } from 'lucide-react';

const OWNER_EMAIL = 'jalentized@gmail.com';

export default function AdminPaymentDocsExport() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const isOwner = user?.email === OWNER_EMAIL;

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('exportPaymentDocs', {});
      const json = JSON.stringify(response.data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RHR_PaymentSystemDocs_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
    } catch (err) {
      setError(err.message || 'Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!isOwner) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-white text-xl font-bold">Access Denied</p>
      </div>
    </div>
  );

  const sections = [
    { icon: CreditCard, label: 'Square Card Payments', sub: 'Full flow, scrambled order names, webhook handling, retries, failsafes, signature verification' },
    { icon: DollarSign, label: 'Zelle Payments', sub: 'Disclaimer system, contact name rules, manual confirmation flow, account protection' },
    { icon: Smartphone, label: 'Crypto Payments', sub: 'BTC/ETH/USDT/USDC, wallet addresses, exchange rates, TX hash verification' },
    { icon: Code, label: 'Complete Source Code', sub: 'All function code: validateOrder, decrementStock, squareWebhook, syncSquarePayments, verifyCryptoTransaction' },
    { icon: Code, label: 'Order Entity Schema', sub: 'Every field documented: status values, payment_status flow, stock_reserved, square_order_id matching' },
    { icon: Code, label: 'Migration Instructions', sub: 'Step-by-step guide for new AI builder. URLs to update, env vars needed, Square sandbox testing.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="text-center mb-8">
          <h1 className="text-white font-black text-2xl mb-1">Payment System Docs Export</h1>
          <p className="text-slate-400 text-sm">Complete payment architecture + source code for platform migration</p>
        </div>

        <div className="bg-amber-950/40 border border-amber-700/50 rounded-xl p-4 text-amber-200 text-sm">
          <p className="font-bold text-amber-300">For your AI builder on the new platform</p>
          <p>This JSON contains everything your new AI builder needs to recreate the entire checkout system from scratch: architecture diagrams, annotated code, why decisions were made, env vars, Square API endpoints, webhook security, and migration checklist.</p>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-4">What is documented</h2>
          <div className="space-y-3">
            {sections.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-bold">{label}</p>
                  <p className="text-slate-500 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-3">Key architectural decisions explained</h2>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li>Why Square line items are named "Order X — Item 1" instead of product names</li>
            <li>Why Zelle requires specific contact names and memo fields</li>
            <li>Why crypto accepts self-reported TX hashes instead of requiring confirmations</li>
            <li>How the 3-strategy order matching in the webhook works</li>
            <li>Why there are 10% processing fees on card but not crypto/Zelle</li>
            <li>How stock double-decrement is prevented across concurrent orders</li>
            <li>How Square's 24-hour retry window is handled safely</li>
          </ul>
        </div>

        {error && <div className="bg-red-950/40 border border-red-700 rounded-xl p-3 text-red-300 text-sm">{error}</div>}

        {downloaded && (
          <div className="bg-green-950/40 border border-green-700 rounded-xl p-3 text-green-300 text-sm font-semibold">
            Downloaded. Share this JSON with your new AI builder as context when setting up payments.
          </div>
        )}

        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-base h-12"
        >
          {downloading
            ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating...</span>
            : <span className="flex items-center gap-2"><Download className="w-5 h-5" /> Download Payment System Docs</span>
          }
        </Button>

        <p className="text-center text-slate-600 text-xs">Owner-only — hard-locked to {OWNER_EMAIL}</p>
      </div>
    </div>
  );
}