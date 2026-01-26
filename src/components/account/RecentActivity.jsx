import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Search, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function RecentActivity({ preferences }) {
  const recentViews = preferences?.viewed_products?.slice(-10).reverse() || [];
  const recentSearches = preferences?.search_history?.slice(-8).reverse() || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Recently Viewed */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-red-600" />
          <h3 className="text-amber-50 font-bold text-lg">Recently Viewed</h3>
        </div>

        {recentViews.length === 0 ? (
          <div className="text-center py-8 bg-stone-800/20 rounded-lg border border-stone-700/50">
            <p className="text-stone-500 text-sm">No recently viewed peptides</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentViews.map((view, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  to={`${createPageUrl('PeptideLearn')}?id=${view.product_id}&name=${encodeURIComponent(view.product_name)}`}
                  className="block bg-stone-800/30 border border-stone-700 rounded-lg p-3 hover:border-red-600/50 hover:bg-stone-800/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-amber-50 font-semibold text-sm">{view.product_name}</p>
                    <p className="text-stone-500 text-xs">
                      {format(new Date(view.viewed_at), 'MMM d')}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Searches */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-red-600" />
          <h3 className="text-amber-50 font-bold text-lg">Recent Searches</h3>
        </div>

        {recentSearches.length === 0 ? (
          <div className="text-center py-8 bg-stone-800/20 rounded-lg border border-stone-700/50">
            <p className="text-stone-500 text-sm">No search history</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSearches.map((search, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-stone-800/30 border border-stone-700 rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-stone-300 text-sm">{search.query}</p>
                  <p className="text-stone-500 text-xs">
                    {format(new Date(search.searched_at), 'MMM d')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}