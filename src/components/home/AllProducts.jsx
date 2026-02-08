import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from './ProductCard';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const categories = [
  { id: "all", label: "All" },
  { id: "weight_loss", label: "Weight Loss" },
  { id: "recovery_healing", label: "Recovery & Healing" },
  { id: "cognitive_focus", label: "Cognitive & Focus" },
  { id: "performance_longevity", label: "Performance" },
  { id: "sexual_health", label: "Sexual Health" },
  { id: "general_health", label: "General Health" },
];

const AllProducts = React.memo(({ products, onSelectStrength, isAuthenticated = true, isAdmin: isAdminProp }) => {
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAll, setShowAll] = useState(false);
    const [sortBy, setSortBy] = useState("featured");
    const [isAdmin, setIsAdmin] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
      if (isAdminProp !== undefined) {
        setIsAdmin(isAdminProp);
      } else {
        const checkAdmin = async () => {
          try {
            const user = await base44.auth.me();
            setIsAdmin(user?.role === 'admin');
          } catch (error) {
            setIsAdmin(false);
          }
        };
        checkAdmin();
      }
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

    const handleSearchChange = useCallback((e) => {
      setSearchQuery(e.target.value);
    }, []);

    const handleShowAllToggle = useCallback(() => {
      setShowAll(prev => !prev);
    }, []);

    // Memoize expensive filtering and sorting
    const { displayedProducts, hasMore } = useMemo(() => {
      // Deduplicate products by name
      const deduped = Array.from(
        new Map(
          products.map(product => [product.name, product])
        ).values()
      ).sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));

      const filtered = deduped.filter(product => {
        const matchesCategory = activeCategory === "all" || product.category === activeCategory;
        const matchesSearch = searchQuery === "" || 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const isBacResearch = product.name.toUpperCase() === 'BAC RESEARCH';
        
        // Stock logic: Check if any specification is in stock
        const visibleSpecs = product.specifications?.filter(spec => !spec.hidden) || [];
        const inStock = visibleSpecs.some(spec => spec.in_stock && (spec.stock_quantity > 0 || spec.stock_quantity === undefined));
        
        const isVisible = isAdmin || !product.hidden;
        
        // Admins see all products; regular users only see visible products that are in stock
        if (isAdmin) {
          return matchesCategory && matchesSearch && !isBacResearch;
        }
        return matchesCategory && matchesSearch && !isBacResearch && isVisible && inStock;
      });

      const sorted = [...filtered].sort((a, b) => {
        switch(sortBy) {
          case "price-low":
            return a.price_from - b.price_from;
          case "price-high":
            return b.price_from - a.price_from;
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "featured":
          default:
            return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        }
      });

      const displayed = showAll ? sorted : sorted.slice(0, 9);
      return { 
        displayedProducts: displayed, 
        hasMore: sorted.length > 9,
        totalFiltered: sorted.length 
      };
    }, [products, activeCategory, searchQuery, isAdmin, sortBy, showAll]);

  return (
    <section id="products" className="py-24 px-4 relative overflow-hidden bg-slate-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute bottom-20 left-20 text-red-600/5 text-8xl"
          animate={{ y: [-20, 20, -20], x: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        >
          <svg width="120" height="120" viewBox="0 0 100 100">
            <path d="M 50 10 Q 90 50 50 90 Q 10 50 50 10 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="10" fill="currentColor" />
          </svg>
        </motion.div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-full mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complete Inventory</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-6">
            RESEARCH <br />
            <span className="text-red-600">REPOSITORY</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto mb-10">
            A comprehensive catalog of clinical-grade peptides, systematically archived and ready for analytical deployment.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative group">
            <div className="absolute inset-0 bg-red-600/5 blur-2xl group-hover:bg-red-600/10 transition-colors" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search research catalog..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="h-14 pl-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-red-600/50 rounded-2xl shadow-sm transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          {/* Category Tabs */}
          <div className="w-full md:w-auto overflow-x-auto pb-2 scrollbar-hide">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl h-14 shadow-sm">
                {categories.map((cat) => (
                  <TabsTrigger 
                    key={cat.id} 
                    value={cat.id}
                    className="h-11 px-6 data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-64 h-14 bg-white border-slate-200 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-sm focus:ring-red-600/20 group">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 group-hover:text-red-600 transition-colors">Sort:</span>
                <SelectValue placeholder="Featured Priority" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 rounded-2xl shadow-2xl p-2">
              <SelectItem value="featured" className="font-black uppercase tracking-widest text-[10px] text-slate-900 focus:bg-red-50 focus:text-red-600 rounded-xl py-3 cursor-pointer transition-colors">Featured Priority</SelectItem>
              <SelectItem value="price-low" className="font-black uppercase tracking-widest text-[10px] text-slate-900 focus:bg-red-50 focus:text-red-600 rounded-xl py-3 cursor-pointer transition-colors">Value: Low to High</SelectItem>
              <SelectItem value="price-high" className="font-black uppercase tracking-widest text-[10px] text-slate-900 focus:bg-red-50 focus:text-red-600 rounded-xl py-3 cursor-pointer transition-colors">Value: High to Low</SelectItem>
              <SelectItem value="name-asc" className="font-black uppercase tracking-widest text-[10px] text-slate-900 focus:bg-red-50 focus:text-red-600 rounded-xl py-3 cursor-pointer transition-colors">Nomenclature: A-Z</SelectItem>
              <SelectItem value="name-desc" className="font-black uppercase tracking-widest text-[10px] text-slate-900 focus:bg-red-50 focus:text-red-600 rounded-xl py-3 cursor-pointer transition-colors">Nomenclature: Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayedProducts.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              index={index} 
              onSelectStrength={onSelectStrength} 
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              onVisibilityToggle={handleVisibilityToggle}
            />
          ))}
        </div>

        {displayedProducts.length === 0 && (
          <div className="text-center py-20 bg-white border border-slate-100 rounded-[40px] shadow-sm">
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No research specimens found matching your criteria.</p>
          </div>
        )}

        {/* Action Bar */}
        <div className="mt-20 flex flex-col items-center gap-6">
          {hasMore && (
            <button
              onClick={handleShowAllToggle}
              className="group relative px-12 py-5 bg-white border-2 border-slate-200 hover:border-red-600 text-slate-900 font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-red-600/10"
            >
              <span className="relative z-10">
                {showAll ? 'Collapse Catalog' : 'Expand Full Repository'}
              </span>
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Inventory Status: Verified</span>
          </div>
        </div>
      </div>
    </section>
  );
});

AllProducts.displayName = 'AllProducts';

export default AllProducts;