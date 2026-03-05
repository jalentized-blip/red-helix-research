import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Brain, AlertTriangle, TrendingUp, ShoppingCart, ChevronDown, ChevronUp, Loader2, RefreshCw, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InventoryAI({ products, orders }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const runAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);

    // Build a compact summary for the LLM
    const productSummary = products.filter(p => !p.is_deleted).map(p => {
      const specs = (p.specifications || []).map(s => ({
        name: s.name,
        stock: s.stock_quantity === -1 ? 'unlimited' : (s.stock_quantity ?? 0),
        in_stock: s.in_stock,
      }));
      return { id: p.id, name: p.name, category: p.category, specs };
    });

    // Aggregate sales per product/spec over last 90 days
    const now = Date.now();
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
    const recentOrders = orders.filter(o =>
      ['processing', 'shipped', 'delivered'].includes(o.status) &&
      new Date(o.created_date).getTime() >= ninetyDaysAgo
    );

    const salesMap = {}; // "ProductName::SpecName" -> qty
    for (const order of recentOrders) {
      for (const item of (order.items || [])) {
        const key = `${item.productName || item.product_name || 'Unknown'}::${item.specification || ''}`;
        salesMap[key] = (salesMap[key] || 0) + (item.quantity || 1);
      }
    }

    const salesSummary = Object.entries(salesMap).map(([key, qty]) => {
      const [product, spec] = key.split('::');
      return { product, spec, units_sold_90d: qty };
    }).sort((a, b) => b.units_sold_90d - a.units_sold_90d);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an inventory management AI for a peptide research company.

Analyze the following product inventory and sales data and provide:
1. Low-stock alerts for any spec with < 20 units AND significant recent sales
2. Reorder suggestions with recommended quantities based on 90-day sales velocity
3. Demand predictions for the next 30 days per top product

Current inventory:
${JSON.stringify(productSummary, null, 2)}

Sales in last 90 days:
${JSON.stringify(salesSummary, null, 2)}

Today's date: ${new Date().toISOString().split('T')[0]}

Be practical and actionable. If stock_quantity is "unlimited" or -1, skip that spec for reorder suggestions.`,
        response_json_schema: {
          type: 'object',
          properties: {
            low_stock_alerts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string' },
                  spec: { type: 'string' },
                  current_stock: { type: 'number' },
                  units_sold_90d: { type: 'number' },
                  urgency: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
            reorder_suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string' },
                  spec: { type: 'string' },
                  recommended_reorder_qty: { type: 'number' },
                  reason: { type: 'string' },
                },
              },
            },
            demand_forecast: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string' },
                  predicted_units_30d: { type: 'number' },
                  trend: { type: 'string' },
                  note: { type: 'string' },
                },
              },
            },
            summary: { type: 'string' },
          },
        },
      });
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const urgencyColor = (urgency) => {
    if (urgency === 'critical') return 'bg-red-50 border-red-200 text-red-700';
    if (urgency === 'high') return 'bg-orange-50 border-orange-200 text-orange-700';
    return 'bg-amber-50 border-amber-200 text-amber-700';
  };

  const trendColor = (trend) => {
    if (trend === 'increasing') return 'text-green-600';
    if (trend === 'decreasing') return 'text-red-500';
    return 'text-slate-500';
  };

  return (
    <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden mb-8">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-slate-100 hover:from-violet-100 hover:to-indigo-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-black text-slate-900 text-sm tracking-tight">AI Inventory Intelligence</p>
            <p className="text-[10px] text-slate-400 font-medium">Demand forecasting · Low-stock alerts · Reorder suggestions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {analysis && (
            <span className="text-[10px] text-violet-600 font-black uppercase tracking-widest bg-violet-100 px-2 py-1 rounded-full">
              {analysis.low_stock_alerts?.length || 0} alerts
            </span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {!analysis && !loading && (
                <div className="text-center py-8">
                  <Brain className="w-10 h-10 text-violet-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium mb-4">
                    Analyze your sales data to get AI-powered inventory predictions, low-stock alerts, and reorder recommendations.
                  </p>
                  <Button
                    onClick={runAnalysis}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-bold uppercase tracking-widest text-xs px-6 rounded-full"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Run AI Analysis
                  </Button>
                </div>
              )}

              {loading && (
                <div className="text-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-3" />
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Analyzing sales data & inventory...</p>
                </div>
              )}

              {analysis && !loading && (
                <div className="space-y-6">
                  {/* Summary */}
                  {analysis.summary && (
                    <div className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3 text-sm text-violet-800 font-medium">
                      <span className="font-black">AI Summary: </span>{analysis.summary}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Low Stock Alerts */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Low Stock Alerts</h4>
                        <span className="text-[10px] bg-orange-100 text-orange-600 font-black px-1.5 py-0.5 rounded-full">
                          {analysis.low_stock_alerts?.length || 0}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {!analysis.low_stock_alerts?.length && (
                          <p className="text-slate-400 text-xs text-center py-4 bg-slate-50 rounded-xl">No low-stock issues detected ✓</p>
                        )}
                        {analysis.low_stock_alerts?.map((alert, i) => (
                          <div key={i} className={`rounded-xl border p-3 text-xs ${urgencyColor(alert.urgency)}`}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-black">{alert.product}</p>
                              <span className="uppercase font-black text-[9px] tracking-widest opacity-70">{alert.urgency}</span>
                            </div>
                            {alert.spec && <p className="opacity-70 font-medium mb-1">{alert.spec}</p>}
                            <p className="opacity-80">{alert.message}</p>
                            {alert.units_sold_90d > 0 && (
                              <p className="mt-1 font-bold opacity-60">{alert.units_sold_90d} sold in 90 days · {alert.current_stock} left</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reorder Suggestions */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ShoppingCart className="w-4 h-4 text-blue-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reorder Suggestions</h4>
                      </div>
                      <div className="space-y-2">
                        {!analysis.reorder_suggestions?.length && (
                          <p className="text-slate-400 text-xs text-center py-4 bg-slate-50 rounded-xl">No reorders needed right now</p>
                        )}
                        {analysis.reorder_suggestions?.map((r, i) => (
                          <div key={i} className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-black text-blue-800">{r.product}</p>
                              <span className="font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full text-[10px]">
                                +{r.recommended_reorder_qty} units
                              </span>
                            </div>
                            {r.spec && <p className="text-blue-600 font-medium mb-1">{r.spec}</p>}
                            <p className="text-blue-700 opacity-80">{r.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Demand Forecast */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">30-Day Forecast</h4>
                      </div>
                      <div className="space-y-2">
                        {!analysis.demand_forecast?.length && (
                          <p className="text-slate-400 text-xs text-center py-4 bg-slate-50 rounded-xl">Not enough data to forecast</p>
                        )}
                        {analysis.demand_forecast?.map((f, i) => (
                          <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-black text-slate-800">{f.product}</p>
                              <span className={`font-black text-[10px] uppercase tracking-widest ${trendColor(f.trend)}`}>
                                {f.trend}
                              </span>
                            </div>
                            <p className="text-slate-600 font-bold mb-0.5">
                              ~{f.predicted_units_30d} units predicted
                            </p>
                            {f.note && <p className="text-slate-400">{f.note}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Re-run button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={runAnalysis}
                      variant="outline"
                      size="sm"
                      className="border-violet-200 text-violet-600 hover:bg-violet-50 text-xs font-bold rounded-full"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Re-run Analysis
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}