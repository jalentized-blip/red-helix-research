import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle2, AlertCircle, Code } from 'lucide-react';
import SEO from '@/components/SEO';

export default function DeploymentGuide() {
  const [expandedSection, setExpandedSection] = useState(null);

  const deploymentSteps = [
    {
      phase: 'Pre-Deployment',
      steps: [
        {
          number: 1,
          title: 'Final Code Review',
          duration: '2 hours',
          details: [
            'Review all recent changes',
            'Run unit tests (npm test)',
            'Test payment flow end-to-end',
            'Verify all links work',
            'Check mobile responsiveness'
          ]
        },
        {
          number: 2,
          title: 'Environment Setup',
          duration: '30 min',
          details: [
            'Set production environment variables',
            'Configure database backup',
            'Enable error logging',
            'Set up monitoring alerts',
            'Configure CDN cache rules'
          ]
        },
        {
          number: 3,
          title: 'Database Migration',
          duration: '1 hour',
          details: [
            'Back up production database',
            'Run migration scripts',
            'Verify all entities created',
            'Test data integrity',
            'Create admin user account'
          ]
        },
        {
          number: 4,
          title: 'Performance Testing',
          duration: '2 hours',
          details: [
            'Load test with 1000+ concurrent users',
            'Monitor response times',
            'Check error rates',
            'Verify CDN performance',
            'Optimize slow queries'
          ]
        },
        {
          number: 5,
          title: 'Security Verification',
          duration: '3 hours',
          details: [
            'Run OWASP security scan',
            'Verify SSL certificate',
            'Test payment security',
            'Check authentication flows',
            'Verify PCI compliance'
          ]
        }
      ]
    },
    {
      phase: 'Deployment',
      steps: [
        {
          number: 6,
          title: 'Database Backup',
          duration: '15 min',
          details: [
            'Create full production backup',
            'Verify backup integrity',
            'Store backup securely',
            'Document backup location',
            'Test restore procedure'
          ]
        },
        {
          number: 7,
          title: 'DNS & Domain Setup',
          duration: '30 min',
          details: [
            'Verify domain registration',
            'Update DNS records (A, CNAME)',
            'Enable HTTPS redirect',
            'Set up subdomain routing',
            'Wait for DNS propagation (~15 min)'
          ]
        },
        {
          number: 8,
          title: 'Deploy to Production',
          duration: '30 min',
          details: [
            'Build production bundle',
            'Deploy to hosting (Base44)',
            'Verify deployment successful',
            'Check error logs',
            'Monitor performance metrics'
          ]
        },
        {
          number: 9,
          title: 'SSL Certificate Installation',
          duration: '15 min',
          details: [
            'Verify SSL certificate active',
            'Test HTTPS connection',
            'Redirect HTTP to HTTPS',
            'Update security headers',
            'Test in browsers'
          ]
        },
        {
          number: 10,
          title: 'Launch & Monitoring',
          duration: '1 hour',
          details: [
            'Announce launch',
            'Monitor error rates closely',
            'Watch for unusual traffic',
            'Be ready to rollback',
            'Monitor user feedback'
          ]
        }
      ]
    },
    {
      phase: 'Post-Deployment',
      steps: [
        {
          number: 11,
          title: 'First Week Monitoring',
          duration: 'Daily',
          details: [
            'Monitor error logs hourly',
            'Track conversion rate',
            'Watch server performance',
            'Check user feedback',
            'Monitor security alerts'
          ]
        },
        {
          number: 12,
          title: 'Customer Support Setup',
          duration: 'Ongoing',
          details: [
            'Monitor support inbox',
            'Respond to customer emails',
            'Track common issues',
            'Update FAQ as needed',
            'Build support knowledge base'
          ]
        },
        {
          number: 13,
          title: 'Marketing Launch',
          duration: 'Week 1-2',
          details: [
            'Announce on Discord',
            'Post on Telegram',
            'Engage with communities',
            'Send launch email',
            'Monitor acquisition metrics'
          ]
        },
        {
          number: 14,
          title: 'Optimization Phase',
          duration: 'Week 2+',
          details: [
            'A/B test landing page',
            'Optimize conversion funnel',
            'Improve page load speed',
            'Refine email sequences',
            'Build content calendar'
          ]
        }
      ]
    }
  ];

  const rollbackPlan = [
    {
      scenario: 'Critical bug discovered',
      action: 'Rollback to previous version',
      time: '10 minutes',
      steps: [
        'Stop accepting new orders',
        'Revert code to last stable version',
        'Restore from database backup',
        'Verify site functionality',
        'Announce incident to customers'
      ]
    },
    {
      scenario: 'Payment system down',
      action: 'Disable checkout, show message',
      time: '5 minutes',
      steps: [
        'Disable cart checkout',
        'Show maintenance notice',
        'Contact payment provider',
        'Wait for provider fix',
        'Re-enable checkout'
      ]
    },
    {
      scenario: 'Database corruption',
      action: 'Restore from backup',
      time: '30 minutes',
      steps: [
        'Take site offline (maintenance mode)',
        'Restore latest clean backup',
        'Verify data integrity',
        'Run consistency checks',
        'Restore online'
      ]
    },
    {
      scenario: 'DDoS attack',
      action: 'Enable DDoS protection',
      time: '2 minutes',
      steps: [
        'Enable Cloudflare DDoS protection',
        'Increase rate limiting',
        'Block malicious IPs',
        'Monitor traffic patterns',
        'Scale server resources'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Deployment Guide | Red Helix Research Admin"
        description="Step-by-step production deployment guide, testing checklist, and rollback procedures."
        keywords="deployment, production, launch, guide"
      />

      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-[#dc2626] hover:border-[#dc2626] mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">Deployment Guide</h1>
          <p className="text-xl text-stone-300">Step-by-step production deployment with testing & monitoring</p>
        </motion.div>

        {/* Timeline Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-700/30 rounded-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-4">Deployment Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-3xl font-black text-[#dc2626]">5 hrs</p>
              <p className="text-sm text-stone-300">Pre-Deployment</p>
            </div>
            <div>
              <p className="text-3xl font-black text-[#dc2626]">2 hrs</p>
              <p className="text-sm text-stone-300">Deployment</p>
            </div>
            <div>
              <p className="text-3xl font-black text-[#dc2626]">Daily</p>
              <p className="text-sm text-stone-300">First Week</p>
            </div>
            <div>
              <p className="text-3xl font-black text-[#dc2626]">2 wks+</p>
              <p className="text-sm text-stone-300">Optimization</p>
            </div>
          </div>
        </motion.div>

        {/* Deployment Phases */}
        <div className="space-y-8 mb-12">
          {deploymentSteps.map((phase, phaseIdx) => (
            <motion.div
              key={phaseIdx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: phaseIdx * 0.1 }}
              viewport={{ once: true }}
              className="bg-stone-900/60 border border-stone-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedSection(expandedSection === phaseIdx ? null : phaseIdx)}
                className="w-full px-8 py-4 flex items-center justify-between hover:bg-stone-800/30 transition"
              >
                <h2 className="text-2xl font-bold text-amber-50">{phase.phase}</h2>
                <span className={`text-[#dc2626] transition-transform ${expandedSection === phaseIdx ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {expandedSection === phaseIdx && (
                <div className="px-8 py-6 border-t border-stone-700 space-y-6">
                  {phase.steps.map((step, idx) => (
                    <div key={idx} className="pb-6 border-b border-stone-700/30 last:border-b-0">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-700 text-amber-50 font-bold text-sm">
                            {step.number}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-amber-50">{step.title}</h3>
                          <p className="text-xs text-stone-400 mt-1">Duration: {step.duration}</p>
                        </div>
                      </div>
                      <ul className="ml-14 space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="text-sm text-stone-300 flex items-start gap-2">
                            <span className="text-[#dc2626] font-bold mt-1">→</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Rollback Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            Incident Response & Rollback Plan
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {rollbackPlan.map((plan, idx) => (
              <div key={idx} className="border border-stone-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-amber-50">{plan.scenario}</h3>
                    <p className="text-sm text-stone-400 mt-1">Response time: <strong>{plan.time}</strong></p>
                  </div>
                  <span className="bg-red-700/20 text-red-400 text-xs font-bold px-3 py-1 rounded whitespace-nowrap">
                    {plan.action}
                  </span>
                </div>
                <ol className="list-decimal ml-5 space-y-1">
                  {plan.steps.map((step, i) => (
                    <li key={i} className="text-sm text-stone-300">{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Critical Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 border border-amber-700/30 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-4">Emergency Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-stone-300">
            <div>
              <p className="font-bold text-amber-50">Hosting Support</p>
              <p className="text-sm">Base44 Support: support@base44.com</p>
              <p className="text-sm">Response: 30 minutes</p>
            </div>
            <div>
              <p className="font-bold text-amber-50">Payment Issues</p>
              <p className="text-sm">Stripe Support: support.stripe.com</p>
              <p className="text-sm">Response: 1 hour</p>
            </div>
            <div>
              <p className="font-bold text-amber-50">Team</p>
              <p className="text-sm">Owner: jake@redhelixresearch.com</p>
              <p className="text-sm">Response: Immediate</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}