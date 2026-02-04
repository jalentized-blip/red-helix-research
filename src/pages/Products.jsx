import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Filter, Search, X } from 'lucide-react';
import ProductModal from '@/components/product/ProductModal';
import SEO from '@/components/SEO';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'all', label: 'All Products', icon: '🧬' },
  { id: 'weight_loss', label: 'Weight Loss', icon: '⚖️' },
  { id: 'recovery_healing', label: 'Recovery & Healing', icon: '🔬' },
  { id: 'cognitive_focus', label: 'Cognitive & Focus', icon: '🧠' },
  { id: 'performance_longevity', label: 'Performance & Longevity', icon: '💪' },
  { id: 'sexual_health', label: 'Sexual Health', icon: '❤️' },
  { id: 'general_health', label: 'General Health', icon: '🏥' }
];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  // Real-time stock updates
  useEffect(() => {
    const unsubscribe = base44.entities.Product.subscribe(() => {
      refetch();
    });
    return unsubscribe;
  }, [refetch]);

  const filteredProducts = products.filter(p => {
    const categoryMatch = selectedCategory === 'all' || p.category === selectedCategory;
    
    // Check if any specification is in stock and not hidden
    const hasAvailableSpec = p.specifications?.some(spec => spec.in_stock && !spec.hidden) || false;
    const productInStock = p.in_stock || hasAvailableSpec;
    const stockMatch = hideOutOfStock ? productInStock : true;
    
    const searchMatch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && stockMatch && searchMatch;
  });

  const handleSelectStrength = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Research Peptides Catalog | Red Helix Research"
        description="Browse our complete catalog of research-grade peptides. BPC-157, TB-500, Semaglutide, Tirzepatide and more with verified COAs."
        keywords="research peptides catalog, buy peptides, peptide shop, BPC-157, TB-500, semaglutide, tirzepatide"
      />

      <div className="max-w-7xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">
            Research Peptides
          </h1>
          <p className="text-xl text-stone-300">
            Premium research-grade peptides with verified COAs
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 space-y-6"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-12 pr-12 py-4 bg-stone-900/50 border-2 border-stone-700 rounded-xl text-amber-50 placeholder:text-stone-500 focus:outline-none focus:border-red-600/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Stock Filter */}
          <div>
            <button
              onClick={() => setHideOutOfStock(!hideOutOfStock)}
              className="flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all bg-stone-800/30 border-stone-700 hover:border-red-600/30"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                hideOutOfStock 
                  ? 'bg-red-600 border-red-600' 
                  : 'border-stone-500'
              }`}>
                {hideOutOfStock && (
                  <svg className="w-3 h-3 text-amber-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-stone-300 font-semibold">Hide out of stock</span>
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-stone-400" />
              <h2 className="text-lg font-bold text-amber-50">Filter by Category</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    selectedCategory === category.id
                      ? 'bg-red-600/20 border-red-600/70 text-amber-50'
                      : 'bg-stone-800/30 border-stone-700 text-stone-300 hover:border-red-600/30'
                  }`}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="text-sm font-semibold">{category.label}</div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <p className="text-stone-400 mt-4">Loading products...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <p className="text-stone-400">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredProducts.map((product, index) => {
                  const hasAvailableSpec = product.specifications?.some(spec => spec.in_stock && !spec.hidden) || false;
                  const productInStock = product.in_stock || hasAvailableSpec;

                  return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectStrength(product)}
                    className="group cursor-pointer bg-stone-900/60 border border-stone-700 rounded-xl p-6 hover:border-red-600/50 transition-all hover:shadow-lg hover:shadow-red-600/10 relative"
                  >
                    <div className="mb-4 rounded-lg overflow-hidden bg-stone-800/50 relative">
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/7cabb1c33_image.png"
                        alt={product.name}
                        className={`w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 ${!productInStock ? 'opacity-40' : ''}`}
                      />
                      {!productInStock && (
                        <div className="absolute inset-0 bg-stone-900/80 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-2xl font-black text-stone-400 tracking-wider">OUT OF STOCK</p>
                            <p className="text-sm text-stone-500 mt-1">Check back soon</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      {product.badge && (
                        <span className="inline-block px-3 py-1 bg-red-600/20 text-red-400 text-xs font-bold rounded-full mb-2 uppercase">
                          {product.badge.replace('_', ' ')}
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-amber-50 group-hover:text-red-400 transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    {product.description && (
                      <p className="text-stone-400 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-stone-700">
                      <div>
                        <p className="text-stone-500 text-xs">Starting at</p>
                        <p className={`text-2xl font-bold ${productInStock ? 'text-red-600' : 'text-stone-500'}`}>
                          ${product.price_from}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`${productInStock ? 'group-hover:bg-red-600 group-hover:text-amber-50 group-hover:border-red-600' : 'opacity-50'}`}
                      >
                        {productInStock ? 'View Options' : 'Unavailable'}
                      </Button>
                    </div>
                    </motion.div>
                    );
                    })}
              </motion.div>
            </AnimatePresence>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-stone-400 text-lg">No products found in this category.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}