import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const certificates = [
  {
    peptide: "Retatrutide 10mg",
    batch: "K748--001",
    purity: "99.044%",
    testDate: "26 NOV 2025",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/b2321e104_image.png"
  },
  {
    peptide: "Retatrutide 30mg",
    batch: "K748--002",
    purity: "99.728%",
    testDate: "26 NOV 2025",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/50426b7a5_image.png"
  },
  {
    peptide: "Tirzepatide 30mg",
    batch: "K748--003",
    purity: "99.828%",
    testDate: "26 NOV 2025",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/d0d65d460_image.png"
  },
  {
    peptide: "Tirzepatide 60mg",
    batch: "K748--004",
    purity: "99.742%",
    testDate: "26 NOV 2025",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/5207fb61b_image.png"
  },
  {
    peptide: "Retatrutide 10mg",
    batch: "R10260104-300",
    purity: "99.251%",
    testDate: "19 JAN 2026",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/3cb69f386_image.png"
  }
];

export default function Certificates() {
  const [selectedCert, setSelectedCert] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const displayedCerts = showAll ? certificates : certificates.slice(0, 3);

  return (
    <section id="certificates" className="py-24 px-4 bg-stone-950/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-700/10 rounded-full border border-red-700/30 mb-6">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-600">Third-Party Verified</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Certificates of Analysis
            </span>
          </h2>
          <p className="text-stone-300 text-lg max-w-2xl mx-auto">
            Every batch tested by Janoshik Analytical for verified purity and quality.
          </p>
        </motion.div>

        {/* Certificates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCerts.map((cert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                className="bg-stone-900/60 border-stone-700 overflow-hidden hover:border-red-600/50 transition-all cursor-pointer group"
                onClick={() => setSelectedCert(cert)}
              >
                <div className="aspect-[3/4] overflow-hidden bg-stone-800">
                  <img 
                    src={cert.imageUrl} 
                    alt={`${cert.peptide} COA`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-amber-50 mb-1">{cert.peptide}</h3>
                  <p className="text-sm text-stone-400 mb-2">Batch: {cert.batch}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-500">{cert.purity}</span>
                    <ExternalLink className="w-4 h-4 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-stone-500 mt-2">{cert.testDate}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        {!showAll && certificates.length > 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button
              onClick={() => setShowAll(true)}
              className="px-8 py-3 bg-red-700 hover:bg-red-600 text-amber-50 font-semibold rounded-lg transition-colors"
            >
              Load More Tests
            </button>
          </motion.div>
        )}
      </div>

      {/* Full Image Dialog */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-4xl bg-stone-900 border-stone-700">
          {selectedCert && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-amber-50">{selectedCert.peptide}</h3>
                  <p className="text-stone-400">Batch: {selectedCert.batch}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-500">{selectedCert.purity}</p>
                  <p className="text-sm text-stone-400">{selectedCert.testDate}</p>
                </div>
              </div>
              <img 
                src={selectedCert.imageUrl} 
                alt={`${selectedCert.peptide} COA`}
                className="w-full rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}