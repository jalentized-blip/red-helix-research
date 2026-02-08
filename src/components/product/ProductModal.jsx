import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ShoppingCart, CheckCircle, Info, ChevronLeft, ChevronRight, FlaskConical, ShieldCheck, Microscope, Zap } from "lucide-react";
import { addToCart } from '@/components/utils/cart';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductModal({ product, isOpen, onClose }) {
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showCOA, setShowCOA] = useState(false);
  const [currentCoaIndex, setCurrentCoaIndex] = useState(0);

  const { data: coas = [] } = useQuery({
    queryKey: ['coas'],
    queryFn: () => base44.entities.COA.list(),
    initialData: [],
  });

  if (!product) return null;

  const productCOAs = coas.filter(coa => 
    coa.product_name?.toLowerCase() === product.name?.toLowerCase()
  );

  const handleAddToCart = () => {
    if (selectedSpec) {
      addToCart(product, selectedSpec);
      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
        onClose();
      }, 1500);
    }
  };

  const handlePrevCOA = () => {
    setCurrentCoaIndex((prev) => (prev === 0 ? productCOAs.length - 1 : prev - 1));
  };

  const handleNextCOA = () => {
    setCurrentCoaIndex((prev) => (prev === productCOAs.length - 1 ? 0 : prev + 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-slate-200 max-w-4xl p-0 overflow-hidden rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]">
        <div className="flex flex-col lg:flex-row max-h-[90vh]">
          {/* Left Side: Product Image & Technical Info */}
          <div className="w-full lg:w-1/2 bg-slate-50 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-100 relative overflow-hidden">
            {/* Background Scientific Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-red-600/5 border border-red-600/10 flex items-center justify-center">
                  <Microscope className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Catalog Reference</p>
                  <p className="text-xs font-bold text-slate-900 uppercase mt-1">RH-ENT-{product.id?.slice(0,4) || '7482'}</p>
                </div>
              </div>

              <div className="aspect-square w-full bg-white rounded-[32px] border border-slate-100 p-8 flex items-center justify-center relative group shadow-sm">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img 
                    src="https://i.ibb.co/nNNG1FKC/redhelixresearchvial20.jpg" 
                    alt={product.name}
                    className="w-full h-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
                  />
                </motion.div>
                
                {/* Floating Badges */}
                <div className="absolute top-6 right-6">
                  <div className="px-3 py-1 bg-white/90 backdrop-blur-md border border-slate-100 rounded-full flex items-center gap-2 shadow-sm">
                    <ShieldCheck className="w-3 h-3 text-green-600" />
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-tighter">Verified Purity</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <p className="text-xs font-bold text-slate-600">HPLC & Mass Spec Verified Batch</p>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <p className="text-xs font-bold text-slate-600">Sterile Vacuum-Sealed Packaging</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Details & Selection */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col bg-white overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2 uppercase">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-600/5 text-red-600 border-red-600/10 text-[10px] font-black tracking-widest px-2 py-0">RESEARCH ONLY</Badge>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ISO 9001:2015</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <p className="text-slate-500 text-sm leading-relaxed mb-10 font-medium">
              {product.description || "Premium laboratory-grade research material synthesized to exacting standards. Each batch undergoes rigorous multi-stage analytical testing to ensure maximum purity and identity confirmation."}
            </p>

            {/* Selection Grid */}
            <div className="space-y-8 flex-grow">
              {/* Single Vials */}
              {product.specifications?.filter(spec => !spec.hidden && spec.name?.toLowerCase().includes('single vial')).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FlaskConical className="w-4 h-4 text-slate-300" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Individual Unit Selection</h3>
                  </div>
                  <div className="grid gap-3">
                    {product.specifications?.filter(spec => !spec.hidden && spec.name?.toLowerCase().includes('single vial')).map((spec, index) => {
                      const isOutOfStock = spec.in_stock === false || spec.stock_quantity === 0;
                      return (
                        <button
                          key={index}
                          onClick={() => !isOutOfStock && setSelectedSpec(spec)}
                          disabled={isOutOfStock}
                          className={`p-5 rounded-3xl border-2 transition-all duration-300 text-left relative group ${
                            selectedSpec?.name === spec.name
                              ? 'border-red-600 bg-red-600/5 shadow-sm'
                              : isOutOfStock
                              ? 'border-slate-50 bg-slate-50/50 opacity-40 cursor-not-allowed'
                              : 'border-slate-100 bg-slate-50/30 hover:border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className={`font-black tracking-tight text-lg transition-colors ${selectedSpec?.name === spec.name ? 'text-red-600' : 'text-slate-900'}`}>
                                {spec.name}
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Single Analysis Unit</div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-black text-slate-900 tracking-tighter">
                                ${spec.price}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Kits Section */}
              {product.specifications?.filter(spec => !spec.hidden && !spec.name?.toLowerCase().includes('single vial')).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-slate-300" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bulk Research Kits (10 Units)</h3>
                  </div>
                  <div className="grid gap-3">
                    {product.specifications?.filter(spec => !spec.hidden && !spec.name?.toLowerCase().includes('single vial')).map((spec, index) => {
                      const isOutOfStock = spec.in_stock === false || spec.stock_quantity === 0;
                      return (
                        <button
                          key={index}
                          onClick={() => !isOutOfStock && setSelectedSpec(spec)}
                          disabled={isOutOfStock}
                          className={`p-5 rounded-3xl border-2 transition-all duration-300 text-left relative group ${
                            selectedSpec?.name === spec.name
                              ? 'border-red-600 bg-red-600/5 shadow-sm'
                              : isOutOfStock
                              ? 'border-slate-50 bg-slate-50/50 opacity-40 cursor-not-allowed'
                              : 'border-slate-100 bg-slate-50/30 hover:border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className={`font-black tracking-tight text-lg transition-colors ${selectedSpec?.name === spec.name ? 'text-red-600' : 'text-slate-900'}`}>
                                {spec.name}
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Laboratory 10-Pack Kit</div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-black text-slate-900 tracking-tighter">
                                ${spec.price}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Action Area */}
            <div className="mt-10 space-y-4">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedSpec || addedToCart}
                className={`w-full py-8 rounded-[20px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                  !selectedSpec 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : addedToCart
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_10px_30px_rgba(220,38,38,0.2)] hover:translate-y-[-2px]'
                }`}
              >
                <span className="flex items-center gap-3">
                  {addedToCart ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Added to Protocol
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      {selectedSpec ? `Initialize Order: $${selectedSpec.price}` : 'Select Configuration'}
                    </>
                  )}
                </span>
              </Button>
              
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                Secure checkout • Third-party verified • Worldwide logistics
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
                className="flex-1 bg-red-600 hover:bg-red-700 text-amber-50 font-semibold py-6 text-lg"
              >
                {addedToCart ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart - ${selectedSpec.price}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Additional Info */}
          <div className="bg-stone-800/50 rounded-lg p-4 text-sm text-stone-300 space-y-2">
            <p className="flex items-center gap-2">
              <span className="text-red-600">✓</span> Lab tested for purity
            </p>
            <p className="flex items-center gap-2">
              <span className="text-red-600">✓</span> Ships within 24-48 hours
            </p>
            <p className="flex items-center gap-2">
              <span className="text-red-600">✓</span> Includes Certificate of Analysis
            </p>
          </div>

          {/* Research Use Disclaimer */}
          <div className="bg-red-950/30 border border-red-700/50 rounded-lg p-4 text-xs text-red-200">
            <p className="font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              STRICT RESEARCH COMPLIANCE
            </p>
            <p className="leading-relaxed">
              This product is supplied for <span className="font-bold text-amber-50 underline">RESEARCH AND LABORATORY USE ONLY</span>. It is strictly <span className="font-bold text-amber-50 underline">NOT FOR HUMAN CONSUMPTION</span>, therapeutic use, or clinical application. By adding to cart, you certify you are a qualified researcher (21+) and assume all liability for handling.
            </p>
          </div>
        </div>
      </DialogContent>

      {/* COA Image Overlay */}
      <AnimatePresence>
        {showCOA && productCOAs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCOA(false)}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          >
            <div className="relative max-w-4xl w-full">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[90vh] overflow-auto bg-stone-900 rounded-lg"
              >
                <img
                  src={productCOAs[currentCoaIndex].image_url}
                  alt={`COA for ${product.name}`}
                  className="w-full h-auto"
                />
              </motion.div>

              {/* Navigation Arrows - Outside scroll container */}
              {productCOAs.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevCOA();
                    }}
                    className="fixed left-4 top-1/2 -translate-y-1/2 p-3 bg-stone-800/90 hover:bg-stone-700 rounded-full backdrop-blur-sm pointer-events-auto z-[101] cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-amber-50" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextCOA();
                    }}
                    className="fixed right-4 top-1/2 -translate-y-1/2 p-3 bg-stone-800/90 hover:bg-stone-700 rounded-full backdrop-blur-sm pointer-events-auto z-[101] cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-amber-50" />
                  </button>
                </>
              )}

              {/* Close Button - Outside scroll container */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCOA(false);
                }}
                className="fixed top-6 right-6 p-2 bg-stone-800/90 hover:bg-stone-700 rounded-full backdrop-blur-sm"
              >
                <X className="w-5 h-5 text-amber-50" />
              </button>

              {/* COA Counter - Outside scroll container */}
              {productCOAs.length > 1 && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-stone-800/90 rounded-full backdrop-blur-sm pointer-events-none">
                  <p className="text-sm text-amber-50 font-semibold">
                    {currentCoaIndex + 1} / {productCOAs.length}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}