import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { getAffiliateByEmail, getTransactionsForAffiliate } from '@/components/utils/affiliateStore';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Check, TrendingUp, DollarSign, ShoppingBag, Star,
  ExternalLink, AlertCircle, ChevronRight, Gift, BarChart2,
  Link2, Home, LayoutGrid, MousePointerClick, Calendar, Award
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const SITE_BASE = window.location.origin;

const PRODUCT_PAGES = [
  { label: 'Home Page', page: 'Home', path: '' },
  { label: 'All Products', page: 'Products', path: '' },
  { label: 'BPC-157', page: 'ProductBPC157', path: '' },
  { label: 'Semaglutide', page: 'ProductSemaglutide', path: '' },
  { label: 'TB-500', page: 'ProductTB500', path: '' },
  { label: 'Tirzepatide', page: 'ProductTirzepatide', path: '' },
  { label: 'Learn More', page: 'LearnMore', path: '' },
  { label: 'Peptide Calculator', page: 'PeptideCalculator', path: '' },
];

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'links', label: 'My Links', icon: Link2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'history', label: 'Order History', icon: ShoppingBag },
];

export default function AffiliateDashboard() {
  const [user, setUser] = useState(null);
  const [affiliate, setAffiliate] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [clicks, setClicks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPage, setSelectedPage] = useState('Home');

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const aff = await getAffiliateByEmail(base44, me.email);
        if (!aff) { setNotFound(true); setLoading(false); return; }
        setAffiliate(aff);
        const [txs, clickData, paymentData] = await Promise.all([
          getTransactionsForAffiliate(base44, aff.code),
          base44.entities.AffiliateClickLog.filter({ affiliate_code: aff.code }),
          base44.entities.AffiliatePayment.filter({ affiliate_code: aff.code }),
        ]);
        setTransactions(txs || []);
        setClicks(clickData || []);
        setPayments(paymentData || []);
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

  const buildLink = (page) => {
    const url = createPageUrl(page);
    return `${SITE_BASE}${url}?affiliate=${affiliate?.code}`;
  };

  const defaultLink = affiliate ? buildLink('Home') : '';

  // Stats
  const unpaidCommission = useMemo(() =>
    transactions.filter(t => t.status !== 'cancelled').reduce((s, t) => {
      const paid = payments.reduce((ps, p) =>
        (p.order_numbers || []).includes(t.order_number) ? ps + (t.commission_amount || 0) : ps, 0);
      return s + Math.max(0, (t.commission_amount || 0) - paid);
    }, 0), [transactions, payments]);

  const paidCommission = useMemo(() =>
    payments.reduce((s, p) => s + (p.amount || 0), 0), [payments]);

  const stats = [
    { label: 'Total Revenue', value: `$${(affiliate?.total_revenue || 0).toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Commission Earned', value: `$${(affiliate?.total_commission || 0).toFixed(2)}`, icon: DollarSign, color: 'text-[#8B2635]', bg: 'bg-red-50' },
    { label: 'Total Orders', value: affiliate?.total_orders || 0, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Link Clicks', value: clicks.length, icon: MousePointerClick, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  // Analytics data
  const dailySalesData = useMemo(() => {
    const byDate = {};
    transactions.forEach(tx => {
      if (!tx.created_date) return;
      const d = new Date(tx.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      byDate[d] = byDate[d] || { date: d, sales: 0, commission: 0, orders: 0 };
      byDate[d].sales += tx.order_total || 0;
      byDate[d].commission += tx.commission_amount || 0;
      byDate[d].orders += 1;
    });
    return Object.values(byDate).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-30);
  }, [transactions]);

  const dailyClickData = useMemo(() => {
    const byDate = {};
    clicks.forEach(c => {
      if (!c.created_date) return;
      const d = new Date(c.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      byDate[d] = (byDate[d] || 0) + 1;
    });
    return Object.entries(byDate)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-30)
      .map(([date, clicks]) => ({ date, clicks }));
  }, [clicks]);

  const topProducts = useMemo(() => {
    const byProduct = {};
    transactions.forEach(tx => {
      (tx.items || []).forEach(item => {
        const n = item.productName || 'Unknown';
        byProduct[n] = byProduct[n] || { name: n, revenue: 0, orders: 0 };
        byProduct[n].revenue += item.price * item.quantity || 0;
        byProduct[n].orders += 1;
      });
    });
    return Object.values(byProduct).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [transactions]);

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-[#8B2635]" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">No Affiliate Account Found</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your email <span className="font-bold text-slate-700">{user?.email}</span> is not linked to an affiliate account.
          </p>
          <Link to={createPageUrl('Contact')}
            className="inline-flex items-center gap-2 bg-[#8B2635] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#6B1827] transition-colors">
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
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <img src="https://i.imgur.com/8MOtTE2.png" alt="Red Helix Research" className="h-8 w-auto object-contain" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Affiliate Portal</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black text-slate-900">
                Welcome back, <span className="text-[#8B2635]">{affiliate?.affiliate_name?.split(' ')[0]}</span>
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge className={affiliate?.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500'}>
                  {affiliate?.is_active ? '● Active' : '○ Inactive'}
                </Badge>
                <span className="text-xs text-slate-400">Code: <span className="font-black text-slate-700">{affiliate?.code}</span></span>
                <span className="text-xs text-slate-400">Gives <span className="font-black text-[#8B2635]">{affiliate?.discount_percent}% off</span></span>
              </div>
            </div>
            {/* Payout summary */}
            <div className="flex gap-3">
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-center">
                <p className="text-[10px] font-black text-[#8B2635] uppercase tracking-wider">Unpaid</p>
                <p className="text-lg font-black text-[#8B2635]">${unpaidCommission.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2 text-center">
                <p className="text-[10px] font-black text-green-700 uppercase tracking-wider">Paid Out</p>
                <p className="text-lg font-black text-green-700">${paidCommission.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#8B2635] text-white shadow-lg shadow-[#8B2635]/20'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-[#8B2635]/40'
              }`}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

              {/* Quick link */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#8B2635]" /> Your Default Referral Link
                </h2>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <span className="text-sm text-slate-600 flex-1 truncate">{defaultLink}</span>
                  <button onClick={() => copy(defaultLink, 'default')} className="flex-shrink-0 p-1.5 hover:bg-slate-200 rounded-lg">
                    {copied === 'default' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">Customers who visit via this link get {affiliate?.discount_percent}% off at checkout automatically.</p>
              </div>

              {/* How you earn */}
              <div className="bg-gradient-to-br from-[#8B2635] to-[#6B1827] rounded-2xl p-6 text-white">
                <h2 className="font-black text-lg mb-1">How You Earn</h2>
                <p className="text-red-100 text-sm mb-4">Every order placed with your link or code earns you commission.</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: '10%', label: 'Commission per sale' },
                    { value: `${affiliate?.discount_percent}%`, label: 'Customer discount' },
                    { value: '1.5%', label: 'Reward points rate' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/10 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black">{item.value}</p>
                      <p className="text-xs text-red-100 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment history */}
              {payments.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-black text-slate-900">Payment History</h2>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {payments.map(p => (
                      <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-800">${(p.amount || 0).toFixed(2)} paid</p>
                          <p className="text-xs text-slate-400">{p.created_date ? new Date(p.created_date).toLocaleDateString() : ''} · {(p.order_numbers || []).length} order{(p.order_numbers || []).length !== 1 ? 's' : ''}</p>
                          {p.notes && <p className="text-xs text-slate-400 italic">{p.notes}</p>}
                        </div>
                        <Badge className="bg-green-50 text-green-700 border-green-100">Paid</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-slate-400">
                Questions about your commissions? <Link to={createPageUrl('Contact')} className="text-[#8B2635] font-bold hover:underline">Contact us</Link>
              </div>
            </motion.div>
          )}

          {/* ── LINKS TAB ── */}
          {activeTab === 'links' && (
            <motion.div key="links" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Promo Code */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-base font-black text-slate-900 mb-4">Your Promo Code</h2>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
                  <span className="text-2xl font-black tracking-widest text-slate-800 flex-1">{affiliate?.code}</span>
                  <button onClick={() => copy(affiliate?.code, 'code')} className="flex-shrink-0 p-2 hover:bg-slate-200 rounded-lg">
                    {copied === 'code' ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-slate-400" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">Customers enter this code at checkout — no link needed.</p>
              </div>

              {/* Custom Landing Page URL Generator */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-[#8B2635]" /> Custom Landing Page Links
                </h2>
                <p className="text-xs text-slate-500 mb-5">Generate a referral link pointing directly to any product page or section of the site.</p>

                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  {PRODUCT_PAGES.map(pg => {
                    const link = buildLink(pg.page);
                    const key = `pg_${pg.page}`;
                    return (
                      <div key={pg.page}
                        className={`border rounded-xl p-4 cursor-pointer transition-all ${
                          selectedPage === pg.page
                            ? 'border-[#8B2635] bg-red-50'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                        }`}
                        onClick={() => setSelectedPage(pg.page)}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-black text-slate-800">{pg.label}</span>
                          {selectedPage === pg.page && <Check className="w-4 h-4 text-[#8B2635]" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 flex-1 truncate font-mono">{link}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); copy(link, key); }}
                            className="flex-shrink-0 p-1 hover:bg-white rounded-md">
                            {copied === key ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Preview of selected */}
                <div className="bg-slate-900 rounded-xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selected Link Preview</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-green-400 font-mono flex-1 break-all">{buildLink(selectedPage)}</span>
                    <button onClick={() => copy(buildLink(selectedPage), 'selected')}
                      className="flex-shrink-0 px-3 py-1.5 bg-[#8B2635] hover:bg-[#6B1827] text-white text-xs font-black rounded-lg flex items-center gap-1.5">
                      {copied === 'selected' ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Social Share */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-base font-black text-slate-900 mb-4">Share Your Link</h2>
                <div className="flex flex-wrap gap-2">
                  <a href={`https://twitter.com/intent/tweet?text=Check+out+Red+Helix+Research+peptides!+Use+my+code+${affiliate?.code}+for+${affiliate?.discount_percent}%25+off:+${encodeURIComponent(buildLink(selectedPage))}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors">
                    Share on X <ExternalLink className="w-3 h-3" />
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildLink(selectedPage))}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold text-blue-700 transition-colors">
                    Share on Facebook <ExternalLink className="w-3 h-3" />
                  </a>
                  <a href={`https://www.instagram.com/`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-50 hover:bg-pink-100 rounded-lg text-xs font-bold text-pink-700 transition-colors">
                    Instagram (copy link above) <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

              {/* Summary bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Clicks', value: clicks.length, color: 'text-purple-600' },
                  { label: 'Conversion Rate', value: clicks.length > 0 ? `${((transactions.length / clicks.length) * 100).toFixed(1)}%` : '—', color: 'text-emerald-600' },
                  { label: 'Avg Order Value', value: transactions.length > 0 ? `$${(transactions.reduce((s, t) => s + (t.order_total || 0), 0) / transactions.length).toFixed(2)}` : '—', color: 'text-blue-600' },
                  { label: 'Total Commission', value: `$${(affiliate?.total_commission || 0).toFixed(2)}`, color: 'text-[#8B2635]' },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{s.label}</p>
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Daily Sales Chart */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#8B2635]" /> Daily Sales Volume (Last 30 Days)
                </h2>
                {dailySalesData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No sales data yet</div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailySalesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" style={{ fontSize: '10px', fontWeight: 'bold' }} stroke="#94a3b8" />
                        <YAxis style={{ fontSize: '10px', fontWeight: 'bold' }} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #e2e8f0' }} />
                        <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                        <Line type="monotone" dataKey="sales" stroke="#8B2635" strokeWidth={2.5} name="Sales ($)" dot={{ r: 3, fill: '#8B2635' }} />
                        <Line type="monotone" dataKey="commission" stroke="#10b981" strokeWidth={2.5} name="Commission ($)" dot={{ r: 3, fill: '#10b981' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Click-Through Rate Chart */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-purple-600" /> Link Clicks (Last 30 Days)
                </h2>
                {dailyClickData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                    No click data yet — clicks are recorded when someone visits via your link
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyClickData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" style={{ fontSize: '10px', fontWeight: 'bold' }} stroke="#94a3b8" />
                        <YAxis style={{ fontSize: '10px', fontWeight: 'bold' }} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #e2e8f0' }} />
                        <Bar dataKey="clicks" fill="#8b5cf6" name="Clicks" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" /> Top Performing Products
                </h2>
                {topProducts.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
                    Product breakdown will appear as orders come in
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" style={{ fontSize: '10px', fontWeight: 'bold' }} stroke="#94a3b8" />
                        <YAxis dataKey="name" type="category" style={{ fontSize: '10px', fontWeight: 'bold' }} stroke="#94a3b8" width={100} />
                        <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #e2e8f0' }} formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']} />
                        <Bar dataKey="revenue" fill="#f59e0b" name="Revenue ($)" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900">Order History</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{transactions.length} total referral{transactions.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Unpaid Commission</p>
                    <p className="text-lg font-black text-[#8B2635]">${unpaidCommission.toFixed(2)}</p>
                  </div>
                </div>

                {transactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-bold">No orders yet</p>
                    <p className="text-sm text-slate-400 mt-1">Share your link to start earning!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50">
                          {['Order', 'Date', 'Order Total', 'Commission', 'Points', 'Status'].map(h => (
                            <th key={h} className={`text-[10px] font-black text-slate-400 uppercase tracking-wider px-4 py-3 ${h === 'Order' ? 'text-left pl-6' : 'text-right'} ${h === 'Status' ? 'text-center' : ''}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {transactions.map((tx) => {
                          const isPaid = payments.some(p => (p.order_numbers || []).includes(tx.order_number));
                          return (
                            <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                              <td className="pl-6 px-4 py-4 text-sm font-bold text-slate-800">{tx.order_number || '—'}</td>
                              <td className="px-4 py-4 text-sm text-slate-500 text-right">
                                {tx.created_date ? new Date(tx.created_date).toLocaleDateString() : '—'}
                              </td>
                              <td className="px-4 py-4 text-sm font-bold text-slate-700 text-right">${(tx.order_total || 0).toFixed(2)}</td>
                              <td className="px-4 py-4 text-sm font-black text-[#8B2635] text-right">${(tx.commission_amount || 0).toFixed(2)}</td>
                              <td className="px-4 py-4 text-sm font-bold text-amber-600 text-right">{(tx.points_earned || 0).toFixed(1)}</td>
                              <td className="px-4 py-4 text-center">
                                <Badge className={
                                  tx.status === 'cancelled' ? 'bg-red-50 text-red-500 border-red-100' :
                                  isPaid ? 'bg-green-50 text-green-600 border-green-100' :
                                  'bg-amber-50 text-amber-600 border-amber-100'
                                }>
                                  {tx.status === 'cancelled' ? 'Cancelled' : isPaid ? 'Paid' : 'Pending'}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}