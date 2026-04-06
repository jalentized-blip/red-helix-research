import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Download, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function TaxReportModal({ orders, isOpen, onClose, productCostMap = {}, products = [], onUpdateProductCost }) {
  const [dateRange, setDateRange] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [editingCosts, setEditingCosts] = useState({});
  const [savingCosts, setSavingCosts] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  const handleCostChange = (productId, value) => {
    setEditingCosts(prev => ({ ...prev, [productId]: value }));
  };

  const handleSaveCost = async (product) => {
    const newCost = parseFloat(editingCosts[product.id]);
    if (isNaN(newCost)) return;
    setSavingCosts(prev => ({ ...prev, [product.id]: true }));
    await onUpdateProductCost(product.id, newCost);
    setSavingCosts(prev => ({ ...prev, [product.id]: false }));
    setEditingCosts(prev => { const n = { ...prev }; delete n[product.id]; return n; });
  };

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      if (o.is_deleted || o.status === 'cancelled') return false;
      const d = new Date(o.created_date);
      if (dateRange === 'ytd') return d.getFullYear() === now.getFullYear();
      if (dateRange === 'last_year') return d.getFullYear() === now.getFullYear() - 1;
      if (dateRange === 'q1') return d.getFullYear() === now.getFullYear() && d.getMonth() < 3;
      if (dateRange === 'q2') return d.getFullYear() === now.getFullYear() && d.getMonth() >= 3 && d.getMonth() < 6;
      if (dateRange === 'q3') return d.getFullYear() === now.getFullYear() && d.getMonth() >= 6 && d.getMonth() < 9;
      if (dateRange === 'q4') return d.getFullYear() === now.getFullYear() && d.getMonth() >= 9;
      if (dateRange === 'custom' && customStart && customEnd) {
        return d >= new Date(customStart) && d <= new Date(customEnd + 'T23:59:59');
      }
      return true;
    });
  }, [orders, dateRange, customStart, customEnd]);

  const TAX_RATE = 0.08;

  const calcCOGS = (order) => {
    if (order.total_product_cost != null && order.total_product_cost !== '') {
      return Number(order.total_product_cost);
    }
    if (!order.items?.length) return 0;
    return order.items.reduce((sum, item) => {
      const name = (item.productName || item.product_name || '').toLowerCase();
      const product = products.find(p => p.name?.toLowerCase() === name);
      if (!product) return sum;
      const specIdx = product.specifications?.findIndex(s => s.name === item.specification);
      const specKey = specIdx != null && specIdx >= 0 ? `${product.id}__${specIdx}` : null;
      let cost = 0;
      if (specKey && editingCosts[specKey] !== undefined) {
        cost = parseFloat(editingCosts[specKey]) || 0;
      } else if (specIdx != null && specIdx >= 0 && product.specifications[specIdx]?.cost_price != null) {
        cost = product.specifications[specIdx].cost_price;
      } else if (editingCosts[product.id] !== undefined) {
        cost = parseFloat(editingCosts[product.id]) || 0;
      } else {
        cost = productCostMap[name] || 0;
      }
      return sum + cost * (item.quantity || 1);
    }, 0);
  };

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const totalShipping = filteredOrders.reduce((s, o) => s + (o.shipping_cost || 15), 0);
    const totalDiscounts = filteredOrders.reduce((s, o) => s + (o.discount_amount || 0), 0);
    const totalSubtotal = filteredOrders.reduce((s, o) => s + (o.subtotal || o.total_amount || 0), 0);
    const totalTax = filteredOrders.reduce((s, o) => {
      const shipping = o.shipping_cost || 0;
      const sub = o.subtotal != null ? o.subtotal : Math.max(0, (o.total_amount || 0) - shipping);
      const disc = o.discount_amount || 0;
      return s + Math.max(0, sub - disc) * TAX_RATE;
    }, 0);
    const totalCOGS = filteredOrders.reduce((s, o) => s + calcCOGS(o), 0);
    const totalProfit = filteredOrders.reduce((s, o) => {
      const shipping = o.shipping_cost || 0;
      const sub = o.subtotal != null ? o.subtotal : Math.max(0, (o.total_amount || 0) - shipping);
      const disc = o.discount_amount || 0;
      return s + Math.max(0, sub - disc) - calcCOGS(o);
    }, 0);
    const orderCount = filteredOrders.length;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    const byMonth = {};
    filteredOrders.forEach(o => {
      const key = format(new Date(o.created_date), 'yyyy-MM');
      if (!byMonth[key]) byMonth[key] = { revenue: 0, orders: 0, shipping: 0, discounts: 0, tax: 0, cogs: 0, profit: 0 };
      byMonth[key].revenue += o.total_amount || 0;
      byMonth[key].orders += 1;
      byMonth[key].shipping += o.shipping_cost || 15;
      byMonth[key].discounts += o.discount_amount || 0;
      const shipping = o.shipping_cost || 0;
      const sub = o.subtotal != null ? o.subtotal : Math.max(0, (o.total_amount || 0) - shipping);
      const disc = o.discount_amount || 0;
      byMonth[key].tax += Math.max(0, sub - disc) * TAX_RATE;
      const cogs = calcCOGS(o);
      byMonth[key].cogs += cogs;
      const profitSub = o.subtotal != null ? o.subtotal : Math.max(0, (o.total_amount || 0) - (o.shipping_cost || 0));
      byMonth[key].profit += Math.max(0, profitSub - disc) - cogs;
    });

    const byPaymentMethod = {};
    filteredOrders.forEach(o => {
      const method = o.payment_method || 'unknown';
      if (!byPaymentMethod[method]) byPaymentMethod[method] = { revenue: 0, count: 0 };
      byPaymentMethod[method].revenue += o.total_amount || 0;
      byPaymentMethod[method].count += 1;
    });

    return { totalRevenue, totalShipping, totalDiscounts, totalSubtotal, totalTax, totalCOGS, totalProfit, orderCount, avgOrderValue, byMonth, byPaymentMethod };
  }, [filteredOrders]);

  const exportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Customer Email', 'Items', 'Subtotal', 'Discount', 'Shipping', 'Est. Tax (8%)', 'Total', 'COGS', 'Profit', 'Payment Method', 'Payment Status', 'Crypto Currency', 'Transaction ID', 'Status', 'Carrier', 'Tracking Number', 'Kit Tracking Number', 'Shipping Address', 'City', 'State', 'ZIP'];
    const rows = filteredOrders.map(o => {
      const addr = o.shipping_address || {};
      const items = o.items?.map(i => `${i.productName || i.product_name} (${i.specification} x${i.quantity})`).join('; ') || '';
      const shipping = o.shipping_cost || 0;
      const sub = o.subtotal != null ? o.subtotal : Math.max(0, (o.total_amount || 0) - shipping);
      const disc = o.discount_amount || 0;
      const tax = Math.max(0, sub - disc) * 0.08;
      const cogs = calcCOGS(o);
      const profit = Math.max(0, sub - disc) - cogs;
      return [
        o.order_number, format(new Date(o.created_date), 'yyyy-MM-dd HH:mm'),
        `"${o.customer_name || ''}"`, o.customer_email || o.created_by || '',
        `"${items}"`,
        (o.subtotal || 0).toFixed(2), disc.toFixed(2),
        (o.shipping_cost || 15).toFixed(2), tax.toFixed(2), (o.total_amount || 0).toFixed(2),
        cogs.toFixed(2), profit.toFixed(2),
        o.payment_method || '', o.payment_status || '', o.crypto_currency || '',
        o.transaction_id || '', o.status || '',
        o.carrier || '', o.tracking_number || '', o.kit_tracking_number || '',
        `"${addr.address || addr.shippingAddress || ''}"`,
        addr.city || addr.shippingCity || '', addr.state || addr.shippingState || '',
        addr.zip || addr.shippingZip || '',
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-tax-report-${dateRange}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-black text-xl flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#dc2626]" />
            Tax & Revenue Report
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Financial overview for tax filing and business analysis.
          </DialogDescription>
        </DialogHeader>

        {/* Date Range Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['all','ytd','last_year','q1','q2','q3','q4','custom'].map(r => (
            <button key={r} onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${dateRange === r ? 'bg-[#dc2626] border-[#dc2626] text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {r === 'all' ? 'All Time' : r === 'ytd' ? 'This Year' : r === 'last_year' ? 'Last Year' : r === 'custom' ? 'Custom' : r.toUpperCase()}
            </button>
          ))}
        </div>

        {dateRange === 'custom' && (
          <div className="flex gap-3 mb-4">
            <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900 h-9" />
            <span className="text-slate-400 self-center text-sm">to</span>
            <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900 h-9" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'irs', label: '🏛️ IRS Estimate' },
            { id: 'monthly', label: '📅 Monthly' },
            { id: 'schedulec', label: '📋 Schedule C' },
            { id: 'costs', label: '💰 Cost Editor' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-b-2 transition-all -mb-px whitespace-nowrap ${activeTab === tab.id ? 'border-[#dc2626] text-[#dc2626]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, cls: 'bg-slate-50 border-slate-200' },
              { label: 'Orders', value: stats.orderCount, cls: 'bg-slate-50 border-slate-200' },
              { label: 'Avg Order Value', value: `$${stats.avgOrderValue.toFixed(2)}`, cls: 'bg-slate-50 border-slate-200' },
              { label: 'Gross Sales', value: `$${stats.totalSubtotal.toFixed(2)}`, cls: 'bg-slate-50 border-slate-200' },
              { label: 'Shipping Collected', value: `$${stats.totalShipping.toFixed(2)}`, cls: 'bg-slate-50 border-slate-200' },
              { label: 'Discounts Given', value: `-$${stats.totalDiscounts.toFixed(2)}`, cls: 'bg-slate-50 border-slate-200', red: true },
              { label: 'Est. Sales Tax (8%)', value: `$${stats.totalTax.toFixed(2)}`, cls: 'bg-amber-50 border-amber-200', amber: true },
              { label: 'Total COGS', value: `$${stats.totalCOGS.toFixed(2)}`, cls: 'bg-orange-50 border-orange-200', orange: true },
              { label: 'Net Profit', value: `$${stats.totalProfit.toFixed(2)}`, cls: stats.totalProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200', profit: true },
            ].map(({ label, value, cls, red, amber, orange, profit }) => (
              <div key={label} className={`rounded-2xl border p-4 ${cls}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest ${amber ? 'text-amber-600' : orange ? 'text-orange-600' : profit ? (stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600') : 'text-slate-400'}`}>{label}</p>
                <p className={`text-2xl font-black ${red ? 'text-red-500' : amber ? 'text-amber-700' : orange ? 'text-orange-700' : profit ? (stats.totalProfit >= 0 ? 'text-green-700' : 'text-red-700') : 'text-slate-900'}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* By Payment Method */}
        {activeTab === 'overview' && (
          <div className="mb-6">
            <h4 className="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-3">By Payment Method</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(stats.byPaymentMethod).map(([method, data]) => (
                <div key={method} className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                  <p className="text-xs text-slate-500 font-bold capitalize">{method.replace(/_/g, ' ')}</p>
                  <p className="text-lg font-black text-slate-900">${data.revenue.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400">{data.count} orders</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IRS Tab */}
        {activeTab === 'irs' && (
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
              <p className="font-black mb-1">⚠️ Estimate Only — Consult a CPA</p>
              <p className="text-xs text-blue-600">These figures are estimates based on your net profit. Actual taxes depend on your business structure, deductions, and state.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4"><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Gross Revenue</p><p className="text-2xl font-black text-slate-900">${stats.totalRevenue.toFixed(2)}</p></div>
              <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4"><p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">Total COGS (Deductible)</p><p className="text-2xl font-black text-orange-700">-${stats.totalCOGS.toFixed(2)}</p></div>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4"><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Shipping Costs (Deductible)</p><p className="text-2xl font-black text-slate-700">-${stats.totalShipping.toFixed(2)}</p></div>
              <div className={`rounded-2xl border p-4 ${stats.totalProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}><p className={`text-[10px] font-black uppercase tracking-widest ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>Net Profit (Taxable Income)</p><p className={`text-2xl font-black ${stats.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>${stats.totalProfit.toFixed(2)}</p></div>
            </div>
            {stats.totalProfit > 0 && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-100 border-b border-slate-200"><p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Federal Income Tax Estimates (2026 Self-Employed)</p></div>
                {[
                  { label: 'Self-Employment Tax (15.3%)', rate: 0.153, note: 'Social Security + Medicare on net profit' },
                  { label: 'Federal Income Tax — 10% Bracket', rate: 0.10, note: 'If profit < $11,925 (single filer)' },
                  { label: 'Federal Income Tax — 12% Bracket', rate: 0.12, note: 'If profit $11,925–$48,475' },
                  { label: 'Federal Income Tax — 22% Bracket', rate: 0.22, note: 'If profit $48,475–$103,350' },
                ].map(bracket => (
                  <div key={bracket.label} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                    <div><p className="text-sm font-bold text-slate-900">{bracket.label}</p><p className="text-[11px] text-slate-400">{bracket.note}</p></div>
                    <div className="text-right"><p className="text-sm font-black text-red-600">${(stats.totalProfit * bracket.rate).toFixed(2)}</p><p className="text-[10px] text-slate-400">{(bracket.rate * 100).toFixed(1)}% of ${stats.totalProfit.toFixed(0)}</p></div>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest mb-2">Sales Tax Collected (Owed to State)</p>
              <p className="text-2xl font-black text-amber-700">${stats.totalTax.toFixed(2)}</p>
              <p className="text-xs text-amber-600 mt-1">This is money collected from customers that must be remitted to your state. It is NOT income.</p>
            </div>
          </div>
        )}

        {/* Monthly Tab */}
        {activeTab === 'monthly' && (
          <div className="mb-6 overflow-x-auto">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden min-w-[600px]">
              <div className="grid grid-cols-8 gap-2 px-4 py-2 bg-slate-100 border-b border-slate-200">
                {['Month','Orders','Revenue','Shipping','Discounts','Tax (8%)','COGS','Profit'].map(h => (
                  <span key={h} className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-right first:text-left">{h}</span>
                ))}
              </div>
              {Object.entries(stats.byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, data]) => (
                <div key={month} className="grid grid-cols-8 gap-2 px-4 py-2.5 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-900 font-bold">{format(new Date(month + '-01'), 'MMM yyyy')}</span>
                  <span className="text-sm text-slate-900 text-right">{data.orders}</span>
                  <span className="text-sm text-slate-900 font-bold text-right">${data.revenue.toFixed(2)}</span>
                  <span className="text-sm text-slate-500 text-right">${data.shipping.toFixed(2)}</span>
                  <span className="text-sm text-red-500 text-right">-${data.discounts.toFixed(2)}</span>
                  <span className="text-sm text-amber-600 font-bold text-right">${data.tax.toFixed(2)}</span>
                  <span className="text-sm text-orange-600 text-right">${data.cogs.toFixed(2)}</span>
                  <span className={`text-sm font-bold text-right ${data.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>${data.profit.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule C Tab */}
        {activeTab === 'schedulec' && (
          <div className="space-y-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-800">
              <p className="font-black mb-1">📋 Schedule C — Profit or Loss from Business</p>
              <p className="text-xs text-green-700">Use these figures to fill out IRS Schedule C. Consult a CPA to confirm deductions for your situation.</p>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-slate-100 border-b border-slate-200"><p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Part I — Income</p></div>
              {[
                { line: '1', label: 'Gross receipts or sales', value: stats.totalRevenue },
                { line: '2', label: 'Returns and allowances', value: stats.totalDiscounts },
                { line: '3', label: 'Subtract Line 2 from Line 1', value: stats.totalRevenue - stats.totalDiscounts },
                { line: '7', label: 'Gross income', value: stats.totalRevenue - stats.totalDiscounts, bold: true },
              ].map(row => (
                <div key={row.line} className={`flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0 ${row.bold ? 'bg-green-50' : ''}`}>
                  <div><span className="text-[10px] text-slate-400 font-black mr-2">Line {row.line}</span><span className={`text-sm ${row.bold ? 'font-black text-green-800' : 'text-slate-700'}`}>{row.label}</span></div>
                  <span className={`font-black ${row.bold ? 'text-green-700 text-lg' : 'text-slate-900'}`}>${row.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-slate-100 border-b border-slate-200"><p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Part II — Expenses (Deductible)</p></div>
              {[
                { line: '17', label: 'Cost of goods sold (COGS)', value: stats.totalCOGS },
                { line: '22', label: 'Supplies / packaging', value: 0 },
                { line: '24', label: 'Shipping & postage', value: stats.totalShipping },
                { line: '28', label: 'Total expenses', value: stats.totalCOGS + stats.totalShipping, bold: true },
              ].map(row => (
                <div key={row.line} className={`flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0 ${row.bold ? 'bg-orange-50' : ''}`}>
                  <div><span className="text-[10px] text-slate-400 font-black mr-2">Line {row.line}</span><span className={`text-sm ${row.bold ? 'font-black text-orange-800' : 'text-slate-700'}`}>{row.label}</span></div>
                  <span className={`font-black ${row.bold ? 'text-orange-700 text-lg' : 'text-slate-900'}`}>${row.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className={`rounded-2xl border-2 p-5 flex justify-between items-center ${stats.totalProfit >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
              <div><span className="text-[10px] text-slate-400 font-black mr-2">Line 31</span><span className="text-base font-black text-slate-900">Net profit (or loss)</span><p className="text-xs text-slate-500 mt-0.5">Enter on Schedule 1 (Form 1040), line 3</p></div>
              <span className={`text-3xl font-black ${stats.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>${stats.totalProfit.toFixed(2)}</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest mb-2">⏰ Quarterly Estimated Tax Due Dates</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[{ q: 'Q1', date: 'Apr 15' }, { q: 'Q2', date: 'Jun 15' }, { q: 'Q3', date: 'Sep 15' }, { q: 'Q4', date: 'Jan 15' }].map(d => (
                  <div key={d.q} className="bg-white rounded-xl border border-amber-200 p-3 text-center">
                    <p className="text-xs font-black text-amber-700">{d.q}</p>
                    <p className="text-sm font-bold text-slate-900">{d.date}</p>
                    <p className="text-[10px] text-slate-400">~${(stats.totalTax / 4).toFixed(0)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cost Editor Tab */}
        {activeTab === 'costs' && products.length > 0 && (
          <div className="mb-6">
            <h4 className="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-3">Product Cost Prices (per unit)</h4>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
              {products.map((product, pi) => (
                <div key={product.id} className={pi < products.length - 1 ? 'border-b border-slate-200' : ''}>
                  <div className="flex items-center gap-4 px-4 py-3 bg-slate-100">
                    <span className="text-sm text-slate-900 font-black flex-1">{product.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold">Default cost $</span>
                    <Input type="number" step="0.01" min="0" placeholder="0.00"
                      value={editingCosts[product.id] !== undefined ? editingCosts[product.id] : (product.cost_price ?? '')}
                      onChange={(e) => handleCostChange(product.id, e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 h-8 w-24 text-sm" />
                    <Button size="sm" disabled={editingCosts[product.id] === undefined || savingCosts[product.id]}
                      onClick={() => handleSaveCost(product)}
                      className="h-8 px-3 text-xs bg-[#dc2626] hover:bg-[#b91c1c] text-white disabled:opacity-40">
                      {savingCosts[product.id] ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                  {product.specifications?.map((spec, si) => {
                    const key = `${product.id}__${si}`;
                    return (
                      <div key={si} className="flex items-center gap-4 px-6 py-2.5 border-t border-slate-100">
                        <span className="text-xs text-slate-600 font-semibold flex-1">{spec.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">Cost per unit $</span>
                        <Input type="number" step="0.01" min="0" placeholder="0.00"
                          value={editingCosts[key] !== undefined ? editingCosts[key] : (spec.cost_price ?? '')}
                          onChange={(e) => handleCostChange(key, e.target.value)}
                          className="bg-white border-slate-200 text-slate-900 h-8 w-24 text-sm" />
                        <Button size="sm" disabled={editingCosts[key] === undefined || savingCosts[key]}
                          onClick={async () => {
                            const newCost = parseFloat(editingCosts[key]);
                            if (isNaN(newCost)) return;
                            setSavingCosts(prev => ({ ...prev, [key]: true }));
                            const updatedSpecs = product.specifications.map((s, idx) => idx === si ? { ...s, cost_price: newCost } : s);
                            await onUpdateProductCost(product.id, product.cost_price, updatedSpecs);
                            setSavingCosts(prev => ({ ...prev, [key]: false }));
                            setEditingCosts(prev => { const n = { ...prev }; delete n[key]; return n; });
                          }}
                          className="h-8 px-3 text-xs bg-slate-700 hover:bg-slate-800 text-white disabled:opacity-40">
                          {savingCosts[key] ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-200 text-slate-500">Close</Button>
          <Button onClick={exportCSV} className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold shadow-lg shadow-[#dc2626]/20">
            <Download className="w-4 h-4 mr-2" />
            Export CSV for Tax Filing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}