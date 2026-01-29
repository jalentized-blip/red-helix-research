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
        <Sparkles className="w-16 h-16 text-stone-600 mx-auto mb-4" />
        <p className="text-stone-400 text-lg">Explore products to get personalized recommendations</p>
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
          className="bg-gradient-to-br from-stone-800/40 to-stone-900/60 border border-stone-700 rounded-lg p-5 hover:border-red-600/50 transition-all"
        >
          <div className="mb-3">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-amber-50 font-bold text-lg">{product.name}</h3>
              {product.badge && (
                <span className="text-xs px-2 py-1 bg-red-600/20 text-red-400 rounded-full font-semibold capitalize">
                  {product.badge.replace('_', ' ')}
                </span>
              )}
            </div>
            <p className="text-stone-400 text-sm line-clamp-2 mb-3">
              {product.description}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-bold">From ${product.price_from}</span>
              <span className="text-stone-500 text-xs px-2 py-1 bg-stone-900/50 rounded-full capitalize">
                {product.category?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link to={`${createPageUrl('PeptideLearn')}?id=${product.id}&name=${encodeURIComponent(product.name)}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full border-stone-600 text-stone-300 hover:text-amber-50">
                Learn More
              </Button>
            </Link>
            <Button
              size="sm"
              className="flex-1 bg-red-600 hover:bg-red-700"
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