import React from 'react';
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export default function ValueProposition() {
  return (
    <section className="py-24 px-4 bg-red-600 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1),transparent_70%)]" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full mb-6">
            <ShieldCheck className="w-3 h-3 text-white" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Integrity & Standards</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter text-white leading-none">
            COMMITTED TO <br />
            <span className="text-white/80">TRANSPARENCY</span>
          </h2>
          
          <p className="text-white/90 text-lg max-w-3xl mx-auto leading-relaxed font-medium">
            At Red Helix Research, we provide research-grade peptides for laboratory and scientific research purposes only. All products are intended for in vitro research and are not approved for human or veterinary use.
          </p>

          <div className="mt-12 p-8 bg-white/5 border border-white/10 rounded-[40px] max-w-3xl mx-auto shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
              <AlertTriangle className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-white" />
                <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Mandatory Regulatory Disclosure</p>
              </div>
              <p className="text-white text-sm font-bold leading-relaxed">
                RESEARCH USE ONLY — These products are intended strictly for laboratory research and are not approved by the FDA for human consumption, therapeutic use, or any clinical application.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Visual Element - Standardized Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <div className="relative group">
            <div className="absolute -inset-10 bg-white/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative bg-white rounded-[40px] p-12 border border-white/20 shadow-xl group-hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-center gap-12">
                <img 
                  src="https://i.ibb.co/nNNG1FKC/redhelixresearchvial20.jpg" 
                  alt="Standardized Research Unit"
                  className="w-48 h-auto drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="hidden md:flex flex-col gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-sm">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">VERIFIED BATCH {i}0{i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}