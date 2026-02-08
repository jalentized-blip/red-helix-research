import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, BarChart3, AlertTriangle, Zap } from 'lucide-react';
import SEO from '@/components/SEO';

export default function MonitoringSetup() {
  const monitoringTools = [
    {
      category: 'Performance Monitoring',
      tools: [
        {
          name: 'Google Analytics 4',
          purpose: 'User behavior, conversion tracking, traffic sources',
          setup: 'Install gtag.js, configure conversion goals, create dashboards',
          alerts: ['High bounce rate', 'Low conversion rate', 'Traffic drop'],
          cost: 'Free'
        },
        {
          name: 'PageSpeed Insights',
          purpose: 'Website performance, Core Web Vitals',
          setup: 'Regular manual checks + scheduled testing',
          alerts: ['LCP >2.5s', 'CLS >0.1', 'FID >100ms'],
          cost: 'Free'
        },
        {
          name: 'Lighthouse CI',
          purpose: 'Automated performance testing',
          setup: 'Configure in CI/CD pipeline, set thresholds',
          alerts: 'Performance score < 80',
          cost: 'Free'
        }
      ]
    },
    {
      category: 'Error & Exception Tracking',
      tools: [
        {
          name: 'Sentry',
          purpose: 'Real-time error tracking, exception monitoring',
          setup: 'Install @sentry/react, configure DSN, set release tracking',
          alerts: ['New error type', 'Error spike', 'Critical errors'],
          cost: '$20-100/month'
        },
        {
          name: 'LogRocket',
          purpose: 'Session replay, error context, performance issues',
          setup: 'Install SDK, configure privacy rules',
          alerts: ['Session with errors', 'Performance degradation'],
          cost: '$99+/month'
        }
      ]
    },
    {
      category: 'Uptime & Status',
      tools: [
        {
          name: 'Uptime Robot',
          purpose: 'Monitor site availability, downtime alerts',
          setup: 'Add monitor for redhelixresearch.com, set check interval to 5min',
          alerts: ['Site down', 'Status code != 200'],
          cost: 'Free (up to 50 monitors)'
        },
        {
          name: 'Status Page (Statuspage.io)',
          purpose: 'Public status page for customers',
          setup: 'Create page, link to Uptime Robot, post updates',
          alerts: 'Automatic when monitoring detects outage',
          cost: 'Free - $50/month'
        }
      ]
    },
    {
      category: 'Business Metrics',
      tools: [
        {
          name: 'Custom Dashboard',
          purpose: 'Order volume, revenue, customer metrics',
          setup: 'Create dashboard querying Base44 API for real-time data',
          alerts: ['Revenue < $X', 'Order count anomaly'],
          cost: 'Development time'
        },
        {
          name: 'Email Alerts',
          purpose: 'Critical metrics sent daily',
          setup: 'Scheduled function sending daily summary',
          alerts: 'Daily 9am email with KPIs',
          cost: 'Included in automation'
        }
      ]
    }
  ];

  const kpiTargets = [
    {
      metric: 'Site Uptime',
      target: '99.9%',
      check: 'Hourly',
      alert: '< 99%'
    },
    {
      metric: 'Page Load Time',
      target: '< 2 seconds',
      check: 'Every 5 min',
      alert: '> 3 seconds'
    },
    {
      metric: 'Error Rate',
      target: '< 0.5%',
      check: 'Real-time',
      alert: '> 1%'
    },
    {
      metric: 'Conversion Rate',
      target: '3-5%',
      check: 'Daily',
      alert: '< 2%'
    },
    {
      metric: 'Cart Abandonment',
      target: '< 70%',
      check: 'Daily',
      alert: '> 75%'
    },
    {
      metric: 'Customer Response',
      target: '< 4 hours',
      check: 'Real-time',
      alert: '> 8 hours'
    },
    {
      metric: 'Payment Success',
      target: '> 99%',
      check: 'Real-time',
      alert: '< 95%'
    },
    {
      metric: 'Email Open Rate',
      target: '25-35%',
      check: 'Daily',
      alert: '< 15%'
    }
  ];

  const alertStrategy = [
    {
      severity: 'CRITICAL',
      examples: ['Site down', 'Payment failing', 'Security breach'],
      action: 'Immediate notification + auto-escalation',
      contact: 'All team members'
    },
    {
      severity: 'HIGH',
      examples: ['High error rate', 'Traffic spike', 'Performance degradation'],
      action: 'Email + Slack notification within 15 min',
      contact: 'Dev team lead'
    },
    {
      severity: 'MEDIUM',
      examples: ['Conversion rate drop', 'Email bounce', 'Cart abandonment spike'],
      action: 'Daily summary email',
      contact: 'Management'
    },
    {
      severity: 'LOW',
      examples: ['Scheduled maintenance', 'New feature deployed', 'Analytics updated'],
      action: 'Weekly digest',
      contact: 'Team'
    }
  ];

  const dashboardSetup = [
    {
      section: 'Real-Time Status',
      metrics: [
        'Site uptime status',
        'Current user count',
        'API response time',
        'Error rate (last 1 hour)',
        'Active customer support tickets'
      ]
    },
    {
      section: 'Sales & Conversions',
      metrics: [
        'Orders in last 24 hours',
        'Revenue (MTD)',
        'Conversion rate',
        'Average order value',
        'Top selling products'
      ]
    },
    {
      section: 'Customer Health',
      metrics: [
        'New signups',
        'Active users (30 day)',
        'Email subscription rate',
        'Support tickets pending',
        'Customer satisfaction score'
      ]
    },
    {
      section: 'Technical Health',
      metrics: [
        'Page load time',
        'Core Web Vitals',
        'Error count',
        'Database performance',
        'API availability'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO
        title="Monitoring & Analytics Setup | Red Helix Research Admin"
        description="Production monitoring setup, KPI tracking, alert configuration, and dashboard creation."
        keywords="monitoring, analytics, kpi, dashboard, alerts"
      />

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link to={createPageUrl('ResourceHub')}>
            <Button variant="outline" className="border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-600 mb-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Resources
            </Button>
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter uppercase leading-none">
              Monitoring <span className="text-red-600">& Analytics</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl">
              Production monitoring infrastructure and KPI tracking systems.
            </p>
          </motion.div>
        </div>

        {/* Monitoring Tools Grid */}
        <div className="space-y-12 mb-20">
          {monitoringTools.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter flex items-center gap-3">
                <div className="w-8 h-1 bg-red-600" />
                {category.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tools.map((tool, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-black text-slate-900 text-xl tracking-tight">{tool.name}</h3>
                      <span className="text-[10px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase tracking-wider">{tool.cost}</span>
                    </div>
                    <p className="text-slate-500 mb-6 font-medium text-sm leading-relaxed">{tool.purpose}</p>

                    <div className="grid gap-4 text-sm border-t border-slate-200 pt-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Setup</p>
                        <p className="text-slate-600 font-medium">{tool.setup}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Key Alerts</p>
                        <ul className="text-slate-600 font-medium space-y-1">
                          {Array.isArray(tool.alerts) ? tool.alerts.map((alert, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-red-600 rounded-full" />
                              {alert}
                            </li>
                          )) : (
                            <li className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-red-600 rounded-full" />
                              {tool.alerts}
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* KPI Targets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 bg-slate-900 rounded-[40px] p-10 md:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -mr-20 -mt-20" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
              <BarChart3 className="w-8 h-8 text-red-600" />
              Performance KPIs
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiTargets.map((kpi, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{kpi.metric}</div>
                  <div className="text-3xl font-black text-white mb-4 tracking-tighter">{kpi.target}</div>
                  <div className="flex justify-between items-end border-t border-white/10 pt-4">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Check</div>
                      <div className="text-xs font-bold text-slate-300">{kpi.check}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Alert</div>
                      <div className="text-xs font-bold text-red-400">{kpi.alert}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Alert Strategy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Alert Response Strategy
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {alertStrategy.map((alert, idx) => (
              <div key={idx} className={`border rounded-[32px] p-8 ${
                alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-200' : 
                'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    alert.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 
                    'bg-slate-100 text-slate-900'
                  }`}>
                    {alert.severity}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Examples</p>
                    <ul className="text-sm font-bold text-slate-700 space-y-1">
                      {alert.examples.map((ex, i) => (
                        <li key={i}>• {ex}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Action</p>
                    <p className="text-xs font-bold text-slate-900 leading-relaxed">{alert.action}</p>
                  </div>
                   <div className="pt-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                    <p className="text-xs font-bold text-slate-900">{alert.contact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dashboard Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-200 rounded-[40px] p-10 md:p-12 shadow-xl shadow-slate-200/50"
        >
          <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tighter">
            <Zap className="w-6 h-6 text-red-600" />
            Executive Dashboard Components
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dashboardSetup.map((dashboard, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:shadow-md transition-all">
                <h3 className="font-black text-slate-900 mb-6 text-lg tracking-tight uppercase">{dashboard.section}</h3>
                <ul className="space-y-3">
                  {dashboard.metrics.map((metric, i) => (
                    <li key={i} className="text-slate-600 font-medium flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}