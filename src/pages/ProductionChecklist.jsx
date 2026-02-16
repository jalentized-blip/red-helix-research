import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import SEO from '@/components/SEO';

export default function ProductionChecklist() {
  const [checklist, setChecklist] = useState({
    technical: {
      title: 'Technical Pre-Launch',
      items: [
        { id: 'ssl', label: 'SSL certificate installed and verified', completed: false },
        { id: 'https', label: 'HTTPS redirect enabled (HTTP → HTTPS)', completed: false },
        { id: 'dns', label: 'DNS records configured (A, CNAME, MX)', completed: false },
        { id: 'cdn', label: 'CDN configured and caching enabled', completed: false },
        { id: 'robots', label: 'robots.txt and sitemap.xml deployed', completed: false },
        { id: 'headers', label: 'Security headers configured (CSP, etc.)', completed: false },
        { id: 'db-backup', label: 'Database backup automated and tested', completed: false },
        { id: 'error-logging', label: 'Error logging and monitoring enabled', completed: false }
      ]
    },
    functionality: {
      title: 'Functionality Testing',
      items: [
        { id: 'auth', label: 'User authentication flow tested (signup, login, logout)', completed: false },
        { id: 'products', label: 'All products load and display correctly', completed: false },
        { id: 'cart', label: 'Shopping cart add/remove/checkout works', completed: false },
        { id: 'payment', label: 'Payment processing end-to-end tested', completed: false },
        { id: 'forms', label: 'All forms submit and validate correctly', completed: false },
        { id: 'email', label: 'Transactional emails sending successfully', completed: false },
        { id: 'age-verify', label: 'Age verification modal appears and works', completed: false },
        { id: 'tracking', label: 'GA4 and analytics tracking verified', completed: false },
        { id: 'mobile', label: 'Mobile responsiveness tested on devices', completed: false }
      ]
    },
    security: {
      title: 'Security Verification',
      items: [
        { id: 'pci', label: 'PCI DSS Level 3A compliance verified', completed: false },
        { id: 'payment-security', label: 'Payment data encrypted (no storage)', completed: false },
        { id: 'password-hashing', label: 'Passwords hashed with bcrypt', completed: false },
        { id: 'session', label: 'Session timeout and security configured', completed: false },
        { id: 'owasp', label: 'OWASP Top 10 vulnerabilities checked', completed: false },
        { id: 'sql-injection', label: 'SQL injection prevention verified', completed: false },
        { id: 'xss', label: 'XSS protection enabled', completed: false },
        { id: 'csrf', label: 'CSRF token protection implemented', completed: false }
      ]
    },
    compliance: {
      title: 'Legal & Compliance',
      items: [
        { id: 'privacy', label: 'Privacy Policy published and accessible', completed: false },
        { id: 'terms', label: 'Terms of Service published and accessible', completed: false },
        { id: 'disclaimer', label: 'Research use disclaimer visible on pages', completed: false },
        { id: 'age-gate', label: 'Age 18+ verification required at signup', completed: false },
        { id: 'liability', label: 'Liability waiver accepted at checkout', completed: false },
        { id: 'gdpr', label: 'GDPR/CCPA compliance measures in place', completed: false },
        { id: 'data-deletion', label: 'User data deletion process implemented', completed: false }
      ]
    },
    content: {
      title: 'Content & SEO',
      items: [
        { id: 'meta', label: 'Meta descriptions and OG tags on all pages', completed: false },
        { id: 'canonical', label: 'Canonical tags implemented', completed: false },
        { id: 'schema', label: 'Schema markup (Product, Organization, FAQ)', completed: false },
        { id: 'sitemap', label: 'XML sitemap submitted to Google', completed: false },
        { id: 'gsc', label: 'Google Search Console verified', completed: false },
        { id: 'language', label: 'All typos and grammar checked', completed: false },
        { id: 'alt-text', label: 'Images have alt text for accessibility', completed: false }
      ]
    },
    performance: {
      title: 'Performance Optimization',
      items: [
        { id: 'load-time', label: 'Page load time < 2 seconds', completed: false },
        { id: 'core-web', label: 'Core Web Vitals (LCP, FID, CLS) optimized', completed: false },
        { id: 'images', label: 'Images optimized and compressed', completed: false },
        { id: 'bundle', label: 'JavaScript bundle size minimized', completed: false },
        { id: 'caching', label: 'Browser caching headers configured', completed: false },
        { id: 'compression', label: 'GZIP compression enabled', completed: false },
        { id: 'load-test', label: 'Load test passed (1000+ concurrent users)', completed: false }
      ]
    },
    operations: {
      title: 'Operational Readiness',
      items: [
        { id: 'monitoring', label: 'Uptime monitoring enabled (Uptime Robot)', completed: false },
        { id: 'sentry', label: 'Error tracking configured (Sentry)', completed: false },
        { id: 'ga4', label: 'Google Analytics 4 set up and verified', completed: false },
        { id: 'alerts', label: 'Alert system configured for critical events', completed: false },
        { id: 'backup-test', label: 'Database restore from backup tested', completed: false },
        { id: 'incident-plan', label: 'Incident response plan documented', completed: false },
        { id: 'contact-list', label: 'Emergency contact list created', completed: false },
        { id: 'support-setup', label: 'Customer support channels ready', completed: false }
      ]
    },
    marketing: {
      title: 'Marketing Readiness',
      items: [
        { id: 'social-media', label: 'Social media accounts created and linked', completed: false },
        { id: 'email-list', label: 'Email list imported and verified', completed: false },
        { id: 'launch-email', label: 'Launch announcement email drafted', completed: false },
        { id: 'cta-buttons', label: 'All CTAs and links tested', completed: false },
        { id: 'newsletter', label: 'Newsletter signup forms working', completed: false },
        { id: 'analytics-goals', label: 'Conversion goals configured in GA4', completed: false }
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
  const isReady = stats.percent === 100;

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Production Launch Checklist | Red Helix Research Admin"
        description="Complete pre-launch verification checklist. Technical, security, compliance, and marketing readiness."
        keywords="launch checklist, production, verification, readiness"
      />

      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-[#dc2626] hover:border-[#dc2626] mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">Production Launch Checklist</h1>
          <p className="text-xl text-stone-300">Final verification before going live</p>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg p-8 mb-12 ${isReady ? 'bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-700/30' : 'bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-700/30'}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black text-amber-50">{stats.percent}% Complete</h2>
              <p className="text-stone-300 mt-2">{stats.completed} of {stats.total} items verified</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${isReady ? 'text-green-600' : 'text-[#dc2626]'}`}>
                {isReady ? '✅ Ready to Launch!' : '⏳ In Progress'}
              </p>
            </div>
          </div>

          <div className="relative h-3 bg-stone-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.percent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full ${isReady ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-[#dc2626] to-red-700'}`}
            />
          </div>
        </motion.div>

        {/* Checklist Sections */}
        <div className="space-y-6">
          {Object.entries(checklist).map(([sectionKey, section], idx) => {
            const sectionStats = getSectionStats(sectionKey);
            return (
              <motion.div
                key={sectionKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="bg-stone-900/60 border border-stone-700 rounded-lg p-8"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-amber-50">{section.title}</h3>
                    <p className="text-sm text-stone-400 mt-1">
                      {sectionStats.completed} of {sectionStats.total} completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#dc2626]">{sectionStats.percent}%</p>
                    <div className="relative h-2 bg-stone-800 rounded-full w-24 mt-2 overflow-hidden">
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
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-800/30 transition cursor-pointer"
                      onClick={() => toggleItem(sectionKey, item.id)}
                    >
                      <Checkbox
                        checked={item.completed}
                        onChange={() => toggleItem(sectionKey, item.id)}
                        className="cursor-pointer"
                      />
                      <span className={`flex-1 ${item.completed ? 'text-stone-500 line-through' : 'text-stone-300'}`}>
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

        {/* Launch Button */}
        {isReady && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-700/30 rounded-lg p-8 text-center"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-amber-50 mb-3">🚀 Ready for Production!</h2>
            <p className="text-stone-300 mb-6">All systems verified and ready. Proceed with deployment.</p>
            <Button className="bg-green-700 hover:bg-green-600">
              Begin Deployment Process
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}