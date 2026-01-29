import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';

export default function PeptideComparison() {
  const comparisonData = [
    {
      peptide: 'BPC-157',
      fullName: 'Body Protection Compound-157',
      aminoAcids: 15,
      source: 'Gastric juice',
      primaryUse: 'Tissue repair & healing',
      secondaryUses: ['Musculoskeletal recovery', 'Gastrointestinal health', 'Neuroprotection'],
      structure: 'GEPPPGKPADDDAGD',
      stability: 'Very High',
      researchFocus: 'Localized healing, injury recovery',
      startingPrice: '$49.99',
      molecularWeight: '~1,494 Da'
    },
    {
      peptide: 'TB-500',
      fullName: 'Thymosin Beta-4',
      aminoAcids: 43,
      source: 'Thymus gland & wound fluid',
      primaryUse: 'Cellular protection & proliferation',
      secondaryUses: ['Tissue engineering', 'Cardiac recovery', 'Angiogenesis'],
      stability: 'Highly Stable',
      researchFocus: 'Systemic protection, cellular growth',
      startingPrice: '$59.99',
      molecularWeight: '~4,963 Da'
    },
    {
      peptide: 'Semaglutide',
      fullName: 'Semaglutide (Research)',
      aminoAcids: 31,
      source: 'Synthetic analog of GLP-1',
      primaryUse: 'Metabolic & weight research',
      secondaryUses: ['Glucose regulation studies', 'Appetite research', 'Metabolic pathways'],
      stability: 'Stable',
      researchFocus: 'Endocrine function, metabolism',
      startingPrice: '$89.99',
      molecularWeight: '~4,113 Da'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Research Peptide Comparison Guide | BPC-157 vs TB-500 vs Semaglutide"
        description="Detailed comparison of popular research peptides: structure, applications, specifications. Help choose the right peptide for your research."
        keywords="peptide comparison, BPC-157 vs TB-500, semaglutide research, peptide selection guide, research peptides"
      />

      <div className="max-w-6xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">Research Peptide Comparison</h1>
          <p className="text-xl text-stone-300">Choose the right peptide for your research goals</p>
        </motion.div>

        {/* Overview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-4">Understanding Peptide Selection</h2>
          <p className="text-stone-300 mb-4">
            Each research peptide serves different purposes and has unique structural properties. Understanding these differences is critical for selecting the right peptide for your research applications.
          </p>
          <p className="text-stone-300">
            All Red Helix Research peptides undergo rigorous third-party testing with full Certificates of Analysis (COA). Quality verification includes HPLC purity, mass spectrometry confirmation, and sterility testing.
          </p>
        </motion.div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {comparisonData.map((peptide, idx) => (
            <motion.div
              key={peptide.peptide}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 hover:border-red-700/50 transition-all"
            >
              <div className="mb-6 pb-6 border-b border-stone-700">
                <h3 className="text-2xl font-black text-amber-50 mb-2">{peptide.peptide}</h3>
                <p className="text-stone-400 text-sm">{peptide.fullName}</p>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-stone-400">Amino Acids</span>
                  <p className="text-amber-50 font-semibold">{peptide.aminoAcids}</p>
                </div>

                <div>
                  <span className="text-stone-400">Molecular Weight</span>
                  <p className="text-amber-50 font-semibold">{peptide.molecularWeight}</p>
                </div>

                <div>
                  <span className="text-stone-400">Natural Source</span>
                  <p className="text-amber-50 font-semibold">{peptide.source}</p>
                </div>

                <div>
                  <span className="text-stone-400">Primary Research Focus</span>
                  <p className="text-amber-50 font-semibold">{peptide.primaryUse}</p>
                </div>

                <div>
                  <span className="text-stone-400">Secondary Applications</span>
                  <ul className="text-amber-50 space-y-1 mt-2">
                    {peptide.secondaryUses.map((use, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-600 font-bold mt-0.5">•</span>
                        <span>{use}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-stone-700">
                  <span className="text-stone-400">Starting Price</span>
                  <p className="text-red-600 font-bold text-lg">{peptide.startingPrice}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-16 overflow-x-auto"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">Detailed Specifications Comparison</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-700">
                <th className="text-left py-3 px-4 text-amber-50 font-bold">Property</th>
                <th className="text-left py-3 px-4 text-amber-50 font-bold">BPC-157</th>
                <th className="text-left py-3 px-4 text-amber-50 font-bold">TB-500</th>
                <th className="text-left py-3 px-4 text-amber-50 font-bold">Semaglutide</th>
              </tr>
            </thead>
            <tbody className="text-stone-300">
              <tr className="border-b border-stone-700/50">
                <td className="py-3 px-4">Amino Acid Count</td>
                <td className="py-3 px-4">15</td>
                <td className="py-3 px-4">43</td>
                <td className="py-3 px-4">31</td>
              </tr>
              <tr className="border-b border-stone-700/50">
                <td className="py-3 px-4">Molecular Weight</td>
                <td className="py-3 px-4">~1,494 Da</td>
                <td className="py-3 px-4">~4,963 Da</td>
                <td className="py-3 px-4">~4,113 Da</td>
              </tr>
              <tr className="border-b border-stone-700/50">
                <td className="py-3 px-4">Stability Rating</td>
                <td className="py-3 px-4">Very High</td>
                <td className="py-3 px-4">Highly Stable</td>
                <td className="py-3 px-4">Stable</td>
              </tr>
              <tr className="border-b border-stone-700/50">
                <td className="py-3 px-4">Research Scope</td>
                <td className="py-3 px-4">Localized</td>
                <td className="py-3 px-4">Systemic</td>
                <td className="py-3 px-4">Metabolic</td>
              </tr>
              <tr className="border-b border-stone-700/50">
                <td className="py-3 px-4">Recovery Focus</td>
                <td className="py-3 px-4">Tissue & Healing</td>
                <td className="py-3 px-4">Cellular & Protection</td>
                <td className="py-3 px-4">Metabolic & Endocrine</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Reconstitution Time</td>
                <td className="py-3 px-4">2-3 minutes</td>
                <td className="py-3 px-4">3-5 minutes</td>
                <td className="py-3 px-4">2-3 minutes</td>
              </tr>
            </tbody>
          </table>
        </motion.div>

        {/* Research Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">Research Applications Guide</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-red-600 mb-3">Choose BPC-157 If You're Researching:</h3>
              <ul className="space-y-2 text-stone-300">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">✓</span>
                  <span>Muscle and joint healing mechanisms</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">✓</span>
                  <span>Gastrointestinal tract repair</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">✓</span>
                  <span>Localized tissue recovery protocols</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">✓</span>
                  <span>Neuroprotection and nerve regeneration</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-red-600 mb-3">Choose TB-500 If You're Researching:</h3>
              <ul className="space-y-2 text-stone-300">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">✓</span>
                  <span>Cellular protection and proliferation mechanisms</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">✓</span>
                  <span>Tissue engineering applications</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">✓</span>
                  <span>Cardiovascular and systemic recovery</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">✓</span>
                  <span>Angiogenesis and blood vessel formation</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-red-600 mb-3">Choose Semaglutide If You're Researching:</h3>
              <ul className="space-y-2 text-stone-300">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">✓</span>
                  <span>GLP-1 receptor pathways and function</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">✓</span>
                  <span>Metabolic regulation and glucose control</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">✓</span>
                  <span>Appetite signaling mechanisms</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-1">✓</span>
                  <span>Endocrine system research</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Quality Assurance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-700/30 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-4">Quality Assurance Across All Peptides</h2>
          <p className="text-stone-300 mb-4">
            Regardless of which peptide you choose, Red Helix Research ensures the same rigorous quality standards:
          </p>
          <ul className="space-y-2 text-stone-300">
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>HPLC Analysis: &gt;98% purity verification</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>Mass Spectrometry: Complete amino acid sequence confirmation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>Sterility Testing: Bacterial and fungal screening</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>Endotoxin Testing: Safety verification for research</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>Certificate of Analysis: Full documentation included</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}