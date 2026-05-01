import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Filter, Search, X, Package, ShieldCheck, Beaker } from 'lucide-react';
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

  // Extract all 10 vial kit options from all products (excluding BPC-157)
  const allKitOptions = [];
  products.forEach(product => {
    const isBPC157 = product.name?.toLowerCase().includes('bpc');
    const kitSpecs = product.specifications?.filter(spec => 
      spec.name?.toLowerCase().includes('10 vial') && !spec.hidden && !isBPC157
    ) || [];
    kitSpecs.forEach(spec => {
      allKitOptions.push({
        ...spec,
        productName: product.name,
        productId: product.id,
        category: product.category
      });
    });
  });

  // Create synthetic Kits product if any kit options exist
  const kitsProduct = allKitOptions.length > 0 ? {
    id: 'kits-product',
    name: 'Kits',
    description: '10-vial research kits across our complete peptide catalog',
    category: 'all',
    specifications: allKitOptions,
    price_from: Math.min(...allKitOptions.map(k => k.price)),
    is_featured: true,
    badge: 'bestseller',
    hidden: false,
    isKitsProduct: true
  } : null;

  // Filter out kit specs from individual products (show single vials only)
  const productsWithSingleVials = products.map(product => ({
    ...product,
    specifications: product.specifications?.filter(spec => 
      !spec.name?.toLowerCase().includes('10 vial')
    ) || []
  })).filter(product => {
    // Remove products that only had kit specs
    const visibleSpecs = product.specifications?.filter(spec => !spec.hidden) || [];
    return visibleSpecs.length > 0;
  });

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
      kitsProduct.description.toLowerCase().includes(searchQuery.toLowerCase());
    const hasInStockKits = kitsProduct.specifications.some(spec => 
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
        title="Cheap Research Peptides — GLP-1, Semaglutide, Tirzepatide, BPC-157 | Best Price USA"
        description="Best prices on research peptides. Cheap GLP-1 peptides — Semaglutide, Tirzepatide from $89.99. BPC-157, TB-500 & 25+ more. HPLC-verified, COA certified. USA-based supplier."
        keywords="cheap research peptides, affordable GLP-1 peptide, cheap semaglutide research, cheap tirzepatide research, discount research peptides USA, best price peptides, buy GLP-1 research peptide, low cost research peptides, where to buy cheap peptides, peptide supplier USA, BPC-157 for sale cheap, TB-500 affordable, COA verified peptides, HPLC tested peptides, research chemicals USA, best peptide vendor, cheap ozempic research, cheap mounjaro research, retatrutide research peptide"
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
              <h1 className="text-5xl md:text-7xl font-black text-black mb-2 uppercase tracking-tighter leading-none">
                Research <span className="text-[#8B2635]">Catalog</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-2xl">
                Premium laboratory reagents with verified third-party analysis.
              </p>
            </motion.div>
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-full border border-slate-200">
            <ShieldCheck className="w-5 h-5 text-[#8B2635]" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">
              Verified Purity Standards
            </span>
          </div>
        </div>

        <div>
          <div>
            {/* Search and Filters Section */}
            <div className="grid lg:grid-cols-12 gap-8 mb-16">
              <div className="lg:col-span-8 space-y-6">
                {/* Search Bar */}
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#8B2635] transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search research database..."
                    className="w-full pl-16 pr-12 py-6 bg-slate-50 border-2 border-slate-100 rounded-[32px] text-black placeholder:text-slate-400 focus:outline-none focus:border-[#8B2635]/30 focus:bg-white transition-all shadow-sm group-hover:shadow-md"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#8B2635] transition-colors"
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
                            ? 'bg-[#8B2635] border-[#8B2635] text-white shadow-lg shadow-[#8B2635]/20'
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
                <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 text-black h-full flex flex-col justify-between shadow-xl shadow-slate-200/50">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-4">Inventory Filters</h3>
                    <button
                      onClick={() => setHideOutOfStock(!hideOutOfStock)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#8B2635]/30 transition-all group"
                    >
                      <span className="text-sm font-bold text-slate-500 group-hover:text-[#8B2635]">Hide Unavailable Stock</span>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${hideOutOfStock ? 'bg-[#8B2635]' : 'bg-slate-200'}`}>
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
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#8B2635]"></div>
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
                      className="mt-4 text-[#8B2635] font-black uppercase text-xs hover:underline"
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
        <div className="mt-20 p-8 bg-slate-50 rounded-[32px] border border-[#8B2635]/20 text-center">
          <p className="text-[10px] font-black text-[#8B2635] uppercase tracking-[0.2em] mb-4">⚠ Mandatory Legal Disclaimer</p>
          <p className="text-xs text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium">
            All products listed are exclusively for <strong>IN-VITRO LABORATORY AND SCIENTIFIC RESEARCH PURPOSES ONLY</strong>. 
            Not for human consumption. Not for veterinary use. Not for any clinical, therapeutic, or diagnostic application. 
            Not evaluated or approved by the FDA or any regulatory authority for human or animal use. 
            Not intended to diagnose, treat, cure, or prevent any disease or condition.
            These compounds must only be handled by qualified researchers in approved laboratory settings in full compliance with applicable federal, state, and local laws and regulations. 
            Purchase and possession may be regulated in your jurisdiction — it is the buyer's sole responsibility to verify legality before ordering.
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