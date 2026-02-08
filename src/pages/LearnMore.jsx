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
import SEO from '@/components/SEO';

const SourcesBubble = ({ productName }) => {
  // Hide research for GLOW only
  if (productName.toUpperCase() === 'GLOW') {
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
      // Only exclude GLOW, keep BAC RESEARCH
      if (product.name.toUpperCase() === 'GLOW') {
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
      <div className="min-h-screen bg-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Research Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO 
        title="Peptide Research Guide - Gray Market Research Chemicals & Clinical Studies"
        description="Comprehensive peptide research database for gray market research chemicals. Scientific studies on BPC-157, TB-500, semaglutide, tirzepatide, and performance peptides. Evidence-based information for peptide researchers and underground research community."
        keywords="peptide research, gray market peptide research, research chemical studies, peptide education, weight loss peptides research, BPC-157 research, TB-500 studies, semaglutide research, peptide science, peptide clinical trials, underground peptide research, research peptide community, peptide vendor research, alternative medicine peptides"
      />
      {/* Disclaimer Modal */}
      <Dialog open={!disclaimerAccepted} onOpenChange={() => {}}>
        <DialogContent className="bg-white border border-slate-200 max-w-md rounded-[32px] p-8">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-2xl font-black uppercase tracking-tight">Research <span className="text-red-600">Protocol</span></DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <DialogDescription className="text-slate-500 text-base leading-relaxed font-medium">
              The information on this page is for <span className="font-black text-slate-900 uppercase text-xs">educational and research purposes only</span>. It is <span className="font-black text-slate-900 uppercase text-xs">not medical advice</span> and should not be taken as a substitute for professional medical consultation.
            </DialogDescription>
            <p className="text-slate-400 text-xs font-bold">
              Always consult with a qualified healthcare provider before using any research chemicals or peptides.
            </p>
          </div>
          <div className="flex gap-3 mt-8">
            <Button
              onClick={() => setDisclaimerAccepted(true)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs h-14 rounded-2xl shadow-lg shadow-red-600/20"
            >
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-16">
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" className="border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-600 mb-8 rounded-xl font-black uppercase tracking-widest text-[10px]">
              ← Back to Shop
            </Button>
          </Link>
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-600/10 rounded-2xl">
                <BookOpen className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-6xl font-black text-slate-900 uppercase tracking-tighter">Learn <span className="text-red-600">More</span></h1>
            </div>
            <p className="text-slate-500 text-xl font-medium max-w-2xl leading-relaxed">
              Explore the science behind our research reagents. Discover clinical findings and laboratory data for each product.
            </p>
          </div>

          {/* Sort by Intended Use */}
          <div className="mb-12">
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 ml-1">Research Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-72 bg-slate-50 border-slate-100 text-slate-900 h-14 rounded-2xl font-black uppercase tracking-widest text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all" className="text-slate-900 font-bold">All Products</SelectItem>
                <SelectItem value="weight_loss" className="text-slate-900 font-bold">Weight Loss</SelectItem>
                <SelectItem value="recovery_healing" className="text-slate-900 font-bold">Recovery & Healing</SelectItem>
                <SelectItem value="cognitive_focus" className="text-slate-900 font-bold">Cognitive Focus</SelectItem>
                <SelectItem value="performance_longevity" className="text-slate-900 font-bold">Performance & Longevity</SelectItem>
                <SelectItem value="sexual_health" className="text-slate-900 font-bold">Sexual Health</SelectItem>
                <SelectItem value="general_health" className="text-slate-900 font-bold">General Health</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Peptide Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <div className="bg-white border border-slate-100 rounded-[32px] p-8 h-full cursor-pointer relative overflow-hidden shadow-sm hover:shadow-xl hover:border-red-600/20 transition-all duration-500">
                  {/* Category Accent */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${categoryColors[product.category] || 'from-slate-100 to-slate-200'} opacity-5 -translate-y-16 translate-x-16 rounded-full group-hover:scale-150 transition-transform duration-700`} />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-6">
                      <span className="inline-block px-3 py-1 bg-red-600/10 rounded-full text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">
                        {categoryLabels[product.category]}
                      </span>
                      <h3 className="text-3xl font-black text-slate-900 mb-3 uppercase tracking-tight group-hover:text-red-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-3">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pricing</span>
                        <span className="text-lg font-black text-slate-900">
                          From ${product.price_from}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            window.dispatchEvent(new CustomEvent('openProductModal', { detail: product }));
                            setTimeout(() => {
                              window.location.href = createPageUrl('Home');
                            }, 100);
                          }}
                          className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/10"
                        >
                          Initialize Order
                        </button>
                        <Link to={`${createPageUrl('PeptideLearn')}?id=${product.id}&name=${encodeURIComponent(product.name)}`} onClick={(e) => e.stopPropagation()} className="flex-1">
                          <button className="w-full px-4 py-3 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                            Research Data
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
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