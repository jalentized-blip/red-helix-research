import React from 'react';
import { ArrowLeft, Eye, DollarSign, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import TechGrid from '@/components/effects/TechGrid';
import HolographicText from '@/components/effects/HolographicText';
import GlowingCard from '@/components/effects/GlowingCard';
import ParticleField from '@/components/effects/ParticleField';

const StorySection = ({ icon: Icon, title, description, highlight, highlightSecondary }) => (
  <GlowingCard>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-8"
    >
      <div className="flex items-start gap-4">
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 10px rgba(125, 74, 43, 0.5)',
              '0 0 20px rgba(125, 74, 43, 0.8)',
              '0 0 10px rgba(125, 74, 43, 0.5)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="rounded-full p-2 bg-stone-800"
        >
          <Icon className="w-8 h-8 text-red-600 flex-shrink-0" />
        </motion.div>
        <div>
          <HolographicText className="text-2xl font-bold text-amber-50 mb-3">{title}</HolographicText>
          <p className="text-amber-50 leading-relaxed mb-3">{description}</p>
          {highlight && (
            <div className="mt-4 space-y-0">
              <HolographicText className="text-3xl font-black text-amber-50">{highlight}</HolographicText>
              {highlightSecondary && (
                <HolographicText className="text-3xl font-black text-amber-50">{highlightSecondary}</HolographicText>
              )}
              <p className="text-white font-semibold text-lg mt-6 mb-3">Every Batch Tested. Every Result Trusted.</p>
              <p className="text-amber-50 text-sm">FOR RESEARCH AND LABORATORY USE ONLY</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  </GlowingCard>
);

export default function About() {
  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20 relative">
      <TechGrid />
      <ParticleField />
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 mb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 mb-8 group">
            <motion.div
              whileHover={{ x: -5 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.div>
            <span className="relative">
              Back to Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300" />
            </span>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <HolographicText className="text-5xl font-black text-amber-50 mb-6 block">
            Red Helix Research: Transparency, Affordability & Exceptional Service
          </HolographicText>
          <motion.p 
            className="text-xl text-amber-50 leading-relaxed"
            animate={{ 
              textShadow: [
                '0 0 5px rgba(125, 74, 43, 0.3)',
                '0 0 10px rgba(125, 74, 43, 0.5)',
                '0 0 5px rgba(125, 74, 43, 0.3)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            We're reimagining the peptide market with verified products, fair pricing, and customer service that actually cares.
          </motion.p>
        </motion.div>
      </div>

      {/* Story Timeline */}
      <div className="max-w-4xl mx-auto px-4 space-y-8 mb-20 relative z-10">
        {/* Chapter 1 */}
        <StorySection
          icon={Beaker}
          title="A Better Way Forward"
          description="Red Dirt Research emerged to compete in the peptide market on what matters most: transparency, reliability, and genuine care for our community. We refused to follow the playbook of inflated margins and empty promises. Instead, we built something different—a company that puts customers first."
          highlight="Integrity Over Margins"
        />

        {/* Chapter 2 */}
        <StorySection
          icon={DollarSign}
          title="COA Transparency on Every Product"
          description="We prove our commitment through third-party Certificates of Analysis (COAs) on every batch. No hidden testing, no guesswork—just verifiable proof of purity and potency. Every product sold through Red Dirt Research comes with accessible, transparent testing documentation so you know exactly what you're getting. This isn't a promise; it's a guarantee backed by actual lab data."
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
        <GlowingCard>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-red-700/20 to-red-800/10 p-10"
          >
          <HolographicText className="text-3xl font-bold text-amber-50 mb-4 block">
            Our Commitment to You
          </HolographicText>
          <p className="text-amber-50 leading-relaxed mb-6">
            We're competing to be the most trusted peptide source in the market. Here's what we stand for:
          </p>
          <ul className="space-y-3 text-amber-50">
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold mt-1">✓</span>
              <span><strong>COAs on Everything:</strong> Every product we sell includes verified third-party testing. No exceptions, no compromises.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold mt-1">✓</span>
              <span><strong>Customer Service That Cares:</strong> Our team is genuinely invested in your success. We answer questions thoroughly, resolve issues quickly, and treat you like a valued member of our community.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold mt-1">✓</span>
              <span><strong>Helping Others Advance:</strong> We believe in the research community. By providing affordable, verified peptides, we're enabling more researchers to contribute to the field.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold mt-1">✓</span>
              <span><strong>Competitive Pricing:</strong> Fair doesn't mean expensive. We compete on price while maintaining the highest standards of quality and transparency.</span>
            </li>
          </ul>
          </motion.div>
          </GlowingCard>

        {/* Chapter 5 */}
        <StorySection
          icon={Eye}
          title="Why We're Different"
          description="In a market full of shortcuts and hype, Red Dirt Research stands out because we genuinely care about your success. We're not trying to maximize margins—we're trying to build a community of trusted researchers with access to verified products at fair prices. Every decision we make is guided by one question: Is this in the best interest of our customers?"
          highlight="Excellence in Every Interaction"
        />
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <HolographicText className="text-3xl font-bold text-amber-50 mb-4 block">
            Ready to Experience Real Transparency?
          </HolographicText>
          <p className="text-amber-50 mb-8 text-lg">
            Explore our products and see exactly what you're getting.
          </p>
          <Link to={createPageUrl('Home')}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-red-700 hover:bg-red-600 text-amber-50 px-8 py-6 text-lg font-semibold relative overflow-hidden group">
                <span className="relative z-10">Shop Now</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}