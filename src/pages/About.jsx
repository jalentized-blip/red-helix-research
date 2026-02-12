import React from 'react';
import { ArrowLeft, Eye, DollarSign, Beaker, ShieldCheck, Zap, Heart, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';

const StorySection = ({ icon: Icon, title, description, highlight, highlightSecondary }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 shadow-xl shadow-slate-100 hover:border-[#dc2626]/30 transition-all group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
      <Icon className="w-48 h-48 text-slate-900" />
    </div>
    
    <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
      <div className="w-16 h-16 bg-[#dc2626] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#dc2626]/20 group-hover:scale-110 transition-transform">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div>
        <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter leading-none group-hover:text-[#dc2626] transition-colors">
          {title}
        </h3>
        <p className="text-lg text-slate-500 leading-relaxed mb-6 font-medium">
          {description}
        </p>
        {highlight && (
          <div className="inline-flex flex-col gap-1 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{highlightSecondary || 'Research Status'}</span>
            <span className="text-lg font-black text-[#dc2626] uppercase tracking-tight">{highlight}</span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
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
    <div className="min-h-screen bg-white pt-32 pb-20 relative overflow-hidden">
      <SEO 
        title="About Red Helix Research - Research Peptide Supplier"
        description="Red Helix Research supplies research-grade peptides for laboratory use only. Verified COAs, transparent documentation, supporting scientific research. All products for in vitro research, not for human consumption."
        keywords="about red helix research, research peptide supplier, laboratory peptides, peptide vendor, research chemicals, verified research peptides, COA peptides, research peptide company, in vitro research, scientific research peptides"
        schema={aboutSchema}
      />

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-[#dc2626] rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-[-10%] w-[600px] h-[600px] bg-slate-600 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 mb-20 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" className="mb-8 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-bold uppercase tracking-wider text-xs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 uppercase tracking-tighter leading-none">
            Our <span className="text-[#dc2626]">Mission</span>
          </h1>
          
          <p className="text-2xl text-slate-500 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
            Red Helix Research is dedicated to providing the scientific community with 
            unmatched transparency, clinical-grade purity, and verifiable laboratory data.
          </p>

          <div className="inline-flex items-center gap-4 px-8 py-4 bg-[#fef2f2] border border-[#fee2e2] rounded-3xl shadow-lg shadow-[#fee2e2]/50">
            <ShieldCheck className="w-6 h-6 text-[#dc2626]" />
            <span className="text-sm font-black text-[#dc2626] uppercase tracking-widest">
              FOR RESEARCH AND LABORATORY USE ONLY
            </span>
          </div>
        </motion.div>
      </div>

      {/* Stats/Highlights Grid */}
      <div className="max-w-7xl mx-auto px-4 mb-32 grid md:grid-cols-3 gap-8 relative z-10">
        {[
          { icon: ShieldCheck, label: 'Quality', title: '100% Verified', desc: 'Every batch undergoes third-party analysis.' },
          { icon: Zap, label: 'Speed', title: 'Rapid Fulfillment', desc: 'Same-day processing for all research orders.' },
          { icon: Heart, label: 'Trust', title: 'Direct Transparency', desc: 'Public access to all COA documentation.' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 text-center hover:bg-white hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <stat.icon className="w-6 h-6 text-[#dc2626]" />
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
            <h4 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">{stat.title}</h4>
            <p className="text-sm text-slate-500 font-medium">{stat.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="max-w-5xl mx-auto px-4 space-y-12 mb-32 relative z-10">
        <StorySection
          icon={Beaker}
          title="Clinical Precision"
          description="We provide research-grade peptides to the scientific community with a focus on precision and reliability. Every reagent is handled with strict protocols to ensure maximum stability and performance in your laboratory environment."
          highlight="Laboratory Grade"
          highlightSecondary="Protocol Integrity"
        />

        <StorySection
          icon={Award}
          title="Verified Purity"
          description="Transparency isn't just a word; it's our foundational principle. We provide comprehensive third-party Certificates of Analysis (COAs) for every single batch, proving our commitment to 99%+ purity standards."
          highlight="99%+ Pure"
          highlightSecondary="Third-Party Tested"
        />

        <StorySection
          icon={DollarSign}
          title="Research Accessibility"
          description="High-quality research materials should be accessible. By optimizing our supply chain and focusing on direct-to-researcher distribution, we offer the most competitive pricing in the industry without compromising on quality."
          highlight="Direct Pricing"
          highlightSecondary="Optimized Supply"
        />
      </div>

      {/* Final Commitment Box */}
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="bg-white border border-slate-200 rounded-[40px] p-10 md:p-20 text-center relative overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
            <ShieldCheck className="w-64 h-64 text-slate-900" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 uppercase tracking-tighter leading-none">
              The Red Helix <span className="text-[#dc2626]">Standard</span>
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Our commitment to the scientific community is unwavering. We provide the tools, 
              you provide the discovery. Together, we advance the boundaries of research.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
              {[
                'Public COA Database',
                'Same-Day Laboratory Shipping',
                'Secure Research Supply',
                '24/7 Technical Support'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-left p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-[#dc2626]/30 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-[#dc2626] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">{item}</span>
                </div>
              ))}
            </div>

            <Link to={createPageUrl('Home')}>
              <Button size="lg" className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-12 py-8 rounded-full font-black uppercase tracking-widest text-sm shadow-xl shadow-[#dc2626]/20">
                Explore Research Catalog
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Compliance Footer */}
      <div className="max-w-4xl mx-auto px-4 mt-32 text-center opacity-50">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Regulatory Compliance</p>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          All products are intended strictly for in vitro laboratory research and are not approved for human consumption, 
          veterinary use, or any clinical application. Red Helix Research operates in full compliance with 
          scientific research material distribution guidelines.
        </p>
      </div>
    </div>
  );
}
