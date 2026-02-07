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
    color: 'from-blue-600 to-blue-700'
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
    color: 'from-cyan-600 to-cyan-700'
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
    color: 'from-orange-600 to-orange-700'
  },
  {
    id: 'ghkcu',
    name: 'GHK-Cu',
    title: 'Copper Peptide Regeneration',
    description: 'Copper-binding peptide for collagen synthesis and wound healing',
    pathways: [
      {
        step: 1,
        title: 'Copper Binding',
        description: 'GHK binds copper ions, forming active copper-peptide complex',
        duration: 2000
      },
      {
        step: 2,
        title: 'Collagen Stimulation',
        description: 'Enhances type I and III collagen synthesis in fibroblasts',
        duration: 3000
      },
      {
        step: 3,
        title: 'Growth Factor Modulation',
        description: 'Regulates TGF-β and VEGF expression for balanced healing',
        duration: 3000
      },
      {
        step: 4,
        title: 'Matrix Remodeling',
        description: 'Promotes organized extracellular matrix formation and remodeling',
        duration: 4000
      }
    ],
    color: 'from-amber-600 to-amber-700'
  },
  {
    id: 'cjcipa',
    name: 'CJC-1295/Ipamorelin',
    title: 'Growth Hormone Secretagogue Synergy',
    description: 'Combined peptides for sustained GH release without cortisol spike',
    pathways: [
      {
        step: 1,
        title: 'Receptor Activation',
        description: 'CJC-1295 extends GH pulse, Ipamorelin selectively activates ghrelin receptors',
        duration: 2000
      },
      {
        step: 2,
        title: 'Pituitary Stimulation',
        description: 'Coordinated stimulation of somatotroph cells for GH release',
        duration: 3000
      },
      {
        step: 3,
        title: 'Sustained Elevation',
        description: 'CJC-1295 prolongs GH elevation, maintaining physiological pulses',
        duration: 3000
      },
      {
        step: 4,
        title: 'Downstream Effects',
        description: 'IGF-1 production, protein synthesis, lipolysis, tissue repair',
        duration: 4000
      }
    ],
    color: 'from-indigo-600 to-indigo-700'
  },
  {
    id: 'pt141',
    name: 'PT-141',
    title: 'Melanocortin Receptor Activation',
    description: 'MC4R agonist affecting libido through CNS pathways',
    pathways: [
      {
        step: 1,
        title: 'CNS Penetration',
        description: 'Crosses blood-brain barrier to access melanocortin receptors',
        duration: 2000
      },
      {
        step: 2,
        title: 'MC4R Activation',
        description: 'Selectively activates melanocortin-4 receptors in hypothalamus',
        duration: 3000
      },
      {
        step: 3,
        title: 'Neural Pathway Modulation',
        description: 'Affects dopaminergic and noradrenergic neurotransmission',
        duration: 3000
      },
      {
        step: 4,
        title: 'Physiological Response',
        description: 'Enhances sexual arousal and desire through central mechanisms',
        duration: 4000
      }
    ],
    color: 'from-pink-600 to-pink-700'
  },
  {
    id: 'semax',
    name: 'Semax',
    title: 'Nootropic BDNF Enhancement',
    description: 'ACTH analog promoting neuroplasticity and cognitive function',
    pathways: [
      {
        step: 1,
        title: 'BBB Transport',
        description: 'Crosses blood-brain barrier via active transport mechanisms',
        duration: 2000
      },
      {
        step: 2,
        title: 'BDNF Upregulation',
        description: 'Increases brain-derived neurotrophic factor expression',
        duration: 3000
      },
      {
        step: 3,
        title: 'Neurotransmitter Modulation',
        description: 'Enhances dopamine, serotonin, and acetylcholine activity',
        duration: 3000
      },
      {
        step: 4,
        title: 'Cognitive Enhancement',
        description: 'Improves attention, memory formation, and neuroprotection',
        duration: 4000
      }
    ],
    color: 'from-teal-600 to-teal-700'
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