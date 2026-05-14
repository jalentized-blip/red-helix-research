import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, AlertTriangle, Ghost, ShieldAlert, Search,
  RefreshCw, Tag, DollarSign, Eye, EyeOff, Package, X,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  ghost_product: { label: 'Ghost Product', color: 'bg-red-100 border-red-300 text-red-700', icon: Ghost },
  ghost_spec:    { label: 'Ghost SKU',     color: 'bg-red-100 border-red-300 text-red-700', icon: Ghost },
  hidden_product:{ label: 'Hidden Product',color: 'bg-orange-100 border-orange-300 text-orange-700', icon: EyeOff },
  hidden_spec:   { label: 'Hidden SKU',    color: 'bg-orange-100 border-orange-300 text-orange-700', icon: EyeOff },
  product_out_of_stock: { label: 'OOS Product', color: 'bg-amber-100 border-amber-300 text-amber-700', icon: Package },
  spec_out_of_stock:    { label: 'OOS SKU',     color: 'bg-amber-100 border-amber-300 text-amber-700', icon: Package },
  price_mismatch:{ label: 'Price Mismatch',color: 'bg-purple-100 border-purple-300 text-purple-700', icon: DollarSign },
  ok:            { label: 'OK',            color: 'bg-green-100 border-green-300 text-green-700', icon: null },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ok;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {cfg.label}
    </span>
  );
}

function LogRow({ log }) {
  const [expanded, setExpanded] = useState(false);
  const isFlagged = log.status !== 'ok';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 overflow-hidden transition-all ${
        isFlagged ? 'border-red-200 bg-red-50/40' : 'border-slate-100 bg-white'
      }`}
    >
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-4"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Icon */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isFlagged ? 'bg-red-100' : 'bg-green-50'
        }`}>
          {isFlagged
            ? <AlertTriangle className="w-4.5 h-4.5 text-red-600" />
            : <Package className="w-4.5 h-4.5 text-green-600" />
          }
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-black text-slate-900 text-sm truncate">{log.product_name}</span>
            <StatusBadge status={log.status} />
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {log.specification}</span>
            {log.price_submitted != null && (
              <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />
                ${log.price_submitted}
                {log.price_catalog != null && log.price_catalog !== log.price_submitted && (
                  <span className="text-purple-600 font-bold ml-1">(catalog: ${log.price_catalog})</span>
                )}
              </span>
            )}
            <span>{log.logged_at ? format(new Date(log.logged_at), 'MMM dd, yyyy h:mm a') : '—'}</span>
          </div>
          {isFlagged && log.mismatch_reason && (
            <p className="mt-1.5 text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-lg inline-block">
              {log.mismatch_reason}
            </p>
          )}
        </div>

        {/* Quantity + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {log.quantity > 1 && (
            <span className="text-xs font-bold text-slate-400">×{log.quantity}</span>
          )}
          <span className="text-slate-300 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-0 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest mb-0.5">Product ID</p>
                <p className="font-mono text-slate-700 break-all">{log.product_id || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest mb-0.5">Session</p>
                <p className="font-mono text-slate-700 break-all">{log.session_id || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest mb-0.5">Qty Added</p>
                <p className="font-bold text-slate-700">{log.quantity ?? 1}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest mb-0.5">Price Submitted</p>
                <p className="font-bold text-slate-700">{log.price_submitted != null ? `$${log.price_submitted}` : '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest mb-0.5">Catalog Price</p>
                <p className="font-bold text-slate-700">{log.price_catalog != null ? `$${log.price_catalog}` : '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest mb-0.5">Logged At</p>
                <p className="font-bold text-slate-700">{log.logged_at ? format(new Date(log.logged_at), 'PPpp') : '—'}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SkuMismatchDashboard() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('flagged');
  const [search, setSearch] = useState('');

  // Auth guard
  const [authed, setAuthed] = useState(null);
  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u || u.role !== 'admin') navigate(createPageUrl('Home'));
      else setAuthed(true);
    }).catch(() => navigate(createPageUrl('Home')));
  }, [navigate]);

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['addToCartLogs'],
    queryFn: () => base44.entities.AddToCartLog.list('-logged_at', 500),
    enabled: !!authed,
  });

  const flaggedStatuses = ['ghost_product', 'ghost_spec', 'hidden_product', 'hidden_spec', 'product_out_of_stock', 'spec_out_of_stock', 'price_mismatch'];

  const filtered = useMemo(() => {
    let result = logs;
    if (filterStatus === 'flagged') result = result.filter(l => flaggedStatuses.includes(l.status));
    else if (filterStatus !== 'all') result = result.filter(l => l.status === filterStatus);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.product_name?.toLowerCase().includes(q) ||
        l.specification?.toLowerCase().includes(q) ||
        l.product_id?.toLowerCase().includes(q) ||
        l.mismatch_reason?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [logs, filterStatus, search]);

  // Summary counts
  const counts = useMemo(() => {
    const c = { flagged: 0, ok: 0 };
    flaggedStatuses.forEach(s => { c[s] = 0; });
    logs.forEach(l => {
      if (flaggedStatuses.includes(l.status)) {
        c.flagged++;
        c[l.status] = (c[l.status] || 0) + 1;
      } else {
        c.ok++;
      }
    });
    return c;
  }, [logs]);

  if (!authed) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-[#8B2635] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back */}
        <Link to={createPageUrl('AdminOrderManagement')}>
          <Button variant="ghost" className="mb-4 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-slate-100">
            <ArrowLeft className="w-4 h-4 mr-2" /> Order Hub
          </Button>
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-red-600" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                SKU <span className="text-[#8B2635]">Mismatch</span> Log
              </h1>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              Every add-to-cart event validated against the live catalog. Flagged = blocked ghost item or price mismatch.
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs rounded-full px-5 py-4 self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <button
            onClick={() => setFilterStatus('flagged')}
            className={`rounded-2xl p-4 border-2 text-left transition-all hover:shadow-md ${
              filterStatus === 'flagged'
                ? 'bg-red-600 border-red-600 text-white'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Total Flagged</p>
            <p className="text-4xl font-black">{counts.flagged}</p>
          </button>
          <button
            onClick={() => setFilterStatus('ghost_product')}
            className={`rounded-2xl p-4 border-2 text-left transition-all hover:shadow-md ${
              filterStatus === 'ghost_product'
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Ghost className="w-3 h-3 opacity-60" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Ghost Products</p>
            </div>
            <p className="text-4xl font-black">{(counts.ghost_product || 0) + (counts.ghost_spec || 0)}</p>
          </button>
          <button
            onClick={() => setFilterStatus('price_mismatch')}
            className={`rounded-2xl p-4 border-2 text-left transition-all hover:shadow-md ${
              filterStatus === 'price_mismatch'
                ? 'bg-purple-700 border-purple-700 text-white'
                : 'bg-purple-50 border-purple-200 text-purple-700'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3 h-3 opacity-60" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Price Mismatches</p>
            </div>
            <p className="text-4xl font-black">{counts.price_mismatch || 0}</p>
          </button>
          <button
            onClick={() => setFilterStatus('ok')}
            className={`rounded-2xl p-4 border-2 text-left transition-all hover:shadow-md ${
              filterStatus === 'ok'
                ? 'bg-green-600 border-green-600 text-white'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Passed Checks</p>
            <p className="text-4xl font-black">{counts.ok}</p>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search product, SKU, reason..."
              className="pl-11 bg-slate-50 border-slate-200 rounded-full h-11"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-slate-400 hover:text-[#8B2635]" />
              </button>
            )}
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-slate-50 border-slate-200 w-full sm:w-52 rounded-full h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="flagged">All Flagged</SelectItem>
              <SelectItem value="ghost_product">Ghost Products</SelectItem>
              <SelectItem value="ghost_spec">Ghost SKUs</SelectItem>
              <SelectItem value="hidden_product">Hidden Products</SelectItem>
              <SelectItem value="hidden_spec">Hidden SKUs</SelectItem>
              <SelectItem value="product_out_of_stock">OOS Product</SelectItem>
              <SelectItem value="spec_out_of_stock">OOS SKU</SelectItem>
              <SelectItem value="price_mismatch">Price Mismatch</SelectItem>
              <SelectItem value="ok">OK (Passed)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Log List */}
        {isLoading ? (
          <div className="text-center py-24">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-[#8B2635] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading logs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
            <ShieldAlert className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No events found</p>
            <button onClick={() => { setSearch(''); setFilterStatus('flagged'); }} className="mt-3 text-[#8B2635] font-black uppercase text-xs hover:underline">
              Reset filters
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map(log => <LogRow key={log.id} log={log} />)}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}