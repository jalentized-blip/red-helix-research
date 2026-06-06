import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Lock, ShieldAlert, Trash2 } from 'lucide-react';

const OWNER_EMAIL = 'jalentized@gmail.com';

export default function AdminMigrationKit() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('ownerMigrationKit', {});
      const json = JSON.stringify(response.data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RHR_OwnerMigrationKit_${new Date().toISOString().slice(0, 10)}.json`;
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

  if (!user || user.email !== OWNER_EMAIL) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-white text-xl font-bold">Access Denied</p>
        <p className="text-slate-400 mt-2">This page is restricted to the site owner.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="w-8 h-8 text-amber-400 flex-shrink-0" />
          <div>
            <h1 className="text-white font-black text-xl">Owner Migration Kit</h1>
            <p className="text-slate-400 text-sm">One-time owner-only download</p>
          </div>
        </div>

        <div className="bg-amber-950/40 border border-amber-700/50 rounded-xl p-4 mb-6 text-sm text-amber-200 space-y-2">
          <p className="font-bold text-amber-300">⚠️ Security Notice</p>
          <p>This file contains: all secret key names + purposes, full payment architecture docs, wallet addresses, AI coder briefing, and complete backend function inventory.</p>
          <p className="font-semibold">Store the downloaded file securely. Do not commit it to any repository.</p>
          <p>After downloading, delete the <code className="bg-black/30 px-1 rounded">ownerMigrationKit</code> backend function and this page from the codebase.</p>
        </div>

        <div className="space-y-3 mb-6 text-sm text-slate-300">
          <p className="font-semibold text-white">What's included:</p>
          <ul className="space-y-1 list-disc list-inside text-slate-400">
            <li>All secret key names + where to get new values</li>
            <li>Square, Crypto, and Zelle payment flow (step-by-step)</li>
            <li>Every backend function — purpose, called by, critical notes</li>
            <li>Wallet addresses to update in crypto verification</li>
            <li>Static promo codes to carry over</li>
            <li>Full AI coder briefing with all business rules</li>
            <li>Entity data model + RLS rules</li>
            <li>Migration checklist with priority tiers</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-700 rounded-xl p-3 mb-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {downloaded && (
          <div className="bg-green-950/40 border border-green-700 rounded-xl p-3 mb-4 text-green-300 text-sm font-semibold">
            ✅ Downloaded successfully. Now delete the ownerMigrationKit function and this page.
          </div>
        )}

        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black text-base h-12"
        >
          {downloading ? (
            <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" /> Generating...</span>
          ) : (
            <span className="flex items-center gap-2"><Download className="w-5 h-5" /> Download Migration Kit</span>
          )}
        </Button>

        <div className="mt-4 flex items-center gap-2 text-slate-500 text-xs">
          <Trash2 className="w-3.5 h-3.5" />
          <span>After downloading: delete <code>functions/ownerMigrationKit.js</code> and <code>pages/AdminMigrationKit.jsx</code></span>
        </div>
      </div>
    </div>
  );
}