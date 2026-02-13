import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Heart, Brain, Zap, Info } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

const peptideInfo = {
  "RT": "Triple agonist targeting GLP-1, GIP, and glucagon receptors for advanced metabolic research",
  "TRZ": "Dual GIP/GLP-1 receptor agonist for metabolic and weight management studies",
  "SM": "GLP-1 receptor agonist used in diabetes and obesity research",
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
    products: ["RT", "TRZ", "SM"],
    gradient: "from-[#dc2626]/5 to-[#dc2626]/10",
    iconColor: "text-[#dc2626]"
  },
  {
    id: "recovery_healing",
    title: "Recovery & Healing",
    description: "Tissue repair, inflammation, and accelerated healing compounds",
    icon: Heart,
    products: ["BPC 157", "TB500", "BPC 157 + TB500"],
    gradient: "from-[#dc2626]/5 to-[#dc2626]/10",
    iconColor: "text-[#dc2626]"
  },
  {
    id: "cognitive_focus",
    title: "Cognitive & Focus",
    description: "Nootropics and neuropeptides for brain health research",
    icon: Brain,
    products: ["Semax", "Selank", "Pinealon"],
    gradient: "from-slate-600/5 to-slate-600/10",
    iconColor: "text-slate-600"
  },
  {
    id: "performance_longevity",
    title: "Performance & Longevity",
    description: "Growth hormone secretagogues and anti-aging compounds",
    icon: Zap,
    products: ["MOTS-c", "HGH", "Epithalon"],
    gradient: "from-slate-600/5 to-slate-600/10",
    iconColor: "text-slate-600"
  }
];

export default function ShopByGoal({ products = [], onSelectStrength, isAuthenticated = true, isAdmin = false }) {
  const [hoveredPeptide, setHoveredPeptide] = useState(null);

  return (
    <section id="goals" className="py-24 px-4 bg-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-10 right-1/4 text-[#dc2626]/5 text-8xl"
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
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Research Categorization</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-6">
            SHOP BY <br />
            <span className="text-[#dc2626]">OBJECTIVE</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Systematic classification of research compounds based on primary experimental targets and metabolic pathways.
          </p>
        </motion.div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group relative bg-slate-50 border-slate-100 hover:border-[#dc2626]/30 transition-all duration-500 overflow-hidden cursor-pointer rounded-[40px] shadow-sm hover:shadow-xl">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${goal.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative p-10">
                  <div className="flex items-start gap-6 mb-8">
                    <div className={`w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:border-[#dc2626]/30 transition-colors shadow-sm`}>
                      <goal.icon className={`w-7 h-7 ${goal.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#dc2626] transition-colors tracking-tight">
                        {goal.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                        {goal.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {goal.products.map((productName) => {
                      // Find matching product to check stock
                      const product = products.find(p => 
                        p.name.toLowerCase() === productName.toLowerCase() || 
                        p.name.toLowerCase().includes(productName.toLowerCase())
                      );
                      
                      const visibleSpecs = product?.specifications?.filter(spec => !spec.hidden) || [];
                      const inStock = visibleSpecs.some(spec => spec.in_stock && (spec.stock_quantity > 0 || spec.stock_quantity === undefined));
                      
                      // Skip if we found the product and it's out of stock (and not admin)
                      if (product && !isAdmin && !inStock) return null;

                      return (
                        <div
                          key={productName}
                          className="relative"
                          onMouseEnter={() => setHoveredPeptide(productName)}
                          onMouseLeave={() => setHoveredPeptide(null)}
                        >
                          <div className="px-4 py-2 bg-white rounded-xl text-[10px] font-black text-slate-900 border border-slate-100 group-hover:border-[#dc2626]/20 hover:bg-[#dc2626] hover:text-white transition-all cursor-default flex items-center gap-2 uppercase tracking-widest">
                            <Info className="w-3 h-3 text-[#dc2626]/40 group-hover:text-white" />
                            {productName}
                          </div>
                          <AnimatePresence>
                            {hoveredPeptide === productName && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute z-50 bottom-full left-0 mb-3 w-72 bg-white border border-slate-100 rounded-2xl p-4 shadow-2xl"
                              >
                                <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white border-b border-r border-slate-100 rotate-45" />
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                  {peptideInfo[productName]}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
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