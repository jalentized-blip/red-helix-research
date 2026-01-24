import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Beaker, TestTube, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import ProductModal from '@/components/product/ProductModal';

export default function PeptideLearn() {
  const [peptideData, setPeptideData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const productName = params.get('name');

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  useEffect(() => {
    const findAndLoadProduct = async () => {
      const foundProduct = products.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
        await generatePeptideData(foundProduct);
      }
      setLoading(false);
    };

    if (products.length > 0) {
      findAndLoadProduct();
    }
  }, [products, productId]);

  const generatePeptideData = async (prod) => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a peptide research expert. Generate detailed, scientifically-grounded information about the peptide "${prod.name}" in the following JSON format:
{
  "overview": "A 2-3 sentence overview of what this peptide is and its primary function",
  "potentialUses": [
    {
      "title": "Use case name",
      "description": "Detailed description of how this peptide may be used for this purpose",
      "mechanism": "How it works in the body"
    }
  ],
  "clinicalTrials": [
    {
      "title": "Study name",
      "year": "Year conducted",
      "institution": "Research institution",
      "participants": "Number of participants",
      "duration": "Study duration",
      "findings": "Key findings and results",
      "conclusion": "What researchers concluded"
    }
  ],
  "safetyProfile": "Safety information and any known side effects",
  "dosage": "Typical dosage ranges that have been studied",
  "keyBenefits": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            overview: { type: "string" },
            potentialUses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  mechanism: { type: "string" }
                }
              }
            },
            clinicalTrials: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  year: { type: "string" },
                  institution: { type: "string" },
                  participants: { type: "string" },
                  duration: { type: "string" },
                  findings: { type: "string" },
                  conclusion: { type: "string" }
                }
              }
            },
            safetyProfile: { type: "string" },
            dosage: { type: "string" },
            keyBenefits: { type: "array", items: { type: "string" } }
          }
        }
      });

      setPeptideData(response);
    } catch (error) {
      console.error('Error generating peptide data:', error);
      setPeptideData(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-stone-400">Loading research data...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-950 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <Link to={createPageUrl('LearnMore')}>
            <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-6">
              ← Back to Learn More
            </Button>
          </Link>
          <p className="text-stone-400 text-center">Peptide not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Link to={createPageUrl('LearnMore')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-6">
            ← Back to Learn More
          </Button>
        </Link>

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center">
              <Beaker className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-black text-amber-50">{product.name}</h1>
          </div>
          <p className="text-stone-300 text-lg mb-6">{product.description}</p>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-barn-brown hover:bg-barn-brown/90 text-amber-50 font-semibold rounded-lg transition-colors"
            >
              View Product
            </button>
          </div>
        </motion.div>

        {peptideData && (
          <>
            {/* Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-stone-900/50 border border-stone-700 rounded-lg p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-red-600" />
                Overview
              </h2>
              <p className="text-stone-300 leading-relaxed">{peptideData.overview}</p>
            </motion.div>

            {/* Key Benefits */}
            {peptideData.keyBenefits && peptideData.keyBenefits.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-stone-900/50 border border-stone-700 rounded-lg p-8 mb-8"
              >
                <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Key Benefits
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {peptideData.keyBenefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="h-6 w-6 bg-green-600/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      <p className="text-stone-300">{benefit}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Potential Uses */}
            {peptideData.potentialUses && peptideData.potentialUses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-2">
                  <Beaker className="w-6 h-6 text-blue-600" />
                  Potential Uses
                </h2>
                <div className="space-y-4">
                  {peptideData.potentialUses.map((use, idx) => (
                    <div key={idx} className="bg-stone-900/50 border border-stone-700 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-blue-400 mb-2">{use.title}</h3>
                      <p className="text-stone-300 mb-3">{use.description}</p>
                      <div className="bg-stone-800/50 rounded p-3 border-l-2 border-blue-600">
                        <p className="text-sm text-stone-400"><span className="font-semibold text-stone-300">Mechanism:</span> {use.mechanism}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Clinical Trials */}
            {peptideData.clinicalTrials && peptideData.clinicalTrials.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-2">
                  <TestTube className="w-6 h-6 text-purple-600" />
                  Clinical Trial Findings
                </h2>
                <div className="space-y-4">
                  {peptideData.clinicalTrials.map((trial, idx) => (
                    <div key={idx} className="bg-stone-900/50 border border-purple-600/30 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-stone-400 text-sm mb-1">Study</p>
                          <p className="text-amber-50 font-semibold">{trial.title}</p>
                        </div>
                        <div>
                          <p className="text-stone-400 text-sm mb-1">Year</p>
                          <p className="text-amber-50 font-semibold">{trial.year}</p>
                        </div>
                        <div>
                          <p className="text-stone-400 text-sm mb-1">Institution</p>
                          <p className="text-amber-50 font-semibold text-sm">{trial.institution}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-stone-700">
                        <div>
                          <p className="text-stone-400 text-sm mb-1">Participants</p>
                          <p className="text-amber-50 font-semibold">{trial.participants}</p>
                        </div>
                        <div>
                          <p className="text-stone-400 text-sm mb-1">Duration</p>
                          <p className="text-amber-50 font-semibold">{trial.duration}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-stone-400 text-sm mb-2">Key Findings</p>
                        <p className="text-stone-300">{trial.findings}</p>
                      </div>

                      <div className="bg-green-600/10 border border-green-600/30 rounded p-3">
                        <p className="text-green-300 text-sm"><span className="font-semibold">Conclusion:</span> {trial.conclusion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Safety & Dosage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {peptideData.safetyProfile && (
                <div className="bg-stone-900/50 border border-amber-600/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    Safety Profile
                  </h3>
                  <p className="text-stone-300">{peptideData.safetyProfile}</p>
                </div>
              )}

              <div className="bg-amber-900/30 border border-amber-600/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  Research Use Only
                </h3>
                <p className="text-amber-100 font-semibold">This peptide is intended for research purposes only. Not for human consumption. Always consult with qualified healthcare professionals before use.</p>
              </div>
            </motion.div>
          </>
        )}

        {!peptideData && (
          <div className="text-center py-20">
            <p className="text-stone-400 text-lg">Loading research data...</p>
          </div>
        )}

        <ProductModal 
          product={product} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
    </div>
  );
}