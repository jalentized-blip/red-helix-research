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
    { name: 'Weight Loss', value: 'weight_loss', color: 'from-red-600 to-orange-600' },
    { name: 'Recovery & Healing', value: 'recovery_healing', color: 'from-blue-600 to-cyan-600' },
    { name: 'Performance', value: 'performance_longevity', color: 'from-purple-600 to-pink-600' },
    { name: 'Cognitive', value: 'cognitive_focus', color: 'from-green-600 to-emerald-600' },
    { name: 'Sexual Health', value: 'sexual_health', color: 'from-rose-600 to-red-600' },
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

  const featuredProducts = products.filter(p => p.is_featured).slice(0, 4);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 bottom-24 z-[60] p-4 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-full shadow-2xl border-2 border-red-500/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <ShoppingBag className="w-6 h-6 text-amber-50" />
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-stone-950"
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
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-stone-900 border-l border-stone-700 z-[70] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-stone-900 border-b border-stone-700 p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-amber-50">Quick Shop</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="text-lg font-bold text-amber-50 mb-4">Shop by Category</h3>
                  <div className="grid gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => handleCategoryClick(category.value)}
                        data-category={category.value}
                        className="group p-4 bg-stone-800/50 hover:bg-stone-800 border border-stone-700 hover:border-red-600/50 rounded-lg transition-all text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`text-transparent bg-gradient-to-r ${category.color} bg-clip-text font-bold`}>
                              {category.name}
                            </div>
                            <div className="text-xs text-stone-400 mt-1">
                              {products.filter(p => p.category === category.value).length} products
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured Products */}
                {featuredProducts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-amber-50 mb-4">Featured Products</h3>
                    <div className="space-y-3">
                      {featuredProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="w-full p-4 bg-stone-800/50 hover:bg-stone-800 border border-stone-700 hover:border-red-600/50 rounded-lg transition-all text-left group"
                        >
                          <div className="font-bold text-amber-50 group-hover:text-red-400 transition-colors">
                            {product.name}
                          </div>
                          <div className="text-sm text-stone-400 mt-1 line-clamp-2">
                            {product.description}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-red-600 font-bold">
                              From ${product.price_from}
                            </span>
                            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Links */}
                <div>
                  <h3 className="text-lg font-bold text-amber-50 mb-4">Quick Links</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        const element = document.getElementById('products');
                        element?.scrollIntoView({ behavior: 'smooth' });
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 bg-stone-800/50 hover:bg-stone-800 border border-stone-700 hover:border-red-600/50 rounded-lg text-stone-300 hover:text-amber-50 transition-all"
                    >
                      View All Products
                    </button>
                    <button
                      onClick={() => {
                        const element = document.getElementById('goals');
                        element?.scrollIntoView({ behavior: 'smooth' });
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 bg-stone-800/50 hover:bg-stone-800 border border-stone-700 hover:border-red-600/50 rounded-lg text-stone-300 hover:text-amber-50 transition-all"
                    >
                      Shop by Goal
                    </button>
                    <button
                      onClick={() => {
                        const element = document.getElementById('best-sellers');
                        element?.scrollIntoView({ behavior: 'smooth' });
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 bg-stone-800/50 hover:bg-stone-800 border border-stone-700 hover:border-red-600/50 rounded-lg text-stone-300 hover:text-amber-50 transition-all"
                    >
                      Best Sellers
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