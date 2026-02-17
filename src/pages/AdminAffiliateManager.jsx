import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Copy,
  Check,
  Search,
  DollarSign,
  TrendingUp,
  Award,
  Gift,
  Star,
  Mail,
  Hash,
  Percent,
  ShieldCheck,
  BarChart3,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Coins,
  ArrowUpRight,
  CreditCard,
  FileText,
  UserPlus,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { clearAffiliateCache } from '@/components/utils/cart';
import {
  listAffiliates,
  createAffiliate,
  updateAffiliate,
  deleteAffiliate as deleteAffiliateStore,
  listTransactions,
  createTransaction,
  updateTransaction,
  subscribeAffiliates,
  subscribeTransactions,
  resetBase44Check,
} from '@/components/utils/affiliateStore';

// ─── POINTS VALUE CONFIG ───
const POINTS_REWARD_RATE = 0.015; // 1.5% of order total
const COMMISSION_RATE = 0.10;     // 10% of order total
const POINTS_TO_DOLLAR = 1;      // 1 point = $1

// ─── AFFILIATE EDITOR ───
function AffiliateEditor({ affiliate, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState({
    affiliate_name: affiliate?.affiliate_name || '',
    affiliate_email: affiliate?.affiliate_email || '',
    code: affiliate?.code || '',
    discount_percent: affiliate?.discount_percent || 15,
    is_active: affiliate?.is_active !== false,
    notes: affiliate?.notes || '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const generateCode = () => {
    const name = form.affiliate_name.split(' ')[0]?.toUpperCase() || 'AFF';
    const num = Math.floor(Math.random() * 99) + 1;
    handleChange('code', `${name}${num}`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
          {affiliate ? 'Edit Affiliate' : 'Add New Affiliate'}
        </h3>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
          <input
            type="text"
            value={form.affiliate_name}
            onChange={(e) => handleChange('affiliate_name', e.target.value)}
            placeholder="John Smith"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#dc2626] transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email (linked to account)</label>
          <input
            type="email"
            value={form.affiliate_email}
            onChange={(e) => handleChange('affiliate_email', e.target.value)}
            placeholder="affiliate@email.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#dc2626] transition-all"
          />
        </div>

        {/* Code */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Affiliate Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="CODE15"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#dc2626] transition-all uppercase"
            />
            <Button
              onClick={generateCode}
              variant="outline"
              className="border-slate-200 text-slate-600 hover:border-[#dc2626] hover:text-[#dc2626] rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Generate
            </Button>
          </div>
        </div>

        {/* Discount */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Discount % for customers</label>
          <div className="relative">
            <input
              type="number"
              value={form.discount_percent}
              onChange={(e) => handleChange('discount_percent', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#dc2626] transition-all pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</span>
          </div>
        </div>

        {/* Active Toggle */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
          <button
            onClick={() => handleChange('is_active', !form.is_active)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
              form.is_active
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <span className="text-sm font-black uppercase tracking-wider">
              {form.is_active ? 'Active' : 'Inactive'}
            </span>
            {form.is_active ? <CheckCircle2 className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>

        {/* Notes */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Admin Notes</label>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Optional notes..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#dc2626] transition-all"
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-xs text-blue-700 font-bold">
          <span className="font-black">How it works:</span> When a customer uses code <span className="font-black">{form.code || 'CODE'}</span>,
          they get <span className="font-black">{form.discount_percent}% off</span>.
          The affiliate earns <span className="font-black">1.5% in reward points</span> and you owe <span className="font-black">10% commission</span> on the order total.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button
          onClick={() => onSave(form)}
          disabled={!form.affiliate_name || !form.affiliate_email || !form.code || isSaving}
          className="flex-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-widest text-xs py-6 shadow-lg shadow-[#dc2626]/20 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {affiliate ? 'Update Affiliate' : 'Create Affiliate'}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="border-slate-200 text-slate-600 rounded-xl font-black uppercase tracking-widest text-xs py-6"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── AFFILIATE ROW ───
function AffiliateRow({ affiliate, onEdit, onDelete, onToggle, expanded, onExpand }) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(affiliate.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAffiliateLink = () => {
    const baseUrl = window.location.origin;
    navigator.clipboard.writeText(`${baseUrl}/?affiliate=${affiliate.code}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden hover:shadow-lg transition-all">
      <div className="p-5 flex items-center gap-4">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg ${
          affiliate.is_active ? 'bg-[#dc2626] shadow-[#dc2626]/20' : 'bg-slate-400 shadow-slate-400/20'
        }`}>
          {affiliate.affiliate_name?.charAt(0)?.toUpperCase() || 'A'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{affiliate.affiliate_name}</h4>
            {affiliate.is_active ? (
              <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[8px] font-black uppercase tracking-widest rounded-full">Active</span>
            ) : (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-full">Inactive</span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium truncate">{affiliate.affiliate_email}</p>
        </div>

        {/* Code Badge */}
        <button
          onClick={copyCode}
          className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:border-[#dc2626] hover:bg-red-50 transition-all group"
        >
          <Hash className="w-3 h-3 text-slate-400 group-hover:text-[#dc2626]" />
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{affiliate.code}</span>
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-slate-300" />}
        </button>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Points</p>
            <p className="text-sm font-black text-[#dc2626]">{(affiliate.total_points || 0).toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Commission</p>
            <p className="text-sm font-black text-slate-900">${(affiliate.total_commission || 0).toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Orders</p>
            <p className="text-sm font-black text-slate-900">{affiliate.total_orders || 0}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button onClick={() => onToggle(affiliate)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors" title={affiliate.is_active ? 'Deactivate' : 'Activate'}>
            {affiliate.is_active ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
          </button>
          <button onClick={() => onEdit(affiliate)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors" title="Edit">
            <Edit3 className="w-4 h-4 text-slate-400 hover:text-blue-500" />
          </button>
          <button onClick={() => onDelete(affiliate)} className="p-2 hover:bg-red-50 rounded-xl transition-colors" title="Delete">
            <Trash2 className="w-4 h-4 text-slate-300 hover:text-[#dc2626]" />
          </button>
          <button onClick={() => onExpand(expanded ? null : affiliate.id)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Mobile Stats */}
      <div className="md:hidden px-5 pb-3 flex gap-4">
        <div className="flex items-center gap-1">
          <Coins className="w-3 h-3 text-[#dc2626]" />
          <span className="text-[10px] font-black text-slate-600">{(affiliate.total_points || 0).toFixed(2)} pts</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-green-500" />
          <span className="text-[10px] font-black text-slate-600">${(affiliate.total_commission || 0).toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1">
          <BarChart3 className="w-3 h-3 text-blue-500" />
          <span className="text-[10px] font-black text-slate-600">{affiliate.total_orders || 0} orders</span>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Discount Given</p>
                  <p className="text-lg font-black text-slate-900">{affiliate.discount_percent}%</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                  <p className="text-lg font-black text-slate-900">${(affiliate.total_revenue || 0).toFixed(2)}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-[8px] font-black text-[#dc2626] uppercase tracking-widest mb-1">Points Balance</p>
                  <p className="text-lg font-black text-[#dc2626]">{(affiliate.total_points || 0).toFixed(2)}</p>
                  <p className="text-[8px] text-slate-400 font-bold">= ${((affiliate.total_points || 0) * POINTS_TO_DOLLAR).toFixed(2)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-[8px] font-black text-green-600 uppercase tracking-widest mb-1">Commission Owed</p>
                  <p className="text-lg font-black text-green-600">${(affiliate.total_commission || 0).toFixed(2)}</p>
                </div>
              </div>
              {/* Shareable Affiliate Link */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-2">Shareable Link</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[10px] text-blue-800 font-bold bg-blue-100/50 rounded-lg px-3 py-2 truncate">
                    {window.location.origin}/?affiliate={affiliate.code}
                  </code>
                  <button
                    onClick={copyAffiliateLink}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors flex items-center gap-1"
                  >
                    {linkCopied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Link</>}
                  </button>
                </div>
              </div>
              {affiliate.notes && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                  <p className="text-[8px] font-black text-yellow-600 uppercase tracking-widest mb-1">Admin Notes</p>
                  <p className="text-xs text-yellow-800 font-medium">{affiliate.notes}</p>
                </div>
              )}
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                Created: {affiliate.created_date ? new Date(affiliate.created_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TRANSACTION ROW ───
function TransactionRow({ tx, onUpdateStatus }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{tx.affiliate_name}</span>
          <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[8px] font-black uppercase rounded-full">{tx.affiliate_code}</span>
        </div>
        <p className="text-[10px] text-slate-400 font-medium">
          Order #{tx.order_number} &middot; Customer: {tx.customer_email}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Order</p>
          <p className="text-xs font-black text-slate-900">${(tx.order_total || 0).toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] font-black text-[#dc2626] uppercase tracking-widest">Points</p>
          <p className="text-xs font-black text-[#dc2626]">+{(tx.points_earned || 0).toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] font-black text-green-600 uppercase tracking-widest">Commission</p>
          <p className="text-xs font-black text-green-600">${(tx.commission_amount || 0).toFixed(2)}</p>
        </div>

        <select
          value={tx.status || 'pending'}
          onChange={(e) => onUpdateStatus(tx.id, e.target.value)}
          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border cursor-pointer ${
            tx.status === 'paid' ? 'bg-green-50 text-green-600 border-green-200' :
            tx.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
            'bg-slate-50 text-slate-500 border-slate-200'
          }`}
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <p className="text-[8px] text-slate-400 font-bold">
        {tx.created_date ? new Date(tx.created_date).toLocaleDateString() : ''}
      </p>
    </div>
  );
}

// ─── COMMISSION REPORT MODAL ───
function CommissionReportModal({ affiliates, transactions, onClose }) {
  const [dateRange, setDateRange] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filteredTx = useMemo(() => {
    if (!transactions) return [];
    const now = new Date();

    return transactions.filter(tx => {
      if (dateRange === 'all') return true;
      const txDate = new Date(tx.created_date);
      if (dateRange === 'ytd') return txDate.getFullYear() === now.getFullYear();
      if (dateRange === 'last30') return (now - txDate) / 86400000 <= 30;
      if (dateRange === 'last90') return (now - txDate) / 86400000 <= 90;
      if (dateRange === 'custom') {
        const start = customStart ? new Date(customStart) : new Date(0);
        const end = customEnd ? new Date(customEnd + 'T23:59:59') : now;
        return txDate >= start && txDate <= end;
      }
      return true;
    });
  }, [transactions, dateRange, customStart, customEnd]);

  const summary = useMemo(() => {
    const byAffiliate = {};
    filteredTx.forEach(tx => {
      const key = tx.affiliate_email;
      if (!byAffiliate[key]) {
        byAffiliate[key] = {
          name: tx.affiliate_name,
          email: tx.affiliate_email,
          code: tx.affiliate_code,
          totalOrders: 0,
          totalRevenue: 0,
          totalCommission: 0,
          totalPoints: 0,
          pendingCommission: 0,
          paidCommission: 0,
        };
      }
      byAffiliate[key].totalOrders += 1;
      byAffiliate[key].totalRevenue += tx.order_total || 0;
      byAffiliate[key].totalCommission += tx.commission_amount || 0;
      byAffiliate[key].totalPoints += tx.points_earned || 0;
      if (tx.status === 'pending') byAffiliate[key].pendingCommission += tx.commission_amount || 0;
      if (tx.status === 'paid') byAffiliate[key].paidCommission += tx.commission_amount || 0;
    });
    return Object.values(byAffiliate);
  }, [filteredTx]);

  const totals = useMemo(() => ({
    orders: filteredTx.length,
    revenue: filteredTx.reduce((s, t) => s + (t.order_total || 0), 0),
    commission: filteredTx.reduce((s, t) => s + (t.commission_amount || 0), 0),
    points: filteredTx.reduce((s, t) => s + (t.points_earned || 0), 0),
    pending: filteredTx.filter(t => t.status === 'pending').reduce((s, t) => s + (t.commission_amount || 0), 0),
    paid: filteredTx.filter(t => t.status === 'paid').reduce((s, t) => s + (t.commission_amount || 0), 0),
  }), [filteredTx]);

  const exportCSV = () => {
    const headers = ['Affiliate Name', 'Email', 'Code', 'Total Orders', 'Total Revenue', 'Total Commission', 'Pending Commission', 'Paid Commission', 'Points Earned'];
    const rows = summary.map(s => [
      s.name, s.email, s.code, s.totalOrders, s.totalRevenue.toFixed(2), s.totalCommission.toFixed(2), s.pendingCommission.toFixed(2), s.paidCommission.toFixed(2), s.totalPoints.toFixed(2)
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `affiliate-commission-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Commission Report</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Overview of all affiliate commissions owed</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={exportCSV} variant="outline" className="border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider">
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Date Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { value: 'all', label: 'All Time' },
              { value: 'last30', label: 'Last 30 Days' },
              { value: 'last90', label: 'Last 90 Days' },
              { value: 'ytd', label: 'Year to Date' },
              { value: 'custom', label: 'Custom' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  dateRange === opt.value
                    ? 'bg-[#dc2626] text-white shadow-lg shadow-[#dc2626]/20'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="flex gap-3 mb-6">
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold" />
              <span className="text-slate-400 font-bold self-center">to</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold" />
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 border border-slate-100 rounded-[20px] p-4">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Orders</p>
              <p className="text-2xl font-black text-slate-900">{totals.orders}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-[20px] p-4">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Revenue via Affiliates</p>
              <p className="text-2xl font-black text-slate-900">${totals.revenue.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-[20px] p-4">
              <p className="text-[8px] font-black text-[#dc2626] uppercase tracking-widest mb-1">Total Commission Owed</p>
              <p className="text-2xl font-black text-[#dc2626]">${totals.pending.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-[20px] p-4">
              <p className="text-[8px] font-black text-green-600 uppercase tracking-widest mb-1">Commission Paid</p>
              <p className="text-2xl font-black text-green-600">${totals.paid.toFixed(2)}</p>
            </div>
          </div>

          {/* Per-Affiliate Breakdown */}
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">By Affiliate</h3>
          <div className="space-y-3">
            {summary.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">No transactions in this period</p>
              </div>
            ) : (
              summary.map((s, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{s.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{s.email} &middot; Code: {s.code}</p>
                  </div>
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Orders</p>
                      <p className="text-sm font-black text-slate-900">{s.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Revenue</p>
                      <p className="text-sm font-black text-slate-900">${s.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-[#dc2626] uppercase">Pending</p>
                      <p className="text-sm font-black text-[#dc2626]">${s.pendingCommission.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-green-600 uppercase">Paid</p>
                      <p className="text-sm font-black text-green-600">${s.paidCommission.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-blue-500 uppercase">Points</p>
                      <p className="text-sm font-black text-blue-500">{s.totalPoints.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── POINTS ADJUSTMENT MODAL ───
function PointsAdjustModal({ affiliate, onSave, onClose }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState('add');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">Adjust Points</h3>
        <p className="text-xs text-slate-400 font-medium mb-4">
          {affiliate.affiliate_name} &middot; Current Balance: <span className="font-black text-[#dc2626]">{(affiliate.total_points || 0).toFixed(2)} pts</span>
        </p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('add')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              mode === 'add' ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-500'
            }`}
          >
            + Add Points
          </button>
          <button
            onClick={() => setMode('subtract')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              mode === 'subtract' ? 'bg-[#dc2626] text-white' : 'bg-slate-50 text-slate-500'
            }`}
          >
            - Subtract Points
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#dc2626]"
            />
            {amount && <p className="text-[10px] text-slate-400 font-bold mt-1">= ${(parseFloat(amount) * POINTS_TO_DOLLAR).toFixed(2)} value</p>}
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Manual adjustment, redemption, bonus..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#dc2626]"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => {
              const val = parseFloat(amount) || 0;
              onSave(affiliate, mode === 'add' ? val : -val, reason);
            }}
            disabled={!amount || parseFloat(amount) <= 0}
            className="flex-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-widest text-xs py-6 disabled:opacity-50"
          >
            Confirm Adjustment
          </Button>
          <Button onClick={onClose} variant="outline" className="border-slate-200 rounded-xl font-black uppercase tracking-widest text-xs py-6">
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── MAIN PAGE ───
export default function AdminAffiliateManager() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data
  const [affiliates, setAffiliates] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // UI State
  const [editingAffiliate, setEditingAffiliate] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('affiliates'); // affiliates | transactions
  const [showCommissionReport, setShowCommissionReport] = useState(false);
  const [pointsAdjustAffiliate, setPointsAdjustAffiliate] = useState(null);
  const [txStatusFilter, setTxStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          navigate(createPageUrl('Home'));
          return;
        }
        const currentUser = await base44.auth.me();
        if (currentUser?.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);
      } catch {
        navigate(createPageUrl('Home'));
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // Load data (uses affiliateStore which auto-falls back to localStorage)
  const loadData = useCallback(async () => {
    try {
      const [affData, txData] = await Promise.all([
        listAffiliates(base44),
        listTransactions(base44),
      ]);
      setAffiliates(affData || []);
      setTransactions(txData || []);
    } catch (error) {
      console.error('Failed to load affiliate data:', error);
      setAffiliates([]);
      setTransactions([]);
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // Real-time subscriptions (only works with Base44 entities, no-op for localStorage)
  useEffect(() => {
    if (!user) return;
    const unsubs = [];
    unsubs.push(subscribeAffiliates(base44, (data) => setAffiliates(data || [])));
    unsubs.push(subscribeTransactions(base44, (data) => setTransactions(data || [])));
    return () => unsubs.forEach(u => { try { u(); } catch {} });
  }, [user]);

  // Save affiliate
  const handleSaveAffiliate = async (form) => {
    setIsSaving(true);
    try {
      // Validate required fields
      if (!form.affiliate_name?.trim()) {
        alert('Please enter the affiliate name.');
        return;
      }
      if (!form.affiliate_email?.trim()) {
        alert('Please enter the affiliate email.');
        return;
      }
      if (!form.code?.trim()) {
        alert('Please enter or generate an affiliate code.');
        return;
      }

      // Check for duplicate codes when creating new
      if (!editingAffiliate) {
        const existingCode = affiliates.find(
          a => a.code?.toUpperCase() === form.code.toUpperCase()
        );
        if (existingCode) {
          alert(`The code "${form.code}" is already in use by ${existingCode.affiliate_name}. Please choose a different code.`);
          return;
        }
      }

      if (editingAffiliate) {
        await updateAffiliate(base44, editingAffiliate.id, form);
      } else {
        await createAffiliate(base44, {
          ...form,
          total_points: 0,
          total_commission: 0,
          total_orders: 0,
          total_revenue: 0,
        });
      }
      resetBase44Check();
      clearAffiliateCache();
      setEditingAffiliate(null);
      setIsCreating(false);
      await loadData();
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to save affiliate: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active
  const handleToggle = async (affiliate) => {
    try {
      await updateAffiliate(base44, affiliate.id, {
        is_active: !affiliate.is_active,
      });
      resetBase44Check();
      clearAffiliateCache();
      await loadData();
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  // Delete affiliate
  const handleDelete = async (affiliate) => {
    if (deleteConfirm !== affiliate.id) {
      setDeleteConfirm(affiliate.id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    try {
      await deleteAffiliateStore(base44, affiliate.id);
      resetBase44Check();
      clearAffiliateCache();
      setDeleteConfirm(null);
      await loadData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Update transaction status
  const handleUpdateTxStatus = async (txId, status) => {
    try {
      await updateTransaction(base44, txId, { status });
      await loadData();
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  // Points adjustment
  const handlePointsAdjust = async (affiliate, amount, reason) => {
    try {
      const newPoints = Math.max(0, (affiliate.total_points || 0) + amount);
      await updateAffiliate(base44, affiliate.id, {
        total_points: newPoints,
      });

      // Record the adjustment as a transaction
      await createTransaction(base44, {
        affiliate_email: affiliate.affiliate_email,
        affiliate_name: affiliate.affiliate_name,
        affiliate_code: affiliate.code,
        order_number: `ADJ-${Date.now().toString(36).toUpperCase()}`,
        order_total: 0,
        commission_amount: 0,
        points_earned: amount,
        customer_email: 'admin@redhelixresearch.com',
        status: amount > 0 ? 'paid' : 'paid',
      });

      setPointsAdjustAffiliate(null);
      await loadData();
    } catch (error) {
      console.error('Points adjustment error:', error);
    }
  };

  // Filtered affiliates
  const filteredAffiliates = useMemo(() => {
    if (!searchQuery) return affiliates;
    const q = searchQuery.toLowerCase();
    return affiliates.filter(a =>
      a.affiliate_name?.toLowerCase().includes(q) ||
      a.affiliate_email?.toLowerCase().includes(q) ||
      a.code?.toLowerCase().includes(q)
    );
  }, [affiliates, searchQuery]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let txs = transactions;
    if (txStatusFilter !== 'all') {
      txs = txs.filter(t => t.status === txStatusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      txs = txs.filter(t =>
        t.affiliate_name?.toLowerCase().includes(q) ||
        t.affiliate_email?.toLowerCase().includes(q) ||
        t.affiliate_code?.toLowerCase().includes(q) ||
        t.order_number?.toLowerCase().includes(q)
      );
    }
    return txs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [transactions, txStatusFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    totalAffiliates: affiliates.length,
    activeAffiliates: affiliates.filter(a => a.is_active).length,
    totalCommissionOwed: transactions.filter(t => t.status === 'pending').reduce((s, t) => s + (t.commission_amount || 0), 0),
    totalPointsIssued: affiliates.reduce((s, a) => s + (a.total_points || 0), 0),
    totalRevenue: affiliates.reduce((s, a) => s + (a.total_revenue || 0), 0),
    totalOrders: transactions.length,
  }), [affiliates, transactions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#dc2626] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#dc2626] mb-4 transition-colors text-xs font-black uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                Affiliate <span className="text-[#dc2626]">Program</span>
              </h1>
              <p className="text-slate-400 font-medium mt-2">Manage affiliates, track commissions, and reward points</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCommissionReport(true)}
                variant="outline"
                className="border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider hover:border-[#dc2626] hover:text-[#dc2626]"
              >
                <BarChart3 className="w-4 h-4 mr-2" /> Commission Report
              </Button>
              <Button
                onClick={() => { setIsCreating(true); setEditingAffiliate(null); }}
                className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#dc2626]/20"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Add Affiliate
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#dc2626]" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.totalAffiliates}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-green-500" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active</span>
            </div>
            <p className="text-2xl font-black text-green-600">{stats.activeAffiliates}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-[#dc2626]" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Owed</span>
            </div>
            <p className="text-2xl font-black text-[#dc2626]">${stats.totalCommissionOwed.toFixed(2)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Points</span>
            </div>
            <p className="text-2xl font-black text-amber-600">{stats.totalPointsIssued.toFixed(2)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Revenue</span>
            </div>
            <p className="text-2xl font-black text-slate-900">${stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Orders</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.totalOrders}</p>
          </div>
        </div>

        {/* Editor */}
        <AnimatePresence>
          {(isCreating || editingAffiliate) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <AffiliateEditor
                key={editingAffiliate?.id || 'new'}
                affiliate={editingAffiliate}
                onSave={handleSaveAffiliate}
                onCancel={() => { setIsCreating(false); setEditingAffiliate(null); }}
                isSaving={isSaving}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('affiliates')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'affiliates'
                  ? 'bg-[#dc2626] text-white shadow-lg shadow-[#dc2626]/20'
                  : 'bg-white text-slate-500 hover:text-[#dc2626] border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" /> Affiliates ({affiliates.length})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'transactions'
                  ? 'bg-[#dc2626] text-white shadow-lg shadow-[#dc2626]/20'
                  : 'bg-white text-slate-500 hover:text-[#dc2626] border border-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4 inline mr-2" /> Transactions ({transactions.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'transactions' && (
              <select
                value={txStatusFilter}
                onChange={e => setTxStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-600"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            )}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#dc2626] w-64"
              />
            </div>
            <Button onClick={loadData} variant="outline" className="border-slate-200 rounded-xl p-2.5">
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'affiliates' && (
            <motion.div
              key="affiliates"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredAffiliates.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-[32px] p-16 text-center">
                  <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">No Affiliates Yet</h3>
                  <p className="text-sm text-slate-400 font-medium mb-6">Add your first affiliate to start tracking referrals and commissions</p>
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-widest text-xs"
                  >
                    <UserPlus className="w-4 h-4 mr-2" /> Add First Affiliate
                  </Button>
                </div>
              ) : (
                filteredAffiliates.map(affiliate => (
                  <AffiliateRow
                    key={affiliate.id}
                    affiliate={affiliate}
                    onEdit={(a) => { setEditingAffiliate(a); setIsCreating(false); }}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    expanded={expandedId === affiliate.id}
                    onExpand={setExpandedId}
                  />
                ))
              )}

              {/* Points Management Quick Actions */}
              {filteredAffiliates.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-[24px] p-5 mt-6">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-500" /> Points Management
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredAffiliates.filter(a => a.is_active).map(affiliate => (
                      <button
                        key={affiliate.id}
                        onClick={() => setPointsAdjustAffiliate(affiliate)}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-red-50 hover:border-[#dc2626] border border-transparent transition-all group"
                      >
                        <div className="text-left">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{affiliate.affiliate_name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{(affiliate.total_points || 0).toFixed(2)} pts = ${((affiliate.total_points || 0) * POINTS_TO_DOLLAR).toFixed(2)}</p>
                        </div>
                        <Edit3 className="w-4 h-4 text-slate-300 group-hover:text-[#dc2626] transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredTransactions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-[32px] p-16 text-center">
                  <CreditCard className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">No Transactions Yet</h3>
                  <p className="text-sm text-slate-400 font-medium">Transactions will appear when customers use affiliate codes at checkout</p>
                </div>
              ) : (
                filteredTransactions.map(tx => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    onUpdateStatus={handleUpdateTxStatus}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* How It Works Info */}
        <div className="mt-12 bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#dc2626]" /> How the Affiliate Program Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <Gift className="w-5 h-5 text-[#dc2626]" />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Customer Discount</h4>
              <p className="text-xs text-slate-400 font-medium">
                When a customer uses an affiliate code at checkout, they receive the configured discount (e.g., 15% off).
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Coins className="w-5 h-5 text-amber-500" />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Reward Points (1.5%)</h4>
              <p className="text-xs text-slate-400 font-medium">
                The affiliate earns 1.5% of the order total as reward points. For example, a $230 order earns 3.45 points ($3.45 value). Points accumulate for future purchases.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Commission (10%)</h4>
              <p className="text-xs text-slate-400 font-medium">
                You owe the affiliate a 10% commission on the order total. Track pending vs. paid commissions in the report. Mark as paid once settled.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCommissionReport && (
        <CommissionReportModal
          affiliates={affiliates}
          transactions={transactions}
          onClose={() => setShowCommissionReport(false)}
        />
      )}

      {pointsAdjustAffiliate && (
        <PointsAdjustModal
          affiliate={pointsAdjustAffiliate}
          onSave={handlePointsAdjust}
          onClose={() => setPointsAdjustAffiliate(null)}
        />
      )}
    </div>
  );
}
