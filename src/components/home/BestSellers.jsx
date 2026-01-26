import React from 'react';
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from './ProductCard';

export default function BestSellers({ products, onSelectStrength, isAuthenticated = true }) {
  const featuredProducts = products.filter(p => p.is_featured && !p.is_deleted).slice(0, 7);

  return (
    <section id="bestsellers" className="py-20 px-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-10 right-10 text-red-600/15 text-7xl"
          animate={{ y: [0, 30, 0], rotate: [0, 360] }}
          transition={{ duration: 12, repeat: Infinity }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="20" r="6" fill="currentColor" />
            <circle cx="77" cy="50" r="6" fill="currentColor" />
            <circle cx="50" cy="80" r="6" fill="currentColor" />
            <circle cx="23" cy="50" r="6" fill="currentColor" />
          </svg>
        </motion.div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-700/10 rounded-full border border-red-700/30 mb-6">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-600">Most Popular</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Best Sellers
            </span>
          </h2>
          <p className="text-stone-300 text-lg max-w-2xl mx-auto">
            Top-rated peptides trusted by thousands of researchers worldwide
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} onSelectStrength={onSelectStrength} isAuthenticated={isAuthenticated} />
          ))}
        </div>
      </div>
    </section>
  );
}