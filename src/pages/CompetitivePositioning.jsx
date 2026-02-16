import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Target, TrendingUp } from 'lucide-react';
import SEO from '@/components/SEO';

export default function CompetitivePositioning() {
  const competitors = [
    {
      name: 'Standard Gray Market Vendors',
      pricing: '$30-50 per vial',
      testing: 'Minimal or none',
      support: 'Limited email only',
      coa: 'Often unavailable',
      shipping: '5-7 days',
      brand: 'Anonymous/generic',
      trustScore: '4/10'
    },
    {
      name: 'Budget Peptide Resellers',
      pricing: '$25-40 per vial',
      testing: 'Occasional batch testing',
      support: 'Discord community only',
      coa: 'Sometimes available',
      shipping: '7-10 days',
      brand: 'Weak online presence',
      trustScore: '5/10'
    },
    {
      name: 'Red Helix Research (US)',
      pricing: '$45-65 per vial (premium)',
      testing: '100% third-party HPLC verified',
      support: '24/7 expert support',
      coa: 'Complete for every batch',
      shipping: '1-2 days preparation',
      brand: 'Transparent, trusted leader',
      trustScore: '9/10',
      highlight: true
    },
    {
      name: 'Established Research Suppliers',
      pricing: '$80-150 per vial',
      testing: 'Third-party certified',
      support: 'Professional support',
      coa: 'Always included',
      shipping: '2-5 days',
      brand: 'Established reputation',
      trustScore: '8/10'
    }
  ];

  const positioningStrategy = [
    {
      axis: 'Price vs Quality',
      description: 'Premium quality at gray market prices',
      strategy: 'Compete on value, not just cost. Our 98%+ purity justifies $45-65 pricing when competitors offer 80-90% at $30-40.',
      tactics: [
        'Show purity comparisons in product pages',
        'Highlight cost per mg of pure peptide',
        'Offer volume discounts for researchers',
        'Monthly specials on bulk orders'
      ]
    },
    {
      axis: 'Transparency vs Competition',
      description: 'Only supplier with complete third-party COAs',
      strategy: 'Make COA transparency our primary differentiator. Most competitors hide quality issues.',
      tactics: [
        'Every product page shows COA upfront',
        'Community COA upload system',
        'Third-party verification badge',
        'Batch number tracking system'
      ]
    },
    {
      axis: 'Education vs Competitors',
      description: 'Empower researchers with guides & tools',
      strategy: 'Become the trusted knowledge hub for peptide research.',
      tactics: [
        'Peptide Calculator tool (exclusive)',
        'Reconstitution guides (detailed)',
        'Comparison tools (transparent)',
        'Research database & blog'
      ]
    },
    {
      axis: 'Support vs Market',
      description: '24/7 responsive support vs email-only',
      strategy: 'Premium support at no extra cost differentiates from budget competitors.',
      tactics: [
        'Email support (responds in 4 hours)',
        'Discord community access',
        'Telegram support group',
        'In-depth FAQ & guides'
      ]
    }
  ];

  const marketOpportunities = [
    {
      segment: 'Academic Researchers',
      market_size: '~50,000 US universities',
      annual_spend: '$200-500 per researcher',
      penetration: '<1% currently served',
      strategy: 'Partner with university research departments, offer institutional pricing'
    },
    {
      segment: 'Biohacking Communities',
      market_size: '~100,000 active members',
      annual_spend: '$300-800 per person',
      penetration: '<2% reached',
      strategy: 'Sponsor meetups, provide educational content, build Discord presence'
    },
    {
      segment: 'Athlete Recovery Groups',
      market_size: '~50,000 serious athletes',
      annual_spend: '$400-1000 per year',
      penetration: '<5% served',
      strategy: 'Partner with sports science content creators, testimonials from athletes'
    },
    {
      segment: 'Existing Customers (Retention)',
      market_size: '~500 current customers',
      annual_spend: '$2000+ per loyal customer',
      penetration: '100% engaged',
      strategy: 'Loyalty rewards, exclusive batches, VIP support tier'
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO
        title="Competitive Positioning Strategy | Red Helix Research Admin"
        description="Market positioning, competitive analysis, and growth strategy for Red Helix Research."
        keywords="competitive analysis, market positioning, strategy"
      />

      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-slate-200 text-slate-500 rounded-full font-bold uppercase tracking-wider text-xs hover:text-[#dc2626] hover:border-[#dc2626] mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight text-slate-900 mb-4">Competitive Positioning</h1>
          <p className="text-xl text-slate-600">How Red Helix dominates the peptide market</p>
        </motion.div>

        {/* Competitor Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-12 overflow-x-auto"
        >
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-6">Market Comparison</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-900 font-bold">Competitor</th>
                <th className="text-left py-3 px-4 text-slate-900 font-bold">Pricing</th>
                <th className="text-left py-3 px-4 text-slate-900 font-bold">Testing</th>
                <th className="text-left py-3 px-4 text-slate-900 font-bold">Support</th>
                <th className="text-left py-3 px-4 text-slate-900 font-bold">COA</th>
                <th className="text-left py-3 px-4 text-slate-900 font-bold">Trust Score</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {competitors.map((comp, idx) => (
                <tr key={idx} className={`border-b border-slate-100 ${comp.highlight ? 'bg-red-50' : 'hover:bg-slate-100'} transition`}>
                  <td className={`py-4 px-4 font-semibold ${comp.highlight ? 'text-[#dc2626]' : 'text-slate-900'}`}>
                    {comp.name}
                  </td>
                  <td className="py-4 px-4">{comp.pricing}</td>
                  <td className="py-4 px-4">{comp.testing}</td>
                  <td className="py-4 px-4">{comp.support}</td>
                  <td className="py-4 px-4">{comp.coa}</td>
                  <td className={`py-4 px-4 font-bold ${comp.highlight ? 'text-green-500' : 'text-orange-500'}`}>
                    {comp.trustScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Positioning Axes */}
        <div className="space-y-8 mb-12">
          {positioningStrategy.map((strategy, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-8"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-red-50 rounded-2xl">
                  <Target className="w-6 h-6 text-[#dc2626]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">{strategy.axis}</h3>
                  <p className="text-slate-500 mt-1">{strategy.description}</p>
                </div>
              </div>

              <p className="text-slate-600 mb-4">{strategy.strategy}</p>

              <div className="bg-slate-100 rounded-2xl p-4">
                <p className="text-xs text-slate-500 font-semibold mb-3 uppercase">Execution Tactics:</p>
                <ul className="space-y-2">
                  {strategy.tactics.map((tactic, i) => (
                    <li key={i} className="text-slate-600 flex items-start gap-2">
                      <span className="text-[#dc2626] font-bold">→</span>
                      <span>{tactic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Market Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Market Growth Opportunities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketOpportunities.map((opp, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 mb-3">{opp.segment}</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p><strong>Market Size:</strong> {opp.market_size}</p>
                  <p><strong>Annual Spend:</strong> {opp.annual_spend}</p>
                  <p><strong>Current Penetration:</strong> <span className="text-orange-500 font-bold">{opp.penetration}</span></p>
                  <p className="pt-2"><strong>Strategy:</strong> {opp.strategy}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Key Differentiators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-red-50 border border-red-200 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-6">Our Unmatched Advantages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">✓ 100% Transparency</h3>
              <p className="text-slate-600 text-sm">Every batch includes third-party HPLC verification & complete COA. No hidden testing results.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">✓ Premium at Gray Market Prices</h3>
              <p className="text-slate-600 text-sm">98%+ purity at $45-65/vial beats $30-40 vials at 80-90% purity.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">✓ Researcher-First Education</h3>
              <p className="text-slate-600 text-sm">Only vendor with proprietary Peptide Calculator, guides, and comparison tools.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">✓ Community Trust</h3>
              <p className="text-slate-600 text-sm">500+ verified researchers trust us. Growing Discord & community presence.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
