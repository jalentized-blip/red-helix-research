import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ShoppingCart, CheckCircle } from "lucide-react";

export default function ProductModal({ product, isOpen, onClose }) {
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    // Add to cart logic here
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-stone-900 border-stone-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-50 pr-8">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Image */}
          {product.image_url && (
            <div className="aspect-video w-full bg-stone-800 rounded-xl overflow-hidden">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

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
    </Dialog>
  );
}