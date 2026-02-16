import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, BarChart3, Target, Zap, Code, Lock } from 'lucide-react';
import SEO from '@/components/SEO';
import { base44 } from '@/api/base44Client';

export default function ConversionTracking() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          setIsAdmin(user?.role === 'admin');
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-white pt-32 flex items-center justify-center"><p className="text-slate-900">Loading...</p></div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Lock className="w-16 h-16 text-[#dc2626] mx-auto mb-6" />
          <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 mb-4">Admin Only</h1>
          <p className="text-slate-500 mb-8">Conversion tracking data is restricted to administrators.</p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-[#dc2626] hover:bg-[#dc2626]">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }
  const trackingEvents = [
    {
      event: 'Product Page View',
      code: "base44.analytics.track({ eventName: 'product_viewed', properties: { product_id: '123', product_name: 'BPC-157' } })",
      importance: 'Critical',
      metric: 'Product interest'
    },
    {
      event: 'Add to Cart',
      code: "base44.analytics.track({ eventName: 'item_added_to_cart', properties: { product_id: '123', quantity: 1, price: 49.99 } })",
      importance: 'Critical',
      metric: 'Purchase intent'
    },
    {
      event: 'Checkout Started',
      code: "base44.analytics.track({ eventName: 'checkout_started', properties: { cart_value: 149.97, item_count: 3 } })",
      importance: 'Critical',
      metric: 'Conversion funnel'
    },
    {
      event: 'Purchase Completed',
      code: "base44.analytics.track({ eventName: 'purchase_completed', properties: { order_id: 'ORD-123', total: 149.97, items: 3 } })",
      importance: 'Critical',
      metric: 'Revenue'
    },
    {
      event: 'Newsletter Signup',
      code: "base44.analytics.track({ eventName: 'newsletter_signup_submitted', properties: { email_domain: 'gmail.com' } })",
      importance: 'High',
      metric: 'Email list growth'
    },
    {
      event: 'COA Download',
      code: "base44.analytics.track({ eventName: 'coa_downloaded', properties: { peptide: 'BPC-157', batch_number: '001' } })",
      importance: 'High',
      metric: 'Engagement'
    },
    {
      event: 'Blog Post Read',
      code: "base44.analytics.track({ eventName: 'blog_post_viewed', properties: { title: 'BPC-157 Guide', time_on_page: 180 } })",
      importance: 'Medium',
      metric: 'Content engagement'
    },
    {
      event: 'Calculator Used',
      code: "base44.analytics.track({ eventName: 'calculator_used', properties: { tool: 'peptide_calculator', calculation: 'reconstitution' } })",
      importance: 'Medium',
      metric: 'Tool usage'
    }
  ];

  const googleAnalyticsSetup = [
    {
      step: 1,
      title: 'Create GA4 Property',
      details: [
        'Go to Google Analytics (analytics.google.com)',
        'Create new property for redhelixresearch.com',
        'Select Web as platform',
        'Copy Measurement ID (G-XXXXXXXXXX)'
      ]
    },
    {
      step: 2,
      title: 'Install Tracking Code',
      details: [
        'Add GA4 script to Layout.js <head>',
        'Implement gtag.js or GA4 npm package',
        'Verify installation in GA4 Real-time report',
        'Should see page views within 5 minutes'
      ]
    },
    {
      step: 3,
      title: 'Set Up Events',
      details: [
        'Define 8+ custom events (see table above)',
        'Map to conversion goals',
        'Create audiences (e.g., "Purchasers")',
        'Set up conversion value tracking'
      ]
    },
    {
      step: 4,
      title: 'Connect to Google Search Console',
      details: [
        'Link GA4 to GSC property',
        'Enable Search Console dimensions in GA4',
        'View query data, landing pages, CTR',
        'Monitor keyword performance'
      ]
    },
    {
      step: 5,
      title: 'Create Conversion Goals',
      details: [
        'Mark "purchase_completed" as conversion',
        'Mark "newsletter_signup" as conversion',
        'Mark "add_to_cart" as micro-conversion',
        'Set target CPA and ROAS goals'
      ]
    }
  ];

  const conversionFunnel = [
    { stage: 'Sessions', value: '100%', metric: 'All users' },
    { stage: 'Product Pages', value: '35%', metric: 'Users viewing products' },
    { stage: 'Add to Cart', value: '12%', metric: 'Add cart intent' },
    { stage: 'Checkout Started', value: '8%', metric: 'Begin purchase' },
    { stage: 'Purchase', value: '3-5%', metric: 'Completed orders' }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO
        title="Conversion Tracking Setup Guide | Red Helix Research"
        description="Complete guide to setting up GA4 conversion tracking, event management, and analytics for e-commerce optimization."
        keywords="conversion tracking, GA4 setup, analytics events, e-commerce tracking"
      />

      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="rounded-full font-bold uppercase tracking-wider text-xs border-slate-200 text-slate-500 hover:text-[#dc2626] hover:border-[#dc2626] mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight text-slate-900 mb-4">Conversion Tracking Setup</h1>
          <p className="text-xl text-slate-600">Measure every step of the customer journey</p>
        </motion.div>

        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-[#dc2626]" />
            Why Conversion Tracking Matters
          </h2>
          <p className="text-slate-600 mb-4">
            Without proper conversion tracking, you're flying blind. You can't optimize what you don't measure.
          </p>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">✓</span>
              <span><strong>Identify bottlenecks:</strong> See where users drop off in the funnel</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">✓</span>
              <span><strong>Measure ROI:</strong> Calculate return on SEO and marketing efforts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">✓</span>
              <span><strong>Optimize campaigns:</strong> Double down on what works</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">✓</span>
              <span><strong>Segment audiences:</strong> Understand which traffic sources convert best</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">✓</span>
              <span><strong>Track customer value:</strong> Know lifetime customer value</span>
            </li>
          </ul>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-8">Expected Conversion Funnel</h2>
          <div className="space-y-4">
            {conversionFunnel.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{item.stage}</p>
                  <p className="text-sm text-slate-500">{item.metric}</p>
                </div>
                <div className="relative h-8 bg-slate-100 rounded flex-1 flex items-center justify-end pr-3">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: item.value }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="absolute left-0 h-full bg-red-50 rounded"
                  />
                  <span className="text-slate-900 font-bold relative z-10">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Events to Track */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-12 overflow-x-auto"
        >
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-6">Key Events to Implement</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-900 font-bold">Event</th>
                <th className="text-left py-3 px-4 text-slate-900 font-bold">Implementation Code</th>
                <th className="text-left py-3 px-4 text-slate-900 font-bold">Importance</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {trackingEvents.map((event, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-100 transition">
                  <td className="py-4 px-4 font-semibold text-slate-900 whitespace-nowrap">{event.event}</td>
                  <td className="py-4 px-4">
                    <code className="text-xs bg-slate-100 rounded px-2 py-1 font-mono overflow-x-auto block">
                      {event.code}
                    </code>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs font-bold ${
                      event.importance === 'Critical' ? 'text-red-500' :
                      event.importance === 'High' ? 'text-orange-500' :
                      'text-yellow-500'
                    }`}>
                      {event.importance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* GA4 Setup Steps */}
        <div className="space-y-6 mb-12">
          {googleAnalyticsSetup.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#dc2626] text-white font-bold text-lg">
                  {section.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{section.title}</h3>
              </div>

              <ul className="space-y-3 ml-16">
                {section.details.map((detail, i) => (
                  <li key={i} className="text-slate-600 flex items-start gap-3">
                    <span className="text-[#dc2626] font-bold mt-1">→</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Implementation Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-red-50 border border-red-200 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#dc2626]" />
            Quick Implementation Checklist
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">□</span>
              <span>Set up GA4 property and get Measurement ID</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">□</span>
              <span>Install gtag.js script in Layout.js</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">□</span>
              <span>Implement all 8 critical events in product pages</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">□</span>
              <span>Create conversion goals for purchase & newsletter</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">□</span>
              <span>Connect GA4 to Google Search Console</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">□</span>
              <span>Set up email alerts for anomalies</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">□</span>
              <span>Test all events in GA4 Real-time report</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">□</span>
              <span>Create conversion funnel dashboard</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
