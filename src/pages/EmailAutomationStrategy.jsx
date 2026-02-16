import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Mail, BarChart3, TrendingUp } from 'lucide-react';
import SEO from '@/components/SEO';

export default function EmailAutomationStrategy() {
  const emailSequences = [
    {
      name: 'Abandoned Cart Recovery',
      trigger: 'User leaves cart without checkout',
      timing: [
        { delay: 'Immediately', subject: 'Don\'t forget your research peptides' },
        { delay: '24 hours', subject: 'Your cart expires soon - complete your order' },
        { delay: '72 hours', subject: 'Final chance: 10% off remaining stock' }
      ],
      expectedResult: '15-25% recovery rate',
      implementation: 'Automated trigger on cart abandonment',
      functions: ['sendAbandonedCartEmail']
    },
    {
      name: 'Post-Purchase Sequence',
      trigger: 'Order completed',
      timing: [
        { delay: 'Immediately', subject: 'Order Confirmed - Your Research is On the Way' },
        { delay: '3 days', subject: 'How to Reconstitute Your Peptides - Step by Step' },
        { delay: '7 days', subject: 'Your Peptides Have Arrived - Getting Started Guide' },
        { delay: '14 days', subject: 'How\'s Your Research Going? Tips & Support' }
      ],
      expectedResult: '30% open rate, 5% click rate',
      implementation: 'Auto-trigger on purchase completion',
      functions: ['sendPostPurchaseEmail']
    },
    {
      name: 'Reorder Reminder',
      trigger: 'Last purchase 30+ days ago',
      timing: [
        { delay: '30 days post-purchase', subject: 'Welcome Back - Your Favorite Peptides Are Ready' },
        { delay: '60 days post-purchase', subject: 'Exclusive: Repeat Customer 10% Discount' }
      ],
      expectedResult: '8-12% reorder rate',
      implementation: 'Scheduled weekly check of purchase history',
      functions: ['sendReorderReminder']
    },
    {
      name: 'Newsletter/Educational',
      trigger: 'Email signup',
      timing: [
        { delay: 'Day 1', subject: 'Welcome to Red Helix Research' },
        { delay: 'Day 3', subject: 'Your Free Peptide Research Guide' },
        { delay: 'Day 7', subject: 'Top 3 Mistakes in Peptide Reconstitution' },
        { delay: 'Bi-weekly', subject: 'Research Updates & New Peptides' }
      ],
      expectedResult: '25-40% open rate',
      implementation: 'Newsletter signup automation',
      functions: ['Newsletter platform']
    }
  ];

  const metrics = [
    { metric: 'Email List Size', baseline: '0', month3: '500+', month6: '2000+', value: 'Leads' },
    { metric: 'Open Rate', baseline: 'N/A', month3: '25-35%', month6: '35-45%', value: 'Engagement' },
    { metric: 'Click Rate', baseline: 'N/A', month3: '3-5%', month6: '5-8%', value: 'Conversions' },
    { metric: 'Revenue from Email', baseline: '$0', month3: '$500-1000', month6: '$3000+', value: 'Direct ROI' }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO
        title="Email Marketing Automation Strategy | Red Helix Research"
        description="Complete email automation sequences for abandoned cart recovery, post-purchase nurture, and customer retention."
        keywords="email automation, abandoned cart, email sequences, marketing automation, customer retention"
      />

      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="rounded-full font-bold uppercase tracking-wider text-xs border-slate-200 text-slate-500 hover:text-[#dc2626] hover:border-[#dc2626] mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight text-slate-900 mb-4">Email Automation Strategy</h1>
          <p className="text-xl text-slate-600">Turn browsers into buyers with targeted email sequences</p>
        </motion.div>

        {/* Why Email Automation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#dc2626]" />
            Why Email Automation Works
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">✓</span>
              <span><strong>15-25% cart recovery:</strong> Abandoned cart emails recover lost sales automatically</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">✓</span>
              <span><strong>8-12% reorder rate:</strong> Timely reminders encourage repeat purchases</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">✓</span>
              <span><strong>Higher AOV:</strong> Post-purchase sequences educate and drive upsells</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">✓</span>
              <span><strong>Scalable:</strong> Automate once, benefit forever—no manual effort</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#dc2626] font-bold">✓</span>
              <span><strong>Lower CAC:</strong> Retargeting existing prospects costs far less than new acquisition</span>
            </li>
          </ul>
        </motion.div>

        {/* Email Sequences */}
        <div className="space-y-8 mb-16">
          {emailSequences.map((sequence, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">{sequence.name}</h3>
                  <p className="text-slate-500">Trigger: {sequence.trigger}</p>
                </div>
                <span className="text-xs bg-red-50 text-[#dc2626] px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                  {sequence.expectedResult}
                </span>
              </div>

              <div className="mb-6 pb-6 border-b border-slate-200">
                <p className="text-xs text-slate-500 font-semibold mb-3 uppercase">Email Sequence:</p>
                <div className="space-y-2">
                  {sequence.timing.map((email, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-[#dc2626] font-bold whitespace-nowrap">{email.delay}:</span>
                      <span className="text-slate-600">{email.subject}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-2">Implementation</p>
                  <p className="text-slate-600 text-sm">{sequence.implementation}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-2">Backend Functions</p>
                  <div className="flex flex-wrap gap-2">
                    {sequence.functions.map((fn, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-900 px-2 py-1 rounded">
                        {fn}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Projected Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-12 overflow-x-auto"
        >
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-6">6-Month Email Metrics Projection</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-900 font-bold">Metric</th>
                <th className="text-left py-3 px-4 text-slate-900 font-bold">Baseline</th>
                <th className="text-left py-3 px-4 text-slate-900 font-bold">Month 3</th>
                <th className="text-left py-3 px-4 text-slate-900 font-bold">Month 6</th>
                <th className="text-left py-3 px-4 text-slate-900 font-bold">Value</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {metrics.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-100 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.metric}</td>
                  <td className="py-3 px-4">{item.baseline}</td>
                  <td className="py-3 px-4">{item.month3}</td>
                  <td className="py-3 px-4">{item.month6}</td>
                  <td className="py-3 px-4 text-[#dc2626] font-bold">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Email Provider Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-6">Recommended Email Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 mb-3">Resend (Best for Developers)</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Easy API integration</li>
                <li>• Built for React</li>
                <li>• $0.20 per email</li>
                <li>• Good for automation</li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 mb-3">SendGrid (Most Popular)</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• 100 free emails/day</li>
                <li>• Automation workflows</li>
                <li>• Strong deliverability</li>
                <li>• Great analytics</li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 mb-3">Mailchimp (Best Free)</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Free up to 500 contacts</li>
                <li>• Email automation</li>
                <li>• Good segmentation</li>
                <li>• Excellent templates</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
