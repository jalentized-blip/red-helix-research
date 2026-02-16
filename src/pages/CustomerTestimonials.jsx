import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Star, Quote } from 'lucide-react';
import SEO from '@/components/SEO';

export default function CustomerTestimonials() {
  const trustSignals = [
    {
      metric: '2 Years',
      label: 'of Trust & Experience',
      description: 'In the research peptide market'
    },
    {
      metric: '100+',
      label: 'Active Researchers',
      description: 'Using our peptides for research'
    },
    {
      metric: '99.2%',
      label: 'Quality Score',
      description: 'Third-party testing average'
    },
    {
      metric: '24/7',
      label: 'Customer Support',
      description: 'Available for research questions'
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO
        title="Customer Testimonials & Reviews | Red Helix Research"
        description="Read what researchers say about Red Helix Research peptides. Verified testimonials from scientists and research facilities."
        keywords="customer reviews, research testimonials, peptide reviews, verified customers"
      />

      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 uppercase tracking-tight">What Researchers Say</h1>
          <p className="text-xl text-slate-500 font-medium">Trusted by scientists and research institutions</p>
        </motion.div>

        {/* Trust Signals */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {trustSignals.map((signal, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center"
            >
              <p className="text-3xl font-black text-[#dc2626] mb-2">{signal.metric}</p>
              <p className="font-bold text-slate-900 mb-1">{signal.label}</p>
              <p className="text-xs text-slate-500">{signal.description}</p>
            </motion.div>
          ))}
        </div>

        {/* No Testimonials Yet — Honest Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center mb-16"
        >
          <div className="max-w-lg mx-auto">
            <Quote className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">Customer Reviews Coming Soon</h2>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              We're collecting verified reviews from real researchers. As a newer company, we're focused on earning your trust through product quality, transparent third-party testing, and exceptional support — not manufactured testimonials.
            </p>
          </div>
        </motion.div>

        {/* Why Choose */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Why Researchers Choose Red Helix</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
                Third-Party Testing
              </h3>
              <p className="text-slate-600 text-sm">Every batch undergoes rigorous HPLC purity verification, mass spectrometry analysis, and sterility testing. Full COA included.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
                Transparent Pricing
              </h3>
              <p className="text-slate-600 text-sm">No hidden fees. Competitive pricing for research-grade peptides. Volume discounts available for institutional research.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
                Educational Resources
              </h3>
              <p className="text-slate-600 text-sm">Complete reconstitution guides, peptide calculator, research guides, and expert support for your research needs.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
                Researcher-Focused
              </h3>
              <p className="text-slate-600 text-sm">Founded by researchers, for researchers. We understand your needs and provide the quality you demand.</p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#dc2626] rounded-2xl p-10 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Join 100+ Active Researchers</h3>
            <p className="text-white/80 font-medium mb-6">Start your research with verified, third-party tested peptides.</p>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-white text-[#dc2626] hover:bg-red-50 font-bold px-8 py-6 rounded-full shadow-lg">Browse Products</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
