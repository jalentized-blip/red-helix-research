import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle, AlertCircle, Beaker, ShieldCheck, Microscope, FlaskConical, FileText, Calculator, BookOpen } from 'lucide-react';
import SEO from '@/components/SEO';
import { generateProductSchema, generateHowToSchema, generateFAQSchema, generateBreadcrumbSchema, generateMedicalWebPageSchema } from '@/components/utils/advancedSchemaHelpers';
import { RelatedPeptides, ResourceLinks, InternalLinkFooter } from '@/components/RelatedPeptides';

export default function ProductBPC157() {
  const [selectedStrength, setSelectedStrength] = useState(null);

  // Breadcrumbs for SEO structure
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Research Peptides', url: '/Products' },
    { name: 'BPC-157', url: '/ProductBPC157' }
  ];

  const product = {
    name: 'BPC-157',
    fullName: 'Body Protection Compound-157',
    description: 'Premium research-grade BPC-157 peptide with verified third-party COA',
    image: 'https://i.ibb.co/kVLqM7Ff/redhelixxx-1.png',
    price_from: 49.99,
    specifications: [
      { name: '5mg vial', price: 49.99, in_stock: true },
      { name: '10mg vial', price: 89.99, in_stock: true },
      { name: '50mg bulk', price: 349.99, in_stock: true }
    ],
    rating: 4.8,
    reviews: 127
  };

  const reconstitutionSteps = [
    {
      title: 'Prepare Your Workspace',
      description: 'Gather all materials: BPC-157 vial, bacteriostatic water, insulin syringe, alcohol pads, and sterile needle. Use a clean, flat surface.'
    },
    {
      title: 'Sterilize the Vial',
      description: 'Sanitize the rubber top of your BPC-157 vial with an alcohol pad. Let it dry completely (30+ seconds) to ensure sterility.'
    },
    {
      title: 'Draw Bacteriostatic Water',
      description: 'Using an insulin syringe, draw 1.0mL (100 units) of USP-grade bacteriostatic water. Ensure accuracy for optimal peptide concentration.'
    },
    {
      title: 'Inject Water into BPC-157',
      description: 'Slowly inject the bacteriostatic water into the BPC-157 vial at a slight angle. Do NOT shake—allow 2-3 minutes for dissolution.'
    },
    {
      title: 'Verify Dissolution',
      description: 'The solution should be clear and colorless. If cloudiness persists, gently roll the vial between your hands. Do not use if contamination is visible.'
    },
    {
      title: 'Refrigerate Immediately',
      description: 'Store the reconstituted BPC-157 at 2-8°C. Properly reconstituted peptide is stable for 30+ days. Keep away from direct light.'
    }
  ];

  const faqs = [
    {
      question: 'What is BPC-157 and why do researchers use it?',
      answer: 'BPC-157 (Body Protection Compound-157) is a naturally occurring 15-amino-acid peptide found in gastric juice. Researchers study it for its applications in tissue repair, musculoskeletal recovery, gastrointestinal health, neuroprotection, and vascular function.'
    },
    {
      question: 'How do I know your BPC-157 is high quality?',
      answer: 'Every batch undergoes rigorous third-party laboratory testing including HPLC purity analysis (>98% verified), mass spectrometry for molecular weight confirmation, sterility and microbial screening, and endotoxin testing. A full Certificate of Analysis (COA) is provided with every order.'
    },
    {
      question: 'How should I store BPC-157 after reconstitution?',
      answer: 'Store reconstituted BPC-157 at 2-8°C in a refrigerator, protected from light. Use amber vials if possible. Properly stored, it remains stable for 30+ days. Do not freeze reconstituted solutions.'
    },
    {
      question: 'What is the recommended concentration?',
      answer: 'We recommend reconstituting 5mg BPC-157 with 1.0mL of bacteriostatic water for a concentration of 5,000mcg/mL (250mcg per 100-unit insulin syringe marking). Use our Peptide Calculator for custom concentrations.'
    },
    {
      question: 'Do you provide Certificates of Analysis (COA)?',
      answer: 'Yes. Every batch of BPC-157 comes with a full third-party Certificate of Analysis documenting purity, molecular weight, batch number, testing date, and laboratory credentials. Available for download in your account.'
    },
    {
      question: 'Is BPC-157 tested for contamination?',
      answer: 'Yes. Testing includes microbial contamination screening (bacteria, fungi) and endotoxin testing to ensure product safety for research applications. All results are documented in your COA.'
    }
  ];

  const schemas = [
    generateProductSchema(product),
    generateHowToSchema('How to Reconstitute BPC-157', reconstitutionSteps),
    generateFAQSchema(faqs),
    generateBreadcrumbSchema(breadcrumbs),
    generateMedicalWebPageSchema({
      title: 'BPC-157 Research Peptide Data',
      description: 'Technical research data, chemical properties, and handling protocols for BPC-157 pentadecapeptide.'
    })
  ];

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-12 md:pb-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-20 right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#dc2626] rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-40 left-[-5%] w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-slate-400 rounded-full blur-[60px] md:blur-[100px]" />
      </div>

      <SEO
        title="Buy BPC-157 Peptide — Lab-Tested 5mg, 10mg, 50mg | USA Supplier"
        description="Buy BPC-157 (Body Protection Compound-157) from $49.99. HPLC-verified >98% purity with third-party COA. 5mg, 10mg, and 50mg bulk options. USA-based peptide supplier."
        keywords="buy BPC-157, BPC-157 peptide, BPC-157 5mg, BPC-157 10mg, BPC-157 50mg, BPC-157 for sale, BPC-157 USA, body protection compound 157, research peptide BPC-157, BPC-157 purity, BPC-157 COA, buy research peptides, BPC-157 reconstitution, BPC-157 price, peptide supplier USA, high purity BPC-157, BPC-157 lab tested, BPC-157 vial"
        schema={schemas}
        canonical="https://redhelixresearch.com/ProductBPC157"
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="text-slate-500 hover:text-[#dc2626] mb-6 md:mb-8 font-bold uppercase tracking-widest text-[10px] md:text-xs p-0 md:p-4 hover:bg-transparent">
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Back to Products
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-12 md:mb-20">
          {/* Left Column: Product Image & Selection */}
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white border border-slate-200 rounded-[32px] md:rounded-[40px] p-3 md:p-4 shadow-xl shadow-slate-100 overflow-hidden mb-6 md:mb-8">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[300px] md:h-[500px] object-cover rounded-[24px] md:rounded-[32px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-slate-50 border border-slate-200 rounded-[24px] md:rounded-[32px] p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-black text-slate-900 mb-3 md:mb-4 uppercase tracking-tighter flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#dc2626]" />
                  Purity Verified
                </h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
                  Every batch of BPC-157 undergoes rigorous HPLC and MS testing to ensure >98% purity and correct sequence identity.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-[24px] md:rounded-[32px] p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-black text-slate-900 mb-3 md:mb-4 uppercase tracking-tighter flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-[#dc2626]" />
                  Lab Grade
                </h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
                  Synthesized in a sterile environment and lyophilized for maximum stability during transit and storage.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Product Info & CTA */}
          <motion.div 
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white border border-slate-200 rounded-[32px] md:rounded-[40px] p-6 md:p-12 shadow-xl shadow-slate-100 h-full flex flex-col">
              <div className="mb-6 md:mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-[#dc2626] text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] px-2 md:px-3 py-1 rounded-full">
                    IN STOCK
                  </span>
                  <span className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">
                    Research Compound
                  </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-2 uppercase tracking-tighter leading-none">
                  {product.name}
                </h1>
                <p className="text-xl md:text-2xl font-bold text-[#dc2626] mb-4 tracking-tight">{product.fullName}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(product.rating) ? 'text-[#dc2626] text-base md:text-lg' : 'text-slate-200 text-base md:text-lg'}>★</span>
                    ))}
                  </div>
                  <span className="text-slate-500 font-bold text-[10px] md:text-sm uppercase tracking-widest">{product.reviews} REVIEWS</span>
                </div>
              </div>

              <div className="mb-8 md:mb-10">
                <p className="text-slate-900 text-[10px] md:text-xs font-black mb-4 uppercase tracking-widest">SELECT CONFIGURATION</p>
                <div className="space-y-3">
                  {product.specifications.map((spec) => (
                    <button
                      key={spec.name}
                      onClick={() => setSelectedStrength(spec)}
                      className={`w-full p-4 md:p-6 rounded-[20px] md:rounded-[24px] border-2 transition-all text-left flex justify-between items-center group ${
                        selectedStrength?.name === spec.name
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-100 text-slate-900 hover:border-[#dc2626]/30'
                      }`}
                    >
                      <div>
                        <div className="font-black uppercase tracking-tighter text-base md:text-lg">{spec.name}</div>
                        <div className={`text-[10px] md:text-sm font-bold ${selectedStrength?.name === spec.name ? 'text-slate-400' : 'text-slate-500'}`}>
                          Verified Laboratory Grade
                        </div>
                      </div>
                      <div className="text-xl md:text-2xl font-black tracking-tighter">${spec.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto">
                <Button 
                  className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white py-8 md:py-10 rounded-[20px] md:rounded-[24px] text-xl md:text-2xl font-black uppercase tracking-tighter shadow-lg shadow-red-200 transition-all active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none" 
                  disabled={!selectedStrength}
                >
                  ADD TO RESEARCH CART
                </Button>
                
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-[20px] flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
                  <p className="text-[9px] md:text-[10px] leading-tight font-bold text-slate-500 uppercase tracking-wider">
                    <span className="text-[#dc2626]">WARNING:</span> This compound is strictly for laboratory research use only. Not for human or animal consumption.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Technical Specifications Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-slate-200 rounded-[32px] md:rounded-[40px] p-8 md:p-10 shadow-xl shadow-slate-100"
          >
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 md:mb-8 uppercase tracking-tighter flex items-center gap-3">
              <FlaskConical className="w-6 h-6 md:w-8 md:h-8 text-[#dc2626]" />
              Technical Data
            </h2>
            <div className="space-y-3 md:space-y-4">
              {[
                { label: 'Amino Acids', value: '15' },
                { label: 'Molecular Formula', value: 'C62H98N16O22' },
                { label: 'Molecular Weight', value: '~1,494 Da' },
                { label: 'Purity', value: '>98.0% (HPLC)' },
                { label: 'Form', value: 'Lyophilized Powder' },
                { label: 'Storage', value: '2-8°C (Reconstituted)' },
                { label: 'Stability', value: '30+ Days (Reconstituted)' }
              ].map((spec, i) => (
                <div key={i} className="flex justify-between items-center py-2 md:py-3 border-b border-slate-50 last:border-0">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">{spec.label}</span>
                  <span className="text-slate-900 font-black tracking-tight text-xs md:text-base">{spec.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900 text-white rounded-[32px] md:rounded-[40px] p-8 md:p-10 shadow-xl shadow-slate-900/10"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-6 md:mb-8 uppercase tracking-tighter flex items-center gap-3">
              <Beaker className="w-6 h-6 md:w-8 md:h-8 text-[#dc2626]" />
              Reconstitution
            </h2>
            <div className="space-y-5 md:space-y-6">
              {reconstitutionSteps.slice(0, 4).map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#dc2626] flex items-center justify-center font-black text-[10px] md:text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-tight mb-1 text-sm md:text-base">{step.title}</h3>
                    <p className="text-slate-400 text-[11px] md:text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
              <Link to={createPageUrl('PeptideAcademy')}>
                <Button variant="outline" className="w-full mt-4 border-slate-700 text-white hover:bg-[#dc2626] hover:border-[#dc2626] rounded-[16px] md:rounded-[20px] font-black uppercase tracking-tighter text-xs md:text-sm h-12 md:h-auto">
                  View Full Reconstitution Guide
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 md:mb-20"
        >
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-4">
              Research <span className="text-[#dc2626]">Insights</span>
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-sm">Frequently Asked Questions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-[24px] md:rounded-[32px] p-6 md:p-8 hover:border-[#dc2626]/30 transition-colors">
                <h3 className="text-lg md:text-xl font-black text-slate-900 mb-3 md:mb-4 uppercase tracking-tighter leading-tight">{faq.question}</h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* E-E-A-T Trust Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 md:mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 text-center">
              <FileText className="w-8 h-8 text-[#dc2626] mx-auto mb-3" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Third-Party Tested</h3>
              <p className="text-xs text-slate-500 font-medium">Every BPC-157 batch includes an independent COA with HPLC purity, MS confirmation, and sterility results.</p>
              <Link to={createPageUrl('COAReports')} className="text-[10px] font-black text-[#dc2626] uppercase tracking-widest mt-3 inline-block hover:underline">
                View COA Reports →
              </Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 text-center">
              <Calculator className="w-8 h-8 text-[#dc2626] mx-auto mb-3" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Dosage Calculator</h3>
              <p className="text-xs text-slate-500 font-medium">Use our free peptide calculator to determine exact BPC-157 reconstitution volumes and concentrations.</p>
              <Link to={createPageUrl('PeptideCalculator')} className="text-[10px] font-black text-[#dc2626] uppercase tracking-widest mt-3 inline-block hover:underline">
                Calculate Dosage →
              </Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 text-center">
              <BookOpen className="w-8 h-8 text-[#dc2626] mx-auto mb-3" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Research Guide</h3>
              <p className="text-xs text-slate-500 font-medium">Read our comprehensive BPC-157 research guide with molecular data, clinical references, and protocols.</p>
              <Link to={createPageUrl('BlogGuide')} className="text-[10px] font-black text-[#dc2626] uppercase tracking-widest mt-3 inline-block hover:underline">
                Read Research →
              </Link>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-slate-50 border border-slate-200 rounded-[32px] md:rounded-[40px] p-8 md:p-20 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.05]">
            <div className="absolute top-[-50%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#dc2626] rounded-full blur-[80px] md:blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6 uppercase tracking-tighter">
              Ready to Initiate <span className="text-[#dc2626]">Protocol?</span>
            </h3>
            <p className="text-slate-600 font-bold mb-8 md:mb-10 leading-relaxed uppercase tracking-wide text-[10px] md:text-sm">
              All BPC-157 orders include serialized COA verification and priority cold-chain shipping options.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link to={createPageUrl('Products')}>
                <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 md:px-12 py-6 md:py-8 rounded-[20px] md:rounded-[24px] font-black uppercase tracking-tighter text-base md:text-lg">
                  Browse Catalog
                </Button>
              </Link>
              <Link to={createPageUrl('PeptideComparison')}>
                <Button variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-900 px-8 md:px-12 py-6 md:py-8 rounded-[20px] md:rounded-[24px] font-black uppercase tracking-tighter text-base md:text-lg hover:bg-slate-50">
                  Compare Peptides
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Related Peptides - Internal Linking for SEO */}
        <RelatedPeptides currentPeptide="BPC-157" />

        {/* Resource Links */}
        <ResourceLinks maxItems={8} />

        {/* Internal Link Footer */}
        <InternalLinkFooter />
      </div>
    </div>
  );
}
