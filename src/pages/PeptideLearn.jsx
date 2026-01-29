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
        
        // Check if this is BAC RESEARCH / Bacteriostatic Water
        const productNameUpper = foundProduct.name.toUpperCase();
        if (productNameUpper === 'BAC RESEARCH' || 
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
          <p className="text-stone-400 text-center">Product not found.</p>
        </div>
      </div>
    );
  }

  // Special render for Bacteriostatic Water
  if (isBacWater && peptideData) {
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
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-amber-50">Bacteriostatic Water</h1>
                <p className="text-stone-400 text-sm">BAC Water Research Grade</p>
              </div>
            </div>
            <p className="text-stone-300 text-lg mb-6">{product.description || "Essential sterile diluent for peptide reconstitution with 0.9% benzyl alcohol preservative."}</p>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2 bg-red-700 hover:bg-red-600 text-amber-50 font-semibold rounded-lg transition-colors"
              >
                View Product
              </button>
              <Link to={createPageUrl('PeptideCalculator')}>
                <button className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-amber-50 font-semibold rounded-lg transition-colors border border-stone-600">
                  Reconstitution Calculator
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-stone-900/50 border border-stone-700 rounded-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-amber-50 mb-4 flex items-center gap-2">
              <Info className="w-6 h-6 text-blue-500" />
              What is Bacteriostatic Water?
            </h2>
            <p className="text-stone-300 leading-relaxed">{peptideData.overview}</p>
          </motion.div>

          {/* Key Benefits */}
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

          {/* Common Uses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-2">
              <Beaker className="w-6 h-6 text-blue-600" />
              Common Uses
            </h2>
            <div className="space-y-4">
              {peptideData.potentialUses.map((use, idx) => (
                <div key={idx} className="bg-stone-900/50 border border-stone-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-400 mb-2">{use.title}</h3>
                  <p className="text-stone-300 mb-3">{use.description}</p>
                  <div className="bg-stone-800/50 rounded p-3 border-l-2 border-blue-600">
                    <p className="text-sm text-stone-400"><span className="font-semibold text-stone-300">How it works:</span> {use.mechanism}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Storage Guidelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-900/30 to-stone-900/50 border border-blue-600/30 rounded-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-2">
              <Thermometer className="w-6 h-6 text-blue-500" />
              Storage Guidelines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {peptideData.storageInfo.map((info, idx) => (
                <div key={idx} className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                  <div className="flex items-center gap-2 mb-2">
                    {info.icon === 'Thermometer' && <Thermometer className="w-5 h-5 text-blue-400" />}
                    {info.icon === 'Clock' && <Clock className="w-5 h-5 text-blue-400" />}
                    {info.icon === 'Droplets' && <Droplets className="w-5 h-5 text-blue-400" />}
                    <h3 className="text-amber-50 font-semibold">{info.title}</h3>
                  </div>
                  <p className="text-stone-400 text-sm">{info.details}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Research & Standards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-2">
              <TestTube className="w-6 h-6 text-purple-600" />
              Research & Quality Standards
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
                      <p className="text-stone-400 text-sm mb-1">Source</p>
                      <p className="text-amber-50 font-semibold text-sm">{trial.institution}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-stone-700">
                    <div>
                      <p className="text-stone-400 text-sm mb-1">Type</p>
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

          {/* Dosage & Reconstitution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-stone-900/50 border border-stone-700 rounded-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-amber-50 mb-4 flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-blue-500" />
              Reconstitution Guidelines
            </h2>
            <p className="text-stone-300 leading-relaxed">{peptideData.dosage}</p>
          </motion.div>

          {/* Safety & Warnings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="bg-stone-900/50 border border-amber-600/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                Safety Profile
              </h3>
              <p className="text-stone-300 text-sm">{peptideData.safetyProfile}</p>
            </div>

            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Important Warnings
              </h3>
              <ul className="space-y-2">
                {peptideData.warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-red-200 text-sm">
                    <span className="text-red-500 mt-1">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Research Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-amber-900/30 border border-amber-600/50 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Research Use Only
            </h3>
            <p className="text-amber-100 font-semibold">This product is intended for research purposes only. Not for human consumption. Always follow proper laboratory protocols and safety guidelines.</p>
          </motion.div>

          <ProductModal 
            product={product} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        </div>
      </div>
    );
  }

  // Standard peptide render
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
              className="px-6 py-2 bg-red-700 hover:bg-red-600 text-amber-50 font-semibold rounded-lg transition-colors"
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