import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import SEO from '@/components/SEO';

export default function LaunchChecklist() {
  const [checklist, setChecklist] = useState({
    foundation: {
      title: 'Foundation (Core)',
      items: [
        { id: 'auth', label: 'Authentication & User System', completed: true },
        { id: 'products', label: 'Product Catalog (18+ products)', completed: true },
        { id: 'cart', label: 'Shopping Cart & Checkout', completed: true },
        { id: 'orders', label: 'Order Management System', completed: true }
      ]
    },
    seo: {
      title: 'SEO & Discovery',
      items: [
        { id: 'sitemap', label: 'XML Sitemap Generated', completed: true },
        { id: 'schema', label: 'Schema Markup (Product, Organization, FAQ)', completed: true },
        { id: 'canonical', label: 'Canonical Tags on All Pages', completed: true },
        { id: 'meta', label: 'Meta Descriptions & OG Tags', completed: true },
        { id: 'robots', label: 'Robots.txt & Search Console Setup', completed: false }
      ]
    },
    content: {
      title: 'Content & Education',
      items: [
        { id: 'homepage', label: 'Home Page (Hero, Trust, Value Prop)', completed: true },
        { id: 'about', label: 'About Page (Story, Values)', completed: true },
        { id: 'guides', label: 'Blog Guides (Research, Reconstitution)', completed: true },
        { id: 'calculator', label: 'Peptide Calculator Tool', completed: true },
        { id: 'comparison', label: 'Peptide Comparison Tool', completed: true },
        { id: 'coa', label: 'COA Verification System', completed: true }
      ]
    },
    conversion: {
      title: 'Conversion & Analytics',
      items: [
        { id: 'ga4', label: 'GA4 Analytics Setup', completed: false },
        { id: 'events', label: 'Conversion Events Tracking', completed: false },
        { id: 'newsletter', label: 'Newsletter Signup Forms', completed: true },
        { id: 'email_automation', label: 'Email Automation (Abandoned Cart, Post-Purchase)', completed: true },
        { id: 'testimonials', label: 'Customer Testimonials Page', completed: true }
      ]
    },
    admin: {
      title: 'Admin & Operations',
      items: [
        { id: 'stock_mgmt', label: 'Stock Management Dashboard', completed: true },
        { id: 'price_mgmt', label: 'Price Management Dashboard', completed: true },
        { id: 'order_mgmt', label: 'Order Management Dashboard', completed: true },
        { id: 'customer_mgmt', label: 'Customer Management Dashboard', completed: true },
        { id: 'support', label: 'Customer Support Chat System', completed: true }
      ]
    },
    security: {
      title: 'Security & Compliance',
      items: [
        { id: 'ssl', label: 'SSL Certificate (HTTPS)', completed: true },
        { id: 'privacy', label: 'Privacy Policy & Terms', completed: true },
        { id: 'age_verify', label: 'Age Verification System', completed: true },
        { id: 'data_protection', label: 'Data Protection Measures', completed: true },
        { id: 'payment_pci', label: 'PCI Compliance for Payments', completed: false }
      ]
    },
    performance: {
      title: 'Performance & Monitoring',
      items: [
        { id: 'caching', label: 'Browser Caching Enabled', completed: true },
        { id: 'images', label: 'Image Optimization', completed: true },
        { id: 'cdn', label: 'CDN for Static Assets', completed: false },
        { id: 'monitoring', label: 'Uptime & Error Monitoring', completed: false },
        { id: 'load_testing', label: 'Load Testing (1000+ concurrent users)', completed: false }
      ]
    }
  });

  const toggleItem = (section, itemId) => {
    setChecklist(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: prev[section].items.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        )
      }
    }));
  };

  const getSectionStats = (section) => {
    const items = checklist[section].items;
    const completed = items.filter(i => i.completed).length;
    return { completed, total: items.length, percent: Math.round((completed / items.length) * 100) };
  };

  const overallStats = () => {
    const allItems = Object.values(checklist).flatMap(s => s.items);
    const completed = allItems.filter(i => i.completed).length;
    return { completed, total: allItems.length, percent: Math.round((completed / allItems.length) * 100) };
  };

  const stats = overallStats();
  const launchReadiness = stats.percent >= 85 ? 'Ready to Launch! 🚀' : stats.percent >= 70 ? 'Almost Ready' : 'In Progress';

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO
        title="Launch Readiness Checklist | Red Helix Research"
        description="Complete pre-launch checklist for redhelixresearch.com. SEO, content, security, analytics, and compliance requirements."
        keywords="launch checklist, site readiness, pre-launch, compliance"
      />

      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-slate-200 text-slate-500 rounded-full font-bold uppercase tracking-wider text-xs hover:text-[#dc2626] hover:border-[#dc2626] mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight text-slate-900 mb-4">Launch Readiness Checklist</h1>
          <p className="text-xl text-slate-600">Track all requirements before going live</p>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">{stats.percent}% Complete</h2>
              <p className="text-slate-600 mt-2">{stats.completed} of {stats.total} items completed</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#dc2626]">{launchReadiness}</p>
              <p className="text-xs text-slate-500 mt-1">Overall Status</p>
            </div>
          </div>

          <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.percent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#dc2626] to-red-700"
            />
          </div>
        </motion.div>

        {/* Checklist Sections */}
        <div className="space-y-8">
          {Object.entries(checklist).map(([sectionKey, section], idx) => {
            const sectionStats = getSectionStats(sectionKey);
            return (
              <motion.div
                key={sectionKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-8"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{section.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {sectionStats.completed} of {sectionStats.total} completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#dc2626]">{sectionStats.percent}%</p>
                    <div className="relative h-2 bg-slate-200 rounded-full w-24 mt-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${sectionStats.percent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        viewport={{ once: true }}
                        className="h-full bg-[#dc2626]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      onClick={() => toggleItem(sectionKey, item.id)}
                    >
                      <Checkbox
                        checked={item.completed}
                        onChange={() => toggleItem(sectionKey, item.id)}
                        className="cursor-pointer"
                      />
                      <span className={`flex-1 ${item.completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                        {item.label}
                      </span>
                      {item.completed && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Priority Actions */}
        {stats.percent < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mt-12"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              Priority Items Before Launch
            </h3>
            <ul className="space-y-3 text-slate-600">
              {!getSectionStats('seo').completed === getSectionStats('seo').total && (
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">→</span>
                  <span><strong>Complete SEO Setup:</strong> Submit sitemap to GSC, verify robots.txt</span>
                </li>
              )}
              {!getSectionStats('security').completed === getSectionStats('security').total && (
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">→</span>
                  <span><strong>PCI Compliance:</strong> Ensure payment system meets standards</span>
                </li>
              )}
              {!getSectionStats('conversion').items.some(i => !i.completed) && (
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">→</span>
                  <span><strong>GA4 Analytics:</strong> Set up tracking and verify in real-time</span>
                </li>
              )}
              {!getSectionStats('performance').items.some(i => !i.completed) && (
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">→</span>
                  <span><strong>Performance Testing:</strong> Run load tests before public launch</span>
                </li>
              )}
            </ul>
          </motion.div>
        )}

        {/* Success Message */}
        {stats.percent >= 85 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-green-50 border border-green-200 rounded-2xl p-8 mt-12 text-center"
          >
            <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">🚀 Ready to Launch!</h3>
            <p className="text-slate-600">Your site has all critical systems in place. Begin customer acquisition campaigns.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
