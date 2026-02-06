import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Activity, TrendingUp, Circle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MECHANISMS = [
  {
    id: 'bpc157',
    name: 'BPC-157',
    title: 'Tissue Repair & Angiogenesis',
    description: 'Body Protection Compound promotes healing through multiple pathways',
    pathways: [
      {
        step: 1,
        title: 'Initial Contact & Binding',
        description: 'BPC-157 peptide enters bloodstream and travels to injury site',
        detail: 'The 15-amino acid sequence navigates through circulation, recognizing damaged tissue via chemotactic signals. Upon arrival, the peptide makes initial contact with growth factor receptors (VEGFR, EGFR) embedded in cell membranes.',
        visualElements: ['peptide', 'bloodstream', 'receptor'],
        duration: 3
      },
      {
        step: 2,
        title: 'Receptor Activation & Signal Cascade',
        description: 'Growth factor receptors undergo conformational change, initiating intracellular signaling',
        detail: 'Receptor binding triggers autophosphorylation of tyrosine residues, activating downstream kinases (PI3K/AKT, MAPK/ERK). This cascade amplifies the signal from a single peptide molecule to thousands of intracellular messengers.',
        visualElements: ['receptor', 'phosphorylation', 'kinase-cascade'],
        duration: 3
      },
      {
        step: 3,
        title: 'VEGF Gene Expression & Protein Synthesis',
        description: 'Nuclear transcription factors activate VEGF gene, producing angiogenic proteins',
        detail: 'Activated signaling molecules translocate to nucleus, binding to DNA promoter regions. RNA polymerase transcribes VEGF mRNA, which exits nucleus for ribosomal translation into functional VEGF protein ready for secretion.',
        visualElements: ['nucleus', 'dna', 'mrna', 'protein'],
        duration: 4
      },
      {
        step: 4,
        title: 'Angiogenesis Initiation',
        description: 'VEGF stimulates endothelial cells to sprout new blood vessels',
        detail: 'Secreted VEGF binds to endothelial cells lining existing vessels. These cells begin degrading basement membrane, proliferating, and migrating toward injury site in coordinated manner, forming new capillary networks.',
        visualElements: ['blood-vessel', 'sprouting', 'endothelial'],
        duration: 4
      },
      {
        step: 5,
        title: 'Fibroblast Recruitment & Migration',
        description: 'Fibroblasts migrate to wound site along chemotactic gradient',
        detail: 'BPC-157 modulates FAK (focal adhesion kinase) and enhances fibroblast motility. Cells extend lamellipodia, attach to extracellular matrix via integrins, and pull themselves toward injury using actin-myosin contraction.',
        visualElements: ['fibroblast', 'migration', 'matrix'],
        duration: 4
      },
      {
        step: 6,
        title: 'Collagen Synthesis & Deposition',
        description: 'Fibroblasts produce and organize structural collagen proteins',
        detail: 'Activated fibroblasts upregulate collagen I and III synthesis. Procollagen molecules are secreted, cleaved into tropocollagen, then self-assemble into strong triple-helix fibrils that provide tensile strength to healing tissue.',
        visualElements: ['collagen', 'fibrils', 'deposition'],
        duration: 4
      },
      {
        step: 7,
        title: 'Tissue Remodeling & Inflammation Resolution',
        description: 'Matrix metalloproteinases organize scar tissue while inflammation subsides',
        detail: 'BPC-157 modulates MMP and TIMP expression for controlled remodeling. Pro-inflammatory cytokines (TNF-α, IL-6) decrease while anti-inflammatory factors increase. Tissue gradually transitions from granulation to organized scar.',
        visualElements: ['remodeling', 'inflammation', 'completion'],
        duration: 5
      }
    ],
    color: 'from-green-600 to-green-700'
  },
  {
    id: 'glp1',
    name: 'GLP-1 Agonists',
    title: 'Metabolic Regulation Pathway',
    description: 'How Semaglutide/Tirzepatide affect cellular metabolism',
    pathways: [
      {
        step: 1,
        title: 'Subcutaneous Injection & Systemic Distribution',
        description: 'GLP-1 agonist enters subcutaneous tissue and absorbs into circulation',
        detail: 'Modified peptide structure (fatty acid chain in semaglutide) allows albumin binding, extending half-life from minutes to days. Molecule travels through lymphatic and venous systems, achieving steady-state concentration over 4-5 weeks.',
        visualElements: ['injection', 'absorption', 'circulation'],
        duration: 3
      },
      {
        step: 2,
        title: 'GLP-1R Recognition & Binding',
        description: 'Peptide recognizes and binds to GLP-1 receptors on target cells',
        detail: 'The 7-transmembrane G-protein coupled receptor (GLP-1R) spans cell membrane. Peptide binding to extracellular domain causes conformational shift, exposing intracellular binding sites for G-proteins (Gαs subunit).',
        visualElements: ['receptor', 'binding', 'gpcr'],
        duration: 3
      },
      {
        step: 3,
        title: 'G-Protein Activation & cAMP Production',
        description: 'GDP-GTP exchange activates adenylyl cyclase enzyme',
        detail: 'Activated Gαs-GTP complex dissociates and binds adenylyl cyclase on inner membrane. This enzyme catalyzes conversion of ATP to cyclic AMP (cAMP), amplifying signal 100-fold. One receptor can activate multiple G-proteins.',
        visualElements: ['g-protein', 'camp', 'amplification'],
        duration: 4
      },
      {
        step: 4,
        title: 'PKA Activation & Ion Channel Modulation',
        description: 'Elevated cAMP activates protein kinase A, modulating cellular machinery',
        detail: 'cAMP binds regulatory subunits of PKA, releasing active catalytic subunits. PKA phosphorylates KATP channels (closing them) and voltage-gated calcium channels (opening them), setting stage for insulin secretion.',
        visualElements: ['pka', 'channels', 'calcium'],
        duration: 4
      },
      {
        step: 5,
        title: 'Glucose-Dependent Insulin Release',
        description: 'Calcium influx triggers insulin granule exocytosis in beta cells',
        detail: 'Elevated intracellular calcium binds synaptotagmin proteins on insulin granules. SNARE complex proteins (syntaxin, SNAP-25, VAMP2) dock and fuse granules with plasma membrane, releasing insulin into bloodstream only when glucose is elevated.',
        visualElements: ['calcium', 'granules', 'exocytosis'],
        duration: 4
      },
      {
        step: 6,
        title: 'Gastric Motility Reduction',
        description: 'GLP-1R activation in stomach and gut slows digestive transit',
        detail: 'Receptors on gastric smooth muscle and enteric neurons reduce pacemaker activity and peristaltic contractions. Delayed gastric emptying extends nutrient absorption time and reduces postprandial glucose spikes.',
        visualElements: ['stomach', 'motility', 'delay'],
        duration: 4
      },
      {
        step: 7,
        title: 'Hypothalamic Appetite Suppression',
        description: 'Central GLP-1R activation in brain reduces hunger signals',
        detail: 'Peptide crosses blood-brain barrier via circumventricular organs. Binding to GLP-1R in arcuate nucleus inhibits NPY/AgRP neurons (hunger signals) while activating POMC neurons (satiety signals), reducing appetite and food-seeking behavior.',
        visualElements: ['brain', 'hypothalamus', 'satiety'],
        duration: 5
      }
    ],
    color: 'from-blue-600 to-blue-700'
  },
  {
    id: 'tb500',
    name: 'TB-500',
    title: 'Cell Migration & Differentiation',
    description: 'Thymosin Beta-4 mechanism for tissue recovery',
    pathways: [
      {
        step: 1,
        title: 'Systemic Distribution & Cellular Uptake',
        description: 'TB-500 travels through circulation and enters target cells',
        detail: 'The 43-amino acid peptide (small enough for rapid tissue penetration) distributes systemically. Its positive charge facilitates interaction with negatively-charged cell membranes, enabling direct uptake via endocytosis and membrane translocation.',
        visualElements: ['peptide', 'circulation', 'uptake'],
        duration: 3
      },
      {
        step: 2,
        title: 'G-Actin Sequestration',
        description: 'TB-500 binds monomeric actin, controlling polymerization dynamics',
        detail: 'Each TB-500 molecule binds one G-actin monomer in 1:1 ratio via high-affinity interaction. This sequesters actin pool, preventing spontaneous polymerization until needed. Binding also blocks ATP-hydrolysis on actin, maintaining "ready" state.',
        visualElements: ['actin', 'monomer', 'binding'],
        duration: 4
      },
      {
        step: 3,
        title: 'Focal Adhesion Assembly',
        description: 'Promotes formation of integrin-based cell-matrix attachments',
        detail: 'TB-500 upregulates integrin expression and activates focal adhesion kinase (FAK). Integrins cluster at membrane, recruiting structural proteins (talin, vinculin, paxillin) to form stable attachments between intracellular actin and extracellular matrix.',
        visualElements: ['integrin', 'adhesion', 'matrix'],
        duration: 4
      },
      {
        step: 4,
        title: 'Lamellipodial Extension & Cell Polarization',
        description: 'Cells extend leading edge protrusions toward injury site',
        detail: 'Regulated actin release from TB-500 allows rapid polymerization at cell front. Arp2/3 complex nucleates branched actin networks, pushing membrane forward. Rear contracts via myosin II, creating front-rear polarity essential for migration.',
        visualElements: ['lamellipod', 'protrusion', 'polarization'],
        duration: 4
      },
      {
        step: 5,
        title: 'Directional Migration Along Chemotactic Gradient',
        description: 'Cells follow chemical signals to wound site with precision',
        detail: 'TB-500 enhances chemokine receptor sensitivity. Cells detect gradient of growth factors and cytokines, continuously reorienting lamellipodia toward higher concentration. Migration occurs via coordinated cycles of protrusion, adhesion, contraction, and detachment.',
        visualElements: ['migration', 'gradient', 'movement'],
        duration: 4
      },
      {
        step: 6,
        title: 'Stem Cell Recruitment & Differentiation Priming',
        description: 'Mobilizes progenitor cells and initiates differentiation programs',
        detail: 'TB-500 modulates Notch and Wnt signaling pathways in stem cells. This promotes migration from niches (bone marrow, satellite cells) while initiating transcription factor cascades (MyoD for muscle, Sox9 for cartilage) that commit cells to specific lineages.',
        visualElements: ['stem-cell', 'differentiation', 'lineage'],
        duration: 4
      },
      {
        step: 7,
        title: 'Anti-Inflammatory Cascade & Tissue Remodeling',
        description: 'Shifts inflammatory balance toward resolution and healing',
        detail: 'TB-500 inhibits NF-κB pathway, reducing pro-inflammatory cytokines (IL-1β, TNF-α). Simultaneously upregulates IL-10 and TGF-β (anti-inflammatory). Promotes M2 macrophage polarization (healing phenotype) and balanced MMP activity for proper scar formation.',
        visualElements: ['inflammation', 'cytokines', 'resolution'],
        duration: 5
      }
    ],
    color: 'from-purple-600 to-purple-700'
  }
];

// Visual element renderers
const VisualElement = ({ type, isActive }) => {
  const elements = {
    peptide: <motion.div animate={{ scale: isActive ? [1, 1.2, 1] : 1 }} transition={{ duration: 2, repeat: isActive ? Infinity : 0 }} className={`w-8 h-8 rounded-full ${isActive ? 'bg-green-500' : 'bg-green-500/30'} border-2 border-green-300`} />,
    receptor: <motion.div animate={{ rotate: isActive ? [0, 10, -10, 0] : 0 }} transition={{ duration: 2, repeat: isActive ? Infinity : 0 }} className={`w-10 h-16 ${isActive ? 'bg-blue-500' : 'bg-blue-500/30'} rounded-lg border-2 border-blue-300`} />,
    bloodstream: <motion.div animate={{ x: isActive ? [0, 100, 0] : 0 }} transition={{ duration: 3, repeat: isActive ? Infinity : 0 }} className="w-full h-0.5 bg-gradient-to-r from-red-600 via-red-400 to-red-600" />,
    nucleus: <motion.div animate={{ opacity: isActive ? [1, 0.6, 1] : 0.4 }} transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }} className={`w-16 h-16 rounded-full ${isActive ? 'bg-purple-500' : 'bg-purple-500/30'} border-4 border-purple-300`} />,
    dna: <motion.div animate={{ scaleX: isActive ? [1, 1.1, 1] : 1 }} transition={{ duration: 2, repeat: isActive ? Infinity : 0 }} className="flex flex-col gap-1">
      {[...Array(3)].map((_, i) => <div key={i} className={`h-1 ${isActive ? 'bg-amber-400' : 'bg-amber-400/30'} rounded`} style={{ width: `${20 + i * 10}px` }} />)}
    </motion.div>,
    calcium: <motion.div animate={{ y: isActive ? [0, -10, 0] : 0, opacity: isActive ? [0.6, 1, 0.6] : 0.3 }} transition={{ duration: 1, repeat: isActive ? Infinity : 0 }} className="grid grid-cols-3 gap-1">
      {[...Array(6)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${isActive ? 'bg-yellow-400' : 'bg-yellow-400/30'}`} />)}
    </motion.div>,
    'blood-vessel': <svg width="60" height="60" viewBox="0 0 60 60"><motion.path animate={{ strokeDashoffset: isActive ? [100, 0] : 100 }} transition={{ duration: 2, repeat: isActive ? Infinity : 0 }} d="M10,30 Q20,10 30,30 T50,30" stroke={isActive ? '#ef4444' : '#ef444440'} strokeWidth="3" fill="none" strokeDasharray="5,5" /></svg>,
    fibroblast: <motion.div animate={{ x: isActive ? [0, 20, 0] : 0 }} transition={{ duration: 3, repeat: isActive ? Infinity : 0 }} className={`w-12 h-8 ${isActive ? 'bg-cyan-500' : 'bg-cyan-500/30'} rounded-full border-2 border-cyan-300`} />,
    collagen: <motion.div className="flex gap-1">
      {[...Array(4)].map((_, i) => <motion.div key={i} animate={{ scaleY: isActive ? [0, 1] : 0 }} transition={{ duration: 0.5, delay: i * 0.2 }} className={`w-1 h-12 ${isActive ? 'bg-orange-500' : 'bg-orange-500/30'} rounded`} />)}
    </motion.div>,
    brain: <motion.div animate={{ scale: isActive ? [1, 1.05, 1] : 1 }} transition={{ duration: 2, repeat: isActive ? Infinity : 0 }} className={`w-16 h-12 ${isActive ? 'bg-pink-500' : 'bg-pink-500/30'} rounded-t-full border-2 border-pink-300`} />,
  };
  return elements[type] || <Circle className={`w-8 h-8 ${isActive ? 'text-stone-400' : 'text-stone-600'}`} />;
};

export default function MechanismVisualizer({ onBack }) {
  const [selectedMechanism, setSelectedMechanism] = useState(MECHANISMS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [autoPlayTimeout, setAutoPlayTimeout] = useState(null);

  useEffect(() => {
    return () => {
      if (autoPlayTimeout) clearTimeout(autoPlayTimeout);
    };
  }, [autoPlayTimeout]);

  const handlePlay = () => {
    setIsPlaying(true);
    setCurrentStep(1);
    animateSteps();
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (autoPlayTimeout) {
      clearTimeout(autoPlayTimeout);
      setAutoPlayTimeout(null);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    if (autoPlayTimeout) {
      clearTimeout(autoPlayTimeout);
      setAutoPlayTimeout(null);
    }
  };

  const animateSteps = () => {
    let cumulativeTime = 0;
    
    selectedMechanism.pathways.forEach((pathway, idx) => {
      cumulativeTime += pathway.duration * 1000;
      
      const timeout = setTimeout(() => {
        setCurrentStep(idx + 1);
        setProgress(((idx + 1) / selectedMechanism.pathways.length) * 100);
        
        if (idx === selectedMechanism.pathways.length - 1) {
          setIsPlaying(false);
        }
      }, cumulativeTime);
      
      setAutoPlayTimeout(timeout);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Academy
        </Button>
        <div className="flex items-center gap-2 text-stone-400 text-sm">
          <Activity className="w-4 h-4" />
          Interactive Mechanism Visualizer
        </div>
      </div>

      {/* Mechanism Selector */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {MECHANISMS.map((mechanism) => (
          <button
            key={mechanism.id}
            onClick={() => {
              setSelectedMechanism(mechanism);
              handleReset();
            }}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              selectedMechanism.id === mechanism.id
                ? 'bg-gradient-to-br ' + mechanism.color + ' border-white/30'
                : 'bg-stone-900/60 border-stone-700 hover:border-stone-600'
            }`}
          >
            <h3 className="text-lg font-bold text-amber-50 mb-1">{mechanism.name}</h3>
            <p className="text-sm text-stone-300">{mechanism.title}</p>
          </button>
        ))}
      </div>

      {/* Main Visualization Area */}
      <div className="bg-stone-900/60 border border-stone-700 rounded-2xl p-8 mb-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-amber-50 mb-2">
            {selectedMechanism.name}
          </h2>
          <p className="text-stone-400">{selectedMechanism.description}</p>
        </div>

        {/* Pathway Visualization */}
        <div className="relative">
          {/* Progress Bar */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${selectedMechanism.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-sm font-bold text-stone-400">
              Step {currentStep} / {selectedMechanism.pathways.length}
            </div>
          </div>

          {/* Visual Flow Diagram */}
          <div className="mb-8 bg-stone-800/50 border border-stone-700 rounded-xl p-6 min-h-[200px]">
            <div className="flex items-center justify-around flex-wrap gap-8">
              {selectedMechanism.pathways[currentStep - 1]?.visualElements?.map((element, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.3 }}
                  className="flex flex-col items-center gap-3"
                >
                  <VisualElement type={element} isActive={isPlaying && currentStep > 0} />
                  <span className="text-xs text-stone-400 capitalize">{element.replace('-', ' ')}</span>
                  {idx < (selectedMechanism.pathways[currentStep - 1]?.visualElements?.length - 1) && (
                    <ArrowRight className="absolute text-stone-600" style={{ left: '50%', transform: 'translateX(50px)' }} />
                  )}
                </motion.div>
              )) || (
                <div className="text-center text-stone-500 py-12">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Press Play to visualize the mechanism</p>
                </div>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {selectedMechanism.pathways.map((pathway, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0.3, x: -20 }}
                animate={{
                  opacity: currentStep >= pathway.step ? 1 : 0.3,
                  x: currentStep >= pathway.step ? 0 : -20,
                  scale: currentStep === pathway.step ? 1.02 : 1
                }}
                transition={{ duration: 0.5 }}
                className={`relative rounded-xl border-2 overflow-hidden ${
                  currentStep >= pathway.step
                    ? 'bg-gradient-to-r ' + selectedMechanism.color + '/10 border-white/20 shadow-lg'
                    : 'bg-stone-800/30 border-stone-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start gap-4 p-4 border-b border-stone-700/50">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                    currentStep >= pathway.step
                      ? 'bg-gradient-to-br ' + selectedMechanism.color + ' text-white shadow-lg'
                      : 'bg-stone-700 text-stone-400'
                  }`}>
                    {pathway.step}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-amber-50 mb-1 flex items-center gap-2">
                      {pathway.title}
                      {currentStep === pathway.step && isPlaying && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 bg-green-500 rounded-full"
                        />
                      )}
                    </h3>
                    <p className="text-sm text-stone-400">
                      {pathway.description}
                    </p>
                  </div>
                </div>

                {/* Detailed Explanation */}
                <AnimatePresence>
                  {currentStep >= pathway.step && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-4 pb-4"
                    >
                      <div className="pt-4 border-t border-stone-700/30">
                        <div className="flex items-start gap-3">
                          <Zap className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                          <p className="text-sm text-stone-300 leading-relaxed">
                            {pathway.detail}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-8 pt-8 border-t border-stone-700">
          <Button
            onClick={isPlaying ? handlePause : handlePlay}
            size="lg"
            className="px-8"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Play Animation
              </>
            )}
          </Button>
          <Button
            onClick={handleReset}
            size="lg"
            variant="outline"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-2 border-blue-600/30 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Zap className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-amber-50 mb-2">
              Key Research Insights
            </h3>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>• Understanding mechanisms helps optimize research protocols</li>
              <li>• Each peptide operates through distinct cellular pathways</li>
              <li>• Timing and dosing considerations based on mechanism duration</li>
              <li>• Synergistic effects possible when combining complementary pathways</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}