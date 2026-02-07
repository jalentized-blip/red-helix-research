import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Activity } from 'lucide-react';

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
        title: 'GLP-1R Binding',
        description: 'Peptide binds to GLP-1 receptors on pancreatic beta cells',
        duration: 2000
      },
      {
        step: 2,
        title: 'cAMP Cascade',
        description: 'Activates adenylyl cyclase, increasing intracellular cAMP',
        duration: 3000
      },
      {
        step: 3,
        title: 'Insulin Secretion',
        description: 'Glucose-dependent insulin release from beta cells',
        duration: 3000
      },
      {
        step: 4,
        title: 'Appetite Modulation',
        description: 'Central nervous system effects on hypothalamic appetite centers',
        duration: 4000
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
    color: 'from-purple-600 to-purple-700'
  }
];

// Memoized pathway step
const PathwayStep = React.memo(({ pathway, isActive, isComplete, color }) => (
  <div className={`relative flex items-start gap-6 p-6 rounded-xl border-2 transition-all ${
    isComplete
      ? `bg-gradient-to-r ${color}/10 border-white/20`
      : 'bg-stone-800/30 border-stone-700'
  }`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
      isComplete
        ? `bg-gradient-to-br ${color} text-white`
        : 'bg-stone-700 text-stone-400'
    }`}>
      {pathway.step}
    </div>
    <div className="flex-1">
      <h3 className="text-xl font-bold text-amber-50 mb-2">
        {pathway.title}
      </h3>
      <p className="text-stone-300">
        {pathway.description}
      </p>
    </div>
    {isActive && (
      <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 animate-pulse" />
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
    <div className="max-w-6xl mx-auto">
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
            onClick={() => handleMechanismChange(mechanism)}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              selectedMechanism.id === mechanism.id
                ? `bg-gradient-to-br ${mechanism.color} border-white/30`
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
          <div className="absolute top-0 left-0 right-0 h-1 bg-stone-800 rounded-full overflow-hidden mb-8">
            <div
              className={`h-full bg-gradient-to-r ${selectedMechanism.color} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-6 mt-8">
            {selectedMechanism.pathways.map((pathway, idx) => (
              <PathwayStep
                key={idx}
                pathway={pathway}
                isActive={currentStep === pathway.step && isPlaying}
                isComplete={currentStep >= pathway.step}
                color={selectedMechanism.color}
              />
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
    </div>
  );
}