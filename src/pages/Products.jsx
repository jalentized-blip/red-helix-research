import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Filter, Search, X, Package, ShieldCheck, Beaker } from 'lucide-react';
import ProductModal from '@/components/product/ProductModal';
import SEO from '@/components/SEO';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'all', label: 'All Products', icon: <Beaker className="w-6 h-6" /> },
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
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO
        title="Research Peptides Catalog - For Laboratory Use Only | Red Helix Research"
        description="Research-grade peptides for laboratory and scientific research. BPC-157, TB-500, Semaglutide, Tirzepatide with verified COAs. For research use only, not for human consumption."
        keywords="research peptides, laboratory peptides, research chemicals, BPC-157 research, TB-500 research, peptide research supplies, in vitro research, scientific peptides"
      />

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" className="mb-4 hover:bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-xs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-2 uppercase tracking-tighter leading-none">
                Research <span className="text-red-600">Catalog</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-2xl">
                Premium laboratory reagents with verified third-party analysis.
              </p>
            </motion.div>
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-full border border-slate-200">
            <ShieldCheck className="w-5 h-5 text-red-600" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">
              Verified Purity Standards
            </span>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-8 space-y-6">
            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-600 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search research database..."
                className="w-full pl-16 pr-12 py-6 bg-slate-50 border-2 border-slate-100 rounded-[32px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-600/30 focus:bg-white transition-all shadow-sm group-hover:shadow-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Research Categories
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-6 py-3 rounded-full border-2 transition-all text-sm font-bold flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20'
                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-slate-900 rounded-[32px] p-8 text-white h-full flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4">Inventory Filters</h3>
                <button
                  onClick={() => setHideOutOfStock(!hideOutOfStock)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all group"
                >
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white">Hide Unavailable Stock</span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${hideOutOfStock ? 'bg-red-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${hideOutOfStock ? 'left-6' : 'left-1'}`} />
                  </div>
                </button>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3 text-slate-400">
                  <Package className="w-5 h-5" />
                  <p className="text-xs font-medium">
                    Showing {filteredProducts.length} research products
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-40">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-red-600"></div>
            <p className="text-slate-500 font-bold mt-4 uppercase tracking-widest text-xs">Accessing Database...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
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
                      className="group cursor-pointer bg-slate-50 border border-slate-200 rounded-[40px] p-8 hover:bg-white hover:border-red-600/30 transition-all hover:shadow-2xl hover:shadow-red-600/10 relative overflow-hidden flex flex-col h-full"
                    >
                      {/* Product Badge */}
                      <div className="mb-6 flex items-start justify-between relative z-10">
                        {product.badge ? (
                          <span className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                            {product.badge.replace('_', ' ')}
                          </span>
                        ) : (
                          <div />
                        )}
                        {!productInStock && (
                          <span className="px-4 py-1.5 bg-slate-200 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 relative z-10">
                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-red-600 transition-colors uppercase tracking-tighter leading-tight mb-3">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-auto pt-8 border-t border-slate-200/50 relative z-10">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price from</p>
                            <p className={`text-3xl font-black tracking-tighter ${productInStock ? 'text-slate-900' : 'text-slate-400'}`}>
                              ${(() => {
                                const visibleSpecs = product.specifications?.filter(spec => !spec.hidden) || [];
                                const inStockSpecs = visibleSpecs.filter(spec => spec.in_stock && (spec.stock_quantity > 0 || spec.stock_quantity === undefined));
                                return inStockSpecs.length > 0 
                                  ? Math.min(...inStockSpecs.map(spec => spec.price))
                                  : (visibleSpecs.length > 0 ? Math.min(...visibleSpecs.map(spec => spec.price)) : product.price_from);
                              })()}
                            </p>
                          </div>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                            productInStock ? 'bg-red-600 text-white group-hover:scale-110' : 'bg-slate-200 text-slate-400'
                          }`}>
                            <ArrowLeft className="w-5 h-5 rotate-180" />
                          </div>
                        </div>
                      </div>

                      {/* Decorative Background Icon */}
                      <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none -mr-12">
                        <Beaker className="w-48 h-48" />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {filteredProducts.length === 0 && (
              <div className="text-center py-40 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No research subjects found</p>
                <button 
                  onClick={() => {setSelectedCategory('all'); setSearchQuery('');}}
                  className="mt-4 text-red-600 font-black uppercase text-xs hover:underline"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Legal Disclaimer */}
        <div className="mt-20 p-8 bg-slate-50 rounded-[32px] border border-slate-200 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Legal Notice</p>
          <p className="text-xs text-slate-500 max-w-4xl mx-auto leading-relaxed font-medium">
            All products listed are strictly for LABORATORY AND SCIENTIFIC RESEARCH PURPOSES ONLY. Not for human consumption, 
            veterinary use, or any form of clinical application. Research subjects must be handled by qualified professionals 
            in controlled environments. Red Helix Research enforces strict compliance with all regulatory standards.
          </p>
        </div>
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
