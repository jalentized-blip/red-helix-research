import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
      import { Input } from '@/components/ui/input';
      import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Search, Beaker, Loader, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import ProductModal from '@/components/product/ProductModal';
import SEO from '@/components/SEO';
import ResearchDisclaimer from '@/components/ResearchDisclaimer';
import { generateOrganizationSchema } from '@/components/utils/schemaHelpers';

const AISearchAssistant = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = async (value) => {
    setQuery(value);
    if (value.length > 2) {
      setShowSuggestions(true);
      // Call the search
      await onSearch(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-stone-900 to-stone-800 border border-stone-700 rounded-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <MessageCircle className="w-6 h-6 text-red-600" />
        <h3 className="text-xl font-bold text-amber-50">AI Product Search</h3>
      </div>
      <p className="text-stone-400 text-sm mb-4">Ask me anything about our products - I'll help you find what you're looking for</p>
      
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => query.length > 2 && setShowSuggestions(true)}
              placeholder="Search products by name, category, or what you're looking for..."
              className="w-full pl-10 pr-4 py-3 bg-stone-800 border border-stone-600 rounded-lg text-amber-50 placeholder:text-stone-400 focus:outline-none focus:border-red-600 transition-colors"
            />
            {isLoading && (
              <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600 animate-spin" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const handleAISearch = async (query) => {
    setAiSearchLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `User is searching for: "${query}". 

        Available products with details: ${products.map(p => `${p.name} (${p.category}, $${p.price_from}): ${p.description}`).join(' | ')}
        
        Based on the user's search query, determine which product categories and product names match their intent. Consider their language, intent, and what problems they might be trying to solve.
        
        Return a JSON object with:
        - "matchedProducts": array of ALL product names that match or relate to the user's query
        - "category": the main category that matches (or "all" if multiple), use values like: weight_loss, recovery_healing, cognitive_focus, performance_longevity, sexual_health, general_health
        
        Example: {"matchedProducts": ["BPC-157", "TB-500"], "category": "recovery_healing"}
        
        Return ONLY valid JSON, no other text.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            matchedProducts: {
              type: "array",
              items: { type: "string" }
            },
            category: { type: "string" }
          }
        }
      });
      
      if (response && response.matchedProducts && response.matchedProducts.length > 0) {
        // Set category filter and clear search to show all products in that category
        if (response.category && response.category !== 'all') {
          setSelectedCategory(response.category);
        }
        setSearchQuery('');
      }
    } catch (error) {
      console.error('AI search error:', error);
    } finally {
      setAiSearchLoading(false);
    }
  };

  // Deduplicate products by name, keeping the most recent
  const uniqueProducts = useMemo(() => {
    const productMap = new Map();
    products.forEach(product => {
      if (!product.hidden && product.in_stock) {
        if (!productMap.has(product.name) || 
            new Date(product.updated_date) > new Date(productMap.get(product.name).updated_date)) {
          productMap.set(product.name, product);
        }
      }
    });
    return Array.from(productMap.values());
  }, [products]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let filtered = [...uniqueProducts];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (showInStockOnly) {
      filtered = filtered.filter(p => p.in_stock && !p.hidden);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [uniqueProducts, searchQuery, selectedCategory, showInStockOnly]);

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'recovery_healing', label: 'Recovery & Healing' },
    { value: 'cognitive_focus', label: 'Cognitive Focus' },
    { value: 'performance_longevity', label: 'Performance & Longevity' },
    { value: 'sexual_health', label: 'Sexual Health' },
    { value: 'general_health', label: 'General Health' }
  ];

  const categoryColors = {
    weight_loss: 'from-orange-600 to-red-600',
    recovery_healing: 'from-green-600 to-emerald-600',
    cognitive_focus: 'from-blue-600 to-indigo-600',
    performance_longevity: 'from-purple-600 to-pink-600',
    sexual_health: 'from-rose-600 to-red-600',
    general_health: 'from-amber-600 to-orange-600'
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO 
        title="Buy Research Peptides USA | Lab-Tested Products with COA"
        description="Premium research peptides USA with verified COA. High purity lab-tested semaglutide, tirzepatide, BPC-157, TB-500. Filter by category or use AI search."
        keywords="research peptides USA, buy research peptides, lab tested peptides, high purity peptides, semaglutide research, tirzepatide research"
        schema={generateOrganizationSchema()}
      />

      <div className="max-w-7xl mx-auto px-4">
        <ResearchDisclaimer />
        
        {/* Header */}
        <div className="mb-12">
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Beaker className="w-8 h-8 text-red-600" />
              <h1 className="text-5xl font-black text-amber-50">Research Peptides USA</h1>
            </div>
            <p className="text-stone-300 text-lg max-w-2xl">
              Lab-tested research peptides with verified COA. High purity compounds for research. Use AI search or filter by intended use.
            </p>
          </div>
        </div>

        {/* AI Search Assistant */}
        <AISearchAssistant onSearch={handleAISearch} isLoading={aiSearchLoading} />

        {/* Manual Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              type="text"
              placeholder="Quick search by product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-stone-900 border-stone-700 text-amber-50 placeholder:text-stone-400"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-red-600 text-amber-50'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* In Stock Filter */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="instock"
              checked={showInStockOnly}
              onCheckedChange={setShowInStockOnly}
              className="border-stone-600"
            />
            <label htmlFor="instock" className="text-stone-300 font-semibold cursor-pointer">
              In Stock Only
            </label>
          </div>
          </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Beaker className="w-16 h-16 text-stone-600 mx-auto mb-4" />
            <p className="text-stone-400 text-lg">No products found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <div
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsModalOpen(true);
                  }}
                  className={`bg-gradient-to-br ${categoryColors[product.category] || 'from-stone-700 to-stone-800'} rounded-lg p-6 h-full cursor-pointer overflow-hidden relative group hover:shadow-lg hover:shadow-red-600/20 transition-all`}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                  
                  <div className="relative z-10">
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-black/40 rounded-full text-xs font-semibold text-amber-50 mb-3">
                        {product.category?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-50 transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    <p className="text-white/90 text-sm leading-relaxed mb-6">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-amber-300">
                        From ${product.price_from}
                      </span>
                      {product.is_featured && (
                        <span className="text-xs font-bold text-amber-300 bg-amber-600/30 px-2 py-1 rounded">
                          FEATURED
                        </span>
                      )}
                    </div>

                    <Button className="w-full bg-red-700 hover:bg-red-600 text-amber-50">
                      View Details
                    </Button>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="mt-12 text-center text-stone-400">
          <p>Showing {filteredProducts.length} of {products.filter(p => !p.hidden && p.in_stock).length} products</p>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}