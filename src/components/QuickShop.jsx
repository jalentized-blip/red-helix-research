import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function QuickShop() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const categories = [
    { name: 'Weight Loss', value: 'weight_loss' },
    { name: 'Recovery & Healing', value: 'recovery_healing' },
    { name: 'Performance', value: 'performance_longevity' },
    { name: 'Cognitive', value: 'cognitive_focus' },
    { name: 'Sexual Health', value: 'sexual_health' },
  ];

  const handleCategoryClick = (categoryValue) => {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const categoryFilter = document.querySelector(`[data-category="${categoryValue}"]`);
        if (categoryFilter) {
          categoryFilter.click();
        }
      }, 500);
    }
    setIsOpen(false);
  };

  const handleProductClick = (product) => {
    window.dispatchEvent(new CustomEvent('openProductModal', { detail: product }));
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const featuredProducts = products.filter(p => {
    if (!p.is_featured || p.is_deleted || p.hidden) return false;
    const visibleSpecs = p.specifications?.filter(spec => !spec.hidden) || [];
    return visibleSpecs.some(spec => spec.in_stock && (spec.stock_quantity > 0 || spec.stock_quantity === undefined));
  }).slice(0, 4);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 bottom-24 z-[60] p-4 bg-gradient-to-br from-[#dc2626] to-red-700 hover:from-red-700 hover:to-red-800 rounded-full shadow-2xl border-2 border-red-500/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <ShoppingBag className="w-6 h-6 text-white" />
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </motion.button>

      {/* Slide-out Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65]"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 z-[70] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Quick Shop</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Research Categories</h3>
                  <div className="grid gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => handleCategoryClick(category.value)}
                        data-category={category.value}
                        className="group p-4 bg-slate-50 hover:bg-white border border-slate-100 hover:border-[#dc2626]/30 rounded-2xl transition-all text-left shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-slate-900 font-black uppercase tracking-tight group-hover:text-[#dc2626] transition-colors">
                              {category.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                              {products.filter(p => {
                              if (p.category !== category.value || p.is_deleted || p.hidden) return false;
                              const vs = p.specifications?.filter(s => !s.hidden) || [];
                              return vs.some(s => s.in_stock && (s.stock_quantity > 0 || s.stock_quantity === undefined));
                            }).length} research units
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#dc2626] group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured Products */}
                {featuredProducts.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Featured Units</h3>
                    <div className="space-y-3">
                      {featuredProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="w-full p-4 bg-slate-50 hover:bg-white border border-slate-100 hover:border-[#dc2626]/30 rounded-2xl transition-all text-left group shadow-sm hover:shadow-md flex gap-4"
                        >
                          <div className="w-16 h-16 bg-white rounded-xl border border-slate-100 p-1 flex-shrink-0">
                            <img 
                              src="https://i.ibb.co/kVLqM7Ff/redhelixxx-1.png" 
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-slate-900 uppercase tracking-tight group-hover:text-[#dc2626] transition-colors truncate">
                              {product.name}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[#dc2626] font-black text-sm">
                                ${product.price_from}
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#dc2626] group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Links */}
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Navigation</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        const element = document.getElementById('products');
                        element?.scrollIntoView({ behavior: 'smooth' });
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-6 py-4 bg-slate-900 hover:bg-[#dc2626] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-lg shadow-slate-900/10 hover:shadow-[#dc2626]/20"
                    >
                      View Full Catalog
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}