import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from './ProductCard';

const categories = [
  { id: "all", label: "All" },
  { id: "weight_loss", label: "Weight Loss" },
  { id: "recovery_healing", label: "Recovery & Healing" },
  { id: "cognitive_focus", label: "Cognitive & Focus" },
  { id: "performance_longevity", label: "Performance" },
  { id: "sexual_health", label: "Sexual Health" },
  { id: "general_health", label: "General Health" },
];

export default function AllProducts({ products, onSelectStrength, isAuthenticated = true }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
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

  const displayedProducts = showAll ? sortedProducts : sortedProducts.slice(0, 9);

  return (
    <section id="products" className="py-20 px-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute bottom-20 left-20 text-red-600/20 text-5xl"
          animate={{ y: [-10, 10, -10], x: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        >
          <svg width="80" height="80" viewBox="0 0 100 100">
            <path d="M 50 10 Q 90 50 50 90 Q 10 50 50 10 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="8" fill="currentColor" />
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
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              All Products
            </span>
          </h2>
          <p className="text-stone-300 text-lg max-w-2xl mx-auto mb-6">
            Browse our complete catalog of research-grade peptides
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
              <Input
                type="text"
                placeholder="Search peptides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-stone-900 border-stone-700 text-amber-50 placeholder:text-stone-400 focus:border-red-700/50"
              />
            </div>
          </div>
        </motion.div>

        {/* Category Tabs */}
         <div className="flex justify-center mb-10 overflow-x-auto pb-2">
           <Tabs value={activeCategory} onValueChange={setActiveCategory}>
             <TabsList className="bg-stone-900/60 border border-stone-700 p-1 flex-wrap">
               {categories.map((cat) => (
                 <TabsTrigger 
                   key={cat.id} 
                   value={cat.id}
                   className="data-[state=active]:bg-red-700 data-[state=active]:text-amber-50 text-stone-300 font-medium"
                 >
                   {cat.label}
                 </TabsTrigger>
               ))}
             </TabsList>
           </Tabs>
         </div>

         {/* Sort Dropdown */}
         <div className="flex justify-end mb-6">
           <Select value={sortBy} onValueChange={setSortBy}>
             <SelectTrigger className="w-40 bg-stone-900 border-stone-700 text-amber-50">
               <SelectValue />
             </SelectTrigger>
             <SelectContent className="bg-stone-900 border-stone-700">
               <SelectItem value="featured" className="text-amber-50">Featured</SelectItem>
               <SelectItem value="price-low" className="text-amber-50">Price: Low to High</SelectItem>
               <SelectItem value="price-high" className="text-amber-50">Price: High to Low</SelectItem>
               <SelectItem value="name-asc" className="text-amber-50">Name: A-Z</SelectItem>
               <SelectItem value="name-desc" className="text-amber-50">Name: Z-A</SelectItem>
             </SelectContent>
           </Select>
         </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} onSelectStrength={onSelectStrength} isAuthenticated={isAuthenticated} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            No products found in this category.
          </div>
        )}

        {/* Show More/Hide Button */}
        {filteredProducts.length > 9 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 bg-red-700 hover:bg-red-600 text-amber-50 font-semibold rounded-lg transition-colors"
            >
              {showAll ? 'HIDE' : 'SHOW MORE..'}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}