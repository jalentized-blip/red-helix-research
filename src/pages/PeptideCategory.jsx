import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import ResearchDisclaimer from '@/components/ResearchDisclaimer';
import ProductModal from '@/components/product/ProductModal';
import ProductCard from '@/components/home/ProductCard';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { generateOrganizationSchema } from '@/components/utils/schemaHelpers';

const categoryConfig = {
  weight_loss: {
    title: 'Weight Loss Research Peptides',
    description: 'High purity research peptides for weight loss studies. Lab-tested semaglutide, tirzepatide, and other compounds with verified COA.',
    keywords: 'weight loss peptides, research peptides for weight loss, semaglutide research, tirzepatide research, high purity peptides',
    h1: 'Weight Loss Research Peptides',
  },
  recovery_healing: {
    title: 'Recovery & Healing Peptides',
    description: 'Premium research peptides for recovery and healing research. BPC-157, TB-500, and more with lab verification.',
    keywords: 'recovery peptides, healing peptides, BPC-157 research, TB-500 research, peptide recovery compounds',
    h1: 'Recovery & Healing Research Peptides',
  },
  cognitive_focus: {
    title: 'Cognitive & Focus Research Peptides',
    description: 'Research-grade peptides for cognitive enhancement studies. Lab-tested compounds with transparent COA.',
    keywords: 'cognitive peptides, focus peptides, brain peptides, nootropic research peptides',
    h1: 'Cognitive & Focus Research Peptides',
  },
  performance_longevity: {
    title: 'Performance & Longevity Peptides',
    description: 'Premium research peptides for performance and longevity studies. High purity lab-tested compounds.',
    keywords: 'performance peptides, longevity peptides, anti-aging research peptides, performance enhancement compounds',
    h1: 'Performance & Longevity Research Peptides',
  },
  sexual_health: {
    title: 'Sexual Health Research Peptides',
    description: 'Research-grade peptides for sexual health studies. Lab-verified compounds with COA documentation.',
    keywords: 'sexual health peptides, male health research peptides, sexual performance research compounds',
    h1: 'Sexual Health Research Peptides',
  },
  general_health: {
    title: 'General Health Research Peptides',
    description: 'Diverse research peptides for general health studies. All compounds lab-tested and verified.',
    keywords: 'general health peptides, research peptides, health compounds, lab tested peptides',
    h1: 'General Health Research Peptides',
  },
};

export default function PeptideCategory() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'weight_loss';
  const config = categoryConfig[category];
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['products', category],
    queryFn: () => base44.entities.Product.list(),
  });

  const categoryProducts = useMemo(() => {
    return products.filter(p => p.category === category && !p.hidden);
  }, [products, category]);

  if (!config) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl text-slate-900 font-black uppercase tracking-tight">Category not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO
        title={config.title}
        description={config.description}
        keywords={config.keywords}
        schema={generateOrganizationSchema()}
      />

      <div className="max-w-7xl mx-auto px-4">
        {/* Navigation */}
        <Link to={createPageUrl('Products')}>
          <Button variant="ghost" className="mb-8 hover:bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-xs">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalog
          </Button>
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-4 uppercase tracking-tighter leading-none">
            {config.h1.split(' ').map((word, i) => i === 0 ? <span key={i}>{word} </span> : <span key={i} className="text-[#dc2626]">{word} </span>)}
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl">{config.description}</p>
        </motion.div>

        {/* Research Disclaimer */}
        <div className="mb-16">
          <ResearchDisclaimer />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categoryProducts.length > 0 ? (
            categoryProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                onSelectStrength={(p) => {
                  setSelectedProduct(p);
                  setIsModalOpen(true);
                }}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-40 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No research subjects found in this category</p>
            </div>
          )}
        </div>

        {/* Product Modal */}
        <ProductModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  );
}