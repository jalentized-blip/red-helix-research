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

// Hardcoded data for BPC-157
const BPC157_DATA = {
  overview: "BPC-157 (Body Protection Compound-157) is a synthetic pentadecapeptide (15 amino acids, sequence GEPPPGKPADDAGLV) derived from a naturally occurring protective protein found in human gastric juice. It has been extensively studied in preclinical models for its remarkable tissue repair, cytoprotective, and wound healing properties across multiple organ systems. BPC-157 acts primarily through upregulation of vascular endothelial growth factor (VEGF) and modulation of the nitric oxide (NO) system.",
  potentialUses: [
    {
      title: "Tendon, Ligament & Muscle Repair",
      description: "BPC-157 has demonstrated accelerated healing of tendons, ligaments, and skeletal muscle in numerous preclinical studies. It promotes tendon-to-bone healing, increases collagen organization, and restores mechanical strength to injured connective tissue more rapidly than controls.",
      mechanism: "Upregulates VEGF expression to promote angiogenesis (new blood vessel formation) at injury sites, enhances fibroblast migration and proliferation, and stimulates growth factor signaling including EGF and FGF pathways. Promotes organized collagen fiber deposition rather than disorganized scar tissue."
    },
    {
      title: "Gastrointestinal Protection & Healing",
      description: "Originally isolated from gastric juice, BPC-157 has strong cytoprotective effects on gastrointestinal mucosa. It has demonstrated protective and healing effects against NSAID-induced gastric lesions, ethanol-induced damage, inflammatory bowel conditions, and esophageal reflux injury in animal models.",
      mechanism: "Enhances prostaglandin synthesis and maintains gastric mucosal blood flow through NO system modulation. Promotes epithelial cell proliferation and migration to close mucosal defects. Interacts with the dopaminergic and serotonergic systems to provide additional gastroprotective effects."
    },
    {
      title: "Nerve Regeneration & Neuroprotection",
      description: "Research has shown BPC-157 promotes peripheral nerve regeneration and provides neuroprotective effects in CNS injury models. It has accelerated recovery from sciatic nerve transection and shown benefit in models of traumatic brain injury and spinal cord damage.",
      mechanism: "Promotes Schwann cell proliferation and axonal sprouting through VEGF and NGF pathway activation. Modulates the NO system and GABAergic transmission to provide neuroprotection against excitotoxic damage. Enhances blood flow to damaged neural tissue through angiogenic mechanisms."
    },
    {
      title: "Bone Fracture Healing",
      description: "Preclinical studies demonstrate BPC-157 accelerates bone fracture healing and improves bone-tendon junction repair. It enhances callus formation and increases bone mineral density at fracture sites.",
      mechanism: "Stimulates osteoblast differentiation and activity through growth factor modulation. Enhances periosteal blood supply via VEGF-mediated angiogenesis. Promotes organized bone matrix deposition and accelerates the transition from woven bone to lamellar bone."
    }
  ],
  clinicalTrials: [
    {
      title: "BPC-157 Cytoprotective Properties Review",
      year: "2018",
      institution: "Current Pharmaceutical Design (Sikiric et al.)",
      participants: "Comprehensive review of 20+ years of preclinical research",
      duration: "Multi-decade research program",
      findings: "BPC-157 demonstrated consistent wound healing acceleration across tendons, ligaments, muscle, nerve, bone, and GI mucosa. Promoted angiogenesis via VEGF, protected against NSAID and alcohol-induced gastric damage, and showed dose-dependent healing effects with no identified toxic dose (LD-1 not established).",
      conclusion: "BPC-157 shows robust, reproducible tissue-protective and healing properties across diverse tissue types. Its strong safety profile and multi-system efficacy support advancement to human clinical trials."
    },
    {
      title: "BPC-157 in Tendon Healing",
      year: "2019",
      institution: "Journal of Orthopaedic Surgery and Research",
      participants: "Preclinical tendon transection models",
      duration: "4-8 week healing studies",
      findings: "BPC-157 significantly accelerated Achilles tendon healing with improved collagen fiber organization and biomechanical strength. Treated tendons showed increased VEGF expression, enhanced angiogenesis at repair sites, and superior functional recovery compared to controls.",
      conclusion: "BPC-157 promotes organized tendon repair through angiogenic and growth factor mechanisms, suggesting potential for connective tissue injury applications."
    },
    {
      title: "BPC-157 Neuroprotective Effects",
      year: "2020",
      institution: "Current Neuropharmacology (Sikiric et al.)",
      participants: "Multiple preclinical neurological injury models",
      duration: "Acute and chronic treatment protocols",
      findings: "BPC-157 demonstrated neuroprotective effects in models of peripheral nerve injury, traumatic brain injury, and neurotoxicity. It promoted nerve regeneration, reduced neural inflammation, and improved functional neurological outcomes. Effects were mediated through NO system modulation and growth factor signaling.",
      conclusion: "BPC-157 shows significant neuroprotective and neuroregenerative potential through multiple complementary mechanisms, warranting investigation in clinical neurological injury settings."
    }
  ],
  safetyProfile: "BPC-157 has been extensively studied in preclinical models with no identified lethal dose and no significant adverse effects at therapeutic doses. It is a naturally derived peptide from human gastric juice proteins, suggesting inherent biocompatibility. No mutagenic, carcinogenic, or teratogenic effects have been reported in published research. As with all research peptides, BPC-157 is for research and laboratory use only. Researchers should follow established dosing protocols and proper handling procedures.",
  dosage: "Preclinical research has used doses ranging from 1-10 μg/kg body weight administered via subcutaneous injection. Common research protocols use 250-500 μg per administration, 1-2 times daily. Reconstitute with bacteriostatic water using sterile technique. Subcutaneous injection near the site of interest is the most common route in research settings, though systemic administration has also shown efficacy.",
  keyBenefits: [
    "Accelerated tendon, ligament, and muscle repair through VEGF-mediated angiogenesis",
    "Gastric mucosal protection and GI healing from gastric juice-derived origin",
    "Peripheral nerve regeneration and central neuroprotection",
    "Bone fracture healing acceleration and improved bone density",
    "Anti-inflammatory effects through NO system modulation",
    "Exceptionally strong preclinical safety profile with no identified toxic dose",
    "Multi-system tissue repair through complementary growth factor pathways",
    "Cytoprotection against NSAID, alcohol, and stress-induced tissue damage"
  ]
};

// Hardcoded data for TB-500
const TB500_DATA = {
  overview: "TB-500 is a synthetic version of Thymosin Beta-4 (Tβ4), a naturally occurring 43-amino acid peptide that is the primary G-actin sequestering molecule in eukaryotic cells. Found abundantly in wound fluid, blood platelets, and virtually all nucleated cells, Tβ4 plays a fundamental role in cell migration, angiogenesis, and tissue repair. TB-500 promotes healing by regulating actin cytoskeletal dynamics, enabling cells to migrate to injury sites and facilitating new blood vessel formation.",
  potentialUses: [
    {
      title: "Systemic Tissue Repair & Recovery",
      description: "TB-500 promotes whole-body healing by enabling cell migration through tissues. Unlike localized repair peptides, TB-500 acts systemically — it upregulates actin to allow cells to travel through the extracellular matrix to reach damaged tissue anywhere in the body.",
      mechanism: "Sequesters G-actin monomers, promoting controlled actin polymerization which drives cell motility. This allows fibroblasts, keratinocytes, endothelial cells, and stem cells to migrate into wound sites. Simultaneously promotes angiogenesis through VEGF-independent mechanisms and reduces inflammation via chemokine downregulation."
    },
    {
      title: "Cardiac Tissue Protection",
      description: "TB-500 has shown remarkable cardioprotective properties in preclinical research. It reduces scar tissue formation after myocardial infarction, promotes cardiac cell survival, and enhances cardiac function recovery. These effects make it one of the most studied peptides for cardiac repair.",
      mechanism: "Activates Akt (protein kinase B) survival signaling in cardiomyocytes, reducing apoptosis after ischemic injury. Promotes cardiac progenitor cell activation and migration to infarct zones. Reduces fibrotic scar formation by modulating TGF-β signaling and promoting organized tissue remodeling rather than fibrosis."
    },
    {
      title: "Anti-Inflammatory & Immune Modulation",
      description: "TB-500 demonstrates potent anti-inflammatory effects through multiple pathways. It reduces inflammatory cell infiltration, downregulates pro-inflammatory cytokines, and promotes resolution of inflammation rather than chronic inflammatory states.",
      mechanism: "Downregulates inflammatory chemokines (MCP-1, MIP-1α) reducing monocyte and neutrophil infiltration. Modulates NF-κB signaling and promotes anti-inflammatory macrophage polarization (M1 to M2 shift). Reduces oxidative stress through superoxide dismutase upregulation."
    },
    {
      title: "Athletic Recovery & Endurance",
      description: "TB-500 is widely studied for post-exercise recovery and athletic performance support. Its systemic mechanism allows it to support recovery across multiple tissue types simultaneously — muscle, tendon, ligament, and joint tissue.",
      mechanism: "Promotes satellite cell activation and myoblast proliferation for muscle repair. Enhances blood vessel formation to improve tissue perfusion and oxygen delivery. Accelerates clearance of metabolic waste products through improved lymphatic and circulatory function."
    }
  ],
  clinicalTrials: [
    {
      title: "Thymosin Beta-4 in Tissue Repair and Regeneration",
      year: "2019",
      institution: "Expert Opinion on Biological Therapy (Goldstein et al.)",
      participants: "Comprehensive review including clinical wound healing studies",
      duration: "Multi-study analysis",
      findings: "Tβ4 promoted cell migration through actin regulation, enhanced angiogenesis, and reduced inflammation. Clinical wound healing studies showed improved healing rates with topical Tβ4 in chronic non-healing wounds. Cardiac studies demonstrated reduced scar formation and improved function post-MI.",
      conclusion: "TB-500/Tβ4 demonstrates multi-faceted tissue repair through its unique actin regulation mechanism, with translational potential across wound healing, cardiac repair, and neurological recovery."
    },
    {
      title: "Thymosin Beta-4 Cardioprotective Effects",
      year: "2018",
      institution: "Annals of the New York Academy of Sciences",
      participants: "Preclinical myocardial infarction models",
      duration: "Acute and chronic treatment protocols",
      findings: "Tβ4 treatment significantly reduced infarct size, improved left ventricular ejection fraction, and promoted neovascularization in ischemic cardiac tissue. Activated cardiac progenitor cells and reduced fibrotic scar formation through Akt/PI3K signaling pathway activation.",
      conclusion: "Thymosin Beta-4 shows significant cardioprotective and cardiac regenerative potential, supporting its investigation as a therapeutic agent for ischemic heart disease."
    },
    {
      title: "Topical Thymosin Beta-4 for Chronic Wound Healing",
      year: "2017",
      institution: "RegeneRx Biopharmaceuticals Phase II Trial",
      participants: "Patients with chronic venous stasis ulcers",
      duration: "84-day treatment period",
      findings: "Topical Tβ4 (RGN-137) showed improved wound closure rates compared to placebo in patients with chronic non-healing venous stasis ulcers. The treatment was well-tolerated with no significant adverse events attributed to the study drug.",
      conclusion: "Topical Tβ4 demonstrates clinical wound healing efficacy with a favorable safety profile in chronic wound populations."
    }
  ],
  safetyProfile: "TB-500/Thymosin Beta-4 is an endogenous peptide found naturally in wound fluid, blood platelets, and virtually all nucleated human cells. Clinical wound healing studies have shown favorable safety profiles with no significant drug-related adverse events. It is well-tolerated at therapeutic research doses. As with all research peptides, TB-500 is for research and laboratory use only. Note: TB-500 is on the WADA (World Anti-Doping Agency) prohibited substances list for athletic competition.",
  dosage: "Research protocols typically use a loading phase of 2-5 mg administered twice weekly via subcutaneous injection for 4-6 weeks, followed by maintenance dosing of 2-5 mg once weekly or biweekly. Reconstitute with bacteriostatic water using sterile technique. Subcutaneous injection is the most common research administration route.",
  keyBenefits: [
    "Systemic tissue repair through unique actin-based cell migration mechanism",
    "Cardioprotective effects with reduced scar formation after cardiac injury",
    "Potent anti-inflammatory action through chemokine downregulation",
    "Enhanced angiogenesis for improved blood supply to healing tissue",
    "Athletic recovery support across muscle, tendon, and joint tissues",
    "Endogenous peptide with established clinical safety profile",
    "Promotes organized tissue remodeling over fibrotic scarring",
    "Complements localized repair peptides (BPC-157) through systemic mechanism"
  ]
};

// Hardcoded data for Semaglutide
const SEMAGLUTIDE_DATA = {
  overview: "Semaglutide is a synthetic glucagon-like peptide-1 (GLP-1) receptor agonist with 94% structural homology to native human GLP-1. Modified with a C-18 fatty acid chain and amino acid substitutions (Aib at position 8, Arg at position 34) to resist DPP-4 degradation, giving it an extended half-life of approximately 7 days suitable for once-weekly dosing. FDA-approved as Ozempic (injection) and Wegovy (weight management) and Rybelsus (oral).",
  potentialUses: [
    {
      title: "Weight Management & Obesity",
      description: "Semaglutide has demonstrated significant weight loss in multiple large-scale clinical trials (STEP program). At the 2.4mg weekly dose, participants achieved average weight loss of 14.9% body weight over 68 weeks — one of the most effective pharmacological weight loss interventions studied.",
      mechanism: "Activates GLP-1 receptors in the hypothalamus to reduce appetite and increase satiety signaling. Slows gastric emptying to prolong post-meal fullness. Reduces food reward signaling in mesolimbic brain regions, decreasing cravings and hedonic eating behavior."
    },
    {
      title: "Type 2 Diabetes Glycemic Control",
      description: "Semaglutide provides superior glycemic control compared to other GLP-1 agonists and many oral diabetes medications. The SUSTAIN clinical trial program demonstrated HbA1c reductions of 1.5-1.8% with once-weekly dosing.",
      mechanism: "Stimulates glucose-dependent insulin secretion from pancreatic beta cells — insulin release only occurs when blood glucose is elevated, reducing hypoglycemia risk. Suppresses glucagon secretion from alpha cells. Improves beta cell function and insulin sensitivity over time."
    },
    {
      title: "Cardiovascular Risk Reduction",
      description: "The SELECT trial (2023) demonstrated that semaglutide 2.4mg weekly reduced major adverse cardiovascular events (MACE) by 20% in overweight/obese adults with established cardiovascular disease but without diabetes.",
      mechanism: "Reduces cardiovascular risk through multiple mechanisms: direct anti-inflammatory effects on vascular endothelium, reduction in systemic inflammation markers (CRP, IL-6), improved lipid profiles, blood pressure reduction, and weight-mediated improvements in metabolic syndrome components."
    },
    {
      title: "Non-Alcoholic Fatty Liver Disease (NAFLD)",
      description: "Emerging research demonstrates semaglutide significantly reduces liver fat content and may improve liver fibrosis in patients with NASH (non-alcoholic steatohepatitis). Phase II trial data showed NASH resolution in 59% of treated patients.",
      mechanism: "Reduces hepatic de novo lipogenesis through improved insulin signaling. Decreases visceral and hepatic fat stores. Reduces liver inflammation through direct GLP-1R-mediated anti-inflammatory effects and indirect metabolic improvements."
    }
  ],
  clinicalTrials: [
    {
      title: "STEP 1: Semaglutide 2.4mg for Weight Management",
      year: "2021",
      institution: "New England Journal of Medicine (Wilding et al.)",
      participants: "1,961 adults with BMI ≥30 (or ≥27 with comorbidity)",
      duration: "68 weeks",
      findings: "Semaglutide 2.4mg weekly produced mean weight loss of 14.9% vs 2.4% with placebo. 86.4% of participants achieved ≥5% weight loss, and 32% achieved ≥20% weight loss. Improvements in cardiometabolic risk factors including blood pressure, lipids, and inflammatory markers.",
      conclusion: "Semaglutide 2.4mg weekly produced substantial, clinically meaningful weight loss with cardiometabolic benefits, supporting its use for chronic weight management."
    },
    {
      title: "SUSTAIN 6: Cardiovascular Outcomes with Semaglutide",
      year: "2016",
      institution: "New England Journal of Medicine (Marso et al.)",
      participants: "3,297 patients with type 2 diabetes and high cardiovascular risk",
      duration: "104 weeks (2 years)",
      findings: "Semaglutide reduced MACE (major adverse cardiovascular events) by 26% compared to placebo. Significant reductions in non-fatal stroke (39% reduction) and non-fatal MI (26% reduction). HbA1c reduced by 1.4% with sustained glycemic control.",
      conclusion: "Semaglutide demonstrated cardiovascular safety and significant MACE reduction in high-risk type 2 diabetes patients, establishing its cardiovascular benefit."
    },
    {
      title: "SELECT: Semaglutide Cardiovascular Outcomes in Obesity",
      year: "2023",
      institution: "New England Journal of Medicine (Lincoff et al.)",
      participants: "17,604 overweight/obese adults with CVD but without diabetes",
      duration: "33 months mean follow-up",
      findings: "Semaglutide 2.4mg weekly reduced MACE by 20% compared to placebo in overweight/obese adults with established cardiovascular disease. Mean weight loss of 9.4%. Significant reductions in heart failure events and cardiovascular mortality.",
      conclusion: "Semaglutide provides cardiovascular risk reduction independent of diabetes status, expanding its clinical utility to cardiovascular risk management in obesity."
    }
  ],
  safetyProfile: "Semaglutide has extensive Phase III and post-marketing safety data. Most common adverse effects are gastrointestinal: nausea (44%), diarrhea (30%), vomiting (24%), constipation (24%), and abdominal pain (20%) — these typically decrease after the first 4-8 weeks and with slow dose titration. Rare but serious risks include pancreatitis (0.2%), gallbladder events, and thyroid C-cell tumors in rodents (boxed warning; not confirmed in humans). Contraindicated in patients with personal/family history of medullary thyroid carcinoma or MEN2 syndrome. For research use only.",
  dosage: "Research protocols follow FDA-approved titration schedules: Start at 0.25mg weekly for 4 weeks, increase to 0.5mg weekly for 4 weeks, then 1.0mg weekly. For weight management research: continue titration to 1.7mg then 2.4mg weekly, each step maintained for 4 weeks. Subcutaneous injection in abdomen, thigh, or upper arm. Administer on the same day each week.",
  keyBenefits: [
    "Clinically proven 14.9% average body weight reduction in landmark STEP trials",
    "Superior glycemic control with HbA1c reductions of 1.5-1.8%",
    "20% reduction in major cardiovascular events (SELECT trial)",
    "Once-weekly dosing for sustained metabolic control",
    "Glucose-dependent insulin secretion minimizing hypoglycemia risk",
    "Liver fat reduction and potential NASH resolution",
    "Comprehensive cardiometabolic risk factor improvement",
    "Extensive human clinical trial data with well-characterized safety profile"
  ]
};

// Hardcoded data for Tirzepatide
const TIRZEPATIDE_DATA = {
  overview: "Tirzepatide is a first-in-class dual glucose-dependent insulinotropic polypeptide (GIP) and glucagon-like peptide-1 (GLP-1) receptor agonist. This 39-amino acid synthetic peptide activates both incretin receptor pathways simultaneously, producing enhanced metabolic effects beyond what either pathway achieves alone. FDA-approved as Mounjaro (type 2 diabetes) and Zepbound (weight management), tirzepatide has demonstrated the most significant weight loss of any pharmacological agent studied to date.",
  potentialUses: [
    {
      title: "Weight Management & Severe Obesity",
      description: "The SURMOUNT clinical program demonstrated unprecedented weight loss results. At the 15mg weekly dose, participants achieved 22.5% average weight loss over 72 weeks — approaching the efficacy of bariatric surgery. Over 63% of participants achieved ≥20% weight loss.",
      mechanism: "Dual GIP/GLP-1 receptor activation provides synergistic appetite suppression beyond GLP-1 alone. GIP receptor activation enhances fat oxidation, improves insulin sensitivity in adipose tissue, and potentiates the satiety effects of GLP-1. Slows gastric emptying and reduces food reward signaling through hypothalamic and mesolimbic pathways."
    },
    {
      title: "Type 2 Diabetes Glycemic Control",
      description: "Tirzepatide demonstrated superior glycemic control compared to all tested comparators in the SURPASS program, including semaglutide 1mg. HbA1c reductions of up to 2.4% were observed, with over 90% of patients achieving HbA1c <7% at the highest dose.",
      mechanism: "Dual incretin activation: GLP-1R stimulates glucose-dependent insulin secretion, while GIP receptor activation enhances beta cell function, improves insulin sensitivity, and promotes glucagon regulation. The dual pathway provides additive glucose-lowering beyond either mechanism alone."
    },
    {
      title: "Metabolic Syndrome & Cardiovascular Risk",
      description: "Tirzepatide improves multiple metabolic syndrome components simultaneously: visceral fat reduction, blood pressure lowering, lipid profile improvement (triglycerides reduced 25-35%), and inflammatory marker reduction. The SURPASS-CVOT trial is evaluating cardiovascular outcomes.",
      mechanism: "GIP receptor activation in adipose tissue promotes lipid storage efficiency and insulin sensitivity. Combined GIP/GLP-1 effects reduce hepatic lipogenesis, improve peripheral insulin sensitivity, and reduce systemic inflammation through direct receptor-mediated anti-inflammatory effects."
    },
    {
      title: "Obstructive Sleep Apnea",
      description: "The SURMOUNT-OSA trial (2024) demonstrated tirzepatide significantly reduced AHI (apnea-hypopnea index) by approximately 50% in obese patients with moderate-to-severe obstructive sleep apnea, with many patients achieving resolution of their sleep apnea diagnosis.",
      mechanism: "Weight loss-mediated reduction in pharyngeal fat deposits and upper airway collapsibility. Reduction in visceral obesity decreases abdominal pressure on the diaphragm, improving respiratory mechanics during sleep."
    }
  ],
  clinicalTrials: [
    {
      title: "SURMOUNT-1: Tirzepatide for Weight Management",
      year: "2022",
      institution: "New England Journal of Medicine (Jastreboff et al.)",
      participants: "2,539 adults with BMI ≥30 (or ≥27 with comorbidity), without diabetes",
      duration: "72 weeks",
      findings: "At 15mg weekly: mean weight loss of 22.5% (vs 2.4% placebo). 96% achieved ≥5% weight loss, 63% achieved ≥20% weight loss. Significant improvements in waist circumference, blood pressure, lipids, and fasting insulin. 95.3% of participants with prediabetes reverted to normoglycemia.",
      conclusion: "Tirzepatide produced the largest weight reduction of any pharmacological agent studied, with comprehensive metabolic benefits approaching bariatric surgery outcomes."
    },
    {
      title: "SURPASS-2: Tirzepatide vs Semaglutide Head-to-Head",
      year: "2021",
      institution: "New England Journal of Medicine (Frias et al.)",
      participants: "1,879 adults with type 2 diabetes on metformin",
      duration: "40 weeks",
      findings: "All tirzepatide doses (5mg, 10mg, 15mg) were superior to semaglutide 1mg for HbA1c reduction and weight loss. Tirzepatide 15mg achieved HbA1c reduction of -2.30% vs -1.86% for semaglutide. Weight loss: -12.4kg (tirzepatide 15mg) vs -6.2kg (semaglutide 1mg).",
      conclusion: "Tirzepatide demonstrated superior glycemic control and weight loss compared to semaglutide 1mg, the leading GLP-1 agonist, in a well-powered head-to-head trial."
    },
    {
      title: "SURMOUNT-OSA: Tirzepatide for Obstructive Sleep Apnea",
      year: "2024",
      institution: "New England Journal of Medicine (Malhotra et al.)",
      participants: "469 adults with moderate-to-severe OSA and obesity",
      duration: "52 weeks",
      findings: "Tirzepatide reduced AHI by approximately 50% compared to placebo. Many participants achieved resolution of moderate-to-severe OSA diagnosis. Significant improvements in oxygen saturation, sleep quality, and daytime sleepiness scores alongside substantial weight loss.",
      conclusion: "Tirzepatide offers a pharmacological approach to OSA management through weight-mediated reduction in upper airway obstruction."
    }
  ],
  safetyProfile: "Tirzepatide has extensive Phase III safety data from the SURPASS and SURMOUNT programs. Gastrointestinal adverse effects are most common: nausea (12-33%), diarrhea (12-21%), vomiting (5-13%), constipation (6-11%) — generally mild to moderate and decreasing with continued use and slow titration. Rare risks include pancreatitis, gallbladder events, and thyroid C-cell tumors in rodents (boxed warning; not confirmed in humans). Do NOT combine with semaglutide or other GLP-1 agonists. For research use only.",
  dosage: "Research protocols follow FDA titration: Start 2.5mg weekly for 4 weeks, increase to 5mg weekly for 4 weeks, then may increase to 7.5mg, 10mg, 12.5mg, and 15mg in 4-week intervals based on response and tolerance. Subcutaneous injection in abdomen, thigh, or upper arm. Same day each week.",
  keyBenefits: [
    "Most effective pharmacological weight loss agent studied: 22.5% average weight reduction",
    "First-in-class dual GIP/GLP-1 mechanism for synergistic metabolic effects",
    "Superior to semaglutide in head-to-head clinical trials (SURPASS-2)",
    "Over 95% prediabetes reversion rate to normoglycemia",
    "Significant obstructive sleep apnea improvement (SURMOUNT-OSA)",
    "Once-weekly dosing for sustained metabolic management",
    "Comprehensive metabolic syndrome improvement (BP, lipids, inflammation)",
    "Approaching bariatric surgery-level weight loss without surgical intervention"
  ]
};

// Hardcoded data for Retatrutide
const RETATRUTIDE_DATA = {
  overview: "Retatrutide (LY3437943) is an investigational first-in-class triple incretin receptor agonist (GLP-1/GIP/glucagon) being developed by Eli Lilly. It activates three metabolic hormone receptors simultaneously — glucagon-like peptide-1 (GLP-1), glucose-dependent insulinotropic polypeptide (GIP), and glucagon receptors — producing the most significant weight loss observed in any pharmacological agent in clinical trials to date. Phase II trial data demonstrated up to 24.2% body weight reduction at 48 weeks.",
  potentialUses: [
    {
      title: "Severe Obesity & Weight Loss",
      description: "Phase II data showed retatrutide produced weight loss of up to 24.2% of body weight at 48 weeks at the 12mg dose, surpassing all previously studied anti-obesity medications including tirzepatide. Over 90% of participants achieved ≥10% weight loss, and approximately 75% achieved ≥15% weight loss.",
      mechanism: "Triple receptor agonism: GLP-1R reduces appetite, GIP-R enhances fat oxidation and insulin sensitivity, and glucagon receptor activation increases energy expenditure and thermogenesis through hepatic pathways. The glucagon component provides additional energy expenditure that dual agonists lack."
    },
    {
      title: "Metabolic Syndrome & Glycemic Control",
      description: "Retatrutide demonstrated significant improvements in all metabolic syndrome components in Phase II trials. HbA1c reductions exceeding those of current dual agonists, with dramatic improvements in insulin sensitivity, triglycerides, and blood pressure.",
      mechanism: "Triple pathway provides complementary metabolic effects: GLP-1R for glucose-dependent insulin secretion, GIP-R for beta cell function and adipose insulin sensitivity, and glucagon receptor for hepatic glucose regulation and increased fat oxidation. Together they provide superior glycemic and metabolic control."
    },
    {
      title: "Non-Alcoholic Fatty Liver Disease (NAFLD/NASH)",
      description: "Retatrutide showed dramatic liver fat reduction in Phase II data. Hepatic fat content was reduced by up to 86% at 48 weeks, with the majority of participants achieving complete normalization of liver fat (<5%). This exceeds liver fat reduction seen with any other pharmacological agent.",
      mechanism: "Glucagon receptor activation directly stimulates hepatic fat oxidation and reduces de novo lipogenesis. Combined with GLP-1/GIP-mediated improvements in insulin sensitivity and visceral fat reduction, the triple mechanism provides powerful liver-targeted metabolic effects."
    }
  ],
  clinicalTrials: [
    {
      title: "Phase II Triple Hormone Receptor Agonist for Obesity",
      year: "2023",
      institution: "New England Journal of Medicine (Jastreboff et al.)",
      participants: "338 adults with BMI ≥30 (or ≥27 with comorbidity), without diabetes",
      duration: "48 weeks",
      findings: "At 12mg monthly dose: 24.2% mean body weight loss. 83% achieved ≥15% weight loss, 63% achieved ≥20% weight loss. Dramatic improvements in cardiometabolic markers. Hepatic fat reduction of up to 86%. GI adverse events consistent with GLP-1 class but manageable with titration.",
      conclusion: "Retatrutide produced the largest weight reductions reported with any anti-obesity medication, with significant metabolic and hepatic benefits supporting Phase III development."
    },
    {
      title: "Retatrutide in Type 2 Diabetes (Phase II)",
      year: "2023",
      institution: "The Lancet (Rosenstock et al.)",
      participants: "281 adults with type 2 diabetes",
      duration: "36 weeks",
      findings: "HbA1c reductions of up to 2.02% at the 12mg dose, with mean body weight reduction of 16.9%. 71% of participants achieved HbA1c <5.7% (normoglycemia). Superior glycemic control compared to historical data for dual agonists.",
      conclusion: "Retatrutide demonstrated superior glycemic and weight-loss efficacy in type 2 diabetes, supporting its development as a comprehensive metabolic treatment."
    }
  ],
  safetyProfile: "Retatrutide is an investigational compound currently in Phase III clinical trials. Phase II safety data showed adverse effects consistent with the incretin class: nausea (16-43%), diarrhea (16-27%), vomiting (8-22%), and constipation (6-16%), generally decreasing with continued treatment and slow titration. No unexpected safety signals were identified. Long-term safety data from Phase III trials are pending. As an investigational compound, retatrutide is strictly for research purposes only.",
  dosage: "Phase II research protocols used dose titration starting at 0.5mg weekly, escalating over 8-20 weeks to maintenance doses of 4mg, 8mg, or 12mg weekly. Subcutaneous injection administered once weekly. Final dosing recommendations pending Phase III trial completion.",
  keyBenefits: [
    "Most significant weight loss of any pharmacological agent: up to 24.2% at 48 weeks",
    "First-in-class triple incretin agonist (GLP-1/GIP/glucagon)",
    "Up to 86% liver fat reduction — superior to any other studied agent for NAFLD",
    "71% of diabetic participants achieved normoglycemia (HbA1c <5.7%)",
    "Glucagon receptor component adds thermogenic energy expenditure",
    "Once-weekly dosing convenience",
    "Comprehensive metabolic syndrome improvement across all markers",
    "Potential for obesity + NAFLD + diabetes treatment in a single agent"
  ]
};

// Hardcoded data for Semax
const SEMAX_DATA = {
  overview: "Semax is a synthetic heptapeptide (Met-Glu-His-Phe-Pro-Gly-Pro) analog of adrenocorticotropic hormone (ACTH) fragment 4-10 with an added C-terminal Pro-Gly-Pro tripeptide that enhances enzymatic resistance and bioavailability. Developed at the Institute of Molecular Genetics of the Russian Academy of Sciences, Semax is approved in Russia and Ukraine for clinical use as a neuroprotective and nootropic agent. It has over 25 years of clinical safety data and works primarily through BDNF (brain-derived neurotrophic factor) and NGF (nerve growth factor) upregulation.",
  potentialUses: [
    {
      title: "Cognitive Enhancement & Nootropic Effects",
      description: "Semax has demonstrated significant cognitive enhancement in both clinical populations (stroke patients, cognitive impairment) and healthy subjects. It improves attention, working memory, information processing speed, and learning acquisition through neurotrophic factor modulation.",
      mechanism: "Upregulates BDNF expression 2-8 fold, enhancing long-term potentiation (LTP) and synaptic plasticity in hippocampal and cortical neurons. Increases NGF levels supporting cholinergic neuron function. Activates TrkB signaling cascades that promote dendritic growth and synaptic connectivity."
    },
    {
      title: "Neuroprotection & Stroke Recovery",
      description: "Semax is clinically approved in Russia for treatment of ischemic stroke. It provides neuroprotection against oxidative stress, excitotoxicity, and ischemic damage. Clinical studies show improved neurological recovery outcomes when administered early after stroke.",
      mechanism: "Reduces oxidative stress through upregulation of antioxidant enzymes (SOD, catalase). Inhibits excitotoxic NMDA receptor-mediated calcium influx. Promotes neurotrophic factor expression (BDNF, NGF) to support neuronal survival and axonal regeneration in damaged brain regions."
    },
    {
      title: "Anxiolytic Effects",
      description: "Semax demonstrates anxiolytic properties without the sedation, cognitive impairment, or dependence associated with benzodiazepines. It reduces anxiety while simultaneously enhancing cognitive function — a unique combination among anxiolytic agents.",
      mechanism: "Modulates the melanocortin system (MC3R/MC4R) to regulate stress response pathways. Influences serotonergic and dopaminergic neurotransmission. Normalizes HPA axis activity without suppressing basal cortisol, maintaining physiological stress response capability."
    },
    {
      title: "Immune Modulation",
      description: "Through its melanocortin receptor activity, Semax demonstrates immunomodulatory properties. It can regulate inflammatory responses and influence immune cell function, providing secondary immunological benefits beyond its primary neurological effects.",
      mechanism: "Activates melanocortin receptors on immune cells, modulating cytokine production and inflammatory signaling. Influences expression of genes involved in innate immunity and inflammatory regulation through ACTH-derived signaling pathways."
    }
  ],
  clinicalTrials: [
    {
      title: "Semax in Acute Ischemic Stroke",
      year: "2005",
      institution: "Zhurnal Nevrologii i Psikhiatrii (Gusev & Skvortsova)",
      participants: "Clinical stroke patient populations",
      duration: "10-14 day treatment protocols",
      findings: "Intranasal Semax (12mg/day) administered within 6 hours of ischemic stroke onset improved neurological outcomes and functional recovery. BDNF levels increased 2-8 fold. Patients showed faster restoration of motor and cognitive function compared to standard care alone.",
      conclusion: "Semax demonstrated clinically meaningful neuroprotection and recovery enhancement in acute ischemic stroke, supporting its approved indication in Russia."
    },
    {
      title: "Semax Effects on BDNF Gene Expression",
      year: "2010",
      institution: "Doklady Biological Sciences (Agapova et al.)",
      participants: "In vivo and in vitro neuronal models",
      duration: "Acute and chronic treatment studies",
      findings: "Semax significantly upregulated BDNF and its receptor TrkB gene expression in hippocampal and cortical regions. The Pro-Gly-Pro modification enhanced duration of neurotrophic effects compared to native ACTH(4-10). No cortisol elevation or HPA axis suppression was observed.",
      conclusion: "Semax provides sustained neurotrophic support through BDNF/TrkB signaling without neuroendocrine disruption, confirming its selective neuroprotective mechanism."
    }
  ],
  safetyProfile: "Semax has over 25 years of clinical use in Russia with an established safety profile. It does not affect HPA axis function or cause cortisol elevation despite its ACTH-derived structure — the Pro-Gly-Pro modification eliminates adrenocortical activity. No dependence, tolerance, or withdrawal effects reported. No significant adverse effects at clinical doses. Rare mild side effects may include nasal irritation (intranasal route) or mild headache. For research use only outside Russia/Ukraine.",
  dosage: "Clinical dosing in Russia: 200-600 μg per dose, administered intranasally 2-3 times daily. Common research protocols: 0.1% solution (1mg/mL), 1-3 drops per nostril per dose. Typical cycle duration: 10-20 days with equivalent rest periods. Intranasal route provides rapid CNS delivery bypassing the blood-brain barrier.",
  keyBenefits: [
    "Clinically proven BDNF upregulation (2-8 fold increase) for cognitive enhancement",
    "25+ years of clinical safety data in Russia with approval for stroke treatment",
    "Anxiolytic effects without sedation, cognitive impairment, or dependence risk",
    "Neuroprotection against ischemic, oxidative, and excitotoxic damage",
    "Improved attention, working memory, and information processing speed",
    "No HPA axis suppression or cortisol elevation despite ACTH-derived structure",
    "Intranasal delivery for rapid CNS access",
    "Complements Selank for combined cognitive + anxiolytic protocols"
  ]
};

// Hardcoded data for Selank
const SELANK_DATA = {
  overview: "Selank is a synthetic heptapeptide (Thr-Lys-Pro-Arg-Pro-Gly-Pro) analog of the immunomodulatory peptide tuftsin (Thr-Lys-Pro-Arg) with an added C-terminal Pro-Gly-Pro tripeptide for enhanced stability and bioavailability. Developed alongside Semax at the Institute of Molecular Genetics of the Russian Academy of Sciences, Selank is approved in Russia as an anxiolytic and nootropic agent. It provides anti-anxiety effects comparable to benzodiazepines but without sedation, dependence, or withdrawal effects.",
  potentialUses: [
    {
      title: "Anxiolytic & Stress Reduction",
      description: "Selank is clinically approved in Russia for generalized anxiety disorder. It provides anxiolytic effects comparable to benzodiazepines in clinical trials but without the sedation, cognitive impairment, psychomotor slowing, or dependence that characterize GABA-A modulators.",
      mechanism: "Modulates GABAergic neurotransmission through allosteric mechanisms distinct from benzodiazepine binding sites. Stabilizes endogenous enkephalin levels by inhibiting enkephalinase enzymes, prolonging the anxiolytic effects of the body's own opioid peptides. Does not directly bind GABA-A receptors, avoiding sedation and dependence."
    },
    {
      title: "Immune Modulation",
      description: "Derived from tuftsin, a natural immunomodulatory peptide produced by splenic enzymatic cleavage of immunoglobulin heavy chains, Selank retains significant immunomodulatory activity. It regulates cytokine production and influences innate and adaptive immune function.",
      mechanism: "Activates monocytes and enhances phagocytic activity through tuftsin-derived receptor interactions. Regulates IL-6, interferon, and other cytokine expression. Modulates T-cell helper function and natural killer cell activity. Provides balanced immunomodulation rather than immunosuppression."
    },
    {
      title: "Cognitive Enhancement",
      description: "Selank enhances memory consolidation, attention, and information processing — particularly in anxiety-affected individuals where cognitive function is compromised by stress. Its cognitive benefits are often secondary to anxiety reduction but also include direct nootropic mechanisms.",
      mechanism: "Enhances BDNF expression and serotonergic signaling, supporting memory consolidation and learning. Reduces the cognitive-impairing effects of chronic stress and anxiety through cortisol normalization. Modulates dopaminergic pathways involved in attention and working memory."
    },
    {
      title: "Sleep Improvement",
      description: "Through its anxiolytic mechanism, Selank can improve sleep quality in individuals whose sleep is disrupted by anxiety, stress, or racing thoughts. It promotes sleep onset without causing daytime drowsiness or morning hangover effects.",
      mechanism: "GABAergic modulation and enkephalin stabilization reduce the hyperarousal state that prevents sleep onset. Normalizes cortisol rhythms disrupted by chronic stress. Does not cause direct sedation — improves sleep through anxiety resolution."
    }
  ],
  clinicalTrials: [
    {
      title: "Selank in Generalized Anxiety Disorder",
      year: "2008",
      institution: "Zhurnal Nevrologii i Psikhiatrii (Zozulia et al.)",
      participants: "Patients with generalized anxiety disorder",
      duration: "14-day treatment protocol",
      findings: "Intranasal Selank produced anxiolytic effects comparable to benzodiazepines on standardized anxiety scales. No sedation, psychomotor impairment, or cognitive dulling was observed. Patients maintained normal alertness and cognitive function while experiencing significant anxiety reduction.",
      conclusion: "Selank provides clinically meaningful anxiolysis without the adverse cognitive and sedative effects of benzodiazepines, supporting its use as a non-addictive anxiolytic."
    },
    {
      title: "Selank Immunomodulatory Properties",
      year: "2009",
      institution: "Immunology Letters (Uchakina et al.)",
      participants: "In vitro immune cell studies and clinical populations",
      duration: "Multiple study protocols",
      findings: "Selank significantly modulated cytokine expression profiles, enhancing IL-6 and interferon production in immunocompromised states while reducing excessive inflammatory cytokine production in hyperinflammatory conditions. Demonstrated bidirectional immune regulation through tuftsin-derived receptor interactions.",
      conclusion: "Selank provides balanced immunomodulation through its tuftsin-derived pharmacology, capable of both enhancing and normalizing immune function depending on the baseline immune state."
    }
  ],
  safetyProfile: "Selank is approved in Russia for clinical use with an established safety profile. No sedation, tolerance, dependence, or withdrawal effects have been observed — distinguishing it from all other anxiolytic drug classes. No significant adverse effects at clinical doses. Rare mild nasal irritation possible with intranasal administration. Does not impair cognitive function, psychomotor performance, or driving ability. For research use only outside Russia.",
  dosage: "Clinical dosing in Russia: 250-500 μg per dose, administered intranasally 2-3 times daily. Standard concentration: 0.15% solution (1.5mg/mL), 1-2 drops per nostril per dose. Typical cycle duration: 14-21 days with equivalent rest periods. Intranasal route provides rapid absorption and CNS delivery.",
  keyBenefits: [
    "Anxiolytic effects comparable to benzodiazepines without sedation or dependence",
    "Clinically approved in Russia for generalized anxiety disorder",
    "Bidirectional immunomodulation from tuftsin-derived pharmacology",
    "No tolerance, withdrawal, or addiction potential observed in clinical use",
    "Cognitive enhancement through BDNF modulation and stress reduction",
    "Intranasal delivery for convenient non-invasive administration",
    "Sleep improvement through anxiety resolution without sedation",
    "Complementary to Semax for combined anxiolytic + nootropic protocols"
  ]
};

// Hardcoded data for Pinealon
const PINEALON_DATA = {
  overview: "Pinealon is a synthetic tripeptide (Glu-Asp-Arg) developed as part of Professor Vladimir Khavinson's peptide bioregulator research program at the Saint Petersburg Institute of Bioregulation and Gerontology. It is classified as a short peptide bioregulator with neuroprotective properties, studied for its effects on central nervous system cellular function, cognitive support, and neuroprotection. Pinealon is distinct from Epithalon (Ala-Glu-Asp-Gly), which is the telomerase-associated tetrapeptide from the same research program.",
  potentialUses: [
    {
      title: "Neuroprotection & CNS Support",
      description: "Pinealon has demonstrated neuroprotective properties in preclinical models, protecting neurons against oxidative stress, excitotoxicity, and age-related degeneration. It supports central nervous system cellular function and maintains neuronal viability under stress conditions.",
      mechanism: "Acts as a peptide bioregulator that interacts with DNA to modulate gene expression in neural tissue. Enhances antioxidant enzyme production and cellular stress response pathways. Supports mitochondrial function in neurons, reducing vulnerability to oxidative damage and age-related decline."
    },
    {
      title: "Cognitive Function Support",
      description: "Preclinical research suggests Pinealon supports cognitive function through neuroprotective mechanisms. It may help maintain memory, attention, and information processing capacity by protecting the neuronal networks underlying these functions from degradation.",
      mechanism: "Modulates gene expression related to synaptic plasticity and neuronal survival. Supports neurotransmitter system function through cellular bioregulation. Enhances cellular energy metabolism in neural tissue, maintaining the high metabolic demands of cognitive processing."
    },
    {
      title: "Circadian Rhythm & Sleep Regulation",
      description: "Named for its association with pineal gland function research, Pinealon has been studied for effects on circadian rhythm normalization and sleep quality through CNS bioregulatory mechanisms.",
      mechanism: "Influences neuroendocrine regulation through peptide bioregulation of pinealocytes and hypothalamic neurons. May support melatonin production regulation and circadian clock gene expression through epigenetic modulation of CNS cellular function."
    }
  ],
  clinicalTrials: [
    {
      title: "Short Peptide Bioregulators in Neuroprotection",
      year: "2011",
      institution: "Bulletin of Experimental Biology and Medicine (Khavinson et al.)",
      participants: "In vitro neuronal cell cultures and animal models",
      duration: "Multiple study protocols",
      findings: "Pinealon (Glu-Asp-Arg) demonstrated neuroprotective effects on cortical neurons exposed to oxidative stress and hydrogen peroxide-induced damage. The tripeptide penetrated cell membranes and interacted with DNA sequences to modulate gene expression related to cellular survival and antioxidant defense.",
      conclusion: "Short peptide bioregulators like Pinealon can regulate gene expression at the epigenetic level in neural tissue, supporting their potential role in neuroprotective strategies."
    },
    {
      title: "Peptide Bioregulation of Aging in the CNS",
      year: "2014",
      institution: "Advances in Gerontology (Khavinson laboratory)",
      participants: "Elderly subject populations and preclinical models",
      duration: "10-day treatment cycles, multiple rounds",
      findings: "Short peptide bioregulators including Pinealon showed ability to normalize cellular function in aged neural tissue. Treatment cycles improved markers of CNS function and cellular viability. Effects were maintained beyond the treatment period, suggesting epigenetic mechanism persistence.",
      conclusion: "Peptide bioregulators demonstrate potential for age-related CNS function preservation through gene expression modulation."
    }
  ],
  safetyProfile: "Pinealon is a short endogenous-type peptide with a simple tripeptide structure (3 amino acids). The Khavinson research program reports favorable safety profiles for short peptide bioregulators over 20+ years of research. No significant adverse effects reported at standard research doses. The peptide's small size and natural amino acid composition suggest inherent biocompatibility. For research use only.",
  dosage: "Research protocols typically use 10-day cycles of daily administration with equivalent rest periods between cycles. Common administration routes include subcutaneous injection and intranasal spray. Dosing typically ranges from 10-100 μg per day depending on study design. Multiple 10-day cycles may be repeated 2-3 times per year.",
  keyBenefits: [
    "Neuroprotective effects against oxidative stress and age-related neural damage",
    "CNS cellular function support through epigenetic bioregulation",
    "Cognitive function maintenance through neuronal preservation",
    "Short tripeptide structure with favorable biocompatibility profile",
    "20+ years of research safety data from Khavinson program",
    "Distinct from Epithalon — neuroprotective (not telomerase-activating)",
    "Short 10-day treatment cycles with sustained effects",
    "Part of the well-established Russian peptide bioregulator research program"
  ]
};

// Hardcoded data for MOTS-c
const MOTSC_DATA = {
  overview: "MOTS-c (Mitochondrial Open Reading Frame of the 12S rRNA-c) is a 16-amino acid mitochondrial-derived peptide (MDP) encoded within the mitochondrial 12S rRNA gene. Discovered in 2015 by Dr. Changhan David Lee at the University of Southern California, MOTS-c represents a novel class of retrograde signaling molecules through which mitochondria communicate with the nuclear genome to regulate metabolic homeostasis. It functions as an exercise mimetic, activating AMPK pathways and improving metabolic function. MOTS-c levels naturally decline with age.",
  potentialUses: [
    {
      title: "Metabolic Regulation & Exercise Mimetic",
      description: "MOTS-c functions as a mitochondrial signal that mimics many of the metabolic benefits of exercise. It improves glucose homeostasis, enhances insulin sensitivity, and increases fat oxidation — effects typically requiring physical activity. This makes it a unique 'exercise mimetic' peptide.",
      mechanism: "Activates AMPK (AMP-activated protein kinase) — the master metabolic energy sensor. Regulates the folate-methionine cycle affecting one-carbon metabolism and de novo purine biosynthesis. MOTS-c translocates from mitochondria to the nucleus during metabolic stress, directly modulating nuclear gene expression for adaptive metabolic responses."
    },
    {
      title: "Obesity & Fat Oxidation",
      description: "MOTS-c has demonstrated prevention of diet-induced obesity and improvement in body composition in preclinical models. It enhances fat oxidation pathways and prevents excessive adipose tissue accumulation even under high-fat dietary conditions.",
      mechanism: "AMPK activation stimulates fatty acid beta-oxidation and inhibits lipogenesis (fat synthesis). Improves mitochondrial biogenesis and function in skeletal muscle and adipose tissue, increasing overall metabolic capacity. Regulates adipokine expression and improves adipose tissue insulin sensitivity."
    },
    {
      title: "Age-Related Metabolic Decline",
      description: "MOTS-c levels decline significantly with aging, correlating with age-related metabolic dysfunction, insulin resistance, and reduced exercise capacity. Supplementation may restore youthful metabolic function by replenishing this endogenous mitochondrial signal.",
      mechanism: "Restores mitochondrial-nuclear communication that degrades with age. Reactivates AMPK-mediated metabolic pathways that become less responsive in aged tissues. Improves mitochondrial quality control and biogenesis, countering the mitochondrial dysfunction central to metabolic aging."
    }
  ],
  clinicalTrials: [
    {
      title: "Discovery of MOTS-c as a Novel Mitochondrial-Derived Peptide",
      year: "2015",
      institution: "Cell Metabolism (Lee et al., USC)",
      participants: "Preclinical metabolic models",
      duration: "Multiple study paradigms",
      findings: "MOTS-c was identified as a 16-amino acid peptide encoded in the mitochondrial 12S rRNA gene. It regulated insulin sensitivity through AMPK activation, prevented diet-induced obesity, and enhanced glucose tolerance. MOTS-c levels were found to decline with age and vary with metabolic status.",
      conclusion: "MOTS-c represents a previously unknown class of mitochondrial-derived signaling peptides that regulate systemic metabolism, opening a new field of mitochondrial retrograde signaling research."
    },
    {
      title: "First Human Clinical Trial of MOTS-c",
      year: "2023",
      institution: "USC Leonard Davis School of Gerontology (Lee lab)",
      participants: "Human subjects with metabolic endpoints",
      duration: "Controlled clinical study",
      findings: "The first human clinical trial of MOTS-c demonstrated improved glucose regulation and metabolic parameters in participants. The peptide was well-tolerated with no significant adverse events. Results confirmed the translational potential of mitochondrial-derived peptide therapy.",
      conclusion: "MOTS-c demonstrates translatable metabolic benefits in humans, validating the mitochondrial-derived peptide therapeutic approach identified in preclinical research."
    }
  ],
  safetyProfile: "MOTS-c is an endogenous peptide naturally produced by human mitochondria and present in circulating blood. Its levels naturally decline with age. The first human clinical trial showed good tolerability with no significant adverse events. As an endogenous signaling molecule, it has inherent biocompatibility. Long-term safety data from larger clinical trials are pending. For research use only.",
  dosage: "Research protocols typically use subcutaneous injection 3-5 times weekly at doses of 5-10 mg per administration. Cycle duration: 8-12 weeks with rest periods between cycles. The first human clinical trial used carefully titrated doses to establish safety and efficacy parameters.",
  keyBenefits: [
    "Exercise mimetic — activates AMPK metabolic pathways similar to physical exercise",
    "First-in-class mitochondrial-derived peptide (MDP) therapy",
    "Prevents diet-induced obesity and enhances fat oxidation",
    "Improves glucose homeostasis and insulin sensitivity",
    "Endogenous peptide with natural decline during aging",
    "First human clinical trial (USC, 2023) confirmed translational efficacy",
    "Restores mitochondrial-nuclear communication degraded by aging",
    "Novel mechanism distinct from all other metabolic peptides"
  ]
};

// Hardcoded data for Epithalon
const EPITHALON_DATA = {
  overview: "Epithalon (also spelled Epitalon or Epithalone) is a synthetic tetrapeptide (Ala-Glu-Asp-Gly) developed by Professor Vladimir Khavinson at the Saint Petersburg Institute of Bioregulation and Gerontology. It is based on the natural pineal gland peptide epithalamin. Epithalon is one of the most studied anti-aging peptides, with research spanning over 35 years demonstrating telomerase activation, melatonin production normalization, and lifespan extension in multiple experimental models. It is distinct from Pinealon (Glu-Asp-Arg), which is a neuroprotective peptide.",
  potentialUses: [
    {
      title: "Telomerase Activation & Telomere Maintenance",
      description: "Epithalon is the most studied peptide for telomerase activation. It induces expression of the hTERT gene (human telomerase reverse transcriptase), the catalytic subunit of telomerase, reactivating telomere elongation in somatic cells where telomerase is normally silenced.",
      mechanism: "Penetrates cell nuclei and interacts with DNA regulatory regions to upregulate hTERT gene expression. This reactivates telomerase enzyme production, which adds TTAGGG repeats to chromosome ends (telomeres), preventing the progressive telomere shortening associated with cellular aging and the Hayflick limit."
    },
    {
      title: "Circadian Rhythm & Melatonin Regulation",
      description: "Epithalon normalizes melatonin production from the pineal gland, which declines significantly with age due to pineal calcification and reduced pinealocyte function. Restored melatonin production improves sleep architecture, circadian rhythm synchronization, and antioxidant protection.",
      mechanism: "Bioregulates pinealocyte gene expression to restore melatonin synthesis capacity. Normalizes the circadian rhythm of melatonin secretion with appropriate nocturnal peak and daytime suppression. Melatonin itself provides potent antioxidant protection, particularly in mitochondria, and regulates immune function."
    },
    {
      title: "Anti-Aging & Longevity",
      description: "Khavinson's longitudinal studies demonstrated lifespan extension of up to 25% in experimental models treated with epithalamin/Epithalon. Human observational studies over 15 years showed reduced mortality and improved health markers in elderly populations receiving peptide bioregulator courses.",
      mechanism: "Multi-mechanism anti-aging: telomerase activation prevents replicative senescence, melatonin restoration provides antioxidant protection and circadian optimization, and immune function improvement through thymic peptide regulation. Combined effects address multiple hallmarks of aging simultaneously."
    }
  ],
  clinicalTrials: [
    {
      title: "Epithalon Telomerase Activation in Human Cells",
      year: "2003",
      institution: "Bulletin of Experimental Biology and Medicine (Khavinson et al.)",
      participants: "Human somatic cell cultures (fibroblasts, pulmonary cells)",
      duration: "Cell culture treatment protocols",
      findings: "Epithalon activated telomerase in human somatic cell cultures that had reached late passages with critically short telomeres. Treated cells showed elongated telomeres and continued proliferation beyond the normal Hayflick limit. hTERT gene expression was significantly upregulated.",
      conclusion: "Epithalon demonstrated ability to reactivate telomerase and elongate telomeres in human somatic cells, providing the mechanistic basis for its anti-aging effects."
    },
    {
      title: "15-Year Longitudinal Study of Peptide Bioregulators in Elderly",
      year: "2014",
      institution: "Bulletin of Experimental Biology and Medicine (Khavinson et al.)",
      participants: "Elderly human subjects (60-80 years, cohorts of 40-80 per group)",
      duration: "15-year follow-up",
      findings: "Elderly subjects receiving annual courses of peptide bioregulators including Epithalon showed 28-42% reduced mortality compared to control groups over 15 years. Treated groups demonstrated improved cardiovascular function, normalized melatonin production, enhanced immune markers, and maintained cognitive function.",
      conclusion: "Long-term peptide bioregulator therapy including Epithalon demonstrates significant geroprotective effects with sustained mortality reduction over 15 years of observation."
    }
  ],
  safetyProfile: "Epithalon has over 35 years of research safety data from the Khavinson laboratory. No significant adverse effects have been reported at standard research doses. The simple tetrapeptide structure (4 natural amino acids) provides inherent biocompatibility. Long-term observational data (15 years) in elderly populations showed favorable safety with no drug-related serious adverse events. For research use only.",
  dosage: "Research protocols typically use 10-20 day cycles administered 2-3 times per year. Common dosing: 5-10 mg per day via subcutaneous injection during cycle days. Standard cycles: 10 days on, with cycles repeated every 4-6 months. Some protocols use 20-day cycles once or twice annually.",
  keyBenefits: [
    "Most extensively studied telomerase-activating peptide (hTERT upregulation)",
    "35+ years of research safety data from Khavinson program",
    "15-year longitudinal human study showing 28-42% mortality reduction",
    "Melatonin production normalization for sleep and circadian health",
    "Lifespan extension demonstrated in multiple experimental models",
    "Simple tetrapeptide (4 amino acids) with inherent biocompatibility",
    "Short 10-20 day treatment cycles with sustained anti-aging effects",
    "Distinct from Pinealon — targets telomerase (not neuroprotection)"
  ]
};

// Hardcoded data for BPC-157 + TB-500 combination
const BPC_TB_COMBO_DATA = {
  overview: "The BPC-157 + TB-500 combination is the most widely used peptide stack in the research and athletic recovery community. It pairs the localized tissue repair mechanism of BPC-157 (Body Protection Compound-157, 15 amino acids) with the systemic cellular migration and healing mechanism of TB-500 (Thymosin Beta-4, 43 amino acids). BPC-157 works through VEGF upregulation and NO system modulation to promote angiogenesis and localized healing, while TB-500 promotes cell migration through actin cytoskeletal regulation, enabling repair cells to reach damaged tissue throughout the body. Together, they provide complementary healing coverage — local and systemic.",
  potentialUses: [
    {
      title: "Comprehensive Musculoskeletal Recovery",
      description: "The combination provides synergistic healing across tendons, ligaments, muscles, and joints. BPC-157 targets localized repair at specific injury sites while TB-500 promotes systemic cell migration to deliver repair cells throughout the musculoskeletal system simultaneously.",
      mechanism: "BPC-157 upregulates VEGF and the NO system to promote angiogenesis and fibroblast migration at the injury site. TB-500 sequesters G-actin to promote actin polymerization, driving cell motility and enabling fibroblasts, satellite cells, and endothelial cells to migrate through the extracellular matrix to reach multiple injury sites. The combination provides both targeted local repair and broad systemic healing capacity."
    },
    {
      title: "Post-Surgical & Injury Recovery",
      description: "This combination is commonly used in research protocols for accelerating recovery from surgical procedures and acute injuries. BPC-157 focuses repair at the surgical/injury site while TB-500 enhances overall healing capacity systemically.",
      mechanism: "BPC-157 promotes organized collagen deposition and tendon-to-bone healing at surgical repair sites. TB-500 reduces systemic inflammation through chemokine downregulation and promotes M2 (anti-inflammatory) macrophage polarization. Combined effects accelerate both the inflammatory resolution phase and the proliferative repair phase of wound healing."
    },
    {
      title: "Gut Health & Systemic Inflammation",
      description: "BPC-157's gastric-origin cytoprotective effects complement TB-500's systemic anti-inflammatory action, creating a comprehensive protocol for gut barrier repair alongside whole-body inflammation reduction.",
      mechanism: "BPC-157 promotes gastric mucosal integrity through prostaglandin and NO modulation, healing intestinal barrier defects. TB-500 reduces systemic inflammatory markers (CRP, IL-6, TNF-α) through anti-inflammatory macrophage polarization. Together they address both the local gut pathology and systemic inflammatory consequences."
    }
  ],
  clinicalTrials: [
    {
      title: "BPC-157 and TB-500 Complementary Mechanisms in Tissue Repair",
      year: "2019",
      institution: "Composite analysis: Current Pharmaceutical Design (Sikiric et al.) + Expert Opinion on Biological Therapy (Goldstein et al.)",
      participants: "Review of preclinical studies for both compounds",
      duration: "Multi-decade research programs",
      findings: "BPC-157 and TB-500 act through non-overlapping, complementary mechanisms. BPC-157 promotes localized VEGF-mediated angiogenesis and tissue repair. TB-500 promotes systemic cell migration through actin regulation and provides additional anti-inflammatory effects. No receptor competition or antagonistic interactions identified between the two peptides.",
      conclusion: "The BPC-157 + TB-500 combination provides mechanistically complementary tissue repair: BPC-157 for localized targeted healing and TB-500 for systemic cellular support, with no identified contraindications to co-administration."
    },
    {
      title: "BPC-157 Multi-System Cytoprotection",
      year: "2018",
      institution: "Current Pharmaceutical Design (Sikiric et al.)",
      participants: "Comprehensive preclinical review",
      duration: "20+ year research program",
      findings: "BPC-157 demonstrated healing across tendon, ligament, muscle, nerve, bone, and GI mucosa with consistent VEGF upregulation. No toxic dose identified. When used alongside systemic agents, no antagonistic interactions were observed.",
      conclusion: "BPC-157's localized mechanism is ideal for combination with systemic repair agents to achieve comprehensive tissue healing coverage."
    }
  ],
  safetyProfile: "Both BPC-157 and TB-500 are derived from naturally occurring human peptides. BPC-157 originates from gastric juice proteins, while TB-500 (Thymosin Beta-4) is found endogenously in wound fluid, platelets, and nucleated cells. Both have favorable preclinical safety profiles with no identified toxic doses. No antagonistic interactions or receptor competition between the two peptides. TB-500 is on the WADA prohibited substances list. For research use only.",
  dosage: "Common research protocols: BPC-157 at 250-500 μg daily (subcutaneous, near injury site if applicable) + TB-500 at 2-5 mg twice weekly (subcutaneous, any site). Loading phase: TB-500 twice weekly for 4-6 weeks, then weekly maintenance. BPC-157 can be continued daily throughout. Both reconstituted with bacteriostatic water. Typical protocol duration: 8-12 weeks.",
  keyBenefits: [
    "Synergistic local + systemic tissue repair mechanism",
    "Most popular peptide combination in the research recovery community",
    "No receptor competition or antagonistic interactions identified",
    "BPC-157 targets specific injury sites via VEGF/NO pathways",
    "TB-500 enables cell migration throughout the entire body via actin regulation",
    "Comprehensive musculoskeletal recovery: tendons, ligaments, muscle, joints",
    "Anti-inflammatory effects through complementary pathways",
    "Both derived from naturally occurring human peptides"
  ]
};

// Hardcoded data for HGH (Human Growth Hormone)
const HGH_DATA = {
  overview: "Human Growth Hormone (HGH, somatotropin) is a 191-amino acid single-chain polypeptide hormone produced by somatotroph cells in the anterior pituitary gland. It is the primary hormone regulating linear growth, body composition, metabolism, and cellular regeneration throughout life. Research-grade HGH is produced using recombinant DNA technology (rhGH) identical to endogenous human somatotropin. GH levels naturally decline with age (somatopause), decreasing approximately 14% per decade after age 30.",
  potentialUses: [
    {
      title: "Body Composition & Metabolic Regulation",
      description: "HGH plays a fundamental role in regulating body composition by promoting lipolysis (fat breakdown) and protein synthesis (lean mass preservation). GH deficiency causes increased visceral adiposity, reduced lean mass, and metabolic dysfunction — effects reversed by GH replacement.",
      mechanism: "Directly activates GH receptors on adipocytes, stimulating hormone-sensitive lipase and promoting triglyceride hydrolysis (lipolysis). Simultaneously enhances amino acid uptake and protein synthesis in skeletal muscle through IGF-1 mediation. Increases metabolic rate through thyroid hormone conversion (T4 to T3) and enhanced mitochondrial function."
    },
    {
      title: "Tissue Repair & Recovery",
      description: "HGH accelerates tissue repair through both direct and IGF-1-mediated mechanisms. It promotes wound healing, bone fracture repair, and recovery from surgical procedures. GH/IGF-1 signaling is essential for normal tissue maintenance and regeneration.",
      mechanism: "Stimulates local IGF-1 production in target tissues, which promotes fibroblast proliferation, collagen synthesis, and extracellular matrix formation. Enhances chondrocyte and osteoblast activity for cartilage and bone repair. Promotes satellite cell activation and myoblast fusion for skeletal muscle regeneration."
    },
    {
      title: "Age-Related GH Decline (Somatopause)",
      description: "GH secretion declines approximately 14% per decade after age 30, contributing to age-related changes in body composition, bone density, skin thickness, cognitive function, and energy levels. Research into GH restoration addresses these age-related functional declines.",
      mechanism: "Replenishes the declining GH/IGF-1 axis to restore anabolic signaling. Promotes protein synthesis, collagen production, and cellular regeneration at levels characteristic of younger age. Improves sleep quality by restoring the relationship between slow-wave sleep and GH pulsatile secretion."
    },
    {
      title: "Bone Density & Skeletal Health",
      description: "GH is essential for bone health, stimulating both osteoblast activity (bone formation) and increasing calcium absorption. GH deficiency causes reduced bone mineral density and increased fracture risk.",
      mechanism: "Directly stimulates osteoblast differentiation and activity through GH receptor signaling. Increases renal 1,25-dihydroxyvitamin D production, enhancing intestinal calcium absorption. IGF-1 mediates sustained bone formation and maintains bone mineral density throughout the remodeling cycle."
    }
  ],
  clinicalTrials: [
    {
      title: "Effects of GH on Body Composition in Elderly Men",
      year: "1990",
      institution: "New England Journal of Medicine (Rudman et al.)",
      participants: "21 healthy men aged 61-81 with low IGF-1 levels",
      duration: "6 months",
      findings: "GH administration increased lean body mass by 8.8%, decreased adipose tissue mass by 14.4%, increased skin thickness by 7.1%, and increased lumbar vertebral bone density by 1.6%. The changes reversed several age-related body composition deteriorations.",
      conclusion: "The landmark study demonstrating that GH replacement can reverse key aspects of age-related body composition changes, establishing the scientific basis for somatopause intervention."
    },
    {
      title: "GH Replacement in Adult GH Deficiency",
      year: "2019",
      institution: "Endocrine Reviews (Molitch et al.)",
      participants: "Comprehensive review of GH replacement studies",
      duration: "Multi-decade clinical experience",
      findings: "GH replacement in adult GH deficiency consistently improves body composition, bone density, exercise capacity, quality of life, and cardiovascular risk markers. Optimal dosing uses individualized titration based on IGF-1 levels. Long-term safety data support sustained use with appropriate monitoring.",
      conclusion: "GH replacement therapy in adult GH deficiency provides well-documented benefits across multiple organ systems with an acceptable safety profile under medical supervision."
    }
  ],
  safetyProfile: "Recombinant HGH has extensive clinical safety data spanning 35+ years of FDA-approved use. Common side effects at therapeutic doses include fluid retention, joint pain (arthralgias), carpal tunnel syndrome, and mild insulin resistance. Rare risks include intracranial hypertension and potential concern regarding malignancy in predisposed individuals (debated in literature). Contraindicated in active malignancy, diabetic retinopathy, and critical illness. Requires monitoring of IGF-1 levels, glucose tolerance, and clinical response. For research use only.",
  dosage: "Research protocols typically use 1-4 IU (0.33-1.33 mg) daily via subcutaneous injection, often administered before bedtime to mimic natural pulsatile secretion. Higher doses (4-8 IU) used in some performance research protocols. Dosing individualized based on IGF-1 response levels. Reconstitute with bacteriostatic water, store refrigerated. Cycled protocols (5 days on, 2 off) are common to prevent desensitization.",
  keyBenefits: [
    "Identical to endogenous human somatotropin (191 amino acids, recombinant)",
    "35+ years of FDA-approved clinical use with extensive safety data",
    "Reverses age-related body composition changes (lean mass ↑, fat mass ↓)",
    "Enhances tissue repair through IGF-1-mediated growth factor signaling",
    "Improves bone mineral density and skeletal health",
    "Restores sleep architecture and slow-wave sleep",
    "Addresses somatopause: age-related GH decline (~14% per decade)",
    "Well-characterized dose-response relationship and monitoring parameters"
  ]
};

// Lookup map for all hardcoded peptide data
const PEPTIDE_DATA_MAP = {
  'BPC-157': BPC157_DATA, 'BPC 157': BPC157_DATA, 'BPC157': BPC157_DATA,
  'TB-500': TB500_DATA, 'TB500': TB500_DATA, 'TB 500': TB500_DATA, 'THYMOSIN BETA-4': TB500_DATA,
  'SEMAGLUTIDE': SEMAGLUTIDE_DATA,
  'TIRZEPATIDE': TIRZEPATIDE_DATA,
  'RETATRUTIDE': RETATRUTIDE_DATA,
  'SEMAX': SEMAX_DATA,
  'SELANK': SELANK_DATA,
  'PINEALON': PINEALON_DATA,
  'MOTS-C': MOTSC_DATA, 'MOTSC': MOTSC_DATA, 'MOTS C': MOTSC_DATA,
  'EPITHALON': EPITHALON_DATA, 'EPITALON': EPITHALON_DATA,
  'BPC 157 + TB500': BPC_TB_COMBO_DATA, 'BPC-157 + TB-500': BPC_TB_COMBO_DATA, 'BPC157+TB500': BPC_TB_COMBO_DATA,
  'HGH': HGH_DATA, 'HUMAN GROWTH HORMONE': HGH_DATA, 'GROWTH HORMONE': HGH_DATA, 'SOMATOTROPIN': HGH_DATA,
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
        
        // Check for hardcoded data matches
        const productNameUpper = foundProduct.name.toUpperCase().trim();

        if (productNameUpper.includes('KLOW')) {
          setIsBacWater(false);
          setPeptideData(KLOW_DATA);
        } else if (productNameUpper === 'BAC RESEARCH' ||
            productNameUpper === 'BAC' ||
            productNameUpper.includes('BACTERIOSTATIC')) {
          setIsBacWater(true);
          setPeptideData(BAC_WATER_DATA);
        } else {
          setIsBacWater(false);
          // Try exact match first, then partial matching
          let matchedData = PEPTIDE_DATA_MAP[productNameUpper];
          if (!matchedData) {
            // Try partial matching for product names that contain the key
            for (const [key, data] of Object.entries(PEPTIDE_DATA_MAP)) {
              if (productNameUpper.includes(key) || key.includes(productNameUpper)) {
                matchedData = data;
                break;
              }
            }
          }
          if (matchedData) {
            setPeptideData(matchedData);
          } else {
            await generatePeptideData(foundProduct);
          }
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
