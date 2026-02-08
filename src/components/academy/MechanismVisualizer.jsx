import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Activity, Info } from 'lucide-react';

const MECHANISMS = [
  {
    id: 'bpc157',
    name: 'BPC-157',
    title: 'Tissue Repair & Angiogenesis',
    description: 'Body Protection Compound promotes healing through multiple pathways',
    pathways: [
      {
        step: 1,
        title: 'Receptor Binding',
        description: 'BPC-157 binds to growth factor receptors on cell surface',
        duration: 2000
      },
      {
        step: 2,
        title: 'VEGF Upregulation',
        description: 'Activates VEGF pathway, stimulating new blood vessel formation',
        duration: 3000
      },
      {
        step: 3,
        title: 'Fibroblast Migration',
        description: 'Enhances fibroblast movement to injury site for collagen synthesis',
        duration: 3000
      },
      {
        step: 4,
        title: 'Tissue Regeneration',
        description: 'Promotes organized tissue repair and reduces inflammation',
        duration: 4000
      }
    ],
    color: 'bg-emerald-600',
    gradient: 'from-emerald-600 to-emerald-700',
    lightBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    id: 'semaglutide',
    name: 'Semaglutide',
    title: 'GLP-1 Metabolic Regulation',
    description: 'GLP-1 receptor agonist for metabolic research applications',
    pathways: [
      {
        step: 1,
        title: 'GLP-1R Binding',
        description: 'Semaglutide binds to GLP-1 receptors on pancreatic beta cells',
        duration: 2000
      },
      {
        step: 2,
        title: 'cAMP Cascade',
        description: 'Activates adenylyl cyclase, increasing intracellular cAMP levels',
        duration: 3000
      },
      {
        step: 3,
        title: 'Insulin Secretion',
        description: 'Glucose-dependent insulin release from pancreatic beta cells',
        duration: 3000
      },
      {
        step: 4,
        title: 'Appetite Regulation',
        description: 'CNS effects on hypothalamic appetite and satiety centers',
        duration: 4000
      }
    ],
    color: 'bg-blue-600',
    gradient: 'from-blue-600 to-blue-700',
    lightBg: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    title: 'Dual GLP-1/GIP Agonist',
    description: 'Dual incretin receptor activation for enhanced metabolic effects',
    pathways: [
      {
        step: 1,
        title: 'Dual Receptor Binding',
        description: 'Activates both GLP-1 and GIP receptors simultaneously',
        duration: 2000
      },
      {
        step: 2,
        title: 'Enhanced Insulin Response',
        description: 'Synergistic glucose-dependent insulin secretion',
        duration: 3000
      },
      {
        step: 3,
        title: 'Glucagon Suppression',
        description: 'Reduces inappropriate glucagon secretion from alpha cells',
        duration: 3000
      },
      {
        step: 4,
        title: 'Multi-Target Effects',
        description: 'Combined appetite suppression, gastric emptying delay, energy expenditure',
        duration: 4000
      }
    ],
    color: 'bg-cyan-600',
    gradient: 'from-cyan-600 to-cyan-700',
    lightBg: 'bg-cyan-50',
    borderColor: 'border-cyan-200'
  },
  {
    id: 'tb500',
    name: 'TB-500',
    title: 'Cell Migration & Differentiation',
    description: 'Thymosin Beta-4 mechanism for tissue recovery',
    pathways: [
      {
        step: 1,
        title: 'Actin Sequestration',
        description: 'TB-500 binds to G-actin, regulating polymerization',
        duration: 2000
      },
      {
        step: 2,
        title: 'Cell Migration',
        description: 'Facilitates directional cell movement to damaged areas',
        duration: 3000
      },
      {
        step: 3,
        title: 'Differentiation Signals',
        description: 'Promotes stem cell differentiation into target tissue types',
        duration: 3000
      },
      {
        step: 4,
        title: 'Anti-Inflammatory Effects',
        description: 'Modulates inflammatory response for optimal healing',
        duration: 4000
      }
    ],
    color: 'bg-purple-600',
    gradient: 'from-purple-600 to-purple-700',
    lightBg: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    id: 'nad',
    name: 'NAD+',
    title: 'Cellular Energy & Longevity',
    description: 'Nicotinamide adenine dinucleotide for mitochondrial function',
    pathways: [
      {
        step: 1,
        title: 'Cellular Uptake',
        description: 'NAD+ precursors enter cells and convert to active NAD+',
        duration: 2000
      },
      {
        step: 2,
        title: 'Mitochondrial Function',
        description: 'Powers electron transport chain for ATP production',
        duration: 3000
      },
      {
        step: 3,
        title: 'Sirtuin Activation',
        description: 'Activates sirtuins (SIRT1-7) for cellular maintenance and longevity',
        duration: 3000
      },
      {
        step: 4,
        title: 'DNA Repair',
        description: 'Supports PARP enzymes in DNA damage repair mechanisms',
        duration: 4000
      }
    ],
    color: 'bg-orange-600',
    gradient: 'from-orange-600 to-orange-700',
    lightBg: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
];

// Memoized pathway step
const PathwayStep = React.memo(({ pathway, isActive, isComplete, color, gradient, lightBg, borderColor }) => (
  <div className={`relative flex items-start gap-6 p-6 rounded-[24px] border-2 transition-all duration-500 ${
    isComplete
      ? `${lightBg} ${borderColor}`
      : 'bg-white border-slate-100 shadow-sm'
  } ${isActive ? 'ring-2 ring-red-600 ring-offset-2' : ''}`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0 transition-all duration-500 ${
      isComplete
        ? `bg-gradient-to-br ${gradient} text-white shadow-lg`
        : 'bg-slate-100 text-slate-400'
    }`}>
      {pathway.step}
    </div>
    <div className="flex-1">
      <h3 className={`text-xl font-black uppercase tracking-tight mb-1 transition-colors duration-500 ${
        isComplete ? 'text-slate-900' : 'text-slate-400'
      }`}>
        {pathway.title}
      </h3>
      <p className={`text-sm leading-relaxed transition-colors duration-500 ${
        isComplete ? 'text-slate-600' : 'text-slate-300'
      }`}>
        {pathway.description}
      </p>
    </div>
    {isActive && (
      <div className="w-3 h-3 bg-red-600 rounded-full flex-shrink-0 animate-pulse mt-2" />
    )}
  </div>
));

export default function MechanismVisualizer({ onBack }) {
  const [selectedMechanism, setSelectedMechanism] = useState(MECHANISMS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setCurrentStep(0);
    setProgress(0);
    
    let cumulativeTime = 0;
    timeoutsRef.current = [];
    
    selectedMechanism.pathways.forEach((pathway, idx) => {
      const timeout = setTimeout(() => {
        setCurrentStep(idx + 1);
        setProgress(((idx + 1) / selectedMechanism.pathways.length) * 100);
        if (idx === selectedMechanism.pathways.length - 1) {
          setIsPlaying(false);
        }
      }, cumulativeTime);
      timeoutsRef.current.push(timeout);
      cumulativeTime += pathway.duration;
    });
  }, [selectedMechanism]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const handleMechanismChange = useCallback((mechanism) => {
    handleReset();
    setSelectedMechanism(mechanism);
  }, [handleReset]);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="w-fit hover:bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Academy
        </Button>
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-200">
          <Activity className="w-4 h-4 text-red-600" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-600">
            Mechanism Visualization System v4.0
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Sidebar Selectors */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
            Select Research Subject
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {MECHANISMS.map((mechanism) => (
              <button
                key={mechanism.id}
                onClick={() => handleMechanismChange(mechanism)}
                className={`text-left p-6 rounded-[24px] border-2 transition-all duration-300 group ${
                  selectedMechanism.id === mechanism.id
                    ? `bg-white border-red-600 shadow-xl scale-[1.02]`
                    : 'bg-slate-50 border-slate-100 hover:border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-xl font-black uppercase tracking-tighter ${
                    selectedMechanism.id === mechanism.id ? 'text-red-600' : 'text-slate-900'
                  }`}>
                    {mechanism.name}
                  </h3>
                  <div className={`w-2 h-2 rounded-full ${mechanism.color}`} />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                  {mechanism.title}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Visualization Area */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tighter leading-none">
                    {selectedMechanism.name}
                    <span className="block text-xl text-red-600 mt-2 font-bold tracking-tight normal-case italic">
                      {selectedMechanism.title}
                    </span>
                  </h2>
                  <p className="text-slate-600 text-lg max-w-xl leading-relaxed">
                    {selectedMechanism.description}
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className={`w-20 h-20 rounded-[24px] ${selectedMechanism.lightBg} border-2 ${selectedMechanism.borderColor} flex items-center justify-center`}>
                    <Activity className={`w-10 h-10 ${selectedMechanism.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </div>

              {/* Pathway Visualization */}
              <div className="relative space-y-4">
                {/* Progress Bar Container */}
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-12 border border-slate-200/50">
                  <div
                    className={`h-full bg-gradient-to-r ${selectedMechanism.gradient} transition-all duration-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Steps */}
                <div className="grid gap-4">
                  {selectedMechanism.pathways.map((pathway, idx) => (
                    <PathwayStep
                      key={idx}
                      pathway={pathway}
                      isActive={currentStep === pathway.step && isPlaying}
                      isComplete={currentStep >= pathway.step}
                      color={selectedMechanism.color}
                      gradient={selectedMechanism.gradient}
                      lightBg={selectedMechanism.lightBg}
                      borderColor={selectedMechanism.borderColor}
                    />
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-12 pt-8 border-t border-slate-100">
                <Button
                  onClick={isPlaying ? handlePause : handlePlay}
                  size="lg"
                  className={`h-16 px-10 rounded-[20px] font-black uppercase tracking-widest text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                    isPlaying 
                      ? 'bg-slate-900 text-white hover:bg-slate-800' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 mr-3 fill-current" />
                      Pause Simulation
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-3 fill-current" />
                      Initialize Sequence
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReset}
                  size="lg"
                  variant="outline"
                  className="h-16 px-10 rounded-[20px] border-2 border-slate-200 font-black uppercase tracking-widest text-sm text-slate-600 hover:bg-slate-50"
                >
                  <RotateCcw className="w-5 h-5 mr-3" />
                  Reset System
                </Button>
              </div>
            </div>

            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
          </div>

          {/* Key Insights */}
          <div className="mt-8 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
            <div className="relative z-10 flex items-start gap-6">
              <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:rotate-12 transition-transform">
                <Info className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                  Clinical Research Implications
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                </h3>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    'Optimize research protocols through mechanism awareness',
                    'Distinct cellular pathways for targeted research goals',
                    'Strategic dosing timing based on kinetic models',
                    'Potential synergy in multi-pathway research designs'
                  ].map((insight, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <Activity className="w-48 h-48 -mr-12 -mb-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
