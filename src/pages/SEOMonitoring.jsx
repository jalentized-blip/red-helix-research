import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, TrendingUp, BarChart3, Target, AlertCircle, CheckCircle } from 'lucide-react';
import SEO from '@/components/SEO';

export default function SEOMonitoring() {
  const [activeTab, setActiveTab] = useState('overview');

  const rankingMetrics = [
    { keyword: 'buy research peptides USA', position: 'Tracking', volume: '450/mo', difficulty: 'High', target: '#5-10' },
    { keyword: 'BPC-157 peptide', position: 'Tracking', volume: '380/mo', difficulty: 'Medium', target: '#3-8' },
    { keyword: 'TB-500 research', position: 'Tracking', volume: '290/mo', difficulty: 'Medium', target: '#3-8' },
    { keyword: 'peptide supplier USA', position: 'Tracking', volume: '520/mo', difficulty: 'Very High', target: '#10-20' },
    { keyword: 'semaglutide research', position: 'Tracking', volume: '1200/mo', difficulty: 'Very High', target: '#15-25' },
    { keyword: 'lab tested peptides', position: 'Tracking', volume: '340/mo', difficulty: 'High', target: '#5-15' },
  ];

  const toolsAndMetrics = [
    {
      category: 'Rank Tracking',
      tools: [
        { name: 'SEMrush', metric: 'Keyword rankings (60+ keywords)', update: 'Daily' },
        { name: 'Ahrefs', metric: 'Organic traffic estimates', update: 'Weekly' },
        { name: 'Google Search Console', metric: 'Impressions & clicks', update: 'Real-time' }
      ]
    },
    {
      category: 'Authority Metrics',
      tools: [
        { name: 'Moz DA Tracker', metric: 'Domain Authority', update: 'Monthly' },
        { name: 'SEMrush Authority Score', metric: 'Overall domain strength', update: 'Weekly' },
        { name: 'Ahrefs Domain Rating', metric: 'Backlink authority', update: 'Weekly' }
      ]
    },
    {
      category: 'Backlink Analysis',
      tools: [
        { name: 'Google Search Console', metric: 'Backlink sources', update: 'Weekly' },
        { name: 'Ahrefs', metric: 'New backlinks (60+ links)', update: 'Daily' },
        { name: 'SEMrush', metric: 'Backlink growth tracking', update: 'Weekly' }
      ]
    },
    {
      category: 'Traffic & Behavior',
      tools: [
        { name: 'Google Analytics 4', metric: 'Organic traffic (target: 500+ sessions/day)', update: 'Real-time' },
        { name: 'Google Search Console', metric: 'Click-through rates (CTR)', update: 'Real-time' },
        { name: 'Hotjar', metric: 'User behavior & heatmaps', update: 'Real-time' }
      ]
    }
  ];

  const monthlyGoals = [
    {
      month: 'February 2026',
      goals: [
        { goal: 'Publish 5-6 guest posts', target: '5-8 backlinks', status: 'In Progress' },
        { goal: 'Secure 10 resource page placements', target: '10+ backlinks', status: 'In Progress' },
        { goal: 'Establish 3 lab partnerships', target: '3 partnership mentions', status: 'Planned' },
        { goal: 'Reach 50+ organic sessions/day', target: 'Baseline growth', status: 'Tracking' },
        { goal: 'Rank for 5 target keywords top-20', target: 'Page 2 ranking', status: 'In Progress' }
      ]
    },
    {
      month: 'March 2026',
      goals: [
        { goal: 'Publish 4-5 more guest posts', target: '4-6 backlinks', status: 'Planned' },
        { goal: 'Reach 100+ organic sessions/day', target: 'Traffic milestone', status: 'Target' },
        { goal: 'Get 3+ keywords on page 1 (positions 10-20)', target: 'SERP breakthrough', status: 'Target' },
        { goal: 'Broken link building campaign', target: '5-10 backlinks', status: 'Planned' },
        { goal: 'Domain Authority 15+', target: 'Authority growth', status: 'Target' }
      ]
    },
    {
      month: 'April 2026',
      goals: [
        { goal: 'Reach 200+ organic sessions/day', target: 'Traffic 4x increase', status: 'Target' },
        { goal: 'Top-5 rankings for 2+ keywords', target: 'Featured snippets', status: 'Target' },
        { goal: 'Domain Authority 20+', target: 'Competitive authority', status: 'Target' },
        { goal: 'Publish additional research guides', target: 'Long-form content', status: 'Target' },
        { goal: 'Secure journalist mentions (3+)', target: 'Media authority', status: 'Target' }
      ]
    }
  ];

  const redFlags = [
    { issue: 'Ranking drop >3 positions', action: 'Review page content, check for technical issues', frequency: 'Weekly' },
    { issue: 'Organic traffic decline >20%', action: 'Audit recent changes, check backlinks', frequency: 'Daily' },
    { issue: 'High bounce rate (>70%)', action: 'Improve page UX, optimize content', frequency: 'Monthly' },
    { issue: 'Low CTR (<3%)', action: 'Improve meta description, test title tags', frequency: 'Monthly' },
    { issue: 'Backlink loss', action: 'Check for removed pages, monitor competitor activity', frequency: 'Weekly' }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO
        title="SEO Monitoring & Analytics Dashboard | Red Helix Research"
        description="Comprehensive SEO monitoring strategy with keyword tracking, backlink analysis, and organic traffic goals."
        keywords="SEO monitoring, keyword tracking, SEO analytics, organic traffic goals"
      />

      <div className="max-w-6xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-slate-200 text-slate-500 hover:text-[#dc2626] hover:border-[#dc2626] mb-8 rounded-full font-bold uppercase tracking-wider text-xs">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight text-slate-900 mb-4">SEO Monitoring Dashboard</h1>
          <p className="text-xl text-slate-600">Real-time tracking of keywords, traffic, and authority metrics</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-12 border-b border-slate-200 pb-4">
          {['overview', 'keywords', 'tools', 'goals'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-all capitalize ${
                activeTab === tab
                  ? 'text-slate-900 border-b-2 border-[#dc2626] -mb-4'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm text-slate-500 font-semibold">Organic Sessions</h3>
                  <TrendingUp className="w-5 h-5 text-[#dc2626]" />
                </div>
                <p className="text-3xl font-black text-slate-900">~50/day</p>
                <p className="text-xs text-slate-500 mt-2">Target: 500+/day by April</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm text-slate-500 font-semibold">Domain Authority</h3>
                  <BarChart3 className="w-5 h-5 text-[#dc2626]" />
                </div>
                <p className="text-3xl font-black text-slate-900">~5-8</p>
                <p className="text-xs text-slate-500 mt-2">Target: 20+ by April</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm text-slate-500 font-semibold">Backlinks</h3>
                  <Target className="w-5 h-5 text-[#dc2626]" />
                </div>
                <p className="text-3xl font-black text-slate-900">~30-40</p>
                <p className="text-xs text-slate-500 mt-2">Target: 100+ by April</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm text-slate-500 font-semibold">Top Ranking</h3>
                  <CheckCircle className="w-5 h-5 text-[#dc2626]" />
                </div>
                <p className="text-3xl font-black text-slate-900">Page 2</p>
                <p className="text-xs text-slate-500 mt-2">Target: Page 1 by March</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-6">Next Actions (Week of Jan 29)</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600"><strong>Submit sitemap.xml</strong> to Google Search Console</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600"><strong>Set up GA4 and GSC</strong> conversion tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600"><strong>Begin HARO responses</strong> (3-5 this week)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600"><strong>Outreach to 10 guest post targets</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600"><strong>Implement internal linking</strong> across all pages</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Keywords */}
        {activeTab === 'keywords' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Keyword</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Position</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Monthly Vol.</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Difficulty</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Target</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {rankingMetrics.map((metric, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-100 transition">
                      <td className="py-3 px-4 text-slate-900">{metric.keyword}</td>
                      <td className="py-3 px-4">{metric.position}</td>
                      <td className="py-3 px-4">{metric.volume}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-bold ${
                          metric.difficulty === 'Very High' ? 'text-red-500' :
                          metric.difficulty === 'High' ? 'text-orange-500' :
                          'text-yellow-500'
                        }`}>
                          {metric.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#dc2626] font-semibold">{metric.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Tools */}
        {activeTab === 'tools' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {toolsAndMetrics.map((section, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6">{section.category}</h3>
                <div className="space-y-4">
                  {section.tools.map((tool, i) => (
                    <div key={i} className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-slate-900">{tool.name}</p>
                        <p className="text-sm text-slate-500">{tool.metric}</p>
                      </div>
                      <span className="text-xs bg-red-50 text-[#dc2626] px-3 py-1 rounded-full font-semibold">{tool.update}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-700 mb-2">Premium Tools Recommended</p>
                <p className="text-sm text-amber-600">
                  SEMrush ($120-240/mo) and Ahrefs ($99-399/mo) are essential for serious SEO monitoring. Free alternatives: Google Search Console + GA4 provide baseline data.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Goals */}
        {activeTab === 'goals' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {monthlyGoals.map((month, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-6">{month.month}</h3>
                <div className="space-y-4">
                  {month.goals.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{item.goal}</p>
                        <p className="text-sm text-slate-500">{item.target}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        item.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                        item.status === 'Planned' ? 'bg-slate-100 text-slate-600' :
                        'bg-red-50 text-[#dc2626]'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">Red Flags & Quick Fixes</h3>
              <div className="space-y-4">
                {redFlags.map((flag, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-slate-900">{flag.issue}</p>
                      <span className="text-xs text-slate-500">Check: {flag.frequency}</span>
                    </div>
                    <p className="text-sm text-slate-600">→ {flag.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
