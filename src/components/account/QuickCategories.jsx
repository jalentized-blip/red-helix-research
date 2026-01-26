import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Heart, Brain, Zap, Activity, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const categoryConfig = {
  weight_loss: {
    icon: Flame,
    label: 'Weight Loss',
    color: 'from-orange-600 to-red-600',
    hoverColor: 'hover:border-orange-500'
  },
  recovery_healing: {
    icon: Heart,
    label: 'Recovery & Healing',
    color: 'from-green-600 to-emerald-600',
    hoverColor: 'hover:border-green-500'
  },
  cognitive_focus: {
    icon: Brain,
    label: 'Cognitive Focus',
    color: 'from-blue-600 to-indigo-600',
    hoverColor: 'hover:border-blue-500'
  },
  performance_longevity: {
    icon: Zap,
    label: 'Performance & Longevity',
    color: 'from-purple-600 to-pink-600',
    hoverColor: 'hover:border-purple-500'
  },
  sexual_health: {
    icon: Activity,
    label: 'Sexual Health',
    color: 'from-rose-600 to-red-600',
    hoverColor: 'hover:border-rose-500'
  },
  general_health: {
    icon: Sparkles,
    label: 'General Health',
    color: 'from-amber-600 to-orange-600',
    hoverColor: 'hover:border-amber-500'
  }
};

export default function QuickCategories({ preferences }) {
  const preferredCategories = preferences?.preferred_categories || [];
  
  // Show preferred categories first, then all others
  const sortedCategories = Object.keys(categoryConfig).sort((a, b) => {
    const aPreferred = preferredCategories.includes(a);
    const bPreferred = preferredCategories.includes(b);
    if (aPreferred && !bPreferred) return -1;
    if (!aPreferred && bPreferred) return 1;
    return 0;
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {sortedCategories.map((categoryKey, idx) => {
        const config = categoryConfig[categoryKey];
        const Icon = config.icon;
        const isPreferred = preferredCategories.includes(categoryKey);

        return (
          <motion.div
            key={categoryKey}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link to={`${createPageUrl('LearnMore')}?category=${categoryKey}`}>
              <div className={`relative bg-stone-800/30 border ${isPreferred ? 'border-red-600/50' : 'border-stone-700'} rounded-lg p-5 ${config.hoverColor} transition-all cursor-pointer group`}>
                {isPreferred && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                  </div>
                )}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-amber-50 font-semibold text-sm group-hover:text-red-600 transition-colors">
                  {config.label}
                </h3>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}