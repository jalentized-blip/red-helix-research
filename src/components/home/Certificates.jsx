import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ShieldCheck, ExternalLink, FileSearch, Zap, CheckCircle2, FlaskConical } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const certificates = [
  {
    peptide: "Retatrutide 10mg",
    batch: "K748--001",
    purity: "99.044%",
    testDate: "26 NOV 2025",
    lab: "Janoshik Analytical",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/b2321e104_image.png"
  },
  {
    peptide: "Retatrutide 30mg",
    batch: "K748--002",
    purity: "99.728%",
    testDate: "26 NOV 2025",
    lab: "Janoshik Analytical",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/50426b7a5_image.png"
  },
  {
    peptide: "Tirzepatide 30mg",
    batch: "K748--003",
    purity: "99.828%",
    testDate: "26 NOV 2025",
    lab: "Janoshik Analytical",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/d0d65d460_image.png"
  },
  {
    peptide: "Tirzepatide 60mg",
    batch: "K748--004",
    purity: "99.742%",
    testDate: "26 NOV 2025",
    lab: "Janoshik Analytical",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/5207fb61b_image.png"
  },
  {
    peptide: "Retatrutide 10mg",
    batch: "R10260104-300",
    purity: "99.251%",
    testDate: "19 JAN 2026",
    lab: "Janoshik Analytical",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/3cb69f386_image.png"
  }
];

export default function Certificates() {
  const [selectedCert, setSelectedCert] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const displayedCerts = showAll ? certificates : certificates.slice(0, 3);

  return (
    <section id="certificates" className="py-32 px-4 bg-white relative overflow-hidden">
      {/* Scientific Background */}
      <div className="absolute inset-0 bg-slate-50 opacity-40" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItMnptMCAwdi0yIDJ6bTAtMnYyLTJ6bS0yIDJ2LTIgMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626]/5 border border-[#dc2626]/10 rounded-full mb-8 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-[#dc2626]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#dc2626]">Laboratory Verification Protocol</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-[0.9]">
            CERTIFICATES OF <br />
            <span className="text-[#dc2626]">ANALYSIS (COA)</span>
          </h2>
          
          <p className="text-slate-500 text-lg max-w-2xl font-medium leading-relaxed">
            Uncompromising quality control. Every batch is independently verified for identity and purity at industry-standard third-party analytical facilities.
          </p>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedCerts.map((cert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
            >
              <Card 
                className="bg-white border-slate-100 hover:border-[#dc2626]/30 transition-all duration-500 cursor-pointer group relative overflow-hidden rounded-[40px] flex flex-col h-full shadow-sm hover:shadow-xl"
                onClick={() => setSelectedCert(cert)}
              >
                {/* Certificate Preview Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-50 p-4 border-b border-slate-100">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent z-10 opacity-60" />
                  <img 
                    src={cert.imageUrl} 
                    alt={`${cert.peptide} COA`}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-8 left-8 z-20">
                    <div className="px-3 py-1 bg-white/90 backdrop-blur-md border border-slate-100 rounded-full flex items-center gap-2 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span className="text-[10px] font-black text-green-600 uppercase tracking-tighter">Verified Purity</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <div className="w-12 h-12 rounded-full bg-[#dc2626] flex items-center justify-center shadow-xl">
                      <FileSearch className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="p-8 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-[#dc2626] transition-colors">
                        {cert.peptide}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Batch ID: {cert.batch}
                      </p>
                    </div>
                    <Zap className="w-5 h-5 text-[#dc2626]/10" />
                  </div>

                  <div className="flex items-end justify-between mt-auto pt-6 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Purity Rating</span>
                      <span className="text-3xl font-black text-slate-900 group-hover:text-green-600 transition-colors">
                        {cert.purity}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Analysis Date</span>
                      <span className="text-xs font-bold text-slate-500">
                        {cert.testDate}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More/Action Area */}
        <div className="mt-20 flex flex-col items-center gap-8">
          {certificates.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="group relative px-10 py-5 bg-white border-2 border-slate-100 hover:border-[#dc2626] text-slate-900 font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-sm"
            >
              <span className="relative z-10 flex items-center gap-3">
                {showAll ? 'Collapse Archive' : 'Access Full Test Archive'}
                <ExternalLink className="w-4 h-4 group-hover:rotate-45 transition-transform" />
              </span>
            </button>
          )}

          <div className="flex items-center gap-4 text-slate-400">
            <FlaskConical className="w-4 h-4" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
              All tests performed at accredited third-party facilities
            </p>
          </div>
        </div>
      </div>

      {/* Modern Dialog for Full Certificate View */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-5xl bg-white border-slate-200 p-0 overflow-hidden rounded-[40px] shadow-2xl">
          {selectedCert && (
            <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
              {/* Image Side */}
              <div className="flex-grow bg-slate-50 p-6 lg:p-12 overflow-y-auto scrollbar-hide">
                <img 
                  src={selectedCert.imageUrl} 
                  alt={`${selectedCert.peptide} COA`}
                  className="w-full h-auto rounded-3xl shadow-lg border border-white"
                />
              </div>
              
              {/* Details Side */}
              <div className="w-full lg:w-[400px] bg-white p-10 border-l border-slate-100 flex flex-col">
                <div className="mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/5 border border-green-500/10 rounded-full mb-6">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Certified Pass</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">{selectedCert.peptide}</h3>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Laboratory Report</p>
                </div>

                <div className="space-y-6 flex-grow">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch Identifier</p>
                    <p className="text-slate-900 font-bold">{selectedCert.batch}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Analytical Laboratory</p>
                    <p className="text-slate-900 font-bold">{selectedCert.lab}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Purity Level</p>
                    <p className="text-green-600 text-2xl font-black">{selectedCert.purity}</p>
                  </div>
                </div>

                <div className="mt-10">
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                    *This document is a digital representation of the physical analysis performed. Verification can be performed directly via the laboratory's portal using the Batch ID.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}