import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle, AlertCircle, Beaker } from 'lucide-react';
import SEO from '@/components/SEO';
import { generateProductSchema, generateHowToSchema, generateFAQSchema } from '@/components/utils/advancedSchemaHelpers';

export default function ProductBPC157() {
  const [selectedStrength, setSelectedStrength] = useState(null);

  const product = {
    name: 'BPC-157',
    fullName: 'Body Protection Compound-157',
    description: 'Premium research-grade BPC-157 peptide with verified third-party COA',
    image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f26f0d?w=800&q=80',
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
    generateFAQSchema(faqs)
  ];

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Buy BPC-157 Peptide USA | Lab-Tested Research Compound | Red Helix Research"
        description="Premium BPC-157 (Body Protection Compound-157) with verified third-party COA. 5mg, 10mg, and bulk options. USA-based supplier of high-purity research peptides."
        keywords="BPC-157, BPC-157 peptide, buy BPC-157, research peptide, lab-tested BPC-157, BPC-157 USA, body protection compound, high purity peptide"
        schema={schemas}
      />

      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-8">
            ← Back to Products
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Product Image & Info */}
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

          {/* Product Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="space-y-6">
              {/* Key Features */}
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
                    <span className="text-stone-300">Third-party Certificate of Analysis (COA)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">•</span>
                    <span className="text-stone-300">Mass spectrometry molecular weight confirmation</span>
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

              {/* Specifications */}
              <div className="bg-stone-900/60 border border-stone-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-red-600" />
                  Specifications
                </h3>
                <div className="space-y-2 text-stone-300 text-sm">
                  <div className="flex justify-between"><span>Amino Acids:</span><span>15</span></div>
                  <div className="flex justify-between"><span>Molecular Formula:</span><span>C62H98N16O22</span></div>
                  <div className="flex justify-between"><span>Molecular Weight:</span><span>~1,494 Da</span></div>
                  <div className="flex justify-between"><span>Form:</span><span>Lyophilized Powder</span></div>
                  <div className="flex justify-between"><span>Recommended Concentration:</span><span>250mcg/unit</span></div>
                  <div className="flex justify-between"><span>Storage:</span><span>2-8°C (reconstituted)</span></div>
                  <div className="flex justify-between"><span>Shelf Life:</span><span>30+ days (reconstituted)</span></div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-300">
                    <strong>For Research Use Only.</strong> Not intended for human consumption. Must be handled by trained research professionals only.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reconstitution Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-16"
        >
          <h2 className="text-3xl font-black text-amber-50 mb-8">How to Reconstitute BPC-157</h2>
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

        {/* FAQ Section */}
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-700/30 rounded-lg p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-amber-50 mb-3">Ready to Order BPC-157?</h3>
          <p className="text-stone-300 mb-6 max-w-2xl mx-auto">
            Select your desired strength above and add to cart. Every order includes a full Certificate of Analysis (COA) and USA-based support.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-red-700 hover:bg-red-600">Browse All Products</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}