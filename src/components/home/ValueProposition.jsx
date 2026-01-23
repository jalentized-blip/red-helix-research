import React from 'react';
import { motion } from "framer-motion";

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
              Passion Fuels Precision
            </span>
          </h2>
          <p className="text-stone-300 text-lg max-w-4xl mx-auto leading-relaxed">
            At Red Dirt Research, our commitment is simple: quality, consistency, and transparency. 
            Every compound we provide is produced in cGMP-certified, FDA audited facilities, 
            independently tested by American third-party labs, and backed by Certificates of Analysis. 
            With rigorous testing for identity, purity, net content, endotoxins, and sterility, 
            we deliver research-use materials you can trust — with consistency in every batch.
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
              <div className="flex items-end gap-4">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className={`w-16 bg-gradient-to-b from-stone-600 to-stone-700 rounded-lg border border-stone-600 flex flex-col items-center justify-end pb-2 ${i === 2 ? 'h-32' : 'h-24'}`}
                  >
                    <div className="w-10 h-2 bg-red-700/50 rounded mb-2" />
                    <div className="w-6 h-6 rounded-full bg-stone-800 border-2 border-red-700/50" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}