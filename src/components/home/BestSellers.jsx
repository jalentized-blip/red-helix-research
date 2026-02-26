import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from './ProductCard';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const BestSellers = React.memo(({ products, onSelectStrength, isAuthenticated = true, isAdmin: isAdminProp = false }) => {
  const [effectiveIsAdmin, setEffectiveIsAdmin] = useState(isAdminProp);
  const queryClient = useQueryClient();

  useEffect(() => {
    setEffectiveIsAdmin(isAdminProp);
  }, [isAdminProp]);

  useEffect(() => {
    // Subscribe to product changes for real-time updates
    const unsubscribe = base44.entities.Product.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    });

    return unsubscribe;
  }, [queryClient]);

  const handleVisibilityToggle = useCallback(async (productId, newHiddenState) => {
    try {
      await base44.entities.Product.update(productId, { hidden: newHiddenState });
    } catch (error) {
      console.error('Failed to update product visibility:', error);
    }
  }, []);

  const featuredProducts = useMemo(() => {
    return products
      .filter(p => {
        const isFeatured = p.is_featured && !p.is_deleted;
        const isVisible = effectiveIsAdmin || !p.hidden;
        
        // Stock logic: Check if any specification is in stock
        const visibleSpecs = p.specifications?.filter(spec => !spec.hidden) || [];
        const inStock = visibleSpecs.some(spec => spec.in_stock && (spec.stock_quantity > 0 || spec.stock_quantity === undefined));
        
        if (effectiveIsAdmin) {
          return isFeatured;
        }
        return isFeatured && isVisible && inStock;
      })
      .map(p => {
        // Filter out 10-vial kit options from regular products (keep only single vials)
        if (!p.isKitsProduct && p.specifications) {
          return {
            ...p,
            specifications: p.specifications.filter(spec => 
              spec.name?.toLowerCase().includes('single vial')
            )
          };
        }
        return p;
      })
      .slice(0, 7);
  }, [products, effectiveIsAdmin]);

  return (
    <section id="bestsellers" className="py-12 md:py-24 px-4 relative overflow-hidden bg-white">
      {/* Scientific Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 text-[#dc2626]/5 text-8xl"
          animate={{ y: [0, 40, 0], rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity }}
        >
          <svg width="150" height="150" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="1" />
          </svg>
        </motion.div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626]/5 border border-[#dc2626]/10 rounded-full mb-6">
            <TrendingUp className="w-4 h-4 text-[#dc2626]" />
            <span className="text-[10px] font-black text-[#dc2626] uppercase tracking-widest">High Demand Reagents</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-6">
            BEST-SELLING <br />
            <span className="text-[#dc2626]">RESEARCH UNITS</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Our most frequently acquired research compounds, systematically verified for peak analytical performance.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {featuredProducts.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              index={index} 
              onSelectStrength={onSelectStrength} 
              isAuthenticated={isAuthenticated}
              isAdmin={effectiveIsAdmin}
              onVisibilityToggle={handleVisibilityToggle}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

BestSellers.displayName = 'BestSellers';

export default BestSellers;