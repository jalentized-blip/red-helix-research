import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, BookOpen, Beaker, FlaskConical, ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO';
import { generateFAQSchema, generateBreadcrumbSchema, generateWebPageSchema } from '@/components/utils/advancedSchemaHelpers';
import { InternalLinkFooter } from '@/components/RelatedPeptides';

// Comprehensive glossary for long-tail SEO keyword capture
const GLOSSARY_TERMS = [
  {
    term: 'Amino Acid',
    definition: 'The building blocks of peptides and proteins. There are 20 standard amino acids that combine in specific sequences to form peptides. Each amino acid has an amino group (-NH2), carboxyl group (-COOH), and a unique side chain that determines its properties.',
    related: ['Peptide Bond', 'Sequence', 'Residue'],
    category: 'Fundamentals'
  },
  {
    term: 'Bacteriostatic Water',
    definition: 'Sterile water containing 0.9% benzyl alcohol as a preservative to prevent bacterial growth. It is the standard solvent used to reconstitute lyophilized peptides for research. Unlike sterile water, it allows multiple withdrawals from the same vial without contamination risk.',
    related: ['Reconstitution', 'Lyophilization'],
    category: 'Preparation'
  },
  {
    term: 'Bioavailability',
    definition: 'The fraction of a compound that reaches systemic circulation and is available for biological activity. Peptide bioavailability varies depending on route of administration, with subcutaneous injection typically providing higher bioavailability than oral delivery due to enzymatic degradation in the GI tract.',
    related: ['Half-Life', 'Pharmacokinetics'],
    category: 'Pharmacology'
  },
  {
    term: 'BPC-157',
    definition: 'Body Protection Compound-157, a synthetic 15-amino-acid peptide derived from a portion of body protection compound found in human gastric juice. Sequence: GEPPPGKPADDAGLV. Molecular weight: ~1,419.55 Da. CAS: 137525-51-0. Studied for tissue repair and regeneration in research settings.',
    related: ['Gastric Peptide', 'Tissue Repair', 'Cytoprotection'],
    category: 'Peptides',
    link: { page: 'ProductBPC157', label: 'Buy BPC-157' }
  },
  {
    term: 'Certificate of Analysis (COA)',
    definition: 'A quality assurance document issued by a testing laboratory that confirms the identity, purity, and composition of a substance. For research peptides, COAs typically include HPLC purity data, mass spectrometry results, amino acid analysis, endotoxin levels, and sterility testing.',
    related: ['HPLC', 'Mass Spectrometry', 'Purity'],
    category: 'Quality'
  },
  {
    term: 'CJC-1295',
    definition: 'A synthetic analog of growth hormone-releasing hormone (GHRH) consisting of 29 amino acids. Molecular weight: ~3,647.28 Da. CAS: 863288-34-0. Available with or without DAC (Drug Affinity Complex). Studied for growth hormone secretion research.',
    related: ['GHRH', 'Growth Hormone', 'DAC'],
    category: 'Peptides'
  },
  {
    term: 'Cytoprotection',
    definition: 'The mechanism by which chemical compounds provide protection to cells against harmful agents or conditions. In peptide research, cytoprotective peptides like BPC-157 are studied for their ability to protect cells from oxidative stress, inflammation, and toxic damage.',
    related: ['BPC-157', 'Oxidative Stress', 'Neuroprotection'],
    category: 'Mechanisms'
  },
  {
    term: 'DAC (Drug Affinity Complex)',
    definition: 'A chemical modification added to certain peptides (notably CJC-1295) that extends their half-life by enabling binding to serum albumin. CJC-1295 with DAC has a half-life of 6-8 days versus minutes without DAC.',
    related: ['CJC-1295', 'Half-Life', 'Peptide Modification'],
    category: 'Modifications'
  },
  {
    term: 'Diluent',
    definition: 'A liquid used to dissolve or dilute a concentrated substance. In peptide research, common diluents include bacteriostatic water (0.9% benzyl alcohol), sterile water, and normal saline (0.9% NaCl). The choice of diluent affects peptide stability and shelf life.',
    related: ['Bacteriostatic Water', 'Reconstitution', 'Sterile Water'],
    category: 'Preparation'
  },
  {
    term: 'Endotoxin Testing',
    definition: 'A quality control procedure that detects bacterial endotoxins (lipopolysaccharides from gram-negative bacteria) in peptide preparations. The LAL (Limulus Amebocyte Lysate) test is the standard method. Research-grade peptides should have endotoxin levels below 5 EU/mg.',
    related: ['COA', 'Quality Control', 'Sterility'],
    category: 'Quality'
  },
  {
    term: 'Epithalon',
    definition: 'A synthetic tetrapeptide (Ala-Glu-Asp-Gly) studied for its effects on telomerase activation and cellular aging. Molecular weight: ~390.35 Da. CAS: 307297-39-8. Based on the natural peptide epithalamin extracted from the pineal gland.',
    related: ['Telomerase', 'Anti-Aging', 'Pineal Gland'],
    category: 'Peptides'
  },
  {
    term: 'GHK-Cu',
    definition: 'Copper peptide (glycyl-L-histidyl-L-lysine copper complex). Molecular weight: ~403.92 Da. CAS: 49557-75-7. A naturally occurring tripeptide-copper complex studied for wound healing, collagen synthesis, and anti-inflammatory properties in research.',
    related: ['Copper Peptide', 'Collagen', 'Wound Healing'],
    category: 'Peptides'
  },
  {
    term: 'GLP-1 (Glucagon-Like Peptide-1)',
    definition: 'An incretin hormone produced in the gut that stimulates insulin secretion, inhibits glucagon release, and slows gastric emptying. Synthetic GLP-1 receptor agonists like semaglutide and tirzepatide are studied for metabolic research.',
    related: ['Semaglutide', 'Tirzepatide', 'Incretin', 'GIP'],
    category: 'Mechanisms'
  },
  {
    term: 'GIP (Glucose-Dependent Insulinotropic Polypeptide)',
    definition: 'An incretin hormone that stimulates insulin secretion in response to glucose. Dual GLP-1/GIP agonists like tirzepatide target both incretin pathways simultaneously for enhanced metabolic effects in research settings.',
    related: ['GLP-1', 'Tirzepatide', 'Incretin'],
    category: 'Mechanisms'
  },
  {
    term: 'Half-Life',
    definition: 'The time required for the concentration of a substance to decrease by half. Peptide half-lives vary dramatically: BPC-157 has a short half-life of minutes, while CJC-1295 with DAC can persist for days. Half-life determines dosing frequency in research protocols.',
    related: ['Bioavailability', 'Pharmacokinetics', 'DAC'],
    category: 'Pharmacology'
  },
  {
    term: 'HPLC (High-Performance Liquid Chromatography)',
    definition: 'An analytical technique used to separate, identify, and quantify components in a mixture. In peptide analysis, reverse-phase HPLC is the gold standard for determining purity. Research-grade peptides typically require >98% purity by HPLC.',
    related: ['COA', 'Purity', 'Mass Spectrometry'],
    category: 'Quality'
  },
  {
    term: 'IGF-1 LR3',
    definition: 'A modified version of insulin-like growth factor 1 with an extended half-life due to an arginine substitution at position 3. Molecular weight: ~9,111 Da. CAS: 946870-92-4. Studied for cell proliferation and growth signaling research.',
    related: ['Growth Factor', 'Cell Proliferation'],
    category: 'Peptides'
  },
  {
    term: 'Ipamorelin',
    definition: 'A selective growth hormone secretagogue peptide consisting of 5 amino acids. Molecular weight: ~711.85 Da. CAS: 170851-70-4. Acts on ghrelin receptors to stimulate growth hormone release without significantly affecting cortisol or prolactin levels.',
    related: ['Growth Hormone', 'Ghrelin', 'CJC-1295'],
    category: 'Peptides'
  },
  {
    term: 'Lyophilization',
    definition: 'Also known as freeze-drying. A preservation process that removes water from a frozen product under vacuum. Peptides are lyophilized into a powder form for stability during storage and shipping. Lyophilized peptides must be reconstituted before use in research.',
    related: ['Reconstitution', 'Stability', 'Storage'],
    category: 'Preparation'
  },
  {
    term: 'Mass Spectrometry (MS)',
    definition: 'An analytical technique that measures the mass-to-charge ratio of ions. In peptide analysis, MS confirms molecular weight and sequence identity. MALDI-TOF and ESI-MS are common methods. Mass spec results are included in Certificates of Analysis.',
    related: ['HPLC', 'COA', 'Molecular Weight'],
    category: 'Quality'
  },
  {
    term: 'Melanotan II',
    definition: 'A synthetic analog of alpha-melanocyte stimulating hormone (α-MSH). Molecular weight: ~1,024.18 Da. CAS: 121062-08-6. A cyclic peptide studied for melanocortin receptor activation research.',
    related: ['Melanocortin', 'PT-141', 'α-MSH'],
    category: 'Peptides'
  },
  {
    term: 'Molecular Weight',
    definition: 'The sum of atomic weights of all atoms in a molecule, typically expressed in Daltons (Da) or grams per mole (g/mol). Peptide molecular weights range from ~300 Da (tripeptides) to >10,000 Da (large polypeptides). MW is used to verify peptide identity via mass spectrometry.',
    related: ['Mass Spectrometry', 'Dalton', 'Amino Acid'],
    category: 'Fundamentals'
  },
  {
    term: 'MOTS-c',
    definition: 'Mitochondrial-derived peptide encoded by the mitochondrial genome. Molecular weight: ~2,174.67 Da. CAS: 1627580-64-6. A 16-amino-acid peptide studied for its effects on metabolic homeostasis, exercise mimicry, and cellular energy regulation.',
    related: ['Mitochondria', 'Metabolism', 'Exercise Mimetic'],
    category: 'Peptides'
  },
  {
    term: 'Neuroprotection',
    definition: 'Mechanisms and strategies that protect neural cells from damage, degeneration, or death. Several research peptides including BPC-157, Semax, and Selank are studied for neuroprotective properties in preclinical research models.',
    related: ['BPC-157', 'Semax', 'Selank', 'Cytoprotection'],
    category: 'Mechanisms'
  },
  {
    term: 'Peptide',
    definition: 'A short chain of amino acids linked by peptide bonds. Peptides are generally defined as containing 2-50 amino acids, while longer chains are called proteins. Research peptides are synthetic molecules used to study biological mechanisms and receptor interactions in laboratory settings.',
    related: ['Amino Acid', 'Peptide Bond', 'Protein'],
    category: 'Fundamentals'
  },
  {
    term: 'Peptide Bond',
    definition: 'A covalent chemical bond formed between the carboxyl group of one amino acid and the amino group of another, releasing a water molecule (condensation reaction). Peptide bonds give peptides their characteristic structure and are cleaved by proteases.',
    related: ['Amino Acid', 'Peptide', 'Protease'],
    category: 'Fundamentals'
  },
  {
    term: 'Pharmacokinetics',
    definition: 'The study of how a substance is absorbed, distributed, metabolized, and excreted (ADME) in the body. Peptide pharmacokinetics are influenced by route of administration, molecular size, charge, and any chemical modifications (e.g., PEGylation, acylation).',
    related: ['Half-Life', 'Bioavailability', 'ADME'],
    category: 'Pharmacology'
  },
  {
    term: 'PT-141 (Bremelanotide)',
    definition: 'A synthetic melanocortin receptor agonist peptide. Molecular weight: ~1,025.18 Da. CAS: 189691-06-3. A cyclic heptapeptide derived from Melanotan II, studied for melanocortin pathway research.',
    related: ['Melanocortin', 'Melanotan II'],
    category: 'Peptides'
  },
  {
    term: 'Purity',
    definition: 'The percentage of the desired peptide in a sample relative to total content. Research-grade peptides typically have >98% purity as measured by HPLC. Higher purity reduces the presence of truncated sequences, deletion products, and other synthesis byproducts.',
    related: ['HPLC', 'COA', 'Quality Control'],
    category: 'Quality'
  },
  {
    term: 'Reconstitution',
    definition: 'The process of dissolving a lyophilized (freeze-dried) peptide powder in a suitable diluent. Standard procedure: add bacteriostatic water slowly to the vial at an angle, allow the peptide to dissolve without shaking, verify clarity, and refrigerate immediately.',
    related: ['Lyophilization', 'Bacteriostatic Water', 'Diluent'],
    category: 'Preparation',
    link: { page: 'PeptideReconstitutionGuide', label: 'View Reconstitution Guide' }
  },
  {
    term: 'Selank',
    definition: 'A synthetic heptapeptide analog of the immunomodulatory peptide tuftsin. Molecular weight: ~751.87 Da. CAS: 129954-34-3. Studied for anxiolytic effects, cognitive enhancement, and immune modulation in research.',
    related: ['Tuftsin', 'Nootropic', 'Semax'],
    category: 'Peptides'
  },
  {
    term: 'Semaglutide',
    definition: 'A synthetic 31-amino-acid GLP-1 receptor agonist peptide with an acylated fatty acid side chain for extended duration. Molecular weight: ~4,113.58 Da. CAS: 910463-68-2. Studied for metabolic regulation and glucose homeostasis research.',
    related: ['GLP-1', 'Tirzepatide', 'Incretin'],
    category: 'Peptides',
    link: { page: 'ProductSemaglutide', label: 'Buy Semaglutide' }
  },
  {
    term: 'Semax',
    definition: 'A synthetic heptapeptide analog of ACTH (4-10) with a Pro-Gly-Pro extension. Molecular weight: ~813.93 Da. CAS: 80714-61-0. Studied for neuroprotective and nootropic properties in research.',
    related: ['ACTH', 'Nootropic', 'Selank'],
    category: 'Peptides'
  },
  {
    term: 'Sequence',
    definition: 'The specific order of amino acids in a peptide chain, written from N-terminus to C-terminus using single-letter or three-letter amino acid codes. The sequence determines the peptide\'s 3D structure and biological activity. Example: BPC-157 sequence is GEPPPGKPADDAGLV.',
    related: ['Amino Acid', 'N-terminus', 'C-terminus'],
    category: 'Fundamentals'
  },
  {
    term: 'Sermorelin',
    definition: 'A synthetic 29-amino-acid analog of growth hormone-releasing hormone (GHRH). Molecular weight: ~3,357.93 Da. CAS: 86168-78-7. Contains the first 29 amino acids of the 44-amino-acid GHRH and retains full biological activity.',
    related: ['GHRH', 'Growth Hormone', 'CJC-1295'],
    category: 'Peptides'
  },
  {
    term: 'SS-31 (Elamipretide)',
    definition: 'A mitochondria-targeted tetrapeptide (D-Arg-Dmt-Lys-Phe-NH2). Molecular weight: ~640.77 Da. CAS: 736992-21-5. Studied for cardiolipin binding and mitochondrial membrane stabilization in research.',
    related: ['Mitochondria', 'Cardiolipin', 'MOTS-c'],
    category: 'Peptides'
  },
  {
    term: 'Stability',
    definition: 'The ability of a peptide to maintain its structure and activity over time under given conditions. Lyophilized peptides are stable at -20°C for years. Reconstituted peptides stored at 2-8°C in bacteriostatic water remain stable for 30+ days. Factors affecting stability include temperature, pH, light, and oxidation.',
    related: ['Lyophilization', 'Storage', 'Degradation'],
    category: 'Preparation'
  },
  {
    term: 'Subcutaneous Injection',
    definition: 'A method of administering compounds into the fatty tissue layer between skin and muscle. In peptide research, subcutaneous injection is the most common route of administration due to consistent absorption rates and relatively high bioavailability.',
    related: ['Bioavailability', 'Insulin Syringe'],
    category: 'Preparation'
  },
  {
    term: 'TB-500',
    definition: 'A synthetic peptide fragment of thymosin beta-4 (Tβ4) containing the actin-binding domain LKKTETQ. Molecular weight: ~4,963 Da. Studied for wound healing, tissue repair, and anti-inflammatory properties in research. Note: TB-500 refers to the active fragment, not full-length Tβ4.',
    related: ['Thymosin Beta-4', 'Actin', 'Wound Healing'],
    category: 'Peptides',
    link: { page: 'ProductTB500', label: 'Buy TB-500' }
  },
  {
    term: 'Tesamorelin',
    definition: 'A synthetic analog of growth hormone-releasing hormone (GHRH) with a trans-3-hexenoic acid modification. Molecular weight: ~5,135.87 Da. CAS: 218949-48-5. A 44-amino-acid peptide studied for growth hormone secretion research.',
    related: ['GHRH', 'Growth Hormone', 'Sermorelin'],
    category: 'Peptides'
  },
  {
    term: 'Thymosin Alpha-1',
    definition: 'A naturally occurring 28-amino-acid peptide originally isolated from thymosin fraction 5. Molecular weight: ~3,108 Da. CAS: 62304-98-7. Studied for immune modulation and T-cell maturation research.',
    related: ['Immune Modulation', 'T-Cell', 'Thymus'],
    category: 'Peptides'
  },
  {
    term: 'Tirzepatide',
    definition: 'A synthetic 39-amino-acid dual GLP-1/GIP receptor agonist peptide. Molecular weight: ~4,813.45 Da. CAS: 2023788-19-2. The first dual incretin agonist peptide, studied for its simultaneous activation of both GLP-1 and GIP receptors in metabolic research.',
    related: ['GLP-1', 'GIP', 'Semaglutide', 'Dual Agonist'],
    category: 'Peptides',
    link: { page: 'ProductTirzepatide', label: 'Buy Tirzepatide' }
  },
];

const CATEGORIES = ['All', 'Fundamentals', 'Peptides', 'Preparation', 'Quality', 'Pharmacology', 'Mechanisms', 'Modifications'];

export default function PeptideGlossary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS
      .filter(term => {
        const matchesSearch = searchQuery === '' ||
          term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
          term.definition.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || term.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery, selectedCategory]);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Research', url: '/LearnMore' },
    { name: 'Peptide Glossary', url: '/PeptideGlossary' }
  ];

  // Generate FAQ schema from glossary terms for rich snippets
  const faqItems = GLOSSARY_TERMS.slice(0, 10).map(term => ({
    question: `What is ${term.term}?`,
    answer: term.definition
  }));

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO
        title="Peptide Glossary — Research Terms, Definitions & Scientific Reference"
        description="Comprehensive peptide glossary with 40+ scientific terms. Learn about BPC-157, semaglutide, HPLC, reconstitution, COA, and more. Free educational resource for peptide researchers."
        keywords="peptide glossary, peptide terms, what is BPC-157, what is semaglutide, peptide definition, HPLC meaning, COA meaning, reconstitution guide, peptide research terms, peptide dictionary, research peptide education, peptide vocabulary"
        schema={[
          generateBreadcrumbSchema(breadcrumbs),
          generateWebPageSchema({
            path: '/PeptideGlossary',
            title: 'Peptide Research Glossary',
            description: 'Complete A-Z glossary of peptide research terms, definitions, and scientific reference material.'
          }),
          generateFAQSchema(faqItems)
        ]}
      />

      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link to={createPageUrl('LearnMore')}>
            <Button variant="ghost" className="text-slate-500 hover:text-[#dc2626] mb-6 font-bold uppercase tracking-widest text-[10px] p-0 hover:bg-transparent">
              <ArrowLeft className="w-3 h-3 mr-2" /> Back to Research
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[#dc2626]/10 rounded-2xl">
              <BookOpen className="w-8 h-8 text-[#dc2626]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter">
              Peptide <span className="text-[#dc2626]">Glossary</span>
            </h1>
          </div>
          <p className="text-slate-500 text-lg font-medium max-w-2xl leading-relaxed">
            Comprehensive A-Z reference of peptide research terminology. From amino acids to quality testing standards, understand the science behind research peptides.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626]/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#dc2626] text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Terms Count */}
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
          {filteredTerms.length} {filteredTerms.length === 1 ? 'term' : 'terms'} found
        </p>

        {/* Glossary Terms */}
        <div className="space-y-4">
          {filteredTerms.map((item, idx) => (
            <motion.div
              key={item.term}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.3) }}
              viewport={{ once: true }}
              className="bg-white border border-slate-200 rounded-[24px] p-6 md:p-8 hover:border-[#dc2626]/20 transition-colors"
              id={item.term.toLowerCase().replace(/[^a-z0-9]/g, '-')}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    {item.term}
                  </h2>
                  <span className="text-[9px] font-black text-[#dc2626] uppercase tracking-widest">
                    {item.category}
                  </span>
                </div>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed font-medium mb-4">
                {item.definition}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {item.related.map(rel => {
                  const relTerm = GLOSSARY_TERMS.find(t => t.term === rel);
                  return relTerm ? (
                    <a
                      key={rel}
                      href={`#${rel.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-500 hover:border-[#dc2626]/30 hover:text-[#dc2626] transition-colors"
                    >
                      {rel}
                    </a>
                  ) : (
                    <span key={rel} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-400">
                      {rel}
                    </span>
                  );
                })}

                {item.link && (
                  <Link
                    to={createPageUrl(item.link.page)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#dc2626]/10 rounded-full text-[10px] font-black text-[#dc2626] uppercase tracking-wider hover:bg-[#dc2626]/20 transition-colors ml-auto"
                  >
                    {item.link.label} <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTerms.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium">No matching terms found.</p>
            <p className="text-slate-400 text-sm mt-2">Try a different search term or category.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-slate-50 border border-slate-200 rounded-[32px] p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">
            Ready to Start <span className="text-[#dc2626]">Researching?</span>
          </h3>
          <p className="text-slate-500 font-medium text-sm mb-8 max-w-xl mx-auto">
            Browse our complete catalog of HPLC-verified research peptides with third-party COA verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl('Products')}>
              <Button className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-8 py-6 rounded-2xl font-black uppercase tracking-tighter text-sm">
                Browse Products
              </Button>
            </Link>
            <Link to={createPageUrl('PeptideComparison')}>
              <Button variant="outline" className="border-slate-200 text-slate-900 px-8 py-6 rounded-2xl font-black uppercase tracking-tighter text-sm hover:bg-white">
                Compare Peptides
              </Button>
            </Link>
            <Link to={createPageUrl('PeptideCalculator')}>
              <Button variant="outline" className="border-slate-200 text-slate-900 px-8 py-6 rounded-2xl font-black uppercase tracking-tighter text-sm hover:bg-white">
                Dosage Calculator
              </Button>
            </Link>
          </div>
        </div>

        <InternalLinkFooter />
      </div>
    </div>
  );
}
