import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle, AlertCircle, Beaker, ShieldCheck, Microscope, FlaskConical } from 'lucide-react';
import SEO from '@/components/SEO';
import { generateProductSchema, generateHowToSchema, generateFAQSchema } from '@/components/utils/advancedSchemaHelpers';

export default function ProductTirzepatide() {
  const [selectedStrength, setSelectedStrength] = useState(null);

  const product = {
    name: 'Tirzepatide',
    fullName: 'Tirzepatide (Research Grade)',
    description: 'Premium research-grade tirzepatide peptide with verified third-party COA',
    image: 'https://i.ibb.co/kVLqM7Ff/redhelixxx-1.png',
    price_from: 119.99,
    specifications: [
      { name: '5mg vial', price: 119.99, in_stock: true },
      { name: '10mg vial', price: 219.99, in_stock: true },
      { name: '30mg bulk', price: 599.99, in_stock: true }
    ],
    rating: 4.8,
    reviews: 189
  };

  const reconstitutionSteps = [
    {
      title: 'Prepare Workspace',
      description: 'Gather tirzepatide vial, 1mL bacteriostatic water, insulin syringe, alcohol pads, and sterile 18-20 gauge needle on clean surface.'
    },
    {
      title: 'Sterilize Vial Top',
      description: 'Use alcohol pad to sanitize rubber top thoroughly. Allow 30+ seconds to dry completely before proceeding.'
    },
    {
      title: 'Draw Precise Water Volume',
      description: 'Draw exactly 1.0mL (100 units) of USP-grade bacteriostatic water. Accuracy is critical for consistent results.'
    },
    {
      title: 'Inject Into Tirzepatide',
      description: 'Slowly inject water into tirzepatide vial at slight angle. Do NOT shake—allow 2-3 minutes for complete dissolution.'
    },
    {
      title: 'Check Clarity',
      description: 'Solution must be clear and colorless. If cloudiness or particles appear, discard and obtain replacement vial.'
    },
    {
      title: 'Store at 2-8°C',
      description: 'Immediately refrigerate. Stable for 30+ days when properly stored. Keep away from light exposure.'
    }
  ];

  const faqs = [
    {
      question: 'What is tirzepatide and why do researchers study it?',
      answer: 'Tirzepatide is a 39-amino-acid dual GLP-1/GIP receptor agonist peptide. Researchers study it for metabolic regulation, dual-pathway endocrine signaling, glucose homeostasis, appetite suppression mechanisms, and weight regulation pathways. It\'s more complex than single-pathway peptides like semaglutide.'
    },
    {
      question: 'How is tirzepatide different from semaglutide?',
      answer: 'Tirzepatide activates both GLP-1 and GIP (glucose-dependent insulinotropic polypeptide) receptors, while semaglutide targets only GLP-1. This dual-pathway mechanism makes tirzepatide valuable for studying compound metabolic effects and provides broader endocrine pathway research opportunities.'
    },
    {
      question: 'Is tirzepatide third-party tested?',
      answer: 'Yes, extensively. Every batch undergoes HPLC purity verification (>98%), mass spectrometry confirmation of the 39-amino-acid sequence, sterility and microbial screening, and endotoxin testing. Full Certificate of Analysis included with every order.'
    },
    {
      question: 'What is the proper tirzepatide concentration?',
      answer: 'Reconstitute 5mg tirzepatide with 1.0mL bacteriostatic water for 5,000mcg/mL concentration (250mcg per 100-unit insulin syringe mark). Use our Peptide Calculator to adjust water volume for different target concentrations.'
    },
    {
      question: 'How stable is reconstituted tirzepatide?',
      answer: 'Properly reconstituted tirzepatide stored at 2-8°C is stable for 30+ days. Bacteriostatic water prevents bacterial contamination. Do not freeze, as this degrades the peptide. Store away from light when possible using amber vials.'
    },
    {
      question: 'What research applications use tirzepatide?',
      answer: 'Researchers study tirzepatide for dual GLP-1/GIP receptor pathways, metabolic regulation via multiple mechanisms, glucose homeostasis, appetite signaling, weight regulation, endocrine system response, insulin secretion, and comparative efficacy studies versus single-pathway agonists.'
    }
  ];

  const schemas = [
    generateProductSchema(product),
    generateHowToSchema('How to Reconstitute Tirzepatide', reconstitutionSteps),
    generateFAQSchema(faqs)
  ];

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-12 md:pb-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-20 right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-red-600 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-40 left-[-5%] w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-slate-400 rounded-full blur-[60px] md:blur-[100px]" />
      </div>

      <SEO
        title="Buy Tirzepatide Research Peptide USA | Dual GLP-1/GIP Agonist | Red Helix Research"
        description="Premium research-grade tirzepatide with verified COA. Dual GLP-1/GIP agonist for metabolic research. 5mg, 10mg, 30mg bulk. USA supplier."
        keywords="tirzepatide research, buy tirzepatide, tirzepatide peptide, GLP-1 GIP agonist, dual-pathway peptide, metabolic research peptide"
        schema={schemas}
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="text-slate-500 hover:text-red-600 mb-6 md:mb-8 font-bold uppercase tracking-widest text-[10px] md:text-xs p-0 md:p-4 hover:bg-transparent">
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
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                  Purity Verified
                </h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
                  Every batch of Tirzepatide undergoes rigorous HPLC and MS testing to ensure >98% purity and correct sequence identity.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-[24px] md:rounded-[32px] p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-black text-slate-900 mb-3 md:mb-4 uppercase tracking-tighter flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-red-600" />
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
                  <span className="bg-red-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] px-2 md:px-3 py-1 rounded-full">
                    IN STOCK
                  </span>
                  <span className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">
                    Research Compound
                  </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-2 uppercase tracking-tighter leading-none">
                  {product.name}
                </h1>
                <p className="text-xl md:text-2xl font-bold text-red-600 mb-4 tracking-tight">{product.fullName}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(product.rating) ? 'text-red-600 text-base md:text-lg' : 'text-slate-200 text-base md:text-lg'}>★</span>
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
                          : 'bg-white border-slate-100 text-slate-900 hover:border-red-600/30'
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
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-8 md:py-10 rounded-[20px] md:rounded-[24px] text-xl md:text-2xl font-black uppercase tracking-tighter shadow-lg shadow-red-200 transition-all active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none" 
                  disabled={!selectedStrength}
                >
                  ADD TO RESEARCH CART
                </Button>
                
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-[20px] flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[9px] md:text-[10px] leading-tight font-bold text-slate-500 uppercase tracking-wider">
                    <span className="text-red-600">WARNING:</span> This compound is strictly for laboratory research use only. Not for human or animal consumption.
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
              <FlaskConical className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
              Technical Data
            </h2>
            <div className="space-y-3 md:space-y-4">
              {[
                { label: 'Amino Acids', value: '39' },
                { label: 'Peptide Type', value: 'Dual GLP-1/GIP Agonist' },
                { label: 'Molecular Weight', value: '~5,411 Da' },
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
              <Beaker className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
              Reconstitution
            </h2>
            <div className="space-y-5 md:space-y-6">
              {reconstitutionSteps.slice(0, 4).map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-red-600 flex items-center justify-center font-black text-[10px] md:text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-tight mb-1 text-sm md:text-base">{step.title}</h3>
                    <p className="text-slate-400 text-[11px] md:text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
              <Link to={createPageUrl('PeptideAcademy')}>
                <Button variant="outline" className="w-full mt-4 border-slate-700 text-white hover:bg-red-600 hover:border-red-600 rounded-[16px] md:rounded-[20px] font-black uppercase tracking-tighter text-xs md:text-sm h-12 md:h-auto">
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
              Research <span className="text-red-600">Insights</span>
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-sm">Frequently Asked Questions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-[24px] md:rounded-[32px] p-6 md:p-8 hover:border-red-600/30 transition-colors">
                <h3 className="text-lg md:text-xl font-black text-slate-900 mb-3 md:mb-4 uppercase tracking-tighter leading-tight">{faq.question}</h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">{faq.answer}</p>
              </div>
            ))}
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
             <div className="absolute top-[-50%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-red-600 rounded-full blur-[80px] md:blur-[100px]" />
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6 uppercase tracking-tighter">
              Ready to Initiate <span className="text-red-600">Protocol?</span>
            </h3>
            <p className="text-slate-600 font-bold mb-8 md:mb-10 leading-relaxed uppercase tracking-wide text-[10px] md:text-sm">
              All Tirzepatide orders include serialized COA verification and priority cold-chain shipping options.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link to={createPageUrl('Home')}>
                <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 md:px-12 py-6 md:py-8 rounded-[20px] md:rounded-[24px] font-black uppercase tracking-tighter text-base md:text-lg">
                  Browse Catalog
                </Button>
              </Link>
              <Link to={createPageUrl('Contact')}>
                <Button variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-900 px-8 md:px-12 py-6 md:py-8 rounded-[20px] md:rounded-[24px] font-black uppercase tracking-tighter text-base md:text-lg hover:bg-slate-50">
                  Consultation
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
