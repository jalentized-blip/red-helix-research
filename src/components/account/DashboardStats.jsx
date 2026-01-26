import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingBag, TrendingUp } from 'lucide-react';

export default function DashboardStats({ preferences, orders }) {
  const stats = [
    {
      icon: Heart,
      label: 'Favorites',
      value: preferences?.favorite_products?.length || 0,
      color: 'text-red-600',
      bgColor: 'bg-red-600/10'
    },
    {
      icon: Eye,
      label: 'Recently Viewed',
      value: preferences?.viewed_products?.length || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10'
    },
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: orders?.length || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10'
    },
    {
      icon: TrendingUp,
      label: 'Categories Explored',
      value: preferences?.preferred_categories?.length || 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-stone-900/50 border border-stone-700 rounded-lg p-5 hover:border-red-600/30 transition-all"
        >
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.bgColor} mb-3`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <p className="text-3xl font-black text-amber-50 mb-1">{stat.value}</p>
          <p className="text-stone-400 text-xs uppercase tracking-wide">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}