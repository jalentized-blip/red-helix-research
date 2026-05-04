import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ShoppingCart, CheckCircle, Info, ChevronLeft, ChevronRight, FlaskConical, ShieldCheck, Microscope, Zap, LogIn } from "lucide-react";

import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import AddedToCartPopup from '@/components/AddedToCartPopup';
import { addToCart, isSpecInStock } from '@/components/utils/cart';

export default function ProductModal({ product, isOpen, onClose, isAuthenticated = false }) {
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showCOA, setShowCOA] = useState(false);
  const [currentCoaIndex, setCurrentCoaIndex] = useState(0);
  const [cartPopupItem, setCartPopupItem] = useState(null);
  const [kitDisclaimerChecked, setKitDisclaimerChecked] = useState(false);

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
      const cartProduct = product.isKitsProduct 
        ? { ...product, id: selectedSpec.productId, name: selectedSpec.productName }
        : product;
      for (let i = 0; i < quantity; i++) {
        addToCart(cartProduct, selectedSpec);
      }
      setAddedToCart(true);
      setCartPopupItem({
        productName: cartProduct.name,
        specification: selectedSpec.name,
      });
      setTimeout(() => setAddedToCart(false), 2000);
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
      <DialogContent className="bg-white border-slate-200 max-w-4xl p-0 overflow-hidden rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] [&>button]:hidden">
        <div className="flex flex-col lg:flex-row max-h-[90vh]">
          {/* Left Side: Product Image & Technical Info */}
          <div className="w-full lg:w-1/2 bg-slate-50 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-100 relative overflow-hidden">
            {/* Background Scientific Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#8B2635] border border-red-500 flex items-center justify-center">
                  <Microscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Catalog Reference</p>
                  <p className="text-xs font-bold text-black uppercase mt-1">RH-ENT-{product.id?.slice(0,4) || '7482'}</p>
                </div>
              </div>

              <div className="aspect-square w-full bg-white rounded-[32px] border border-slate-100 p-8 flex items-center justify-center relative group shadow-sm">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img 
                    src={product.image_url || 'https://i.ibb.co/kVLqM7Ff/redhelixxx-1.png'} 
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
                  <div className="w-2 h-2 rounded-full bg-[#8B2635] animate-pulse" />
                  <p className="text-xs font-bold text-slate-600">HPLC & Mass Spec Verified Batch</p>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-[#8B2635] animate-pulse" />
                  <p className="text-xs font-bold text-slate-600">Sterile Vacuum-Sealed Packaging</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Details & Selection */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col bg-white overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-black text-black tracking-tighter leading-none mb-2 uppercase">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#8B2635] text-white border-[#8B2635] text-[10px] font-black tracking-widest px-2 py-0">RESEARCH ONLY</Badge>
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
              {product.isKitsProduct ? (
                // Kits product displays all kit options in dropdown-style grid
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-slate-300" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select 10-Vial Kit</h3>
                  </div>
                  <div className="grid gap-3">
                    {product.specifications?.filter(spec => !spec.hidden).map((spec, index) => {
                      const isOutOfStock = !isSpecInStock(spec);
                      return (
                        <button
                          key={index}
                          onClick={() => !isOutOfStock && setSelectedSpec(spec)}
                          disabled={isOutOfStock}
                          className={`p-5 rounded-3xl border-2 transition-all duration-300 text-left relative group ${
                            selectedSpec?.name === spec.name && selectedSpec?.productName === spec.productName
                              ? 'border-[#8B2635] bg-[#8B2635]/5 shadow-sm'
                              : isOutOfStock
                              ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
                              : 'border-slate-100 bg-slate-50/30 hover:border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className={`font-black tracking-tight text-lg transition-colors ${isOutOfStock ? 'text-slate-400' : selectedSpec?.name === spec.name && selectedSpec?.productName === spec.productName ? 'text-[#8B2635]' : 'text-black'}`}>
                                {spec.productName} - {spec.name}
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">10-Vial Research Kit</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {isOutOfStock ? (
                                <span className="inline-block px-2.5 py-1 rounded-full bg-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest">Out of Stock</span>
                              ) : (
                                <div className="text-2xl font-black text-black tracking-tighter">${spec.price}</div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Regular products show single vials only
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FlaskConical className="w-4 h-4 text-slate-300" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Individual Unit Selection</h3>
                  </div>
                  <div className="grid gap-3">
                    {product.specifications?.filter(spec => !spec.hidden).map((spec, index) => {
                      const isOutOfStock = !isSpecInStock(spec);
                      return (
                        <button
                          key={index}
                          onClick={() => !isOutOfStock && setSelectedSpec(spec)}
                          disabled={isOutOfStock}
                          className={`p-5 rounded-3xl border-2 transition-all duration-300 text-left relative group ${
                            selectedSpec?.name === spec.name
                              ? 'border-[#8B2635] bg-[#8B2635]/5 shadow-sm'
                              : isOutOfStock
                              ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
                              : 'border-slate-100 bg-slate-50/30 hover:border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className={`font-black tracking-tight text-lg transition-colors ${isOutOfStock ? 'text-slate-400' : selectedSpec?.name === spec.name ? 'text-[#8B2635]' : 'text-black'}`}>
                                {spec.name}
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Single Vial</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {isOutOfStock ? (
                                <span className="inline-block px-2.5 py-1 rounded-full bg-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest">Out of Stock</span>
                              ) : (
                                <div className="text-2xl font-black text-black tracking-tighter">${spec.price}</div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Kit Disclaimer Checkbox — only for kit products */}
            {product.isKitsProduct && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kitDisclaimerChecked}
                    onChange={(e) => setKitDisclaimerChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-amber-600 flex-shrink-0 cursor-pointer"
                  />
                  <span className="text-xs text-amber-900 font-semibold leading-relaxed">
                    <span className="font-black uppercase text-amber-700 block mb-1">📦 Kit Shipment Notice — Please Read</span>
                    I understand that kit orders <strong>ship separately</strong> from single-vial orders and may arrive at a <strong>different time</strong> via a separate tracking number. Kit vials arrive <strong>unlabeled</strong> — I can identify my products by matching the <strong>batch number on the kit's box</strong> or the <strong>colored vial caps</strong> to the corresponding Certificate of Analysis at <a href="https://redhelixresearch.com/COAReports" target="_blank" rel="noopener noreferrer" className="underline text-amber-700">redhelixresearch.com/COAReports</a>. Kit fulfillment may take up to 36 hours before shipping.{' '}
                    <Link to={createPageUrl('KitInfo')} target="_blank" className="underline font-black text-amber-800">Read the full kit guide →</Link>
                  </span>
                </label>
              </div>
            )}

            {/* Action Area */}
            <div className="mt-6 space-y-4">
              {/* Quantity Selector */}
              {selectedSpec && (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-black hover:border-[#8B2635] hover:text-[#8B2635] transition-colors text-lg"
                    >−</button>
                    <span className="w-8 text-center font-black text-black text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-black hover:border-[#8B2635] hover:text-[#8B2635] transition-colors text-lg"
                    >+</button>
                  </div>
                </div>
              )}
              <Button
                  onClick={handleAddToCart}
                  disabled={!selectedSpec || addedToCart || (product.isKitsProduct && !kitDisclaimerChecked)}
                  className={`w-full py-8 rounded-[20px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                    !selectedSpec || (product.isKitsProduct && !kitDisclaimerChecked)
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : addedToCart
                      ? 'bg-green-600 text-white'
                      : 'bg-[#8B2635] hover:bg-[#6B1827] text-white shadow-[0_10px_30px_rgba(220,38,38,0.2)] hover:translate-y-[-2px]'
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
                        {selectedSpec ? `Initialize Order: $${(selectedSpec.price * quantity).toFixed(2)}` : 'Select Configuration'}
                      </>
                    )}
                  </span>
                </Button>

              {productCOAs.length > 0 && (
                <button
                  onClick={() => setShowCOA(true)}
                  className="w-full py-4 rounded-[20px] border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  View Batch Analysis (COA)
                </button>
              )}
              
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                Secure checkout • Third-party verified • Worldwide logistics
              </p>
            </div>

            {/* Additional Info - Bright Medical Style */}
            <div className="mt-8 grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-[#8B2635] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Quality Assurance</p>
                  <p className="text-xs font-bold text-black">Lab tested for 99%+ purity</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-[#8B2635] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Rapid Logistics</p>
                  <p className="text-xs font-bold text-black">Ships within 24-48 hours</p>
                </div>
              </div>
            </div>

            {/* Compliance Disclaimer - Non-bypassable */}
            <div className="mt-8 p-6 bg-[#8B2635] rounded-[32px] border-2 border-[#ef4444] relative overflow-hidden shadow-lg flex-shrink-0">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#6B1827]/20 rounded-full -mr-12 -mt-12 pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <p className="text-xs font-black text-white uppercase tracking-widest whitespace-normal">⚠️ MANDATORY COMPLIANCE NOTICE</p>
                </div>
                <div className="space-y-2 text-white">
                  <p className="text-xs font-bold leading-relaxed">
                    <span className="underline">FOR RESEARCH USE ONLY</span> - NOT FOR HUMAN CONSUMPTION OR USE
                  </p>
                  <p className="text-[10px] font-bold leading-relaxed">
                    This product is sold EXCLUSIVELY for in-vitro laboratory research and educational purposes. 
                    NOT approved by FDA for human or veterinary use. NOT intended to diagnose, treat, cure, or prevent any disease or condition.
                  </p>
                  <p className="text-[10px] font-bold leading-relaxed border-t border-white/30 pt-2">
                    By ordering, you legally certify you are:<br/>
                    ✓ 21+ years of age<br/>
                    ✓ A qualified researcher or institution<br/>
                    ✓ Using solely for laboratory research<br/>
                    ✓ Complying with all applicable laws
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Added to Cart Popup - rendered in document body to escape dialog stacking context */}
      {cartPopupItem && ReactDOM.createPortal(
        <AddedToCartPopup
          item={cartPopupItem}
          onClose={() => { setCartPopupItem(null); onClose(); }}
          onContinue={() => { setCartPopupItem(null); }}
        />,
        document.body
      )}

      {/* COA Image Overlay */}
      <AnimatePresence>
        {showCOA && productCOAs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCOA(false)}
            className="fixed inset-0 bg-white/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl"
          >
            <div className="relative max-w-4xl w-full">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[90vh] overflow-auto bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] p-2 border border-slate-200"
              >
                <img
                  src={productCOAs[currentCoaIndex].image_url}
                  alt={`COA for ${product.name}`}
                  className="w-full h-auto rounded-[32px]"
                />
              </motion.div>

              {/* Navigation Arrows */}
              {productCOAs.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevCOA();
                    }}
                    className="fixed left-8 top-1/2 -translate-y-1/2 p-4 bg-white/90 hover:bg-white text-black rounded-full shadow-xl transition-all hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextCOA();
                    }}
                    className="fixed right-8 top-1/2 -translate-y-1/2 p-4 bg-white/90 hover:bg-white text-black rounded-full shadow-xl transition-all hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCOA(false);
                }}
                className="fixed top-8 right-8 p-3 bg-white/90 hover:bg-white text-black rounded-full shadow-xl transition-all hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>

              {/* COA Counter */}
              {productCOAs.length > 1 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/90 text-black rounded-full shadow-xl font-black text-xs uppercase tracking-widest">
                  Batch Analysis {currentCoaIndex + 1} / {productCOAs.length}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}