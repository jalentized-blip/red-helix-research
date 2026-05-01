import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  ArrowLeft, Zap, RefreshCw, CheckCircle2, AlertCircle, Clock,
  TrendingUp, FileText, Link2, Target, Search, ChevronDown, ChevronUp,
  Play, Power, BarChart3, Lightbulb, Globe, Shield
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-700 border-green-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
};

const CATEGORY_ICONS = {
  content: FileText,
  technical: Shield,
  links: Link2,
  'on-page': Search,
  competitor: Target,
};

const IMPACT_COLORS = {
  high: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low: 'text-slate-500 bg-slate-50 border-slate-200',
};

function CollapsibleSection({ title, icon: Icon, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-[#8B2635]" />
          <span className="font-black text-slate-900 uppercase tracking-wide text-sm">{title}</span>
          {count !== undefined && (
            <span className="text-xs bg-[#8B2635] text-white rounded-full px-2 py-0.5 font-bold">{count}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReportCard({ report, isLatest }) {
  const ap = report.action_plan || {};
  const tr = report.trend_research || {};
  const cs = report.content_strategy || {};
  const ta = report.technical_audit || {};
  const ci = report.competitor_intel || {};
  const m = report.metrics || {};

  return (
    <div className={`space-y-4 ${isLatest ? '' : 'opacity-80'}`}>
      {/* Summary */}
      {ap.summary && (
        <div className="bg-gradient-to-br from-slate-900 to-[#3a0f18] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <span className="font-black uppercase tracking-wide text-sm text-yellow-400">Strategic Summary</span>
          </div>
          <p className="text-slate-200 leading-relaxed">{ap.summary}</p>
          {ap.top_opportunity && (
            <div className="mt-4 bg-white/10 rounded-xl p-4 border border-white/20">
              <p className="text-xs font-black uppercase tracking-widest text-yellow-300 mb-1">🎯 Top Opportunity Today</p>
              <p className="text-white font-semibold">{ap.top_opportunity}</p>
            </div>
          )}
        </div>
      )}

      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tactics Found', value: m.tactics_identified || (tr.tactics || []).length, icon: Zap },
          { label: 'Keywords', value: m.keywords_found || (tr.trending_keywords || []).length, icon: Search },
          { label: 'Auto-Implementable', value: m.auto_implementable || 0, icon: CheckCircle2 },
          { label: 'Traffic Gain Est.', value: m.estimated_traffic_gain || '+15-30%', icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-[#8B2635]" />
              <span className="text-xs text-slate-500 font-semibold">{label}</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Action Plan */}
      {(ap.action_items || []).length > 0 && (
        <CollapsibleSection title="Action Plan" icon={Target} count={(ap.action_items || []).length} defaultOpen={isLatest}>
          <div className="space-y-3">
            {(ap.action_items || []).map((item, i) => {
              const CatIcon = CATEGORY_ICONS[item.category?.toLowerCase()] || FileText;
              return (
                <div key={i} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-6 h-6 rounded-full bg-[#8B2635] text-white text-xs font-black flex items-center justify-center flex-shrink-0">{item.rank}</span>
                      <p className="font-bold text-slate-900">{item.task}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${IMPACT_COLORS[item.expected_impact?.toLowerCase()] || IMPACT_COLORS.low}`}>
                        {item.expected_impact}
                      </span>
                      {item.auto_implement && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Auto</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><CatIcon className="w-3 h-3" />{item.category}</span>
                    {item.time_to_implement && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.time_to_implement}</span>}
                  </div>
                  {(item.steps || []).length > 0 && (
                    <ol className="space-y-1">
                      {item.steps.map((step, si) => (
                        <li key={si} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-[#8B2635] font-bold flex-shrink-0">{si + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Trending Keywords & Quick Wins */}
      {((tr.trending_keywords || []).length > 0 || (tr.quick_wins || []).length > 0) && (
        <CollapsibleSection title="Trend Research" icon={TrendingUp} count={(tr.tactics || []).length}>
          <div className="grid md:grid-cols-2 gap-6">
            {(tr.trending_keywords || []).length > 0 && (
              <div>
                <p className="font-black text-xs uppercase tracking-widest text-slate-500 mb-3">Trending Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {tr.trending_keywords.map((kw, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 font-medium">{kw}</span>
                  ))}
                </div>
              </div>
            )}
            {(tr.quick_wins || []).length > 0 && (
              <div>
                <p className="font-black text-xs uppercase tracking-widest text-slate-500 mb-3">Quick Wins</p>
                <ul className="space-y-2">
                  {tr.quick_wins.map((win, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {win}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {(tr.competitor_gaps || []).length > 0 && (
            <div className="mt-4">
              <p className="font-black text-xs uppercase tracking-widest text-slate-500 mb-3">Competitor Gaps</p>
              <ul className="space-y-2">
                {tr.competitor_gaps.map((gap, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <Target className="w-4 h-4 text-[#8B2635] flex-shrink-0 mt-0.5" />
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Content Strategy */}
      {(cs.faq_content || cs.optimized_meta_descriptions || []).length > 0 && (
        <CollapsibleSection title="Content Strategy" icon={FileText} count={(cs.faq_content || []).length + (cs.optimized_meta_descriptions || []).length}>
          {(cs.optimized_meta_descriptions || []).length > 0 && (
            <div className="mb-6">
              <p className="font-black text-xs uppercase tracking-widest text-slate-500 mb-3">Optimized Meta Tags</p>
              <div className="space-y-3">
                {cs.optimized_meta_descriptions.map((m, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-xs text-[#8B2635] font-bold mb-1">{m.page} — {m.target_keyword}</p>
                    <p className="font-bold text-slate-900 text-sm mb-1">{m.optimized_title}</p>
                    <p className="text-slate-600 text-sm">{m.optimized_description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(cs.faq_content || []).length > 0 && (
            <div>
              <p className="font-black text-xs uppercase tracking-widest text-slate-500 mb-3">FAQ Content ({(cs.faq_content || []).length} items)</p>
              <div className="space-y-3">
                {(cs.faq_content || []).slice(0, 5).map((faq, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="font-bold text-slate-900 text-sm mb-1 flex items-start gap-2">
                      <span className="text-[#8B2635]">Q:</span>{faq.question}
                    </p>
                    <p className="text-slate-600 text-sm">{faq.answer}</p>
                    {faq.target_page && <p className="text-xs text-slate-400 mt-1">→ {faq.target_page}</p>}
                  </div>
                ))}
                {(cs.faq_content || []).length > 5 && (
                  <p className="text-xs text-slate-400 text-center">+{(cs.faq_content || []).length - 5} more FAQ items</p>
                )}
              </div>
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Technical Audit */}
      {(ta.technical_fixes || ta.keyword_clusters || []).length > 0 && (
        <CollapsibleSection title="Technical Audit" icon={Shield} count={(ta.technical_fixes || []).length}>
          {(ta.technical_fixes || []).length > 0 && (
            <div className="mb-6">
              <p className="font-black text-xs uppercase tracking-widest text-slate-500 mb-3">Technical Fixes</p>
              <div className="space-y-3">
                {(ta.technical_fixes || []).map((fix, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${fix.priority === 'high' ? 'text-red-500' : fix.priority === 'medium' ? 'text-yellow-500' : 'text-slate-400'}`} />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{fix.issue}</p>
                      <p className="text-slate-600 text-sm">{fix.fix}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${IMPACT_COLORS[fix.priority?.toLowerCase()] || IMPACT_COLORS.low}`}>{fix.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(ta.keyword_clusters || []).length > 0 && (
            <div>
              <p className="font-black text-xs uppercase tracking-widest text-slate-500 mb-3">Keyword Clusters</p>
              <div className="space-y-3">
                {(ta.keyword_clusters || []).map((cluster, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-slate-900 text-sm">{cluster.cluster_name}</p>
                      <span className="text-xs text-[#8B2635] font-bold">{cluster.opportunity_score}</span>
                    </div>
                    <p className="text-sm text-[#8B2635] font-semibold mb-1">{cluster.primary_keyword}</p>
                    <div className="flex flex-wrap gap-1">
                      {(cluster.secondary_keywords || []).map((kw, ki) => (
                        <span key={ki} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{kw}</span>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      <span>Vol: {cluster.monthly_volume_estimate}</span>
                      <span>Difficulty: {cluster.difficulty}</span>
                      {cluster.recommended_page && <span>→ {cluster.recommended_page}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Competitor Intel */}
      {(ci.competitors || []).length > 0 && (
        <CollapsibleSection title="Competitor Intelligence" icon={Globe} count={(ci.exploitation_opportunities || []).length}>
          {(ci.exploitation_opportunities || []).length > 0 && (
            <div className="mb-6">
              <p className="font-black text-xs uppercase tracking-widest text-slate-500 mb-3">Exploitation Opportunities</p>
              <div className="space-y-3">
                {ci.exploitation_opportunities.map((opp, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-slate-900 text-sm">{opp.opportunity}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${opp.urgency === 'High' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>{opp.urgency}</span>
                    </div>
                    <p className="text-xs text-[#8B2635] font-semibold">{opp.keyword}</p>
                    {opp.content_angle && <p className="text-sm text-slate-600 mt-1">{opp.content_angle}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            {ci.competitors.map((comp, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-4">
                <p className="font-black text-slate-900 mb-2">{comp.name}</p>
                {(comp.weaknesses || []).length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-1">Weaknesses:</p>
                    <ul className="space-y-1">
                      {comp.weaknesses.slice(0, 3).map((w, wi) => (
                        <li key={wi} className="text-xs text-slate-600 flex items-start gap-1">
                          <span className="text-green-500">✓</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

export default function SEOMonitoring() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [error, setError] = useState(null);
  const [automationActive] = useState(false); // read-only display from automation list

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('getSEOReports', {});
      const data = res.data;
      const list = data.reports || [];
      setReports(list);
      if (list.length > 0) setSelectedReport(list[0]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const runNow = async () => {
    setRunning(true);
    setError(null);
    try {
      await base44.functions.invoke('seoOptimizationEngine', {});
      await loadReports();
    } catch (e) {
      setError(e.message || 'Run failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="mb-6 text-xs font-bold uppercase tracking-wider rounded-full">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-black uppercase tracking-widest text-[#8B2635] mb-2">Powered by Gemini 2.5 Flash</p>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900">SEO Command Center</h1>
            <p className="text-slate-500 mt-2">AI-generated daily SEO reports — trends, content, technical audits, competitor intel</p>
          </motion.div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${automationActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
              <Power className="w-3 h-3" />
              Daily Auto: {automationActive ? 'ON' : 'OFF'}
            </div>
            <Button onClick={loadReports} variant="outline" size="sm" disabled={loading} className="rounded-full text-xs font-bold uppercase tracking-wider">
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={runNow} disabled={running || loading} size="sm" className="rounded-full text-xs font-bold uppercase tracking-wider">
              {running ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
              {running ? 'Generating...' : 'Run Now'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {running && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="font-black text-blue-700 text-lg">Gemini 2.5 Flash is analyzing your SEO...</p>
            <p className="text-blue-500 text-sm mt-1">This takes 30–60 seconds. Researching trends, competitors, content gaps...</p>
          </div>
        )}

        {loading && !running && (
          <div className="text-center py-20">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-500">Loading SEO reports...</p>
          </div>
        )}

        {!loading && reports.length === 0 && !running && (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-900 mb-2">No Reports Yet</h2>
            <p className="text-slate-500 mb-6">Run the SEO engine to generate your first AI-powered SEO report.</p>
            <Button onClick={runNow} disabled={running}>
              <Play className="w-4 h-4 mr-2" /> Generate First Report
            </Button>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="flex gap-6">
            {/* Sidebar: report list */}
            <div className="w-48 flex-shrink-0">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Reports ({reports.length})</p>
              <div className="space-y-2">
                {reports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReport(r)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all text-xs ${
                      selectedReport?.id === r.id
                        ? 'bg-[#8B2635] text-white border-[#8B2635]'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-[#8B2635]/40'
                    }`}
                  >
                    <p className="font-black">{r.date}</p>
                    <p className={`text-[10px] mt-0.5 capitalize ${selectedReport?.id === r.id ? 'text-red-200' : 'text-slate-400'}`}>
                      {r.run_type} · {r.status}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {selectedReport && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-black text-slate-900">{selectedReport.date}</h2>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${STATUS_COLORS[selectedReport.status] || ''}`}>
                      {selectedReport.status}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">{selectedReport.run_type} run</span>
                  </div>

                  {selectedReport.status === 'failed' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700 font-semibold">This report failed to generate. Try running a new one.</p>
                    </div>
                  )}

                  {selectedReport.status === 'completed' && (
                    <ReportCard report={selectedReport} isLatest={selectedReport.id === reports[0]?.id} />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}