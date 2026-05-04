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
import { isSpecInStock } from '@/components/utils/cart';

const badgeConfig = {
  bestseller: { icon: Flame, label: "#1 Best Seller", color: "bg-[#8B2635] text-white border-[#8B2635]" },
  trending: { icon: TrendingUp, label: "Trending", color: "bg-blue-600 text-white border-blue-600" },
  top_rated: { icon: Star, label: "Top Rated", color: "bg-yellow-500 text-white border-yellow-500" },
  popular: { icon: BarChart2, label: "Popular", color: "bg-purple-600 text-white border-purple-600" },
  classic: { icon: Award, label: "Classic", color: "bg-emerald-600 text-white border-emerald-600" },
  newcomer: { icon: Sparkles, label: "Newcomer", color: "bg-pink-600 text-white border-pink-600" },
  essential: { icon: Dumbbell, label: "Essential", color: "bg-orange-600 text-white border-orange-600" },
};

const categoryLabels = {
  weight_loss: "Weight Loss",
  recovery_healing: "Recovery & Healing",
  cognitive_focus: "Cognitive & Focus",
  performance_longevity: "Performance",
  sexual_health: "Sexual Health",
  general_health: "General Health"
};

const ProductCard = React.memo(({ product, index = 0, onSelectStrength, isAuthenticated = true, isAdmin = false, onVisibilityToggle }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [localHidden, setLocalHidden] = React.useState(product.hidden);
  const isKitsProduct = product.isKitsProduct === true;
  
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
    const inStockSpecs = visibleSpecs.filter(spec => isSpecInStock(spec));
    const specsToPrice = inStockSpecs.length > 0 ? inStockSpecs : visibleSpecs;
    const price = specsToPrice.length > 0
      ? Math.min(...specsToPrice.map(spec => spec.price))
      : product.price_from;
    
    const image = product.image_url || 'https://i.ibb.co/kVLqM7Ff/redhelixxx-1.png';
    
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
      
      <Card className={`group relative bg-white border-slate-100 hover:border-[#8B2635]/30 transition-all duration-500 overflow-hidden h-full shadow-sm hover:shadow-xl rounded-3xl md:rounded-[40px] flex flex-col ${
        isAdmin && localHidden ? 'opacity-60 grayscale' : ''
      }`}>
        {/* Animated Glow Overlay - Subtle Medical Pulse */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#dc2626]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Admin Visibility Toggle */}
        {isAdmin && (
          <div className="absolute top-6 right-6 z-20" onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center gap-2 bg-white border rounded-2xl px-3 py-2 transition-all shadow-sm ${
              isUpdating ? 'border-yellow-500/50 animate-pulse' : 
              localHidden ? 'border-[#ef4444]/50' : 'border-green-500/50'
            }`}>
              <Checkbox
                checked={!localHidden}
                onCheckedChange={handleVisibilityToggle}
                disabled={isUpdating}
                className="border-slate-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${
                isUpdating ? 'text-yellow-600' :
                localHidden ? 'text-[#8B2635]' : 'text-green-600'
              }`}>
                {isUpdating ? 'Updating...' : localHidden ? 'Hidden' : 'Visible'}
              </span>
            </div>
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 md:top-6 md:left-6 z-10 flex flex-col gap-1.5">
          {badge && (
            <Badge className={`${badge.color} border text-[9px] md:text-[10px] font-black uppercase tracking-tighter px-2 md:px-4 py-1 md:py-1.5 rounded-full flex items-center gap-1.5 shadow-sm`}>
              <badge.icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span className="hidden sm:inline">{badge.label}</span>
              <span className="sm:hidden">{badge.label.split(' ')[0]}</span>
            </Badge>
          )}
          <Badge className="bg-[#8B2635] border-red-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-tighter px-2 md:px-4 py-1 md:py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span className="hidden sm:inline">RESEARCH ONLY</span>
            <span className="sm:hidden">RUO</span>
          </Badge>
        </div>

        <div className="p-4 md:p-10 flex flex-col h-full">
          {/* Product Image Container */}
          <div className="relative mb-4 md:mb-10 aspect-square flex items-center justify-center bg-slate-50 rounded-2xl md:rounded-[32px] overflow-hidden border border-slate-100 group-hover:border-[#8B2635]/20 transition-colors">
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={product.name}
                className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl"
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
              className="absolute left-0 right-0 h-[1px] bg-[#8B2635]/10 shadow-[0_0_15px_rgba(220,38,38,0.3)] z-10"
            />
          </div>

          {/* Product Info */}
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black tracking-[0.2em] text-[#8B2635] uppercase transition-colors">
                {categoryLabels[product.category]}
              </span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 transition-colors" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter transition-colors">99%+ Purity</span>
              </div>
            </div>

            <h3 className="text-lg md:text-3xl font-black text-black mb-3 tracking-tighter group-hover:text-[#8B2635] transition-colors leading-none">
              {product.name}
            </h3>
            
            <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed font-medium">
              {product.description}
            </p>

            {isKitsProduct && (
              <div className="mb-4">
                <span className="text-[10px] font-black text-[#8B2635] uppercase tracking-widest block mb-2">
                  {product.specifications?.length || 0} Kit Options Available
                </span>
              </div>
            )}
          </div>

          <div className="flex items-end justify-between mb-3 md:mb-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 transition-colors">Starting at</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl md:text-4xl font-black text-black tracking-tighter group-hover:text-[#8B2635] transition-colors">
                  ${Number(lowestVisiblePrice).toFixed(2)}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors">USD</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 transition-colors">Storage</span>
              <span className="text-[10px] font-black text-[#8B2635] uppercase block tracking-widest transition-colors">-20°C Stable</span>
            </div>
          </div>

          <Button 
            onClick={handleSelectStrength}
            className="w-full h-12 md:h-16 bg-[#8B2635] hover:bg-[#6B1827] border-2 border-[#8B2635] hover:border-[#b91c1c] text-white font-black uppercase tracking-tight md:tracking-widest text-[11px] md:text-sm rounded-2xl transition-all duration-300 group/btn shadow-lg hover:shadow-xl hover:shadow-[#dc2626]/20 active:scale-95 touch-manipulation px-2 md:px-6"
          >
            <span className="flex items-center gap-1.5 md:gap-3">
              <span className="md:hidden">SELECT &amp; ORDER</span>
              <span className="hidden md:inline">Select &amp; Order</span>
              <Microscope className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 transition-transform group-hover/btn:scale-110" />
            </span>
          </Button>
          
          <div className="mt-3 md:mt-8 flex items-center justify-center gap-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] transition-colors">Research Use Only · Not For Human Use</span>
          </div>
        </div>
      </Card>
    </motion.div>
    </>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;