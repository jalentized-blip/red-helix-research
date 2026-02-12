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

  const favoriteProducts = products.filter(p => {
    if (!preferences?.favorite_products?.includes(p.id)) return false;
    if (p.is_deleted || p.hidden) return false;
    const visibleSpecs = p.specifications?.filter(spec => !spec.hidden) || [];
    return visibleSpecs.some(spec => spec.in_stock && (spec.stock_quantity > 0 || spec.stock_quantity === undefined));
  });

  if (favoriteProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-900 text-lg mb-2 font-bold uppercase tracking-tight">No favorite peptides yet</p>
        <p className="text-slate-500 text-sm mb-6 font-medium">Start exploring and save your favorites</p>
        <Link to={createPageUrl('Home')}>
          <Button className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-2xl font-black uppercase tracking-widest text-xs px-8 py-6 shadow-lg shadow-[#dc2626]/20">
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
          className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-[#dc2626]/30 hover:shadow-lg transition-all group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-slate-900 font-black text-lg mb-2 group-hover:text-[#dc2626] transition-colors uppercase tracking-tight">
                {product.name}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-4 font-medium">
                {product.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[#dc2626] font-black">From ${product.price_from}</span>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full">
                  {product.category?.replace('_', ' ')}
                </span>
              </div>
            </div>
            <button
              onClick={() => onRemoveFavorite(product.id)}
              className="p-2 rounded-xl hover:bg-red-50 transition-colors"
            >
              <Heart className="w-5 h-5 text-[#dc2626] fill-[#dc2626]" />
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            <Link to={`${createPageUrl('PeptideLearn')}?id=${product.id}&name=${encodeURIComponent(product.name)}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-600 hover:text-[#dc2626] hover:border-[#dc2626] rounded-xl font-bold uppercase tracking-widest text-[10px] py-5">
                <ExternalLink className="w-3 h-3 mr-2" />
                Research
              </Button>
            </Link>
            <Button
              size="sm"
              className="flex-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-widest text-[10px] py-5"
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