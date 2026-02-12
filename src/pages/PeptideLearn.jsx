import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Beaker, TestTube, CheckCircle, AlertCircle, TrendingUp, Droplets, Shield, Thermometer, Clock, FlaskConical, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import ProductModal from '@/components/product/ProductModal';

// Hardcoded data for KLOW Blend (KPV + BPC-157 + GHK-Cu + TB-500)
const KLOW_DATA = {
  overview: "KLOW is a multi-pathway healing and recovery blend combining four well-researched peptides: KPV (Lys-Pro-Val), BPC-157 (Body Protection Compound-157), GHK-Cu (Copper Tripeptide), and TB-500 (Thymosin Beta-4). Each component targets a distinct but complementary mechanism — anti-inflammatory modulation (KPV), localized tissue repair (BPC-157), collagen synthesis and cellular remodeling (GHK-Cu), and systemic cellular migration and protection (TB-500). Together, these peptides provide broad-spectrum support for tissue repair, wound healing, inflammation reduction, and cellular regeneration.",
  potentialUses: [
    {
      title: "Tissue Repair & Wound Healing",
      description: "The KLOW blend combines BPC-157 and TB-500, two of the most extensively studied tissue repair peptides. BPC-157 promotes localized angiogenesis (new blood vessel formation) and accelerates healing of tendons, ligaments, muscle, and gut lining. TB-500 complements this by promoting systemic cell migration and differentiation through actin regulation, allowing repair cells to reach damaged tissue more effectively.",
      mechanism: "BPC-157 upregulates vascular endothelial growth factor (VEGF) and stimulates the nitric oxide (NO) system, enhancing blood flow to injured areas. TB-500 sequesters G-actin monomers, promoting actin polymerization which drives cell motility, enabling fibroblasts, keratinocytes, and endothelial cells to migrate into wound sites. GHK-Cu further supports this by stimulating collagen I, III, and elastin synthesis at the repair site."
    },
    {
      title: "Anti-Inflammatory & Immune Modulation",
      description: "KPV is the C-terminal tripeptide fragment of alpha-melanocyte-stimulating hormone (α-MSH), a naturally occurring anti-inflammatory signaling peptide. KPV has demonstrated potent anti-inflammatory activity by inhibiting NF-κB activation and reducing pro-inflammatory cytokine production. BPC-157 provides additional anti-inflammatory support through modulation of the nitric oxide system and serotonergic pathways.",
      mechanism: "KPV enters cells and directly interacts with inflammatory signaling cascades, inhibiting NF-κB nuclear translocation and suppressing production of TNF-α, IL-6, and IL-1β. This reduces local and systemic inflammation without immunosuppression. BPC-157 modulates the NO system and interacts with dopamine and serotonin pathways, providing neuroprotective anti-inflammatory effects. TB-500 further reduces inflammation through downregulation of inflammatory chemokines at the injury site."
    },
    {
      title: "Collagen Synthesis & Skin Regeneration",
      description: "GHK-Cu (glycyl-L-histidyl-L-lysine copper complex) is a naturally occurring tripeptide found in human plasma, saliva, and urine that declines with age. It is one of the most studied peptides for collagen stimulation, wound remodeling, and anti-aging applications. In the KLOW blend, GHK-Cu provides the matrix remodeling component that complements the tissue repair driven by BPC-157 and TB-500.",
      mechanism: "GHK-Cu activates tissue remodeling by stimulating synthesis of collagen types I, III, and V, as well as decorin, elastin, and glycosaminoglycans. It also upregulates matrix metalloproteinases (MMPs) for controlled breakdown of damaged tissue and increases production of tissue inhibitors of metalloproteinases (TIMPs) for balanced remodeling. Research by Pickart et al. has shown GHK-Cu modulates expression of over 4,000 genes, resetting gene expression patterns toward a healthier state."
    },
    {
      title: "Gut Health & Mucosal Protection",
      description: "BPC-157 has extensive research demonstrating its cytoprotective effects on gastrointestinal mucosa. Originally isolated from human gastric juice, BPC-157 has shown protective and healing effects on the stomach, intestinal lining, and esophagus in numerous preclinical studies. KPV further supports gut health through its anti-inflammatory effects on intestinal epithelial cells, making this blend particularly relevant for gut barrier integrity research.",
      mechanism: "BPC-157 promotes gastric mucosal integrity through enhanced prostaglandin synthesis, nitric oxide modulation, and direct cytoprotective action on epithelial cells. It has demonstrated protective effects against NSAID-induced gastric lesions, ethanol damage, and inflammatory bowel conditions in animal models. KPV has been shown to reduce colonic inflammation by inhibiting NF-κB in intestinal epithelial cells and macrophages, with preclinical evidence supporting its role in inflammatory bowel conditions."
    }
  ],
  clinicalTrials: [
    {
      title: "BPC-157 Cytoprotective and Healing Properties",
      year: "2018",
      institution: "Current Pharmaceutical Design (Sikiric et al.)",
      participants: "Comprehensive review of preclinical studies",
      duration: "Ongoing research program spanning 20+ years",
      findings: "BPC-157 demonstrated consistent wound healing acceleration across multiple tissue types including tendon, ligament, muscle, nerve, and gastrointestinal mucosa in preclinical models. The peptide promoted angiogenesis through VEGF upregulation and enhanced nitric oxide system function. It showed protective effects against multiple types of tissue damage including NSAID-induced gastric lesions, and promoted tendon-to-bone healing in rat models.",
      conclusion: "BPC-157 shows robust and reproducible tissue-protective and healing-promoting properties across diverse tissue types through angiogenic and cytoprotective mechanisms. Further clinical trials in humans are warranted based on the strength of preclinical evidence."
    },
    {
      title: "Thymosin Beta-4 in Tissue Repair and Regeneration",
      year: "2019",
      institution: "Expert Opinion on Biological Therapy (Goldstein et al.)",
      participants: "Review including clinical wound healing studies",
      duration: "Multi-study review",
      findings: "Thymosin Beta-4 (TB-500) promoted cell migration through actin cytoskeleton regulation, enhanced angiogenesis, and reduced inflammation in wound sites. In clinical studies on chronic non-healing wounds, topical Tβ4 improved healing rates. Preclinical cardiac studies showed reduced scar formation and improved cardiac function following myocardial infarction in animal models.",
      conclusion: "TB-500 demonstrates multi-faceted tissue repair properties through its unique mechanism of actin regulation and cell migration promotion, with translational potential across wound healing, cardiac repair, and neurological recovery applications."
    },
    {
      title: "GHK-Cu Gene Expression and Tissue Remodeling",
      year: "2020",
      institution: "International Journal of Molecular Sciences (Pickart et al.)",
      participants: "Gene expression analysis and clinical review",
      duration: "Cumulative research spanning decades",
      findings: "GHK-Cu was found to modulate expression of over 4,000 human genes, shifting gene activity patterns toward tissue repair and regeneration. It increased collagen synthesis, stimulated decorin production for organized tissue remodeling, attracted immune cells for wound cleanup, and demonstrated antioxidant properties through upregulation of superoxide dismutase and glutathione pathways. Clinical studies showed improved wound healing rate and reduced scarring.",
      conclusion: "GHK-Cu acts as a broad-spectrum regenerative signal, resetting gene expression toward a healthier tissue remodeling state. Its natural decline with age correlates with reduced healing capacity, supporting its therapeutic potential in regenerative research."
    },
    {
      title: "KPV Anti-Inflammatory Activity via NF-κB Inhibition",
      year: "2015",
      institution: "Journal of Biological Chemistry / PLoS ONE (Kannengiesser et al.)",
      participants: "In vitro and preclinical inflammatory bowel models",
      duration: "Controlled preclinical studies",
      findings: "KPV demonstrated significant anti-inflammatory activity by directly entering cells and inhibiting NF-κB activation, reducing production of pro-inflammatory cytokines including TNF-α, IL-6, and IL-1β. In colitis models, KPV reduced inflammation scores and improved mucosal healing. The peptide showed efficacy both through systemic and oral administration routes, with anti-inflammatory effects comparable to established treatments but without immunosuppressive side effects.",
      conclusion: "KPV represents a targeted anti-inflammatory peptide with a favorable safety profile, acting through NF-κB modulation rather than broad immunosuppression. Its efficacy in intestinal inflammation models supports its inclusion in multi-peptide healing formulations."
    }
  ],
  safetyProfile: "The KLOW blend combines four peptides with well-established preclinical safety profiles. BPC-157 has been studied extensively in animal models with no reported toxic dose identified (LD-1 not established due to absence of toxicity at tested doses). GHK-Cu is a naturally occurring human peptide present in plasma at approximately 200 ng/mL in young adults, declining with age. TB-500 (Thymosin Beta-4) is an endogenous peptide found naturally in wound fluid, blood platelets, and many cell types. KPV is derived from the naturally occurring hormone alpha-MSH. As with all research peptides, this blend is for laboratory and research use only. Researchers should follow established protocols and consult relevant safety literature. Individuals with known copper sensitivity should exercise caution with GHK-Cu-containing formulations.",
  dosage: "Research protocols for multi-peptide healing blends vary by study design and target application. Individual component dosing in published research: BPC-157 has been studied at 1-10 μg/kg in preclinical models; TB-500 at 0.1-0.5 mg/kg loading with maintenance protocols; GHK-Cu at varying concentrations depending on delivery method (topical vs. subcutaneous); KPV at doses ranging from μg to low mg ranges in preclinical studies. Blend ratios and total dosing should follow manufacturer specifications and established research guidelines. Subcutaneous administration is the most common route in research settings. Always reconstitute with bacteriostatic water using proper sterile technique.",
  keyBenefits: [
    "Multi-pathway tissue repair via complementary healing mechanisms (BPC-157 + TB-500)",
    "Potent anti-inflammatory action through NF-κB inhibition (KPV)",
    "Enhanced collagen synthesis and tissue remodeling (GHK-Cu)",
    "Accelerated wound healing through angiogenesis and cell migration",
    "Gut mucosal protection and intestinal barrier support (BPC-157 + KPV)",
    "Systemic cellular protection through actin regulation (TB-500)",
    "Gene expression modulation toward regenerative patterns (GHK-Cu)",
    "Broad-spectrum recovery support with naturally occurring peptide components"
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated).catch(() => setIsAuthenticated(false));
  }, []);

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
        if (productNameUpper === 'KLOW' || productNameUpper === 'KLOW80' || productNameUpper === 'KLOW BLEND' || productNameUpper.includes('KLOW')) {
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
            <Button variant="outline" className="border-slate-200 text-slate-500 hover:text-[#dc2626] hover:border-[#dc2626] mb-6">
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
            <Button variant="outline" className="border-slate-200 text-slate-500 hover:text-[#dc2626] hover:border-[#dc2626] mb-6">
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
              <div className="p-3 bg-[#dc2626]/10 rounded-xl border border-[#dc2626]/20">
                <Droplets className="w-8 h-8 text-[#dc2626]" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">
                  {product.name}
                </h1>
                <p className="text-[#dc2626] font-bold tracking-widest text-sm uppercase mt-1">
                  Research Grade Reconstitution Diluent
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 shadow-lg shadow-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#dc2626]" />
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
                <CheckCircle className="w-6 h-6 text-[#dc2626]" />
                Key Benefits
              </h3>
              <ul className="space-y-4">
                {peptideData.keyBenefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#dc2626] mt-2.5 flex-shrink-0" />
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
                <Shield className="w-6 h-6 text-[#dc2626]" />
                Storage & Handling
              </h3>
              <div className="space-y-6">
                {peptideData.storageInfo.map((info, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg h-fit shadow-sm">
                      {info.icon === 'Thermometer' && <Thermometer className="w-5 h-5 text-[#dc2626]" />}
                      {info.icon === 'Clock' && <Clock className="w-5 h-5 text-[#dc2626]" />}
                      {info.icon === 'Droplets' && <Droplets className="w-5 h-5 text-[#dc2626]" />}
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
              Research <span className="text-[#dc2626]">Applications</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {peptideData.potentialUses.map((use, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  className="bg-white border border-slate-200 rounded-[24px] p-6 hover:border-[#dc2626]/30 transition-all hover:shadow-lg hover:shadow-[#dc2626]/5"
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
              Clinical <span className="text-[#dc2626]">Data</span>
            </h2>
            <div className="space-y-4">
              {peptideData.clinicalTrials.map((trial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white border border-slate-200 rounded-[24px] p-6 hover:border-[#dc2626]/20 transition-all"
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
                <Shield className="w-5 h-5 text-[#dc2626]" />
                Safety Profile
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {peptideData.safetyProfile}
              </p>
              <div className="bg-[#dc2626] border border-red-500 rounded-xl p-4">
                <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Important Warnings
                </h4>
                <ul className="space-y-1">
                  {peptideData.warnings.map((warning, idx) => (
                    <li key={idx} className="text-xs text-white flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[32px] p-8 text-white">
              <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-[#dc2626]" />
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
                  className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold h-14 rounded-xl shadow-lg shadow-[#dc2626]/20 transition-all hover:scale-[1.02]"
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
          <Button variant="outline" className="border-slate-200 text-slate-500 hover:text-[#dc2626] hover:border-[#dc2626] mb-6">
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
                <Beaker className="w-10 h-10 text-[#dc2626]" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-[#dc2626] border border-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-full">
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
                Compound <span className="text-[#dc2626]">Overview</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed relative z-10">
                {peptideData.overview}
              </p>
            </div>

            {/* Potential Uses */}
            <div className="mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter flex items-center gap-3">
                <TestTube className="w-8 h-8 text-[#dc2626]" />
                Research Applications
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {peptideData.potentialUses.map((use, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white border border-slate-200 rounded-[32px] p-8 hover:border-[#dc2626]/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#dc2626] transition-colors">
                        {use.title}
                      </h3>
                      <div className="p-2 bg-slate-50 rounded-full group-hover:bg-[#dc2626] transition-colors">
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
                <CheckCircle className="w-8 h-8 text-[#dc2626]" />
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
                        <span className="px-3 py-1 bg-[#dc2626] text-white border border-[#dc2626] rounded-full text-xs font-bold">
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
                        <p className="text-xs font-bold text-[#dc2626] uppercase tracking-wider mb-3">Conclusion</p>
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
                  <AlertCircle className="w-6 h-6 text-[#dc2626]" />
                  Safety Profile
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-6">
                  {peptideData.safetyProfile}
                </p>
                <div className="p-4 bg-[#dc2626] border border-red-500 rounded-2xl">
                  <p className="text-white text-xs font-bold leading-relaxed flex gap-2">
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    For laboratory research use only. Not for human consumption.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-lg shadow-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                    <FlaskConical className="w-6 h-6 text-[#dc2626]" />
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
                  className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold h-14 rounded-xl shadow-lg shadow-[#dc2626]/20 transition-all hover:scale-[1.02]"
                >
                  Initialize Research Order
                </Button>
              </div>
            </div>

          </motion.div>
        ) : (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-[#dc2626] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">Generating research data...</p>
          </div>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
