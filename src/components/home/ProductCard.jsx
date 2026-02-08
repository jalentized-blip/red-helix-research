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
    
    const isBacWater = product.name?.toLowerCase().includes('bacteriostatic') || 
                       product.name?.toLowerCase().includes('bac water');
    const image = isBacWater 
      ? product.image_url 
      : 'https://i.ibb.co/nNNG1FKC/redhelixresearchvial20.jpg';
    
    return { lowestVisiblePrice: price, displayImage: image };
  }, [product.specifications, product.price_from, product.name, product.image_url]);

  const handleSelectStrength = useCallback(() => {
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
          className="fixed inset-0 z-40 pointer-events-none bg-stone-950/30"
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
        className="relative z-50 h-full"
      >
      
      <Card className={`group relative bg-white border-slate-200 hover:border-red-600/30 transition-all duration-500 overflow-hidden h-full shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-[32px] flex flex-col ${
        isAdmin && localHidden ? 'opacity-60 grayscale' : ''
      }`}>
        {/* Animated Glow Overlay - Subtle Medical Pulse */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Admin Visibility Toggle */}
        {isAdmin && (
          <div className="absolute top-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center gap-2 bg-white/90 backdrop-blur-md border rounded-xl px-3 py-2 transition-all shadow-sm ${
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
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {badge && (
            <Badge className={`${badge.color} border text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm`}>
              <badge.icon className="w-3 h-3" />
              {badge.label}
            </Badge>
          )}
          <Badge className="bg-white/90 backdrop-blur-md border-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Microscope className="w-3 h-3 text-red-600" />
            HPLC TESTED
          </Badge>
        </div>

        <div className="p-8 flex flex-col h-full">
          {/* Product Image Container */}
          <div className={`relative mb-8 aspect-square flex items-center justify-center bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 group-hover:border-red-100 transition-colors ${!isAuthenticated ? 'blur-md' : ''}`}>
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={product.name}
                className="w-4/5 h-4/5 object-contain transform group-hover:scale-110 transition-transform duration-700 drop-shadow-lg"
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
              className="absolute left-0 right-0 h-[1px] bg-red-600/10 shadow-[0_0_10px_rgba(239,68,68,0.2)] z-10"
            />
          </div>

          {/* Product Info */}
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black tracking-widest text-red-600 uppercase">
                {categoryLabels[product.category]}
              </span>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-green-600" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">99%+ Purity</span>
              </div>
            </div>

            <h3 className={`text-2xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-red-600 transition-colors ${!isAuthenticated ? 'blur-sm' : ''}`}>
              {product.name}
            </h3>
            
            <p className={`text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed font-medium ${!isAuthenticated ? 'blur-sm' : ''}`}>
              {product.description}
            </p>
          </div>

          <div className={`flex items-center justify-between mb-6 ${!isAuthenticated ? 'blur-sm' : ''}`}>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Research Value</span>
              <span className="text-3xl font-black text-slate-900">
                ${lowestVisiblePrice}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-black text-slate-900 uppercase">IN STOCK</span>
              </div>
            </div>
          </div>

          <div className={`mb-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl ${!isAuthenticated ? 'blur-sm' : ''}`}>
            <p className="text-[10px] text-slate-500 leading-tight font-medium">
              <span className="text-red-600 font-bold uppercase mr-1">RUO:</span>
              Research Use Only. Not for human consumption. Standard 10-vial laboratory configuration.
            </p>
          </div>

          {!isAuthenticated ? (
            <Link to={createPageUrl('Login') + '?returnUrl=' + encodeURIComponent(window.location.href)} className="w-full">
              <Button 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest gap-2 rounded-2xl py-7 transition-all"
              >
                <Lock className="w-4 h-4" />
                ACCESS REQUIRED
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={handleSelectStrength}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-2xl py-7 shadow-[0_10px_20px_-5px_rgba(220,38,38,0.2)] hover:shadow-[0_15px_30px_-5px_rgba(220,38,38,0.3)] transition-all duration-300 transform group-hover:-translate-y-1"
            >
              CONFIGURE ORDER
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
    </>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;