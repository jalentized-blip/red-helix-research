import React, { useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const Hero = React.memo(() => {
  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay - Lazy loaded */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1920&q=80&auto=format')`,
          willChange: 'auto'
        }}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/95 to-stone-950/70" style={{ willChange: 'auto' }} />
      
      {/* Animated accent line */}
       <motion.div 
         className="absolute left-0 top-1/4 w-1 h-32 bg-gradient-to-b from-red-700 to-transparent"
         initial={{ height: 0 }}
         animate={{ height: 128 }}
         transition={{ duration: 1, delay: 0.5 }}
       />

       {/* Floating peptide molecules */}
       <motion.div 
         className="absolute right-20 top-20 text-red-600/30 text-8xl"
         animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
         transition={{ duration: 8, repeat: Infinity }}
       >
         <svg width="120" height="120" viewBox="0 0 100 100" className="opacity-50">
           <circle cx="50" cy="30" r="8" fill="currentColor" />
           <circle cx="25" cy="65" r="7" fill="currentColor" />
           <circle cx="75" cy="65" r="7" fill="currentColor" />
           <circle cx="50" cy="85" r="6" fill="currentColor" />
           <line x1="50" y1="38" x2="30" y2="60" stroke="currentColor" strokeWidth="2" />
           <line x1="50" y1="38" x2="70" y2="60" stroke="currentColor" strokeWidth="2" />
           <line x1="25" y1="72" x2="50" y2="79" stroke="currentColor" strokeWidth="2" />
           <line x1="75" y1="72" x2="50" y2="79" stroke="currentColor" strokeWidth="2" />
         </svg>
       </motion.div>

       <motion.div 
         className="absolute left-1/3 bottom-20 text-red-600/25 text-6xl"
         animate={{ y: [0, 15, 0], rotate: [-10, 10, -10] }}
         transition={{ duration: 6, repeat: Infinity, delay: 1 }}
       >
         <svg width="80" height="80" viewBox="0 0 100 100" className="opacity-40">
           <circle cx="50" cy="30" r="6" fill="currentColor" />
           <circle cx="30" cy="60" r="5" fill="currentColor" />
           <circle cx="70" cy="60" r="5" fill="currentColor" />
           <line x1="50" y1="36" x2="35" y2="55" stroke="currentColor" strokeWidth="1.5" />
           <line x1="50" y1="36" x2="65" y2="55" stroke="currentColor" strokeWidth="1.5" />
         </svg>
       </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-32">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
            <span className="text-amber-50">Research Peptides</span>
            <br />
            <span className="text-red-600" style={{ textShadow: '0 2px 8px rgba(139, 38, 53, 0.5), 0 0 15px rgba(139, 38, 53, 0.2)' }}>For Laboratory Use Only</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl font-semibold text-amber-100 mb-3 tracking-wide">
            Research Chemical Supplier
          </p>
          <p className="text-sm md:text-base text-red-600/90 font-medium uppercase tracking-widest mb-4">
            Verified Third-Party Testing • Research Grade • Not For Human Consumption
          </p>
          <div className="bg-yellow-950/40 border border-yellow-700/50 rounded-lg px-4 py-3 mb-10">
            <p className="text-yellow-100 text-xs md:text-sm font-semibold">
              ⚠️ FOR RESEARCH AND LABORATORY USE ONLY - NOT INTENDED FOR HUMAN CONSUMPTION
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline"
              onClick={() => scrollTo('certificates')}
              className="bg-transparent border-2 border-amber-50 text-amber-50 hover:bg-amber-50 hover:text-stone-900 px-8 py-6 text-base font-semibold uppercase tracking-wide transition-all"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Test Reports
            </Button>
            <Button 
              onClick={() => scrollTo('products')}
              className="bg-red-700 hover:bg-red-600 text-amber-50 px-8 py-6 text-base font-semibold uppercase tracking-wide"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Shop Peptides
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-red-700/50 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-red-700 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
});

Hero.displayName = 'Hero';

export default Hero;