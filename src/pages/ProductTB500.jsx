import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle, AlertCircle, Beaker } from 'lucide-react';
import SEO from '@/components/SEO';
import { generateProductSchema, generateHowToSchema, generateFAQSchema } from '@/components/utils/advancedSchemaHelpers';

export default function ProductTB500() {
  const [selectedStrength, setSelectedStrength] = useState(null);

  const product = {
    name: 'TB-500',
    fullName: 'Thymosin Beta-4',
    description: 'Premium research-grade TB-500 peptide with verified third-party COA',
    image: 'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=800&q=80',
    price_from: 59.99,
    specifications: [
      { name: '5mg vial', price: 59.99, in_stock: true },
      { name: '10mg vial', price: 99.99, in_stock: true },
      { name: '50mg bulk', price: 449.99, in_stock: true }
    ],
    rating: 4.9,
    reviews: 142
  };

  const reconstitutionSteps = [
    {
      title: 'Prepare Materials',
      description: 'Gather TB-500 vial, 1mL bacteriostatic water, insulin syringe, alcohol pads, and sterile needle on a clean workspace.'
    },
    {
      title: 'Sterilize Vial Top',
      description: 'Use alcohol pad to thoroughly sanitize the rubber top of TB-500 vial. Allow 30+ seconds for complete drying.'
    },
    {
      title: 'Draw Bacteriostatic Water',
      description: 'Draw exactly 1.0mL (100 units) of USP-grade bacteriostatic water using the insulin syringe for precise measurement.'
    },
    {
      title: 'Inject into TB-500',
      description: 'Slowly inject water into the TB-500 vial at a slight angle. Do NOT shake—TB-500 requires 3-5 minutes to fully dissolve.'
    },
    {
      title: 'Check for Clarity',
      description: 'Solution should be completely clear and colorless. Gently roll vial if needed. Discard if cloudiness or particles appear.'
    },
    {
      title: 'Store at 2-8°C',
      description: 'Immediately refrigerate reconstituted TB-500. Stable for 30+ days when properly stored away from light.'
    }
  ];

  const faqs = [
    {
      question: 'What is TB-500 (Thymosin Beta-4)?',
      answer: 'TB-500 is a naturally occurring 43-amino-acid peptide found in high concentrations in wound healing fluid and immune cells. Researchers study it for tissue repair, musculoskeletal recovery, cardiovascular function, and angiogenesis (blood vessel formation).'
    },
    {
      question: 'How is TB-500 different from BPC-157?',
      answer: 'TB-500 has 43 amino acids vs BPC-157\'s 15, making it structurally more complex. TB-500 is studied primarily for cellular protection and proliferation, while BPC-157 focuses on localized tissue repair. Both are valuable for different research applications.'
    },
    {
      question: 'How do I verify the quality of your TB-500?',
      answer: 'Every batch includes a full Certificate of Analysis (COA) with HPLC purity verification (>98%), mass spectrometry confirmation of the complete 43-amino-acid sequence, sterility testing, and endotoxin screening. Download your COA in your account.'
    },
    {
      question: 'What is the proper TB-500 reconstitution concentration?',
      answer: 'Reconstitute 5mg TB-500 with 1.0mL bacteriostatic water for 5,000mcg/mL concentration (250mcg per 100-unit insulin syringe mark). Adjust water volume proportionally for different peptide amounts or desired concentrations.'
    },
    {
      question: 'How stable is TB-500 after reconstitution?',
      answer: 'Properly reconstituted TB-500 stored at 2-8°C is stable for 30+ days. Bacteriostatic water prevents bacterial growth. Do not freeze, as this degrades the peptide structure. Keep away from light when possible.'
    },
    {
      question: 'Is TB-500 tested for purity and identity?',
      answer: 'Yes, extensively. HPLC confirms purity and molecular identity. Mass spectrometry validates all 43 amino acids in correct sequence. Sterility and endotoxin testing ensure safety for research. Full results on your COA.'
    }
  ];

  const schemas = [
    generateProductSchema(product),
    generateHowToSchema('How to Reconstitute TB-500', reconstitutionSteps),
    generateFAQSchema(faqs)
  ];

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Buy TB-500 (Thymosin Beta-4) Peptide USA | Lab-Tested Research Compound"
        description="Premium TB-500 thymosin beta-4 peptide with verified third-party COA. 5mg, 10mg, bulk options. High purity research-grade peptide supplier USA."
        keywords="TB-500, thymosin beta-4, TB-500 peptide, research peptide, lab-tested thymosin, buy TB-500, recovery peptide, tissue healing peptide"
        schema={schemas}
      />

      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-8">
            ← Back to Products
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg mb-6 border border-stone-700"
            />
            <div className="bg-stone-900/60 border border-stone-700 rounded-lg p-6">
              <h1 className="text-4xl font-black text-amber-50 mb-2">{product.name}</h1>
              <p className="text-stone-400 mb-4">{product.fullName}</p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(product.rating) ? 'text-red-600 text-lg' : 'text-stone-600 text-lg'}>★</span>
                  ))}
                </div>
                <span className="text-stone-300">{product.rating}/5 • {product.reviews} reviews</span>
              </div>

              <div className="mb-6">
                <p className="text-stone-300 text-sm font-semibold mb-3">SELECT STRENGTH:</p>
                <div className="space-y-2">
                  {product.specifications.map((spec) => (
                    <button
                      key={spec.name}
                      onClick={() => setSelectedStrength(spec)}
                      className={`w-full p-3 rounded-lg border transition-all text-left ${
                        selectedStrength?.name === spec.name
                          ? 'bg-red-700/30 border-red-700 text-amber-50'
                          : 'bg-stone-800/50 border-stone-700 text-stone-300 hover:border-red-700'
                      }`}
                    >
                      <div className="font-semibold">{spec.name}</div>
                      <div className="text-sm">${spec.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-red-700 hover:bg-red-600 text-amber-50 py-6 text-lg font-semibold" disabled={!selectedStrength}>
                ADD TO CART
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="space-y-6">
              <div className="bg-stone-900/60 border border-stone-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-red-600" />
                  Verified Quality
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-stone-300">&gt;98% Purity verified by HPLC</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-stone-300">43-amino-acid sequence confirmed via MS</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-stone-300">Third-party Certificate of Analysis (COA)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-stone-300">Sterility and microbial screening</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-stone-300">Endotoxin testing for safety</span>
                  </li>
                </ul>
              </div>

              <div className="bg-stone-900/60 border border-stone-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-red-600" />
                  Specifications
                </h3>
                <div className="space-y-2 text-stone-300 text-sm">
                  <div className="flex justify-between"><span>Amino Acids:</span><span>43</span></div>
                  <div className="flex justify-between"><span>Molecular Formula:</span><span>C196H314N56O61S</span></div>
                  <div className="flex justify-between"><span>Molecular Weight:</span><span>~4,963 Da</span></div>
                  <div className="flex justify-between"><span>Form:</span><span>Lyophilized Powder</span></div>
                  <div className="flex justify-between"><span>Recommended Concentration:</span><span>250mcg/unit</span></div>
                  <div className="flex justify-between"><span>Storage:</span><span>2-8°C (reconstituted)</span></div>
                  <div className="flex justify-between"><span>Shelf Life:</span><span>30+ days (reconstituted)</span></div>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-300">
                    <strong>For Research Use Only.</strong> Not intended for human consumption. Handle with proper laboratory protocols.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-16"
        >
          <h2 className="text-3xl font-black text-amber-50 mb-8">How to Reconstitute TB-500</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reconstitutionSteps.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-700 text-amber-50 font-bold">
                    {idx + 1}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-amber-50 mb-2">{step.title}</h3>
                  <p className="text-stone-300 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-black text-amber-50 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-stone-900/60 border border-stone-700 rounded-lg p-6">
                <h3 className="font-bold text-amber-50 mb-2">{faq.question}</h3>
                <p className="text-stone-300 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-700/30 rounded-lg p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-amber-50 mb-3">Ready to Order TB-500?</h3>
          <p className="text-stone-300 mb-6">
            Select your strength above. Every order includes Certificate of Analysis and USA-based support.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-red-700 hover:bg-red-600">Browse All Products</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}