import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileCheck, Download, ExternalLink, ShieldCheck } from "lucide-react";

const certificates = [
  { name: "Retatrutide 10mg", date: "Jan 2025", purity: "99.2%" },
  { name: "BPC-157 5mg", date: "Jan 2025", purity: "98.9%" },
  { name: "Tirzepatide 10mg", date: "Dec 2024", purity: "99.1%" },
  { name: "TB-500 5mg", date: "Dec 2024", purity: "98.7%" },
  { name: "Semaglutide 5mg", date: "Jan 2025", purity: "99.4%" },
  { name: "MOTS-c 10mg", date: "Jan 2025", purity: "98.8%" },
];

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
            <span className="text-sm font-medium text-red-600">Verified Quality</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Certificates of Analysis
            </span>
          </h2>
          <p className="text-stone-300 text-lg max-w-2xl mx-auto">
            Full transparency with every batch. Download COAs to verify purity, sterility, and quality.
          </p>
        </motion.div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Card className="bg-stone-900/60 border-stone-700 hover:border-red-700/40 transition-all duration-300 p-5 group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-700/10 border border-red-700/20">
                      <FileCheck className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-50 group-hover:text-red-600 transition-colors">
                        {cert.name}
                      </h4>
                      <p className="text-xs text-stone-400">{cert.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">{cert.purity}</div>
                    <p className="text-xs text-stone-400">Purity</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-stone-400 group-hover:text-red-600/70 transition-colors">
                  <Download className="w-3 h-3" />
                  <span>Click to download PDF</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button variant="outline" className="border-red-700/50 text-red-600 hover:bg-red-700/10">
            <ExternalLink className="w-4 h-4 mr-2" />
            View All Test Reports
          </Button>
        </motion.div>
      </div>
    </section>
  );
}