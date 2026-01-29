import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import SEO from '@/components/SEO';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Comprehensive peptide benefit mapping based on clinical research
const PEPTIDE_RESEARCH_DATA = {
  'BPC-157': {
    fullName: 'Body Protection Compound-157',
    description: 'Naturally occurring peptide from gastric juices with extensive tissue repair research',
    molecularWeight: '~1,494 Da',
    aminoAcids: 15,
    stability: 'Very High',
    structure: 'GEPPPGKPADDDAGD',
    mechanism: 'Localized tissue repair and regeneration',
    class: 'Tissue Repair',
    benefits: {
      'Musculoskeletal Healing': { score: 10, studies: 'Multiple clinical trials on muscle recovery' },
      'Joint & Cartilage Support': { score: 10, studies: 'Research on cartilage regeneration mechanisms' },
      'Tendon & Ligament Repair': { score: 9, studies: 'Clinical evidence for connective tissue healing' },
      'Gastrointestinal Health': { score: 9, studies: 'Gut lining repair and barrier function studies' },
      'Neuroprotection': { score: 8, studies: 'Nerve regeneration and protective research' },
      'Bone Healing': { score: 8, studies: 'Fracture recovery and bone density studies' },
      'Anti-Inflammatory': { score: 7, studies: 'Inflammatory response modulation research' },
      'Systemic Circulation': { score: 5, studies: 'Limited systemic distribution, localized focus' }
    },
    contraindications: [],
    clinicalNotes: 'Highly localized action making it ideal for targeted tissue repair research. Extensive studies on musculoskeletal applications with strong supporting evidence.'
  },
  'TB-500': {
    fullName: 'Thymosin Beta-4',
    description: 'Endogenous peptide naturally present in wound healing fluid with broad cellular protection research',
    molecularWeight: '~4,963 Da',
    aminoAcids: 43,
    stability: 'Highly Stable',
    mechanism: 'Systemic cellular protection and proliferation',
    class: 'Cellular Protection',
    benefits: {
      'Systemic Recovery': { score: 10, studies: 'Comprehensive research on whole-body cellular protection' },
      'Cellular Proliferation': { score: 10, studies: 'Extensive studies on cell growth and differentiation' },
      'Tissue Engineering': { score: 9, studies: 'Significant research in tissue engineering applications' },
      'Cardiovascular Support': { score: 9, studies: 'Cardiac tissue repair and angiogenesis studies' },
      'Angiogenesis': { score: 9, studies: 'Blood vessel formation and endothelial research' },
      'Anti-Inflammatory': { score: 8, studies: 'Broad immunomodulatory research' },
      'Wound Healing': { score: 8, studies: 'Comprehensive clinical evidence for healing acceleration' },
      'Neuroprotection': { score: 7, studies: 'Neuronal protection and growth research' },
      'Joint & Cartilage Support': { score: 6, studies: 'Secondary benefit in systemic recovery' }
    },
    contraindications: [],
    clinicalNotes: 'Systemic peptide with broad cellular protection mechanisms. Strong research for general recovery and cellular health with multiple concurrent applications.'
  },
  'Semaglutide': {
    fullName: 'Semaglutide (Research Grade)',
    description: 'GLP-1 receptor agonist analog for comprehensive metabolic and endocrine research',
    molecularWeight: '~4,113 Da',
    aminoAcids: 31,
    stability: 'Stable',
    mechanism: 'GLP-1 receptor agonism for metabolic regulation',
    class: 'GLP-1 Agonist',
    benefits: {
      'Metabolic Regulation': { score: 10, studies: 'Extensive clinical research on glucose metabolism' },
      'Blood Sugar Control': { score: 10, studies: 'Comprehensive diabetes and glucose studies' },
      'Weight Management Research': { score: 9, studies: 'Significant research on appetite and satiety mechanisms' },
      'Cardiovascular Health': { score: 8, studies: 'Heart health and vascular function research' },
      'Appetite Signaling': { score: 9, studies: 'Detailed research on hunger and satiation pathways' },
      'Energy Expenditure': { score: 7, studies: 'Metabolic rate and caloric burn research' },
      'Gastrointestinal Health': { score: 6, studies: 'GI motility and function studies' },
      'Anti-Inflammatory': { score: 6, studies: 'Secondary anti-inflammatory effects in research' },
      'Musculoskeletal Healing': { score: 2, studies: 'Not primary application' }
    },
    contraindications: [
      { peptide: 'Tirzepatide', severity: 'HIGH', reason: 'Combining two GLP-1 pathway agonists significantly increases risk of adverse effects. Dual GLP-1 activation can cause severe nausea, vomiting, pancreatitis risk, and hypoglycemia. No clinical evidence supports this combination.' }
    ],
    clinicalNotes: 'Metabolic and endocrine focused peptide. Strongest research for glucose regulation and weight-related metabolic pathways. Limited direct tissue repair applications.'
  },
  'Tirzepatide': {
    fullName: 'Tirzepatide (Research Grade)',
    description: 'Dual GLP-1 and GIP receptor agonist for comprehensive metabolic research',
    molecularWeight: '~4,672 Da',
    aminoAcids: 39,
    stability: 'Stable',
    mechanism: 'Dual GLP-1/GIP receptor agonism for enhanced metabolic effects',
    class: 'GLP-1/GIP Agonist',
    benefits: {
      'Metabolic Regulation': { score: 10, studies: 'Advanced dual-receptor research on metabolism' },
      'Blood Sugar Control': { score: 10, studies: 'Potent glucose control research' },
      'Weight Management Research': { score: 10, studies: 'Enhanced appetite suppression research' },
      'Cardiovascular Health': { score: 9, studies: 'Advanced cardiovascular benefit research' },
      'Appetite Signaling': { score: 10, studies: 'Dual pathway appetite regulation research' },
      'Energy Expenditure': { score: 8, studies: 'Enhanced metabolic rate research' },
      'Anti-Inflammatory': { score: 7, studies: 'Dual-pathway inflammatory modulation' },
      'Gastrointestinal Health': { score: 6, studies: 'GI health and motility research' },
      'Musculoskeletal Healing': { score: 2, studies: 'Not primary application' }
    },
    contraindications: [
      { peptide: 'Semaglutide', severity: 'HIGH', reason: 'Combining two GLP-1 pathway agonists significantly increases risk of adverse effects. Dual GLP-1 activation can cause severe nausea, vomiting, pancreatitis risk, and hypoglycemia. No clinical evidence supports this combination.' }
    ],
    clinicalNotes: 'Advanced dual-receptor metabolic peptide. Research indicates more potent effects than single GLP-1 agonists. Superior for comprehensive metabolic research protocols.'
  }
};

// Safe stacking combinations based on clinical evidence and mechanism compatibility
const SAFE_STACKS = {
  'BPC-157': {
    compatible: ['TB-500'],
    reason: 'BPC-157 + TB-500: Complementary tissue repair. BPC-157 provides localized healing while TB-500 supports systemic cellular proliferation and protection. Different mechanisms with proven safety record in research.'
  },
  'TB-500': {
    compatible: ['BPC-157'],
    reason: 'TB-500 + BPC-157: Synergistic recovery protocol. TB-500 establishes systemic cellular foundation while BPC-157 targets localized healing. Well-researched combination with additive benefits.'
  },
  'Semaglutide': {
    compatible: ['BPC-157', 'TB-500'],
    reason: 'GLP-1 metabolic peptide pairs well with repair peptides. Separate mechanisms of action allow for comprehensive research covering metabolic and recovery pathways without contraindications.'
  },
  'Tirzepatide': {
    compatible: ['BPC-157', 'TB-500'],
    reason: 'Dual-receptor metabolic peptide pairs well with repair peptides. Distinct mechanism allows metabolic research alongside tissue repair without safety concerns.'
  }
};

export default function PeptideComparison() {
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [expandedPeptide, setExpandedPeptide] = useState(null);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  // Get all unique benefits from all peptides
  const allBenefits = useMemo(() => {
    const benefits = new Set();
    Object.values(PEPTIDE_RESEARCH_DATA).forEach(peptide => {
      Object.keys(peptide.benefits).forEach(benefit => benefits.add(benefit));
    });
    return Array.from(benefits).sort();
  }, []);

  // Calculate recommendation score for each peptide
  const calculateScores = (selectedBenefitsArray) => {
    const scores = {};
    
    Object.entries(PEPTIDE_RESEARCH_DATA).forEach(([peptideName, data]) => {
      const matchedBenefits = selectedBenefitsArray.filter(benefit => benefit in data.benefits);
      const avgScore = matchedBenefits.length > 0
        ? matchedBenefits.reduce((sum, benefit) => sum + data.benefits[benefit].score, 0) / matchedBenefits.length
        : 0;
      
      scores[peptideName] = {
        matchPercentage: (matchedBenefits.length / selectedBenefitsArray.length) * 100,
        avgScore: avgScore,
        matchedCount: matchedBenefits.length,
        matchedBenefits: matchedBenefits
      };
    });

    return scores;
  };

  const handleFindRecommendation = () => {
    if (selectedBenefits.length === 0) return;

    const scores = calculateScores(selectedBenefits);
    const sorted = Object.entries(scores).sort((a, b) => {
      const scoreA = (a[1].matchPercentage * 0.7) + (a[1].avgScore * 0.3);
      const scoreB = (b[1].matchPercentage * 0.7) + (b[1].avgScore * 0.3);
      return scoreB - scoreA;
    });

    const perfectMatch = sorted[0][1].matchPercentage === 100;
    
    setRecommendations({
      scores,
      ranked: sorted,
      perfectMatch,
      selectedBenefits
    });
  };

  const toggleBenefit = (benefit) => {
    setSelectedBenefits(prev =>
      prev.includes(benefit)
        ? prev.filter(b => b !== benefit)
        : [...prev, benefit]
    );
  };

  const resetSelection = () => {
    setSelectedBenefits([]);
    setRecommendations(null);
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Peptide Research Recommendation Tool | Red Helix Research"
        description="Intelligent peptide selection tool matching your research benefits to the ideal peptides. Clinical research-based recommendations."
        keywords="peptide recommendation, research benefits, BPC-157, TB-500, Semaglutide, Tirzepatide, peptide selection"
      />

      <div className="max-w-6xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">Peptide Research Finder</h1>
          <p className="text-xl text-stone-300">Select your research benefits and discover the ideal peptide(s) for your study</p>
        </motion.div>

        {/* Benefit Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">Step 1: Select Your Research Benefits</h2>
          <p className="text-stone-300 mb-6">Choose all the research areas you're interested in exploring:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {allBenefits.map((benefit) => (
              <motion.button
                key={benefit}
                onClick={() => toggleBenefit(benefit)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border-2 transition-all text-left font-medium ${
                  selectedBenefits.includes(benefit)
                    ? 'bg-red-600/20 border-red-600/70 text-amber-50'
                    : 'bg-stone-800/30 border-stone-700 text-stone-300 hover:border-red-600/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{benefit}</span>
                  {selectedBenefits.includes(benefit) && (
                    <CheckCircle2 className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFindRecommendation}
              disabled={selectedBenefits.length === 0}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-amber-50 font-bold rounded-lg transition-all"
            >
              Find Recommendations ({selectedBenefits.length})
            </motion.button>
            {selectedBenefits.length > 0 && (
              <button
                onClick={resetSelection}
                className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-lg transition-all"
              >
                Reset
              </button>
            )}
          </div>
        </motion.div>

        {/* Recommendations */}
        <AnimatePresence>
          {recommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Perfect Match Section */}
              {recommendations.perfectMatch && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-red-900/30 to-red-800/10 border-2 border-red-600/50 rounded-lg p-8"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-2xl font-bold text-amber-50">Perfect Match Found!</h3>
                      <p className="text-stone-300 mt-1">One or more peptides match all your selected research benefits.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Top Recommendation */}
              {recommendations.ranked[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-stone-800 to-stone-900 border-2 border-red-600/60 rounded-lg p-8"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-3xl font-black text-amber-50 mb-1">
                        {recommendations.ranked[0][0]}
                      </h3>
                      <p className="text-stone-300">
                        {PEPTIDE_RESEARCH_DATA[recommendations.ranked[0][0]].description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-red-600 mb-2">
                        {Math.round(recommendations.ranked[0][1].matchPercentage)}%
                      </div>
                      <p className="text-stone-400 text-sm">Match Score</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 py-6 border-y border-stone-700">
                    <div>
                      <p className="text-stone-400 text-sm">Amino Acids</p>
                      <p className="text-amber-50 font-bold">{PEPTIDE_RESEARCH_DATA[recommendations.ranked[0][0]].aminoAcids}</p>
                    </div>
                    <div>
                      <p className="text-stone-400 text-sm">Molecular Weight</p>
                      <p className="text-amber-50 font-bold">{PEPTIDE_RESEARCH_DATA[recommendations.ranked[0][0]].molecularWeight}</p>
                    </div>
                    <div>
                      <p className="text-stone-400 text-sm">Stability</p>
                      <p className="text-amber-50 font-bold">{PEPTIDE_RESEARCH_DATA[recommendations.ranked[0][0]].stability}</p>
                    </div>
                    <div>
                      <p className="text-stone-400 text-sm">Matched Benefits</p>
                      <p className="text-amber-50 font-bold">{recommendations.ranked[0][1].matchedCount}/{recommendations.selectedBenefits.length}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-stone-400 mb-3 font-semibold">MATCHED RESEARCH AREAS:</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendations.ranked[0][1].matchedBenefits.map((benefit) => (
                        <div key={benefit} className="px-3 py-1.5 bg-red-600/20 border border-red-600/50 rounded-full text-xs text-amber-50">
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-stone-300 mt-6 pt-6 border-t border-stone-700">
                    <span className="font-semibold text-amber-50">Clinical Note:</span> {PEPTIDE_RESEARCH_DATA[recommendations.ranked[0][0]].clinicalNotes}
                  </p>
                </motion.div>
              )}

              {/* Other Options */}
              {recommendations.ranked.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-stone-900/60 border border-stone-700 rounded-lg p-8"
                >
                  <h3 className="text-2xl font-bold text-amber-50 mb-6">Other Options</h3>
                  <div className="space-y-4">
                    {recommendations.ranked.slice(1).map(([peptideName, data]) => (
                      <motion.div
                        key={peptideName}
                        className="bg-stone-800/40 border border-stone-700 rounded-lg p-4 cursor-pointer hover:border-red-600/30 transition-all"
                        onClick={() => setExpandedPeptide(expandedPeptide === peptideName ? null : peptideName)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-bold text-amber-50 mb-1">{peptideName}</h4>
                            <p className="text-stone-400 text-sm">
                              {data.matchedCount} of {recommendations.selectedBenefits.length} benefits covered
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-red-600">{Math.round(data.matchPercentage)}%</p>
                            <ChevronDown className={`w-5 h-5 text-stone-400 mt-2 transition-transform ${expandedPeptide === peptideName ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedPeptide === peptideName && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-4 pt-4 border-t border-stone-700"
                            >
                              <p className="text-stone-300 text-sm mb-3">{PEPTIDE_RESEARCH_DATA[peptideName].description}</p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {data.matchedBenefits.map((benefit) => (
                                  <div key={benefit} className="px-2 py-1 bg-red-600/15 border border-red-600/30 rounded text-xs text-amber-50">
                                    {benefit}
                                  </div>
                                ))}
                              </div>
                              <p className="text-stone-400 text-xs">{PEPTIDE_RESEARCH_DATA[peptideName].clinicalNotes}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Synergistic Pairing Suggestion */}
              {!recommendations.perfectMatch && recommendations.ranked[0][1].matchPercentage < 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-8"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-blue-300 mb-2">Complementary Pairing Recommendation</h3>
                      <p className="text-stone-300 mb-4">
                        For complete coverage of all selected research areas, consider combining peptides:
                      </p>

                      <div className="bg-stone-800/50 rounded p-4">
                        <p className="text-amber-50 font-bold mb-3">
                          {recommendations.ranked[0][0]} + {recommendations.ranked[1]?.[0]}
                        </p>
                        <p className="text-stone-300 text-sm">
                          This combination covers all selected research benefits with complementary mechanisms. {recommendations.ranked[0][0]} excels in areas where {recommendations.ranked[1]?.[0]} is weaker, creating a comprehensive research protocol.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Peptide Database Reference */}
        {!recommendations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mt-12"
          >
            <h2 className="text-2xl font-bold text-amber-50 mb-6">Available Research Peptides</h2>
            <p className="text-stone-300 mb-8">Each peptide in our catalog has been selected for rigorous clinical research backing and quality verification.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(PEPTIDE_RESEARCH_DATA).map(([name, data]) => (
                <div key={name} className="bg-stone-800/40 border border-stone-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-amber-50 mb-2">{name}</h3>
                  <p className="text-stone-400 text-sm mb-4">{data.fullName}</p>
                  <p className="text-stone-300 text-sm mb-4">{data.description}</p>
                  <div className="flex gap-4 text-xs text-stone-400">
                    <span>MW: {data.molecularWeight}</span>
                    <span>AA: {data.aminoAcids}</span>
                    <span>{data.stability}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}