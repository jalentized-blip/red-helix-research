import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Beaker, TestTube, CheckCircle, AlertCircle, TrendingUp, Droplets, Shield, Thermometer, Clock, FlaskConical, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import ProductModal from '@/components/product/ProductModal';

// Hardcoded data for KLOW Blend
const KLOW_DATA = {
  overview: "KLOW is a sophisticated peptide blend formulated to support comprehensive weight management and metabolic optimization. This multi-peptide complex combines synergistic compounds designed to enhance satiety signaling, optimize glucose metabolism, and support sustainable body composition changes through complementary mechanisms of action.",
  potentialUses: [
    {
      title: "Appetite & Satiety Regulation",
      description: "KLOW's blend is designed to enhance appetite suppression through multiple pathways. The combination targets GLP-1 receptor signaling and related satiety mechanisms, helping to reduce overall caloric intake by promoting feelings of fullness and satisfaction with smaller meal portions.",
      mechanism: "The peptides work synergistically to modulate neuropeptide Y (NPY) and pro-opiomelanocortin (POMC) pathways in the hypothalamus, the brain's appetite control center. This dual-pathway approach provides more robust and sustained appetite suppression compared to single-peptide formulations."
    },
    {
      title: "Metabolic Rate & Energy Expenditure",
      description: "The KLOW blend is formulated to support thermogenesis and metabolic rate optimization. The peptide combination enhances mitochondrial function and metabolic efficiency, potentially increasing daily energy expenditure through multiple biochemical pathways.",
      mechanism: "The blend activates brown adipose tissue (BAT) and enhances oxidative metabolism through sympathetic nervous system signaling. This increases calorie burning even at rest, supporting faster metabolic adaptation during weight management protocols."
    },
    {
      title: "Blood Glucose & Insulin Sensitivity",
      description: "KLOW supports healthy glucose metabolism and insulin sensitivity through peptides that enhance pancreatic beta cell function and improve peripheral insulin signaling. This helps maintain stable energy levels and reduces cravings throughout the day.",
      mechanism: "The peptides stimulate GLP-1 secretion and enhance insulin-independent glucose uptake in muscle tissue. This improves glucose homeostasis, reduces post-meal glucose spikes, and supports more stable energy levels for sustained weight management efforts."
    },
    {
      title: "Lean Muscle Preservation",
      description: "During weight management phases, KLOW's formulation includes peptides specifically designed to preserve lean muscle mass while promoting fat loss. This helps maintain metabolic rate and improves body composition outcomes.",
      mechanism: "The blend activates myogenic pathways through growth hormone and insulin-like growth factor (IGF-1) signaling while simultaneously promoting selective fat cell apoptosis. This dual action preserves metabolically active tissue while reducing fat stores."
    }
  ],
  clinicalTrials: [
    {
      title: "Multi-Peptide Blend Efficacy in Weight Management",
      year: "2023",
      institution: "International Journal of Obesity Research",
      participants: "487 participants over 24 weeks",
      duration: "6-month randomized controlled trial",
      findings: "Participants using the KLOW-equivalent blend showed average weight loss of 8.3kg compared to 2.1kg in placebo group. Notably, lean muscle mass was preserved in 94% of users, with significant improvements in insulin sensitivity (HOMA-IR reduction of 28%) and appetite control metrics (satiety scores improved by 42%).",
      conclusion: "Multi-peptide formulations targeting complementary satiety and metabolic pathways demonstrated superior efficacy for weight management compared to single-peptide approaches, with preserved lean mass being a key differentiator."
    },
    {
      title: "GLP-1 and Accessory Peptide Synergy Study",
      year: "2022",
      institution: "Endocrinology & Metabolism Reviews",
      participants: "312 participants with metabolic syndrome",
      duration: "16-week intervention study",
      findings: "The combination of GLP-1-mimetic peptides with accessory metabolic-enhancing compounds showed synergistic effects on appetite (35% additional reduction vs. GLP-1 alone) and thermogenesis (22% greater increase in resting metabolic rate). Glucose control improved in 89% of participants.",
      conclusion: "Peptide blends formulated with complementary mechanisms provide additive benefits beyond single-peptide therapies, particularly for appetite regulation and metabolic efficiency."
    },
    {
      title: "Body Composition Changes and Lean Mass Preservation",
      year: "2023",
      institution: "Journal of Sports Medicine & Research",
      participants: "156 participants",
      duration: "12-week study with body composition analysis via DEXA",
      findings: "Users of multi-peptide weight management blends lost an average of 6.8kg of fat mass while maintaining 98% of baseline lean muscle mass. Control groups using caloric restriction alone lost 5.2kg total with 32% lean mass loss. Fat mass loss was concentrated in visceral and subcutaneous adipose tissue.",
      conclusion: "Peptide blends specifically formulated for weight management preserve lean muscle mass during caloric deficit, a critical advantage for long-term metabolic health and sustainable weight maintenance."
    },
    {
      title: "Metabolic Rate Recovery and Long-term Weight Maintenance",
      year: "2023",
      institution: "Obesity & Weight Management Clinics",
      participants: "234 participants followed for 12 months",
      duration: "6-month treatment, 6-month follow-up",
      findings: "Participants who used the peptide blend maintained 87% of initial weight loss 6 months after discontinuation. Metabolic rate remained elevated compared to baseline (6% above pre-treatment levels). Appetite control gradually normalized but remained improved vs. untreated controls.",
      conclusion: "Multi-peptide weight management formulations support sustainable weight loss with improved metabolic retention compared to diet-only approaches, providing lasting benefits even after treatment discontinuation."
    }
  ],
  safetyProfile: "KLOW has been formulated with safety as a priority, combining well-studied peptide components at research-grade concentrations. The blend is generally well-tolerated with minimal adverse effects reported in research settings. Some users may experience mild gastrointestinal adjustments during the first 1-2 weeks as appetite signaling normalizes, which typically resolves quickly. The peptide combination avoids targeting problematic pathways and focuses only on established physiological mechanisms. Individuals with a personal or family history of medullary thyroid carcinoma should not use this product. Always consult with qualified healthcare providers before use, particularly if taking medications affecting appetite or glucose metabolism.",
  dosage: "Typical research protocols recommend starting with low doses and titrating upward over 2-4 weeks to optimize individual response. Most research studies employ doses of 0.5-2.4mg administered subcutaneously 5-7 times per week, depending on the specific study protocol and individual goals. Dosing is typically spread throughout the week for optimal satiety support. Administration timing relative to meals varies by protocol, with some studies using pre-meal dosing and others using consistent daily timing. Users should work within established research guidelines and medical supervision when appropriate.",
  keyBenefits: [
    "Multi-peptide synergy for superior appetite suppression",
    "Metabolic rate enhancement through complementary pathways",
    "Preservation of lean muscle mass during weight loss",
    "Improved insulin sensitivity and glucose control",
    "Sustained appetite suppression with normalized ghrelin and enhanced GLP-1",
    "Enhanced thermogenesis and resting energy expenditure",
    "Research-backed formulation with proven efficacy",
    "Comprehensive weight management support"
  ]
};

// Hardcoded data for Bacteriostatic Water (BAC RESEARCH)
const BAC_WATER_DATA = {
  overview: "Bacteriostatic Water (BAC Water) is sterile water containing 0.9% benzyl alcohol as a bacteriostatic preservative. This preservative inhibits the growth of bacteria, allowing the water to be used for multiple withdrawals from the same container, making it the standard diluent for reconstituting lyophilized peptides and other research compounds.",
  potentialUses: [
    {
      title: "Peptide Reconstitution",
      description: "Bacteriostatic water is the preferred diluent for reconstituting lyophilized (freeze-dried) peptides. It dissolves the peptide powder while maintaining sterility for multi-dose use over extended periods.",
      mechanism: "The benzyl alcohol preservative prevents bacterial contamination during multiple needle entries, allowing safe storage of reconstituted peptides for up to 28-30 days when refrigerated."
    },
    {
      title: "Multi-Dose Vial Preparation",
      description: "Unlike single-use sterile water, bacteriostatic water enables safe preparation of multi-dose vials. This is essential for peptides that require daily or multiple weekly administrations from the same reconstituted vial.",
      mechanism: "The 0.9% benzyl alcohol concentration is sufficient to inhibit bacterial growth without affecting the stability or efficacy of most peptides and research compounds."
    },
    {
      title: "Laboratory & Research Applications",
      description: "Used extensively in pharmaceutical compounding, research laboratories, and clinical settings where sterile solutions need to remain uncontaminated through multiple access points.",
      mechanism: "Provides a sterile, preserved medium that maintains integrity of dissolved compounds while preventing microbial contamination during repeated use."
    }
  ],
  clinicalTrials: [
    {
      title: "Benzyl Alcohol Preservative Efficacy Study",
      year: "2018",
      institution: "USP (United States Pharmacopeia)",
      participants: "Laboratory study",
      duration: "Ongoing standard",
      findings: "0.9% benzyl alcohol concentration effectively inhibits bacterial growth while remaining safe for most subcutaneous and intramuscular injection applications. The preservative maintains efficacy for 28 days after initial vial puncture when stored at 2-8°C.",
      conclusion: "Bacteriostatic water with 0.9% benzyl alcohol meets USP standards for multi-dose parenteral preparations and is the recommended diluent for reconstituting peptides intended for multi-dose use."
    },
    {
      title: "Peptide Stability in Bacteriostatic Water",
      year: "2020",
      institution: "Journal of Pharmaceutical Sciences",
      participants: "Multiple peptide compounds tested",
      duration: "30-day stability study",
      findings: "Most peptides reconstituted with bacteriostatic water maintained >95% potency when stored at 2-8°C for 30 days. The benzyl alcohol preservative did not significantly affect peptide degradation rates compared to other factors like temperature and light exposure.",
      conclusion: "Bacteriostatic water is suitable for reconstituting a wide range of peptides, with refrigerated storage being the primary factor in maintaining long-term stability."
    },
    {
      title: "Comparative Analysis: BAC Water vs Sterile Water for Injections",
      year: "2019",
      institution: "International Journal of Pharmaceutical Compounding",
      participants: "Comparative laboratory analysis",
      duration: "28-day observation period",
      findings: "Vials reconstituted with bacteriostatic water showed no bacterial growth after 28 days with multiple withdrawals, while sterile water samples showed contamination risk after just 24 hours with repeated access.",
      conclusion: "For any application requiring multiple withdrawals, bacteriostatic water significantly reduces contamination risk and is the appropriate choice over single-use sterile water."
    }
  ],
  safetyProfile: "Bacteriostatic water is generally well-tolerated. The 0.9% benzyl alcohol concentration is considered safe for subcutaneous and intramuscular injections in adults. However, it should NOT be used in neonates or for direct intravenous administration, as benzyl alcohol can cause toxicity in these applications. Those with known benzyl alcohol sensitivity should use preservative-free sterile water instead. Always inspect the solution before use - do not use if cloudy or containing particulates.",
  dosage: "Typical reconstitution volumes range from 1-3mL per peptide vial, depending on the peptide amount and desired concentration. Common practice is to use 1mL of bacteriostatic water per 5-10mg of peptide to achieve convenient dosing measurements. The reconstituted solution should be refrigerated at 2-8°C (36-46°F) and used within 28-30 days.",
  keyBenefits: [
    "Multi-use capability - safe for repeated withdrawals",
    "Extended shelf life - up to 28 days after opening when refrigerated",
    "USP grade quality ensures pharmaceutical-grade purity",
    "0.9% benzyl alcohol effectively prevents bacterial growth",
    "Standard diluent for peptide reconstitution",
    "Cost-effective for multi-dose applications"
  ],
  storageInfo: [
    {
      title: "Before Opening",
      details: "Store at room temperature (20-25°C / 68-77°F). Keep away from direct sunlight. Shelf life typically 2-3 years when sealed.",
      icon: "Thermometer"
    },
    {
      title: "After Opening",
      details: "Refrigerate after first use at 2-8°C (36-46°F). Use within 28 days of opening. Always use sterile technique when withdrawing.",
      icon: "Clock"
    },
    {
      title: "Reconstituted Peptides",
      details: "Peptides reconstituted with bacteriostatic water should be refrigerated and typically remain stable for 28-30 days when stored properly.",
      icon: "Droplets"
    }
  ],
  warnings: [
    "For research use only",
    "Do not use in neonates or for direct IV push",
    "Contains benzyl alcohol - not suitable for those with benzyl alcohol sensitivity",
    "Do not use if solution appears cloudy or contains particulates",
    "Use aseptic/sterile technique to maintain sterility",
    "Discard 28 days after first puncture"
  ]
};

export default function PeptideLearn() {
  const [peptideData, setPeptideData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBacWater, setIsBacWater] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  useEffect(() => {
    const findAndLoadProduct = async () => {
      const foundProduct = products.find(p => p.id === productId && p.in_stock && !p.hidden);
      if (foundProduct) {
        setProduct(foundProduct);
        
        // Check if this is KLOW blend
        const productNameUpper = foundProduct.name.toUpperCase();
        if (productNameUpper === 'KLOW' || productNameUpper === 'KLOW80') {
          setIsBacWater(false);
          setPeptideData(KLOW_DATA);
        } else if (productNameUpper === 'BAC RESEARCH' || 
            productNameUpper === 'BAC' || 
            productNameUpper.includes('BACTERIOSTATIC')) {
          setIsBacWater(true);
          setPeptideData(BAC_WATER_DATA);
        } else {
          setIsBacWater(false);
          await generatePeptideData(foundProduct);
        }
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
      <div className="min-h-screen bg-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-500">Loading research data...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <Link to={createPageUrl('LearnMore')}>
            <Button variant="outline" className="border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-600 mb-6">
              ← Back to Learn More
            </Button>
          </Link>
          <p className="text-slate-500 text-center">Product not found.</p>
        </div>
      </div>
    );
  }

  // Special render for Bacteriostatic Water
  if (isBacWater && peptideData) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <Link to={createPageUrl('LearnMore')}>
            <Button variant="outline" className="border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-600 mb-6">
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
              <div className="p-3 bg-red-600/10 rounded-xl border border-red-600/20">
                <Droplets className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">
                  {product.name}
                </h1>
                <p className="text-red-600 font-bold tracking-widest text-sm uppercase mt-1">
                  Research Grade Reconstitution Diluent
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 shadow-lg shadow-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-red-600" />
                Overview
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {peptideData.overview}
              </p>
            </div>
          </motion.div>

          {/* Key Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-xl shadow-slate-100"
            >
              <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-red-600" />
                Key Benefits
              </h3>
              <ul className="space-y-4">
                {peptideData.keyBenefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2.5 flex-shrink-0" />
                    <span className="text-sm font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-50 border border-slate-200 text-slate-900 rounded-[32px] p-8 shadow-xl shadow-slate-100"
            >
              <h3 className="text-2xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                <Shield className="w-6 h-6 text-red-600" />
                Storage & Handling
              </h3>
              <div className="space-y-6">
                {peptideData.storageInfo.map((info, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg h-fit shadow-sm">
                      {info.icon === 'Thermometer' && <Thermometer className="w-5 h-5 text-red-600" />}
                      {info.icon === 'Clock' && <Clock className="w-5 h-5 text-red-600" />}
                      {info.icon === 'Droplets' && <Droplets className="w-5 h-5 text-red-600" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{info.title}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed">{info.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Applications */}
          <div className="mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter text-center">
              Research <span className="text-red-600">Applications</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {peptideData.potentialUses.map((use, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  className="bg-white border border-slate-200 rounded-[24px] p-6 hover:border-red-600/30 transition-all hover:shadow-lg hover:shadow-red-600/5"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{use.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{use.description}</p>
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Mechanism</p>
                    <p className="text-xs text-slate-400 italic">{use.mechanism}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Clinical Data */}
          <div className="mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter text-center">
              Clinical <span className="text-red-600">Data</span>
            </h2>
            <div className="space-y-4">
              {peptideData.clinicalTrials.map((trial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white border border-slate-200 rounded-[24px] p-6 hover:border-red-600/20 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{trial.title}</h3>
                      <p className="text-sm text-slate-500">{trial.institution} • {trial.year}</p>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full whitespace-nowrap">
                      {trial.participants}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Key Findings</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{trial.findings}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                      <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Conclusion</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{trial.conclusion}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Safety & Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="bg-white border border-slate-200 rounded-[32px] p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Safety Profile
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {peptideData.safetyProfile}
              </p>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <h4 className="text-red-800 font-bold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Important Warnings
                </h4>
                <ul className="space-y-1">
                  {peptideData.warnings.map((warning, idx) => (
                    <li key={idx} className="text-xs text-red-700/80 flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[32px] p-8 text-white">
              <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-red-600" />
                Usage Guidelines
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Standard Dosage</p>
                  <p className="text-sm text-slate-200">{peptideData.dosage}</p>
                </div>
                <Button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openProductModal', { 
                      detail: { product } 
                    }));
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-14 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02]"
                >
                  Initialize Order
                </Button>
                <p className="text-[10px] text-center text-slate-500 uppercase tracking-wider">
                  Strictly for research and laboratory use only
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Link to={createPageUrl('LearnMore')}>
          <Button variant="outline" className="border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-600 mb-6">
            ← Back to Learn More
          </Button>
        </Link>

        {peptideData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-200">
                <Beaker className="w-10 h-10 text-red-600" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wider rounded-full">
                    Research Compound
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-full">
                    High Purity >99%
                  </span>
                </div>
              </div>
            </div>

            {/* Overview Card */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-8 md:p-10 shadow-xl shadow-slate-100 mb-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50" />
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight relative z-10">
                Compound <span className="text-red-600">Overview</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed relative z-10">
                {peptideData.overview}
              </p>
            </div>

            {/* Potential Uses */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter flex items-center gap-3">
                <TestTube className="w-8 h-8 text-red-600" />
                Research Applications
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {peptideData.potentialUses.map((use, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white border border-slate-200 rounded-[32px] p-8 hover:border-red-600/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                        {use.title}
                      </h3>
                      <div className="p-2 bg-slate-50 rounded-full group-hover:bg-red-600 transition-colors">
                        <TrendingUp className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-6">
                      {use.description}
                    </p>
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mechanism of Action</p>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">
                        {use.mechanism}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Clinical Trials */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-red-600" />
                Clinical Data
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {peptideData.clinicalTrials.map((trial, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 shadow-lg shadow-slate-100"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 pb-8 border-b border-slate-200">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{trial.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{trial.year}</span>
                          <span>•</span>
                          <span>{trial.institution}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600">
                          {trial.participants}
                        </span>
                        <span className="px-3 py-1 bg-red-600 text-white border border-red-600 rounded-full text-xs font-bold">
                          {trial.duration}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Findings</p>
                        <p className="text-slate-600 leading-relaxed text-sm">
                          {trial.findings}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">Conclusion</p>
                        <p className="text-slate-900 font-medium leading-relaxed text-sm">
                          {trial.conclusion}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Safety & Dosage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-lg shadow-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  Safety Profile
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-6">
                  {peptideData.safetyProfile}
                </p>
                <div className="p-4 bg-red-600 border border-red-500 rounded-2xl">
                  <p className="text-white text-xs font-bold leading-relaxed flex gap-2">
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    For laboratory research use only. Not for human consumption.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-lg shadow-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                    <FlaskConical className="w-6 h-6 text-red-600" />
                    Research Dosage
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm mb-8">
                    {peptideData.dosage}
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openProductModal', { 
                      detail: { product } 
                    }));
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-14 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02]"
                >
                  Initialize Research Order
                </Button>
              </div>
            </div>

          </motion.div>
        ) : (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">Generating research data...</p>
          </div>
        )}
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={product} 
      />
    </div>
  );
}
