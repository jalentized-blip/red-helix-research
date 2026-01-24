import React from 'react';
import { ArrowLeft, Eye, DollarSign, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const StorySection = ({ icon: Icon, title, description, highlight, highlightSecondary }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="bg-stone-900/50 border border-stone-700 rounded-lg p-8"
  >
    <div className="flex items-start gap-4">
      <Icon className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
      <div>
        <h3 className="text-2xl font-bold text-amber-50 mb-3">{title}</h3>
        <p className="text-stone-300 leading-relaxed mb-3">{description}</p>
        {highlight && (
          <div className="mt-4 space-y-0">
            <p className="text-3xl font-black text-amber-50">{highlight}</p>
            {highlightSecondary && (
              <p className="text-3xl font-black text-barn-tan">{highlightSecondary}</p>
            )}
            <p className="text-white font-semibold text-lg mt-6 mb-3">Every Batch Tested. Every Result Trusted.</p>
            <p className="text-barn-tan text-sm">FOR RESEARCH AND LABORATORY USE ONLY</p>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

export default function About() {
  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 mb-20">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-black text-amber-50 mb-6">
            Barn: Transparency, Affordability & Exceptional Service
          </h1>
          <p className="text-xl text-amber-50 leading-relaxed">
            We're reimagining the peptide market with verified products, fair pricing, and customer service that actually cares.
          </p>
        </motion.div>
      </div>

      {/* Story Timeline */}
      <div className="max-w-4xl mx-auto px-4 space-y-8 mb-20">
        {/* Chapter 1 */}
        <StorySection
          icon={Beaker}
          title="A Better Way Forward"
          description="Barn emerged to compete in the peptide market on what matters most: transparency, reliability, and genuine care for our community. We refused to follow the playbook of inflated margins and empty promises. Instead, we built something different—a company that puts customers first."
          highlight="Integrity Over Margins"
        />

        {/* Chapter 2 */}
        <StorySection
          icon={DollarSign}
          title="COA Transparency on Every Product"
          description="We prove our commitment through third-party Certificates of Analysis (COAs) on every batch. No hidden testing, no guesswork—just verifiable proof of purity and potency. Every product sold through Barn comes with accessible, transparent testing documentation so you know exactly what you're getting. This isn't a promise; it's a guarantee backed by actual lab data."
          highlight="100% Verified"
          highlightSecondary="Every Batch"
        />

        {/* Chapter 3 */}
        <StorySection
          icon={Eye}
          title="Affordable Peptides for Everyone"
          description="High quality shouldn't come with a premium price tag. We've restructured our entire operation to offer competitive pricing without sacrificing quality or integrity. By eliminating unnecessary middlemen and being honest about our costs, we deliver research-grade peptides at fair prices. Accessibility matters—we believe everyone conducting legitimate research deserves access to verified products."
          highlight="Quality at Fair Prices"
        />

        {/* Chapter 4 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-barn-brown/20 to-barn-tan/10 border border-barn-brown/30 rounded-lg p-10"
        >
          <h3 className="text-3xl font-bold text-amber-50 mb-4">
            Our Commitment to You
          </h3>
          <p className="text-amber-50 leading-relaxed mb-6">
            We're competing to be the most trusted peptide source in the market. Here's what we stand for:
          </p>
          <ul className="space-y-3 text-amber-50">
            <li className="flex items-start gap-3">
              <span className="text-barn-brown font-bold mt-1">✓</span>
              <span><strong>COAs on Everything:</strong> Every product we sell includes verified third-party testing. No exceptions, no compromises.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-barn-brown font-bold mt-1">✓</span>
              <span><strong>Customer Service That Cares:</strong> Our team is genuinely invested in your success. We answer questions thoroughly, resolve issues quickly, and treat you like a valued member of our community.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-barn-brown font-bold mt-1">✓</span>
              <span><strong>Helping Others Advance:</strong> We believe in the research community. By providing affordable, verified peptides, we're enabling more researchers to contribute to the field.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-barn-brown font-bold mt-1">✓</span>
              <span><strong>Competitive Pricing:</strong> Fair doesn't mean expensive. We compete on price while maintaining the highest standards of quality and transparency.</span>
            </li>
          </ul>
        </motion.div>

        {/* Chapter 5 */}
        <StorySection
          icon={Eye}
          title="Why This Matters"
          description="The peptide research space deserves better. You deserve to know what you're buying, where it comes from, and what it actually costs to produce. When you buy from Barn, you're not just getting a product—you're getting the truth."
          highlight="Transparency isn't a feature we offer. It's our foundation."
        />
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-amber-50 mb-4">
            Ready to Experience Real Transparency?
          </h2>
          <p className="text-stone-300 mb-8 text-lg">
            Explore our products and see exactly what you're getting.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-red-700 hover:bg-red-600 text-amber-50 px-8 py-6 text-lg font-semibold">
              Shop Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}