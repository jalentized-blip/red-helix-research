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
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Monitoring & Analytics Setup | Red Helix Research Admin"
        description="Production monitoring setup, KPI tracking, alert configuration, and dashboard creation."
        keywords="monitoring, analytics, KPI, alerts, dashboard"
      />

      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">Monitoring & Analytics Setup</h1>
          <p className="text-xl text-stone-300">Production monitoring, KPIs, alerts, and dashboards</p>
        </motion.div>

        {/* Monitoring Tools */}
        <div className="space-y-8 mb-12">
          {monitoringTools.map((category, catIdx) => (
            <motion.div
              key={catIdx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.05 }}
              viewport={{ once: true }}
              className="bg-stone-900/60 border border-stone-700 rounded-lg p-8"
            >
              <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                {category.category}
              </h2>

              <div className="space-y-6">
                {category.tools.map((tool, idx) => (
                  <div key={idx} className="border border-stone-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-amber-50 text-lg">{tool.name}</h3>
                      <span className="text-xs font-bold text-red-600">{tool.cost}</span>
                    </div>
                    <p className="text-stone-300 mb-4">{tool.purpose}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-stone-400 font-semibold mb-2">Setup:</p>
                        <p className="text-stone-300">{tool.setup}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 font-semibold mb-2">Key Alerts:</p>
                        <ul className="text-stone-300 space-y-1">
                          {Array.isArray(tool.alerts) ? tool.alerts.map((alert, i) => (
                            <li key={i}>• {alert}</li>
                          )) : <li>• {tool.alerts}</li>}
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
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-12 overflow-x-auto"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">KPI Targets & Alerts</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-700">
                <th className="text-left py-3 px-4 text-amber-50 font-bold">Metric</th>
                <th className="text-left py-3 px-4 text-amber-50 font-bold">Target</th>
                <th className="text-left py-3 px-4 text-amber-50 font-bold">Check Frequency</th>
                <th className="text-left py-3 px-4 text-amber-50 font-bold">Alert Threshold</th>
              </tr>
            </thead>
            <tbody className="text-stone-300">
              {kpiTargets.map((kpi, idx) => (
                <tr key={idx} className="border-b border-stone-700/50 hover:bg-stone-800/30 transition">
                  <td className="py-3 px-4 font-semibold">{kpi.metric}</td>
                  <td className="py-3 px-4">{kpi.target}</td>
                  <td className="py-3 px-4">{kpi.check}</td>
                  <td className="py-3 px-4">
                    <span className="bg-red-700/20 text-red-400 px-2 py-1 rounded text-xs">
                      {kpi.alert}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Alert Strategy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            Alert Strategy by Severity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {alertStrategy.map((alert, idx) => (
              <div key={idx} className={`border rounded-lg p-4 ${
                alert.severity === 'CRITICAL' ? 'border-red-700/50 bg-red-900/20' :
                alert.severity === 'HIGH' ? 'border-orange-700/50 bg-orange-900/20' :
                alert.severity === 'MEDIUM' ? 'border-yellow-700/50 bg-yellow-900/20' :
                'border-stone-700'
              }`}>
                <p className={`font-bold mb-2 ${
                  alert.severity === 'CRITICAL' ? 'text-red-400' :
                  alert.severity === 'HIGH' ? 'text-orange-400' :
                  alert.severity === 'MEDIUM' ? 'text-yellow-400' :
                  'text-blue-400'
                }`}>
                  {alert.severity}
                </p>
                <p className="text-xs text-stone-400 mb-3">{alert.examples.join(', ')}</p>
                <p className="text-xs text-stone-300 mb-2"><strong>Action:</strong> {alert.action}</p>
                <p className="text-xs text-stone-400"><strong>Contact:</strong> {alert.contact}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dashboard Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            Executive Dashboard Components
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardSetup.map((dashboard, idx) => (
              <div key={idx} className="border border-stone-700 rounded-lg p-6">
                <h3 className="font-bold text-amber-50 mb-4">{dashboard.section}</h3>
                <ul className="space-y-2">
                  {dashboard.metrics.map((metric, i) => (
                    <li key={i} className="text-stone-300 flex items-start gap-2">
                      <span className="text-red-600 font-bold mt-1">•</span>
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