import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle, AlertCircle, Beaker } from 'lucide-react';
import SEO from '@/components/SEO';
import { generateProductSchema, generateHowToSchema, generateFAQSchema } from '@/components/utils/advancedSchemaHelpers';

export default function ProductTirzepatide() {
  const [selectedStrength, setSelectedStrength] = useState(null);

  const product = {
    name: 'Tirzepatide',
    fullName: 'Tirzepatide (Research Grade)',
    description: 'Premium research-grade tirzepatide peptide with verified third-party COA',
    image: 'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=800&q=80',
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
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Buy Tirzepatide Research Peptide USA | Dual GLP-1/GIP Agonist | Red Helix Research"
        description="Premium research-grade tirzepatide with verified COA. Dual GLP-1/GIP agonist for metabolic research. 5mg, 10mg, 30mg bulk. USA supplier."
        keywords="tirzepatide research, buy tirzepatide, tirzepatide peptide, GLP-1 GIP agonist, dual-pathway peptide, metabolic research peptide"
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
                  Premium Research Grade
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-stone-300">&gt;98% Purity verified by HPLC</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-stone-300">39-amino-acid sequence confirmed via MS</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-stone-300">Third-party Certificate of Analysis (COA)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-stone-300">Dual GLP-1/GIP pathway confirmed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-stone-300">Sterility and endotoxin testing</span>
                  </li>
                </ul>
              </div>

              <div className="bg-stone-900/60 border border-stone-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-red-600" />
                  Technical Specifications
                </h3>
                <div className="space-y-2 text-stone-300 text-sm">
                  <div className="flex justify-between"><span>Amino Acids:</span><span>39</span></div>
                  <div className="flex justify-between"><span>Peptide Type:</span><span>Dual GLP-1/GIP Agonist</span></div>
                  <div className="flex justify-between"><span>Molecular Weight:</span><span>~5,411 Da</span></div>
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
                    <strong>For Research Use Only.</strong> Dual-pathway agonist. Not for human or animal consumption. Handle per lab protocols.
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
          <h2 className="text-3xl font-black text-amber-50 mb-8">How to Reconstitute Tirzepatide</h2>
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
          <h3 className="text-2xl font-bold text-amber-50 mb-3">Ready to Order Tirzepatide?</h3>
          <p className="text-stone-300 mb-6">Select strength and add to cart. Full COA and USA-based research support included.</p>
          <Link to={createPageUrl('PeptideComparison')}>
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600/10 mr-3">
              Compare Peptides
            </Button>
          </Link>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-red-700 hover:bg-red-600">Browse All Products</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}