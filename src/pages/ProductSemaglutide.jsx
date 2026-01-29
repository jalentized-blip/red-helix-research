import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle, AlertCircle, Beaker } from 'lucide-react';
import SEO from '@/components/SEO';
import { generateProductSchema, generateHowToSchema, generateFAQSchema } from '@/components/utils/advancedSchemaHelpers';

export default function ProductSemaglutide() {
  const [selectedStrength, setSelectedStrength] = useState(null);

  const product = {
    name: 'Semaglutide',
    fullName: 'Semaglutide (Research Grade)',
    description: 'Premium research-grade semaglutide peptide with verified third-party COA',
    image: 'https://images.unsplash.com/photo-1576091160679-112163518e38?w=800&q=80',
    price_from: 89.99,
    specifications: [
      { name: '5mg vial', price: 89.99, in_stock: true },
      { name: '10mg vial', price: 159.99, in_stock: true },
      { name: '30mg bulk', price: 449.99, in_stock: true }
    ],
    rating: 4.7,
    reviews: 156
  };

  const reconstitutionSteps = [
    {
      title: 'Gather Materials',
      description: 'Prepare semaglutide vial, 1mL bacteriostatic water, insulin syringe, alcohol pads, and sterile 18-20 gauge needle.'
    },
    {
      title: 'Sanitize Vial',
      description: 'Thoroughly clean the rubber top of semaglutide vial with alcohol pad. Allow 30+ seconds for complete drying.'
    },
    {
      title: 'Draw Water Precisely',
      description: 'Using insulin syringe, draw exactly 1.0mL (100 units) of USP-grade bacteriostatic water. Precision is critical.'
    },
    {
      title: 'Inject Into Vial',
      description: 'Slowly inject bacteriostatic water into semaglutide vial at a slight angle. Do NOT shake—allow 2-3 minutes for dissolution.'
    },
    {
      title: 'Verify Solution Clarity',
      description: 'Solution should be clear and colorless. Any cloudiness or particles indicates contamination—discard and obtain replacement.'
    },
    {
      title: 'Refrigerate Immediately',
      description: 'Store reconstituted semaglutide at 2-8°C. Stable for 30+ days. Keep away from direct light exposure.'
    }
  ];

  const faqs = [
    {
      question: 'What is semaglutide and why is it used in research?',
      answer: 'Semaglutide is a 31-amino-acid synthetic peptide analog of GLP-1 (glucagon-like peptide-1). Researchers study it for metabolic regulation, glucose control, appetite signaling mechanisms, and endocrine system function. It\'s valuable for understanding how GLP-1 receptors modulate metabolism.'
    },
    {
      question: 'How does semaglutide differ from other peptides?',
      answer: 'Semaglutide is a synthetic analog (not naturally occurring like BPC-157 or TB-500) designed to activate GLP-1 receptors. Its primary focus is metabolic and endocrine research rather than tissue repair or cellular protection. It\'s studied for its effects on glucose metabolism and appetite regulation.'
    },
    {
      question: 'Is your semaglutide third-party tested?',
      answer: 'Yes. Every batch undergoes rigorous testing: HPLC purity verification (>98%), mass spectrometry confirmation of the 31-amino-acid sequence, sterility and microbial screening, and endotoxin testing. Full Certificate of Analysis included with every order.'
    },
    {
      question: 'What is the recommended semaglutide concentration?',
      answer: 'Reconstitute 5mg semaglutide with 1.0mL bacteriostatic water for 5,000mcg/mL concentration (250mcg per 100-unit insulin syringe mark). Use our Peptide Calculator to adjust for different volumes or target concentrations.'
    },
    {
      question: 'How long is reconstituted semaglutide stable?',
      answer: 'Properly reconstituted semaglutide stored at 2-8°C is stable for 30+ days. Bacteriostatic water prevents bacterial growth. Do not freeze, as this damages the peptide structure. Store away from light when possible using amber vials.'
    },
    {
      question: 'What research applications is semaglutide used for?',
      answer: 'Researchers study semaglutide for GLP-1 receptor pathway function, metabolic regulation, glucose homeostasis, appetite signaling mechanisms, endocrine system response, and cellular glucose uptake pathways. It\'s particularly valuable in metabolic and endocrine research.'
    }
  ];

  const schemas = [
    generateProductSchema(product),
    generateHowToSchema('How to Reconstitute Semaglutide', reconstitutionSteps),
    generateFAQSchema(faqs)
  ];

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Buy Semaglutide Research Peptide USA | Lab-Tested GLP-1 Analog | Red Helix Research"
        description="Premium research-grade semaglutide with verified COA. GLP-1 analog for metabolic and endocrine research. 5mg, 10mg, 30mg bulk. USA supplier."
        keywords="semaglutide research, buy semaglutide, semaglutide peptide, GLP-1 analog, research peptide, metabolic research, lab-tested peptide"
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
                  Research-Grade Quality
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-stone-300">&gt;98% Purity verified by HPLC</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-stone-300">31-amino-acid sequence validated by MS</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-stone-300">Third-party Certificate of Analysis (COA)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-stone-300">Sterility and microbial testing</span>
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
                  Technical Specifications
                </h3>
                <div className="space-y-2 text-stone-300 text-sm">
                  <div className="flex justify-between"><span>Amino Acids:</span><span>31</span></div>
                  <div className="flex justify-between"><span>Peptide Type:</span><span>GLP-1 Analog</span></div>
                  <div className="flex justify-between"><span>Molecular Weight:</span><span>~4,113 Da</span></div>
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
                    <strong>For Research Use Only.</strong> Not for human or animal consumption. Handle according to laboratory safety protocols.
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
          <h2 className="text-3xl font-black text-amber-50 mb-8">How to Reconstitute Semaglutide</h2>
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

          <div className="mt-8 pt-8 border-t border-stone-700">
            <Link to={createPageUrl('BlogGuide')}>
              <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600/10">
                View Complete Reconstitution Guide →
              </Button>
            </Link>
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
          <h3 className="text-2xl font-bold text-amber-50 mb-3">Ready to Order Semaglutide?</h3>
          <p className="text-stone-300 mb-6">Select strength and add to cart. Includes full COA and USA-based research support.</p>
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