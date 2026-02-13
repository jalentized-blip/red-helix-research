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

// Hardcoded data for GHK-Cu
const GHKCU_DATA = {
  overview: "GHK-Cu (glycyl-L-histidyl-L-lysine copper complex) is a naturally occurring tripeptide-copper complex found in human plasma, saliva, and urine. Plasma levels are approximately 200 ng/mL at age 20, declining to ~80 ng/mL by age 60. GHK-Cu was first identified by Dr. Loren Pickart in 1973 during studies of human albumin fractions that could promote liver cell growth. It has since become one of the most studied peptides for wound healing, collagen synthesis, and gene expression modulation.",
  potentialUses: [
    { title: "Collagen Synthesis & Skin Remodeling", description: "GHK-Cu stimulates production of collagen types I, III, and V, as well as elastin and glycosaminoglycans. It promotes organized tissue remodeling by balancing synthesis and degradation of extracellular matrix components.", mechanism: "Activates fibroblast proliferation and upregulates collagen gene expression. Modulates matrix metalloproteinases (MMPs) and their tissue inhibitors (TIMPs) for balanced extracellular matrix turnover. Increases decorin synthesis for organized collagen fiber assembly." },
    { title: "Wound Healing & Tissue Repair", description: "GHK-Cu accelerates wound closure by promoting angiogenesis, nerve regeneration, and immune cell recruitment. It has demonstrated efficacy in both acute wound healing and chronic wound repair in clinical studies.", mechanism: "Attracts macrophages, mast cells, and fibroblasts to wound sites via chemotactic signaling. Stimulates nerve growth factor production and sensory nerve regeneration. Promotes angiogenesis through VEGF and FGF-2 upregulation." },
    { title: "Anti-Aging & Gene Expression", description: "Research by Pickart et al. demonstrated GHK-Cu modulates expression of over 4,000 human genes, shifting patterns toward a younger, healthier state. Many of the affected genes are involved in tissue repair, antioxidant defense, and stem cell biology.", mechanism: "Resets gene expression patterns through epigenetic modulation. Upregulates genes involved in DNA repair, antioxidant response (SOD, glutathione), and stem cell markers. Downregulates genes associated with inflammation, fibrosis, and tissue destruction." },
    { title: "Anti-Inflammatory & Antioxidant", description: "GHK-Cu reduces oxidative stress and inflammation by upregulating antioxidant enzymes and suppressing pro-inflammatory cytokine production. It also acts as a copper delivery vehicle, ensuring adequate copper for enzymatic antioxidant function.", mechanism: "Increases superoxide dismutase (SOD) and glutathione peroxidase expression. Blocks TGF-β-driven inflammatory fibrosis. Delivers bioavailable copper for cuproenzyme function including lysyl oxidase (collagen crosslinking) and cytochrome c oxidase." }
  ],
  clinicalTrials: [
    { title: "GHK-Cu Gene Expression and Tissue Remodeling", year: "2020", institution: "International Journal of Molecular Sciences (Pickart et al.)", participants: "Gene expression analysis and clinical review", duration: "Cumulative research spanning decades", findings: "GHK-Cu modulated expression of over 4,000 human genes, resetting gene activity toward tissue repair. Increased collagen synthesis, stimulated decorin production, attracted immune cells for wound cleanup, and demonstrated antioxidant properties through SOD and glutathione upregulation.", conclusion: "GHK-Cu acts as a broad-spectrum regenerative signal, resetting gene expression toward a healthier state with significant anti-aging and tissue repair potential." },
    { title: "Copper Peptide Effects on Wound Healing", year: "2015", institution: "Journal of Cosmetic Dermatology", participants: "Clinical study in human subjects", duration: "12-week treatment period", findings: "Topical GHK-Cu application significantly increased skin thickness, reduced fine lines, and improved skin elasticity compared to placebo. Collagen synthesis markers were elevated in treated skin samples.", conclusion: "GHK-Cu demonstrates clinically measurable improvements in skin quality through enhanced collagen production and tissue remodeling." },
    { title: "GHK-Cu Antioxidant and Anti-Inflammatory Properties", year: "2018", institution: "Oxidative Medicine and Cellular Longevity", participants: "In vitro and in vivo models", duration: "Multi-study review", findings: "GHK-Cu significantly reduced markers of oxidative stress including lipid peroxidation and protein carbonylation. It suppressed NF-κB-mediated inflammatory gene expression and reduced TNF-α and IL-6 production in activated macrophages.", conclusion: "GHK-Cu provides dual antioxidant and anti-inflammatory protection through gene expression modulation and copper-dependent enzymatic pathways." }
  ],
  safetyProfile: "GHK-Cu is a naturally occurring peptide present in human plasma, making it inherently biocompatible. Clinical studies of topical and injectable GHK-Cu have reported no significant adverse effects. Individuals with Wilson's disease or copper metabolism disorders should avoid copper-containing peptides. As with all research peptides, GHK-Cu is for research use only.",
  dosage: "Research protocols typically use 1-2 mg per injection administered subcutaneously, 1-2 times daily for injectable studies. Topical formulations commonly use 1-3% concentration. Reconstitute lyophilized GHK-Cu with bacteriostatic water using sterile technique. Store reconstituted solution refrigerated at 2-8°C.",
  keyBenefits: [
    "Stimulates collagen I, III, and V synthesis for tissue remodeling",
    "Modulates 4,000+ genes toward healthier expression patterns",
    "Potent antioxidant effects through SOD and glutathione upregulation",
    "Accelerates wound healing via angiogenesis and immune cell recruitment",
    "Anti-inflammatory through NF-κB suppression and TGF-β modulation",
    "Naturally occurring in human plasma with strong safety profile",
    "Promotes nerve regeneration and sensory nerve repair",
    "Delivers bioavailable copper for essential enzymatic functions"
  ]
};

// Hardcoded data for KPV
const KPV_DATA = {
  overview: "KPV is a C-terminal tripeptide fragment (Lys-Pro-Val) of alpha-melanocyte-stimulating hormone (α-MSH), a naturally occurring anti-inflammatory neuropeptide. KPV retains the potent anti-inflammatory properties of the parent hormone without its melanogenic (skin-darkening) effects. It acts primarily by inhibiting NF-κB nuclear translocation, the master regulator of inflammatory gene expression, making it one of the most targeted anti-inflammatory peptides studied.",
  potentialUses: [
    { title: "Gut Inflammation & IBD Research", description: "KPV has shown significant efficacy in preclinical models of inflammatory bowel disease including colitis. It reduces intestinal inflammation, promotes mucosal healing, and has demonstrated oral bioavailability for gut-targeted delivery.", mechanism: "Enters intestinal epithelial cells and inhibits NF-κB nuclear translocation, reducing production of TNF-α, IL-6, IL-1β, and other pro-inflammatory cytokines. Promotes intestinal barrier integrity by supporting tight junction protein expression." },
    { title: "Systemic Anti-Inflammatory", description: "KPV demonstrates broad anti-inflammatory effects across multiple tissue types without causing immunosuppression. It modulates inflammation at the transcriptional level rather than broadly suppressing immune function.", mechanism: "Directly interacts with NF-κB p65 subunit, preventing its nuclear translocation and DNA binding. This selectively reduces inflammatory gene transcription while preserving normal immune surveillance and antimicrobial defense." },
    { title: "Skin Inflammation & Dermatitis", description: "As a fragment of α-MSH, KPV has been studied for inflammatory skin conditions. It reduces keratinocyte inflammatory responses and promotes resolution of cutaneous inflammation.", mechanism: "Inhibits NF-κB in keratinocytes and dermal immune cells, reducing production of inflammatory mediators. Promotes anti-inflammatory cytokine production (IL-10) and modulates immune cell recruitment to inflamed skin." },
    { title: "Antimicrobial Activity", description: "KPV has demonstrated direct antimicrobial properties against various pathogens including Staphylococcus aureus and Candida albicans, providing dual anti-inflammatory and antimicrobial benefit.", mechanism: "Disrupts microbial cell membranes through cationic peptide interactions. Additionally, reduces pathogen-driven inflammation to prevent excessive tissue damage during infection." }
  ],
  clinicalTrials: [
    { title: "KPV Anti-Inflammatory Activity via NF-κB Inhibition", year: "2015", institution: "Journal of Biological Chemistry / PLoS ONE (Kannengiesser et al.)", participants: "In vitro and preclinical colitis models", duration: "Controlled preclinical studies", findings: "KPV significantly reduced intestinal inflammation by inhibiting NF-κB activation, reducing TNF-α, IL-6, and IL-1β. In colitis models, KPV reduced inflammation scores and improved mucosal healing through both systemic and oral routes.", conclusion: "KPV represents a targeted anti-inflammatory peptide acting through NF-κB modulation with a favorable safety profile for intestinal inflammation." },
    { title: "Alpha-MSH Peptide Fragments in Inflammation", year: "2017", institution: "Annals of the New York Academy of Sciences", participants: "Review of preclinical anti-inflammatory studies", duration: "Multi-study analysis", findings: "C-terminal α-MSH fragments including KPV retained anti-inflammatory potency without melanocortin receptor binding or melanogenic effects. KPV showed efficacy in models of arthritis, dermatitis, and systemic inflammation.", conclusion: "KPV offers a targeted anti-inflammatory approach with a cleaner side effect profile than full-length α-MSH or corticosteroids." },
    { title: "KPV Antimicrobial and Anti-Inflammatory Properties", year: "2019", institution: "Peptides (Elsevier)", participants: "In vitro antimicrobial and immune cell studies", duration: "Controlled laboratory studies", findings: "KPV demonstrated antimicrobial activity against S. aureus and C. albicans at concentrations that also reduced NF-κB-driven inflammation. Dual mechanism provides simultaneous infection control and inflammation reduction.", conclusion: "KPV's combined antimicrobial and anti-inflammatory properties make it uniquely suited for conditions involving both infection and inflammatory tissue damage." }
  ],
  safetyProfile: "KPV is a naturally derived tripeptide fragment of α-MSH with no reported significant adverse effects in preclinical studies. Unlike full-length α-MSH, KPV does not cause skin pigmentation changes as it does not activate melanocortin receptors. It provides anti-inflammatory effects without immunosuppression. For research use only.",
  dosage: "Research protocols typically use 200-500 μg per administration via subcutaneous injection, 1-2 times daily. Oral formulations have also shown efficacy in gut inflammation models. Reconstitute with bacteriostatic water and store refrigerated at 2-8°C.",
  keyBenefits: [
    "Potent anti-inflammatory through direct NF-κB inhibition",
    "No melanogenic side effects unlike parent α-MSH",
    "Oral bioavailability for gut-targeted applications",
    "Antimicrobial activity against bacteria and fungi",
    "Anti-inflammatory without immunosuppression",
    "Promotes intestinal barrier integrity and mucosal healing",
    "Naturally derived fragment with strong preclinical safety",
    "Selective inflammatory gene modulation"
  ]
};

// Hardcoded data for CJC-1295
const CJC1295_DATA = {
  overview: "CJC-1295 is a synthetic analog of growth hormone-releasing hormone (GHRH) consisting of 30 amino acids (modified GRF 1-29). It stimulates pulsatile growth hormone release from the anterior pituitary gland. CJC-1295 is available in two forms: CJC-1295 DAC (Drug Affinity Complex), which binds to albumin for extended half-life (~8 days), and CJC-1295 no DAC (also called Modified GRF 1-29 or MOD-GRF), with a shorter half-life (~30 minutes). Both promote physiological GH secretion patterns rather than supraphysiological spikes.",
  potentialUses: [
    { title: "Growth Hormone Optimization", description: "CJC-1295 amplifies the body's natural GH pulsatile release pattern, increasing both the amplitude and duration of GH secretion episodes. This produces sustained IGF-1 elevation without the supraphysiological spikes associated with exogenous GH.", mechanism: "Binds to GHRH receptors on anterior pituitary somatotroph cells, activating the cAMP/PKA signaling cascade that stimulates GH gene transcription and vesicular release. The DAC modification enables albumin binding, extending plasma half-life and allowing sustained receptor stimulation." },
    { title: "Body Composition & Fat Loss", description: "Elevated GH and IGF-1 levels promote lipolysis and lean body mass. CJC-1295 has shown improvements in body composition including reduced visceral fat and increased lean muscle mass in clinical studies.", mechanism: "GH activates hormone-sensitive lipase in adipocytes, promoting triglyceride hydrolysis and free fatty acid release. Simultaneously stimulates hepatic IGF-1 production which promotes protein synthesis and nitrogen retention in skeletal muscle." },
    { title: "Sleep Quality & Recovery", description: "CJC-1295 enhances slow-wave sleep duration and quality, as GH is primarily secreted during deep sleep. Improved sleep architecture supports recovery, tissue repair, and immune function.", mechanism: "Amplifies the nocturnal GH surge that occurs during slow-wave sleep stages 3-4. Enhanced GH pulsatility during sleep promotes tissue repair, protein synthesis, and immune cell regeneration." },
    { title: "Connective Tissue & Joint Health", description: "Increased GH and IGF-1 stimulate collagen synthesis, proteoglycan production, and chondrocyte proliferation, supporting joint, tendon, and ligament health.", mechanism: "IGF-1 stimulates chondrocyte proliferation and extracellular matrix synthesis in cartilage. Promotes collagen type II production in joints and collagen type I in tendons and ligaments." }
  ],
  clinicalTrials: [
    { title: "CJC-1295 DAC Phase II Clinical Trial", year: "2006", institution: "Journal of Clinical Endocrinology & Metabolism (Teichman et al.)", participants: "64 healthy adults aged 21-61", duration: "28-day dose-escalation study", findings: "CJC-1295 DAC produced dose-dependent increases in GH (2-10 fold) and IGF-1 (1.5-3 fold) that were sustained for 6+ days after a single injection. The increases were maintained with weekly dosing without tachyphylaxis. GH pulsatility was preserved with amplified pulse amplitude.", conclusion: "CJC-1295 DAC produces sustained, dose-dependent GH and IGF-1 elevations while preserving physiological pulsatile secretion patterns. Well-tolerated with no serious adverse events." },
    { title: "Modified GRF 1-29 Effects on GH Secretion", year: "2008", institution: "Growth Hormone & IGF Research", participants: "Healthy male volunteers", duration: "Single and repeated dose studies", findings: "Modified GRF 1-29 (CJC-1295 no DAC) produced robust GH release within 15-30 minutes of subcutaneous injection, with peak levels at 30-60 minutes. Combined with a GHRP, it produced synergistic GH release 3-5 times greater than either peptide alone.", conclusion: "Modified GRF 1-29 is effective for acute GH stimulation and shows strong synergy with ghrelin-mimetic secretagogues." },
    { title: "Long-term Safety of GHRH Analogs", year: "2012", institution: "European Journal of Endocrinology", participants: "Multi-study safety review", duration: "6-12 month treatment periods", findings: "GHRH analog therapy showed favorable long-term safety profiles with maintained efficacy. No increased risk of neoplasia, glucose intolerance was dose-dependent and manageable. IGF-1 levels remained within physiological ranges.", conclusion: "GHRH analogs demonstrate acceptable long-term safety when dosed to maintain IGF-1 within physiological reference ranges." }
  ],
  safetyProfile: "Clinical trials of CJC-1295 have shown generally favorable safety. Common side effects include injection site reactions, flushing, and transient headache. As with all GH-elevating agents, monitoring of IGF-1 levels, fasting glucose, and insulin sensitivity is recommended. Contraindicated in individuals with active malignancy. For research use only.",
  dosage: "CJC-1295 DAC: 1-2 mg once or twice weekly via subcutaneous injection. CJC-1295 no DAC (MOD-GRF 1-29): 100-300 μg per injection, 1-3 times daily, often combined with a GHRP for synergistic effect. Administer before bed or after fasting for optimal GH response. Reconstitute with bacteriostatic water.",
  keyBenefits: [
    "Sustained GH and IGF-1 elevation while preserving pulsatile patterns",
    "Clinically demonstrated 2-10 fold GH increase in Phase II trials",
    "Improved body composition with reduced fat and increased lean mass",
    "Enhanced slow-wave sleep and recovery",
    "Synergistic effects when combined with GHRP peptides",
    "Supports collagen synthesis and joint health through IGF-1",
    "Extended half-life with DAC modification for convenient dosing",
    "Dose-dependent response with predictable pharmacokinetics"
  ]
};

// Hardcoded data for Ipamorelin
const IPAMORELIN_DATA = {
  overview: "Ipamorelin is a selective growth hormone secretagogue (GHS) pentapeptide that stimulates GH release by mimicking ghrelin at the growth hormone secretagogue receptor (GHS-R1a). Unlike other GHRPs, ipamorelin is highly selective — it robustly stimulates GH release without significantly affecting cortisol, prolactin, or ACTH levels. This selectivity makes it one of the cleanest GH-stimulating peptides available for research.",
  potentialUses: [
    { title: "Selective Growth Hormone Release", description: "Ipamorelin produces dose-dependent GH release comparable to GHRP-6 but without stimulating cortisol, prolactin, or appetite. This selectivity allows targeted GH elevation without unwanted hormonal side effects.", mechanism: "Binds to GHS-R1a on pituitary somatotrophs, activating the IP3/DAG signaling pathway that triggers calcium-dependent GH vesicle release. Does not activate GHS-R1a subtypes on corticotrophs or lactotrophs, explaining its selective GH stimulation." },
    { title: "Body Composition Improvement", description: "Through sustained GH elevation, ipamorelin promotes lipolysis and lean body mass accretion while improving nitrogen retention and protein synthesis.", mechanism: "GH-mediated activation of hormone-sensitive lipase promotes fat breakdown. IGF-1 elevation stimulates satellite cell proliferation and myofibrillar protein synthesis in skeletal muscle." },
    { title: "Bone Density & Skeletal Health", description: "Ipamorelin has been specifically studied for bone health applications. It promotes osteoblast activity and increases bone mineral content through GH/IGF-1 axis activation.", mechanism: "IGF-1 stimulates osteoblast differentiation and activity, increasing bone matrix deposition. GH promotes calcium retention and phosphate metabolism. Preclinical studies show increased bone mineral density with ipamorelin treatment." },
    { title: "Post-Surgical Recovery", description: "Ipamorelin has been studied in clinical trials for post-operative recovery, particularly for bowel motility recovery after abdominal surgery. GH elevation supports tissue healing and functional recovery.", mechanism: "GH promotes tissue repair through increased protein synthesis and cell proliferation. May accelerate return of gastrointestinal motility through interaction with motilin-related pathways." }
  ],
  clinicalTrials: [
    { title: "Ipamorelin Selectivity Study", year: "1998", institution: "European Journal of Endocrinology (Raun et al.)", participants: "Preclinical and clinical comparison studies", duration: "Dose-response studies", findings: "Ipamorelin demonstrated GH release potency comparable to GHRP-6 but without significant elevation of ACTH, cortisol, or prolactin. The selectivity profile was maintained across a wide dose range, distinguishing it from other GHRPs which lose selectivity at higher doses.", conclusion: "Ipamorelin is the most selective GH secretagogue studied, making it ideal for applications requiring GH elevation without broader hormonal perturbation." },
    { title: "Ipamorelin for Post-Operative Ileus", year: "2007", institution: "Growth Hormone & IGF Research (Phase II Clinical Trial)", participants: "Post-surgical patients after abdominal procedures", duration: "5-day treatment period", findings: "Ipamorelin accelerated return of bowel function compared to placebo in patients following abdominal surgery. GH levels were elevated without clinically significant changes in cortisol or glucose. Treatment was well-tolerated.", conclusion: "Ipamorelin shows clinical potential for post-operative recovery with a favorable safety profile due to its selective GH-stimulating mechanism." },
    { title: "Ipamorelin Effects on Bone Growth", year: "2001", institution: "Bone (Elsevier) (Svensson et al.)", participants: "Preclinical bone density models", duration: "12-week treatment study", findings: "Ipamorelin increased bone mineral content, periosteal bone formation rate, and longitudinal bone growth in a dose-dependent manner. Effects were comparable to GH administration without the cortisol and prolactin side effects.", conclusion: "Ipamorelin's selective GH stimulation effectively promotes bone formation, supporting its potential for skeletal health applications." }
  ],
  safetyProfile: "Ipamorelin has demonstrated a favorable safety profile in both preclinical and clinical studies due to its high GH selectivity. It does not significantly affect cortisol, prolactin, appetite, or blood glucose at therapeutic doses. Common side effects are limited to mild injection site reactions and transient headache. For research use only.",
  dosage: "Research protocols typically use 200-300 μg per injection, administered 1-3 times daily via subcutaneous injection. Often combined with CJC-1295 no DAC (MOD-GRF 1-29) for synergistic GH release. Best administered on an empty stomach, particularly before bed. Reconstitute with bacteriostatic water.",
  keyBenefits: [
    "Most selective GH secretagogue — no cortisol or prolactin elevation",
    "Dose-dependent GH release comparable to GHRP-6 potency",
    "Clinical trial evidence for post-surgical recovery",
    "Promotes bone mineral density and skeletal health",
    "Synergistic with CJC-1295 for enhanced GH pulsatility",
    "Does not increase appetite (unlike GHRP-6)",
    "Favorable safety profile maintained across wide dose ranges",
    "Preserves natural GH pulsatile secretion patterns"
  ]
};

// Hardcoded data for Gonadorelin
const GONADORELIN_DATA = {
  overview: "Gonadorelin is a synthetic decapeptide identical to endogenous gonadotropin-releasing hormone (GnRH). It stimulates the anterior pituitary to release luteinizing hormone (LH) and follicle-stimulating hormone (FSH), which are essential for gonadal function, sex hormone production, and fertility. Gonadorelin is FDA-approved for diagnostic evaluation of pituitary-gonadal function and has research applications in fertility support and hormonal axis maintenance.",
  potentialUses: [
    { title: "Pituitary-Gonadal Axis Stimulation", description: "Gonadorelin directly stimulates the pituitary gland to release LH and FSH, which in turn stimulate testosterone production in males and estrogen/progesterone in females. Pulsatile administration mimics natural GnRH physiology.", mechanism: "Binds to GnRH receptors on anterior pituitary gonadotroph cells, activating phospholipase C and calcium-dependent signaling cascades that release pre-formed LH and FSH from secretory vesicles." },
    { title: "Fertility Support & Ovulation Induction", description: "Pulsatile gonadorelin administration has been used to induce ovulation in women with hypothalamic amenorrhea and to support spermatogenesis in men with hypogonadotropic hypogonadism.", mechanism: "Restores physiological GnRH pulsatility required for normal FSH and LH secretion patterns. In females, promotes follicular development and ovulation. In males, LH stimulates Leydig cell testosterone production while FSH supports Sertoli cell function and spermatogenesis." },
    { title: "Diagnostic Pituitary Function Testing", description: "FDA-approved for evaluating pituitary gonadotroph reserve and distinguishing between hypothalamic and pituitary causes of hypogonadism.", mechanism: "Acute GnRH administration produces measurable LH and FSH responses that can be compared to reference ranges to assess pituitary function." },
    { title: "Hormonal Axis Maintenance During Research Protocols", description: "Gonadorelin is studied for maintaining endogenous testosterone production and gonadal function during protocols that might otherwise suppress the HPG axis.", mechanism: "Pulsatile GnRH stimulation maintains pituitary sensitivity and gonadotropin secretion, preserving downstream gonadal function and sex hormone production." }
  ],
  clinicalTrials: [
    { title: "Pulsatile GnRH for Hypothalamic Amenorrhea", year: "2013", institution: "Fertility and Sterility (Martin et al.)", participants: "Women with hypothalamic amenorrhea", duration: "Treatment cycles until ovulation", findings: "Pulsatile GnRH administration at 75-150 ng/kg every 90 minutes restored normal LH/FSH pulsatility and induced ovulation in >80% of treated cycles. Pregnancy rates were comparable to natural conception rates.", conclusion: "Pulsatile GnRH effectively restores reproductive function in hypothalamic amenorrhea by mimicking physiological hormone secretion patterns." },
    { title: "GnRH Stimulation Test for Pituitary Function", year: "2016", institution: "Endocrine Reviews", participants: "Clinical diagnostic review", duration: "Standard diagnostic protocols", findings: "Gonadorelin stimulation testing reliably distinguishes hypothalamic from pituitary causes of hypogonadism. Normal LH response (>10 mIU/mL rise) indicates intact pituitary function, while blunted response suggests pituitary pathology.", conclusion: "Gonadorelin remains the gold standard for functional assessment of pituitary gonadotroph reserve." },
    { title: "GnRH for Male Hypogonadotropic Hypogonadism", year: "2018", institution: "Journal of Clinical Endocrinology & Metabolism", participants: "Males with congenital or acquired hypogonadotropic hypogonadism", duration: "6-12 month treatment protocols", findings: "Pulsatile GnRH therapy restored testosterone levels and initiated spermatogenesis in men with hypogonadotropic hypogonadism. Testicular volume increased and sperm counts reached levels sufficient for natural conception.", conclusion: "Pulsatile GnRH is effective for fertility restoration in hypogonadotropic hypogonadism, superior to gonadotropin injections for preserving physiological hormonal patterns." }
  ],
  safetyProfile: "Gonadorelin is FDA-approved with a well-established safety profile. It is identical to the body's natural GnRH. Side effects are generally mild and may include injection site reactions, headache, flushing, and nausea. Continuous (non-pulsatile) administration can paradoxically suppress gonadotropins through receptor desensitization. For research use only outside of diagnostic applications.",
  dosage: "Diagnostic testing: 100 μg IV or subcutaneous single dose. Research protocols for hormonal axis support: 50-100 μg subcutaneously, administered 2-3 times weekly to maintain pulsatile stimulation. Reconstitute with bacteriostatic water and store refrigerated.",
  keyBenefits: [
    "Identical to endogenous GnRH with established FDA approval",
    "Stimulates natural LH and FSH release for downstream hormone production",
    "Supports fertility through physiological gonadotropin patterns",
    "Diagnostic gold standard for pituitary function assessment",
    "Maintains HPG axis function during research protocols",
    "Well-characterized safety profile from decades of clinical use",
    "Preserves testicular function and spermatogenesis",
    "Pulsatile administration mimics natural GnRH physiology"
  ]
};

// Hardcoded data for DSIP
const DSIP_DATA = {
  overview: "Delta Sleep-Inducing Peptide (DSIP) is a naturally occurring nonapeptide (9 amino acids: Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu) first isolated from the cerebral venous blood of rabbits during electrically induced sleep. DSIP modulates sleep architecture, stress responses, and neuroendocrine function. It is one of the few peptides studied specifically for its effects on sleep regulation and circadian rhythm normalization.",
  potentialUses: [
    { title: "Sleep Architecture Improvement", description: "DSIP promotes delta wave (slow-wave) sleep without sedation or rebound effects. It normalizes disturbed sleep patterns rather than forcing sleep, making it distinct from pharmaceutical sleep aids.", mechanism: "Modulates serotonergic and GABAergic neurotransmission in sleep-regulating nuclei. Promotes physiological sleep onset through enhancement of natural sleep pressure pathways rather than direct sedation. Increases slow-wave sleep duration and delta power density on EEG." },
    { title: "Stress Response Modulation", description: "DSIP has demonstrated adaptogenic properties, reducing the physiological impact of stress including normalization of elevated cortisol and ACTH. It supports stress resilience without sedation.", mechanism: "Modulates hypothalamic-pituitary-adrenal (HPA) axis reactivity by reducing CRH hypersecretion and normalizing ACTH/cortisol responses. Acts on central stress-response circuits to promote adaptation." },
    { title: "Pain Modulation", description: "DSIP has shown analgesic properties in preclinical and clinical studies, reducing pain perception through endogenous opioid pathway modulation.", mechanism: "Enhances met-enkephalin activity and modulates opioid receptor sensitivity. Promotes endogenous pain control pathways without direct opioid receptor agonism, reducing abuse potential." },
    { title: "Circadian Rhythm Regulation", description: "DSIP helps normalize disrupted circadian patterns including those caused by shift work, jet lag, or irregular schedules. It acts on the central clock mechanisms rather than merely inducing drowsiness.", mechanism: "Modulates suprachiasmatic nucleus (SCN) activity and melatonin secretion patterns. Helps resynchronize disrupted circadian oscillators through interaction with core clock gene expression." }
  ],
  clinicalTrials: [
    { title: "DSIP Effects on Sleep Architecture", year: "2010", institution: "Neuropeptides (Schneider-Helmert & Schoenenberger)", participants: "Subjects with insomnia and healthy controls", duration: "Multi-night polysomnographic studies", findings: "DSIP administration increased slow-wave sleep duration and improved sleep continuity without altering REM sleep architecture. Effects were most pronounced in subjects with disturbed baseline sleep. No hangover effects or rebound insomnia were observed.", conclusion: "DSIP normalizes sleep architecture through physiological mechanisms without the sedative or dependency risks of conventional sleep aids." },
    { title: "DSIP Stress Modulation Study", year: "2005", institution: "European Neuropsychopharmacology", participants: "Subjects under experimental stress conditions", duration: "Acute and chronic administration protocols", findings: "DSIP reduced stress-induced cortisol elevation and improved subjective stress tolerance. EEG markers showed reduced stress reactivity without cognitive impairment. Chronic administration showed no tolerance development.", conclusion: "DSIP demonstrates adaptogenic properties with potential for stress resilience applications without cognitive side effects." },
    { title: "DSIP Analgesic Properties", year: "2008", institution: "Peptides (Elsevier)", participants: "Preclinical pain models and clinical pain studies", duration: "Acute and chronic pain protocols", findings: "DSIP reduced pain scores in chronic pain models through enhancement of endogenous opioid pathways. Analgesic effects were maintained over repeated administration without tolerance development typical of direct opioid agonists.", conclusion: "DSIP provides analgesic support through endogenous opioid modulation without direct opioid receptor binding or tolerance development." }
  ],
  safetyProfile: "DSIP is a naturally occurring neuropeptide with a favorable safety profile in clinical studies. No significant adverse effects, dependency, or tolerance have been reported. Unlike pharmaceutical sleep aids, DSIP does not cause next-day sedation, cognitive impairment, or rebound insomnia. For research use only.",
  dosage: "Research protocols typically use 100-250 μg administered via subcutaneous or intramuscular injection, given 1-2 hours before desired sleep onset. Some protocols use 100 μg for 5-10 consecutive days for circadian rhythm resynchronization. Reconstitute with bacteriostatic water and store refrigerated.",
  keyBenefits: [
    "Promotes slow-wave (delta) sleep without sedation or dependency",
    "No hangover effects or rebound insomnia",
    "Normalizes stress-induced cortisol elevation",
    "Analgesic properties through endogenous opioid modulation",
    "Circadian rhythm resynchronization for disrupted sleep patterns",
    "Naturally occurring neuropeptide with strong safety profile",
    "No cognitive impairment or tolerance development",
    "Improves sleep quality without altering REM architecture"
  ]
};

// Hardcoded data for Oxytocin
const OXYTOCIN_DATA = {
  overview: "Oxytocin is a naturally occurring nonapeptide hormone (9 amino acids: Cys-Tyr-Ile-Gln-Asn-Cys-Pro-Leu-Gly-NH₂) produced in the hypothalamus and released by the posterior pituitary. Often called the 'bonding hormone,' oxytocin plays critical roles in social bonding, maternal behavior, stress regulation, and reproductive function. It is FDA-approved for labor induction (Pitocin) and has extensive research applications in social neuroscience and behavioral pharmacology.",
  potentialUses: [
    { title: "Social Cognition & Behavior", description: "Intranasal oxytocin enhances social cognition, including facial emotion recognition, trust, empathy, and social memory. It is studied extensively in autism spectrum disorder and social anxiety research.", mechanism: "Acts on oxytocin receptors in the amygdala, prefrontal cortex, and nucleus accumbens to modulate social salience processing, reduce social threat perception, and enhance reward from social interactions." },
    { title: "Stress & Anxiety Reduction", description: "Oxytocin has anxiolytic effects, reducing cortisol responses to stress and attenuating anxiety-related behavior. It modulates the HPA axis and amygdala reactivity.", mechanism: "Reduces amygdala activation in response to threatening stimuli. Inhibits CRH release from the hypothalamus, attenuating ACTH and cortisol secretion. Promotes parasympathetic nervous system activation." },
    { title: "Reproductive Function", description: "FDA-approved for labor induction and management of postpartum hemorrhage. Oxytocin stimulates uterine contractions and milk ejection reflex.", mechanism: "Binds to oxytocin receptors on uterine smooth muscle, increasing intracellular calcium and promoting rhythmic contractions. In mammary tissue, contracts myoepithelial cells surrounding alveoli for milk ejection." },
    { title: "Wound Healing Research", description: "Emerging research suggests oxytocin promotes wound healing through anti-inflammatory effects and enhanced immune cell function at wound sites.", mechanism: "Reduces inflammatory cytokine production at wound sites while promoting anti-inflammatory macrophage phenotype. Enhances keratinocyte migration and proliferation for faster wound closure." }
  ],
  clinicalTrials: [
    { title: "Intranasal Oxytocin and Social Cognition", year: "2019", institution: "Psychoneuroendocrinology (Meta-analysis)", participants: "Multiple RCTs totaling >1,500 participants", duration: "Acute single-dose and multi-week studies", findings: "Intranasal oxytocin improved facial emotion recognition accuracy, increased trust behavior in economic games, enhanced empathic accuracy, and reduced amygdala reactivity to social threat. Effects were moderated by baseline social functioning and sex.", conclusion: "Intranasal oxytocin demonstrates reliable enhancement of social cognition with potential therapeutic applications for social functioning deficits." },
    { title: "Oxytocin for Anxiety Disorders", year: "2020", institution: "Biological Psychiatry (Neumann & Slattery)", participants: "Clinical and preclinical anxiety studies", duration: "Multi-study review", findings: "Oxytocin reduced subjective anxiety, cortisol stress responses, and amygdala hyperactivation in anxiety disorders. Effects were most pronounced in social anxiety contexts. Both acute and chronic administration showed benefit.", conclusion: "Oxytocin shows promise for anxiety modulation, particularly in social anxiety, through HPA axis attenuation and amygdala modulation." },
    { title: "Oxytocin Safety and Tolerability Review", year: "2018", institution: "Frontiers in Neuroscience", participants: "Comprehensive safety review of clinical trials", duration: "Multi-study analysis", findings: "Intranasal oxytocin showed a favorable safety profile across >100 clinical studies. No serious adverse events were attributed to oxytocin at standard doses. Minor side effects included nasal irritation and rare headache.", conclusion: "Intranasal oxytocin is well-tolerated at research doses with a safety profile suitable for clinical investigation." }
  ],
  safetyProfile: "Oxytocin has extensive clinical safety data from both FDA-approved uses and research trials. Intranasal formulations are well-tolerated with minimal side effects (nasal irritation, occasional headache). Contraindicated in active labor complications (when used for non-approved purposes). Should not be used during pregnancy outside of clinical supervision. For research use only outside of approved indications.",
  dosage: "Research protocols for intranasal administration: 20-40 IU (international units) per dose, administered 30-45 minutes before social/behavioral assessments. Subcutaneous injection protocols vary by research application. Intranasal spray is the most common research delivery method. Store refrigerated at 2-8°C.",
  keyBenefits: [
    "FDA-approved hormone with extensive clinical safety data",
    "Enhances social cognition, empathy, and trust",
    "Reduces anxiety through HPA axis and amygdala modulation",
    "Promotes stress resilience and cortisol reduction",
    "Supports reproductive function and maternal behavior",
    "Intranasal delivery for convenient non-invasive administration",
    "Extensive clinical trial database across social neuroscience",
    "Naturally occurring hormone with well-characterized pharmacology"
  ]
};

// Hardcoded data for AOD-9604
const AOD9604_DATA = {
  overview: "AOD-9604 (Advanced Obesity Drug 9604) is a modified fragment of human growth hormone (HGH), specifically amino acids 177-191 with a tyrosine residue added at the N-terminus. Developed by Monash University in Australia, AOD-9604 retains the lipolytic (fat-burning) activity of HGH without its growth-promoting or diabetogenic effects. It has received GRAS (Generally Recognized as Safe) status from the FDA for use as a food supplement ingredient.",
  potentialUses: [
    { title: "Fat Metabolism & Lipolysis", description: "AOD-9604 stimulates lipolysis (fat breakdown) and inhibits lipogenesis (fat formation) without affecting blood glucose or tissue growth. It targets adipose tissue selectively.", mechanism: "Mimics the lipolytic fragment of HGH by activating beta-3 adrenergic receptor pathways in adipose tissue. Stimulates hormone-sensitive lipase activity for triglyceride hydrolysis while inhibiting acetyl-CoA carboxylase to reduce de novo lipogenesis." },
    { title: "Cartilage & Joint Repair", description: "Emerging research indicates AOD-9604 promotes cartilage repair and has chondroprotective properties. It has been studied for osteoarthritis applications with promising preclinical results.", mechanism: "Stimulates chondrocyte proliferation and proteoglycan synthesis in articular cartilage. Reduces matrix metalloproteinase activity that degrades cartilage matrix. Promotes mesenchymal stem cell differentiation toward chondrocyte lineage." },
    { title: "Body Composition Optimization", description: "AOD-9604 selectively reduces body fat, particularly visceral adipose tissue, without the muscle-building or organ-growth effects of full-length HGH. This provides targeted fat reduction.", mechanism: "Activates fat-cell-specific signaling cascades for lipolysis without engaging IGF-1 receptor pathways responsible for tissue growth. Does not affect insulin sensitivity or glucose metabolism at therapeutic doses." },
    { title: "Bone Health Research", description: "Preclinical studies suggest AOD-9604 may support bone formation and reduce bone resorption, indicating potential for osteoporosis research.", mechanism: "Stimulates osteoblast activity and reduces osteoclast-mediated bone resorption. Promotes calcium deposition in bone matrix through growth factor-independent mechanisms." }
  ],
  clinicalTrials: [
    { title: "AOD-9604 Phase IIb Obesity Trial", year: "2004", institution: "Monash University / Metabolic Pharmaceuticals", participants: "300+ obese subjects", duration: "12-week randomized controlled trial", findings: "AOD-9604 produced statistically significant weight loss compared to placebo without affecting IGF-1, glucose, insulin, or lipid profiles. The 1 mg daily dose showed optimal efficacy. No serious adverse events were attributed to treatment.", conclusion: "AOD-9604 demonstrates selective fat reduction without the metabolic side effects of HGH, confirming the dissociation of lipolytic and growth-promoting GH activities." },
    { title: "AOD-9604 FDA GRAS Determination", year: "2014", institution: "FDA / Calzada Regulatory Consulting", participants: "Comprehensive toxicology and safety review", duration: "Full safety evaluation package", findings: "AOD-9604 passed all safety evaluations for GRAS designation including acute toxicity, subchronic toxicity, genotoxicity, and reproductive toxicity studies. No adverse effects at doses far exceeding therapeutic levels.", conclusion: "AOD-9604 received GRAS status, confirming its safety profile for oral consumption as a food ingredient." },
    { title: "AOD-9604 Chondroprotective Effects", year: "2016", institution: "Journal of Orthopaedic Research", participants: "Preclinical osteoarthritis models", duration: "8-12 week treatment studies", findings: "Intra-articular AOD-9604 reduced cartilage degradation markers, promoted chondrocyte proliferation, and improved joint function scores compared to untreated controls. Combination with hyaluronic acid showed additive benefits.", conclusion: "AOD-9604 demonstrates chondroprotective and regenerative properties in preclinical osteoarthritis models, supporting investigation for joint health applications." }
  ],
  safetyProfile: "AOD-9604 has received FDA GRAS status, indicating a high safety threshold. Clinical trials showed no significant adverse effects on blood glucose, insulin, IGF-1, or cardiovascular markers. It does not promote cell growth or have diabetogenic effects. Common side effects are limited to mild injection site reactions. For research use only.",
  dosage: "Clinical trials used 250-500 μg per day administered subcutaneously. Research protocols commonly use 300 μg daily, administered on an empty stomach for optimal absorption. Reconstitute with bacteriostatic water and store refrigerated at 2-8°C.",
  keyBenefits: [
    "FDA GRAS status confirming exceptional safety profile",
    "Selective fat reduction without HGH growth-promoting effects",
    "No impact on blood glucose, insulin, or IGF-1 levels",
    "Chondroprotective properties for joint health research",
    "Clinically demonstrated weight loss in Phase II trials",
    "Does not cause insulin resistance or diabetes risk",
    "Targets visceral adipose tissue selectively",
    "Derived from natural HGH fragment (amino acids 177-191)"
  ]
};

// Hardcoded data for NAD+
const NAD_DATA = {
  overview: "NAD+ (Nicotinamide Adenine Dinucleotide) is an essential coenzyme found in every living cell. It plays critical roles in cellular energy metabolism, DNA repair, gene expression regulation, and calcium signaling. NAD+ levels decline significantly with age — by age 50, levels are approximately half of those at age 20. This decline is implicated in aging, metabolic dysfunction, and neurodegenerative processes. NAD+ research focuses on supplementation strategies including direct NAD+ administration and precursors (NMN, NR).",
  potentialUses: [
    { title: "Cellular Energy & Mitochondrial Function", description: "NAD+ is essential for mitochondrial oxidative phosphorylation and glycolysis. Declining NAD+ levels impair cellular energy production, contributing to fatigue, metabolic dysfunction, and age-related cellular decline.", mechanism: "Serves as an electron carrier in the mitochondrial electron transport chain (Complex I) and as a substrate for NADH dehydrogenase. Required for conversion of nutrients to ATP through both glycolysis (cytoplasm) and the TCA cycle (mitochondria)." },
    { title: "DNA Repair & Genomic Stability", description: "NAD+ is consumed by PARP enzymes (Poly-ADP Ribose Polymerase) during DNA repair. Adequate NAD+ levels are essential for maintaining genomic integrity and preventing accumulation of DNA damage with age.", mechanism: "PARP-1 and PARP-2 use NAD+ as a substrate to generate ADP-ribose polymers that recruit DNA repair machinery to damage sites. Low NAD+ impairs PARP function, allowing DNA damage to accumulate and potentially drive cellular senescence." },
    { title: "Sirtuin Activation & Longevity Pathways", description: "NAD+ is the essential substrate for sirtuin enzymes (SIRT1-7), which regulate aging, inflammation, stress resistance, and metabolic function. Sirtuins are considered key mediators of caloric restriction benefits.", mechanism: "Sirtuins use NAD+ for their deacylase and ADP-ribosyltransferase activities. SIRT1 deacetylates PGC-1α (mitochondrial biogenesis), p53 (cell survival), NF-κB (inflammation reduction), and FOXO transcription factors (stress resistance and autophagy)." },
    { title: "Neuroprotection & Cognitive Function", description: "NAD+ depletion in neurons contributes to neurodegeneration. NAD+ supplementation has shown neuroprotective effects in preclinical models of Alzheimer's, Parkinson's, and ischemic brain injury.", mechanism: "Maintains neuronal mitochondrial function and ATP production. Supports SIRT1-mediated neuroprotection through BDNF upregulation and tau deacetylation. Activates CD38-dependent calcium signaling for synaptic function." }
  ],
  clinicalTrials: [
    { title: "NAD+ Decline in Human Aging", year: "2019", institution: "Cell Metabolism (Yoshino, Baur, & Imai)", participants: "Comprehensive review of human aging studies", duration: "Cross-sectional age cohort analyses", findings: "NAD+ levels decline progressively with age across multiple tissues including brain, liver, muscle, and blood. The decline correlates with reduced mitochondrial function, increased DNA damage, impaired immune function, and metabolic dysfunction.", conclusion: "Age-related NAD+ decline is a conserved feature of mammalian aging that contributes to multiple hallmarks of aging, supporting therapeutic NAD+ restoration strategies." },
    { title: "NAD+ Precursor Supplementation in Humans", year: "2020", institution: "Nature Communications (multiple clinical trials)", participants: "Healthy adults aged 40-75", duration: "6-12 week supplementation trials", findings: "NAD+ precursor supplementation (NMN, NR) significantly increased blood NAD+ levels by 40-90%. Improvements were observed in insulin sensitivity, blood pressure, arterial stiffness, and markers of mitochondrial function. Well-tolerated with no serious adverse events.", conclusion: "NAD+ precursor supplementation effectively raises NAD+ levels in humans with measurable physiological benefits and excellent safety." },
    { title: "NAD+ in Neurodegenerative Disease Models", year: "2021", institution: "Nature Reviews Neuroscience", participants: "Preclinical Alzheimer's and Parkinson's models", duration: "Multi-study review", findings: "NAD+ supplementation reduced amyloid plaque formation, improved synaptic plasticity, reduced neuroinflammation, and improved cognitive function in AD models. In PD models, it protected dopaminergic neurons and improved motor function.", conclusion: "NAD+ restoration shows significant neuroprotective potential across multiple neurodegenerative conditions through mitochondrial, sirtuin, and DNA repair mechanisms." }
  ],
  safetyProfile: "NAD+ is a naturally occurring essential coenzyme with a well-characterized safety profile. Oral precursors (NMN, NR) have demonstrated safety in clinical trials up to 2g/day. Intravenous NAD+ infusions are used clinically but require medical supervision. Theoretical concern of promoting growth of existing cancer cells (NAD+ supports rapidly dividing cells) — individuals with active malignancy should consult their healthcare provider. For research use only.",
  dosage: "Research protocols vary by delivery method. Subcutaneous NAD+: 50-200 mg per injection. Intravenous NAD+: 250-750 mg infusion over 2-4 hours (medical supervision required). Oral precursors: NMN 250-1000 mg/day, NR 300-1000 mg/day. Injection solutions should be prepared fresh and stored refrigerated.",
  keyBenefits: [
    "Essential coenzyme for cellular energy production (ATP synthesis)",
    "Required substrate for DNA repair enzymes (PARPs)",
    "Activates sirtuin longevity pathways (SIRT1-7)",
    "Neuroprotective through mitochondrial and BDNF support",
    "Declines ~50% by age 50, making supplementation research-relevant",
    "Clinically demonstrated to improve metabolic markers",
    "Supports immune cell function and inflammatory regulation",
    "Well-characterized safety profile as a natural coenzyme"
  ]
};

// Hardcoded data for PT-141
const PT141_DATA = {
  overview: "PT-141 (Bremelanotide) is a synthetic cyclic heptapeptide melanocortin receptor agonist originally derived from Melanotan II. It is FDA-approved (as Vyleesi) for the treatment of hypoactive sexual desire disorder (HSDD) in premenopausal women. Unlike PDE5 inhibitors which act on vascular smooth muscle, PT-141 acts centrally in the brain through melanocortin-4 receptor (MC4R) activation to modulate sexual arousal pathways.",
  potentialUses: [
    { title: "Sexual Desire & Arousal", description: "PT-141 is the only FDA-approved treatment that works through the central nervous system to enhance sexual desire. It increases sexual motivation and arousal rather than acting on peripheral vasculature.", mechanism: "Activates melanocortin-4 receptors (MC4R) in the hypothalamus and limbic system, modulating dopaminergic reward pathways involved in sexual motivation. Increases neural activity in brain regions associated with desire, arousal, and reward processing." },
    { title: "Erectile Function Research", description: "In clinical trials for male sexual dysfunction, PT-141 demonstrated efficacy for erectile function through a mechanism distinct from PDE5 inhibitors, potentially benefiting non-responders to conventional treatments.", mechanism: "Central MC4R activation modulates descending neural pathways from the hypothalamus to sacral parasympathetic nuclei, promoting erectile tissue vasodilation through neurogenic rather than direct vascular mechanisms." },
    { title: "Melanocortin System Research", description: "PT-141 is a valuable research tool for studying the melanocortin system's role in sexual behavior, energy homeostasis, and reward processing.", mechanism: "Acts as a non-selective melanocortin receptor agonist with highest affinity for MC4R and MC1R. Enables investigation of melanocortin pathway contributions to complex behaviors including sexual motivation and feeding behavior." }
  ],
  clinicalTrials: [
    { title: "Bremelanotide Phase III RECONNECT Trial", year: "2019", institution: "Obstetrics & Gynecology (Kingsberg et al.)", participants: "1,247 premenopausal women with HSDD", duration: "24-week randomized, double-blind, placebo-controlled", findings: "PT-141 (1.75 mg subcutaneous) significantly increased sexual desire scores and decreased distress related to low sexual desire compared to placebo. Approximately 25% of treated women reported clinically meaningful improvement vs 17% placebo.", conclusion: "PT-141 is effective for HSDD in premenopausal women, leading to FDA approval as Vyleesi in June 2019." },
    { title: "PT-141 for Male Erectile Dysfunction", year: "2005", institution: "Journal of Urology (Diamond et al.)", participants: "Males with erectile dysfunction", duration: "Dose-ranging clinical study", findings: "PT-141 produced dose-dependent improvements in erectile function in men with ED, including some who were non-responsive to PDE5 inhibitors. The mechanism was centrally mediated, confirmed by concurrent brain imaging studies.", conclusion: "PT-141 offers a mechanistically distinct approach to ED treatment through central melanocortin activation, potentially benefiting PDE5 inhibitor non-responders." },
    { title: "Safety Profile of Bremelanotide", year: "2019", institution: "FDA Safety Review / Prescribing Information", participants: "Pooled clinical trial safety data (>3,000 participants)", duration: "Up to 18 months of exposure", findings: "Most common adverse effects: nausea (40%, typically mild and decreasing with use), flushing (20%), headache (11%), and injection site reactions (6%). Small transient increase in blood pressure was observed. No significant safety concerns with long-term use.", conclusion: "PT-141 has an acceptable safety profile for its FDA-approved indication, with nausea being the most common but generally manageable side effect." }
  ],
  safetyProfile: "PT-141 is FDA-approved with extensively characterized safety data. Common side effects include nausea (40% initially, decreasing with use), flushing, headache, and injection site reactions. May cause transient blood pressure elevation — contraindicated in uncontrolled hypertension and cardiovascular disease. Should not be used with Melanotan II due to overlapping melanocortin receptor activity. Limited to 8 doses per month per FDA labeling. For research use only outside of approved indication.",
  dosage: "FDA-approved dose: 1.75 mg subcutaneous injection, administered at least 45 minutes before anticipated sexual activity. Maximum 1 dose per 24 hours and 8 doses per month. Research protocols may vary. Reconstitute with bacteriostatic water and store refrigerated.",
  keyBenefits: [
    "FDA-approved (Vyleesi) with extensive Phase III clinical data",
    "Only centrally-acting treatment for sexual desire disorders",
    "Mechanism distinct from PDE5 inhibitors — may help non-responders",
    "Acts on melanocortin-4 receptors in brain arousal pathways",
    "Clinically demonstrated improvement in desire and reduction in distress",
    "Subcutaneous self-administration for on-demand use",
    "Well-characterized safety and pharmacokinetic profile",
    "Valuable research tool for melanocortin system investigation"
  ]
};

// Hardcoded data for SS-31 (Elamipretide)
const SS31_DATA = {
  overview: "SS-31 (D-Arg-Dmt-Lys-Phe-NH₂, also known as Elamipretide or Bendavia) is a mitochondria-targeted tetrapeptide that selectively concentrates in the inner mitochondrial membrane. Developed at the Szeto-Schiller laboratory at Weill Cornell Medicine, SS-31 binds to cardiolipin, a phospholipid critical for electron transport chain function. By stabilizing cardiolipin, SS-31 optimizes mitochondrial electron transfer, reduces reactive oxygen species (ROS) production, and improves ATP generation.",
  potentialUses: [
    { title: "Mitochondrial Function Optimization", description: "SS-31 directly targets mitochondria and stabilizes the inner membrane structure required for efficient oxidative phosphorylation. It is one of the most specific mitochondria-targeted peptides studied.", mechanism: "Binds selectively to cardiolipin on the inner mitochondrial membrane, stabilizing the interaction between cardiolipin and cytochrome c. This optimizes electron transfer through Complex III and IV, reducing electron leak and ROS generation while increasing ATP production efficiency." },
    { title: "Age-Related Cellular Decline", description: "Mitochondrial dysfunction is a hallmark of aging. SS-31 has reversed age-related mitochondrial decline in preclinical studies, restoring cellular energetics to younger levels.", mechanism: "Reverses age-related cardiolipin peroxidation that disrupts electron transport chain supercomplexes. Restores mitochondrial membrane potential and coupling efficiency. Reduces mitochondrial ROS to levels observed in younger tissue." },
    { title: "Cardiac & Renal Protection", description: "SS-31 has been studied in Phase II/III clinical trials for heart failure (Barth syndrome) and renal ischemia-reperfusion injury. It protects against ischemic damage by maintaining mitochondrial function during oxygen deprivation.", mechanism: "Preserves mitochondrial cristae structure and cardiolipin integrity during ischemia. Prevents mitochondrial permeability transition pore opening, reducing apoptotic cell death. Improves post-ischemic ATP recovery and organ function." },
    { title: "Skeletal Muscle Energetics", description: "SS-31 improves skeletal muscle mitochondrial function and exercise capacity in aged preclinical models. It enhances muscle ATP production and reduces exercise-induced oxidative damage.", mechanism: "Restores mitochondrial coupling efficiency in aged skeletal muscle. Improves fatty acid oxidation capacity and reduces lactate accumulation during exercise. Enhances post-exercise mitochondrial recovery." }
  ],
  clinicalTrials: [
    { title: "Elamipretide for Barth Syndrome (TAZPOWER)", year: "2021", institution: "Stealth BioTherapeutics / Genetics in Medicine", participants: "12 patients with Barth syndrome (genetic cardiolipin disorder)", duration: "36-week crossover trial", findings: "Elamipretide improved 6-minute walk distance, cardiac stroke volume, and patient-reported outcomes in Barth syndrome patients. The improvements correlated with restoration of cardiolipin-dependent mitochondrial function.", conclusion: "Elamipretide demonstrates clinical efficacy in genetic mitochondrial cardiomyopathy through its cardiolipin-stabilizing mechanism." },
    { title: "SS-31 Age-Related Mitochondrial Decline", year: "2018", institution: "Aging Cell (Campbell et al.)", participants: "Aged preclinical models", duration: "8-week treatment studies", findings: "SS-31 reversed age-related decline in mitochondrial function, restoring ATP production, reducing ROS, and improving skeletal muscle function to near-young levels. Effects were maintained during treatment and partially persisted after cessation.", conclusion: "SS-31 demonstrates potent age-reversal of mitochondrial dysfunction, supporting its potential for aging-related therapeutic applications." },
    { title: "Elamipretide in Heart Failure (Phase II)", year: "2019", institution: "Circulation: Heart Failure", participants: "71 patients with heart failure with reduced ejection fraction", duration: "4-week randomized controlled trial", findings: "Elamipretide improved left ventricular volumes and cardiac biomarkers in heart failure patients. NT-proBNP levels decreased, suggesting reduced cardiac wall stress. Treatment was well-tolerated with injection site reactions as the primary adverse effect.", conclusion: "Elamipretide shows promise for heart failure through mitochondrial-targeted mechanisms, complementing existing neurohormonal therapies." }
  ],
  safetyProfile: "SS-31/Elamipretide has been studied in multiple clinical trials with a favorable safety profile. The most common adverse effect is injection site reactions (pain, erythema). No significant systemic toxicity has been observed. As a mitochondria-targeted peptide, it has high selectivity and does not significantly interact with non-mitochondrial targets. For research use only.",
  dosage: "Clinical trials have used 4 mg daily subcutaneous injection (heart failure) and 40 mg weekly subcutaneous injection (Barth syndrome). Research protocols typically use 0.5-5 mg/kg in preclinical studies. Reconstitute with bacteriostatic water and store refrigerated at 2-8°C.",
  keyBenefits: [
    "Highly selective mitochondria-targeted peptide",
    "Stabilizes cardiolipin for optimized electron transport",
    "Reduces mitochondrial ROS production at the source",
    "Clinical trial evidence in heart failure and Barth syndrome",
    "Reverses age-related mitochondrial decline in preclinical models",
    "Improves ATP production efficiency and cellular energetics",
    "Protects against ischemia-reperfusion injury",
    "Favorable safety profile in human clinical trials"
  ]
};

// Hardcoded data for Dihexa
const DIHEXA_DATA = {
  overview: "Dihexa (N-hexanoic-Tyr-Ile-(6) aminohexanoic amide) is a synthetic oligopeptide derived from angiotensin IV, developed by Dr. Joseph Harding and colleagues at Washington State University. Dihexa is one of the most potent nootropic compounds studied, demonstrating cognitive enhancement at picomolar concentrations — approximately 10 million times more potent than BDNF at promoting hepatocyte growth factor (HGF) signaling. It crosses the blood-brain barrier and enhances synaptic connectivity.",
  potentialUses: [
    { title: "Cognitive Enhancement & Synaptogenesis", description: "Dihexa promotes formation of new synaptic connections (synaptogenesis) and strengthens existing synapses. It enhances learning, memory formation, and memory retrieval in preclinical models.", mechanism: "Binds to hepatocyte growth factor receptor (c-Met), potentiating HGF/c-Met signaling at picomolar concentrations. This activates downstream PI3K/Akt and MAPK/ERK pathways that promote dendritic spine formation, synaptic protein synthesis, and long-term potentiation (LTP) — the cellular basis of memory." },
    { title: "Neurodegenerative Disease Research", description: "Dihexa has shown remarkable efficacy in preclinical models of cognitive impairment, including scopolamine-induced amnesia and age-related cognitive decline. It restores cognitive function by rebuilding synaptic networks.", mechanism: "HGF/c-Met pathway activation promotes neuronal survival, neurite outgrowth, and synaptic plasticity. Dihexa-driven synaptogenesis can potentially compensate for synaptic loss characteristic of neurodegenerative conditions." },
    { title: "Brain-Derived Neurotrophic Support", description: "Dihexa augments neurotrophic factor signaling in the brain, particularly in hippocampal and cortical regions critical for learning and memory. Its potency exceeds that of BDNF for promoting synaptic connectivity.", mechanism: "Potentiates HGF/c-Met signaling which converges with BDNF/TrkB pathways on shared downstream effectors (PI3K, MAPK). This dual activation provides synergistic neurotrophic support for dendritic growth and synaptic strengthening." }
  ],
  clinicalTrials: [
    { title: "Dihexa Cognitive Enhancement in Preclinical Models", year: "2013", institution: "Journal of Pharmacology and Experimental Therapeutics (Benoist et al., Washington State University)", participants: "Preclinical cognitive impairment models", duration: "Acute and chronic administration studies", findings: "Dihexa restored cognitive function in scopolamine-induced amnesia and aged animal models at doses of 2-4 mg/kg. It enhanced spatial learning, novel object recognition, and memory consolidation. Effects were mediated through HGF/c-Met receptor activation and were blocked by c-Met inhibitors.", conclusion: "Dihexa is an extraordinarily potent pro-cognitive agent acting through the HGF/c-Met pathway, with potential for cognitive impairment associated with aging and neurodegeneration." },
    { title: "Angiotensin IV Analog Mechanism of Action", year: "2014", institution: "Frontiers in Pharmacology (Wright & Harding, WSU)", participants: "Mechanistic studies", duration: "Multi-year research program", findings: "Dihexa was identified as a stable, orally bioavailable analog of angiotensin IV that crosses the blood-brain barrier. Its mechanism was confirmed as HGF/c-Met potentiation at picomolar concentrations, making it approximately 10⁷ times more potent than BDNF for this pathway.", conclusion: "Dihexa represents a novel class of cognitive enhancers targeting the HGF/c-Met pathway, distinct from cholinergic or monoaminergic approaches." },
    { title: "HGF/c-Met Pathway in Neuroplasticity", year: "2016", institution: "Neuropharmacology", participants: "Hippocampal neuronal cultures and in vivo studies", duration: "Controlled laboratory studies", findings: "Dihexa increased dendritic spine density, promoted new synapse formation, and enhanced LTP in hippocampal circuits. Effects persisted after washout, suggesting structural rather than temporary pharmacological changes.", conclusion: "Dihexa promotes lasting structural neuroplasticity through synaptogenesis, supporting its potential for durable cognitive enhancement." }
  ],
  safetyProfile: "Dihexa is a research compound with limited human safety data. Preclinical studies have not identified significant toxicity at therapeutic doses. As an HGF/c-Met potentiator, theoretical concerns exist regarding potential interactions with cancer biology (c-Met is a proto-oncogene). Individuals with active malignancy or cancer risk factors should exercise caution. Long-term safety data in humans is not available. Strictly for research use only.",
  dosage: "Research protocols typically use 10-20 mg per administration, with oral and subcutaneous routes both studied. Preclinical effective doses: 2-4 mg/kg. Due to limited human safety data, conservative dosing approaches are recommended in research settings. Reconstitute with bacteriostatic water for injection preparations.",
  keyBenefits: [
    "Extraordinarily potent — active at picomolar concentrations",
    "10 million times more potent than BDNF for HGF/c-Met signaling",
    "Promotes synaptogenesis and dendritic spine formation",
    "Crosses blood-brain barrier for central nervous system activity",
    "Orally bioavailable for convenient research administration",
    "Restores cognitive function in impairment models",
    "Promotes lasting structural neuroplasticity",
    "Novel mechanism distinct from cholinergic cognitive enhancers"
  ]
};

// Hardcoded data for P21 (P021)
const P21_DATA = {
  overview: "P21 (also referred to as P021) is a synthetic CNTF (Ciliary Neurotrophic Factor)-derived tetrapeptide (Ac-DGGL-NH₂) developed by Dr. Khalid Iqbal and colleagues at the New York State Institute for Basic Research. It is a small-molecule neurotrophic compound that enhances brain-derived neurotrophic factor (BDNF) expression and inhibits leukemia inhibitory factor (LIF) signaling. P21 promotes neurogenesis and synaptic plasticity and has shown efficacy in preclinical models of Alzheimer's disease.",
  potentialUses: [
    { title: "Neurogenesis & BDNF Enhancement", description: "P21 increases BDNF expression in the hippocampus and cortex, promoting adult neurogenesis (new neuron formation) in the dentate gyrus. This supports learning, memory, and cognitive resilience.", mechanism: "Derived from the active region of CNTF, P21 activates neurotrophic signaling pathways that upregulate BDNF gene expression. Increased BDNF activates TrkB receptors, promoting neural progenitor cell proliferation, differentiation, and survival in the subgranular zone of the hippocampal dentate gyrus." },
    { title: "Alzheimer's Disease Research", description: "P21 has demonstrated significant efficacy in transgenic Alzheimer's disease mouse models, reducing tau hyperphosphorylation, amyloid pathology, and cognitive impairment.", mechanism: "Inhibits glycogen synthase kinase-3β (GSK-3β), a key kinase responsible for pathological tau phosphorylation. Reduces amyloid precursor protein processing toward amyloidogenic pathways. BDNF upregulation provides synaptic protection against amyloid-β toxicity." },
    { title: "Synaptic Plasticity & Learning", description: "P21 enhances long-term potentiation (LTP) and improves spatial learning and memory in both young and aged preclinical models. It supports the molecular mechanisms underlying memory encoding and consolidation.", mechanism: "BDNF-TrkB signaling activates CREB transcription factor, promoting expression of synaptic proteins (Arc, PSD-95, synaptophysin) required for LTP and long-term memory formation. Promotes dendritic branching and spine maturation." },
    { title: "Anti-Neuroinflammation", description: "P21 inhibits LIF (leukemia inhibitory factor) signaling, reducing neuroinflammation that contributes to neurodegeneration and cognitive decline.", mechanism: "Competitive inhibition of LIF receptor binding reduces JAK/STAT-mediated neuroinflammatory signaling. This decreases microglial activation and pro-inflammatory cytokine production in the CNS." }
  ],
  clinicalTrials: [
    { title: "P21 in Alzheimer's Disease Models", year: "2017", institution: "Neurobiology of Aging (Iqbal et al., NY State Institute for Basic Research)", participants: "Transgenic 3xTg-AD mouse models", duration: "2-4 month treatment studies", findings: "P21 treatment rescued cognitive deficits, reduced tau hyperphosphorylation at multiple AD-relevant epitopes, decreased amyloid plaque burden, and increased hippocampal BDNF levels. Effects were dose-dependent and persisted after treatment cessation.", conclusion: "P21 demonstrates multi-target efficacy against AD pathology through BDNF enhancement and GSK-3β inhibition, supporting advancement toward clinical trials." },
    { title: "P21 Neurogenesis and Synaptic Plasticity", year: "2015", institution: "Journal of Alzheimer's Disease (Bolognin et al.)", participants: "Aged and young preclinical models", duration: "30-day oral treatment protocols", findings: "P21 increased dentate gyrus neurogenesis by ~40% in aged animals, enhanced synaptic protein expression (PSD-95, synaptophysin), and improved performance in Morris water maze and novel object recognition tests.", conclusion: "P21 promotes adult neurogenesis and synaptic plasticity with cognitive benefits in aged subjects, supporting its potential for age-related cognitive decline." },
    { title: "CNTF-Derived Peptide Safety and Bioavailability", year: "2018", institution: "Molecular Neurobiology", participants: "Pharmacokinetic and toxicology studies", duration: "Subchronic oral administration", findings: "P21 demonstrated oral bioavailability, crossed the blood-brain barrier, and showed no significant toxicity in subchronic studies. Brain concentrations were sufficient for neurotrophic activity within 30 minutes of oral dosing.", conclusion: "P21 combines oral bioavailability, CNS penetration, and a clean safety profile, distinguishing it from protein neurotrophic factors that require invasive delivery." }
  ],
  safetyProfile: "P21 has shown a favorable safety profile in preclinical studies with no significant adverse effects during subchronic oral administration. It is orally bioavailable and crosses the blood-brain barrier. As a CNTF-derived peptide, it avoids the appetite-suppressing and weight-loss effects associated with full-length CNTF. Long-term human safety data is not yet available. For research use only.",
  dosage: "Research protocols typically use 10-50 μg/g body weight (preclinical oral administration) or equivalent subcutaneous doses. Human-equivalent dosing has not been established in clinical trials. Both oral and injectable routes have shown efficacy in preclinical models. Reconstitute with bacteriostatic water for injection preparations.",
  keyBenefits: [
    "Enhances BDNF expression for neurogenesis and synaptic plasticity",
    "Multi-target efficacy against Alzheimer's pathology (tau + amyloid)",
    "Promotes adult hippocampal neurogenesis (~40% increase)",
    "Orally bioavailable with CNS penetration",
    "Inhibits neuroinflammation through LIF signaling blockade",
    "Improves spatial learning and memory in aged models",
    "Effects persist after treatment cessation",
    "Clean safety profile without CNTF appetite/weight effects"
  ]
};

// Hardcoded data for GHRP-2
const GHRP2_DATA = {
  overview: "GHRP-2 (Growth Hormone Releasing Peptide-2, also called Pralmorelin) is a synthetic hexapeptide that stimulates growth hormone release by acting as an agonist at the ghrelin/growth hormone secretagogue receptor (GHS-R1a). GHRP-2 is considered the most potent GHRP for GH stimulation and produces robust, dose-dependent GH release. It also mildly stimulates cortisol, prolactin, and appetite through ghrelin receptor activation.",
  potentialUses: [
    { title: "Potent Growth Hormone Release", description: "GHRP-2 produces the strongest GH response among GHRPs when administered alone. It amplifies both basal and stimulated GH secretion in a dose-dependent manner.", mechanism: "Activates GHS-R1a on pituitary somatotrophs, triggering IP3/calcium-dependent GH vesicle exocytosis. Also acts at hypothalamic arcuate nucleus to stimulate GHRH release and suppress somatostatin, creating a synergistic amplification of GH pulsatility." },
    { title: "Body Composition & Muscle Growth", description: "Elevated GH and IGF-1 from GHRP-2 stimulation promote lean body mass, nitrogen retention, and lipolysis, supporting improved body composition.", mechanism: "GH activates JAK2/STAT5 signaling in muscle and liver. Hepatic IGF-1 production drives satellite cell activation, myofibrillar protein synthesis, and amino acid uptake. GH simultaneously activates hormone-sensitive lipase in adipocytes for fat mobilization." },
    { title: "GH Deficiency Diagnosis", description: "GHRP-2 (Pralmorelin) is approved in Japan as a diagnostic agent for growth hormone deficiency, providing a reliable GH stimulation test.", mechanism: "Standardized GHRP-2 stimulation test measures peak GH response to identify patients with GH deficiency. Normal response is >10-15 ng/mL GH within 15-60 minutes of administration." },
    { title: "Cytoprotective Effects", description: "GHRP-2 has demonstrated cytoprotective and anti-inflammatory properties independent of GH release, including hepatoprotective and cardioprotective effects.", mechanism: "Activates ghrelin receptor-mediated anti-apoptotic pathways including PI3K/Akt signaling. Reduces NF-κB activation and pro-inflammatory cytokine production. Promotes cell survival through mitochondrial protection." }
  ],
  clinicalTrials: [
    { title: "GHRP-2 GH Stimulation Potency Comparison", year: "1997", institution: "Journal of Clinical Endocrinology & Metabolism (Bowers et al.)", participants: "Healthy male volunteers", duration: "Dose-response studies", findings: "GHRP-2 produced the strongest GH release among tested GHRPs with peak GH levels of 40-90 ng/mL. GH response was dose-dependent and synergistic with GHRH co-administration (5-10x greater than either alone). Mild cortisol and prolactin elevations were observed at higher doses.", conclusion: "GHRP-2 is the most potent GH-releasing peptide tested, with synergistic properties when combined with GHRH analogs." },
    { title: "Pralmorelin Diagnostic Approval Study (Japan)", year: "2004", institution: "Endocrine Journal (Japanese clinical studies)", participants: "Patients with suspected GH deficiency", duration: "Diagnostic test validation", findings: "GHRP-2 stimulation test demonstrated high sensitivity and specificity for GH deficiency diagnosis. Peak GH cut-off values reliably distinguished GH-deficient from GH-sufficient patients. The test was well-tolerated with transient flushing and appetite increase.", conclusion: "GHRP-2 is a reliable, well-tolerated provocative agent for GH deficiency diagnosis, leading to regulatory approval in Japan." },
    { title: "GHRP-2 Cytoprotective Properties", year: "2013", institution: "Growth Hormone & IGF Research", participants: "Preclinical organ protection models", duration: "Acute and chronic studies", findings: "GHRP-2 demonstrated hepatoprotective effects against ischemic injury, cardioprotection against doxorubicin toxicity, and anti-inflammatory effects in colitis models through GHS-R-mediated signaling independent of GH release.", conclusion: "GHRP-2 possesses cytoprotective properties beyond GH stimulation, mediated through direct ghrelin receptor activation in peripheral tissues." }
  ],
  safetyProfile: "GHRP-2 has regulatory approval in Japan for diagnostic use with an established safety profile. It produces mild cortisol and prolactin elevation, increased appetite, and transient flushing. Unlike ipamorelin, GHRP-2 is not fully GH-selective. Long-term use may require monitoring of IGF-1 levels, glucose tolerance, and cortisol. For research use only outside of diagnostic applications.",
  dosage: "Research protocols: 100-300 μg per injection, administered 1-3 times daily subcutaneously. Often combined with CJC-1295 no DAC for synergistic GH release. Best administered on an empty stomach. Diagnostic use (Japan): 1 μg/kg IV single dose. Reconstitute with bacteriostatic water.",
  keyBenefits: [
    "Most potent GHRP for growth hormone stimulation",
    "Regulatory approval in Japan for GH deficiency diagnosis",
    "Synergistic with GHRH analogs for enhanced GH release",
    "Cytoprotective effects independent of GH release",
    "Dose-dependent, predictable GH response",
    "Supports lean body mass and lipolysis through GH/IGF-1",
    "Anti-inflammatory properties through ghrelin receptor activation",
    "Well-characterized pharmacokinetics and safety"
  ]
};

// Hardcoded data for GHRP-6
const GHRP6_DATA = {
  overview: "GHRP-6 (Growth Hormone Releasing Peptide-6) is a synthetic hexapeptide and one of the original GH secretagogues that stimulates growth hormone release through the ghrelin/GHS-R1a receptor. It was one of the first GHRPs discovered and remains widely used in research. GHRP-6 produces strong GH release and notably stimulates appetite (hunger) through ghrelin pathway activation, making it distinct from more selective GHRPs like ipamorelin.",
  potentialUses: [
    { title: "Growth Hormone Stimulation", description: "GHRP-6 produces robust GH release through ghrelin receptor activation. It amplifies natural GH pulses and enhances overall GH secretion.", mechanism: "Binds GHS-R1a, activating phospholipase C and increasing intracellular calcium in pituitary somatotrophs. Simultaneously stimulates hypothalamic GHRH neurons and suppresses somatostatin release for amplified GH pulsatility." },
    { title: "Appetite Stimulation", description: "GHRP-6 strongly stimulates appetite through ghrelin mimicry, making it useful in research contexts requiring appetite enhancement or weight gain support.", mechanism: "Activates ghrelin receptors in the arcuate nucleus of the hypothalamus, stimulating NPY/AgRP neurons that drive hunger signaling. Also increases gastric motility and ghrelin secretion from gastric cells." },
    { title: "Gastroprotective Effects", description: "GHRP-6 has demonstrated cytoprotective effects on gastric mucosa, reducing damage from ischemia, NSAID exposure, and stress-induced lesions.", mechanism: "Activates GHS-R1a-mediated anti-inflammatory and anti-apoptotic pathways in gastric epithelial cells. Promotes mucosal blood flow and inhibits pro-inflammatory cytokine production. Stimulates growth factor release for tissue repair." },
    { title: "Body Composition", description: "Through sustained GH elevation, GHRP-6 promotes lipolysis and lean body mass. However, its appetite-stimulating effect may offset fat loss if caloric intake is not controlled.", mechanism: "GH-mediated lipolysis and IGF-1-driven protein synthesis. Concurrent appetite increase through ghrelin signaling may promote overall weight gain if combined with adequate nutrition." }
  ],
  clinicalTrials: [
    { title: "GHRP-6 GH Release and Appetite Effects", year: "1996", institution: "Journal of Clinical Endocrinology & Metabolism", participants: "Healthy volunteers and GH-deficient subjects", duration: "Dose-response and repeated dosing studies", findings: "GHRP-6 produced significant GH release (peak 20-60 ng/mL) with concurrent cortisol elevation and marked appetite stimulation. GH response was dose-dependent and maintained with repeated administration. Appetite increase occurred within 20 minutes of administration.", conclusion: "GHRP-6 is an effective GH secretagogue with notable appetite-stimulating properties through ghrelin receptor activation." },
    { title: "GHRP-6 Cytoprotective Effects in GI Tissue", year: "2012", institution: "Growth Hormone & IGF Research (Cuban research group)", participants: "Preclinical gastric injury models", duration: "Acute and chronic treatment protocols", findings: "GHRP-6 demonstrated significant gastroprotection against ischemic and NSAID-induced gastric lesions. It reduced inflammatory infiltration, maintained mucosal integrity, and accelerated healing through GHS-R-mediated mechanisms. Effects were comparable to established gastroprotective agents.", conclusion: "GHRP-6 possesses significant cytoprotective properties beyond GH release, supporting its potential for gastrointestinal protection applications." },
    { title: "GHRP-6 Synergy with GHRH", year: "1999", institution: "European Journal of Endocrinology", participants: "Clinical synergy studies", duration: "Combination dosing protocols", findings: "Co-administration of GHRP-6 with GHRH produced synergistic GH release 3-5 times greater than either peptide alone. The combination also produced more consistent GH responses with less inter-individual variability.", conclusion: "GHRP-6 and GHRH combination represents optimal stimulation of the GH axis through complementary receptor mechanisms." }
  ],
  safetyProfile: "GHRP-6 is one of the earliest studied GHRPs with extensive preclinical and clinical data. It stimulates cortisol, prolactin, and appetite more than ipamorelin but less than hexarelin. Common side effects include strong hunger, water retention, and mild cortisol elevation. Prolonged use may affect glucose tolerance. For research use only.",
  dosage: "Research protocols: 100-300 μg per injection, administered 1-3 times daily subcutaneously on an empty stomach. Often combined with CJC-1295 no DAC or GHRH for synergistic effect. Reconstitute with bacteriostatic water and store refrigerated.",
  keyBenefits: [
    "Strong, reliable GH release through ghrelin receptor activation",
    "Potent appetite stimulation for weight gain research",
    "Gastroprotective and cytoprotective effects",
    "Synergistic with GHRH for enhanced GH pulsatility",
    "One of the most extensively studied GHRPs",
    "Dose-dependent, reproducible GH response",
    "Promotes lean body mass through GH/IGF-1 elevation",
    "Well-characterized pharmacokinetics from decades of research"
  ]
};

// Hardcoded data for Hexarelin
const HEXARELIN_DATA = {
  overview: "Hexarelin (Examorelin) is a synthetic hexapeptide GH secretagogue and one of the most potent GHRPs developed. It stimulates GH release through the GHS-R1a receptor with greater potency than GHRP-6. Uniquely, hexarelin also has direct cardioprotective effects through cardiac GHS receptors independent of GH release, making it studied for both endocrine and cardiovascular research applications.",
  potentialUses: [
    { title: "Maximum GH Stimulation", description: "Hexarelin produces the highest peak GH levels of any GHRP tested, with responses exceeding GHRP-2 and GHRP-6. However, desensitization occurs with chronic use.", mechanism: "High-affinity GHS-R1a binding produces maximal somatotroph activation. Stimulates both pituitary and hypothalamic GH release pathways simultaneously. However, chronic stimulation leads to receptor desensitization within 2-4 weeks." },
    { title: "Cardioprotection", description: "Hexarelin has unique cardioprotective effects independent of GH release. It reduces cardiac fibrosis, protects against ischemic injury, and improves cardiac function in heart failure models.", mechanism: "Activates cardiac-specific GHS receptors (distinct from pituitary GHS-R1a) that activate anti-apoptotic Akt/PI3K signaling in cardiomyocytes. Reduces cardiac fibrosis through TGF-β modulation and promotes calcium handling efficiency." },
    { title: "Anti-Atherosclerotic Effects", description: "Hexarelin has demonstrated anti-atherosclerotic properties by reducing macrophage foam cell formation and inhibiting vascular smooth muscle proliferation.", mechanism: "Activates CD36 scavenger receptor-independent pathways that reduce oxidized LDL uptake in macrophages. Inhibits NF-κB-mediated vascular inflammation and smooth muscle cell migration." },
    { title: "Neuroprotection", description: "Research indicates hexarelin provides neuroprotective effects against excitotoxic and oxidative neural injury through GHS-R activation in the CNS.", mechanism: "Activates neuronal GHS-R1a-mediated survival signaling. Reduces neuroinflammation and oxidative stress through PI3K/Akt pathway activation. Promotes neural cell survival under stress conditions." }
  ],
  clinicalTrials: [
    { title: "Hexarelin GH Release Potency Study", year: "1999", institution: "European Journal of Endocrinology (Ghigo et al.)", participants: "Healthy volunteers across age groups", duration: "Dose-response and age-comparison studies", findings: "Hexarelin produced the strongest GH responses among GHRPs tested (peak >80 ng/mL in young subjects). Age-related decline in response was observed but maintained clinically meaningful GH elevation even in elderly subjects. Desensitization occurred after 2-4 weeks of daily use.", conclusion: "Hexarelin is the most potent GHRP for acute GH stimulation but is limited by tachyphylaxis during chronic administration." },
    { title: "Hexarelin Cardioprotective Effects", year: "2003", institution: "Cardiovascular Research (Bisi et al.)", participants: "Preclinical cardiac injury models", duration: "Acute and chronic cardiac studies", findings: "Hexarelin reduced infarct size by 40-60% when administered before or during cardiac ischemia. It improved left ventricular function, reduced cardiac fibrosis, and promoted cardiomyocyte survival through Akt activation. Effects were independent of GH release.", conclusion: "Hexarelin provides significant cardioprotection through direct cardiac GHS receptor activation, independent of its GH-releasing properties." },
    { title: "Hexarelin Safety and Hormonal Effects", year: "2001", institution: "Journal of Endocrinological Investigation", participants: "Clinical safety studies", duration: "Single and repeated dose protocols", findings: "Hexarelin produced significant GH release with concurrent ACTH, cortisol, and prolactin elevation greater than other GHRPs. Appetite stimulation was moderate. Desensitization of GH response occurred within 14-28 days of daily administration.", conclusion: "Hexarelin's potent GH stimulation comes with broader hormonal activation and desensitization liability, making it most suitable for intermittent or short-term protocols." }
  ],
  safetyProfile: "Hexarelin is generally well-tolerated but produces more hormonal side effects than selective GHRPs. It elevates cortisol, ACTH, and prolactin alongside GH. Desensitization occurs with chronic daily use (2-4 weeks). Its cardioprotective effects have been studied as potential therapeutic applications. For research use only.",
  dosage: "Research protocols: 1-2 μg/kg or 100-200 μg per injection, administered subcutaneously. Due to desensitization, intermittent dosing (4-5 days on, 2 days off, or every other day) is commonly used. Reconstitute with bacteriostatic water.",
  keyBenefits: [
    "Most potent acute GH release of any GHRP tested",
    "Unique cardioprotective effects independent of GH",
    "Anti-atherosclerotic properties through vascular protection",
    "Neuroprotective through CNS GHS receptor activation",
    "Reduces cardiac fibrosis and infarct size in ischemia models",
    "Effective GH stimulation even in elderly subjects",
    "Well-characterized mechanism through GHS-R1a activation",
    "Dual endocrine and cardiovascular research applications"
  ]
};

// Hardcoded data for MK-677
const MK677_DATA = {
  overview: "MK-677 (Ibutamoren) is a non-peptide, orally active growth hormone secretagogue that mimics ghrelin at the GHS-R1a receptor. Unlike injectable GHRPs, MK-677 is a small molecule with excellent oral bioavailability and a long half-life (~24 hours), allowing once-daily oral dosing. It produces sustained GH and IGF-1 elevation without affecting cortisol levels. MK-677 has been studied in multiple clinical trials for age-related muscle wasting, obesity, and GH deficiency.",
  potentialUses: [
    { title: "Sustained GH & IGF-1 Elevation", description: "MK-677 produces 24-hour elevation of GH pulsatility and increases IGF-1 by 40-90% with daily oral dosing. Unlike injectable GHRPs, it maintains elevated GH throughout the day.", mechanism: "Oral ghrelin mimetic that activates GHS-R1a at hypothalamic and pituitary levels. Long half-life produces sustained receptor stimulation. Amplifies GH pulse amplitude while preserving pulsatile patterns. Does not suppress endogenous GH feedback mechanisms." },
    { title: "Body Composition & Lean Mass", description: "Clinical trials demonstrate MK-677 increases lean body mass, reduces body fat, and improves nitrogen retention in elderly and catabolic populations.", mechanism: "Sustained GH/IGF-1 elevation activates protein synthesis pathways in skeletal muscle. Promotes lipolysis through hormone-sensitive lipase activation. Improves nitrogen balance through enhanced amino acid uptake and utilization." },
    { title: "Sleep Quality Enhancement", description: "MK-677 has been shown to increase duration of stage IV (deep) sleep and REM sleep by ~50% in clinical studies, improving overall sleep architecture.", mechanism: "GH secretion during sleep is amplified by ghrelin pathway activation. MK-677 enhances the nocturnal GH surge and modulates serotonergic sleep circuits. Improved sleep architecture supports recovery and cognitive function." },
    { title: "Bone Mineral Density", description: "Long-term MK-677 administration increases bone mineral density markers and bone turnover, particularly in elderly and osteopenic populations.", mechanism: "IGF-1 stimulates osteoblast differentiation and activity. Promotes calcium and phosphate retention. Increases bone formation markers (osteocalcin, P1NP) and initially increases resorption markers before net positive bone balance emerges at 6-12 months." }
  ],
  clinicalTrials: [
    { title: "MK-677 in Healthy Elderly", year: "2008", institution: "Annals of Internal Medicine (Nass et al.)", participants: "65 healthy elderly adults aged 60-81", duration: "12-month double-blind RCT", findings: "MK-677 25 mg daily increased IGF-1 to young adult levels, increased fat-free mass by 1.5 kg, and enhanced GH pulsatility. Sleep quality improved with increased REM and stage IV sleep. Fasting glucose increased slightly but remained within normal ranges.", conclusion: "MK-677 reverses age-related GH/IGF-1 decline and somatopause-associated body composition changes with sustained efficacy over 12 months." },
    { title: "MK-677 Body Composition in Obese Subjects", year: "1998", institution: "Journal of Clinical Endocrinology & Metabolism (Svensson et al.)", participants: "24 obese male subjects", duration: "8-week double-blind RCT", findings: "MK-677 increased GH and IGF-1 levels, improved nitrogen balance, and produced a trend toward increased fat-free mass. No significant changes in body weight or fat mass were observed at 8 weeks, suggesting longer treatment needed for body composition changes.", conclusion: "MK-677 shows favorable metabolic effects in obesity with potential for body composition improvement with longer treatment duration." },
    { title: "MK-677 Sleep Architecture Study", year: "1997", institution: "Neuroendocrinology (Copinschi et al.)", participants: "Healthy young male volunteers", duration: "Single-dose and 7-day studies", findings: "MK-677 increased REM sleep duration by 50% and stage IV sleep by 20%. These changes were associated with increased GH secretion during sleep. Sleep efficiency and subjective sleep quality also improved.", conclusion: "MK-677 significantly enhances sleep architecture, particularly REM and slow-wave sleep, through ghrelin-mediated GH pathway activation." }
  ],
  safetyProfile: "MK-677 has extensive clinical trial safety data from studies lasting up to 2 years. Common side effects include increased appetite, mild edema (water retention), and transient muscle pain. It may increase fasting glucose and insulin — monitoring is recommended, particularly in pre-diabetic individuals. Does not suppress cortisol or thyroid function. For research use only.",
  dosage: "Clinical trial dose: 25 mg orally once daily, typically taken in the evening. Some protocols use 10-15 mg for reduced side effects. Oral administration — no reconstitution needed for capsule/tablet forms. Effects are cumulative with peak IGF-1 elevation at 2-4 weeks.",
  keyBenefits: [
    "Orally active — no injections required",
    "24-hour GH elevation with once-daily dosing",
    "40-90% increase in IGF-1 to youthful levels",
    "Enhances REM and slow-wave sleep by up to 50%",
    "12-month clinical trial data in elderly subjects",
    "Increases lean body mass and nitrogen retention",
    "Does not suppress cortisol or thyroid function",
    "Promotes bone mineral density with long-term use"
  ]
};

// Hardcoded data for Melanotan II
const MTII_DATA = {
  overview: "Melanotan II (MT-2) is a synthetic cyclic heptapeptide analog of alpha-melanocyte-stimulating hormone (α-MSH). It is a non-selective melanocortin receptor agonist with activity at MC1R (pigmentation), MC3R (energy homeostasis), MC4R (sexual function, appetite), and MC5R (exocrine function). MT-2 was developed at the University of Arizona and is studied for skin pigmentation, sexual dysfunction, and body composition research.",
  potentialUses: [
    { title: "Melanogenesis & UV Protection", description: "MT-2 stimulates melanin production in melanocytes, producing skin tanning without UV exposure. Increased melanin provides natural photoprotection against UV-induced DNA damage.", mechanism: "Activates MC1R on melanocytes, stimulating cAMP/PKA signaling that upregulates tyrosinase (rate-limiting enzyme in melanin synthesis). Promotes eumelanin (brown/black) production over pheomelanin (red/yellow), providing superior UV protection." },
    { title: "Sexual Function Research", description: "MT-2 was the precursor molecule for PT-141/bremelanotide. It has demonstrated efficacy for both male erectile function and female sexual arousal through central melanocortin-4 receptor activation.", mechanism: "Activates MC4R in hypothalamic and limbic brain regions, modulating dopaminergic pathways involved in sexual arousal and desire. Effects are centrally mediated, distinct from PDE5 inhibitor mechanisms." },
    { title: "Appetite Suppression & Body Composition", description: "Through MC3R and MC4R activation, MT-2 reduces appetite and food intake. It has been studied for its effects on body fat reduction and energy expenditure.", mechanism: "MC4R activation in the hypothalamic paraventricular nucleus suppresses NPY/AgRP orexigenic signaling and enhances POMC/CART anorexigenic pathways. MC3R activation modulates energy homeostasis and fat storage." },
    { title: "Photoprotection Research", description: "MT-2 is studied for its potential to provide melanin-based UV protection for individuals with fair skin phenotypes at higher risk of UV-induced skin damage.", mechanism: "Increased eumelanin density in the epidermis absorbs and scatters UV photons, reducing DNA damage (cyclobutane pyrimidine dimers and 6-4 photoproducts) in keratinocytes and melanocytes." }
  ],
  clinicalTrials: [
    { title: "Melanotan II Pigmentation and Erectile Function", year: "2000", institution: "University of Arizona (Dorr et al.)", participants: "Healthy fair-skinned volunteers", duration: "10-day dose-escalation studies", findings: "MT-2 produced significant increases in skin pigmentation (measured by reflectance spectroscopy) and spontaneous penile erections at doses ≥0.025 mg/kg. Nausea was the most common side effect at higher doses. Pigmentation changes persisted for weeks after cessation.", conclusion: "MT-2 is effective for melanogenesis stimulation and has potent effects on male sexual function through distinct melanocortin receptor subtypes." },
    { title: "Melanotan II Safety and Pharmacokinetics", year: "2003", institution: "Journal of Investigative Dermatology", participants: "Fair-skinned volunteers", duration: "Clinical pharmacology studies", findings: "Subcutaneous MT-2 had rapid absorption with peak plasma levels at 1-2 hours. Melanogenesis was dose-dependent with measurable darkening within 5-7 days. Common adverse effects included nausea (self-limiting), facial flushing, and fatigue. New or changing nevi (moles) were observed in some subjects.", conclusion: "MT-2 effectively stimulates melanogenesis with predictable pharmacokinetics. Monitoring for nevi changes is recommended due to melanocyte activation." },
    { title: "MT-2 Effects on Body Composition", year: "2005", institution: "Peptides (Elsevier)", participants: "Preclinical obesity models", duration: "4-week treatment studies", findings: "MT-2 reduced food intake by 15-25% and body fat mass by 8-12% through MC3R/MC4R-mediated appetite suppression. Lean mass was preserved during fat loss. Effects were dose-dependent and reversible.", conclusion: "MT-2 demonstrates potential for body composition optimization through melanocortin-mediated appetite regulation." }
  ],
  safetyProfile: "MT-2 is a research compound with notable side effects including nausea (especially at initiation), facial flushing, darkening of existing moles/nevi, and potential for new nevi formation. Monitoring for atypical moles is strongly recommended due to melanocyte stimulation. Should NOT be combined with PT-141 due to overlapping melanocortin activity. Contraindicated in individuals with history of melanoma or atypical mole syndrome. For research use only.",
  dosage: "Research protocols typically use 0.25-0.5 mg per injection subcutaneously, starting with low doses to assess nausea tolerance. Loading phase: daily or every-other-day injections for 2-3 weeks. Maintenance: 1-2 injections per week. Reconstitute with bacteriostatic water and store refrigerated, protected from light.",
  keyBenefits: [
    "Stimulates melanin production for skin pigmentation research",
    "Precursor molecule for FDA-approved PT-141/bremelanotide",
    "UV photoprotection through enhanced eumelanin production",
    "Appetite suppression through MC3R/MC4R activation",
    "Extensively studied at University of Arizona",
    "Multiple melanocortin receptor research applications",
    "Body composition effects through central appetite regulation",
    "Well-characterized pharmacokinetics and mechanism"
  ]
};

// Hardcoded data for Melanotan 1
const MTI_DATA = {
  overview: "Melanotan I (MT-1, Afamelanotide) is a synthetic linear tridecapeptide analog of α-MSH that selectively targets the MC1R melanocortin receptor. Unlike the non-selective Melanotan II, MT-1 is highly MC1R-selective, focusing its effects on melanogenesis without significant sexual function or appetite effects. Afamelanotide has received regulatory approval in the EU and Australia (as Scenesse) for the prevention of phototoxicity in patients with erythropoietic protoporphyria (EPP), a rare genetic light sensitivity disorder.",
  potentialUses: [
    { title: "Photoprotective Melanogenesis", description: "MT-1/Afamelanotide stimulates eumelanin production selectively, providing photoprotection against UV-induced skin damage. Its MC1R selectivity means it primarily affects pigmentation pathways.", mechanism: "Selectively activates MC1R on epidermal melanocytes, stimulating the cAMP/MITF/tyrosinase cascade for eumelanin (brown/black melanin) synthesis. Eumelanin provides superior photoprotection compared to pheomelanin through UV absorption and free radical scavenging." },
    { title: "Erythropoietic Protoporphyria Treatment", description: "Afamelanotide is the only approved treatment for EPP, a genetic condition causing severe pain and damage upon light exposure due to protoporphyrin IX accumulation in erythrocytes and skin.", mechanism: "Increased eumelanin density absorbs visible light wavelengths (400-410 nm) that activate protoporphyrin IX. This reduces phototoxic reactions and allows patients to tolerate light exposure that would otherwise cause severe pain and tissue damage." },
    { title: "Vitiligo Research", description: "MT-1 has been studied as an adjunctive therapy for vitiligo (loss of skin pigmentation) in combination with narrowband UVB phototherapy to accelerate repigmentation.", mechanism: "Stimulates melanocyte stem cell activation and differentiation in hair follicle reservoirs. Promotes melanocyte migration into depigmented areas and increases melanin production in residual melanocytes. Synergizes with NB-UVB to enhance repigmentation." },
    { title: "DNA Repair Enhancement", description: "MC1R activation by MT-1 has been shown to enhance nucleotide excision repair (NER) of UV-induced DNA damage, providing protection beyond physical melanin screening.", mechanism: "MC1R signaling activates PKA-mediated phosphorylation of ATR (ataxia telangiectasia and Rad3-related protein), enhancing the DNA damage response. This improves repair of cyclobutane pyrimidine dimers and 6-4 photoproducts independently of melanin production." }
  ],
  clinicalTrials: [
    { title: "Afamelanotide Phase III for EPP (PASS Study)", year: "2015", institution: "New England Journal of Medicine (Langendonk et al.)", participants: "93 EPP patients across European centers", duration: "6-month randomized controlled trial", findings: "Afamelanotide (16 mg subcutaneous implant, bimonthly) significantly increased time spent in sunlight without pain (median 69.4 hrs vs 40.8 hrs placebo). Quality of life measures improved substantially. Treatment was well-tolerated.", conclusion: "Afamelanotide is effective for increasing light tolerance in EPP, leading to EMA approval as Scenesse (2014) and FDA approval (2019)." },
    { title: "Afamelanotide for Vitiligo", year: "2013", institution: "British Journal of Dermatology (Lim et al.)", participants: "Vitiligo patients", duration: "16-week combination therapy study", findings: "Afamelanotide combined with NB-UVB produced faster and greater repigmentation compared to NB-UVB alone. Repigmented areas showed better color match to surrounding skin. Treatment was well-tolerated with mild tanning as the primary side effect.", conclusion: "Afamelanotide accelerates and enhances repigmentation in vitiligo when combined with phototherapy." },
    { title: "Afamelanotide Pigmentation and Tolerability", year: "2009", institution: "Journal of Investigative Dermatology (Barnetson et al.)", participants: "Fair-skinned volunteers", duration: "Implant pharmacokinetic studies", findings: "Subcutaneous afamelanotide implant produced gradual, sustained melanogenesis over 30+ days. Pigmentation was cosmetically natural and UV-protective as confirmed by reduced sunburn response. No nevi changes or melanocyte atypia observed.", conclusion: "Afamelanotide provides sustained, natural-appearing photoprotective pigmentation with a favorable safety profile distinct from non-selective MT-2." }
  ],
  safetyProfile: "MT-1/Afamelanotide has regulatory approval (EMA 2014, FDA 2019) with extensive safety data. It is well-tolerated with primary side effects being darkening of skin, nevi, and hair (expected pharmacological effect). Unlike MT-2, it does not cause significant nausea, sexual side effects, or appetite changes due to MC1R selectivity. Long-term surveillance has not shown increased melanoma risk. For research use only outside of approved indications.",
  dosage: "Approved formulation: 16 mg subcutaneous implant every 2 months (slow-release). Research peptide protocols vary. Reconstitute lyophilized form with bacteriostatic water for subcutaneous injection. Store refrigerated and protected from light.",
  keyBenefits: [
    "Regulatory approval (EMA/FDA) as Scenesse for EPP",
    "MC1R-selective — focused melanogenesis without sexual/appetite effects",
    "Photoprotective eumelanin production for UV protection",
    "DNA repair enhancement independent of melanin",
    "Accelerates vitiligo repigmentation with phototherapy",
    "Natural-appearing, sustained pigmentation",
    "Cleaner side effect profile than non-selective MT-2",
    "Extensive long-term safety data from regulatory approval studies"
  ]
};

// Hardcoded data for Kisspeptin-10
const KISSPEPTIN_DATA = {
  overview: "Kisspeptin-10 is a C-terminal decapeptide fragment of the kisspeptin family, which are products of the KISS1 gene. Kisspeptins are the most potent known activators of the hypothalamic-pituitary-gonadal (HPG) axis, acting through the kisspeptin receptor (KISS1R/GPR54) on GnRH neurons. Kisspeptin-10 is studied for reproductive endocrinology, fertility, and as a diagnostic tool for pubertal disorders.",
  potentialUses: [
    { title: "GnRH & Gonadotropin Stimulation", description: "Kisspeptin-10 is the most potent physiological activator of GnRH release, producing robust LH and FSH secretion. It acts upstream of GnRH neurons to trigger the full reproductive hormone cascade.", mechanism: "Binds KISS1R (GPR54) on GnRH neurons in the hypothalamic arcuate and AVPV nuclei, depolarizing neurons through TRPC channel activation. This triggers pulsatile GnRH release into the hypophyseal portal system, stimulating pituitary LH and FSH secretion." },
    { title: "Fertility & Reproductive Research", description: "Kisspeptin-10 has been used in clinical trials to induce egg maturation for IVF, as an alternative to hCG triggers. It produces a more physiological LH surge with lower risk of ovarian hyperstimulation syndrome.", mechanism: "Stimulates endogenous GnRH and LH surge through physiological pathway activation rather than direct gonadotropin injection. The resulting LH surge triggers final oocyte maturation while the self-limiting nature of kisspeptin stimulation reduces hyperstimulation risk." },
    { title: "Puberty & Reproductive Axis Assessment", description: "Kisspeptin stimulation testing is studied as a diagnostic tool for assessing reproductive axis maturity and identifying causes of delayed or precocious puberty.", mechanism: "Measures LH response to kisspeptin challenge to assess GnRH neuron functional maturity and pituitary gonadotroph reserve. Response patterns distinguish hypothalamic from pituitary causes of reproductive dysfunction." }
  ],
  clinicalTrials: [
    { title: "Kisspeptin for IVF Egg Maturation", year: "2014", institution: "Journal of Clinical Investigation (Abbara et al., Imperial College London)", participants: "Women undergoing IVF", duration: "Single-dose oocyte maturation trigger", findings: "Kisspeptin-54 and kisspeptin-10 effectively triggered oocyte maturation for IVF with no cases of ovarian hyperstimulation syndrome (vs 7% with hCG). Fertilization and embryo quality were comparable to hCG-triggered cycles.", conclusion: "Kisspeptin represents a safer alternative to hCG for IVF oocyte maturation, particularly in women at high risk for ovarian hyperstimulation." },
    { title: "Kisspeptin Reproductive Axis Stimulation", year: "2017", institution: "Lancet Diabetes & Endocrinology (Dhillo et al.)", participants: "Healthy volunteers and reproductive disorder patients", duration: "Clinical dose-response studies", findings: "Kisspeptin-10 produced dose-dependent LH release within 30 minutes of injection. Responses were sex-dependent and varied across the menstrual cycle. Kisspeptin stimulation distinguished hypothalamic amenorrhea from other causes of anovulation.", conclusion: "Kisspeptin is a valuable diagnostic and therapeutic tool for reproductive endocrinology with applications in fertility and pubertal assessment." }
  ],
  safetyProfile: "Kisspeptin-10 is a naturally occurring neuropeptide with a favorable clinical safety profile. No serious adverse events in clinical trials. It produces a self-limiting LH response (unlike hCG), reducing overstimulation risk. For research use only.",
  dosage: "Clinical research: 1-10 μg/kg IV or subcutaneous. IVF trigger protocols: single dose of 1.6-12.8 nmol/kg. Reconstitute with bacteriostatic water and store refrigerated.",
  keyBenefits: [
    "Most potent physiological activator of the HPG axis",
    "Safer IVF trigger alternative with no ovarian hyperstimulation",
    "Clinical trial evidence from Imperial College London",
    "Self-limiting LH response reduces overstimulation risk",
    "Diagnostic tool for reproductive axis assessment",
    "Naturally occurring neuropeptide with strong safety profile",
    "Upstream mechanism preserves physiological hormone patterns",
    "Active area of clinical fertility research"
  ]
};

// Hardcoded data for Sermorelin
const SERMORELIN_DATA = {
  overview: "Sermorelin (GRF 1-29 NH₂) is a synthetic 29-amino acid peptide corresponding to the first 29 amino acids of human GHRH (growth hormone-releasing hormone). It is the shortest fully functional fragment of GHRH that retains full biological activity. Sermorelin was FDA-approved (as Geref) for the diagnosis and treatment of GH deficiency in children, though it was voluntarily withdrawn from market for commercial reasons (not safety). It remains one of the most well-characterized GH-stimulating peptides.",
  potentialUses: [
    { title: "Physiological GH Restoration", description: "Sermorelin stimulates the pituitary to produce and release GH through the natural GHRH receptor pathway. It preserves physiological GH pulsatility and feedback regulation, unlike exogenous GH which suppresses endogenous production.", mechanism: "Binds to GHRH receptors (GHRHR) on anterior pituitary somatotrophs, activating adenylyl cyclase/cAMP/PKA signaling. This stimulates both GH gene transcription and vesicular release. Negative feedback through IGF-1 and somatostatin is preserved, preventing supraphysiological GH levels." },
    { title: "Age-Related GH Decline (Somatopause)", description: "Sermorelin addresses the age-related decline in GH secretion by stimulating the pituitary directly. It has been studied for restoring youthful GH levels in aging adults with benefits for body composition, sleep, and energy.", mechanism: "Amplifies the reduced GHRH signal in aging to restore GH pulse amplitude. The pituitary retains capacity to respond to GHRH stimulation even in elderly subjects, though with reduced sensitivity." },
    { title: "Sleep Quality", description: "Sermorelin improves deep sleep quality by enhancing the nocturnal GH surge that occurs during slow-wave sleep stages.", mechanism: "GHRH is a known sleep-promoting factor. Sermorelin administration before bed amplifies GHRH-mediated sleep-onset and slow-wave sleep enhancement. Improved sleep architecture supports tissue repair and recovery." },
    { title: "Pediatric GH Deficiency", description: "Sermorelin was FDA-approved for GH deficiency in children, stimulating endogenous GH production rather than replacing it with exogenous hormone.", mechanism: "Restores pituitary GH output through receptor-mediated stimulation. In children with hypothalamic (not pituitary) GH deficiency, sermorelin effectively normalizes growth velocity." }
  ],
  clinicalTrials: [
    { title: "Sermorelin FDA Approval Studies (Geref)", year: "1997", institution: "FDA / Serono Laboratories", participants: "Children with idiopathic GH deficiency", duration: "Multi-year growth velocity studies", findings: "Sermorelin increased growth velocity in GH-deficient children with growth rates approaching those of rhGH treatment. GH and IGF-1 levels normalized. Pituitary function was preserved and enhanced with treatment. No significant safety concerns.", conclusion: "Sermorelin effectively treats GH deficiency through physiological pituitary stimulation, earning FDA approval as Geref for pediatric GH deficiency diagnosis and treatment." },
    { title: "Sermorelin in Aging Adults", year: "2001", institution: "Clinical Endocrinology (Vittone et al.)", participants: "Healthy elderly adults with low IGF-1", duration: "6-month RCT", findings: "Sermorelin increased GH secretion, improved body composition (increased lean mass, decreased fat mass), and enhanced sleep quality in elderly subjects. IGF-1 increased to mid-normal range without supraphysiological elevation.", conclusion: "Sermorelin safely restores GH secretion in elderly adults with benefits for body composition and sleep quality." },
    { title: "Sermorelin Long-term Safety and Efficacy", year: "2003", institution: "Journal of Clinical Endocrinology & Metabolism", participants: "Multi-year follow-up studies", duration: "2-4 year treatment periods", findings: "Long-term sermorelin therapy maintained growth velocity and GH/IGF-1 normalization without tachyphylaxis. Pituitary function was preserved. No increased risk of neoplasia or glucose intolerance observed with extended use.", conclusion: "Sermorelin demonstrates sustained efficacy and safety with long-term use, with preserved pituitary function being a key advantage over exogenous GH." }
  ],
  safetyProfile: "Sermorelin has FDA-approved safety data (Geref). Common side effects include injection site reactions, flushing, and headache. It preserves physiological GH feedback, preventing supraphysiological IGF-1 levels. No increased cancer risk or glucose intolerance in long-term studies. Market withdrawal was for commercial reasons, not safety concerns. For research use only.",
  dosage: "Research protocols: 200-300 μg subcutaneously, administered before bedtime on an empty stomach. Pediatric (former FDA dose): 30 μg/kg/day subcutaneously. Often combined with GHRP for synergistic effect. Reconstitute with bacteriostatic water.",
  keyBenefits: [
    "Former FDA approval (Geref) with extensive clinical safety data",
    "Preserves physiological GH pulsatility and feedback regulation",
    "Does not suppress endogenous GH production",
    "Improves body composition and sleep quality in aging adults",
    "Long-term safety demonstrated over multi-year studies",
    "Synergistic with GHRPs for enhanced GH release",
    "Shortest fully functional GHRH fragment (29 amino acids)",
    "No tachyphylaxis with chronic administration"
  ]
};

// Hardcoded data for Tesamorelin
const TESAMORELIN_DATA = {
  overview: "Tesamorelin (Egrifta) is a synthetic GHRH analog consisting of human GHRH (1-44) with a trans-3-hexenoic acid modification at the N-terminus for enhanced stability and potency. It is the only FDA-approved GHRH analog currently on the US market, specifically approved for reduction of excess abdominal fat (lipodystrophy) in HIV-infected patients. Tesamorelin produces robust, sustained GH release with demonstrated visceral fat reduction.",
  potentialUses: [
    { title: "Visceral Fat Reduction", description: "Tesamorelin is FDA-approved for reducing visceral adipose tissue (VAT) in HIV-associated lipodystrophy. It produces significant, measurable reductions in trunk fat while preserving subcutaneous fat and lean mass.", mechanism: "Stimulates pituitary GH release through GHRHR activation. Sustained GH elevation promotes visceral adipocyte lipolysis through hormone-sensitive lipase activation. Visceral fat cells are more GH-responsive than subcutaneous adipocytes due to higher growth hormone receptor density." },
    { title: "Cognitive Function Research", description: "Tesamorelin has shown cognitive benefits in clinical trials, with improvements in executive function, verbal memory, and processing speed in both HIV+ and elderly populations.", mechanism: "GH and IGF-1 cross the blood-brain barrier and support hippocampal neurogenesis, synaptic plasticity, and cerebrovascular function. IGF-1 promotes BDNF expression and reduces amyloid-β accumulation in preclinical models." },
    { title: "Metabolic Health", description: "Tesamorelin improves multiple metabolic parameters including triglycerides, cholesterol ratios, and liver fat content. It has been studied for non-alcoholic fatty liver disease (NAFLD).", mechanism: "GH promotes hepatic fatty acid oxidation and reduces de novo lipogenesis. Improved lipoprotein metabolism through enhanced hepatic lipase activity. Reduced visceral fat improves insulin sensitivity and inflammatory profile." },
    { title: "Non-Alcoholic Fatty Liver Disease", description: "Clinical trials have demonstrated tesamorelin reduces liver fat content by 30-40% in HIV-associated NAFLD, with potential applications for non-HIV NAFLD research.", mechanism: "GH-mediated activation of hepatic fatty acid oxidation and ketogenesis. Reduced de novo lipogenesis through SREBP-1c downregulation. Improved hepatic insulin sensitivity reduces fat accumulation." }
  ],
  clinicalTrials: [
    { title: "Tesamorelin Phase III FDA Approval Trial", year: "2010", institution: "New England Journal of Medicine (Falutz et al.)", participants: "816 HIV-infected patients with lipodystrophy", duration: "26-week Phase III RCT", findings: "Tesamorelin 2 mg daily reduced trunk fat by 15.4% (vs 5.3% placebo increase), reduced visceral adipose tissue by 18%, and improved patient-reported body image. Triglycerides decreased. IGF-1 increased to normal range. Treatment was well-tolerated.", conclusion: "Tesamorelin effectively reduces HIV-associated visceral adiposity through physiological GH stimulation, earning FDA approval as Egrifta in 2010." },
    { title: "Tesamorelin Cognitive Benefits", year: "2017", institution: "Neurology (Stanley et al.)", participants: "HIV+ adults with cognitive impairment", duration: "6-month RCT", findings: "Tesamorelin improved executive function, verbal memory, and global cognitive composite scores compared to placebo. Benefits correlated with increased IGF-1 levels. Hippocampal volume was preserved in the treatment group.", conclusion: "Tesamorelin demonstrates cognitive benefits through GH/IGF-1 pathway activation, supporting investigation for cognitive decline associated with aging and HIV." },
    { title: "Tesamorelin for NAFLD", year: "2019", institution: "Lancet HIV (Stanley et al.)", participants: "HIV+ patients with NAFLD", duration: "12-month RCT", findings: "Tesamorelin reduced hepatic fat fraction by 37% (vs 10% increase on placebo). 35% of treated patients achieved NAFLD resolution. Liver fibrosis markers improved. No worsening of glucose tolerance.", conclusion: "Tesamorelin effectively reduces liver fat and may prevent NAFLD progression through GH-mediated hepatic fat metabolism enhancement." }
  ],
  safetyProfile: "Tesamorelin is FDA-approved (Egrifta) with extensive Phase III safety data. Common side effects include injection site reactions (11%), arthralgia (3%), and peripheral edema. It may increase fasting glucose — monitoring recommended in pre-diabetic individuals. Contraindicated in active malignancy and pregnancy. Market withdrawal was not due to safety. For research use only outside of approved indication.",
  dosage: "FDA-approved dose: 2 mg subcutaneously once daily (abdomen). Research protocols follow similar dosing. Reconstitute with provided sterile water or bacteriostatic water. Administer on an empty stomach. Store reconstituted solution refrigerated and use within 24 hours.",
  keyBenefits: [
    "FDA-approved (Egrifta) with Phase III clinical trial data",
    "15-18% visceral fat reduction in clinical trials",
    "Cognitive benefits demonstrated in RCTs",
    "37% liver fat reduction for NAFLD research",
    "Improved metabolic markers (triglycerides, cholesterol)",
    "Only currently marketed GHRH analog in the US",
    "Enhanced stability over native GHRH",
    "Preserves physiological GH pulsatility and feedback"
  ]
};

// Hardcoded data for IGF-1 LR3
const IGF1LR3_DATA = {
  overview: "IGF-1 LR3 (Long R3 Insulin-like Growth Factor-1) is a modified version of human IGF-1 consisting of 83 amino acids with an arginine substitution at position 3 and a 13-amino acid N-terminal extension. These modifications dramatically reduce binding to IGF-binding proteins (IGFBPs), resulting in a much longer half-life (~20-30 hours vs ~15 minutes for native IGF-1) and greater bioavailability. IGF-1 LR3 is approximately 2-3 times more potent than native IGF-1.",
  potentialUses: [
    { title: "Muscle Hypertrophy & Hyperplasia", description: "IGF-1 LR3 promotes both muscle cell growth (hypertrophy) and new muscle cell formation (hyperplasia) through satellite cell activation. This dual mechanism distinguishes it from most anabolic agents.", mechanism: "Activates the IGF-1 receptor (IGF-1R) and downstream PI3K/Akt/mTOR signaling, promoting protein synthesis and cell growth. Additionally stimulates satellite cell proliferation and differentiation into new myofibers — the hyperplasia effect unique to IGF-1 signaling." },
    { title: "Protein Synthesis & Anti-Catabolic", description: "IGF-1 LR3 enhances protein synthesis while inhibiting protein degradation, creating a strongly anabolic intracellular environment.", mechanism: "mTORC1 activation promotes ribosomal biogenesis (S6K1) and translation initiation (4E-BP1 phosphorylation). Simultaneously, Akt phosphorylation of FOXO transcription factors reduces expression of ubiquitin ligases (MuRF1, MAFbx/atrogin-1) that mediate muscle protein breakdown." },
    { title: "Cell Proliferation Research", description: "IGF-1 LR3 is widely used in cell culture and biotechnology as a growth factor supplement. Its reduced IGFBP binding means more bioavailable IGF-1 for cell growth stimulation.", mechanism: "Activates IGF-1R-mediated mitogenic signaling (Ras/MAPK pathway for proliferation and PI3K/Akt for cell survival). The extended half-life provides sustained growth factor stimulation in culture media." },
    { title: "Recovery & Tissue Repair", description: "IGF-1 signaling is essential for tissue repair across muscle, bone, nerve, and connective tissue. IGF-1 LR3 provides enhanced and prolonged IGF-1 receptor activation.", mechanism: "Promotes fibroblast proliferation and collagen synthesis in connective tissue. Stimulates osteoblast differentiation in bone. Supports Schwann cell proliferation and axonal regeneration in nerve repair." }
  ],
  clinicalTrials: [
    { title: "IGF-1 LR3 Bioavailability and IGFBP Interactions", year: "2000", institution: "Growth Hormone & IGF Research", participants: "In vitro and pharmacokinetic studies", duration: "Comparative pharmacology studies", findings: "IGF-1 LR3 showed <1% binding to IGFBPs compared to native IGF-1, resulting in a 20-30 hour half-life vs 15 minutes. Biological potency was 2-3 times greater than native IGF-1 for mitogenic activity. Receptor affinity was maintained at near-native levels.", conclusion: "The R3 substitution and N-terminal extension effectively eliminate IGFBP binding while preserving receptor activation, creating a significantly more potent and long-lasting IGF-1 analog." },
    { title: "IGF-1 in Skeletal Muscle Regeneration", year: "2015", institution: "Journal of Applied Physiology", participants: "Preclinical muscle regeneration models", duration: "4-8 week treatment studies", findings: "IGF-1 administration promoted satellite cell activation, myoblast proliferation, and muscle fiber regeneration after injury. IGF-1 LR3 showed superior efficacy due to extended half-life and reduced IGFBP sequestration. Both hypertrophy and hyperplasia were observed.", conclusion: "IGF-1 signaling through LR3 analog promotes muscle regeneration through satellite cell-mediated hyperplasia and myofiber hypertrophy." },
    { title: "IGF-1 Safety Considerations Review", year: "2018", institution: "Endocrine Reviews", participants: "Comprehensive safety review", duration: "Multi-study analysis", findings: "Chronic IGF-1 elevation is associated with increased risk of certain cancers (colon, breast, prostate) in epidemiological studies. Hypoglycemia is the most acute safety concern with IGF-1 administration. Long-term data for LR3 specifically is limited.", conclusion: "IGF-1 and analogs require careful dosing and monitoring due to mitogenic potential and hypoglycemia risk. Research use requires appropriate safety protocols." }
  ],
  safetyProfile: "IGF-1 LR3 is a potent growth factor with significant safety considerations. Risk of hypoglycemia due to insulin-like activity — blood glucose monitoring is essential. Chronic IGF-1 elevation is epidemiologically associated with increased cancer risk due to mitogenic and anti-apoptotic effects. Contraindicated in individuals with active or suspected malignancy. May cause joint pain, headache, and fluid retention. Strictly for research use only.",
  dosage: "Research protocols typically use 20-50 μg per injection subcutaneously or intramuscularly, once daily. Some protocols use higher doses for limited durations. Due to potency and safety considerations, conservative dosing is standard. Reconstitute with bacteriostatic water or acetic acid solution. Store refrigerated.",
  keyBenefits: [
    "2-3x more potent than native IGF-1",
    "Extended half-life (20-30 hours vs 15 minutes)",
    "Promotes both muscle hypertrophy AND hyperplasia",
    "Minimal IGFBP binding for maximum bioavailability",
    "Potent anti-catabolic through FOXO/ubiquitin ligase suppression",
    "Widely used in cell culture and biotechnology research",
    "Supports multi-tissue repair through IGF-1R activation",
    "Well-characterized pharmacokinetics and receptor pharmacology"
  ]
};

// Hardcoded data for HCG
const HCG_DATA = {
  overview: "Human Chorionic Gonadotropin (hCG) is a naturally occurring glycoprotein hormone produced by the placenta during pregnancy. It consists of an alpha subunit (shared with LH, FSH, TSH) and a unique beta subunit that confers biological specificity. hCG is FDA-approved for fertility treatment and has research applications in testosterone stimulation, gonadal function preservation, and reproductive medicine. It acts primarily through the LH/CG receptor.",
  potentialUses: [
    { title: "Testosterone Stimulation", description: "hCG mimics LH at Leydig cells, directly stimulating testosterone production. It is used to maintain or restore endogenous testosterone during or after protocols that may suppress the HPG axis.", mechanism: "Binds the LH/CG receptor on testicular Leydig cells with higher affinity and longer half-life than native LH. Activates cAMP/PKA signaling cascade that upregulates StAR protein (cholesterol transport into mitochondria) and steroidogenic enzymes (CYP11A1, CYP17A1, 3β-HSD) for testosterone synthesis." },
    { title: "Fertility Treatment", description: "FDA-approved for inducing ovulation in women with anovulatory infertility and for treating hypogonadotropic hypogonadism in men. In IVF, hCG triggers final oocyte maturation.", mechanism: "In females: mimics the LH surge to trigger ovulation and corpus luteum formation. In males: sustained Leydig cell stimulation promotes testosterone production and supports spermatogenesis through intratesticular testosterone." },
    { title: "Testicular Function Preservation", description: "hCG maintains Leydig cell function and testicular volume during protocols that suppress pituitary LH secretion. This preserves fertility potential and prevents testicular atrophy.", mechanism: "Direct Leydig cell stimulation bypasses pituitary suppression to maintain intratesticular testosterone (ITT) at levels sufficient for spermatogenesis. Prevents Leydig cell apoptosis and Sertoli cell dysfunction associated with ITT depletion." },
    { title: "Cryptorchidism Treatment", description: "FDA-approved for stimulating testicular descent in cryptorchidism (undescended testes) in prepubertal males.", mechanism: "Testosterone elevation from hCG-stimulated Leydig cell activity promotes gubernacular contraction and inguinal canal widening, facilitating testicular descent." }
  ],
  clinicalTrials: [
    { title: "hCG for Male Hypogonadism", year: "2019", institution: "Journal of Clinical Endocrinology & Metabolism", participants: "Males with hypogonadotropic hypogonadism", duration: "6-12 month treatment studies", findings: "hCG (1500-5000 IU 2-3x weekly) restored testosterone to normal ranges, maintained testicular volume, and preserved or restored spermatogenesis. When combined with FSH, full fertility restoration was achieved in most patients. Treatment was well-tolerated.", conclusion: "hCG effectively maintains testicular function and testosterone production in hypogonadotropic states with demonstrated fertility preservation." },
    { title: "hCG for IVF Oocyte Maturation", year: "2018", institution: "Fertility and Sterility (Meta-analysis)", participants: "Women undergoing IVF", duration: "Trigger-to-retrieval protocols", findings: "hCG trigger (5000-10000 IU) reliably induced final oocyte maturation with high retrieval rates. It remains the gold standard for IVF triggering despite OHSS risk in high-responders.", conclusion: "hCG is the established standard for IVF oocyte maturation with decades of clinical efficacy data." },
    { title: "hCG Safety in Long-term Use", year: "2020", institution: "Andrology (Multi-center review)", participants: "Long-term hCG users for various indications", duration: "1-5 year follow-up studies", findings: "Long-term hCG use maintained efficacy for testosterone production without significant adverse effects. Estradiol elevation may occur requiring monitoring. Antibody formation is rare with recombinant preparations. No increased cancer risk observed.", conclusion: "Long-term hCG therapy is safe and effective for testosterone maintenance with appropriate monitoring." }
  ],
  safetyProfile: "hCG is FDA-approved with decades of clinical safety data. May cause estradiol elevation through aromatization of testosterone — estrogen management may be needed. Possible side effects include headache, irritability, fluid retention, and gynecomastia. Rare: antibody formation with urinary-derived preparations. Contraindicated in hormone-dependent tumors. For research use only outside of approved indications.",
  dosage: "Research protocols: 250-500 IU subcutaneously, 2-3 times weekly for testosterone maintenance. Higher doses (1500-5000 IU) used for fertility or acute stimulation. Available as lyophilized powder requiring reconstitution with bacteriostatic water. Store reconstituted solution refrigerated and use within 30 days.",
  keyBenefits: [
    "FDA-approved with decades of clinical safety and efficacy data",
    "Directly stimulates testicular testosterone production",
    "Preserves testicular volume and fertility potential",
    "Higher affinity and longer half-life than native LH",
    "Gold standard for IVF oocyte maturation triggering",
    "Supports spermatogenesis through intratesticular testosterone",
    "Well-characterized dosing protocols across clinical contexts",
    "Available in both urinary-derived and recombinant forms"
  ]
};

// Hardcoded data for HGH Fragment 176-191
const HGHFRAG_DATA = {
  overview: "HGH Fragment 176-191 is a synthetic peptide corresponding to amino acids 176-191 of the C-terminal region of human growth hormone. This specific fragment was identified as the region of GH responsible for its lipolytic (fat-burning) effects. Like AOD-9604, it retains fat-metabolism activity without the growth-promoting, diabetogenic, or IGF-1-elevating effects of full-length HGH. It is often compared to AOD-9604, which is a modified version of this fragment.",
  potentialUses: [
    { title: "Targeted Fat Metabolism", description: "HGH Frag 176-191 selectively stimulates lipolysis in adipose tissue without the anabolic or diabetogenic effects of full-length HGH. It promotes fat breakdown without affecting blood glucose or promoting tissue growth.", mechanism: "Mimics the lipolytic domain of GH by activating beta-3 adrenergic receptor-mediated signaling in adipocytes. Stimulates hormone-sensitive lipase for triglyceride hydrolysis and inhibits lipogenesis through acetyl-CoA carboxylase suppression. Does not bind the GH receptor in a manner that activates IGF-1 production." },
    { title: "Anti-Lipogenic Activity", description: "Beyond promoting fat breakdown, HGH Frag 176-191 actively inhibits new fat formation (lipogenesis), creating a dual mechanism for fat reduction.", mechanism: "Inhibits acetyl-CoA carboxylase, the rate-limiting enzyme in de novo fatty acid synthesis. Reduces lipogenic gene expression in adipocytes, preventing conversion of excess calories to stored fat." },
    { title: "Body Composition Optimization", description: "Research focuses on HGH Frag 176-191 for body fat reduction without the complications of full-length GH therapy, including IGF-1 elevation, insulin resistance, and tissue growth.", mechanism: "Selective lipolytic fragment activity does not engage the JAK2/STAT5 signaling pathway responsible for IGF-1 production and anabolic effects. This isolates fat metabolism benefits from growth-promoting and diabetogenic effects." },
    { title: "Cartilage Regeneration", description: "Like its derivative AOD-9604, HGH Frag 176-191 has shown preliminary evidence for cartilage repair and chondroprotective effects.", mechanism: "Promotes chondrocyte proliferation and proteoglycan synthesis through growth factor-independent pathways. May support cartilage extracellular matrix maintenance." }
  ],
  clinicalTrials: [
    { title: "GH Fragment 176-191 Lipolytic Activity", year: "2001", institution: "Obesity Research (Ng et al., Monash University)", participants: "Preclinical obesity models", duration: "4-6 week treatment studies", findings: "HGH Fragment 176-191 reduced body fat by 50% more than placebo without affecting food intake, IGF-1 levels, or blood glucose. Fat-specific lipolysis was confirmed through selective reduction in adipose tissue mass with preservation of lean body mass.", conclusion: "The C-terminal fragment of GH retains full lipolytic activity while lacking growth-promoting and diabetogenic properties, confirming the dissociation of GH's fat-metabolizing and anabolic domains." },
    { title: "Fragment 176-191 vs Full-Length GH Comparison", year: "2004", institution: "Endocrinology (Monash University)", participants: "Comparative preclinical studies", duration: "6-week treatment comparison", findings: "Fragment 176-191 produced equivalent lipolytic effects to full-length GH at comparable doses without IGF-1 elevation, hyperglycemia, or organ growth. Anti-lipogenic effects were confirmed through reduced fatty acid synthase expression.", conclusion: "HGH Fragment 176-191 provides the fat-metabolizing benefits of GH without its major safety liabilities, supporting its development as a targeted fat-reduction agent." },
    { title: "GH Fragment Mechanism of Action", year: "2006", institution: "Growth Hormone & IGF Research", participants: "Mechanistic pharmacology studies", duration: "In vitro and in vivo studies", findings: "Fragment 176-191 activated lipolysis through beta-3 adrenergic receptor-associated pathways without engaging the classical GH receptor JAK2/STAT5 signaling. No effect on glucose transporter expression or insulin signaling was observed.", conclusion: "The lipolytic mechanism of GH Fragment 176-191 is distinct from the growth-promoting GH receptor signaling, explaining its selective fat-metabolizing activity." }
  ],
  safetyProfile: "HGH Fragment 176-191 has demonstrated a favorable safety profile in preclinical studies with no effects on blood glucose, insulin sensitivity, or IGF-1 levels. It does not promote cell growth or have anabolic effects. Common side effects are limited to injection site reactions. Related compound AOD-9604 received FDA GRAS status. For research use only.",
  dosage: "Research protocols: 250-500 μg per injection subcutaneously, administered 1-2 times daily on an empty stomach (particularly before exercise or fasting periods). Morning and pre-bed dosing is common. Reconstitute with bacteriostatic water and store refrigerated.",
  keyBenefits: [
    "Selective fat reduction without GH growth-promoting effects",
    "No impact on blood glucose, insulin, or IGF-1 levels",
    "Dual mechanism: promotes lipolysis AND inhibits lipogenesis",
    "Related compound (AOD-9604) has FDA GRAS status",
    "Preserves lean body mass during fat reduction",
    "No diabetogenic effects unlike full-length HGH",
    "Well-characterized mechanism from Monash University research",
    "Preliminary evidence for chondroprotective effects"
  ]
};

// Hardcoded data for Thymosin Alpha-1
const TA1_DATA = {
  overview: "Thymosin Alpha-1 (Tα1, Thymalfasin) is a naturally occurring 28-amino acid peptide originally isolated from thymic tissue (thymosin fraction 5) by Dr. Allan Goldstein at George Washington University. It is one of the most clinically validated immunomodulatory peptides, with regulatory approval in over 35 countries for hepatitis B and C treatment and as an immune adjuvant. Tα1 enhances both innate and adaptive immune responses by activating dendritic cells, natural killer cells, and T-lymphocytes through Toll-like receptor (TLR) signaling.",
  potentialUses: [
    { title: "Immune System Enhancement", description: "Thymosin Alpha-1 is a potent immune enhancer that activates multiple arms of the immune system. It promotes T-cell maturation, dendritic cell activation, and natural killer cell cytotoxicity without causing harmful inflammatory overactivation.", mechanism: "Activates Toll-like receptors TLR2, TLR9, and TLR3 on dendritic cells, promoting antigen presentation and T-cell priming. Enhances CD4+ helper and CD8+ cytotoxic T-cell differentiation and function. Stimulates NK cell activity through NKG2D receptor upregulation. Promotes IL-2, IFN-α, and IFN-γ production." },
    { title: "Antiviral Immune Support", description: "Tα1 is approved in 35+ countries for chronic hepatitis B and C as both monotherapy and in combination with interferon-alpha. It enhances antiviral immunity without the severe side effects of high-dose interferon.", mechanism: "Enhances TLR-mediated innate antiviral responses, promotes virus-specific cytotoxic T-lymphocyte generation, and increases interferon production for antiviral defense. Restores immune competence in chronic viral infections where T-cell exhaustion has occurred." },
    { title: "Vaccine Adjuvant", description: "Thymosin Alpha-1 enhances vaccine responses, particularly in immunocompromised populations such as elderly, dialysis patients, and transplant recipients who typically mount poor responses to vaccination.", mechanism: "Promotes dendritic cell maturation and antigen cross-presentation, enhancing the generation of antigen-specific memory T-cells and B-cell antibody responses. Increases seroconversion rates and antibody titers post-vaccination." },
    { title: "Cancer Immunotherapy Support", description: "Tα1 has been studied as an immunomodulatory adjunct in cancer treatment, enhancing anti-tumor immunity and reducing chemotherapy-induced immunosuppression.", mechanism: "Activates tumor-specific cytotoxic T-cells and NK cells for tumor recognition and killing. Counteracts chemotherapy-induced lymphopenia by promoting thymic T-cell output. Reduces regulatory T-cell-mediated immunosuppression in the tumor microenvironment." }
  ],
  clinicalTrials: [
    { title: "Thymosin Alpha-1 for Chronic Hepatitis B", year: "2009", institution: "Expert Opinion on Biological Therapy (Garaci et al.)", participants: "Meta-analysis of >1,500 patients across multiple RCTs", duration: "6-12 month treatment protocols", findings: "Tα1 monotherapy (1.6 mg subcutaneously twice weekly) achieved sustained virological response rates of 26-40% in chronic hepatitis B. Combination with interferon-alpha increased response rates to 50-65%. Tα1 was significantly better tolerated than interferon monotherapy.", conclusion: "Thymosin Alpha-1 is an effective antiviral immunomodulator for chronic hepatitis B with a superior safety profile to interferon, supporting its regulatory approval in 35+ countries." },
    { title: "Thymosin Alpha-1 as Vaccine Adjuvant", year: "2014", institution: "Vaccine (Elsevier)", participants: "Elderly and immunocompromised subjects", duration: "Vaccination response studies", findings: "Tα1 co-administration with influenza and hepatitis B vaccines increased seroconversion rates by 15-30% in elderly and dialysis patients. Antibody titers were significantly higher in Tα1-treated groups. T-cell responses to vaccine antigens were enhanced.", conclusion: "Tα1 is an effective vaccine adjuvant that restores immune responsiveness in populations with impaired vaccination responses." },
    { title: "Thymosin Alpha-1 in Critical Illness", year: "2020", institution: "Critical Care Medicine (Multiple centers)", participants: "Patients with sepsis and severe infections", duration: "7-14 day ICU treatment protocols", findings: "Tα1 treatment in sepsis reduced 28-day mortality, restored lymphocyte counts faster, and improved monocyte HLA-DR expression (a marker of immune competence). Benefits were most pronounced in patients with lymphopenia-associated immunosuppression.", conclusion: "Tα1 shows promise for immune restoration in sepsis-associated immunoparalysis, addressing an unmet need in critical care." }
  ],
  safetyProfile: "Thymosin Alpha-1 has one of the most extensive safety records of any peptide, with regulatory approval in 35+ countries and decades of clinical use. It is well-tolerated with side effects limited to mild injection site reactions. Unlike interferon, it does not cause flu-like symptoms, cytopenias, or psychiatric effects. It modulates rather than stimulates immune function, reducing risk of inflammatory overactivation. For research use only outside of approved indications.",
  dosage: "Approved dose: 1.6 mg subcutaneously, administered twice weekly (3-4 days apart). Research protocols may use daily dosing for short periods. Available as lyophilized powder for reconstitution with bacteriostatic water. Store refrigerated at 2-8°C.",
  keyBenefits: [
    "Regulatory approval in 35+ countries for hepatitis B/C",
    "Enhances both innate and adaptive immune responses",
    "Activates dendritic cells, NK cells, and T-lymphocytes",
    "Effective vaccine adjuvant for immunocompromised populations",
    "Decades of clinical safety data with minimal side effects",
    "Immune modulation without inflammatory overactivation",
    "Supports anti-tumor immunity as immunotherapy adjunct",
    "Naturally occurring thymic peptide with established pharmacology"
  ]
};

// Hardcoded data for Adipotide
const ADIPOTIDE_DATA = {
  overview: "Adipotide (CKGGRAKDC-GG-D(KLAKLAK)₂, also called Prohibitin Targeting Peptide-1 or PTP-1) is a synthetic peptidomimetic developed at the University of Texas MD Anderson Cancer Center. It consists of a targeting peptide (CKGGRAKDC) that binds to prohibitin on the surface of blood vessels supplying white adipose tissue, linked to a pro-apoptotic peptide (D(KLAKLAK)₂) that destroys the targeted cells. Adipotide causes selective destruction of blood vessels feeding fat tissue, leading to fat cell death through ischemia.",
  potentialUses: [
    { title: "Targeted Fat Reduction", description: "Adipotide causes targeted destruction of the vasculature supplying white adipose tissue (WAT), leading to fat cell apoptosis through blood supply deprivation. This results in rapid, significant fat loss in preclinical studies.", mechanism: "The CKGGRAKDC targeting peptide binds prohibitin (PHB) expressed on endothelial cells of WAT vasculature. The fused D(KLAKLAK)₂ peptide then disrupts mitochondrial membranes of targeted endothelial cells, causing apoptosis. Loss of blood supply leads to downstream fat cell death (ischemic adipocyte apoptosis)." },
    { title: "Obesity Research", description: "Adipotide produced dramatic weight loss in primate studies (up to 11% body weight in 4 weeks), making it one of the most potent anti-obesity compounds studied in non-human primates.", mechanism: "Selective vascular ablation in WAT compartments reduces total fat mass. The mechanism is distinct from metabolic approaches (appetite suppression, lipolysis) as it physically eliminates fat tissue vasculature." },
    { title: "Metabolic Improvement", description: "Alongside fat loss, adipotide treatment improved insulin sensitivity and metabolic markers in obese primate models.", mechanism: "Reduction in visceral and subcutaneous WAT mass decreases adipokine-driven insulin resistance. Improved metabolic parameters are secondary to fat mass reduction rather than direct metabolic effects." }
  ],
  clinicalTrials: [
    { title: "Adipotide in Obese Non-Human Primates", year: "2012", institution: "Science Translational Medicine (Barnhart et al., MD Anderson Cancer Center)", participants: "Obese rhesus macaques", duration: "4-week treatment study", findings: "Adipotide (0.5-2 mg/kg subcutaneously, every other day for 28 days) produced 7-11% body weight loss and 27-38% reduction in abdominal fat measured by MRI. BMI decreased significantly. Insulin sensitivity improved. Reversible renal changes were observed at higher doses.", conclusion: "Adipotide produces rapid, significant fat loss in primates through targeted vascular ablation, representing a novel mechanism for obesity treatment. Renal monitoring is important." },
    { title: "Prohibitin Targeting for Vascular Ablation", year: "2004", institution: "Nature Medicine (Kolonin et al., UT MD Anderson)", participants: "Preclinical vascular targeting studies", duration: "Proof-of-concept studies", findings: "Prohibitin was identified as a vascular surface marker selectively expressed on WAT blood vessels. The CKGGRAKDC peptide specifically bound WAT vasculature, and coupling with a pro-apoptotic sequence produced selective fat tissue destruction.", conclusion: "Prohibitin-targeted vascular ablation is a viable strategy for selective fat tissue destruction, establishing the mechanism for Adipotide development." },
    { title: "Adipotide Mechanism and Safety Assessment", year: "2014", institution: "Peptides (Elsevier)", participants: "Mechanistic and toxicology studies", duration: "Multi-dose safety evaluation", findings: "Adipotide's effects were confirmed as prohibitin-mediated vascular targeting. The primary safety concern was reversible proximal tubular changes in kidneys at higher doses, attributed to peptide renal clearance. No significant effects on non-adipose vasculature were observed at therapeutic doses.", conclusion: "Adipotide shows acceptable selectivity for adipose vasculature with manageable renal effects requiring dose optimization and monitoring." }
  ],
  safetyProfile: "Adipotide is an experimental compound with limited safety data primarily from primate studies. The main safety concern is reversible kidney changes (proximal tubular effects) due to renal peptide clearance. Renal function monitoring is essential. The compound has not undergone human clinical trials. This is a potent vascular-ablative agent — it physically destroys blood vessels in fat tissue. Strictly for research use only.",
  dosage: "Primate research protocols: 0.5-1 mg/kg subcutaneously, administered every other day for 4-week cycles. Human-equivalent dosing has not been established. Due to the vascular-ablative mechanism, conservative dosing with renal monitoring is essential. Reconstitute with bacteriostatic water.",
  keyBenefits: [
    "Novel vascular targeting mechanism for fat reduction",
    "7-11% body weight loss in 4 weeks in primate studies",
    "27-38% abdominal fat reduction measured by MRI",
    "Developed at MD Anderson Cancer Center",
    "Published in Science Translational Medicine and Nature Medicine",
    "Selective targeting of adipose tissue vasculature",
    "Improved insulin sensitivity alongside fat loss",
    "Distinct mechanism from metabolic/appetite-based approaches"
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
  'GHK-CU': GHKCU_DATA, 'GHK CU': GHKCU_DATA, 'GHKCU': GHKCU_DATA, 'COPPER PEPTIDE': GHKCU_DATA, 'GHK-COPPER': GHKCU_DATA,
  'KPV': KPV_DATA,
  'CJC-1295': CJC1295_DATA, 'CJC 1295': CJC1295_DATA, 'CJC1295': CJC1295_DATA, 'MOD GRF 1-29': CJC1295_DATA, 'MOD-GRF': CJC1295_DATA,
  'IPAMORELIN': IPAMORELIN_DATA,
  'GONADORELIN': GONADORELIN_DATA, 'GNRH': GONADORELIN_DATA,
  'DSIP': DSIP_DATA, 'DELTA SLEEP': DSIP_DATA,
  'OXYTOCIN': OXYTOCIN_DATA,
  'AOD-9604': AOD9604_DATA, 'AOD 9604': AOD9604_DATA, 'AOD9604': AOD9604_DATA,
  'NAD+': NAD_DATA, 'NAD': NAD_DATA, 'NICOTINAMIDE ADENINE DINUCLEOTIDE': NAD_DATA,
  'PT-141': PT141_DATA, 'PT141': PT141_DATA, 'PT 141': PT141_DATA, 'BREMELANOTIDE': PT141_DATA,
  'SS-31': SS31_DATA, 'SS31': SS31_DATA, 'SS 31': SS31_DATA, 'ELAMIPRETIDE': SS31_DATA, 'BENDAVIA': SS31_DATA,
  'DIHEXA': DIHEXA_DATA,
  'P21': P21_DATA, 'P021': P21_DATA,
  'GHRP-2': GHRP2_DATA, 'GHRP2': GHRP2_DATA, 'GHRP 2': GHRP2_DATA, 'PRALMORELIN': GHRP2_DATA,
  'GHRP-6': GHRP6_DATA, 'GHRP6': GHRP6_DATA, 'GHRP 6': GHRP6_DATA,
  'HEXARELIN': HEXARELIN_DATA, 'EXAMORELIN': HEXARELIN_DATA,
  'MK-677': MK677_DATA, 'MK677': MK677_DATA, 'MK 677': MK677_DATA, 'IBUTAMOREN': MK677_DATA,
  'MELANOTAN II': MTII_DATA, 'MELANOTAN 2': MTII_DATA, 'MT-2': MTII_DATA, 'MT2': MTII_DATA, 'MT-II': MTII_DATA,
  'MELANOTAN I': MTI_DATA, 'MELANOTAN 1': MTI_DATA, 'MT-1': MTI_DATA, 'MT1': MTI_DATA, 'MT-I': MTI_DATA, 'AFAMELANOTIDE': MTI_DATA,
  'KISSPEPTIN-10': KISSPEPTIN_DATA, 'KISSPEPTIN': KISSPEPTIN_DATA, 'KISSPEPTIN 10': KISSPEPTIN_DATA,
  'SERMORELIN': SERMORELIN_DATA, 'GRF 1-29': SERMORELIN_DATA,
  'TESAMORELIN': TESAMORELIN_DATA, 'EGRIFTA': TESAMORELIN_DATA,
  'IGF-1 LR3': IGF1LR3_DATA, 'IGF1 LR3': IGF1LR3_DATA, 'IGF-1': IGF1LR3_DATA, 'IGF1': IGF1LR3_DATA, 'IGF-1LR3': IGF1LR3_DATA, 'IGF1-LR3': IGF1LR3_DATA, 'IGF-LR3': IGF1LR3_DATA,
  'HCG': HCG_DATA, 'HUMAN CHORIONIC GONADOTROPIN': HCG_DATA,
  'HGH FRAG 176-191': HGHFRAG_DATA, 'HGH FRAGMENT 176-191': HGHFRAG_DATA, 'HGH FRAG': HGHFRAG_DATA, 'FRAGMENT 176-191': HGHFRAG_DATA, 'FRAG 176-191': HGHFRAG_DATA, 'PT176-191 (HGH FRAG)': HGHFRAG_DATA, 'PT176-191': HGHFRAG_DATA, 'HGH-FRAG': HGHFRAG_DATA,
  'TB-500 + BPC-157': BPC_TB_COMBO_DATA, 'TB5+BPC5': BPC_TB_COMBO_DATA, 'TB10+BPC10': BPC_TB_COMBO_DATA,
  'HGH (SOMATROPIN)': HGH_DATA, 'HIH(SOMATROPIN)': HGH_DATA, 'SOMATROPIN': HGH_DATA, 'HGH(SOMATROPIN)': HGH_DATA,
  'TB500(THYMOSIN BETA-4)': TB500_DATA, 'TB500 (THYMOSIN BETA-4)': TB500_DATA, 'THYMOSIN BETA 4': TB500_DATA,
  'THYMOSIN ALPHA-1': TA1_DATA, 'THYMOSIN ALPHA 1': TA1_DATA, 'THMOSIN ALPHA-1': TA1_DATA, 'TA1': TA1_DATA, 'THYMALFASIN': TA1_DATA, 'TA-1': TA1_DATA,
  'ADIPOTIDE': ADIPOTIDE_DATA, 'PTP-1': ADIPOTIDE_DATA,
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
  const productNameParam = params.get('name');

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  useEffect(() => {
    const findAndLoadProduct = async () => {
      // Match by ID (loose equality to handle string/number mismatch), fall back to name match
      let foundProduct = products.find(p => String(p.id) === String(productId));
      if (!foundProduct && productNameParam) {
        const decodedName = decodeURIComponent(productNameParam);
        foundProduct = products.find(p => p.name === productNameParam || p.name === decodedName);
      }
      console.log('[PeptideLearn] productId:', productId, 'productNameParam:', productNameParam, 'foundProduct:', foundProduct?.name, 'products count:', products.length);
      if (foundProduct) {
        setProduct(foundProduct);

        // Check for hardcoded data matches
        const productNameUpper = foundProduct.name.toUpperCase().trim();
        console.log('[PeptideLearn] Looking up:', productNameUpper, 'exactMatch:', !!PEPTIDE_DATA_MAP[productNameUpper]);

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
          // Try exact match first, then partial, then normalized matching
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
          if (!matchedData) {
            // Normalize: strip non-alphanumeric chars and compare
            const normalize = (s) => s.replace(/[^A-Z0-9]/g, '');
            const normalizedName = normalize(productNameUpper);
            for (const [key, data] of Object.entries(PEPTIDE_DATA_MAP)) {
              if (normalize(key) === normalizedName || normalizedName.includes(normalize(key)) || normalize(key).includes(normalizedName)) {
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
