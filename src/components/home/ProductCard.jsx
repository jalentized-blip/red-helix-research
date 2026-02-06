import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Star, BarChart2, Award, Sparkles, Dumbbell, Lock } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const badgeConfig = {
  bestseller: { icon: Flame, label: "#1 Best Seller", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  trending: { icon: TrendingUp, label: "Trending", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  top_rated: { icon: Star, label: "Top Rated", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  popular: { icon: BarChart2, label: "Popular", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  classic: { icon: Award, label: "Classic", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  newcomer: { icon: Sparkles, label: "Newcomer", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  essential: { icon: Dumbbell, label: "Essential", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
};

const categoryLabels = {
  weight_loss: "Weight Loss",
  recovery_healing: "Muscle Growth & Recovery",
  cognitive_focus: "Cognitive Enhancement",
  performance_longevity: "Performance & Longevity",
  sexual_health: "Sexual Health",
  general_health: "General Health"
};

export default function ProductCard({ product, index = 0, onSelectStrength, isAuthenticated = true, isAdmin = false, onVisibilityToggle }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [localHidden, setLocalHidden] = React.useState(product.hidden);
  const badge = product.badge ? badgeConfig[product.badge] : null;

  React.useEffect(() => {
    setLocalHidden(product.hidden);
  }, [product.hidden]);

  const handleVisibilityToggle = async (checked) => {
    setIsUpdating(true);
    const newHiddenState = !checked;
    setLocalHidden(newHiddenState);
    
    if (onVisibilityToggle) {
      await onVisibilityToggle(product.id, newHiddenState);
    }
    
    setIsUpdating(false);
  };
  
  // Filter out hidden specifications and only show in-stock items
  const visibleSpecs = product.specifications?.filter(spec => !spec.hidden) || [];
  const inStockSpecs = visibleSpecs.filter(spec => spec.in_stock && (spec.stock_quantity > 0 || spec.stock_quantity === undefined));
  const lowestVisiblePrice = inStockSpecs.length > 0 
    ? Math.min(...inStockSpecs.map(spec => spec.price))
    : (visibleSpecs.length > 0 ? Math.min(...visibleSpecs.map(spec => spec.price)) : product.price_from);
  
  // Use Red Dirt vial for all products except bacteriostatic water
  const isBacWater = product.name?.toLowerCase().includes('bacteriostatic') || 
                     product.name?.toLowerCase().includes('bac water');
  const displayImage = isBacWater 
    ? product.image_url 
    : 'https://i.ibb.co/nNNG1FKC/redhelixresearchvial20.jpg';

  return (
    <>
      {/* Full-page blur overlay */}
      {isHovered && (
        <motion.div
          initial={{ backdropFilter: "blur(0px)", opacity: 0 }}
          animate={{ 
            backdropFilter: "blur(20px)", 
            opacity: 1 
          }}
          exit={{ backdropFilter: "blur(0px)", opacity: 0 }}
          transition={{ 
            backdropFilter: { duration: 1.5, ease: "easeInOut" },
            opacity: { duration: 0.3 }
          }}
          className="fixed inset-0 z-40 pointer-events-none bg-stone-950/20"
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        viewport={{ once: true }}
        whileHover={{ 
          scale: 1.05, 
          y: -8,
          zIndex: 50
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative z-50"
      >
      
      <Card className={`group relative bg-stone-900/60 border-stone-700 hover:border-red-700/40 transition-all duration-300 overflow-hidden h-full hover:shadow-2xl hover:shadow-red-900/20 ${
        isAdmin && localHidden ? 'opacity-60 border-red-500/30' : ''
      }`}>
        {/* Hover glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-red-700/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Admin Visibility Toggle */}
        {isAdmin && (
          <div className="absolute top-3 right-3 z-20" onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center gap-2 bg-stone-900/90 backdrop-blur-sm border rounded-lg px-3 py-2 transition-all ${
              isUpdating ? 'border-yellow-500/50 animate-pulse' : 
              localHidden ? 'border-red-500/50' : 'border-green-500/50'
            }`}>
              <Checkbox
                checked={!localHidden}
                onCheckedChange={handleVisibilityToggle}
                disabled={isUpdating}
                className="border-stone-500 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <span className={`text-xs font-medium transition-colors ${
                isUpdating ? 'text-yellow-400' :
                localHidden ? 'text-red-400' : 'text-green-400'
              }`}>
                {isUpdating ? 'Updating...' : localHidden ? 'Hidden' : 'Visible'}
              </span>
            </div>
          </div>
        )}
        
        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className={`${badge.color} border text-xs font-medium flex items-center gap-1`}>
              <badge.icon className="w-3 h-3" />
              {badge.label}
            </Badge>
          </div>
        )}

        <div className="p-5 relative">
          {/* Product Image */}
          <div className={`relative mb-4 aspect-square flex items-center justify-center bg-stone-800/50 rounded-xl overflow-hidden ${!isAuthenticated ? 'blur-sm' : ''}`}>
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-24 h-32 bg-gradient-to-b from-red-700/20 to-red-800/10 rounded-lg flex items-center justify-center border border-red-700/20">
                <div className="w-8 h-20 bg-gradient-to-b from-stone-700 to-stone-800 rounded-md border border-stone-600" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <h3 className={`text-lg font-bold text-amber-50 mb-2 group-hover:text-red-600 transition-colors ${!isAuthenticated ? 'blur-sm' : ''}`}>
            {product.name}
          </h3>
          
          <p className={`text-sm text-stone-300 mb-3 line-clamp-2 ${!isAuthenticated ? 'blur-sm' : ''}`}>
            {product.description}
          </p>

          <div className={`flex items-center justify-between mb-4 ${!isAuthenticated ? 'blur-sm' : ''}`}>
            <span className="text-xs text-red-600/80 font-medium">
              {categoryLabels[product.category]}
            </span>
            <span className="text-lg font-bold text-amber-50">
              From <span className="text-red-600">${lowestVisiblePrice}</span>
            </span>
          </div>

          <div className={`mb-3 p-2 bg-stone-800/50 border border-stone-700/50 rounded-lg ${!isAuthenticated ? 'blur-sm' : ''}`}>
            <p className="text-[10px] text-stone-400 leading-tight">
              *Pricing reflects complete kit configurations. Individual vials available exclusively for GLP-3-R and GLP-2-T products.
            </p>
          </div>

          {!isAuthenticated ? (
            <Link to={createPageUrl('Login') + '?returnUrl=' + encodeURIComponent(window.location.href)}>
              <Button 
                className="w-full bg-red-700 hover:bg-red-600 text-amber-50 font-semibold gap-2"
              >
                <Lock className="w-4 h-4" />
                Sign in to Access
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={() => onSelectStrength?.(product)}
              className="w-full bg-red-700 hover:bg-red-600 text-amber-50 font-semibold"
            >
              Select strength
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
    </>
  );
}