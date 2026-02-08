import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, ShieldCheck, Zap, Users, BookOpen, TrendingDown, CheckCircle2 } from 'lucide-react';

const roadmapSteps = [
  {
    id: 1,
    title: "Fair Pricing, No Gouging",
    icon: <TrendingDown className="w-5 h-5" />,
    content: "We've rejected the industry standard of 500%+ markups. At Red Helix, we believe scientific research should be accessible, not a luxury. Our prices reflect the true cost of quality, not corporate greed.",
    details: "Every peptide we offer is priced to support your research budget while maintaining rigorous quality standards.",
    x: "15%",
    y: "30%"
  },
  {
    id: 2,
    title: "Vetted Transparency",
    icon: <ShieldCheck className="w-5 h-5" />,
    content: "We don't just take a supplier's word for it. We've spent months conducting community group buys to vet and verify trusted suppliers before they ever reach our store.",
    details: "This extensive vetting process ensures we only work with the most reliable laboratories in the world.",
    x: "30%",
    y: "65%"
  },
  {
    id: 3,
    title: "Strategic Partnerships",
    icon: <Users className="w-5 h-5" />,
    content: "By partnering with other major vendors and buying in massive volumes, we secure wholesale rates that smaller operations simply can't match.",
    details: "These partnerships allow us to maintain a stable supply chain and pass the volume savings directly to you.",
    x: "45%",
    y: "25%"
  },
  {
    id: 4,
    title: "Research Database",
    icon: <BookOpen className="w-5 h-5" />,
    content: "We're building more than just a shop. Red Helix is becoming a one-stop research hub with an extensive database for peptide scientists.",
    details: "Our goal is to provide the data and resources you need to conduct your research with complete confidence.",
    x: "60%",
    y: "70%"
  },
  {
    id: 5,
    title: "Informed Community",
    icon: <Zap className="w-5 h-5" />,
    content: "We foster a community of like-minded researchers where knowledge is shared freely to maximize safety and research efficiency.",
    details: "An informed researcher is a successful one. We prioritize education and community insights over quick sales.",
    x: "75%",
    y: "35%"
  },
  {
    id: 6,
    title: "The Red Helix Promise",
    icon: <CheckCircle2 className="w-5 h-5" />,
    content: "We want prices to be what they really should be. We're committed to keeping them that way, ensuring the future of research remains affordable.",
    details: "Not a scam—just a better business model. We provide verified COAs for every single batch to prove our quality.",
    x: "90%",
    y: "60%"
  }
];

export default function InteractiveRoadmap() {
  const [activeStep, setActiveStep] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });

        // Find closest step
        let closest = null;
        let minDistance = 15; // Threshold for "getting close"

        roadmapSteps.forEach(step => {
          const stepX = parseFloat(step.x);
          const stepY = parseFloat(step.y);
          const distance = Math.sqrt(Math.pow(x - stepX, 2) + Math.pow(y - stepY, 2));
          
          if (distance < minDistance) {
            minDistance = distance;
            closest = step;
          }
        });

        setActiveStep(closest);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative w-full bg-stone-950 pt-32 pb-12 px-6 overflow-hidden border-b border-red-900/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-amber-50 mb-4 tracking-tighter"
          >
            WHY SO <span className="text-red-600">CHEAP?</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-stone-400 max-w-2xl mx-auto text-lg"
          >
            Explore our roadmap to see how we've revolutionized peptide pricing through transparency, 
            efficiency, and community-driven sourcing.
          </motion.p>
        </div>

        <div 
          ref={containerRef}
          className="relative h-[400px] md:h-[500px] w-full bg-stone-900/30 rounded-3xl border border-stone-800/50 backdrop-blur-sm overflow-hidden cursor-crosshair"
        >
          {/* Background Grid/Effect */}
          <div className="absolute inset-0 opacity-20" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #444 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          
          {/* Roadmap Path (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <motion.path
              d="M 0 150 Q 150 50 300 250 T 600 150 T 900 350 T 1200 200"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="4"
              strokeDasharray="12 12"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>
          </svg>

          {/* Connection Lines to Mouse */}
          <AnimatePresence>
            {activeStep && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                <svg className="w-full h-full">
                  <line 
                    x1={`${mousePos.x}%`} 
                    y1={`${mousePos.y}%`} 
                    x2={activeStep.x} 
                    y2={activeStep.y} 
                    stroke="rgba(220, 38, 38, 0.2)" 
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pin Points */}
          {roadmapSteps.map((step) => (
            <div
              key={step.id}
              className="absolute transition-all duration-500"
              style={{ left: step.x, top: step.y, transform: 'translate(-50%, -50%)' }}
            >
              <motion.div
                animate={{
                  scale: activeStep?.id === step.id ? 1.5 : 1,
                  backgroundColor: activeStep?.id === step.id ? '#dc2626' : '#292524'
                }}
                className="w-4 h-4 rounded-full border-2 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] z-10"
              />
              <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-stone-500 uppercase tracking-widest opacity-50">
                Step {step.id}
              </div>
            </div>
          ))}

          {/* Interactive Info Card */}
          <AnimatePresence>
            {activeStep && (
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="absolute z-20 pointer-events-none"
                style={{ 
                  left: parseFloat(activeStep.x) > 70 ? 'auto' : `calc(${activeStep.x} + 20px)`,
                  right: parseFloat(activeStep.x) > 70 ? `calc(100% - ${activeStep.x} + 20px)` : 'auto',
                  top: `calc(${activeStep.y} - 100px)`
                }}
              >
                <div className="w-72 md:w-80 p-5 bg-stone-900/95 backdrop-blur-xl border border-red-600/30 rounded-2xl shadow-2xl shadow-black/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-600/20 rounded-lg text-red-500">
                      {activeStep.icon}
                    </div>
                    <h3 className="font-bold text-amber-50 text-lg leading-tight">
                      {activeStep.title}
                    </h3>
                  </div>
                  <p className="text-stone-300 text-sm mb-3 leading-relaxed">
                    {activeStep.content}
                  </p>
                  <div className="pt-3 border-t border-stone-800 flex items-start gap-2">
                    <Info className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-stone-400 text-xs italic">
                      {activeStep.details}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Prompt */}
          {!activeStep && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="px-6 py-3 bg-red-600/10 border border-red-600/20 rounded-full backdrop-blur-sm">
                <p className="text-red-400 text-sm font-medium animate-pulse">
                  Move your mouse to explore our roadmap
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Trust Indicators */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <span className="text-sm font-semibold text-stone-300 uppercase tracking-wider">Verified COAs</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-red-500" />
            <span className="text-sm font-semibold text-stone-300 uppercase tracking-wider">Batch Tested</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            <span className="text-sm font-semibold text-stone-300 uppercase tracking-wider">Community Vetted</span>
          </div>
        </div>
      </div>
    </section>
  );
}
