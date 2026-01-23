import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function AllProducts({ products }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <section id="products" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              All Products
            </span>
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Browse our complete catalog of research-grade peptides
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-2">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="bg-neutral-900/60 border border-neutral-800 p-1 flex-wrap">
              {categories.map((cat) => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-neutral-900 text-neutral-400 font-medium"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            No products found in this category.
          </div>
        )}
      </div>
    </section>
  );
}