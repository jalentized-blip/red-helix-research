import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, ShoppingBag, ShieldCheck, Microscope, Zap } from "lucide-react";
import { motion } from "framer-motion";

const Hero = React.memo(() => {
  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden pt-16 md:pt-24">
      {/* Dynamic Background - Modern Medical Clean White/Slate */}
      <div className="absolute inset-0 bg-slate-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.05),transparent_70%)]" />
      
      {/* Animated Grid Pattern - Subtler for Light Mode */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItMnptMCAwdi0yIDJ6bTAtMnYyLTJ6bS0yIDJ2LTIgMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />

      {/* Floating Molecular Shapes — use transform/opacity only for compositor-only animations (no layout thrash) */}
      <motion.div 
        className="absolute top-1/4 right-1/4 w-32 md:w-64 h-32 md:h-64 bg-[#8B2635]/5 rounded-full blur-[60px] md:blur-[100px] motion-blob"
        animate={{ 
          opacity: [0.3, 0.4, 0.3],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute bottom-1/4 left-1/4 w-40 md:w-80 h-40 md:h-80 bg-blue-400/5 rounded-full blur-[80px] md:blur-[120px] motion-blob"
        animate={{ 
          opacity: [0.2, 0.3, 0.2],
          x: [0, -30, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 2 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-12 py-14 md:py-32 flex flex-col lg:flex-row items-center gap-8 md:gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex-1 text-center lg:text-left w-full"
        >
          {/* Trust Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full mb-6 md:mb-8 shadow-sm"
          >
            <ShieldCheck className="w-3 md:w-4 h-3 md:h-4 text-[#8B2635]" />
            <span className="text-[10px] md:text-xs font-bold tracking-widest text-slate-600 uppercase">3rd-Party Lab Tested &amp; Verified</span>
          </motion.div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-5 md:mb-8 leading-[0.88] flex flex-col">
            <span className="text-black">QUALITY</span>
            <span className="text-[#8B2635]">RESEARCH</span>
            <span className="text-black">PEPTIDES</span>
          </h1>

          <p className="text-[15px] md:text-xl text-slate-600 mb-4 md:mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Red Helix Research offers high-purity, independently tested research peptides — shipped fast and backed by certificates of analysis on every batch.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B2635]/5 border border-[#8B2635]/20 rounded-full mb-6 md:mb-8">
            <span className="text-[10px] font-black text-[#8B2635] uppercase tracking-widest">⚠ For Research Use Only — Not For Human Consumption — Not FDA Approved</span>
          </div>

          {/* Stats/Features */}
          <div className="grid grid-cols-3 gap-2 md:gap-6 mb-8 md:mb-12">
            {[
              { icon: Microscope, label: "99%+ Purity", sub: "HPLC Verified" },
              { icon: Zap, label: "Fast Shipping", sub: "Ships in 24–48 hrs" },
              { icon: FileText, label: "Lab Reports Included", sub: "Third-Party Tested" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center lg:items-start gap-1 p-3 bg-white/60 rounded-2xl border border-slate-100 shadow-sm">
                <stat.icon className="w-4 md:w-5 h-4 md:h-5 text-[#8B2635] mb-0.5" />
                <span className="text-[11px] md:text-sm font-black text-black text-center lg:text-left leading-tight">{stat.label}</span>
                <span className="text-[9px] md:text-xs text-slate-500 uppercase tracking-tighter font-black hidden sm:block">{stat.sub}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-row gap-3 md:gap-4 justify-center lg:justify-start">
            <Button 
              onClick={() => scrollTo('products')}
              className="group flex-1 sm:flex-none bg-[#8B2635] hover:bg-[#6B1827] text-white px-6 md:px-10 py-5 md:py-6 text-base md:text-lg font-black rounded-xl md:rounded-2xl shadow-[0_10px_30px_-5px_rgba(220,38,38,0.3)] hover:shadow-[0_15px_40px_-5px_rgba(220,38,38,0.4)] transition-all duration-300 active:scale-95"
            >
              <ShoppingBag className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Shop Now
            </Button>
            <Button 
              variant="outline"
              onClick={() => scrollTo('certificates')}
              className="flex-1 sm:flex-none bg-white border-2 border-[#8B2635] text-[#8B2635] hover:bg-red-50 px-5 md:px-10 py-5 md:py-6 text-base md:text-lg font-black rounded-xl md:rounded-2xl transition-all duration-300 shadow-sm active:scale-95"
            >
              Lab Reports
            </Button>
          </div>
        </motion.div>


      </div>

      {/* Scroll Indicator - Brighter */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <span className="text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase">Scroll to explore</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-[#dc2626] to-transparent" />
      </motion.div>
    </section>
  );
});

Hero.displayName = 'Hero';

export default Hero;