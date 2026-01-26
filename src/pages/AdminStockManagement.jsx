import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AdminStockManagement() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);
      } catch (err) {
        navigate(createPageUrl('Home'));
        return;
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const updateStockMutation = useMutation({
    mutationFn: ({ productId, updates }) => 
      base44.entities.Product.update(productId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleStockChange = (productId, quantity) => {
    updateStockMutation.mutate({
      productId,
      updates: { 
        stock_quantity: parseInt(quantity) || 0,
        in_stock: parseInt(quantity) > 0
      }
    });
  };

  const handleToggleStock = (product) => {
    updateStockMutation.mutate({
      productId: product.id,
      updates: { 
        in_stock: !product.in_stock,
        stock_quantity: !product.in_stock ? (product.stock_quantity || 0) : 0
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 pt-32 flex items-center justify-center">
        <p className="text-stone-400">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-black text-amber-50 mb-2">Stock Management</h1>
          <p className="text-stone-400">Admin only - Manage product inventory and availability</p>
        </div>

        {isLoading ? (
          <p className="text-stone-400">Loading products...</p>
        ) : (
          <div className="space-y-4">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-stone-900/50 border border-stone-700 rounded-lg p-6 hover:border-red-600/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg border border-stone-700"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-amber-50 mb-1">{product.name}</h3>
                        <p className="text-stone-400 text-sm mb-2">{product.description}</p>
                        <span className="text-red-600 font-semibold">From ${product.price_from}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Controls */}
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:min-w-[400px]">
                    <div className="flex-1">
                      <label className="text-stone-400 text-xs uppercase tracking-wide mb-2 block">
                        Stock Quantity
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={product.stock_quantity || 0}
                        onChange={(e) => handleStockChange(product.id, e.target.value)}
                        className="bg-stone-800 border-stone-700 text-amber-50"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="text-stone-400 text-xs uppercase tracking-wide mb-2 block">
                        Status
                      </label>
                      <Button
                        onClick={() => handleToggleStock(product)}
                        variant="outline"
                        className={`w-full ${
                          product.in_stock
                            ? 'bg-green-600/20 border-green-600/50 text-green-400 hover:bg-green-600/30'
                            : 'bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30'
                        }`}
                      >
                        {product.in_stock ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            In Stock
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Out of Stock
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}