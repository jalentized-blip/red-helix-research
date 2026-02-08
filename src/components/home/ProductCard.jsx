import React, { useCallback, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Star, BarChart2, Award, Sparkles, Dumbbell, Lock, Microscope, ShieldCheck } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const badgeConfig = {
  bestseller: { icon: Flame, label: "#1 Best Seller", color: "bg-red-100 text-red-600 border-red-200" },
  trending: { icon: TrendingUp, label: "Trending", color: "bg-blue-100 text-blue-600 border-blue-200" },
  top_rated: { icon: Star, label: "Top Rated", color: "bg-yellow-100 text-yellow-600 border-yellow-200" },
  popular: { icon: BarChart2, label: "Popular", color: "bg-purple-100 text-purple-600 border-purple-200" },
  classic: { icon: Award, label: "Classic", color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  newcomer: { icon: Sparkles, label: "Newcomer", color: "bg-pink-100 text-pink-600 border-pink-200" },
  essential: { icon: Dumbbell, label: "Essential", color: "bg-orange-100 text-orange-600 border-orange-200" },
};

const categoryLabels = {
  weight_loss: "METABOLIC RESEARCH",
  recovery_healing: "REGENERATIVE STUDY",
  cognitive_focus: "NEUROLOGICAL ANALYSIS",
  performance_longevity: "CELLULAR OPTIMIZATION",
  sexual_health: "ENDOCRINE RESEARCH",
  general_health: "SYSTEMIC ANALYSIS"
};

const ProductCard = React.memo(({ product, index = 0, onSelectStrength, isAuthenticated = true, isAdmin = false, onVisibilityToggle }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [localHidden, setLocalHidden] = React.useState(product.hidden);
  
  const badge = useMemo(() => product.badge ? badgeConfig[product.badge] : null, [product.badge]);

  React.useEffect(() => {
    setLocalHidden(product.hidden);
  }, [product.hidden]);

  const handleVisibilityToggle = useCallback(async (checked) => {
    setIsUpdating(true);
    const newHiddenState = !checked;
    setLocalHidden(newHiddenState);
    
    if (onVisibilityToggle) {
      await onVisibilityToggle(product.id, newHiddenState);
    }
    
    setIsUpdating(false);
  }, [onVisibilityToggle, product.id]);
  
  const { lowestVisiblePrice, displayImage } = useMemo(() => {
    const visibleSpecs = product.specifications?.filter(spec => !spec.hidden) || [];
    const inStockSpecs = visibleSpecs.filter(spec => spec.in_stock && (spec.stock_quantity > 0 || spec.stock_quantity === undefined));
    const price = inStockSpecs.length > 0 
      ? Math.min(...inStockSpecs.map(spec => spec.price))
      : (visibleSpecs.length > 0 ? Math.min(...visibleSpecs.map(spec => spec.price)) : product.price_from);
    
    const image = 'https://i.ibb.co/nNNG1FKC/redhelixresearchvial20.jpg';
    
    return { lowestVisiblePrice: price, displayImage: image };
  }, [product.specifications, product.price_from, product.name, product.image_url]);

  const handleSelectStrength = useCallback((e) => {
    e?.stopPropagation();
    onSelectStrength?.(product);
  }, [onSelectStrength, product]);

  return (
    <>
      {isHovered && (
        <motion.div
          initial={{ backdropFilter: "blur(0px)", opacity: 0 }}
          animate={{ 
            backdropFilter: "blur(15px)", 
            opacity: 1 
          }}
          exit={{ backdropFilter: "blur(0px)", opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed inset-0 z-40 pointer-events-none bg-white/40 backdrop-blur-[2px]"
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.5 }}
        viewport={{ once: true }}
        whileHover={{ 
          scale: 1.02, 
          y: -10,
          zIndex: 50
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleSelectStrength}
        className="relative z-50 h-full cursor-pointer"
      >
      
      <Card className={`group relative bg-white border-slate-100 hover:border-red-600/30 transition-all duration-500 overflow-hidden h-full shadow-sm hover:shadow-xl rounded-[40px] flex flex-col ${
        isAdmin && localHidden ? 'opacity-60 grayscale' : ''
      }`}>
        {/* Animated Glow Overlay - Subtle Medical Pulse */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Admin Visibility Toggle */}
        {isAdmin && (
          <div className="absolute top-6 right-6 z-20" onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center gap-2 bg-white border rounded-2xl px-3 py-2 transition-all shadow-sm ${
              isUpdating ? 'border-yellow-500/50 animate-pulse' : 
              localHidden ? 'border-red-500/50' : 'border-green-500/50'
            }`}>
              <Checkbox
                checked={!localHidden}
                onCheckedChange={handleVisibilityToggle}
                disabled={isUpdating}
                className="border-slate-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${
                isUpdating ? 'text-yellow-600' :
                localHidden ? 'text-red-600' : 'text-green-600'
              }`}>
                {isUpdating ? 'Updating...' : localHidden ? 'Hidden' : 'Visible'}
              </span>
            </div>
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
          {badge && (
            <Badge className={`${badge.color} border text-[10px] font-black uppercase tracking-tighter px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm`}>
              <badge.icon className="w-3.5 h-3.5" />
              {badge.label}
            </Badge>
          )}
          <Badge className="bg-white border-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-tighter px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
            <Microscope className="w-3.5 h-3.5 text-red-600" />
            HPLC VERIFIED
          </Badge>
        </div>

        <div className="p-10 flex flex-col h-full">
          {/* Product Image Container */}
          <div className={`relative mb-10 aspect-square flex items-center justify-center bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 group-hover:border-red-100 transition-colors ${!isAuthenticated ? 'blur-md' : ''}`}>
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={product.name}
                className="w-4/5 h-4/5 object-contain transform group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-24 h-32 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                <div className="w-8 h-20 bg-slate-200 rounded-md border border-slate-300" />
              </div>
            )}
            
            {/* Scientific Scan Line Effect */}
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[1px] bg-red-600/10 shadow-[0_0_15px_rgba(239,68,68,0.3)] z-10"
            />
          </div>

          {/* Product Info */}
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black tracking-[0.2em] text-red-600 uppercase group-hover:text-white transition-colors">
                {categoryLabels[product.category]}
              </span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 group-hover:text-white transition-colors" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-white transition-colors">99%+ Purity</span>
              </div>
            </div>

            <h3 className={`text-3xl font-black text-slate-900 mb-4 tracking-tighter group-hover:text-white transition-colors leading-none ${!isAuthenticated ? 'blur-sm' : ''}`}>
              {product.name}
            </h3>
            
            <p className={`text-sm text-slate-500 mb-8 line-clamp-2 leading-relaxed font-medium group-hover:text-white transition-colors ${!isAuthenticated ? 'blur-sm' : ''}`}>
              {product.description}
            </p>
          </div>

          <div className={`flex items-end justify-between mb-8 ${!isAuthenticated ? 'blur-sm' : ''}`}>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">Acquisition Cost</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-white transition-colors">
                  ${lowestVisiblePrice}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">USD</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">Thermal Stability</span>
              <span className="text-[10px] font-black text-red-600 uppercase block tracking-widest group-hover:text-white transition-colors">-20°C Verified</span>
            </div>
          </div>

          <Button 
            onClick={handleSelectStrength}
            className={`w-full h-16 bg-red-600 hover:bg-red-700 border-2 border-red-600 hover:border-red-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all duration-300 group/btn shadow-lg hover:shadow-xl hover:shadow-red-600/20 ${!isAuthenticated ? 'blur-sm' : ''}`}
          >
            <span className="flex items-center gap-3">
              Initialize Order
              <Microscope className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
            </span>
          </Button>
          
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="w-1 h-1 rounded-full bg-red-600 group-hover:bg-white transition-colors" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Clinical Grade Logistics</span>
          </div>
        </div>
      </Card>
    </motion.div>
    </>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;