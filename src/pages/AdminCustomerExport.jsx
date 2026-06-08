import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Lock, Users, ShoppingBag, Mail, UserCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const OWNER_EMAIL = 'jalentized@gmail.com';

export default function AdminCustomerExport() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const isOwner = user?.email === OWNER_EMAIL;

  const { data: users = [] } = useQuery({
    queryKey: ['users-export'],
    queryFn: () => base44.entities.User.list(),
    enabled: isOwner,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders-export'],
    queryFn: () => base44.entities.Order.list(),
    enabled: isOwner,
  });

  const { data: mailingList = [] } = useQuery({
    queryKey: ['mailing-export'],
    queryFn: () => base44.entities.MailingList.list(),
    enabled: isOwner,
  });

  const { data: affiliates = [] } = useQuery({
    queryKey: ['affiliates-export'],
    queryFn: () => base44.entities.Affiliate.list(),
    enabled: isOwner,
  });

  const uniqueGuestEmails = new Set(
    orders
      .map(o => (o.customer_email || '').toLowerCase().trim())
      .filter(e => e && !users.find(u => u.email?.toLowerCase() === e))
  );

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('exportCustomerAccounts', {});
      const json = JSON.stringify(response.data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RHR_CustomerAccounts_${new Date().toISOString().slice(0, 10)}.json`;
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

  const stats = [
    { label: 'Registered Accounts', value: users.length, icon: UserCheck, sub: 'have Base44 login' },
    { label: 'Guest Customers', value: uniqueGuestEmails.size, icon: ShoppingBag, sub: 'ordered, no account' },
    { label: 'Mailing List', value: mailingList.filter(m => m.subscribed).length, icon: Mail, sub: 'active subscribers' },
    { label: 'Affiliates', value: affiliates.length, icon: Users, sub: 'affiliate accounts' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="text-center mb-8">
          <h1 className="text-white font-black text-2xl mb-1">Customer Accounts Export</h1>
          <p className="text-slate-400 text-sm">All registered users, guest customers, mailing list and affiliate data</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, sub }) => (
            <div key={label} className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
              <Icon className="w-5 h-5 text-slate-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-slate-300 text-xs font-bold mt-1">{label}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Auth warning */}
        <div className="bg-red-950/40 border border-red-700/50 rounded-xl p-4 text-red-200 text-sm space-y-1">
          <p className="font-bold text-red-300">Passwords cannot be exported</p>
          <p>Base44 manages auth internally — passwords never leave their system. You will need to re-invite all users to your new platform. They will create a new password. Their order history links automatically by email.</p>
        </div>

        {/* PII warning */}
        <div className="bg-amber-950/40 border border-amber-700/50 rounded-xl p-4 text-amber-200 text-sm">
          <p className="font-bold text-amber-300">Contains PII — handle securely</p>
          <p>Names, emails, phone numbers, shipping addresses. Delete this file once migration is complete. Do not store unencrypted.</p>
        </div>

        {/* What's included */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-3">{"What's in the export"}</h2>
          <ul className="space-y-1.5 text-slate-400 text-sm">
            <li>All {users.length} registered account profiles (email, name, role, custom fields)</li>
            <li>Full order history linked to each account</li>
            <li>{uniqueGuestEmails.size} guest customers (ordered without an account)</li>
            <li>Mailing list status per customer (subscribed, tags, source)</li>
            <li>Affiliate program details per customer (code, commissions, totals)</li>
            <li>Welcome discount code status per customer</li>
            <li>Full mailing list for email platform import (Klaviyo, Mailchimp, etc.)</li>
            <li>Step-by-step re-invite and migration instructions</li>
            <li>Entity schemas for recreating on new platform</li>
          </ul>
        </div>

        {/* Re-invite flow */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-3">Migration Flow</h2>
          <ol className="space-y-2 text-slate-400 text-sm list-none">
            {[
              'Download this JSON file',
              'Set up auth on your new platform',
              'Send a "platform migration" email to all registered account emails',
              'They click the link, re-create their account with a new password',
              'Their order history auto-links by email match',
              'Import mailing_list_full into your email platform',
              'Re-create affiliate accounts from the affiliate data',
              'Guest customers — import as contacts, no login needed',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-slate-600 font-black text-xs mt-0.5 w-4 flex-shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {error && <div className="bg-red-950/40 border border-red-700 rounded-xl p-3 text-red-300 text-sm">{error}</div>}

        {downloaded && (
          <div className="bg-green-950/40 border border-green-700 rounded-xl p-3 text-green-300 text-sm font-semibold">
            Downloaded. Delete <code>functions/exportCustomerAccounts.js</code> and <code>pages/AdminCustomerExport.jsx</code> when done.
          </div>
        )}

        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-base h-12"
        >
          {downloading
            ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating...</span>
            : <span className="flex items-center gap-2"><Download className="w-5 h-5" /> Download Customer Accounts JSON</span>
          }
        </Button>

        <p className="text-center text-slate-600 text-xs">
          Owner-only — hard-locked to {OWNER_EMAIL}
        </p>
      </div>
    </div>
  );
}