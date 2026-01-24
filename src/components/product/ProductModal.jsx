import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ShoppingCart, CheckCircle, Info } from "lucide-react";
import { addToCart } from '@/components/utils/cart';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductModal({ product, isOpen, onClose }) {
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showCOA, setShowCOA] = useState(false);
  const [hoveredInfo, setHoveredInfo] = useState(false);

  const { data: coas = [] } = useQuery({
    queryKey: ['coas'],
    queryFn: () => base44.entities.COA.list(),
    initialData: [],
  });

  if (!product) return null;

  const productCOA = coas.find(coa => 
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
                onClick={() => productCOA && setShowCOA(true)}
                className={`p-2 rounded-full transition-all ${
                  productCOA 
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
                    {productCOA ? 'Click to view COA' : 'PENDING COA'}
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
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/f33efc498_image.png" 
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
          <div>
            <h3 className="text-lg font-bold text-amber-50 mb-4">
              Select Kit Strength
            </h3>
            <div className="grid gap-3">
              {product.specifications?.map((spec, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSpec(spec)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedSpec?.name === spec.name
                      ? 'border-red-700 bg-red-700/10'
                      : 'border-stone-700 bg-stone-800/50 hover:border-stone-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-amber-50">
                        {spec.name}
                      </div>
                      <div className="text-sm text-stone-400 mt-1">
                        10 vials per kit
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        ${spec.price}
                      </div>
                      {selectedSpec?.name === spec.name && (
                        <CheckCircle className="w-5 h-5 text-red-600 mt-1 ml-auto" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={!selectedSpec || addedToCart}
              className="flex-1 bg-red-700 hover:bg-red-600 text-amber-50 font-semibold py-6 text-lg"
            >
              {addedToCart ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart {selectedSpec ? `- $${selectedSpec.price}` : ''}
                </>
              )}
            </Button>
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
        </div>
      </DialogContent>

      {/* COA Image Overlay */}
      <AnimatePresence>
        {showCOA && productCOA && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCOA(false)}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] overflow-auto bg-stone-900 rounded-lg"
            >
              <button
                onClick={() => setShowCOA(false)}
                className="absolute top-4 right-4 p-2 bg-stone-800 hover:bg-stone-700 rounded-full z-10"
              >
                <X className="w-5 h-5 text-amber-50" />
              </button>
              <img
                src={productCOA.image_url}
                alt={`COA for ${product.name}`}
                className="w-full h-auto"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}