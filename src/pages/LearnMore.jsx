import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BookOpen, Beaker, Youtube, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const SourcesBubble = ({ productName }) => {
  // Hide research for GLOW and BAC RESEARCH
  if (productName.toUpperCase() === 'GLOW' || productName.toUpperCase() === 'BAC RESEARCH') {
    return null;
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => {
          const element = document.getElementById('peptide-learn');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        className="inline-flex items-center gap-2 px-3 py-2 bg-black/40 hover:bg-black/60 rounded-full transition-all"
      >
        <Beaker className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-semibold text-amber-50">View Research</span>
      </button>
    </div>
  );
};

export default function LearnMore() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const uniqueProducts = useMemo(() => {
    // Deduplicate by name, keeping the most recent version
    const productMap = new Map();
    products.forEach(product => {
      if (product.name.toUpperCase() === 'GLOW' || product.name.toUpperCase() === 'BAC RESEARCH') {
        return;
      }
      if (!productMap.has(product.name) || 
          new Date(product.updated_date) > new Date(productMap.get(product.name).updated_date)) {
        productMap.set(product.name, product);
      }
    });
    return Array.from(productMap.values());
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return uniqueProducts;
    }
    return uniqueProducts.filter(product => product.category === selectedCategory);
  }, [uniqueProducts, selectedCategory]);

  const categoryLabels = {
    weight_loss: 'Weight Loss',
    recovery_healing: 'Recovery & Healing',
    cognitive_focus: 'Cognitive Focus',
    performance_longevity: 'Performance & Longevity',
    sexual_health: 'Sexual Health',
    general_health: 'General Health'
  };

  const categoryColors = {
    weight_loss: 'from-orange-600 to-red-600',
    recovery_healing: 'from-green-600 to-emerald-600',
    cognitive_focus: 'from-blue-600 to-indigo-600',
    performance_longevity: 'from-purple-600 to-pink-600',
    sexual_health: 'from-rose-600 to-red-600',
    general_health: 'from-amber-600 to-orange-600'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-stone-400">Loading peptides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      {/* Disclaimer Modal */}
      <Dialog open={!disclaimerAccepted} onOpenChange={() => {}}>
        <DialogContent className="bg-stone-900 border border-stone-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-50 text-xl">Important Disclaimer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <DialogDescription className="text-stone-300 text-base leading-relaxed">
              The information on this page is for <span className="font-semibold">educational and research purposes only</span>. It is <span className="font-semibold">not medical advice</span> and should not be taken as a substitute for professional medical consultation.
            </DialogDescription>
            <p className="text-stone-400 text-sm">
              Always consult with a qualified healthcare provider before using any research chemicals or peptides.
            </p>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setDisclaimerAccepted(true)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-amber-50"
            >
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-6">
              ← Back to Shop
            </Button>
          </Link>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-8 h-8 text-red-600" />
              <h1 className="text-5xl font-black text-amber-50">Learn More</h1>
            </div>
            <p className="text-stone-300 text-lg max-w-2xl">
              Explore the science behind our peptides. Discover potential uses, clinical research, and key findings for each product.
            </p>
          </div>

          {/* Sort by Intended Use */}
          <div className="mb-8">
            <label className="block text-stone-400 text-sm font-semibold mb-2">Sort by Intended Use</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-64 bg-stone-900 border-stone-700 text-amber-50">
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent className="bg-stone-900 border-stone-700">
                <SelectItem value="all" className="text-amber-50">All Products</SelectItem>
                <SelectItem value="weight_loss" className="text-amber-50">Weight Loss</SelectItem>
                <SelectItem value="recovery_healing" className="text-amber-50">Recovery & Healing</SelectItem>
                <SelectItem value="cognitive_focus" className="text-amber-50">Cognitive Focus</SelectItem>
                <SelectItem value="performance_longevity" className="text-amber-50">Performance & Longevity</SelectItem>
                <SelectItem value="sexual_health" className="text-amber-50">Sexual Health</SelectItem>
                <SelectItem value="general_health" className="text-amber-50">General Health</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Peptide Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link to={`${createPageUrl('PeptideLearn')}?id=${product.id}&name=${encodeURIComponent(product.name)}`}>
                <div className={`bg-gradient-to-br ${categoryColors[product.category] || 'from-stone-700 to-stone-800'} rounded-lg p-6 h-full cursor-pointer overflow-hidden relative`}>
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-black/40 rounded-full text-xs font-semibold text-amber-50 mb-3">
                        {categoryLabels[product.category]}
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
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.dispatchEvent(new CustomEvent('openProductModal', { detail: product }));
                          setTimeout(() => {
                            window.location.href = createPageUrl('Home');
                          }, 100);
                        }}
                        className="flex-1 px-3 py-2 bg-barn-brown hover:bg-barn-brown/90 text-amber-50 text-xs font-semibold rounded-lg transition-colors"
                      >
                        View Product
                      </button>
                      <Link to={`${createPageUrl('PeptideLearn')}?id=${product.id}&name=${encodeURIComponent(product.name)}`} onClick={(e) => e.stopPropagation()}>
                        <button className="px-3 py-2 bg-black/40 hover:bg-black/60 text-amber-50 text-xs font-semibold rounded-lg transition-colors">
                          Research
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Beaker className="w-16 h-16 text-stone-600 mx-auto mb-4" />
            <p className="text-stone-400 text-lg">No peptides found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}