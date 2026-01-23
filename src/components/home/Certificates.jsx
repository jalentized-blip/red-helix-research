import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FlaskConical, ShieldCheck, Info } from "lucide-react";

export default function Certificates() {
  return (
    <section id="certificates" className="py-24 px-4 bg-stone-950/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-700/10 rounded-full border border-red-700/30 mb-6">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-600">Quality Commitment</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Certificates of Analysis
            </span>
          </h2>
          <p className="text-stone-300 text-lg max-w-2xl mx-auto">
            Transparent third-party testing for verified purity, sterility, and quality assurance.
          </p>
        </motion.div>

        {/* No Tests Yet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-stone-900/60 border-stone-700 p-12 text-center">
            <div className="flex flex-col items-center max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-stone-800/50 border border-stone-700 mb-6">
                <FlaskConical className="w-12 h-12 text-stone-400" />
              </div>
              <h3 className="text-2xl font-bold text-amber-50 mb-3">
                Testing In Progress
              </h3>
              <p className="text-stone-300 mb-6">
                We are committed to providing full transparency through independent third-party laboratory analysis. 
                Certificates of Analysis will be published here as soon as testing is completed.
              </p>
              <div className="flex items-start gap-3 px-4 py-3 bg-stone-800/50 rounded-lg border border-stone-700">
                <Info className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-stone-400 text-left leading-relaxed">
                  <span className="font-semibold text-stone-300">Testing Initiative:</span> We are currently coordinating group buys for comprehensive third-party testing through Janoshik Analytical, 
                  a leading independent laboratory specializing in peptide and pharmaceutical analysis. 
                  All batches will undergo rigorous testing for purity, concentration, sterility, and heavy metal contamination. 
                  Results will be published immediately upon receipt to ensure complete transparency for our research community.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}