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
  Beaker
} from 'lucide-react';

const protocols = {
  metabolic: {
    id: 'metabolic',
    name: 'Metabolic Optimization',
    icon: Activity,
    description: 'Targeted GLP-1/GIP receptor research pathways.',
    primary: 'Retatrutide',
    synergistic: ['MOTS-c', 'Tesofensine'],
    stats: {
      'Receptor Affinity': '98.4%',
      'Half-Life': '144h',
      'Bioavailability': 'High'
    },
    citations: [
      'PMID: 37385285 - Triple hormone receptor agonist effects',
      'PMID: 34135111 - Novel mechanisms in metabolic regulation'
    ]
  },
  recovery: {
    id: 'recovery',
    name: 'Tissue Regeneration',
    icon: Dna,
    description: 'Accelerated cellular repair and angiogenesis protocols.',
    primary: 'BPC-157',
    synergistic: ['TB-500', 'GHK-Cu'],
    stats: {
      'Angiogenesis': '+400%',
      'Fibroblast Activity': 'Enhanced',
      'Inflammation': 'Modulated'
    },
    citations: [
      'PMID: 21030672 - Pentadecapeptide BPC 157 and tissue healing',
      'PMID: 20534562 - Thymosin beta 4 in wound repair'
    ]
  },
  cognitive: {
    id: 'cognitive',
    name: 'Neuro-Enhancement',
    icon: Brain,
    description: 'Nootropic pathways for cognitive resilience and plasticity.',
    primary: 'Semax',
    synergistic: ['Selank', 'Pinealon'],
    stats: {
      'BDNF Expression': 'Upregulated',
      'Neuroprotection': 'Verified',
      'Focus Index': '9.8/10'
    },
    citations: [
      'PMID: 16996699 - Semax effects on brain ischemia',
      'PMID: 18577961 - Selank anxiolytic mechanisms'
    ]
  }
};

function Brain(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

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
    <section className="py-24 px-4 bg-slate-950 relative overflow-hidden text-white">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/0 via-slate-950/50 to-slate-950 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
          
          {/* Left Column: Control Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <h3 className="font-mono text-sm text-slate-400 tracking-widest">PROTOCOL_ENGINE_V2.1</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-slate-400 text-sm mb-4 font-mono">SELECT RESEARCH OBJECTIVE:</p>
                {Object.entries(protocols).map(([key, protocol]) => (
                  <button
                    key={key}
                    onClick={() => handleProtocolSelect(key)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 group ${
                      activeProtocol?.id === key 
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20' 
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${activeProtocol?.id === key ? 'bg-white/20' : 'bg-slate-700 group-hover:bg-slate-600'}`}>
                      <protocol.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">{protocol.name}</div>
                      <div className={`text-xs ${activeProtocol?.id === key ? 'text-red-100' : 'text-slate-500'}`}>
                        Initialize Simulation
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${activeProtocol?.id === key ? 'rotate-90' : ''}`} />
                  </button>
                ))}
              </div>

              {/* System Status */}
              <div className="mt-8 p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-500 space-y-2">
                <div className="flex justify-between">
                  <span>SYSTEM_STATUS</span>
                  <span className="text-green-500">ONLINE</span>
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
          <div className="lg:col-span-8 bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 relative overflow-hidden flex flex-col">
            {/* Header Details */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-2">ADVANCED PROTOCOL SIMULATION</h2>
                <p className="text-slate-400 font-mono text-sm">Visualize synergy and mechanism of action.</p>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-slate-800 rounded text-xs font-mono text-slate-400 border border-slate-700">
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
                    className="text-center text-slate-600"
                  >
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className="absolute inset-0 border-2 border-slate-800 rounded-full animate-ping opacity-20" />
                      <div className="absolute inset-0 border border-slate-800 rounded-full animate-[spin_10s_linear_infinite]" />
                      <div className="absolute inset-4 border border-slate-800 rounded-full animate-[spin_8s_linear_infinite_reverse]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ScanLine className="w-12 h-12 text-slate-700" />
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
                    <div className="flex justify-between font-mono text-xs text-red-500 mb-2">
                      <span>ANALYZING_COMPOUNDS...</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-red-600"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-8 opacity-50">
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="h-8 bg-slate-800 rounded"
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
                      <div className="absolute inset-0 bg-red-600/10 blur-3xl rounded-full group-hover:bg-red-600/20 transition-all" />
                      <div className="relative bg-slate-900 border border-slate-700 p-6 rounded-2xl h-full flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-600/20">
                          <FlaskConical className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">{activeProtocol.primary}</h3>
                        <p className="text-slate-400 text-sm mb-4">{activeProtocol.description}</p>
                        <div className="w-full h-px bg-slate-800 my-4" />
                        <div className="w-full space-y-2">
                          {Object.entries(activeProtocol.stats).map(([label, value]) => (
                            <div key={label} className="flex justify-between text-xs font-mono">
                              <span className="text-slate-500">{label}</span>
                              <span className="text-red-400">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Synergy Stack */}
                    <div className="flex flex-col gap-4">
                      <h4 className="font-mono text-xs text-slate-500 uppercase mb-2">Synergistic Compounds Detected:</h4>
                      {activeProtocol.synergistic.map((compound, idx) => (
                        <motion.div
                          key={compound}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: idx * 0.2 }}
                          className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center justify-between group hover:border-red-500/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="font-bold text-slate-200">{compound}</span>
                          </div>
                          <div className="text-xs text-slate-500 font-mono group-hover:text-red-400">
                            + SYNERGY
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Live Citation Feed */}
                      <div className="mt-auto bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 font-mono">
                          <Database className="w-3 h-3" />
                          <span>LATEST_CITATIONS</span>
                        </div>
                        <div className="space-y-2">
                          {activeProtocol.citations.map((cite, i) => (
                            <div key={i} className="text-[10px] text-slate-400 border-l-2 border-slate-800 pl-2 hover:border-red-500 transition-colors">
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
                 <div className="w-1 h-1 bg-red-500 rounded-full" />
                 <div className="w-1 h-1 bg-slate-700 rounded-full" />
                 <div className="w-1 h-1 bg-slate-700 rounded-full" />
               </div>
            </div>
            <div className="absolute bottom-0 left-0 p-4 opacity-50">
               <Binary className="w-4 h-4 text-slate-700" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
