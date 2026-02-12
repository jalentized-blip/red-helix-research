import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Microscope, 
  Dna, 
  Activity, 
  Database, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  FlaskConical,
  Binary,
  ScanLine,
  Beaker,
  Scale,
  Brain,
  Zap,
  Heart,
  Shield,
  Clock,
  Flame,
  Droplet
} from 'lucide-react';

const protocols = {
  metabolic: {
    id: 'metabolic',
    name: 'Metabolic Optimization',
    icon: Scale,
    description: 'Targeted GLP-1/GIP/Glucagon receptor research pathways.',
    primary: 'Retatrutide',
    synergistic: [
      { name: 'Tirzepatide', effect: 'Dual agonist reinforcement' },
      { name: 'Semaglutide', effect: 'Established GLP-1 baseline' },
      { name: 'MOTS-c', effect: 'Mitochondrial biogenesis support' }
    ],
    stats: {
      'Receptor Affinity': 'Triple Agonist',
      'Metabolic Rate': 'Enhanced',
      'Insulin Sensitivity': 'Optimized'
    },
    citations: [
      'PMID: 37385285 - Triple hormone receptor agonist effects',
      'PMID: 34135111 - Novel mechanisms in metabolic regulation',
      'PMID: 33581776 - GIP and GLP-1 receptor agonist efficacy'
    ]
  },
  recovery: {
    id: 'recovery',
    name: 'Tissue Regeneration',
    icon: Heart,
    description: 'Accelerated cellular repair, angiogenesis, and anti-inflammatory protocols.',
    primary: 'BPC-157',
    synergistic: [
      { name: 'TB-500', effect: 'Actin upregulation for mobility' },
      { name: 'BPC 157 + TB500 Blend', effect: 'Combined systemic healing' },
      { name: 'GHK-Cu', effect: 'Collagen synthesis activation' }
    ],
    stats: {
      'Angiogenesis': '+400%',
      'Fibroblast Activity': 'Enhanced',
      'Inflammation': 'Modulated'
    },
    citations: [
      'PMID: 21030672 - Pentadecapeptide BPC 157 and tissue healing',
      'PMID: 20534562 - Thymosin beta 4 in wound repair',
      'PMID: 25411603 - BPC 157 accelerates healing'
    ]
  },
  cognitive: {
    id: 'cognitive',
    name: 'Neuro-Enhancement',
    icon: Brain,
    description: 'Nootropic pathways for cognitive resilience, plasticity, and focus.',
    primary: 'Semax',
    synergistic: [
      { name: 'Selank', effect: 'Anxiolytic modulation' },
      { name: 'Pinealon', effect: 'Peptide bioregulation of cortex' },
      { name: 'Epithalon', effect: 'Circadian normalization' }
    ],
    stats: {
      'BDNF Expression': 'Upregulated',
      'Neuroprotection': 'Verified',
      'Anxiolytic Action': 'Significant'
    },
    citations: [
      'PMID: 16996699 - Semax effects on brain ischemia',
      'PMID: 18577961 - Selank anxiolytic mechanisms',
      'PMID: 12596526 - Peptide regulation of brain function'
    ]
  },
  performance: {
    id: 'performance',
    name: 'Athletic Performance',
    icon: Zap,
    description: 'Enhancement of physical output, endurance, and muscle synthesis.',
    primary: 'Tesofensine',
    synergistic: [
      { name: 'MOTS-c', effect: 'AICAR-like endurance boost' },
      { name: 'CJC-1295', effect: 'Sustained GH release' },
      { name: 'Ipamorelin', effect: 'Selective pulse secretion' }
    ],
    stats: {
      'Mitochondrial Function': 'Optimized',
      'Endurance Capacity': 'Increased',
      'Recovery Rate': 'Accelerated'
    },
    citations: [
      'PMID: 26970087 - Mitochondrial-derived peptide MOTS-c',
      'PMID: 16866631 - Tesofensine in weight management',
      'PMID: 16365538 - GH secretagogues and muscle growth'
    ]
  },
  longevity: {
    id: 'longevity',
    name: 'Longevity & Anti-Aging',
    icon: Clock,
    description: 'Telomere maintenance and circadian rhythm regulation.',
    primary: 'Epithalon',
    synergistic: [
      { name: 'Pinealon', effect: 'Neuro-protective synergy' },
      { name: 'MOTS-c', effect: 'Metabolic flexibility' },
      { name: 'GHK-Cu', effect: 'Skin & tissue remodeling' }
    ],
    stats: {
      'Telomerase Activity': 'Restored',
      'Circadian Rhythm': 'Normalized',
      'Oxidative Stress': 'Reduced'
    },
    citations: [
      'PMID: 14501183 - Epithalon and telomerase activity',
      'PMID: 12374972 - Peptide bioregulators in aging',
      'PMID: 29938167 - GHK peptide as a natural modulator'
    ]
  },
  immune: {
    id: 'immune',
    name: 'Immune Modulation',
    icon: Shield,
    description: 'Enhancement of host defense mechanisms and immune regulation.',
    primary: 'Thymosin Alpha-1',
    synergistic: [
      { name: 'LL-37', effect: 'Antimicrobial peptide defense' },
      { name: 'BPC-157', effect: 'Gut barrier integrity' },
      { name: 'Selank', effect: 'Stress-immune axis regulation' }
    ],
    stats: {
      'T-Cell Maturation': 'Stimulated',
      'Cytokine Balance': 'Regulated',
      'Viral Defense': 'Enhanced'
    },
    citations: [
      'PMID: 28405156 - Thymosin alpha 1 mechanism of action',
      'PMID: 28695123 - LL-37 immunomodulatory properties',
      'PMID: 19164227 - Peptides in immune regulation'
    ]
  },
  sexual_health: {
    id: 'sexual_health',
    name: 'Sexual Health',
    icon: Flame,
    description: 'Pathways involved in libido and reproductive function.',
    primary: 'PT-141',
    synergistic: [
      { name: 'Kisspeptin', effect: 'Hormonal signaling initiator' },
      { name: 'Melanotan 2', effect: 'MC receptor cross-activation' }
    ],
    stats: {
      'Receptor Activation': 'MC3/MC4',
      'Libido Index': 'Enhanced',
      'Circulation': 'Improved'
    },
    citations: [
      'PMID: 15155948 - PT-141 for sexual dysfunction',
      'PMID: 16893393 - Kisspeptin and reproductive function',
      'PMID: 12956551 - Melanocortin agonists'
    ]
  },
  general: {
    id: 'general',
    name: 'General Research',
    icon: Beaker,
    description: 'Fundamental research tools including reconstitution supplies.',
    primary: 'BAC Water',
    synergistic: [
      { name: 'Sterile Vials', effect: 'Secure compound storage' },
      { name: 'Syringes', effect: 'Precision measurement tools' },
      { name: 'Alcohol Prep', effect: 'Aseptic technique protocol' }
    ],
    stats: {
      'Purity': 'USP Grade',
      'Sterility': 'Verified',
      'Compatibility': 'Universal'
    },
    citations: [
      'USP <797> - Pharmaceutical Compounding - Sterile Preparations',
      'USP <71> - Sterility Tests',
      'Standard Laboratory Protocols'
    ]
  }
};



export default function ProtocolEngine() {
  const [activeProtocol, setActiveProtocol] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const handleProtocolSelect = (key) => {
    setIsScanning(true);
    setActiveProtocol(null);
    setScanProgress(0);
    
    // Simulate scanning sequence
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setActiveProtocol(protocols[key]);
          return 100;
        }
        return prev + 5;
      });
    }, 50);
  };

  return (
    <section className="py-24 px-4 bg-neutral-50 relative overflow-hidden text-neutral-900">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
      
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-white pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
          
          {/* Left Column: Control Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-neutral-100 pb-4">
                <div className="w-3 h-3 bg-[#dc2626] rounded-full animate-pulse" />
                <h3 className="font-mono text-sm text-neutral-500 tracking-widest">PROTOCOL_ENGINE_V2.1</h3>
              </div>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
                <p className="text-neutral-500 text-sm mb-4 font-mono sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-2 border-b border-neutral-100">SELECT RESEARCH OBJECTIVE:</p>
                {Object.entries(protocols).map(([key, protocol]) => (
                  <button
                    key={key}
                    onClick={() => handleProtocolSelect(key)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 group ${
                      activeProtocol?.id === key 
                        ? 'bg-[#dc2626] border-red-500 text-white shadow-lg shadow-red-900/20' 
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-white hover:border-red-200 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${activeProtocol?.id === key ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-600 group-hover:bg-[#dc2626] group-hover:text-white'}`}>
                      <protocol.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">{protocol.name}</div>
                      <div className={`text-xs ${activeProtocol?.id === key ? 'text-red-100' : 'text-neutral-400'}`}>
                        Initialize Simulation
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${activeProtocol?.id === key ? 'rotate-90' : ''}`} />
                  </button>
                ))}
              </div>

              {/* System Status */}
              <div className="mt-8 p-4 bg-neutral-50 rounded-lg border border-neutral-200 font-mono text-xs text-neutral-500 space-y-2">
                <div className="flex justify-between">
                  <span>SYSTEM_STATUS</span>
                  <span className="text-green-600 font-bold">ONLINE</span>
                </div>
                <div className="flex justify-between">
                  <span>DATABASE_VER</span>
                  <span>4.0.2</span>
                </div>
                <div className="flex justify-between">
                  <span>PEPTIDE_INDEX</span>
                  <span>LOADED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Visualization */}
          <div className="lg:col-span-8 bg-white/60 backdrop-blur-sm border border-neutral-200 rounded-2xl p-8 relative overflow-hidden flex flex-col shadow-2xl shadow-neutral-200/50">
            {/* Header Details */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-2 text-[#dc2626]">ADVANCED PROTOCOL SIMULATION</h2>
                <p className="text-neutral-500 font-mono text-sm">Visualize synergy and mechanism of action.</p>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-500 border border-neutral-200">
                  MODE: INTERACTIVE
                </div>
              </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="flex-1 flex items-center justify-center relative min-h-[400px]">
              <AnimatePresence mode="wait">
                {!activeProtocol && !isScanning && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-neutral-400"
                  >
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className="absolute inset-0 border-2 border-neutral-200 rounded-full animate-ping opacity-20" />
                      <div className="absolute inset-0 border border-neutral-200 rounded-full animate-[spin_10s_linear_infinite]" />
                      <div className="absolute inset-4 border border-neutral-200 rounded-full animate-[spin_8s_linear_infinite_reverse]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ScanLine className="w-12 h-12 text-neutral-300" />
                      </div>
                    </div>
                    <p className="font-mono">AWAITING INPUT_</p>
                  </motion.div>
                )}

                {isScanning && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full max-w-md"
                  >
                    <div className="flex justify-between font-mono text-xs text-[#dc2626] mb-2">
                      <span>ANALYZING_COMPOUNDS...</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-[#dc2626]"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-8 opacity-50">
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="h-8 bg-neutral-200 rounded"
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeProtocol && (
                  <motion.div
                    key={activeProtocol.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    {/* Primary Compound Visualization */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-[#dc2626]/5 blur-3xl rounded-full group-hover:bg-[#dc2626]/10 transition-all" />
                      <div className="relative bg-white border border-neutral-200 p-6 rounded-2xl h-full flex flex-col items-center justify-center text-center shadow-lg shadow-neutral-100">
                        <div className="w-20 h-20 bg-[#dc2626] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#dc2626]/20">
                          <FlaskConical className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-neutral-900">{activeProtocol.primary}</h3>
                        <p className="text-neutral-500 text-sm mb-4">{activeProtocol.description}</p>
                        <div className="w-full h-px bg-neutral-100 my-4" />
                        <div className="w-full space-y-2">
                          {Object.entries(activeProtocol.stats).map(([label, value]) => (
                            <div key={label} className="flex justify-between text-xs font-mono">
                              <span className="text-neutral-500">{label}</span>
                              <span className="text-[#dc2626] font-bold">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Synergy Stack */}
                    <div className="flex flex-col gap-4">
                      <h4 className="font-mono text-xs text-neutral-400 uppercase mb-2">Synergistic Compounds Detected:</h4>
                      {activeProtocol.synergistic.map((compound, idx) => (
                        <motion.div
                          key={compound.name}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: idx * 0.2 }}
                          className="bg-white border border-neutral-200 p-4 rounded-xl flex items-center justify-between group hover:border-red-200 hover:shadow-md hover:shadow-red-50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#dc2626] shrink-0" />
                            <div>
                              <div className="font-bold text-neutral-900">{compound.name}</div>
                              <div className="text-xs text-neutral-500 font-mono group-hover:text-[#dc2626] transition-colors">
                                {compound.effect}
                              </div>
                            </div>
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider hidden sm:block">
                            + SYNERGY
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Live Citation Feed */}
                      <div className="mt-auto bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                        <div className="flex items-center gap-2 mb-2 text-xs text-neutral-500 font-mono">
                          <Database className="w-3 h-3" />
                          <span>LATEST_CITATIONS</span>
                        </div>
                        <div className="space-y-2">
                          {activeProtocol.citations.map((cite, i) => (
                            <div key={i} className="text-[10px] text-neutral-400 border-l-2 border-neutral-300 pl-2 hover:border-red-500 transition-colors">
                              {cite}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Decorative Corner UI */}
            <div className="absolute top-0 right-0 p-4 opacity-50">
               <div className="flex gap-1">
                 <div className="w-1 h-1 bg-[#dc2626] rounded-full" />
                 <div className="w-1 h-1 bg-neutral-300 rounded-full" />
                 <div className="w-1 h-1 bg-neutral-300 rounded-full" />
               </div>
            </div>
            <div className="absolute bottom-0 left-0 p-4 opacity-50">
               <Binary className="w-4 h-4 text-neutral-300" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}