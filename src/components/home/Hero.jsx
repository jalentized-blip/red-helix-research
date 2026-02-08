import React, { useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const Hero = React.memo(() => {
  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden pt-12">
      {/* Background with modern gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-950/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItMnptMCAwdi0yIDJ6bTAtMnYyLTJ6bTItMnYyLTJ6bS0yIDJ2LTIgMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
      
      {/* Modern geometric accents */}
       <motion.div 
         className="absolute right-[10%] top-[15%] w-96 h-96 bg-red-600/5 rounded-full blur-3xl"
         animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
         transition={{ duration: 8, repeat: Infinity }}
       />
       <motion.div 
         className="absolute left-[15%] bottom-[20%] w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"
         animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
         transition={{ duration: 10, repeat: Infinity, delay: 2 }}
       />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-32">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.95]">
            <span className="bg-gradient-to-r from-amber-50 via-white to-amber-50 bg-clip-text text-transparent">
              Research Peptides
            </span>
            <br />
            <span className="text-5xl md:text-6xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text text-transparent">
              For Laboratory Use Only
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl font-medium text-stone-300 mb-2 tracking-wide">
            Premium Research Chemical Supplier
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="px-4 py-1.5 bg-stone-800/50 backdrop-blur-sm border border-stone-700/50 rounded-full text-xs font-medium text-stone-300">
              Third-Party Tested
            </span>
            <span className="px-4 py-1.5 bg-stone-800/50 backdrop-blur-sm border border-stone-700/50 rounded-full text-xs font-medium text-stone-300">
              Research Grade
            </span>
            <span className="px-4 py-1.5 bg-stone-800/50 backdrop-blur-sm border border-stone-700/50 rounded-full text-xs font-medium text-stone-300">
              Lab Use Only
            </span>
          </div>
          <div className="bg-gradient-to-r from-yellow-950/30 via-yellow-900/20 to-yellow-950/30 backdrop-blur-sm border border-yellow-700/30 rounded-2xl px-6 py-4 mb-10">
            <p className="text-yellow-100/90 text-sm font-medium flex items-start gap-3">
              <span className="text-xl mt-0.5">⚠️</span>
              <span>FOR RESEARCH AND LABORATORY USE ONLY - NOT INTENDED FOR HUMAN CONSUMPTION</span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => scrollTo('products')}
              className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-7 text-base font-semibold rounded-2xl shadow-lg shadow-red-900/30 hover:shadow-xl hover:shadow-red-900/40 transition-all border border-red-500/20"
            >
              <ShoppingBag className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Shop Peptides
            </Button>
            <Button 
              variant="outline"
              onClick={() => scrollTo('certificates')}
              className="bg-stone-900/50 backdrop-blur-sm border-2 border-stone-700/50 text-stone-200 hover:bg-stone-800/80 hover:border-stone-600 px-10 py-7 text-base font-semibold rounded-2xl transition-all"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Test Reports
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