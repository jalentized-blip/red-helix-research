import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ShoppingCart, CheckCircle, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { addToCart } from '@/components/utils/cart';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductModal({ product, isOpen, onClose }) {
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showCOA, setShowCOA] = useState(false);
  const [hoveredInfo, setHoveredInfo] = useState(false);
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

  const handleNextCOA = () => {
    setCurrentCoaIndex((prev) => (prev + 1) % productCOAs.length);
  };

  const handlePrevCOA = () => {
    setCurrentCoaIndex((prev) => (prev - 1 + productCOAs.length) % productCOAs.length);
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-stone-900 border-stone-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-2xl font-bold text-amber-50 pr-8">
              {product.name}
            </DialogTitle>
            <div 
              className="relative"
              onMouseEnter={() => setHoveredInfo(true)}
              onMouseLeave={() => setHoveredInfo(false)}
            >
              <button
                onClick={() => {
                  if (productCOAs.length > 0) {
                    setCurrentCoaIndex(0);
                    setShowCOA(true);
                  }
                }}
                className={`p-2 rounded-full transition-all ${
                  productCOAs.length > 0
                    ? 'bg-stone-800 hover:bg-stone-700 cursor-pointer' 
                    : 'bg-stone-800/50 cursor-default'
                }`}
              >
                <Info className="w-5 h-5 text-stone-400" />
              </button>

              {hoveredInfo && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full right-0 mt-2 px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg shadow-xl whitespace-nowrap z-50"
                >
                  <p className="text-xs text-stone-300">
                    {productCOAs.length > 0 ? `Click to view ${productCOAs.length} COA${productCOAs.length > 1 ? 's' : ''}` : 'PENDING COA'}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Image */}
          <div className="aspect-video w-full bg-stone-800 rounded-xl overflow-hidden">
            <img 
              src="https://i.ibb.co/nNNG1FKC/redhelixresearchvial20.jpg" 
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-stone-300 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Specifications */}
          <div className="space-y-6">
            {/* Single Vials Section */}
            {product.specifications?.filter(spec => !spec.hidden && spec.name?.toLowerCase().includes('single vial')).length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-amber-50 mb-4">
                  Single Vials
                </h3>
                <div className="grid gap-3">
                  {product.specifications?.filter(spec => !spec.hidden && spec.name?.toLowerCase().includes('single vial')).map((spec, index) => {
                    const isOutOfStock = spec.in_stock === false || spec.stock_quantity === 0;
                    return (
                      <button
                        key={index}
                        onClick={() => !isOutOfStock && setSelectedSpec(spec)}
                        disabled={isOutOfStock}
                        className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                          selectedSpec?.name === spec.name
                            ? 'border-red-700 bg-red-700/10'
                            : isOutOfStock
                            ? 'border-stone-700/50 bg-stone-800/20 opacity-60 cursor-not-allowed'
                            : 'border-stone-700 bg-stone-800/50 hover:border-stone-600'
                        }`}
                      >
                        {isOutOfStock && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                              Out of Stock
                            </Badge>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-amber-50">
                              {spec.name}
                            </div>
                            <div className="text-sm text-stone-400 mt-1">
                              Individual vial
                            </div>
                            {!isOutOfStock && spec.stock_quantity > 0 && (
                              <div className="text-xs text-green-400 mt-1">
                                {spec.stock_quantity} units available
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-600">
                              ${spec.price}
                            </div>
                            {selectedSpec?.name === spec.name && !isOutOfStock && (
                              <CheckCircle className="w-5 h-5 text-red-600 mt-1 ml-auto" />
                            )}
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
                <h3 className="text-lg font-bold text-amber-50 mb-4">
                  Kits (10 Vials)
                </h3>
                <div className="grid gap-3">
                  {product.specifications?.filter(spec => !spec.hidden && !spec.name?.toLowerCase().includes('single vial')).map((spec, index) => {
                    const isOutOfStock = spec.in_stock === false || spec.stock_quantity === 0;
                    return (
                      <button
                        key={index}
                        onClick={() => !isOutOfStock && setSelectedSpec(spec)}
                        disabled={isOutOfStock}
                        className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                          selectedSpec?.name === spec.name
                            ? 'border-red-700 bg-red-700/10'
                            : isOutOfStock
                            ? 'border-stone-700/50 bg-stone-800/20 opacity-60 cursor-not-allowed'
                            : 'border-stone-700 bg-stone-800/50 hover:border-stone-600'
                        }`}
                      >
                        {isOutOfStock && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                              Out of Stock
                            </Badge>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-amber-50">
                              {spec.name}
                            </div>
                            <div className="text-sm text-stone-400 mt-1">
                              10 vials per kit
                            </div>
                            {!isOutOfStock && spec.stock_quantity > 0 && (
                              <div className="text-xs text-green-400 mt-1">
                                {spec.stock_quantity} units available
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-600">
                              ${spec.price}
                            </div>
                            {selectedSpec?.name === spec.name && !isOutOfStock && (
                              <CheckCircle className="w-5 h-5 text-red-600 mt-1 ml-auto" />
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

          {/* Add to Cart Button */}
          <div className="flex gap-3">
            {!selectedSpec ? (
              <Button
                disabled={true}
                className="flex-1 bg-stone-700 text-stone-400 font-semibold py-6 text-lg cursor-not-allowed"
              >
                Select a strength option
              </Button>
            ) : selectedSpec.in_stock === false || selectedSpec.stock_quantity === 0 ? (
              <Button
                disabled={true}
                className="flex-1 bg-stone-700 text-stone-400 font-semibold py-6 text-lg cursor-not-allowed"
              >
                Out of Stock
              </Button>
            ) : (
              <Button
                onClick={handleAddToCart}
                disabled={addedToCart}
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
          <div className="bg-yellow-950/30 border border-yellow-700/50 rounded-lg p-4 text-xs text-yellow-100">
            <p className="font-bold mb-2">⚠️ IMPORTANT DISCLAIMER</p>
            <p className="leading-relaxed">
              This product is for research and laboratory use only. Not intended for human consumption, therapeutic use, or any clinical application. Not for use in humans or animals. Purchaser assumes all responsibility for compliance with applicable laws and regulations.
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