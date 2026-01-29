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
      <div className="min-h-screen bg-stone-950 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl text-amber-50">Category not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title={config.title}
        description={config.description}
        keywords={config.keywords}
        schema={generateOrganizationSchema()}
      />

      <div className="max-w-6xl mx-auto px-4">
        {/* Navigation */}
        <Link to={createPageUrl('Products')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-8">
            ← Back to All Products
          </Button>
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">{config.h1}</h1>
          <p className="text-xl text-stone-300 max-w-2xl">{config.description}</p>
        </motion.div>

        {/* Research Disclaimer */}
        <ResearchDisclaimer />

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryProducts.length > 0 ? (
            categoryProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                onClick={() => {
                  setSelectedProduct(product);
                  setIsModalOpen(true);
                }}
                className="bg-stone-900/60 border border-stone-700 rounded-lg p-6 hover:border-red-600/50 cursor-pointer transition-all group"
              >
                <div className="aspect-square bg-stone-800 rounded-lg overflow-hidden mb-4">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={`${product.name} - research peptide`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                </div>
                <h3 className="text-xl font-bold text-amber-50 mb-2">{product.name}</h3>
                <p className="text-stone-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-semibold">From ${product.price_from}</span>
                  <Button className="bg-red-600 hover:bg-red-700">View Details</Button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-stone-400 text-lg">No products available in this category.</p>
            </div>
          )}
        </div>

        {/* Product Modal */}
        <ProductModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  );
}