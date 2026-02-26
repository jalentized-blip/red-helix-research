import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function AboutSection() {
  const vialImage = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/47c42ae69_labphoto.png";

  return (
    <section className="py-24 px-4 relative overflow-hidden bg-white">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Image/Visual - Left Side for Balance */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            <div className="aspect-[4/5] rounded-[40px] overflow-hidden border border-slate-100 bg-slate-50 relative shadow-2xl">
              {vialImage ? (
                <>
                  <motion.img 
                    src={vialImage}
                    alt="Research Laboratory"
                    className="w-full h-full object-cover"
                    animate={{ scale: 1.05 }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#dc2626]/20 border-t-red-600 rounded-full animate-spin" />
                    <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Initializing Visuals...</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Floating Achievement Badge */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-10 -right-10 bg-white border border-slate-100 p-8 rounded-[32px] shadow-2xl max-w-[240px]"
            >
              <div className="text-4xl font-black text-[#dc2626] mb-1">2,000+</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight">Researchers Rely on Our Purity Standards</div>
            </motion.div>
          </motion.div>

          {/* Content - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626] border border-[#dc2626] rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Established Research Protocol</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-[0.9]">
              <span className="text-slate-900">THE HELIX</span>
              <br />
              <span className="text-[#dc2626]">STANDARD</span>
            </h2>

            <div className="space-y-6 text-slate-600 leading-relaxed font-medium text-lg">
              <p>
                Red Helix Research is a premier supplier of high-purity research compounds, 
                engineered for analytical precision and absolute batch consistency. We serve 
                the global scientific community with a commitment to transparency that 
                defines our reputation.
              </p>
              <p>
                Every compound is synthesized in state-of-the-art facilities and verified 
                through comprehensive <span className="text-[#dc2626] font-bold underline decoration-[#dc2626]/30 underline-offset-4">third-party HPLC and Mass Spec analysis</span>. 
                Our lab archives are publicly accessible, providing the verification 
                required for rigorous experimentation.
              </p>
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Core Commitments:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#dc2626] flex items-center justify-center text-white text-[10px]">✓</div>
                    <span className="text-xs font-black text-slate-900 uppercase">cGMP Sourced</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#dc2626] flex items-center justify-center text-white text-[10px]">✓</div>
                    <span className="text-xs font-black text-slate-900 uppercase">USA Verified</span>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="mt-12 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black px-10 py-8 rounded-2xl shadow-lg shadow-[#dc2626]/20 transition-all hover:scale-[1.02] active:scale-95 text-lg uppercase tracking-widest"
            >
              Learn More <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}