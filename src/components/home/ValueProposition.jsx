import React from 'react';
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";

export default function ValueProposition() {
  return (
    <section className="py-20 px-4 bg-stone-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Committed To Transparency
            </span>
          </h2>
          <p className="text-stone-300 text-lg max-w-4xl mx-auto leading-relaxed">
            At Barn, we're committed to transforming the peptide industry with radical transparency and fair pricing. For years, US vendors have tripled peptide prices with little difference from the big pharma they're supposedly rebelling against—hiding costs, supply chains, and quality to prioritize profits over progress. We're different: We pledge full openness, empowering researchers with accessible, high-quality peptides.
          </p>
        </motion.div>

        {/* Product Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-20"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-red-700/20 blur-3xl rounded-full" />
            <div className="relative bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-8 border border-stone-700">
              <div className="flex items-center justify-center gap-6">
                {[1, 2, 3].map((i) => (
                  <DollarSign key={i} className="w-16 h-16 text-red-600" strokeWidth={1.5} data-testid="dollar-icon" />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}