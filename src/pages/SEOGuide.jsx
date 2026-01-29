import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import SEO from '@/components/SEO';

export default function SEOGuide() {
  const sections = [
    {
      title: 'Complete SEO Audit Summary (Jan 2026)',
      items: [
        'Domain Age: 4 days (registered Jan 26, 2026)',
        'Current Status: Zero indexed pages, no backlinks',
        'Content Volume: Extremely thin (38 words on homepage)',
        'Technical Issues: Missing schema markup, limited internal linking, thin content',
        'Opportunities: Build authority through high-quality content, transparent testing, E-E-A-T signals'
      ]
    },
    {
      title: 'Target Keywords (High-Intent E-Commerce)',
      items: [
        'Primary: "buy research peptides USA," "BPC-157 peptide," "TB-500 research peptide"',
        'Secondary: "semaglutide research," "tirzepatide peptide," "lab-tested peptides"',
        'Long-tail: "best BPC-157 supplier," "where to buy high-purity peptides," "third-party tested peptides USA"',
        'Voice/Conversational: "How to reconstitute research peptides?" "What is BPC-157 used for?"',
        'LSI: "research chemicals," "peptide for sale," "certified peptides," "peptide supplier USA"'
      ]
    },
    {
      title: 'Site Architecture Recommendations',
      items: [
        '/products/bpc-157 - Individual peptide pages with detailed specs',
        '/products/tb-500 - Product category pages',
        '/guides/peptide-calculator - Utility pages (already have)',
        '/guides/reconstitution-guide - Educational content',
        '/guides/peptide-research-2026 - Blog/guide content',
        '/certificates - COA aggregation page (already have)',
        '/about - Company/trust signals (already have)',
        'Implement breadcrumb navigation on all pages'
      ]
    },
    {
      title: 'Technical SEO Priorities',
      items: [
        '✓ HTTPS enabled',
        'Add robots.txt: Allow /; Disallow /admin, /cart',
        'Create XML sitemap with all pages',
        'Optimize Core Web Vitals: Image compression, lazy loading',
        'Add canonical tags to prevent duplicates',
        'Implement structured data (JSON-LD) for Products, Organization, FAQs',
        'Mobile-first responsive design (appears complete)',
        'Reduce JavaScript reliance for crawlability'
      ]
    },
    {
      title: 'Content Expansion Strategy',
      items: [
        'Expand homepage to 1,500+ words with E-E-A-T signals',
        'Create individual product pages (500-800 words each)',
        'Build 10+ blog posts on peptide research and usage',
        'Add FAQ schema markup',
        'Create comparison guides (BPC-157 vs TB-500, etc.)',
        'Publish customer testimonials with structured data',
        'Add author bios with credentials',
        'Include links to peer-reviewed research'
      ]
    },
    {
      title: 'E-E-A-T Signals to Highlight',
      items: [
        'Experience: "USA-based supplier since 2026"',
        'Expertise: "Rigorous third-party testing protocol"',
        'Authoritativeness: "Transparent COA verification," "Industry partnerships"',
        'Trustworthiness: "Clear policies," "Honest about research-only use," "No false claims"'
      ]
    },
    {
      title: 'Off-Page SEO Roadmap',
      items: [
        'Year 1 Goal: 50+ high-quality backlinks',
        'Guest posts on peptide research sites, science blogs',
        'HARO (Help a Reporter Out) responses for PR mentions',
        'Outreach to fitness/biohacking communities',
        'Social media integration (Twitter, LinkedIn sharing)',
        'Local SEO: USA focus, NAP consistency',
        'Monitor with Google Analytics 4 & Search Console'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Red Helix Research SEO Implementation Guide 2026"
        description="Complete SEO strategy for research peptide e-commerce. Technical, on-page, and content optimization roadmap."
        keywords="SEO strategy, e-commerce optimization, peptide marketing"
      />

      <div className="max-w-4xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">SEO Implementation Guide</h1>
          <p className="text-xl text-stone-300">Comprehensive strategy for driving organic traffic and rankings</p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-stone-900/60 border border-stone-700 rounded-lg p-8"
            >
              <h2 className="text-2xl font-bold text-amber-50 mb-4">{section.title}</h2>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="text-stone-300 flex items-start gap-3">
                    <Check className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-700/30 rounded-lg p-8"
        >
          <div className="flex gap-4 items-start">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-amber-50 mb-2">Implementation Timeline</h3>
              <p className="text-stone-300">Phase 1 (Week 1-2): Technical fixes, robots.txt, sitemap. Phase 2 (Week 3-4): Content expansion, schema markup. Phase 3 (Ongoing): Backlink building, monitoring, updates.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}