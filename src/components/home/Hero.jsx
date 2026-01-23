import React from 'react';
import { Button } from "@/components/ui/button";
import { Globe, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 pt-20 pb-12 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-transparent" />
      
      {/* Animated glow */}
      <motion.div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-4xl mx-auto"
      >
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center justify-center w-28 h-28 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30"
        >
          <span className="text-4xl font-black text-yellow-400">CP</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
          <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            CHIMERA PEPTIDES
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-neutral-400 mb-2">
          Research-grade peptides. Lab tested. Third-party verified.
        </p>
        <p className="text-base md:text-lg text-neutral-300 font-medium mb-10">
          Trusted by <span className="text-yellow-400">2,000+</span> researchers worldwide.
        </p>

        {/* Shipping Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Button 
            variant="outline" 
            className="bg-yellow-500/10 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-400 px-6 py-6 text-base"
          >
            <Globe className="w-5 h-5 mr-2" />
            International (7–14 days)
          </Button>
          <Button 
            variant="outline" 
            className="bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:bg-neutral-700/50 hover:border-neutral-600 px-6 py-6 text-base"
          >
            <Truck className="w-5 h-5 mr-2" />
            US Domestic (3–5 days)
          </Button>
        </div>

        {/* Navigation Pills */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={() => scrollTo('bestsellers')}
            className="border-neutral-700 text-neutral-300 hover:border-yellow-500/50 hover:text-yellow-400 hover:bg-yellow-500/5"
          >
            Best Sellers
          </Button>
          <Button 
            variant="outline" 
            onClick={() => scrollTo('goals')}
            className="border-neutral-700 text-neutral-300 hover:border-yellow-500/50 hover:text-yellow-400 hover:bg-yellow-500/5"
          >
            Shop by Goal
          </Button>
          <Button 
            variant="outline" 
            onClick={() => scrollTo('products')}
            className="border-neutral-700 text-neutral-300 hover:border-yellow-500/50 hover:text-yellow-400 hover:bg-yellow-500/5"
          >
            Browse All Products
          </Button>
        </div>
      </motion.div>
    </section>
  );
}