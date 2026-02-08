import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, ShoppingBag, ShieldCheck, Microscope, Zap } from "lucide-react";
import { motion } from "framer-motion";

const Hero = React.memo(() => {
  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden pt-12 md:pt-24">
      {/* Dynamic Background - Modern Medical Clean White/Slate */}
      <div className="absolute inset-0 bg-slate-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.05),transparent_70%)]" />
      
      {/* Animated Grid Pattern - Subtler for Light Mode */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItMnptMCAwdi0yIDJ6bTAtMnYyLTJ6bS0yIDJ2LTIgMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />

      {/* Floating Molecular Shapes - Brighter & More Professional */}
      <motion.div 
        className="absolute top-1/4 right-1/4 w-32 md:w-64 h-32 md:h-64 bg-red-600/5 rounded-full blur-[60px] md:blur-[100px]"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute bottom-1/4 left-1/4 w-40 md:w-80 h-40 md:h-80 bg-blue-400/5 rounded-full blur-[80px] md:blur-[120px]"
        animate={{ 
          scale: [1.1, 1, 1.1],
          opacity: [0.2, 0.3, 0.2],
          x: [0, -30, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 2 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32 flex flex-col lg:flex-row items-center gap-12 md:gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex-1 text-center lg:text-left w-full"
        >
          {/* Trust Badge - Brighter Clinical Look */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full mb-6 md:mb-8 shadow-sm"
          >
            <ShieldCheck className="w-3 md:w-4 h-3 md:h-4 text-red-600" />
            <span className="text-[10px] md:text-xs font-bold tracking-widest text-slate-600 uppercase">ISO 9001:2015 Certified Sourcing</span>
          </motion.div>

          {/* Main Title - High Contrast on Light BG */}
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 md:mb-8 leading-[0.9] lg:leading-[0.85] flex flex-col">
            <span className="text-slate-900">PRECISION</span>
            <span className="text-red-600">RESEARCH</span>
            <span className="text-slate-900">PEPTIDES</span>
          </h1>

          <p className="text-base md:text-xl text-slate-600 mb-8 md:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Red Helix Research provides high-purity, third-party verified peptides for advanced scientific study and laboratory experimentation.
          </p>

          {/* Stats/Features - Clean Medical Icons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12">
            {[
              { icon: Microscope, label: "99%+ Purity", sub: "HPLC Verified" },
              { icon: Zap, label: "Fast Shipping", sub: "24-48h Dispatch" },
              { icon: FileText, label: "Verified COAs", sub: "Third-Party Lab" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center lg:items-start gap-1 p-3 bg-white/50 rounded-2xl border border-slate-100 lg:bg-transparent lg:border-0 lg:p-0">
                <stat.icon className="w-4 md:w-5 h-4 md:h-5 text-red-600 mb-1" />
                <span className="text-xs md:text-sm font-bold text-slate-900">{stat.label}</span>
                <span className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-tighter font-bold">{stat.sub}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons - Professional High Contrast */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
            <Button 
              onClick={() => scrollTo('products')}
              className="group bg-red-600 hover:bg-red-700 text-white px-8 md:px-10 py-6 md:py-8 text-base md:text-lg font-black rounded-xl md:rounded-2xl shadow-[0_10px_30px_-5px_rgba(220,38,38,0.3)] hover:shadow-[0_15px_40px_-5px_rgba(220,38,38,0.4)] transition-all duration-300 transform hover:-translate-y-1"
            >
              <ShoppingBag className="w-5 md:w-6 h-5 md:h-6 mr-3 group-hover:rotate-12 transition-transform" />
              EXPLORE CATALOG
            </Button>
            <Button 
              variant="outline"
              onClick={() => scrollTo('certificates')}
              className="bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 px-8 md:px-10 py-6 md:py-8 text-base md:text-lg font-black rounded-xl md:rounded-2xl transition-all duration-300 shadow-sm"
            >
              VIEW LAB REPORTS
            </Button>
          </div>
        </motion.div>

        {/* Hero Visual Component - Clean Lab Environment */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex-1 relative hidden lg:block"
        >
          <div className="relative w-full aspect-square">
            {/* Main Glassmorphic Card - Brighter & Cleaner */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl rounded-[40px] border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(239,68,68,0.05),transparent_50%)]" />
              
              {/* Animated Scientific Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="w-3/4 h-3/4 border border-slate-200 rounded-full border-dashed"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute w-1/2 h-1/2 border border-slate-200 rounded-full border-dashed"
                />
                <img 
                  src="https://i.ibb.co/nNNG1FKC/redhelixresearchvial20.jpg" 
                  alt="Premium Research Vial"
                  className="relative z-10 w-48 h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] transform group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Data Floating Elements - Professional Labels */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-12 left-12 p-4 bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl shadow-lg"
              >
                <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">Identity Confirmation</div>
                <div className="text-xs font-black text-green-600">MASS SPECTROMETRY: PASS</div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute bottom-12 right-12 p-4 bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl shadow-lg"
              >
                <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">Purity Analysis</div>
                <div className="text-xs font-black text-red-600">HPLC: 99.82%</div>
              </motion.div>
            </div>

            {/* Background Glow - Subtler */}
            <div className="absolute -inset-4 bg-red-600/5 blur-2xl rounded-[40px] -z-10" />
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
        <div className="w-[1px] h-12 bg-gradient-to-b from-red-600 to-transparent" />
      </motion.div>
    </section>
  );
});

Hero.displayName = 'Hero';

export default Hero;
