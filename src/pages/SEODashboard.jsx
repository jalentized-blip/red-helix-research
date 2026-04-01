import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Target, Zap, Search, FileText, Code2,
  RefreshCw, ChevronDown, ChevronRight, CheckCircle2,
  AlertCircle, Clock, BarChart3, Globe, Link2, Play,
  Loader2, Calendar, Award, ArrowUp, Eye, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const IMPACT_COLORS = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-slate-100 text-slate-600',
};

function MetricCard({ label, value, icon: Icon, color = 'text-[#8B2635]', sub }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1 font-medium">{sub}</p>}
    </div>
  );
}

function ActionItem({ item, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className={`border rounded-2xl overflow-hidden ${index === 0 ? 'border-[#8B2635]/30' : 'border-slate-200'}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-4 p-4 text-left ${index === 0 ? 'bg-[#8B2635]/5' : 'bg-white hover:bg-slate-50'} transition-colors`}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 ${index === 0 ? 'bg-[#8B2635]' : 'bg-slate-400'}`}>
          {item.rank || index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm">{item.task}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">{item.category}</span>
            {item.auto_implement && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Auto-Done
              </span>
            )}
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${IMPACT_COLORS[item.expected_impact?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>
              {item.expected_impact} impact
            </span>
          </div>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && item.steps && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {item.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 flex-shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-sm text-slate-600">{step}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KeywordBadge({ keyword, volume }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold rounded-full">
      {keyword}
      {volume && <span className="text-blue-400 font-medium">· {volume}</span>}
    </span>
  );
}

function TabButton({ active, onClick, children, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
        active ? 'bg-[#8B2635] text-white shadow-lg shadow-[#8B2635]/20' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export default function SEODashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRunning, setIsRunning] = useState(false);
  const [runMessage, setRunMessage] = useState('');
  const [expandedReport, setExpandedReport] = useState(null);

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role === 'admin') {
        setIsAdmin(true);
      } else {
        window.location.href = '/';
      }
    }).catch(() => {
      window.location.href = '/';
    }).finally(() => {
      setAuthChecked(true);
    });
  }, []);

  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ['seo-reports'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getSEOReports', {});
      return res.data?.reports || [];
    },
    enabled: isAdmin && authChecked,
  });

  const latest = reports[0] || null;

  const handleManualRun = async () => {
    setIsRunning(true);
    setRunMessage('Starting AI SEO engine... this takes 2-3 minutes. Reports will auto-refresh.');
    
    // Fire and forget — don't await, it will timeout
    base44.functions.invoke('seoOptimizationEngine', {}).then((res) => {
      setRunMessage(`✓ Complete! ${res.data?.metrics?.tactics_identified || 0} tactics found, ${res.data?.metrics?.keywords_found || 0} keywords identified.`);
      setIsRunning(false);
      refetch();
    }).catch((err) => {
      // Timeout or error — poll for results anyway since the engine may still be running
      setRunMessage('Engine running in background... refreshing in 3 minutes.');
      setTimeout(() => {
        refetch();
        setRunMessage('✓ Check results — report may have completed.');
        setIsRunning(false);
      }, 180000);
    });
  };

  if (!authChecked || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B2635]" />
      </div>
    );
  }

  const metrics = latest?.metrics || {};
  const actionPlan = latest?.action_plan || {};
  const trendResearch = latest?.trend_research || {};
  const technicalAudit = latest?.technical_audit || {};
  const contentStrategy = latest?.content_strategy || {};
  const competitorIntel = latest?.competitor_intel || {};
  const schemaMarkup = latest?.schema_markup || {};

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
              SEO <span className="text-[#8B2635]">Intelligence</span>
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              AI-powered daily SEO optimizer — runs every day at 3:00 AM CT
            </p>
          </div>
          <div className="flex items-center gap-3">
            {latest?.date && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500">Last run: {latest.date}</span>
                <span className={`w-2 h-2 rounded-full ${latest.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
              </div>
            )}
            <Button
              onClick={handleManualRun}
              disabled={isRunning}
              className="bg-[#8B2635] hover:bg-[#6B1827] text-white font-black uppercase tracking-wider text-xs"
            >
              {isRunning ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...</>
              ) : (
                <><Play className="w-4 h-4 mr-2" /> Run Now</>
              )}
            </Button>
          </div>
        </div>

        {/* Run status */}
        <AnimatePresence>
          {runMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
                runMessage.startsWith('✓') ? 'bg-green-50 border-green-200' :
                runMessage.startsWith('Error') ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
              }`}
            >
              {isRunning ? <Loader2 className="w-5 h-5 animate-spin text-blue-500 flex-shrink-0 mt-0.5" /> :
               runMessage.startsWith('✓') ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> :
               <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
              <p className="text-sm font-bold text-slate-700">{runMessage}</p>
              {!isRunning && <button onClick={() => setRunMessage('')} className="ml-auto text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>}
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#8B2635]" />
          </div>
        )}

        {!isLoading && !latest && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 mb-2">No Reports Yet</h3>
            <p className="text-slate-500 mb-6">Click "Run Now" to generate your first AI SEO analysis.</p>
            <Button onClick={handleManualRun} disabled={isRunning} className="bg-[#8B2635] text-white font-black uppercase tracking-wider text-xs">
              <Play className="w-4 h-4 mr-2" /> Run First Analysis
            </Button>
          </div>
        )}

        {!isLoading && latest && (
          <>
            {/* Summary Banner */}
            {actionPlan.summary && (
              <div className="bg-gradient-to-r from-[#8B2635] to-[#6B1827] text-white rounded-2xl p-5 mb-6 flex items-start gap-4">
                <Award className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-200" />
                <div className="flex-1">
                  <p className="font-black text-sm uppercase tracking-wider mb-1 text-red-200">Today's Analysis Summary</p>
                  <p className="font-medium text-white/90">{actionPlan.summary}</p>
                  {actionPlan.top_opportunity && (
                    <p className="text-red-200 text-sm mt-2">⭐ Top Opportunity: {actionPlan.top_opportunity}</p>
                  )}
                </div>
                {metrics.estimated_traffic_gain && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-red-300 uppercase font-bold tracking-widest mb-1">Est. Traffic Gain</p>
                    <p className="text-2xl font-black">{metrics.estimated_traffic_gain}</p>
                  </div>
                )}
              </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <MetricCard label="Tactics Found" value={metrics.tactics_identified || 0} icon={Target} />
              <MetricCard label="Keywords Found" value={metrics.keywords_found || 0} icon={Search} color="text-blue-600" />
              <MetricCard label="Auto-Implemented" value={metrics.auto_implementable || 0} icon={Zap} color="text-green-600" />
              <MetricCard label="Reports Run" value={reports.length} icon={BarChart3} color="text-purple-600" sub="Total all time" />
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={TrendingUp}>Overview</TabButton>
              <TabButton active={activeTab === 'actions'} onClick={() => setActiveTab('actions')} icon={Zap}>Action Plan</TabButton>
              <TabButton active={activeTab === 'keywords'} onClick={() => setActiveTab('keywords')} icon={Search}>Keywords</TabButton>
              <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={FileText}>Content</TabButton>
              <TabButton active={activeTab === 'technical'} onClick={() => setActiveTab('technical')} icon={Code2}>Technical</TabButton>
              <TabButton active={activeTab === 'competitors'} onClick={() => setActiveTab('competitors')} icon={Globe}>Competitors</TabButton>
              <TabButton active={activeTab === 'schema'} onClick={() => setActiveTab('schema')} icon={Link2}>Schema</TabButton>
              <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={Clock}>History</TabButton>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Quick Wins */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" /> Quick Wins
                      </h3>
                      <div className="space-y-3">
                        {(trendResearch.quick_wins || []).map((win, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                            <p className="text-sm text-slate-700">{win}</p>
                          </div>
                        ))}
                        {!(trendResearch.quick_wins?.length) && <p className="text-slate-400 text-sm">Run the engine to see quick wins.</p>}
                      </div>
                    </div>

                    {/* Competitor Gaps */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" /> Competitor Gaps
                      </h3>
                      <div className="space-y-3">
                        {(trendResearch.competitor_gaps || []).map((gap, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                            <ArrowUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-700">{gap}</p>
                          </div>
                        ))}
                        {!(trendResearch.competitor_gaps?.length) && <p className="text-slate-400 text-sm">Run the engine to see gaps.</p>}
                      </div>
                    </div>

                    {/* E-E-A-T Signals */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-500" /> E-E-A-T Improvements
                      </h3>
                      <div className="space-y-3">
                        {(technicalAudit.eeat_improvements || []).slice(0, 4).map((item, i) => (
                          <div key={i} className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                            <p className="text-sm font-bold text-slate-900">{item.signal}</p>
                            <p className="text-xs text-slate-500 mt-1">{item.how_to_add}</p>
                            <span className={`mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${IMPACT_COLORS[item.impact?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>
                              {item.impact} impact
                            </span>
                          </div>
                        ))}
                        {!(technicalAudit.eeat_improvements?.length) && <p className="text-slate-400 text-sm">Run the engine to see E-E-A-T suggestions.</p>}
                      </div>
                    </div>

                    {/* Top Tactics */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#8B2635]" /> Top SEO Tactics
                      </h3>
                      <div className="space-y-3">
                        {(trendResearch.tactics || []).slice(0, 4).map((tactic, i) => (
                          <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-bold text-slate-900">{tactic.tactic_name}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${IMPACT_COLORS[tactic.expected_impact?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>
                                {tactic.expected_impact}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tactic.why_it_works}</p>
                          </div>
                        ))}
                        {!(trendResearch.tactics?.length) && <p className="text-slate-400 text-sm">Run the engine to see tactics.</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* ACTION PLAN */}
                {activeTab === 'actions' && (
                  <div className="space-y-3 max-w-3xl">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-slate-500">
                        <span className="font-bold text-green-600">{actionPlan.action_items?.filter(i => i.auto_implement)?.length || 0}</span> auto-implemented •{' '}
                        <span className="font-bold text-yellow-600">{actionPlan.action_items?.filter(i => !i.auto_implement)?.length || 0}</span> need manual action
                      </p>
                    </div>
                    {(actionPlan.action_items || []).map((item, i) => (
                      <ActionItem key={i} item={item} index={i} />
                    ))}
                    {!actionPlan.action_items?.length && (
                      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <p className="text-slate-400">Run the SEO engine to generate today's action plan.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* KEYWORDS */}
                {activeTab === 'keywords' && (
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Trending Keywords to Target</h3>
                      <div className="flex flex-wrap gap-2">
                        {(trendResearch.trending_keywords || []).map((kw, i) => (
                          <KeywordBadge key={i} keyword={kw} />
                        ))}
                        {!trendResearch.trending_keywords?.length && <p className="text-slate-400 text-sm">Run the engine to discover trending keywords.</p>}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Keyword Clusters by Opportunity</h3>
                      <div className="space-y-4">
                        {(technicalAudit.keyword_clusters || []).map((cluster, i) => (
                          <div key={i} className="p-4 border border-slate-200 rounded-xl">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <p className="font-black text-slate-900 text-sm">{cluster.cluster_name}</p>
                                <p className="text-xs text-[#8B2635] font-bold mt-0.5">Primary: {cluster.primary_keyword}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-bold text-slate-500">Volume: <span className="text-slate-900">{cluster.monthly_volume_estimate}</span></p>
                                <p className="text-xs font-bold text-slate-500">Difficulty: <span className="text-slate-900">{cluster.difficulty}</span></p>
                                <p className="text-xs font-bold text-green-600">Score: {cluster.opportunity_score}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {(cluster.secondary_keywords || []).map((kw, j) => (
                                <span key={j} className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{kw}</span>
                              ))}
                            </div>
                            {cluster.recommended_page && (
                              <p className="text-xs text-blue-600 font-bold">→ Target page: {cluster.recommended_page}</p>
                            )}
                          </div>
                        ))}
                        {!technicalAudit.keyword_clusters?.length && <p className="text-slate-400 text-sm">Run the engine to discover keyword clusters.</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* CONTENT */}
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    {/* FAQs */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">AI-Generated FAQ Content</h3>
                      <div className="space-y-4">
                        {(contentStrategy.faq_content || []).map((faq, i) => (
                          <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="p-4 bg-slate-50">
                              <p className="font-bold text-slate-900 text-sm">{faq.question}</p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {(faq.target_keywords || []).map((kw, j) => (
                                  <span key={j} className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{kw}</span>
                                ))}
                                {faq.target_page && <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">→ {faq.target_page}</span>}
                                {faq.search_volume_estimate && <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Vol: {faq.search_volume_estimate}</span>}
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                        ))}
                        {!contentStrategy.faq_content?.length && <p className="text-slate-400 text-sm">Run the engine to generate FAQ content.</p>}
                      </div>
                    </div>

                    {/* People Also Ask */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">People Also Ask — Targeted Answers</h3>
                      <div className="space-y-4">
                        {(contentStrategy.people_also_ask || []).map((item, i) => (
                          <div key={i} className="p-4 border border-slate-200 rounded-xl">
                            <p className="font-bold text-slate-900 text-sm mb-2">❓ {item.question}</p>
                            <p className="text-sm text-slate-600 leading-relaxed mb-2">{item.ideal_answer}</p>
                            {item.target_url && <p className="text-xs text-blue-600 font-bold">→ Add to: {item.target_url}</p>}
                          </div>
                        ))}
                        {!contentStrategy.people_also_ask?.length && <p className="text-slate-400 text-sm">Run the engine to see PAA opportunities.</p>}
                      </div>
                    </div>

                    {/* Meta Descriptions */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Optimized Meta Descriptions</h3>
                      <div className="space-y-4">
                        {(contentStrategy.optimized_meta_descriptions || []).map((meta, i) => (
                          <div key={i} className="p-4 border border-slate-200 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{meta.page}</span>
                              {meta.target_keyword && <span className="text-xs font-bold text-blue-600">🎯 {meta.target_keyword}</span>}
                            </div>
                            {meta.optimized_title && (
                              <div className="mb-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Title</p>
                                <p className="text-sm font-bold text-blue-700">{meta.optimized_title}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</p>
                              <p className="text-sm text-slate-600">{meta.optimized_description}</p>
                            </div>
                          </div>
                        ))}
                        {!contentStrategy.optimized_meta_descriptions?.length && <p className="text-slate-400 text-sm">Run the engine to get meta optimizations.</p>}
                      </div>
                    </div>

                    {/* Internal Links */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Link2 className="w-4 h-4" /> Internal Linking Strategy
                      </h3>
                      <div className="space-y-3">
                        {(contentStrategy.internal_linking || []).map((link, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                            <span className="font-bold text-slate-700 truncate">{link.source_page}</span>
                            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="font-bold text-blue-700 truncate">{link.target_page}</span>
                            <span className="text-slate-400 text-xs hidden md:block truncate">· "{link.anchor_text}"</span>
                          </div>
                        ))}
                        {!contentStrategy.internal_linking?.length && <p className="text-slate-400 text-sm">Run the engine to see internal link recommendations.</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* TECHNICAL */}
                {activeTab === 'technical' && (
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Technical SEO Fixes</h3>
                      <div className="space-y-4">
                        {(technicalAudit.technical_fixes || []).map((fix, i) => (
                          <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="flex items-start gap-3 p-4 bg-slate-50">
                              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${fix.priority === 'high' ? 'text-red-500' : fix.priority === 'medium' ? 'text-yellow-500' : 'text-slate-400'}`} />
                              <div className="flex-1">
                                <p className="font-bold text-slate-900 text-sm">{fix.issue}</p>
                                <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${IMPACT_COLORS[fix.priority?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>
                                  {fix.priority} priority
                                </span>
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="text-sm font-bold text-slate-700 mb-2">Fix:</p>
                              <p className="text-sm text-slate-600 mb-2">{fix.fix}</p>
                              {fix.implementation_code && (
                                <pre className="bg-slate-900 text-green-400 text-xs p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">
                                  {fix.implementation_code}
                                </pre>
                              )}
                            </div>
                          </div>
                        ))}
                        {!technicalAudit.technical_fixes?.length && <p className="text-slate-400 text-sm">Run the engine to get technical fixes.</p>}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Backlink Opportunities</h3>
                      <div className="space-y-3">
                        {(technicalAudit.backlink_opportunities || []).map((opp, i) => (
                          <div key={i} className="p-4 border border-slate-200 rounded-xl">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-bold text-slate-900 text-sm">{opp.source_type}</p>
                              {opp.expected_da && <span className="text-xs font-bold text-purple-600 flex-shrink-0">DA: {opp.expected_da}</span>}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{opp.strategy}</p>
                          </div>
                        ))}
                        {!technicalAudit.backlink_opportunities?.length && <p className="text-slate-400 text-sm">Run the engine to discover backlink opportunities.</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* COMPETITORS */}
                {activeTab === 'competitors' && (
                  <div className="space-y-6">
                    {/* Exploitation Opportunities */}
                    {(competitorIntel.exploitation_opportunities || []).length > 0 && (
                      <div className="bg-gradient-to-r from-[#8B2635]/5 to-transparent border border-[#8B2635]/20 rounded-2xl p-6">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Target className="w-4 h-4 text-[#8B2635]" /> Top Exploitation Opportunities
                        </h3>
                        <div className="space-y-3">
                          {competitorIntel.exploitation_opportunities.map((opp, i) => (
                            <div key={i} className="p-4 bg-white border border-[#8B2635]/20 rounded-xl">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-bold text-slate-900 text-sm">{opp.opportunity}</p>
                                {opp.urgency && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${opp.urgency === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{opp.urgency}</span>}
                              </div>
                              {opp.keyword && <p className="text-xs text-blue-600 font-bold mt-1">Keyword: {opp.keyword}</p>}
                              {opp.content_angle && <p className="text-xs text-slate-500 mt-1">{opp.content_angle}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Competitor breakdown */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {(competitorIntel.competitors || []).map((comp, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5">
                          <h4 className="font-black text-slate-900 text-sm mb-3 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-slate-400" /> {comp.name}
                          </h4>
                          {comp.top_keywords?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Their Top Keywords</p>
                              <div className="flex flex-wrap gap-1">
                                {comp.top_keywords.map((kw, j) => (
                                  <span key={j} className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-700 rounded-full">{kw}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {comp.content_gaps?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Content Gaps</p>
                              <ul className="space-y-1">
                                {comp.content_gaps.slice(0, 3).map((gap, j) => (
                                  <li key={j} className="text-xs text-slate-600 flex items-start gap-1.5">
                                    <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>{gap}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {comp.weaknesses?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Weaknesses</p>
                              <ul className="space-y-1">
                                {comp.weaknesses.slice(0, 3).map((w, j) => (
                                  <li key={j} className="text-xs text-slate-600 flex items-start gap-1.5">
                                    <span className="text-yellow-500 flex-shrink-0 mt-0.5">⚡</span>{w}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                      {!competitorIntel.competitors?.length && (
                        <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-200">
                          <p className="text-slate-400">Run the engine to see competitor intelligence.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SCHEMA */}
                {activeTab === 'schema' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                      <Code2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">These schema markup blocks are AI-generated and ready to paste into your pages. Copy each JSON-LD block into a script tag with type="application/ld+json".</p>
                    </div>
                    {(schemaMarkup.schemas || []).map((schema, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="p-4 bg-slate-50 flex items-start justify-between gap-4">
                          <div>
                            <p className="font-black text-slate-900 text-sm">{schema.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{schema.type}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">→ {schema.target_page}</span>
                            </div>
                            {schema.expected_rich_result && <p className="text-xs text-green-600 font-bold mt-1">✨ {schema.expected_rich_result}</p>}
                          </div>
                          <button
                            onClick={() => { navigator.clipboard.writeText(schema.json_ld || ''); }}
                            className="text-xs font-bold text-slate-500 hover:text-[#8B2635] px-3 py-1.5 border border-slate-200 rounded-lg hover:border-[#8B2635]/30 transition-all flex-shrink-0"
                          >
                            Copy
                          </button>
                        </div>
                        <pre className="p-4 bg-slate-900 text-green-400 text-xs overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
                          {schema.json_ld}
                        </pre>
                      </div>
                    ))}
                    {!schemaMarkup.schemas?.length && (
                      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <p className="text-slate-400">Run the engine to generate schema markup blocks.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* HISTORY */}
                {activeTab === 'history' && (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div key={report.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                          className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors"
                        >
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${report.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <div className="flex-1">
                            <p className="font-bold text-slate-900">{report.date}</p>
                            <p className="text-xs text-slate-400">{report.metrics?.tactics_identified} tactics · {report.metrics?.keywords_found} keywords · {report.run_type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">{report.metrics?.estimated_traffic_gain || '—'}</p>
                            <p className="text-xs text-slate-400">est. traffic gain</p>
                          </div>
                          {expandedReport === report.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>
                        {expandedReport === report.id && (
                          <div className="border-t border-slate-100 p-4">
                            <p className="text-sm text-slate-600">{report.action_plan?.summary || 'No summary available'}</p>
                            {report.action_plan?.top_opportunity && (
                              <p className="text-xs text-[#8B2635] font-bold mt-2">⭐ {report.action_plan.top_opportunity}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {!reports.length && <p className="text-center text-slate-400 py-12">No reports yet. Run the engine to get started.</p>}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}