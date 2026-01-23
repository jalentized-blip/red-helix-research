import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Scale, Heart, Brain, Zap } from "lucide-react";

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

export default function ShopByGoal() {
  return (
    <section id="goals" className="py-20 px-4 bg-stone-950/50">
      <div className="max-w-7xl mx-auto">
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
                    {goal.products.map((product) => (
                      <button
                        key={product}
                        onClick={() => {
                          const productsSection = document.getElementById('products');
                          if (productsSection) {
                            productsSection.scrollIntoView({ behavior: 'smooth' });
                            setTimeout(() => {
                              const productCards = Array.from(document.querySelectorAll('h3')).filter(
                                el => el.textContent?.trim() === product
                              );
                              if (productCards.length > 0) {
                                const card = productCards[0].closest('div[class*="Card"]');
                                const selectButton = card?.querySelector('button');
                                if (selectButton) {
                                  selectButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  setTimeout(() => selectButton.click(), 300);
                                }
                              }
                            }, 800);
                          }
                        }}
                        className="px-3 py-1.5 bg-stone-800/80 rounded-lg text-xs font-medium text-amber-50 border border-stone-700 hover:bg-red-700/20 hover:border-red-700/50 hover:text-red-600 transition-all"
                      >
                        {product}
                      </button>
                    ))}
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