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
import SEO from '@/components/SEO';

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
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Red Helix Research",
    "description": "Learn about Red Helix Research's commitment to transparency, quality, and affordable research peptides with verified COAs.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Red Helix Research",
      "description": "Leading supplier of research-grade peptides with third-party verification and Certificate of Analysis for every product."
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20 relative">
      <SEO 
        title="About Red Helix Research - Research Peptide Supplier"
        description="Red Helix Research supplies research-grade peptides for laboratory use only. Verified COAs, transparent documentation, supporting scientific research. All products for in vitro research, not for human consumption."
        keywords="about red helix research, research peptide supplier, laboratory peptides, peptide vendor, research chemicals, verified research peptides, COA peptides, research peptide company, in vitro research, scientific research peptides"
        schema={aboutSchema}
      />
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
            className="text-xl text-amber-50 leading-relaxed mb-4"
            animate={{ 
              textShadow: [
                '0 0 5px rgba(125, 74, 43, 0.3)',
                '0 0 10px rgba(125, 74, 43, 0.5)',
                '0 0 5px rgba(125, 74, 43, 0.3)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            We provide research-grade peptides for laboratory and scientific research purposes only.
          </motion.p>
          <div className="bg-yellow-950/40 border border-yellow-700/50 rounded-lg px-6 py-4">
            <p className="text-yellow-100 text-sm font-semibold">
              ⚠️ FOR RESEARCH AND LABORATORY USE ONLY - All products are intended strictly for in vitro research and are not approved for human consumption, therapeutic use, or any clinical application.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Story Timeline */}
      <div className="max-w-4xl mx-auto px-4 space-y-8 mb-20 relative z-10">
        {/* Chapter 1 */}
        <StorySection
          icon={Beaker}
          title="A Better Way Forward"
          description="Red Helix Research supplies research-grade peptides to the scientific research community. We provide transparent, verified products for laboratory use with proper documentation and COAs. Our peptides are intended strictly for in vitro research and non-clinical laboratory applications."
          highlight="Research Use Only"
        />

        {/* Chapter 2 */}
        <StorySection
          icon={DollarSign}
          title="COA Transparency on Every Product"
          description="We prove our commitment through third-party Certificates of Analysis (COAs) on every batch. No hidden testing, no guesswork—just verifiable proof of purity and potency. Every product sold through Red Helix Research comes with accessible, transparent testing documentation so you know exactly what you're getting. This isn't a promise; it's a guarantee backed by actual lab data."
          highlight="100% Verified"
          highlightSecondary="         Every Batch"
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
            We provide research-grade peptides for laboratory and scientific research. Here's our commitment to the research community:
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
              <span><strong>Supporting Scientific Research:</strong> We supply verified peptides for legitimate laboratory research, enabling researchers to conduct in vitro studies and non-clinical investigations.</span>
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
          description="Red Helix Research provides verified, lab-tested research peptides with transparent documentation. All products are intended for laboratory research purposes only and are not approved for human consumption. We support the scientific research community with quality materials for in vitro studies."
          highlight="Research Grade Quality"
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
            Research-Grade Peptides for Laboratory Use
          </HolographicText>
          <p className="text-amber-50 mb-8 text-lg">
            Explore our research peptides with verified COAs for laboratory applications.
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