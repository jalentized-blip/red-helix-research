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
    fullName: 'Pinealon (Glu-Asp-Arg Tripeptide Bioregulator)',
    description: 'Short regulatory peptide (Glu-Asp-Arg) studied for neuroprotective properties and CNS function support',
    molecularWeight: '~404 Da',
    aminoAcids: 3,
    stability: 'High',
    mechanism: 'Neuroprotective bioregulation and CNS cellular support',
    class: 'Neuroprotective Bioregulator',
    benefits: {
      'Cognitive Function': { score: 9, studies: 'Preclinical research on neuroprotection and cognitive support' },
      'Neurological Health': { score: 9, studies: 'Studies on CNS cellular protection and neural function' },
      'Sleep Quality': { score: 8, studies: 'Research on circadian rhythm regulation through CNS modulation' },
      'Anti-Aging & Longevity': { score: 7, studies: 'Studies on cellular bioregulation and aging' },
      'Stress Management': { score: 7, studies: 'Research on stress response and neuroendocrine regulation' },
      'Immune Support': { score: 6, studies: 'Studies on neuroimmune interactions' },
      'Cellular Health': { score: 7, studies: 'Data on peptide bioregulation of cellular function' }
    },
    contraindications: [],
    clinicalNotes: 'Short peptide bioregulator from the Khavinson research program. Studied primarily for CNS support and neuroprotection. Distinct from Epithalon (Ala-Glu-Asp-Gly), which is the telomerase-associated peptide.'
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
    contraindications: [
      { peptide: 'Kisspeptin-10', severity: 'MODERATE', reason: 'Both stimulate GnRH pathways. Concurrent use may cause excessive gonadotropin release and unpredictable hormonal fluctuations. Use one approach for HPG axis stimulation.' }
    ],
    clinicalNotes: 'Regulatory hormone with strong clinical evidence for reproductive health. Works upstream on hormone axis.'
  },
  'KPV': {
    fullName: 'KPV (Lysine-Proline-Valine)',
    description: 'C-terminal tripeptide fragment of alpha-melanocyte-stimulating hormone (α-MSH) with potent anti-inflammatory properties via NF-κB inhibition',
    molecularWeight: '~342 Da',
    aminoAcids: 3,
    stability: 'High',
    mechanism: 'NF-κB inhibition and anti-inflammatory immune modulation',
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
    fullName: 'Oxytocin (Endogenous Neuropeptide Hormone)',
    description: 'Hypothalamic neuropeptide hormone involved in social behavior, reproductive function, and neuroendocrine regulation',
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
    fullName: 'Thymosin Beta-4 (Tβ4)',
    description: 'Endogenous 43-amino acid peptide that is the primary G-actin sequestering molecule in eukaryotic cells, naturally present in wound fluid and blood platelets',
    molecularWeight: '~4,963 Da',
    aminoAcids: 43,
    stability: 'Highly Stable',
    mechanism: 'Actin sequestration regulating cell migration, angiogenesis, and anti-inflammatory signaling',
    class: 'Cellular Protection & Repair',
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
  'SM': {
    fullName: 'SM (Semaglutide - Research Grade)',
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
      { peptide: 'TRZ', severity: 'HIGH', reason: 'Combining two GLP-1 pathway agonists significantly increases risk of adverse effects. Dual GLP-1 activation can cause severe nausea, vomiting, pancreatitis risk, and hypoglycemia. No clinical evidence supports this combination.' }
    ],
    clinicalNotes: 'Metabolic and endocrine focused peptide. Proven clinical efficacy for glucose regulation, weight management, and cardiovascular health. Well-established safety profile in human studies.'
  },
  'TRZ': {
    fullName: 'TRZ (Tirzepatide - Research Grade)',
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
      { peptide: 'SM', severity: 'HIGH', reason: 'Combining two GLP-1 pathway agonists significantly increases risk of adverse effects. Dual GLP-1 activation can cause severe nausea, vomiting, pancreatitis risk, and hypoglycemia. No clinical evidence supports this combination.' }
    ],
    clinicalNotes: 'Advanced dual-receptor metabolic peptide. Clinical evidence demonstrates superior efficacy to GLP-1 monotherapy. Strong safety profile in human studies with proven metabolic benefits.'
  },
  'PT-141': {
    fullName: 'PT-141 (Bremelanotide)',
    description: 'Synthetic melanocortin receptor agonist (MC3R/MC4R) derived from Melanotan II, FDA-approved as Vyleesi for hypoactive sexual desire disorder (HSDD)',
    molecularWeight: '~1,025 Da',
    aminoAcids: 7,
    stability: 'Stable',
    mechanism: 'Melanocortin-4 receptor (MC4R) agonism in the central nervous system activating hypothalamic sexual arousal pathways',
    class: 'Sexual Health',
    benefits: {
      'Sexual Health & Performance': { score: 10, studies: 'FDA Phase III trials (RECONNECT) demonstrated statistically significant improvement in sexual desire and distress scores' },
      'Mood & Emotional Wellness': { score: 6, studies: 'Secondary mood enhancement observed in clinical trial participants through CNS melanocortin activation' },
      'Energy & Vitality': { score: 5, studies: 'Mild stimulatory effects noted through central melanocortin pathway activation' }
    },
    contraindications: [
      { peptide: 'Melanotan II', severity: 'HIGH', reason: 'Both act on melanocortin receptors. Concurrent use risks excessive MC4R activation, severe nausea, blood pressure changes, and unpredictable cardiovascular effects.' }
    ],
    clinicalNotes: 'FDA-approved (2019) for premenopausal HSDD. Acts centrally unlike PDE5 inhibitors. Common side effects include nausea, flushing, and headache. Not for use more than once in 24 hours or more than 8 times per month per FDA labeling.'
  },
  'Semax': {
    fullName: 'Semax (ACTH 4-10 Analog with Pro-Gly-Pro)',
    description: 'Synthetic heptapeptide analog of ACTH(4-10) with added C-terminal Pro-Gly-Pro tripeptide, developed at the Institute of Molecular Genetics (Russia) for neuroprotection and cognitive enhancement',
    molecularWeight: '~813 Da',
    aminoAcids: 7,
    stability: 'Moderate',
    mechanism: 'BDNF and NGF upregulation, melanocortin receptor modulation, and TrkB signaling pathway activation',
    class: 'Nootropic',
    benefits: {
      'Cognitive Function': { score: 10, studies: 'Clinical studies showing BDNF upregulation (2-8x increase) and improved cognitive performance in ischemic stroke patients (Gusev et al., 2005)' },
      'Neurological Health': { score: 9, studies: 'Research demonstrating neuroprotective effects against oxidative stress and ischemic damage in CNS tissue' },
      'Stress Management': { score: 8, studies: 'Studies showing anxiolytic effects without sedation, distinct from benzodiazepine mechanism' },
      'Mental Clarity': { score: 9, studies: 'Enhanced attention, working memory, and information processing speed in clinical populations' },
      'Immune Support': { score: 6, studies: 'Research on immune modulation through melanocortin pathway effects' }
    },
    contraindications: [],
    clinicalNotes: 'Approved in Russia and Ukraine for clinical use. Primarily administered intranasally. Extensive human clinical data spanning 25+ years. Does not affect HPA axis or cause cortisol elevation despite ACTH-derived structure.'
  },
  'Selank': {
    fullName: 'Selank (Tuftsin Analog with Pro-Gly-Pro)',
    description: 'Synthetic heptapeptide analog of tuftsin (Thr-Lys-Pro-Arg) with C-terminal Pro-Gly-Pro extension, developed at the Institute of Molecular Genetics (Russia) as an anxiolytic and immunomodulator',
    molecularWeight: '~751 Da',
    aminoAcids: 7,
    stability: 'Moderate',
    mechanism: 'GABAergic modulation, enkephalin stabilization, and IL-6/interferon regulation without benzodiazepine-like sedation',
    class: 'Anxiolytic / Immunomodulator',
    benefits: {
      'Stress Management': { score: 10, studies: 'Clinical trials demonstrating anxiolytic effects comparable to benzodiazepines without sedation or dependence (Zozulia et al., 2008)' },
      'Cognitive Function': { score: 8, studies: 'Research showing enhanced memory consolidation and attention through BDNF modulation' },
      'Immune Support': { score: 9, studies: 'Studies on tuftsin-derived immunomodulatory activity including IL-6 regulation and monocyte activation' },
      'Mental Clarity': { score: 7, studies: 'Improved information processing and reduced mental fatigue in clinical populations' },
      'Sleep Quality': { score: 6, studies: 'Secondary sleep improvement through anxiety reduction and GABAergic modulation' }
    },
    contraindications: [],
    clinicalNotes: 'Approved in Russia for anxiety disorders. Intranasal administration. No sedation, dependence, or withdrawal effects observed in clinical use. Often compared favorably to Semax for anxiety-predominant presentations.'
  },
  'Epithalon': {
    fullName: 'Epithalon (Ala-Glu-Asp-Gly Tetrapeptide)',
    description: 'Synthetic tetrapeptide (epitalon/epithalone) based on epithalamin from the pineal gland, researched by Prof. Vladimir Khavinson for telomerase activation and anti-aging',
    molecularWeight: '~390 Da',
    aminoAcids: 4,
    stability: 'High',
    mechanism: 'Telomerase activation via hTERT gene expression, melatonin synthesis regulation, and circadian rhythm normalization',
    class: 'Anti-Aging / Telomerase',
    benefits: {
      'Anti-Aging & Longevity': { score: 10, studies: 'Khavinson et al. research showing telomerase reactivation in somatic cells and telomere elongation (Bulletin of Experimental Biology and Medicine, 2003)' },
      'Sleep Quality': { score: 8, studies: 'Studies on melatonin production normalization and circadian rhythm restoration in elderly subjects' },
      'Cellular Health': { score: 9, studies: 'Research on DNA repair enhancement and chromosomal stability through telomerase activation' },
      'Immune Support': { score: 7, studies: 'Studies showing immune function improvement in elderly populations through thymic peptide regulation' },
      'Hormonal Balance': { score: 7, studies: 'Research on neuroendocrine regulation and melatonin/cortisol ratio normalization' }
    },
    contraindications: [],
    clinicalNotes: 'Distinct from Pinealon (Glu-Asp-Arg), which is a neuroprotective tripeptide. Epithalon is the telomerase-associated tetrapeptide (Ala-Glu-Asp-Gly). Khavinson research program reports 20+ year safety data. Typically administered in 10-day cycles.'
  },
  'AOD-9604': {
    fullName: 'AOD-9604 (Anti-Obesity Drug Fragment 177-191)',
    description: 'Modified fragment of human growth hormone (hGH) amino acids 177-191 with added tyrosine, specifically targeting lipolysis without GH-related side effects',
    molecularWeight: '~1,817 Da',
    aminoAcids: 16,
    stability: 'Stable',
    mechanism: 'Beta-3 adrenergic receptor-mediated lipolysis stimulation and lipogenesis inhibition without IGF-1 elevation or insulin resistance',
    class: 'Metabolic / Fat Loss',
    benefits: {
      'Weight Loss & Obesity': { score: 9, studies: 'Phase II clinical trials (Metabolic Pharmaceuticals) showing significant fat reduction without affecting glucose tolerance or IGF-1 levels' },
      'Body Composition': { score: 9, studies: 'Research demonstrating selective adipose tissue reduction without lean mass changes' },
      'Metabolic Syndrome': { score: 7, studies: 'Studies on metabolic marker improvement independent of growth hormone effects' },
      'Joint Pain & Arthritis': { score: 7, studies: 'TGA-listed (Australia) for osteoarthritis treatment as injectable; research on cartilage regeneration' },
      'Recovery & Healing': { score: 6, studies: 'Secondary tissue repair benefits through cartilage and connective tissue support' }
    },
    contraindications: [],
    clinicalNotes: 'TGA-listed in Australia for osteoarthritis. Does NOT raise IGF-1, blood sugar, or cause GH-related side effects. Fragment specifically isolated for lipolytic activity. WADA prohibited list substance.'
  },
  'MOTS-c': {
    fullName: 'MOTS-c (Mitochondrial Open Reading Frame of the 12S rRNA-c)',
    description: 'Mitochondrial-derived peptide (MDP) encoded in the 12S rRNA gene, functioning as an exercise mimetic and metabolic regulator discovered by Dr. Changhan David Lee at USC',
    molecularWeight: '~2,174 Da',
    aminoAcids: 16,
    stability: 'Moderate',
    mechanism: 'AMPK pathway activation, folate-methionine cycle regulation, and nuclear genome communication for metabolic homeostasis',
    class: 'Metabolic / Mitochondrial',
    benefits: {
      'Athletic Performance': { score: 9, studies: 'Research by Lee et al. (Cell Metabolism, 2015) showing exercise mimetic effects and improved physical performance in aged mice' },
      'Body Composition': { score: 9, studies: 'Studies on fat oxidation enhancement and prevention of diet-induced obesity through AMPK activation' },
      'Metabolic Syndrome': { score: 9, studies: 'Research demonstrating glucose homeostasis improvement and insulin sensitivity enhancement' },
      'Anti-Aging & Longevity': { score: 8, studies: 'Studies on mitochondrial-nuclear communication and cellular aging prevention' },
      'Energy & Vitality': { score: 8, studies: 'Research on mitochondrial biogenesis and cellular energy production enhancement' },
      'Cellular Health': { score: 8, studies: 'Data on metabolic stress resistance and mitochondrial function optimization' }
    },
    contraindications: [],
    clinicalNotes: 'Endogenously produced mitochondrial peptide. Levels decline with age. First human clinical trial (Lee lab, USC) showed improved glucose regulation. Represents a novel class of signaling molecules (mitochondrial-derived peptides).'
  },
  'Kisspeptin-10': {
    fullName: 'Kisspeptin-10 (Metastin 45-54)',
    description: 'C-terminal decapeptide fragment of kisspeptin (metastin), the endogenous ligand for GPR54/KISS1R that serves as the master upstream regulator of the HPG reproductive axis',
    molecularWeight: '~1,302 Da',
    aminoAcids: 10,
    stability: 'Low (rapid degradation)',
    mechanism: 'KISS1R (GPR54) agonism on GnRH neurons in the hypothalamus, triggering pulsatile GnRH release and downstream LH/FSH secretion',
    class: 'Reproductive / Hormonal',
    benefits: {
      'Sexual Health & Performance': { score: 9, studies: 'Dhillo et al. (JCEM, 2005) demonstrated potent LH secretion stimulation in healthy men; Jayasena et al. showed restored LH pulsatility' },
      'Fertility Support': { score: 10, studies: 'Clinical trials for IVF oocyte maturation trigger as alternative to hCG, reducing OHSS risk (Abbara et al., Lancet Diabetes Endocrinol, 2015)' },
      'Hormonal Balance': { score: 9, studies: 'Research on HPG axis restoration and testosterone normalization through upstream GnRH modulation' },
      'Mood & Emotional Wellness': { score: 6, studies: 'fMRI studies showing kisspeptin enhances limbic brain activity related to sexual and emotional processing' }
    },
    contraindications: [
      { peptide: 'Gonadorelin', severity: 'MODERATE', reason: 'Both stimulate GnRH pathways. Concurrent use may cause excessive gonadotropin release and unpredictable hormonal fluctuations. Use one approach for HPG axis stimulation.' }
    ],
    clinicalNotes: 'Very short half-life (~28 minutes IV). Master regulator of puberty onset and reproductive function. Active clinical trials for IVF applications. More physiological HPG stimulation compared to direct GnRH agonists.'
  },
  'Sermorelin': {
    fullName: 'Sermorelin (GRF 1-29 NH2)',
    description: 'Synthetic analog of the first 29 amino acids of GHRH, the shortest fully functional fragment retaining full biological activity at the GHRH receptor',
    molecularWeight: '~3,358 Da',
    aminoAcids: 29,
    stability: 'Moderate',
    mechanism: 'GHRH receptor agonism on anterior pituitary somatotrophs, stimulating physiological pulsatile GH release',
    class: 'GH Secretagogue',
    benefits: {
      'Muscle Growth & Strength': { score: 8, studies: 'Clinical trials showing increased IGF-1 and lean body mass in GH-deficient populations (Genesciense Biopharma studies)' },
      'Body Composition': { score: 8, studies: 'Research on fat mass reduction and lean mass preservation through physiological GH elevation' },
      'Sleep Quality': { score: 8, studies: 'Studies demonstrating enhanced slow-wave (deep) sleep through GH pulse augmentation during sleep' },
      'Anti-Aging & Longevity': { score: 7, studies: 'Research on age-related GH decline reversal and biomarker improvement' },
      'Recovery & Healing': { score: 7, studies: 'Data on tissue repair enhancement through sustained GH/IGF-1 elevation' },
      'Energy & Vitality': { score: 7, studies: 'Studies on metabolic rate and vitality improvement in GH-deficient adults' },
      'Bone Density': { score: 7, studies: 'Research on bone mineral density improvement through GH-mediated osteoblast activation' }
    },
    contraindications: [],
    clinicalNotes: 'Previously FDA-approved diagnostic agent (Geref). Preserves hypothalamic-pituitary feedback unlike exogenous GH. Considered gentler alternative to CJC-1295 with more physiological GH pulsatility. Often combined with GHRP-class peptides.'
  },
  'Tesamorelin': {
    fullName: 'Tesamorelin (Trans-3-Hexenoic Acid Modified GRF 1-44)',
    description: 'FDA-approved synthetic GHRH analog with trans-3-hexenoic acid modification for enhanced stability, approved as Egrifta for HIV-associated lipodystrophy',
    molecularWeight: '~5,136 Da',
    aminoAcids: 44,
    stability: 'High',
    mechanism: 'GHRH receptor agonism with enhanced enzymatic resistance, stimulating pulsatile GH secretion from anterior pituitary',
    class: 'GH Secretagogue',
    benefits: {
      'Body Composition': { score: 10, studies: 'FDA-approved based on Phase III trials showing significant visceral adipose tissue (VAT) reduction in HIV lipodystrophy (Falutz et al., JAMA, 2007)' },
      'Weight Loss & Obesity': { score: 9, studies: 'Clinical trials demonstrating trunk fat reduction and waist circumference decrease' },
      'Muscle Growth & Strength': { score: 8, studies: 'Research on lean body mass preservation and IGF-1 normalization' },
      'Cognitive Function': { score: 7, studies: 'Dhillon et al. study showing cognitive improvement in adults on tesamorelin through IGF-1 mediated neurogenesis' },
      'Anti-Aging & Longevity': { score: 7, studies: 'Studies on GH axis restoration and age-related hormonal decline' },
      'Cardiovascular Health': { score: 7, studies: 'Research on visceral fat reduction improving cardiovascular risk markers (CRP, triglycerides)' }
    },
    contraindications: [],
    clinicalNotes: 'FDA-approved (Egrifta, 2010) for HIV lipodystrophy. Superior stability to Sermorelin. Does not suppress endogenous GH axis. Preserves physiological pulsatile GH secretion pattern.'
  },
  'GHRP-2': {
    fullName: 'GHRP-2 (Growth Hormone Releasing Peptide-2)',
    description: 'Synthetic hexapeptide growth hormone secretagogue acting on the ghrelin/GHS receptor (GHSR) to stimulate GH release from the anterior pituitary',
    molecularWeight: '~817 Da',
    aminoAcids: 6,
    stability: 'Stable',
    mechanism: 'Ghrelin receptor (GHSR-1a) agonism on anterior pituitary, stimulating GH release with concurrent mild cortisol and prolactin elevation',
    class: 'GH Secretagogue',
    benefits: {
      'Muscle Growth & Strength': { score: 9, studies: 'Clinical studies showing potent GH release (strongest of GHRP class) with significant IGF-1 elevation' },
      'Body Composition': { score: 8, studies: 'Research on fat oxidation and lean mass increase through sustained GH elevation' },
      'Recovery & Healing': { score: 8, studies: 'Studies on tissue repair acceleration through GH/IGF-1 axis stimulation' },
      'Sleep Quality': { score: 7, studies: 'Research on deep sleep enhancement through GH pulse augmentation' },
      'Athletic Performance': { score: 8, studies: 'Data on performance recovery and endurance improvement' },
      'Appetite Control': { score: 5, studies: 'Note: GHRP-2 significantly increases appetite through ghrelin receptor activation (hunger-stimulating effect)' }
    },
    contraindications: [],
    clinicalNotes: 'Most potent GHRP-class peptide for GH release. Unlike Ipamorelin, causes mild cortisol and prolactin elevation and significant appetite increase via ghrelin pathway. Best administered on empty stomach. Synergizes with GHRH analogs (CJC-1295, Sermorelin).'
  },
  'GHRP-6': {
    fullName: 'GHRP-6 (Growth Hormone Releasing Peptide-6)',
    description: 'Synthetic hexapeptide growth hormone secretagogue and first-generation GHRP acting on ghrelin receptors with strong appetite-stimulating properties',
    molecularWeight: '~873 Da',
    aminoAcids: 6,
    stability: 'Stable',
    mechanism: 'Ghrelin receptor (GHSR-1a) agonism with strong orexigenic (appetite-stimulating) effects and GH release from anterior pituitary',
    class: 'GH Secretagogue',
    benefits: {
      'Muscle Growth & Strength': { score: 8, studies: 'Clinical research on GH release stimulation and anabolic signaling (weaker than GHRP-2 but significant)' },
      'Recovery & Healing': { score: 8, studies: 'Studies on wound healing acceleration and tissue repair through GH-mediated mechanisms' },
      'Body Composition': { score: 7, studies: 'Research on lean mass increase, though appetite stimulation can complicate fat loss goals' },
      'Gut Health & Leaky Gut': { score: 7, studies: 'Research on gastroprotective effects and gastric motility enhancement through ghrelin pathway' },
      'Sleep Quality': { score: 7, studies: 'Data on sleep architecture improvement through GH pulse enhancement' },
      'Athletic Performance': { score: 7, studies: 'Studies on recovery and performance through GH elevation' }
    },
    contraindications: [],
    clinicalNotes: 'First-generation GHRP with strongest appetite stimulation of the class. Causes more cortisol and prolactin elevation than Ipamorelin. Useful when appetite increase is desired (underweight, recovery). Often replaced by Ipamorelin for cleaner GH release profile.'
  },
  'Hexarelin': {
    fullName: 'Hexarelin (Examorelin)',
    description: 'Synthetic hexapeptide growth hormone secretagogue with the strongest GH-releasing potency of the GHRP class, also demonstrating cardioprotective properties',
    molecularWeight: '~887 Da',
    aminoAcids: 6,
    stability: 'Stable',
    mechanism: 'Potent GHSR-1a agonism with additional CD36 receptor activation providing cardioprotective effects independent of GH release',
    class: 'GH Secretagogue / Cardioprotective',
    benefits: {
      'Muscle Growth & Strength': { score: 10, studies: 'Most potent GH release of any GHRP-class peptide in clinical comparisons (Ghigo et al., JCEM)' },
      'Heart Health & Circulation': { score: 9, studies: 'Unique CD36-mediated cardioprotective effects independent of GH release (Bisi et al., JCEM, 1999; cardiac studies by Locatelli et al.)' },
      'Recovery & Healing': { score: 8, studies: 'Research on accelerated tissue repair through powerful GH/IGF-1 elevation' },
      'Body Composition': { score: 8, studies: 'Studies on body fat reduction and lean mass accretion' },
      'Athletic Performance': { score: 8, studies: 'Data on exercise capacity and recovery enhancement' },
      'Anti-Aging & Longevity': { score: 7, studies: 'Research on GH restoration in aging and cellular regeneration' }
    },
    contraindications: [],
    clinicalNotes: 'Strongest GHRP for GH release but subject to desensitization with chronic use (unlike Ipamorelin). Unique cardiac benefit through CD36 receptor. Causes cortisol and prolactin elevation. Best used in shorter cycles or intermittently. Subject to tachyphylaxis.'
  },
  'MK-677': {
    fullName: 'MK-677 (Ibutamoren Mesylate)',
    description: 'Non-peptide oral growth hormone secretagogue mimetic that activates the ghrelin receptor (GHSR) for sustained GH and IGF-1 elevation without injections',
    molecularWeight: '~528 Da',
    aminoAcids: 0,
    stability: 'Very High (oral)',
    mechanism: 'Non-peptide ghrelin receptor (GHSR-1a) agonist providing sustained 24-hour GH elevation and IGF-1 increase through oral administration',
    class: 'GH Secretagogue (Oral)',
    benefits: {
      'Muscle Growth & Strength': { score: 9, studies: 'Nass et al. (JCEM, 2008) 2-year study showing sustained IGF-1 elevation and lean mass increase in elderly' },
      'Sleep Quality': { score: 9, studies: 'Murphy et al. study demonstrating 50% increase in Stage 4 and 20% increase in REM sleep duration' },
      'Body Composition': { score: 8, studies: 'Research on nitrogen retention and lean body mass improvement over sustained use' },
      'Bone Density': { score: 8, studies: 'Svensson et al. showing increased bone turnover markers and BMD improvement over 12 months' },
      'Recovery & Healing': { score: 8, studies: 'Studies on tissue repair through sustained GH/IGF-1 elevation' },
      'Anti-Aging & Longevity': { score: 7, studies: 'Research on GH axis restoration in aging populations' }
    },
    contraindications: [],
    clinicalNotes: 'Not technically a peptide — small molecule GH secretagogue. Oral bioavailability (no injection needed). 24-hour half-life provides sustained GH elevation. Can increase appetite, cause water retention, and raise fasting glucose. Does NOT suppress endogenous GH production.'
  },
  'Melanotan II': {
    fullName: 'Melanotan II (MT-II)',
    description: 'Synthetic cyclic heptapeptide analog of alpha-melanocyte-stimulating hormone (α-MSH) acting on melanocortin receptors MC1R-MC5R with effects on pigmentation, sexual function, and appetite',
    molecularWeight: '~1,024 Da',
    aminoAcids: 7,
    stability: 'Stable (cyclic)',
    mechanism: 'Non-selective melanocortin receptor agonism (MC1R for pigmentation, MC4R for sexual arousal and appetite suppression, MC3R for energy homeostasis)',
    class: 'Melanocortin Agonist',
    benefits: {
      'Sexual Health & Performance': { score: 9, studies: 'Clinical studies demonstrating erectile response enhancement in men through MC4R activation (Wessells et al., Urology, 2000)' },
      'Body Composition': { score: 6, studies: 'Research on appetite suppression and fat oxidation through MC3R/MC4R activation' },
      'Skin Health': { score: 7, studies: 'Studies on melanogenesis stimulation and UV photoprotection through MC1R activation' }
    },
    contraindications: [
      { peptide: 'PT-141', severity: 'HIGH', reason: 'Both act on melanocortin receptors. Concurrent use risks excessive MC4R activation, severe nausea, blood pressure changes, and unpredictable cardiovascular effects.' }
    ],
    clinicalNotes: 'Non-selective melanocortin agonist with broad receptor activity. PT-141 was derived from MT-II as a more selective MC4R agonist. Associated with nausea (especially initial doses), mole darkening, and facial flushing. New mole formation and existing mole changes require monitoring.'
  },
  'SS-31': {
    fullName: 'SS-31 (Elamipretide / Bendavia / MTP-131)',
    description: 'Mitochondria-targeted tetrapeptide (D-Arg-Dmt-Lys-Phe-NH2) that concentrates 1000x in inner mitochondrial membrane, stabilizing cardiolipin and restoring bioenergetics',
    molecularWeight: '~640 Da',
    aminoAcids: 4,
    stability: 'Stable',
    mechanism: 'Cardiolipin stabilization in the inner mitochondrial membrane, optimizing electron transport chain efficiency and reducing reactive oxygen species (ROS) generation at the source',
    class: 'Mitochondrial Protectant',
    benefits: {
      'Heart Health & Circulation': { score: 10, studies: 'Phase II EMBRACE trial showing improved left ventricular function in heart failure patients (Daubert et al., Circulation: Heart Failure, 2017)' },
      'Anti-Aging & Longevity': { score: 9, studies: 'Research on mitochondrial dysfunction reversal and cellular aging prevention through cardiolipin stabilization' },
      'Energy & Vitality': { score: 9, studies: 'Studies on ATP production restoration and exercise tolerance improvement in mitochondrial myopathy' },
      'Cellular Health': { score: 10, studies: 'Research on electron transport chain optimization and ROS reduction at mitochondrial source' },
      'Neurological Health': { score: 7, studies: 'Studies on neuroprotection through mitochondrial membrane stabilization in neurodegenerative models' },
      'Athletic Performance': { score: 7, studies: 'Research on exercise capacity and skeletal muscle mitochondrial function' }
    },
    contraindications: [],
    clinicalNotes: 'In active FDA clinical trials for Barth syndrome, heart failure, and primary mitochondrial myopathy. One of the most scientifically rigorous peptides with extensive Phase II/III human data. Targets the root cause of mitochondrial dysfunction rather than downstream effects.'
  },
  'Dihexa': {
    fullName: 'Dihexa (N-Hexanoic-Tyr-Ile-(6)-Aminohexanoic Amide)',
    description: 'Angiotensin IV analog and potent cognitive enhancer approximately 10 million times more potent than BDNF at promoting hepatocyte growth factor (HGF)/c-Met receptor signaling',
    molecularWeight: '~507 Da',
    aminoAcids: 3,
    stability: 'High',
    mechanism: 'HGF/c-Met receptor system activation promoting synaptogenesis, dendritic spine formation, and new synaptic connections in the hippocampus',
    class: 'Nootropic / Synaptogenic',
    benefits: {
      'Cognitive Function': { score: 10, studies: 'Benoist et al. (J Pharmacology and Experimental Therapeutics, 2014) demonstrated cognitive restoration in scopolamine-impaired animal models' },
      'Neurological Health': { score: 9, studies: 'Research on new synaptic connection formation and dendritic spine density increase in hippocampal neurons' },
      'Mental Clarity': { score: 9, studies: 'Studies on enhanced information processing through increased synaptic connectivity' },
      'Anti-Aging & Longevity': { score: 7, studies: 'Research on cognitive decline prevention through neural network maintenance' }
    },
    contraindications: [],
    clinicalNotes: 'Preclinical research compound — no human clinical trials to date. Extremely potent (picomolar active concentrations). Oral bioavailability. Developed at Washington State University by Harding/Wright lab. Long-term safety profile not established in humans. Research use only.'
  },
  'P21': {
    fullName: 'P21 (CNTF-Derived Peptide)',
    description: 'Synthetic 11-mer peptide derived from ciliary neurotrophic factor (CNTF) that promotes neurogenesis without the appetite-suppressing and weight-loss side effects of full CNTF',
    molecularWeight: '~1,339 Da',
    aminoAcids: 11,
    stability: 'Moderate',
    mechanism: 'CNTF receptor pathway activation promoting hippocampal neurogenesis and CREB phosphorylation without JAK/STAT-mediated anorexia',
    class: 'Nootropic / Neurogenic',
    benefits: {
      'Cognitive Function': { score: 9, studies: 'Research showing enhanced spatial learning and memory through increased hippocampal neurogenesis (Bhatta et al.)' },
      'Neurological Health': { score: 9, studies: 'Studies on dentate gyrus neurogenesis and neural stem cell proliferation' },
      'Mental Clarity': { score: 8, studies: 'Data on learning acquisition and memory consolidation improvement' },
      'Anti-Aging & Longevity': { score: 7, studies: 'Research on age-related cognitive decline prevention through adult neurogenesis' }
    },
    contraindications: [],
    clinicalNotes: 'Preclinical research compound. Designed to isolate the neurotrophic benefits of CNTF without systemic side effects. Crosses the blood-brain barrier. No human clinical trials to date. Research use only.'
  },
  'NAD+': {
    fullName: 'NAD+ (Nicotinamide Adenine Dinucleotide)',
    description: 'Essential coenzyme found in all living cells, serving as a critical substrate for sirtuins (SIRT1-7), PARPs, and CD38, with levels declining ~50% between ages 40-60',
    molecularWeight: '~663 Da',
    aminoAcids: 0,
    stability: 'Moderate (aqueous)',
    mechanism: 'Direct replenishment of cellular NAD+ pools, activating sirtuin-mediated DNA repair, PARP-dependent genome maintenance, and mitochondrial biogenesis through PGC-1α',
    class: 'Cellular Energetics / Anti-Aging',
    benefits: {
      'Anti-Aging & Longevity': { score: 10, studies: 'Imai & Guarente (Trends in Cell Biology, 2014) established NAD+ decline as hallmark of aging; Sinclair lab demonstrated lifespan extension in model organisms' },
      'Energy & Vitality': { score: 10, studies: 'Research on mitochondrial function restoration and ATP production through Complex I/II substrate replenishment' },
      'Cellular Health': { score: 10, studies: 'Studies on DNA repair (PARP activation), sirtuin activation, and mitochondrial biogenesis enhancement' },
      'Cognitive Function': { score: 7, studies: 'Research on neuronal NAD+ replenishment and age-related cognitive decline prevention' },
      'Athletic Performance': { score: 7, studies: 'Studies on exercise endurance and recovery through enhanced mitochondrial function' },
      'Immune Support': { score: 6, studies: 'Research on CD38 regulation and immune cell function through NAD+ availability' }
    },
    contraindications: [],
    clinicalNotes: 'Not a peptide — dinucleotide coenzyme. Available as IV infusion, subcutaneous injection, or oral precursors (NMN, NR). IV route has highest bioavailability. Cellular levels decline significantly with age. Active clinical research at Harvard, Washington University, and others.'
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
  'SM': { type: 'LONG_TERM', duration: 'Ongoing long-term use', protocol: 'Weekly injection protocol for sustained metabolic benefits' },
  'TRZ': { type: 'LONG_TERM', duration: 'Ongoing long-term use', protocol: 'Weekly injection protocol for sustained metabolic benefits' },
  'PT-141': { type: 'CYCLE_BASED', duration: 'As-needed (max 8x/month per FDA)', protocol: 'Single dose 45 min before activity, no more than once per 24 hours' },
  'Semax': { type: 'CYCLE_BASED', duration: '10-20 day cycles with breaks', protocol: 'Intranasal 2-3x daily, 200-600mcg per dose' },
  'Selank': { type: 'CYCLE_BASED', duration: '14-21 day cycles with breaks', protocol: 'Intranasal 2-3x daily, 250-500mcg per dose' },
  'Epithalon': { type: 'CYCLE_BASED', duration: '10-20 day cycles, 2-3x per year', protocol: 'Daily subcutaneous injection, 5-10mg per day' },
  'AOD-9604': { type: 'CYCLE_BASED', duration: '12-20 week cycles', protocol: 'Daily subcutaneous injection, 300mcg on empty stomach' },
  'MOTS-c': { type: 'CYCLE_BASED', duration: '8-12 week cycles', protocol: 'Subcutaneous injection 3-5x weekly, 5-10mg per dose' },
  'Kisspeptin-10': { type: 'CYCLE_BASED', duration: 'Acute dosing or short cycles', protocol: 'Subcutaneous or IV injection, very short half-life (~28 min)' },
  'Sermorelin': { type: 'CYCLE_BASED', duration: '12-24 week cycles', protocol: 'Daily subcutaneous injection before bed, 100-300mcg' },
  'Tesamorelin': { type: 'LONG_TERM', duration: 'Ongoing long-term use', protocol: 'Daily subcutaneous injection, 2mg per day (FDA dosing)' },
  'GHRP-2': { type: 'CYCLE_BASED', duration: '8-16 week cycles', protocol: 'Subcutaneous 2-3x daily on empty stomach, 100-300mcg per dose' },
  'GHRP-6': { type: 'CYCLE_BASED', duration: '8-16 week cycles', protocol: 'Subcutaneous 2-3x daily on empty stomach, 100-300mcg per dose' },
  'Hexarelin': { type: 'CYCLE_BASED', duration: '4-8 week cycles (desensitization risk)', protocol: 'Subcutaneous 2-3x daily, 100-200mcg per dose. Shorter cycles due to tachyphylaxis' },
  'MK-677': { type: 'LONG_TERM', duration: '12-24 months continuous', protocol: 'Oral once daily, 10-25mg, typically taken at bedtime' },
  'Melanotan II': { type: 'CYCLE_BASED', duration: 'Loading phase (7-10 days) then maintenance', protocol: 'Subcutaneous injection, 0.25-0.5mg loading, then weekly maintenance' },
  'SS-31': { type: 'CYCLE_BASED', duration: '4-12 week treatment periods', protocol: 'Subcutaneous or IV injection, clinical trial doses 0.25mg/kg' },
  'Dihexa': { type: 'CYCLE_BASED', duration: '4-8 week cycles', protocol: 'Oral or subcutaneous, 10-20mg per day (research protocols vary)' },
  'P21': { type: 'CYCLE_BASED', duration: '4-8 week cycles', protocol: 'Subcutaneous injection, research doses vary (typically 1-2mg/day)' },
  'NAD+': { type: 'LONG_TERM', duration: 'Ongoing long-term supplementation', protocol: 'IV infusion (250-500mg sessions) or subcutaneous injection (50-100mg daily)' }
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
        peptide: 'SM',
        protocol: 'SM (weekly) + BPC-157 (daily): Recovery + metabolic management. Extended BPC-157 cycle paired with SM for weight management. Common in comprehensive health protocols.',
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
        peptide: 'TRZ',
        protocol: 'TB-500 (2x weekly, 8-12 week cycles) + TRZ (weekly, long-term): Comprehensive protocol for recovery + metabolic health. TB-500 cycles support tissue while TRZ maintains metabolic benefits.',
        compatibilityReason: 'Cellular repair complemented by metabolic optimization',
        usageCompatibility: true
      }
    ]
  },
  'SM': {
    compatible: [
      {
        peptide: 'BPC-157',
        protocol: 'SM (weekly) + BPC-157 (daily): Metabolic + recovery support. Long-term SM protocol paired with continuous BPC-157 for systemic wellness. High patient satisfaction in clinical reports.',
        compatibilityReason: 'No known contraindications. Different biological targets.',
        usageCompatibility: true
      }
    ]
  },
  'Ipamorelin': {
    compatible: [
      {
        peptide: 'CJC-1295',
        protocol: 'Ipamorelin (2-3x daily) + CJC-1295 (2x weekly): Classic GH secretagogue stack. GHRP + GHRH synergy provides superior GH pulse amplitude and duration vs either alone. Most popular GH peptide combination.',
        compatibilityReason: 'Synergistic GHRP + GHRH mechanisms acting on different receptor pathways',
        usageCompatibility: true
      },
      {
        peptide: 'Sermorelin',
        protocol: 'Ipamorelin (2-3x daily) + Sermorelin (nightly): Combined GHRP + GHRH for physiological GH elevation. Sermorelin at bedtime augments natural GH sleep pulse, Ipamorelin provides daytime pulses.',
        compatibilityReason: 'GHRP + GHRH synergy with gentler physiological profile',
        usageCompatibility: true
      }
    ]
  },
  'CJC-1295': {
    compatible: [
      {
        peptide: 'Ipamorelin',
        protocol: 'CJC-1295 (2x weekly) + Ipamorelin (2-3x daily): Gold standard GH peptide stack. CJC-1295 provides sustained GHRH baseline while Ipamorelin adds clean GH pulses without cortisol/prolactin elevation.',
        compatibilityReason: 'GHRH + GHRP synergy — complementary receptor targets',
        usageCompatibility: true
      }
    ]
  },
  'Semax': {
    compatible: [
      {
        peptide: 'Selank',
        protocol: 'Semax (morning intranasal) + Selank (morning/evening intranasal): Nootropic + anxiolytic combination. Semax provides cognitive enhancement via BDNF while Selank reduces anxiety via GABAergic modulation. Well-established combination in Russian clinical practice.',
        compatibilityReason: 'Complementary CNS mechanisms — cognitive enhancement + anxiolysis without receptor overlap',
        usageCompatibility: true
      }
    ]
  },
  'Selank': {
    compatible: [
      {
        peptide: 'Semax',
        protocol: 'Selank (2-3x daily intranasal) + Semax (2-3x daily intranasal): Balanced cognitive and anxiolytic stack. Both developed at same research institute and designed to be complementary. Non-sedating anxiolysis paired with focus enhancement.',
        compatibilityReason: 'Complementary nootropic + anxiolytic with different primary mechanisms',
        usageCompatibility: true
      }
    ]
  },
  'GHK-Cu': {
    compatible: [
      {
        peptide: 'BPC-157',
        protocol: 'GHK-Cu (daily) + BPC-157 (daily): Comprehensive tissue repair stack. GHK-Cu provides collagen synthesis and gene expression modulation while BPC-157 targets localized tissue repair via VEGF/NO pathways.',
        compatibilityReason: 'Complementary repair mechanisms — collagen remodeling + angiogenesis',
        usageCompatibility: true
      },
      {
        peptide: 'TB-500',
        protocol: 'GHK-Cu (daily) + TB-500 (2x weekly): Anti-aging and systemic repair combination. GHK-Cu supports skin/collagen health while TB-500 provides systemic cell migration and protection.',
        compatibilityReason: 'Different tissue repair mechanisms without receptor competition',
        usageCompatibility: true
      }
    ]
  },
  'KPV': {
    compatible: [
      {
        peptide: 'BPC-157',
        protocol: 'KPV (daily) + BPC-157 (daily): Anti-inflammatory + tissue repair stack. KPV reduces inflammation via NF-κB inhibition while BPC-157 promotes tissue healing. Commonly used for gut health protocols.',
        compatibilityReason: 'Complementary — inflammation reduction + active tissue repair',
        usageCompatibility: true
      }
    ]
  },
  'MOTS-c': {
    compatible: [
      {
        peptide: 'NAD+',
        protocol: 'MOTS-c (3-5x weekly) + NAD+ (IV weekly or SubQ daily): Mitochondrial optimization stack. MOTS-c activates AMPK pathways while NAD+ replenishes cellular coenzyme pools. Both target mitochondrial function through different mechanisms.',
        compatibilityReason: 'Complementary mitochondrial support — AMPK activation + NAD+ pool replenishment',
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
            Research <span className="text-[#dc2626]">Finder</span>
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
              <Activity className="w-8 h-8 text-[#dc2626]" />
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
                      ? 'bg-[#dc2626] border-[#dc2626] text-white shadow-lg shadow-red-100'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-[#dc2626]/50 hover:bg-slate-50 shadow-sm'
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
                <Sparkles className="w-5 h-5 text-[#dc2626]" />
                Analyze Research Data
              </motion.button>
              {selectedBenefits.length > 0 && (
                <button
                  onClick={resetSelection}
                  className="px-8 py-5 text-slate-400 hover:text-[#dc2626] font-black uppercase tracking-widest text-xs transition-colors"
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
                      <span className="px-4 py-1.5 bg-[#dc2626] text-white text-[10px] font-black uppercase tracking-widest rounded-full">Primary Recommendation</span>
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
                    <div className="text-6xl font-black text-[#dc2626] tracking-tighter mb-1">
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
                      <div className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
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
                      <Zap className="w-24 h-24 text-[#dc2626]" />
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
                            : 'bg-white border-slate-100 hover:border-[#dc2626]/30 hover:shadow-lg'
                        }`}
                        onClick={() => setExpandedPeptide(expandedPeptide === peptideName ? null : peptideName)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg ${
                              contraindication ? 'bg-red-100 text-[#dc2626]' : 'bg-slate-100 text-slate-900'
                            }`}>
                              {Math.round(data.matchPercentage)}%
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{peptideName}</h4>
                                {contraindication && (
                                  <span className="px-3 py-1 bg-[#dc2626] text-white text-[8px] font-black uppercase tracking-widest rounded-full">Contraindicated</span>
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
                                  <div className="bg-[#dc2626] text-white p-6 rounded-2xl flex items-start gap-4">
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
                  <Activity className="w-48 h-48 text-[#dc2626]" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-start gap-6 mb-10">
                    <div className="w-16 h-16 bg-[#dc2626] rounded-full flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Research <span className="text-[#dc2626]">Stacking Matrix</span></h3>
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
                          <div key={stackOption.peptide} className="bg-black/20 border border-white/5 rounded-[32px] p-8 hover:border-[#dc2626]/30 transition-all group">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="px-4 py-2 bg-[#dc2626] border border-red-500 rounded-xl">
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
              <Microscope className="w-8 h-8 text-[#dc2626]" />
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Clinical <span className="text-slate-400">Reference Library</span></h2>
            </div>
            <p className="text-slate-500 font-medium mb-12 text-lg max-w-3xl leading-relaxed">
              Every research material in our catalog is backed by peer-reviewed studies and undergoes rigorous purity verification.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(PEPTIDE_RESEARCH_DATA).map(([name, data]) => (
                <div key={name} className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight group-hover:text-[#dc2626] transition-colors">{name}</h3>
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
