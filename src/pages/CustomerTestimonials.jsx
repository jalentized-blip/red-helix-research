import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Star, Quote } from 'lucide-react';
import SEO from '@/components/SEO';

export default function CustomerTestimonials() {
  const testimonials = [
    {
      name: 'Dr. James Patterson',
      role: 'Research Scientist',
      organization: 'Midwest University',
      content: 'Red Helix Research provides the most transparent and high-quality peptides I\'ve used in my 10+ years of research. The COAs are comprehensive, and their customer support is exceptional.',
      rating: 5,
      focus: 'Quality & Transparency'
    },
    {
      name: 'Michael Chen',
      role: 'Independent Researcher',
      location: 'California',
      content: 'The reconstitution guides and peptide calculator saved me hours of calculation. The fact that every batch is third-party tested gives me confidence in my research results.',
      rating: 5,
      focus: 'Resources & Education'
    },
    {
      name: 'Sarah Williams',
      role: 'Lab Manager',
      organization: 'BioPure Testing Facility',
      content: 'We recommend Red Helix to all our research clients. Their peptides consistently pass our quality audits, and the pricing is fair for the quality level.',
      rating: 5,
      focus: 'Consistency & Pricing'
    },
    {
      name: 'Dr. Robert Thompson',
      role: 'Lead Researcher',
      organization: 'Northeast Institute',
      content: 'The BPC-157 and TB-500 peptides have been instrumental in our recent publications. The purity specifications meet our strict academic standards.',
      rating: 5,
      focus: 'Research Grade Quality'
    },
    {
      name: 'Jennifer Martinez',
      role: 'Peptide Research Developer',
      location: 'Texas',
      content: 'Switching to Red Helix was the best decision for our research. The customer service team is knowledgeable and responsive. Highly recommend.',
      rating: 5,
      focus: 'Customer Service'
    },
    {
      name: 'Dr. Alan Foster',
      role: 'Biochemistry Professor',
      organization: 'Eastern Tech University',
      content: 'My graduate students use Red Helix peptides for their thesis work. The materials they provide for documentation are excellent for academic rigor.',
      rating: 5,
      focus: 'Academic Support'
    }
  ];

  const trustSignals = [
    {
      metric: '6 Years',
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
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Customer Testimonials & Reviews | Red Helix Research"
        description="Read what researchers say about Red Helix Research peptides. Verified testimonials from scientists and research facilities."
        keywords="customer reviews, research testimonials, peptide reviews, verified customers"
      />

      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-[#dc2626] hover:border-[#dc2626] mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">What Researchers Say</h1>
          <p className="text-xl text-stone-300">Trusted by scientists and research institutions</p>
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
              className="bg-stone-900/60 border border-stone-700 rounded-lg p-6 text-center"
            >
              <p className="text-3xl font-black text-[#dc2626] mb-2">{signal.metric}</p>
              <p className="font-bold text-amber-50 mb-1">{signal.label}</p>
              <p className="text-xs text-stone-400">{signal.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx % 2) * 0.1 }}
              viewport={{ once: true }}
              className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 hover:border-red-700/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <Quote className="w-8 h-8 text-[#dc2626]/30" />
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#dc2626] text-[#dc2626]" />
                  ))}
                </div>
              </div>

              <p className="text-stone-300 mb-6 leading-relaxed">"{testimonial.content}"</p>

              <div className="pt-6 border-t border-stone-700">
                <p className="font-bold text-amber-50">{testimonial.name}</p>
                <p className="text-sm text-stone-400">{testimonial.role}</p>
                {testimonial.organization && (
                  <p className="text-sm text-stone-500">{testimonial.organization}</p>
                )}
                {testimonial.location && (
                  <p className="text-sm text-stone-500">{testimonial.location}</p>
                )}
                <p className="text-xs text-[#dc2626] font-semibold mt-2">Focus: {testimonial.focus}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why Choose */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-700/30 rounded-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">Why Researchers Choose Red Helix</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-amber-50 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
                Third-Party Testing
              </h3>
              <p className="text-stone-300 text-sm">Every batch undergoes rigorous HPLC purity verification, mass spectrometry analysis, and sterility testing. Full COA included.</p>
            </div>
            <div>
              <h3 className="font-bold text-amber-50 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
                Transparent Pricing
              </h3>
              <p className="text-stone-300 text-sm">No hidden fees. Competitive pricing for research-grade peptides. Volume discounts available for institutional research.</p>
            </div>
            <div>
              <h3 className="font-bold text-amber-50 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
                Educational Resources
              </h3>
              <p className="text-stone-300 text-sm">Complete reconstitution guides, peptide calculator, research guides, and expert support for your research needs.</p>
            </div>
            <div>
              <h3 className="font-bold text-amber-50 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
                Researcher-Focused
              </h3>
              <p className="text-stone-300 text-sm">Founded by researchers, for researchers. We understand your needs and provide the quality you demand.</p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-amber-50 mb-3">Join 100+ Active Researchers</h3>
          <p className="text-stone-300 mb-6">Start your research with verified, third-party tested peptides.</p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-red-700 hover:bg-[#dc2626]">Browse Products</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}