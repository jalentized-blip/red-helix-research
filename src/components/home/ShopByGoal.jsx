import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Scale, Heart, Brain, Zap, Info } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

const peptideInfo = {
  "Retatrutide": "Triple agonist targeting GLP-1, GIP, and glucagon receptors for advanced metabolic research",
  "Tirzepatide": "Dual GIP/GLP-1 receptor agonist for metabolic and weight management studies",
  "Semaglutide": "GLP-1 receptor agonist used in diabetes and obesity research",
  "BPC 157": "Body Protection Compound for tissue repair and gut healing research",
  "TB500": "Thymosin Beta-4 fragment promoting cellular migration and wound healing",
  "BPC 157 + TB500": "Synergistic blend combining tissue repair and healing properties",
  "Semax": "ACTH analog enhancing cognitive function and neuroprotection",
  "Selank": "Anxiolytic peptide promoting stress resilience and mental clarity",
  "Pinealon": "Brain-specific peptide supporting neurological health and function",
  "MOTS-c": "Mitochondrial-derived peptide enhancing metabolic regulation and longevity",
  "HGH": "Human Growth Hormone for muscle growth and anti-aging research",
  "Epithalon": "Pineal peptide regulating circadian rhythm and cellular aging"
};

const goals = [
  {
    id: "weight_loss",
    title: "Weight Loss",
    description: "GLP-1 agonists and metabolic peptides for body composition research",
    icon: Scale,
    products: ["Retatrutide", "Tirzepatide", "Semaglutide"],
    gradient: "from-orange-500/20 to-red-500/20",
    iconColor: "text-orange-400"
  },
  {
    id: "recovery_healing",
    title: "Recovery & Healing",
    description: "Tissue repair, inflammation, and accelerated healing compounds",
    icon: Heart,
    products: ["BPC 157", "TB500", "BPC 157 + TB500"],
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400"
  },
  {
    id: "cognitive_focus",
    title: "Cognitive & Focus",
    description: "Nootropics and neuropeptides for brain health research",
    icon: Brain,
    products: ["Semax", "Selank", "Pinealon"],
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-400"
  },
  {
    id: "performance_longevity",
    title: "Performance & Longevity",
    description: "Growth hormone secretagogues and anti-aging compounds",
    icon: Zap,
    products: ["MOTS-c", "HGH", "Epithalon"],
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400"
  }
];

export default function ShopByGoal({ products = [], onSelectStrength, isAuthenticated = true, isAdmin = false }) {
  const [hoveredPeptide, setHoveredPeptide] = useState(null);

  return (
    <section id="goals" className="py-20 px-4 bg-stone-950/50 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-10 right-1/4 text-red-600/15 text-8xl"
          animate={{ y: [20, -20, 20], rotate: [360, 0, 360] }}
          transition={{ duration: 15, repeat: Infinity }}
        >
          <svg width="120" height="120" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <circle cx="50" cy="25" r="4" fill="currentColor" />
          </svg>
        </motion.div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Shop by Goal
            </span>
          </h2>
          <p className="text-stone-300 text-lg max-w-2xl mx-auto">
            Find the right peptides for your research objectives
          </p>
        </motion.div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group relative bg-stone-900/60 border-stone-700 hover:border-red-700/40 transition-all duration-300 overflow-hidden cursor-pointer">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${goal.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-stone-800/80 border border-stone-700 group-hover:border-red-700/30 transition-colors`}>
                      <goal.icon className={`w-6 h-6 ${goal.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-amber-50 group-hover:text-red-600 transition-colors">
                        {goal.title}
                      </h3>
                      <p className="text-sm text-stone-300 mt-1">
                        {goal.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {goal.products.map((productName) => {
                      return (
                        <div
                          key={productName}
                          className="relative"
                          onMouseEnter={() => setHoveredPeptide(productName)}
                          onMouseLeave={() => setHoveredPeptide(null)}
                        >
                          <div className="px-3 py-1.5 bg-stone-800/80 rounded-lg text-xs font-medium text-amber-50 border border-stone-700 hover:bg-red-700/20 hover:border-red-700/50 hover:text-red-600 transition-all cursor-default flex items-center gap-1.5">
                            <Info className="w-3 h-3" />
                            {productName}
                          </div>
                          {hoveredPeptide === productName && (
                            <div className="absolute z-50 bottom-full left-0 mb-2 w-64 bg-stone-900 border border-red-700/50 rounded-lg p-3 shadow-xl">
                              <p className="text-xs text-stone-300 leading-relaxed">
                                {peptideInfo[productName]}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}