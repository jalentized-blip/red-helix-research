import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Activity, TrendingUp } from 'lucide-react';
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
        title: 'Receptor Binding',
        description: 'BPC-157 binds to growth factor receptors on cell surface',
        duration: 2
      },
      {
        step: 2,
        title: 'VEGF Upregulation',
        description: 'Activates VEGF pathway, stimulating new blood vessel formation',
        duration: 3
      },
      {
        step: 3,
        title: 'Fibroblast Migration',
        description: 'Enhances fibroblast movement to injury site for collagen synthesis',
        duration: 3
      },
      {
        step: 4,
        title: 'Tissue Regeneration',
        description: 'Promotes organized tissue repair and reduces inflammation',
        duration: 4
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
        duration: 2
      },
      {
        step: 2,
        title: 'cAMP Cascade',
        description: 'Activates adenylyl cyclase, increasing intracellular cAMP',
        duration: 3
      },
      {
        step: 3,
        title: 'Insulin Secretion',
        description: 'Glucose-dependent insulin release from beta cells',
        duration: 3
      },
      {
        step: 4,
        title: 'Appetite Modulation',
        description: 'Central nervous system effects on hypothalamic appetite centers',
        duration: 4
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
        duration: 2
      },
      {
        step: 2,
        title: 'Cell Migration',
        description: 'Facilitates directional cell movement to damaged areas',
        duration: 3
      },
      {
        step: 3,
        title: 'Differentiation Signals',
        description: 'Promotes stem cell differentiation into target tissue types',
        duration: 3
      },
      {
        step: 4,
        title: 'Anti-Inflammatory Effects',
        description: 'Modulates inflammatory response for optimal healing',
        duration: 4
      }
    ],
    color: 'from-purple-600 to-purple-700'
  }
];

export default function MechanismVisualizer({ onBack }) {
  const [selectedMechanism, setSelectedMechanism] = useState(MECHANISMS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const handlePlay = () => {
    setIsPlaying(true);
    animateSteps();
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
  };

  const animateSteps = () => {
    // This would be enhanced with actual animation timing
    setCurrentStep(0);
    selectedMechanism.pathways.forEach((pathway, idx) => {
      setTimeout(() => {
        setCurrentStep(idx + 1);
        setProgress(((idx + 1) / selectedMechanism.pathways.length) * 100);
        if (idx === selectedMechanism.pathways.length - 1) {
          setIsPlaying(false);
        }
      }, pathway.duration * 1000);
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
          <div className="absolute top-0 left-0 right-0 h-1 bg-stone-800 rounded-full overflow-hidden mb-8">
            <motion.div
              className={`h-full bg-gradient-to-r ${selectedMechanism.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-6 mt-8">
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
                className={`relative flex items-start gap-6 p-6 rounded-xl border-2 transition-all ${
                  currentStep >= pathway.step
                    ? 'bg-gradient-to-r ' + selectedMechanism.color + '/10 border-white/20'
                    : 'bg-stone-800/30 border-stone-700'
                }`}
              >
                {/* Step Number */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                  currentStep >= pathway.step
                    ? 'bg-gradient-to-br ' + selectedMechanism.color + ' text-white'
                    : 'bg-stone-700 text-stone-400'
                }`}>
                  {pathway.step}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-50 mb-2">
                    {pathway.title}
                  </h3>
                  <p className="text-stone-300">
                    {pathway.description}
                  </p>
                </div>

                {/* Active Indicator */}
                {currentStep === pathway.step && isPlaying && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"
                  />
                )}
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