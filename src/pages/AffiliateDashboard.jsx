import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getAffiliateByEmail, getTransactionsForAffiliate } from '@/components/utils/affiliateStore';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Check, TrendingUp, DollarSign, ShoppingBag, Star, ExternalLink, AlertCircle, ChevronRight, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SITE_BASE = window.location.origin;

export default function AffiliateDashboard() {
  const [user, setUser] = useState(null);
  const [affiliate, setAffiliate] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const aff = await getAffiliateByEmail(base44, me.email);
        if (!aff) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setAffiliate(aff);
        const txs = await getTransactionsForAffiliate(base44, aff.code);
        setTransactions(txs);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const affiliateLink = affiliate ? `${SITE_BASE}${createPageUrl('Home')}?affiliate=${affiliate.code}` : '';

  const stats = [
    { label: 'Total Revenue', value: `$${(affiliate?.total_revenue || 0).toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Commission Earned', value: `$${(affiliate?.total_commission || 0).toFixed(2)}`, icon: DollarSign, color: 'text-[#8B2635]', bg: 'bg-red-50' },
    { label: 'Total Orders', value: affiliate?.total_orders || 0, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Reward Points', value: (affiliate?.total_points || 0).toFixed(1), icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#8B2635] rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-[#8B2635]" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">No Affiliate Account Found</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your email <span className="font-bold text-slate-700">{user?.email}</span> is not linked to an affiliate account. Please contact us to get set up.
          </p>
          <Link to={createPageUrl('Contact')} className="inline-flex items-center gap-2 bg-[#8B2635] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#6B1827] transition-colors">
            Contact Us <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <img src="https://i.imgur.com/8MOtTE2.png" alt="Red Helix Research" className="h-8 w-auto object-contain" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Affiliate Portal</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">Welcome back, <span className="text-[#8B2635]">{affiliate?.affiliate_name?.split(' ')[0]}</span></h1>
          <p className="text-slate-500 mt-1 text-sm">Track your performance, grab your link, and monitor commissions.</p>
        </motion.div>

        {/* Status Badge */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
          <Badge className={affiliate?.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}>
            {affiliate?.is_active ? '● Active Affiliate' : '○ Inactive'}
          </Badge>
          <span className="ml-3 text-xs text-slate-400">Code: <span className="font-black text-slate-700">{affiliate?.code}</span></span>
          <span className="ml-3 text-xs text-slate-400">Discount you give customers: <span className="font-black text-[#8B2635]">{affiliate?.discount_percent}% off</span></span>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Affiliate Link + Code */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#8B2635]" /> Your Affiliate Tools
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Affiliate Link */}
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Shareable Link</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <span className="text-sm text-slate-600 flex-1 truncate">{affiliateLink}</span>
                <button onClick={() => copy(affiliateLink, 'link')}
                  className="flex-shrink-0 p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                  {copied === 'link' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Share this link — customers get {affiliate?.discount_percent}% off automatically.</p>
            </div>

            {/* Promo Code */}
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Promo Code</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <span className="text-lg font-black text-slate-800 flex-1 tracking-widest">{affiliate?.code}</span>
                <button onClick={() => copy(affiliate?.code, 'code')}
                  className="flex-shrink-0 p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                  {copied === 'code' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Customers can enter this code at checkout.</p>
            </div>
          </div>

          {/* Quick share links */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
            <a href={`https://twitter.com/intent/tweet?text=Check+out+Red+Helix+Research+peptides!+Use+my+code+${affiliate?.code}+for+${affiliate?.discount_percent}%25+off:+${encodeURIComponent(affiliateLink)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors">
              Share on X <ExternalLink className="w-3 h-3" />
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(affiliateLink)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors">
              Share on Facebook <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>

        {/* Commission Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-[#8B2635] to-[#6B1827] rounded-2xl p-6 mb-6 text-white">
          <h2 className="font-black text-lg mb-1">How You Earn</h2>
          <p className="text-red-100 text-sm mb-4">Every order placed with your link or code earns you commission.</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-black">10%</p>
              <p className="text-xs text-red-100 mt-1">Commission per sale</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-black">{affiliate?.discount_percent}%</p>
              <p className="text-xs text-red-100 mt-1">Customer discount</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-black">1.5%</p>
              <p className="text-xs text-red-100 mt-1">Reward points rate</p>
            </div>
          </div>
        </motion.div>

        {/* Transactions Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">Order History</h2>
            <p className="text-xs text-slate-400 mt-0.5">{transactions.length} total referral{transactions.length !== 1 ? 's' : ''}</p>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-bold">No orders yet</p>
              <p className="text-sm text-slate-400 mt-1">Share your link to start earning commissions!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-wider px-6 py-3">Order</th>
                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-wider px-4 py-3">Date</th>
                    <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-wider px-4 py-3">Order Total</th>
                    <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-wider px-4 py-3">Commission</th>
                    <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-wider px-6 py-3">Points</th>
                    <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{tx.order_number || '—'}</td>
                      <td className="px-4 py-4 text-sm text-slate-500">
                        {tx.created_date ? new Date(tx.created_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-700 text-right">${(tx.order_total || 0).toFixed(2)}</td>
                      <td className="px-4 py-4 text-sm font-black text-[#8B2635] text-right">${(tx.commission_amount || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-amber-600 text-right">{(tx.points_earned || 0).toFixed(1)}</td>
                      <td className="px-4 py-4 text-center">
                        <Badge className={tx.status === 'cancelled'
                          ? 'bg-red-50 text-red-500 border-red-100'
                          : 'bg-green-50 text-green-600 border-green-100'}>
                          {tx.status === 'cancelled' ? 'Cancelled' : 'Active'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Contact Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-slate-400">
          Questions about your commissions? <Link to={createPageUrl('Contact')} className="text-[#8B2635] font-bold hover:underline">Contact us</Link>
        </motion.div>
      </div>
    </div>
  );
}