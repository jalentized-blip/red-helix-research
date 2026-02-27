import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Filter, Search, X, Package, ShieldCheck, Beaker, Lock, LogIn } from 'lucide-react';
import ProductModal from '@/components/product/ProductModal';
import ProductCard from '@/components/home/ProductCard';
import SEO from '@/components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import {
  generateCollectionPageSchema,
  generateBreadcrumbSchema,
  generateItemListSchema
} from '@/components/utils/advancedSchemaHelpers';

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
  const [hideOutOfStock, setHideOutOfStock] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated).catch(() => setIsAuthenticated(false));
  }, []);

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

  // Filter out kit specs from individual products (show single vials only), exclude the real Kits product
  const productsWithSingleVials = products
    .filter(product => product.name !== 'Kits')
    .map(product => ({
      ...product,
      specifications: product.specifications?.filter(spec => 
        !spec.name?.toLowerCase().includes('10 vial')
      ) || []
    })).filter(product => {
      // Remove products that only had kit specs
      const visibleSpecs = product.specifications?.filter(spec => !spec.hidden) || [];
      return visibleSpecs.length > 0;
    });

  // The real Kits product from the database
  const kitsProduct = products.find(p => p.name === 'Kits') || null;

  let filteredProducts = productsWithSingleVials.filter(p => {
    if (p.is_deleted || p.hidden) return false;

    const categoryMatch = selectedCategory === 'all' || p.category === selectedCategory;

    // Check if any visible specification is in stock
    const visibleSpecs = p.specifications?.filter(spec => !spec.hidden) || [];
    const inStock = visibleSpecs.some(spec => spec.in_stock && (spec.stock_quantity > 0 || spec.stock_quantity === undefined));
    const stockMatch = hideOutOfStock ? inStock : true;

    const searchMatch = searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return categoryMatch && stockMatch && searchMatch;
  });

  // Add kits product to filtered results if it matches criteria
  if (kitsProduct) {
    const matchesCategory = selectedCategory === 'all';
    const matchesSearch = searchQuery === '' || 
      'kits'.includes(searchQuery.toLowerCase()) ||
      kitsProduct.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const hasInStockKits = kitsProduct.specifications?.some(spec => 
      spec.in_stock && (spec.stock_quantity > 0 || spec.stock_quantity === undefined)
    );
    const stockMatch = hideOutOfStock ? hasInStockKits : true;
    
    if (matchesCategory && matchesSearch && stockMatch) {
      filteredProducts = [kitsProduct, ...filteredProducts];
    }
  }

  const handleSelectStrength = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO
        title="Buy Research Peptides Online — 29+ HPLC-Verified Compounds | USA Supplier"
        description="Buy research peptides from $29.99. BPC-157, TB-500, semaglutide, tirzepatide, CJC-1295, ipamorelin & 23+ more. HPLC-verified >98% purity with third-party COA. USA-based."
        keywords="buy research peptides, buy peptides online, research peptide catalog, BPC-157 for sale, TB-500 for sale, semaglutide peptide buy, tirzepatide for sale, buy CJC-1295, ipamorelin for sale, peptide supplier USA, COA verified peptides, lab-tested peptides, research chemicals, peptide shop, where to buy peptides, best peptide vendor, research peptide store, high purity peptides"
        canonical="https://redhelixresearch.com/Products"
        schema={[
          generateCollectionPageSchema(
            'Research Peptides Catalog',
            'Complete catalog of HPLC-verified research peptides with third-party COA verification',
            '/Products'
          ),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Products', url: '/Products' }
          ]),
          generateItemListSchema(products)
        ]}
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
                Research <span className="text-[#dc2626]">Catalog</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-2xl">
                Premium laboratory reagents with verified third-party analysis.
              </p>
            </motion.div>
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-full border border-slate-200">
            <ShieldCheck className="w-5 h-5 text-[#dc2626]" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">
              Verified Purity Standards
            </span>
          </div>
        </div>

        {/* Auth Gate — grey out entire catalog if not logged in */}
        {!isAuthenticated && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="relative rounded-[32px] border-2 border-slate-200 bg-gradient-to-b from-slate-50 to-white p-12 md:p-16 text-center shadow-xl shadow-slate-200/50">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight mb-4">
                Account <span className="text-[#dc2626]">Required</span>
              </h2>
              <p className="text-slate-500 font-medium max-w-lg mx-auto mb-8 leading-relaxed">
                Sign in or create a free account to browse our full research catalog, view pricing, and place orders.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to={createPageUrl('Login')}>
                  <Button className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black py-6 px-10 rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-[#dc2626]/20 transition-all hover:scale-[1.02] active:scale-95">
                    <LogIn className="w-5 h-5 mr-3" />
                    Sign In
                  </Button>
                </Link>
                <Link to={createPageUrl('Login')}>
                  <Button variant="outline" className="border-2 border-slate-200 text-slate-600 font-black py-6 px-10 rounded-2xl text-sm uppercase tracking-widest hover:border-slate-300 hover:bg-slate-50 transition-all">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Catalog content — greyed out when not authenticated */}
        <div className={`${!isAuthenticated && !isLoading ? 'pointer-events-none select-none' : ''}`}>
          <div className={`${!isAuthenticated && !isLoading ? 'opacity-20 grayscale blur-[2px]' : ''} transition-all duration-500`}>
            {/* Search and Filters Section */}
            <div className="grid lg:grid-cols-12 gap-8 mb-16">
              <div className="lg:col-span-8 space-y-6">
                {/* Search Bar */}
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#dc2626] transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search research database..."
                    className="w-full pl-16 pr-12 py-6 bg-slate-50 border-2 border-slate-100 rounded-[32px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#dc2626]/30 focus:bg-white transition-all shadow-sm group-hover:shadow-md"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#dc2626] transition-colors"
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
                            ? 'bg-[#dc2626] border-[#dc2626] text-white shadow-lg shadow-[#dc2626]/20'
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
                <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 text-slate-900 h-full flex flex-col justify-between shadow-xl shadow-slate-200/50">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-4">Inventory Filters</h3>
                    <button
                      onClick={() => setHideOutOfStock(!hideOutOfStock)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#dc2626]/30 transition-all group"
                    >
                      <span className="text-sm font-bold text-slate-500 group-hover:text-[#dc2626]">Hide Unavailable Stock</span>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${hideOutOfStock ? 'bg-[#dc2626]' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${hideOutOfStock ? 'left-6' : 'left-1'}`} />
                      </div>
                    </button>
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-200">
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
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#dc2626]"></div>
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
                    {filteredProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                        onSelectStrength={handleSelectStrength}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-40 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                    <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No research subjects found</p>
                    <button
                      onClick={() => {setSelectedCategory('all'); setSearchQuery('');}}
                      className="mt-4 text-[#dc2626] font-black uppercase text-xs hover:underline"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

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
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}