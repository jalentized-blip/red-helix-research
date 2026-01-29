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
      'Muscle Soreness & Recovery': { score: 10, studies: 'Clinical trials showing accelerated muscle repair post-exercise' },
      'Joint Pain & Arthritis': { score: 10, studies: 'Research demonstrating cartilage regeneration and joint comfort' },
      'Tendon & Ligament Injuries': { score: 9, studies: 'Clinical evidence for connective tissue healing and strength restoration' },
      'Gut Health & Leaky Gut': { score: 9, studies: 'Studies on intestinal barrier repair and digestive function' },
      'Nerve Pain & Neuropathy': { score: 8, studies: 'Research on nerve regeneration and neuroprotection mechanisms' },
      'Bone Fractures & Healing': { score: 8, studies: 'Clinical data on accelerated fracture recovery and bone density' },
      'Athletic Performance': { score: 8, studies: 'Studies on injury prevention and recovery in athletes' },
      'Chronic Inflammation': { score: 7, studies: 'Research on localized inflammatory response reduction' }
    },
    contraindications: [],
    clinicalNotes: 'Highly localized action making it ideal for targeted tissue and injury repair. Strong clinical evidence for musculoskeletal applications and gut health restoration.'
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
      'General Athletic Recovery': { score: 10, studies: 'Clinical research on post-exercise recovery and tissue repair' },
      'Heart Health & Circulation': { score: 10, studies: 'Studies on cardiac tissue repair and cardiovascular function' },
      'Muscle Wasting & Atrophy': { score: 9, studies: 'Research on muscle preservation and cellular proliferation' },
      'Systemic Inflammation': { score: 9, studies: 'Clinical evidence for whole-body inflammatory modulation' },
      'Wound & Injury Healing': { score: 9, studies: 'Comprehensive data on accelerated healing mechanisms' },
      'Athletic Endurance': { score: 8, studies: 'Studies on cellular capacity and energy production enhancement' },
      'Neurological Health': { score: 8, studies: 'Research on nerve protection and cognitive function support' },
      'Anti-Aging & Cellular Health': { score: 8, studies: 'Studies on cellular longevity and regeneration' },
      'Joint & Mobility': { score: 7, studies: 'Secondary benefit through systemic cellular support' }
    },
    contraindications: [],
    clinicalNotes: 'Systemic peptide with broad cellular protection mechanisms. Strong clinical evidence for comprehensive recovery and systemic health improvement.'
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
      'Type 2 Diabetes Management': { score: 10, studies: 'Landmark clinical trials demonstrating superior glucose control' },
      'Weight Loss & Obesity': { score: 10, studies: 'Extensive research showing significant weight reduction in clinical populations' },
      'Appetite Control': { score: 10, studies: 'Clinical evidence for satiety signaling and hunger reduction' },
      'Metabolic Syndrome': { score: 9, studies: 'Studies on metabolic health markers and insulin sensitivity' },
      'Cardiovascular Health': { score: 9, studies: 'Clinical data on heart health and vascular protection' },
      'Energy & Vitality': { score: 7, studies: 'Research on metabolic rate and energy production' },
      'Digestive Health': { score: 6, studies: 'Studies on GI motility and digestive function' },
      'Inflammation Markers': { score: 6, studies: 'Secondary anti-inflammatory effects in metabolic disease' }
    },
    contraindications: [
      { peptide: 'Tirzepatide', severity: 'HIGH', reason: 'Combining two GLP-1 pathway agonists significantly increases risk of adverse effects. Dual GLP-1 activation can cause severe nausea, vomiting, pancreatitis risk, and hypoglycemia. No clinical evidence supports this combination.' }
    ],
    clinicalNotes: 'Metabolic and endocrine focused peptide. Proven clinical efficacy for glucose regulation, weight management, and cardiovascular health. Well-established safety profile in human studies.'
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
      'Severe Obesity & Weight Loss': { score: 10, studies: 'Clinical trials showing superior weight reduction vs monotherapy' },
      'Type 2 Diabetes Management': { score: 10, studies: 'Advanced glucose control exceeding GLP-1 alone in clinical studies' },
      'Appetite Suppression': { score: 10, studies: 'Dual-pathway research demonstrating enhanced satiety signaling' },
      'Metabolic Syndrome': { score: 10, studies: 'Comprehensive metabolic health marker improvement in trials' },
      'Cardiovascular Protection': { score: 9, studies: 'Advanced clinical evidence for heart health and vascular support' },
      'Energy & Physical Performance': { score: 8, studies: 'Research on metabolic capacity and activity tolerance' },
      'Systemic Inflammation': { score: 7, studies: 'Dual-pathway anti-inflammatory mechanisms in clinical populations' },
      'Digestive Wellness': { score: 6, studies: 'GI health improvement in metabolic disease research' }
    },
    contraindications: [
      { peptide: 'Semaglutide', severity: 'HIGH', reason: 'Combining two GLP-1 pathway agonists significantly increases risk of adverse effects. Dual GLP-1 activation can cause severe nausea, vomiting, pancreatitis risk, and hypoglycemia. No clinical evidence supports this combination.' }
    ],
    clinicalNotes: 'Advanced dual-receptor metabolic peptide. Clinical evidence demonstrates superior efficacy to GLP-1 monotherapy. Strong safety profile in human studies with proven metabolic benefits.'
  }
};

// Usage duration and cycle classification
const PEPTIDE_USAGE_TYPE = {
  'BPC-157': { type: 'LONG_TERM', duration: '12-16 weeks continuous or extended', protocol: 'Daily subcutaneous injection protocol' },
  'TB-500': { type: 'CYCLE_BASED', duration: '8-12 week cycles', protocol: 'Twice weekly protocol with scheduled breaks' },
  'Semaglutide': { type: 'LONG_TERM', duration: 'Ongoing long-term use', protocol: 'Weekly injection protocol for sustained metabolic benefits' },
  'Tirzepatide': { type: 'LONG_TERM', duration: 'Ongoing long-term use', protocol: 'Weekly injection protocol for sustained metabolic benefits' }
};

// Safe stacking combinations based on clinical evidence, community protocols, and mechanism compatibility
const SAFE_STACKS = {
  'BPC-157': {
    compatible: [
      {
        peptide: 'TB-500',
        protocol: 'TB-500 (2x weekly) + BPC-157 (daily): Synergistic recovery protocol. TB-500 establishes systemic cellular foundation while BPC-157 targets localized healing. Both can run long-term. Popular in fitness recovery community.',
        compatibilityReason: 'Complementary tissue repair mechanisms without receptor overlap',
        usageCompatibility: true
      },
      {
        peptide: 'Semaglutide',
        protocol: 'Semaglutide (weekly) + BPC-157 (daily): Recovery + metabolic management. Extended BPC-157 cycle paired with Semaglutide for weight management. Common in comprehensive health protocols.',
        compatibilityReason: 'Separate pathways - repair focused vs metabolic focused',
        usageCompatibility: true
      }
    ]
  },
  'TB-500': {
    compatible: [
      {
        peptide: 'BPC-157',
        protocol: 'TB-500 (2x weekly) + BPC-157 (daily): Dual-peptide recovery protocol. Proven combination in athletic recovery community. Run TB-500 in 8-12 week cycles with continuous BPC-157.',
        compatibilityReason: 'Synergistic healing - systemic + localized support',
        usageCompatibility: true
      },
      {
        peptide: 'Tirzepatide',
        protocol: 'TB-500 (2x weekly, 8-12 week cycles) + Tirzepatide (weekly, long-term): Comprehensive protocol for recovery + metabolic health. TB-500 cycles support tissue while Tirzepatide maintains metabolic benefits.',
        compatibilityReason: 'Cellular repair complemented by metabolic optimization',
        usageCompatibility: true
      }
    ]
  },
  'Semaglutide': {
    compatible: [
      {
        peptide: 'BPC-157',
        protocol: 'Semaglutide (weekly, long-term) + BPC-157 (daily, long-term): Metabolic + tissue repair protocol. Extended combined protocol for comprehensive health. BPC-157 supports GI health which complements Semaglutide.',
        compatibilityReason: 'Metabolic optimization with tissue repair support',
        usageCompatibility: true
      },
      {
        peptide: 'TB-500',
        protocol: 'Semaglutide (weekly) + TB-500 (2x weekly, 8-12 week cycles): Metabolic foundation with periodic cellular repair. Run TB-500 in cycles during extended Semaglutide use.',
        compatibilityReason: 'Long-term metabolic support with periodic recovery cycles',
        usageCompatibility: true
      }
    ]
  },
  'Tirzepatide': {
    compatible: [
      {
        peptide: 'BPC-157',
        protocol: 'Tirzepatide (weekly, long-term) + BPC-157 (daily, long-term): Enhanced metabolic + tissue support. Both long-term protocols can run continuously. BPC-157 provides recovery support alongside aggressive metabolic management.',
        compatibilityReason: 'Dual long-term protocols with complementary benefits',
        usageCompatibility: true
      },
      {
        peptide: 'TB-500',
        protocol: 'Tirzepatide (weekly, long-term) + TB-500 (2x weekly, 8-12 week cycles): Metabolic dominance with recovery support. TB-500 in periodic cycles complements continuous Tirzepatide use.',
        compatibilityReason: 'Long-term metabolic with periodic cellular support',
        usageCompatibility: true
      }
    ]
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
                    {recommendations.ranked.slice(1).map(([peptideName, data]) => {
                      const topPeptide = recommendations.ranked[0][0];
                      const contraindication = PEPTIDE_RESEARCH_DATA[topPeptide]?.contraindications.find(c => c.peptide === peptideName);
                      
                      return (
                        <motion.div
                          key={peptideName}
                          className={`rounded-lg p-4 cursor-pointer transition-all ${
                            contraindication
                              ? 'bg-red-900/20 border border-red-700/50'
                              : 'bg-stone-800/40 border border-stone-700 hover:border-red-600/30'
                          }`}
                          onClick={() => setExpandedPeptide(expandedPeptide === peptideName ? null : peptideName)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-lg font-bold text-amber-50">{peptideName}</h4>
                                {contraindication && (
                                  <span className="px-2 py-1 bg-red-700/40 text-red-300 text-xs font-bold rounded">
                                    ⚠️ {contraindication.severity}
                                  </span>
                                )}
                              </div>
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
                                {contraindication && (
                                  <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                                    <p className="text-red-300 text-sm font-bold mb-2">⚠️ CONTRAINDICATION WARNING</p>
                                    <p className="text-red-200 text-xs">{contraindication.reason}</p>
                                  </div>
                                )}
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
                      );
                    })}
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
                      <h3 className="text-xl font-bold text-blue-300 mb-2">Safe Stacking Recommendation</h3>
                      <p className="text-stone-300 mb-6">
                        For complete coverage of all selected research areas, here are clinically-supported peptide combinations:
                      </p>

                      {/* Generate safe stack options */}
                      {(() => {
                        const topPeptide = recommendations.ranked[0][0];
                        const safeOptions = SAFE_STACKS[topPeptide]?.compatible || [];
                        
                        return (
                          <div className="space-y-4">
                            {safeOptions.map(compatiblePeptide => {
                              const stackInfo = SAFE_STACKS[topPeptide];
                              return (
                                <div key={compatiblePeptide} className="bg-stone-800/50 rounded-lg p-4 border border-blue-600/30">
                                  <p className="text-amber-50 font-bold mb-2">
                                    {topPeptide} + {compatiblePeptide}
                                  </p>
                                  <p className="text-stone-300 text-sm">
                                    {stackInfo.reason}
                                  </p>
                                  <div className="mt-3 p-2 bg-green-900/20 border border-green-700/30 rounded text-xs text-green-300">
                                    ✓ Clinically compatible - no known contraindications
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
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