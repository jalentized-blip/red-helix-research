import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart, ShoppingCart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FavoritePeptides({ preferences, onRemoveFavorite }) {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const favoriteProducts = products.filter(p => 
    preferences?.favorite_products?.includes(p.id)
  );

  if (favoriteProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-16 h-16 text-stone-600 mx-auto mb-4" />
        <p className="text-stone-400 text-lg mb-2">No favorite peptides yet</p>
        <p className="text-stone-500 text-sm mb-6">Start exploring and save your favorites</p>
        <Link to={createPageUrl('Home')}>
          <Button className="bg-red-600 hover:bg-red-700">
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {favoriteProducts.map((product, idx) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="bg-stone-800/30 border border-stone-700 rounded-lg p-5 hover:border-red-600/50 transition-all group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-amber-50 font-bold text-lg mb-2 group-hover:text-red-600 transition-colors">
                {product.name}
              </h3>
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
            <button
              onClick={() => onRemoveFavorite(product.id)}
              className="p-2 rounded-lg hover:bg-stone-700/50 transition-colors"
            >
              <Heart className="w-5 h-5 text-red-600 fill-red-600" />
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <Link to={`${createPageUrl('PeptideLearn')}?id=${product.id}&name=${encodeURIComponent(product.name)}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full border-stone-600 text-stone-300 hover:text-amber-50">
                <ExternalLink className="w-3 h-3 mr-2" />
                Research
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