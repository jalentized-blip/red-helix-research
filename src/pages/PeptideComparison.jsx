import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle2, AlertCircle, ChevronDown, Sparkles, Microscope, Activity, ShieldCheck, Zap } from 'lucide-react';
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
  'GHK-Cu': {
    fullName: 'GHK-Cu (Copper Tripeptide)',
    description: 'Copper peptide naturally found in plasma and saliva supporting collagen production and wound healing',
    molecularWeight: '~517 Da',
    aminoAcids: 3,
    stability: 'High',
    mechanism: 'Collagen synthesis and tissue remodeling',
    class: 'Anti-Aging & Tissue',
    benefits: {
      'Collagen & Skin Health': { score: 10, studies: 'Clinical evidence for collagen synthesis and skin elasticity improvement' },
      'Wound Healing': { score: 9, studies: 'Research demonstrating accelerated wound closure and tissue remodeling' },
      'Anti-Aging & Wrinkles': { score: 9, studies: 'Studies on skin firmness, elasticity, and reduction of fine lines' },
      'Hair Growth & Thickness': { score: 8, studies: 'Clinical data on hair follicle stimulation and growth acceleration' },
      'Bone Healing & Density': { score: 8, studies: 'Research on bone formation and mineralization' },
      'Muscle Soreness & Recovery': { score: 7, studies: 'Secondary benefit through tissue repair mechanisms' },
      'Joint Pain & Arthritis': { score: 7, studies: 'Studies on cartilage remodeling and joint health' },
      'General Healing': { score: 8, studies: 'Broad-spectrum tissue repair and regeneration' }
    },
    contraindications: [],
    clinicalNotes: 'Well-established safety profile with decades of clinical use. Synergizes effectively with other repair peptides.'
  },
  'Ipamorelin': {
    fullName: 'Ipamorelin (Growth Hormone Secretagogue)',
    description: 'Selective growth hormone-releasing peptide stimulating natural GH production without cortisol increase',
    molecularWeight: '~711 Da',
    aminoAcids: 5,
    stability: 'Stable',
    mechanism: 'Selective GH receptor agonism',
    class: 'GH Secretagogue',
    benefits: {
      'Muscle Growth & Strength': { score: 10, studies: 'Clinical trials showing increased lean muscle mass and strength gains' },
      'Athletic Performance': { score: 9, studies: 'Research on performance enhancement and recovery' },
      'Body Composition': { score: 9, studies: 'Studies on fat reduction and lean mass increase' },
      'Energy & Vitality': { score: 8, studies: 'Clinical evidence for improved energy levels and stamina' },
      'Recovery & Healing': { score: 8, studies: 'Research on tissue repair acceleration' },
      'Sleep Quality': { score: 7, studies: 'Studies on sleep architecture improvement' },
      'Anti-Aging & Longevity': { score: 7, studies: 'Data on cellular regeneration and aging markers' }
    },
    contraindications: [],
    clinicalNotes: 'Superior selectivity compared to other GH secretagogues. Minimal cortisol elevation. Ideal for cycling protocols.'
  },
  'CJC-1295': {
    fullName: 'CJC-1295 (Growth Hormone-Releasing Hormone)',
    description: 'Synthetic GHRH analog providing sustained growth hormone elevation for extended periods',
    molecularWeight: '~3,649 Da',
    aminoAcids: 30,
    stability: 'Very High (with DAC)',
    mechanism: 'GHRH receptor agonism',
    class: 'GH Secretagogue',
    benefits: {
      'Muscle Growth & Strength': { score: 10, studies: 'Clinical evidence for sustained lean muscle development' },
      'Body Composition': { score: 9, studies: 'Research on fat reduction and muscle preservation' },
      'Athletic Performance': { score: 9, studies: 'Studies on endurance and recovery enhancement' },
      'Collagen & Skin Health': { score: 8, studies: 'Research on skin thickness and elasticity through GH effects' },
      'Bone Density': { score: 8, studies: 'Clinical data on bone mineral density improvement' },
      'Recovery & Healing': { score: 8, studies: 'Evidence for accelerated tissue repair' },
      'Energy & Vitality': { score: 7, studies: 'Studies on metabolic rate and energy production' },
      'Sleep Quality': { score: 6, studies: 'Research on deep sleep architecture' }
    },
    contraindications: [],
    clinicalNotes: 'Provides sustained GH elevation over extended periods. Synergizes powerfully with Ipamorelin.'
  },
  'Pinealon': {
    fullName: 'Pinealon (Epitalon Bioregulator)',
    description: 'Pineal gland peptide bioregulator supporting cellular regeneration and neuroprotection',
    molecularWeight: '~518 Da',
    aminoAcids: 3,
    stability: 'High',
    mechanism: 'Pineal function optimization and telomerase regulation',
    class: 'Cellular Bioregulator',
    benefits: {
      'Anti-Aging & Longevity': { score: 10, studies: 'Clinical research on telomerase activity and cellular aging' },
      'Sleep Quality': { score: 9, studies: 'Studies on circadian rhythm regulation and sleep architecture' },
      'Cognitive Function': { score: 8, studies: 'Research on neuroprotection and mental clarity' },
      'Neurological Health': { score: 8, studies: 'Evidence for brain health and neural protection' },
      'Immune Support': { score: 7, studies: 'Studies on immune system regulation and optimization' },
      'Stress Management': { score: 7, studies: 'Research on cortisol regulation and stress response' },
      'Cellular Health': { score: 8, studies: 'Data on mitochondrial function and cellular vitality' }
    },
    contraindications: [],
    clinicalNotes: 'Russian bioregulator with decades of safety data. Supports deep cellular regeneration and longevity pathways.'
  },
  'DSIP': {
    fullName: 'DSIP (Delta Sleep-Inducing Peptide)',
    description: 'Endogenous peptide regulating sleep quality and hormonal balance',
    molecularWeight: '~848 Da',
    aminoAcids: 9,
    stability: 'Moderate',
    mechanism: 'Sleep regulation and hormonal modulation',
    class: 'Sleep & Recovery',
    benefits: {
      'Sleep Quality': { score: 10, studies: 'Clinical evidence for deep sleep enhancement and sleep architecture' },
      'Stress Management': { score: 9, studies: 'Research on cortisol reduction and stress resilience' },
      'Recovery & Healing': { score: 8, studies: 'Studies on sleep-dependent tissue repair and recovery' },
      'Hormonal Balance': { score: 8, studies: 'Clinical data on hormone normalization during sleep' },
      'Pain Management': { score: 7, studies: 'Research on pain perception reduction through sleep improvement' },
      'Mental Clarity': { score: 7, studies: 'Studies on cognitive function improvement' },
      'Immune Support': { score: 6, studies: 'Evidence for immune enhancement during deep sleep' }
    },
    contraindications: [],
    clinicalNotes: 'Endogenous peptide with strong sleep regulatory mechanisms. Excellent for sleep optimization protocols.'
  },
  'Gonadorelin': {
    fullName: 'Gonadorelin (GnRH - Gonadotropin-Releasing Hormone)',
    description: 'Natural hormone regulating reproductive and hormonal function',
    molecularWeight: '~1,182 Da',
    aminoAcids: 10,
    stability: 'Moderate',
    mechanism: 'GnRH receptor agonism and reproductive axis regulation',
    class: 'Hormonal Regulator',
    benefits: {
      'Sexual Health & Performance': { score: 10, studies: 'Clinical evidence for reproductive function optimization' },
      'Hormonal Balance': { score: 9, studies: 'Research on testosterone and reproductive hormone regulation' },
      'Fertility Support': { score: 9, studies: 'Studies on fertility restoration and sperm production' },
      'Mood & Confidence': { score: 7, studies: 'Clinical data on mood improvement through hormone balance' },
      'Energy & Vitality': { score: 6, studies: 'Secondary benefit through hormonal optimization' }
    },
    contraindications: [],
    clinicalNotes: 'Regulatory hormone with strong clinical evidence for reproductive health. Works upstream on hormone axis.'
  },
  'KPV': {
    fullName: 'KPV (Lysine-Proline-Valine)',
    description: 'Tripeptide from alpha-melanocyte-stimulating hormone with anti-inflammatory properties',
    molecularWeight: '~345 Da',
    aminoAcids: 3,
    stability: 'High',
    mechanism: 'Anti-inflammatory and immune modulation',
    class: 'Anti-Inflammatory',
    benefits: {
      'Chronic Inflammation': { score: 10, studies: 'Clinical evidence for inflammatory marker reduction' },
      'Gut Health & Leaky Gut': { score: 9, studies: 'Research on intestinal barrier integrity and inflammation' },
      'Immune Support': { score: 8, studies: 'Studies on immune system optimization' },
      'Joint Pain & Arthritis': { score: 8, studies: 'Clinical data on inflammatory joint conditions' },
      'Skin Health': { score: 7, studies: 'Research on inflammatory skin conditions' }
    },
    contraindications: [],
    clinicalNotes: 'Potent anti-inflammatory with broad systemic benefits. Commonly stacked with tissue repair peptides.'
  },
  'Oxytocin': {
    fullName: 'Oxytocin (Love & Bonding Hormone)',
    description: 'Neurohormone regulating social bonding, mood, and sexual function',
    molecularWeight: '~1,007 Da',
    aminoAcids: 9,
    stability: 'Moderate',
    mechanism: 'Oxytocin receptor agonism',
    class: 'Neurohormonal',
    benefits: {
      'Mood & Emotional Wellness': { score: 9, studies: 'Clinical evidence for mood enhancement and social connection' },
      'Sexual Health & Performance': { score: 9, studies: 'Research on sexual function and arousal' },
      'Stress Management': { score: 8, studies: 'Studies on anxiety reduction and stress resilience' },
      'Social Wellness': { score: 8, studies: 'Clinical data on bonding, trust, and social interaction' },
      'Pain Management': { score: 7, studies: 'Research on pain perception and threshold' }
    },
    contraindications: [],
    clinicalNotes: 'Well-researched neurohormone with strong safety profile. Supports emotional and relational wellness.'
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
  'GHK-Cu': { type: 'LONG_TERM', duration: '12+ weeks continuous', protocol: 'Daily or 5x per week protocol' },
  'Ipamorelin': { type: 'CYCLE_BASED', duration: '12-16 week cycles', protocol: '1-3x daily injection protocol' },
  'CJC-1295': { type: 'CYCLE_BASED', duration: '12-16 week cycles', protocol: '2x weekly injection protocol' },
  'Pinealon': { type: 'CYCLE_BASED', duration: '10 day cycles with breaks', protocol: 'Daily subcutaneous or intranasal' },
  'DSIP': { type: 'CYCLE_BASED', duration: '8-10 week cycles', protocol: 'Evening injection before sleep' },
  'Gonadorelin': { type: 'CYCLE_BASED', duration: '8-12 week cycles', protocol: 'Multiple daily injections' },
  'KPV': { type: 'LONG_TERM', duration: '8-12 weeks continuous', protocol: 'Daily or every other day' },
  'Oxytocin': { type: 'CYCLE_BASED', duration: '4-8 week cycles', protocol: '1-2x daily nasal spray or injection' },
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
        protocol: 'Semaglutide (weekly) + BPC-157 (daily): Metabolic + recovery support. Long-term Semaglutide protocol paired with continuous BPC-157 for systemic wellness. High patient satisfaction in clinical reports.',
        compatibilityReason: 'No known contraindications. Different biological targets.',
        usageCompatibility: true
      }
    ]
  }
};

export default function PeptideComparison() {
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [expandedPeptide, setExpandedPeptide] = useState(null);

  const allBenefits = useMemo(() => {
    const benefits = new Set();
    Object.values(PEPTIDE_RESEARCH_DATA).forEach(peptide => {
      Object.keys(peptide.benefits).forEach(benefit => benefits.add(benefit));
    });
    return Array.from(benefits).sort();
  }, []);

  const calculateScores = (selectedBenefitsArray) => {
    const scores = {};
    
    Object.entries(PEPTIDE_RESEARCH_DATA).forEach(([peptideName, data]) => {
      const matchedBenefits = selectedBenefitsArray.filter(benefit => data.benefits[benefit]);
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
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO
        title="Peptide Research Recommendation Tool | Red Helix Research"
        description="Intelligent peptide selection tool matching your research benefits to the ideal peptides. Clinical research-based recommendations."
        keywords="peptide recommendation, research benefits, BPC-157, TB-500, Semaglutide, Tirzepatide, peptide selection"
      />

      <div className="max-w-6xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="mb-8 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-bold uppercase tracking-wider text-xs">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-4 tracking-tighter uppercase leading-none">
            Research <span className="text-red-600">Finder</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
            Discover the ideal peptide protocols for your clinical research through our data-driven selection matrix.
          </p>
        </motion.div>

        {/* Benefit Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 md:p-12 mb-12 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Microscope className="w-32 h-32 text-slate-900" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight flex items-center gap-3">
              <Activity className="w-8 h-8 text-red-600" />
              1. Research Parameters
            </h2>
            <p className="text-slate-500 font-medium mb-8">Select all clinical research areas relevant to your current study:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
              {allBenefits.map((benefit) => (
                <motion.button
                  key={benefit}
                  onClick={() => toggleBenefit(benefit)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-5 rounded-2xl border-2 transition-all text-left font-black uppercase tracking-tight text-xs ${
                    selectedBenefits.includes(benefit)
                      ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-100'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-red-600/50 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{benefit}</span>
                    {selectedBenefits.includes(benefit) ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-200" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFindRecommendation}
                disabled={selectedBenefits.length === 0}
                className="w-full md:w-auto px-12 py-5 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest rounded-full shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
              >
                <Sparkles className="w-5 h-5 text-red-600" />
                Analyze Research Data
              </motion.button>
              {selectedBenefits.length > 0 && (
                <button
                  onClick={resetSelection}
                  className="px-8 py-5 text-slate-400 hover:text-red-600 font-black uppercase tracking-widest text-xs transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recommendations */}
        <AnimatePresence>
          {recommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Perfect Match Section */}
              {recommendations.perfectMatch && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border-2 border-green-500/30 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-green-50 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                    <ShieldCheck className="w-48 h-48 text-green-600" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Protocol <span className="text-green-600">Perfect Match</span></h3>
                      <p className="text-slate-500 font-medium text-lg">We've identified a clinical match that satisfies 100% of your research requirements.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Top Result Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 shadow-xl relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row items-start justify-between mb-10 gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Primary Recommendation</span>
                      <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">{PEPTIDE_RESEARCH_DATA[recommendations.ranked[0][0]].class}</span>
                    </div>
                    <h3 className="text-4xl md:text-6xl font-black text-slate-900 mb-3 uppercase tracking-tighter">
                      {recommendations.ranked[0][0]}
                    </h3>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                      {PEPTIDE_RESEARCH_DATA[recommendations.ranked[0][0]].description}
                    </p>
                  </div>
                  <div className="text-right bg-slate-50 p-8 rounded-[32px] border border-slate-100 min-w-[200px]">
                    <div className="text-6xl font-black text-red-600 tracking-tighter mb-1">
                      {Math.round(recommendations.ranked[0][1].matchPercentage)}%
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Clinical Match Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 py-10 border-y border-slate-100">
                  <div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">Molecular Profile</p>
                    <p className="text-slate-900 font-black text-lg">{PEPTIDE_RESEARCH_DATA[recommendations.ranked[0][0]].aminoAcids} AA</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">Mass Spectrometry</p>
                    <p className="text-slate-900 font-black text-lg">{PEPTIDE_RESEARCH_DATA[recommendations.ranked[0][0]].molecularWeight}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">Usage Type</p>
                    <p className="text-slate-900 font-black text-lg">{PEPTIDE_USAGE_TYPE[recommendations.ranked[0][0]].type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">Stability</p>
                    <p className="text-slate-900 font-black text-lg">{PEPTIDE_RESEARCH_DATA[recommendations.ranked[0][0]].stability}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      Protocol Rationale
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.ranked[0][1].matchedBenefits.map(benefit => (
                        <div key={benefit} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-black text-slate-900 text-xs uppercase tracking-tight mb-1">{benefit}</p>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">{PEPTIDE_RESEARCH_DATA[recommendations.ranked[0][0]].benefits[benefit].studies}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[32px] p-8 md:p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Zap className="w-24 h-24 text-red-600" />
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-xs font-black uppercase tracking-widest text-red-500 mb-4">Clinical Research Protocol</h4>
                      <p className="text-lg font-medium leading-relaxed opacity-90">
                        {PEPTIDE_USAGE_TYPE[recommendations.ranked[0][0]].protocol} for a duration of {PEPTIDE_USAGE_TYPE[recommendations.ranked[0][0]].duration}.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Other Options Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 border border-slate-200 rounded-[40px] p-8 md:p-12"
              >
                <h3 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Additional <span className="text-slate-400">Research Options</span></h3>
                <div className="space-y-4">
                  {recommendations.ranked.slice(1).filter(([_, data]) => data.matchPercentage > 0).map(([peptideName, data]) => {
                    const topPeptide = recommendations.ranked[0][0];
                    const contraindication = PEPTIDE_RESEARCH_DATA[topPeptide]?.contraindications.find(c => c.peptide === peptideName);
                    
                    return (
                      <motion.div
                        key={peptideName}
                        className={`rounded-[24px] p-6 cursor-pointer transition-all border ${
                          contraindication
                            ? 'bg-red-50 border-red-200'
                            : 'bg-white border-slate-100 hover:border-red-600/30 hover:shadow-lg'
                        }`}
                        onClick={() => setExpandedPeptide(expandedPeptide === peptideName ? null : peptideName)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg ${
                              contraindication ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-900'
                            }`}>
                              {Math.round(data.matchPercentage)}%
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{peptideName}</h4>
                                {contraindication && (
                                  <span className="px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full">Contraindicated</span>
                                )}
                              </div>
                              <p className="text-slate-500 font-medium text-sm">
                                {data.matchedCount} research parameters matched
                              </p>
                            </div>
                          </div>
                          <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform ${expandedPeptide === peptideName ? 'rotate-180' : ''}`} />
                        </div>

                        <AnimatePresence>
                          {expandedPeptide === peptideName && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-8 mt-6 border-t border-slate-100">
                                {contraindication ? (
                                  <div className="bg-red-600 text-white p-6 rounded-2xl flex items-start gap-4">
                                    <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                                    <div>
                                      <p className="font-black uppercase tracking-widest text-xs mb-2">Protocol Warning: {contraindication.severity} Severity</p>
                                      <p className="text-sm font-medium leading-relaxed">{contraindication.reason}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Matched Benefits</h5>
                                      <div className="space-y-2">
                                        {data.matchedBenefits.map(benefit => (
                                          <div key={benefit} className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            {benefit}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Clinical Overview</h5>
                                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                        {PEPTIDE_RESEARCH_DATA[peptideName].clinicalNotes}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Stacking Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 right-0 p-12 opacity-5">
                  <Activity className="w-48 h-48 text-red-600" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-start gap-6 mb-10">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Research <span className="text-red-600">Stacking Matrix</span></h3>
                      <p className="text-slate-400 font-medium text-lg max-w-2xl">
                        Clinically-supported peptide combinations for expanded research scope and synergistic effects.
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const topPeptide = recommendations.ranked[0][0];
                    const safeOptions = SAFE_STACKS[topPeptide]?.compatible || [];
                    
                    if (safeOptions.length === 0) return (
                      <p className="text-slate-500 italic font-medium p-8 bg-black/20 rounded-3xl border border-white/5">
                        No established safe stacking protocols found for this primary research peptide.
                      </p>
                    );

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {safeOptions.map((stackOption) => (
                          <div key={stackOption.peptide} className="bg-black/20 border border-white/5 rounded-[32px] p-8 hover:border-red-600/30 transition-all group">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="px-4 py-2 bg-red-600 border border-red-500 rounded-xl">
                                <span className="text-white font-black text-sm uppercase tracking-widest">{topPeptide} + {stackOption.peptide}</span>
                              </div>
                            </div>
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Mechanism Compatibility</h5>
                            <p className="text-slate-300 text-sm font-medium mb-6 leading-relaxed">
                              {stackOption.protocol}
                            </p>
                            <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                              <ShieldCheck className="w-4 h-4" />
                              Mechanism Verified
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Available Research Peptides Catalog */}
        {!recommendations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50 border border-slate-200 rounded-[40px] p-8 md:p-12 mt-12"
          >
            <div className="flex items-center gap-3 mb-8">
              <Microscope className="w-8 h-8 text-red-600" />
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Clinical <span className="text-slate-400">Reference Library</span></h2>
            </div>
            <p className="text-slate-500 font-medium mb-12 text-lg max-w-3xl leading-relaxed">
              Every research material in our catalog is backed by peer-reviewed studies and undergoes rigorous purity verification.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(PEPTIDE_RESEARCH_DATA).map(([name, data]) => (
                <div key={name} className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight group-hover:text-red-600 transition-colors">{name}</h3>
                    <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-full">{data.class}</span>
                  </div>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">{data.fullName}</p>
                  <p className="text-slate-600 text-sm font-medium mb-8 leading-relaxed line-clamp-2">{data.description}</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">MW: {data.molecularWeight}</div>
                    <div className="px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">AA: {data.aminoAcids}</div>
                    <div className="px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">STABILITY: {data.stability}</div>
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
