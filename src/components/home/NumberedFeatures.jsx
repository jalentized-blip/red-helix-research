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
    description: "Produced in FDA-audited, cGMP-certified facilities to meet the highest global standards for quality and safety."
  },
  {
    number: "3",
    title: "Same-Day Shipping",
    description: "Orders placed before 3PM PST ship the same business day directly from our fulfillment center."
  },
  {
    number: "4",
    title: "Third-Party Lab Tested",
    description: "Every batch undergoes full-panel testing for purity, sterility, endotoxins, and heavy metals."
  }
];

export default function NumberedFeatures() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex gap-6 group"
            >
              {/* Number Circle */}
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-black text-neutral-900">{feature.number}</span>
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-400 leading-relaxed">
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