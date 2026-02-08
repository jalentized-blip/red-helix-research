import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RecommendedPeptides({ preferences, orders }) {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const recommendations = useMemo(() => {
    const viewedCategories = preferences?.preferred_categories || [];
    const viewedProductIds = preferences?.viewed_products?.map(v => v.product_id) || [];
    const favoriteIds = preferences?.favorite_products || [];
    const purchasedProductNames = orders?.flatMap(o => o.items?.map(i => i.productName) || []) || [];

    // Score products based on user behavior
    const scoredProducts = products
      .filter(p => !favoriteIds.includes(p.id)) // Exclude already favorited
      .map(product => {
        let score = 0;
        
        // Higher score for matching preferred categories
        if (viewedCategories.includes(product.category)) {
          score += 5;
        }
        
        // Medium score for viewed products in same category
        const viewedInCategory = products.filter(p => 
          viewedProductIds.includes(p.id) && p.category === product.category
        );
        score += viewedInCategory.length * 2;

        // Boost if similar to purchased products
        if (purchasedProductNames.some(name => 
          name && product.name && (
            name.toLowerCase().includes(product.name.toLowerCase()) ||
            product.name.toLowerCase().includes(name.toLowerCase())
          )
        )) {
          score += 3;
        }

        // Boost featured/bestsellers
        if (product.is_featured) score += 2;

        return { ...product, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    return scoredProducts;
  }, [products, preferences, orders]);

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-16">
        <Sparkles className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-500 text-lg font-medium">Explore products to get personalized recommendations</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {recommendations.map((product, idx) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-red-600/30 hover:shadow-lg transition-all group"
        >
          <div className="mb-3">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-slate-900 font-black text-lg uppercase tracking-tight group-hover:text-red-600 transition-colors">{product.name}</h3>
              {product.badge && (
                <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-black uppercase tracking-widest">
                  {product.badge.replace('_', ' ')}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm line-clamp-2 mb-4 font-medium">
              {product.description}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-black">From ${product.price_from}</span>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full">
                {product.category?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Link to={`${createPageUrl('PeptideLearn')}?id=${product.id}&name=${encodeURIComponent(product.name)}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-600 rounded-xl font-bold uppercase tracking-widest text-[10px] py-5">
                Learn More
              </Button>
            </Link>
            <Button
              size="sm"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] py-5"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('openProductModal', { detail: product }));
              }}
            >
              <ShoppingCart className="w-3 h-3 mr-2" />
              View
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}