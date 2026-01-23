import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/95 to-neutral-950/70" />
      
      {/* Animated accent line */}
      <motion.div 
        className="absolute left-0 top-1/4 w-1 h-32 bg-gradient-to-b from-yellow-500 to-transparent"
        initial={{ height: 0 }}
        animate={{ height: 128 }}
        transition={{ duration: 1, delay: 0.5 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-32">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
            <span className="text-white">PREMIUM QUALITY,</span>
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              LAB VERIFIED.
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl font-semibold text-neutral-200 mb-3 tracking-wide">
            Every Batch Tested. Every Result Trusted.
          </p>
          <p className="text-sm md:text-base text-yellow-500/90 font-medium uppercase tracking-widest mb-10">
            For Research and Laboratory Use Only
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline"
              onClick={() => scrollTo('certificates')}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-neutral-900 px-8 py-6 text-base font-semibold uppercase tracking-wide transition-all"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Test Reports
            </Button>
            <Button 
              onClick={() => scrollTo('products')}
              className="bg-yellow-500 hover:bg-yellow-400 text-neutral-900 px-8 py-6 text-base font-semibold uppercase tracking-wide"
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
        <div className="w-6 h-10 rounded-full border-2 border-yellow-500/50 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-yellow-500 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}