import React from 'react';
import { motion } from "framer-motion";
import EditableText from '@/components/EditableText';

const features = [
  {
    number: "1",
    title: "Research Use Only",
    description: "Clearly labeled for laboratory and research purposes.",
    key: "numbered_feature_1"
  },
  {
    number: "2",
    title: "cGMP Certified Manufacturing",
    description: "Produced in FDA-audited, cGMP-certified facilities to meet the highest global standards for quality and safety.",
    key: "numbered_feature_2"
  },
  {
    number: "3",
    title: "Quality Customer Service",
    description: "Our responsive support team is dedicated to helping you every step of the way.",
    key: "numbered_feature_3"
  },
  {
    number: "4",
    title: "Third-Party Lab Tested",
    description: "Every batch undergoes full-panel testing for purity, sterility, endotoxins, and heavy metals.",
    key: "numbered_feature_4"
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
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-700 to-red-800 flex items-center justify-center shadow-lg shadow-red-700/20 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-black text-amber-50">{feature.number}</span>
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xl font-bold text-amber-50 mb-2 group-hover:text-red-600 transition-colors">
                  <EditableText textKey={`${feature.key}_title`} defaultValue={feature.title} />
                </h3>
                <p className="text-stone-300 leading-relaxed">
                  <EditableText textKey={`${feature.key}_desc`} defaultValue={feature.description} multiline />
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}