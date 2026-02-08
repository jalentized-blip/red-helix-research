import React from 'react';
import { motion } from "framer-motion";

const features = [
  {
    number: "1",
    title: "Research Use Only",
    description: "Clearly labeled for laboratory and research purposes."
  },
  {
    number: "2",
    title: "cGMP Certified Manufacturing",
    description: "lyophilized in FDA-audited, cGMP-certified facilities to meet the highest global standards for quality and safety."
  },
  {
    number: "3",
    title: "Quality Customer Service",
    description: "Our responsive support team is dedicated to helping you every step of the way."
  },
  {
    number: "4",
    title: "Third-Party Lab Tested",
    description: "Every batch undergoes full-panel testing for purity, sterility, endotoxins, and heavy metals."
  }
];

export default function NumberedFeatures() {
  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      {/* Subtle Background Decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.01),transparent_70%)] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex gap-8 group items-start"
            >
              {/* Number Badge - Bright Clinical Style */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm group-hover:border-red-600/30 group-hover:bg-white transition-all duration-500">
                  <span className="text-2xl font-black text-red-600">{feature.number}</span>
                </div>
              </div>

              {/* Content - High Contrast on White */}
              <div className="pt-2">
                <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-red-600 transition-colors uppercase tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}