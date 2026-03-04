import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { TrendingUp, DollarSign, Receipt, Download, AlertCircle } from 'lucide-react';
import { format, addMonths, startOfMonth } from 'date-fns';

const COLORS = {
  revenue: '#3b82f6',
  profit: '#22c55e',
  tax: '#f59e0b',
  cogs: '#f97316',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-black text-slate-700 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }} className="font-bold capitalize">{p.name}</span>
          <span className="font-black text-slate-900">${Number(p.value).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

export default function PredictionDashboard({ isOpen, onClose, orders = [], products = [], productCostMap = {} }) {
  const [growthRate, setGrowthRate] = useState(10);
  const [taxBracket, setTaxBracket] = useState('self_employed');
  const [monthsToProject, setMonthsToProject] = useState(12);

  const calcCOGS = (order) => {
    if (order.total_product_cost != null && order.total_product_cost !== '') return Number(order.total_product_cost);
    if (!order.items?.length) return 0;
    return order.items.reduce((sum, item) => {
      const name = (item.productName || item.product_name || '').toLowerCase();
      const product = products.find(p => p.name?.toLowerCase() === name);
      const spec = product?.specifications?.find(s => s.name === item.specification);
      const cost = (spec?.cost_price != null ? spec.cost_price : productCostMap[name]) || 0;
      return sum + cost * (item.quantity || 1);
    }, 0);
  };

  // Build historical monthly data
  const historicalData = useMemo(() => {
    const byMonth = {};
    orders.filter(o => o.status !== 'cancelled').forEach(o => {
      const key = format(new Date(o.created_date), 'yyyy-MM');
      if (!byMonth[key]) byMonth[key] = { revenue: 0, cogs: 0, profit: 0, orders: 0 };
      byMonth[key].revenue += o.total_amount || 0;
      byMonth[key].cogs += calcCOGS(o);
      byMonth[key].orders += 1;
      const sub = o.subtotal != null ? o.subtotal : Math.max(0, (o.total_amount || 0) - (o.shipping_cost || 0));
      const disc = o.discount_amount || 0;
      byMonth[key].profit += Math.max(0, sub - disc) - calcCOGS(o);
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: format(new Date(month + '-01'), 'MMM yy'),
        ...data,
        tax: data.profit > 0 ? data.profit * 0.153 : 0, // SE tax estimate
        type: 'actual',
      }));
  }, [orders, products, productCostMap]);

  // Calculate average monthly figures from last 3 months (or all if fewer)
  const baseMonthlyRevenue = useMemo(() => {
    const recent = historicalData.slice(-3);
    if (!recent.length) return 0;
    return recent.reduce((s, d) => s + d.revenue, 0) / recent.length;
  }, [historicalData]);

  const baseMonthlyProfit = useMemo(() => {
    const recent = historicalData.slice(-3);
    if (!recent.length) return 0;
    return recent.reduce((s, d) => s + d.profit, 0) / recent.length;
  }, [historicalData]);

  const baseMonthlyOrders = useMemo(() => {
    const recent = historicalData.slice(-3);
    if (!recent.length) return 0;
    return recent.reduce((s, d) => s + d.orders, 0) / recent.length;
  }, [historicalData]);

  // Build projected data
  const projectedData = useMemo(() => {
    const monthlyGrowth = growthRate / 100;
    const result = [];
    for (let i = 1; i <= monthsToProject; i++) {
      const d = addMonths(startOfMonth(new Date()), i);
      const factor = Math.pow(1 + monthlyGrowth / 12, i);
      const revenue = baseMonthlyRevenue * factor;
      const profit = baseMonthlyProfit * factor;
      const taxRate = taxBracket === 'self_employed' ? 0.153
        : taxBracket === 'bracket_22' ? 0.22 + 0.153
        : taxBracket === 'bracket_12' ? 0.12 + 0.153
        : 0.10 + 0.153;
      const tax = profit > 0 ? profit * taxRate : 0;
      const cogs = revenue - profit;
      result.push({
        month: format(d, 'MMM yy'),
        revenue: Math.max(0, revenue),
        profit: Math.max(0, profit),
        cogs: Math.max(0, cogs),
        tax: Math.max(0, tax),
        orders: Math.max(0, baseMonthlyOrders * factor),
        type: 'projected',
      });
    }
    return result;
  }, [baseMonthlyRevenue, baseMonthlyProfit, baseMonthlyOrders, growthRate, monthsToProject, taxBracket]);

  // Combined chart data (last 6 months historical + projections)
  const chartData = [...historicalData.slice(-6), ...projectedData];

  // Annual projections summary
  const annualProjected = useMemo(() => {
    const annual12 = projectedData.slice(0, 12);
    return {
      revenue: annual12.reduce((s, d) => s + d.revenue, 0),
      profit: annual12.reduce((s, d) => s + d.profit, 0),
      tax: annual12.reduce((s, d) => s + d.tax, 0),
      cogs: annual12.reduce((s, d) => s + d.cogs, 0),
      orders: annual12.reduce((s, d) => s + d.orders, 0),
    };
  }, [projectedData]);

  const taxBracketOptions = [
    { id: 'self_employed', label: 'SE Tax Only (15.3%)', rate: '15.3%' },
    { id: 'bracket_10', label: '10% + SE Tax (25.3%)', rate: '25.3%' },
    { id: 'bracket_12', label: '12% + SE Tax (27.3%)', rate: '27.3%' },
    { id: 'bracket_22', label: '22% + SE Tax (37.3%)', rate: '37.3%' },
  ];

  const exportProjectionCSV = () => {
    const headers = ['Month', 'Type', 'Revenue', 'COGS', 'Profit', 'Est. Tax', 'Orders'];
    const rows = chartData.map(d => [
      d.month, d.type,
      d.revenue.toFixed(2), d.cogs.toFixed(2),
      d.profit.toFixed(2), d.tax.toFixed(2),
      Math.round(d.orders),
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-projection-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-black text-xl flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#dc2626]" />
            Business Growth Predictions
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Visual projections based on your historical order data. For planning purposes only.
          </DialogDescription>
        </DialogHeader>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1.5">Annual Growth Rate (%)</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="-50"
                max="500"
                value={growthRate}
                onChange={e => setGrowthRate(Number(e.target.value))}
                className="bg-slate-50 border-slate-200 text-slate-900 h-10"
              />
              <span className="text-slate-500 font-bold text-sm">%/yr</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1.5">Tax Bracket</label>
            <Select value={taxBracket} onValueChange={setTaxBracket}>
              <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                {taxBracketOptions.map(t => (
                  <SelectItem key={t.id} value={t.id} className="text-slate-900">{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1.5">Projection Period</label>
            <Select value={String(monthsToProject)} onValueChange={v => setMonthsToProject(Number(v))}>
              <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="6" className="text-slate-900">6 Months</SelectItem>
                <SelectItem value="12" className="text-slate-900">12 Months</SelectItem>
                <SelectItem value="24" className="text-slate-900">24 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Annual Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Projected Annual Revenue</p>
            <p className="text-2xl font-black text-blue-700">${annualProjected.revenue.toFixed(0)}</p>
            <p className="text-[10px] text-blue-500 mt-1">~{Math.round(annualProjected.orders)} orders</p>
          </div>
          <div className="bg-green-50 rounded-2xl border border-green-200 p-4">
            <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">Projected Annual Profit</p>
            <p className="text-2xl font-black text-green-700">${annualProjected.profit.toFixed(0)}</p>
            <p className="text-[10px] text-green-500 mt-1">{annualProjected.revenue > 0 ? ((annualProjected.profit / annualProjected.revenue) * 100).toFixed(1) : 0}% margin</p>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Projected Annual Tax</p>
            <p className="text-2xl font-black text-amber-700">${annualProjected.tax.toFixed(0)}</p>
            <p className="text-[10px] text-amber-500 mt-1">{taxBracketOptions.find(t => t.id === taxBracket)?.rate} effective</p>
          </div>
          <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4">
            <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">Projected Annual COGS</p>
            <p className="text-2xl font-black text-orange-700">${annualProjected.cogs.toFixed(0)}</p>
            <p className="text-[10px] text-orange-500 mt-1">Cost of goods sold</p>
          </div>
        </div>

        {/* Revenue & Profit Chart */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Revenue & Profit (Actual + Projected)</h4>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block" /> Revenue</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block" /> Profit</span>
              <span className="flex items-center gap-1 border-l border-slate-200 pl-3">─── Projected</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.revenue} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.profit} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={COLORS.profit} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `$${v.toFixed(0)}`} />
              <Tooltip content={<CustomTooltip />} />
              {historicalData.length > 0 && (
                <ReferenceLine x={historicalData[historicalData.length - 1]?.month} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Today', position: 'top', fontSize: 9, fill: '#94a3b8' }} />
              )}
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.revenue} fill="url(#revGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="profit" name="Profit" stroke={COLORS.profit} fill="url(#profGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tax Cost Chart */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 mb-6">
          <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Estimated Monthly Tax Burden</h4>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `$${v.toFixed(0)}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tax" name="Est. Tax" fill={COLORS.tax} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tax Savings Tip */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-black mb-1">💡 Tax Planning Tip</p>
            <p className="text-xs text-blue-600">
              Based on your projected annual profit of <strong>${annualProjected.profit.toFixed(0)}</strong>, consider setting aside <strong>${(annualProjected.tax / 12).toFixed(0)}/month</strong> in a dedicated tax savings account. 
              Pay quarterly estimated taxes to avoid penalties (due Jan 15, Apr 15, Jun 15, Sep 15).
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={onClose} className="border-slate-200 text-slate-500">Close</Button>
          <Button onClick={exportProjectionCSV} className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold">
            <Download className="w-4 h-4 mr-2" />
            Export Projection CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}