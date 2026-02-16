import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, AlertCircle, CheckCircle, ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminStockManagement() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingStates, setEditingStates] = useState({});
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
    mutationFn: ({ productId, updates, showToast = true }) => 
      base44.entities.Product.update(productId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (variables.showToast) {
        const state = editingStates[variables.productId];
        toast.success(`Stock updated for ${state?.selectedSpec || 'product'}`, {
          description: `${state?.stockQuantity || 0} units - ${state?.inStock ? 'In Stock' : 'Out of Stock'}`
        });
        setEditingStates({});
      }
    },
  });

  const initializeEditingState = (productId, product) => {
    if (!editingStates[productId]) {
      setEditingStates(prev => ({
        ...prev,
        [productId]: {
          selectedSpec: product.specifications?.[0]?.name || null,
          stockQuantity: product.specifications?.[0]?.stock_quantity || 0,
          inStock: product.specifications?.[0]?.in_stock !== false,
          hidden: product.specifications?.[0]?.hidden || false
        }
      }));
    }
  };

  const handleSpecChange = (productId, specName, product) => {
    const spec = product.specifications?.find(s => s.name === specName);
    setEditingStates(prev => ({
      ...prev,
      [productId]: {
        selectedSpec: specName,
        stockQuantity: spec?.stock_quantity || 0,
        inStock: spec?.in_stock !== false,
        hidden: spec?.hidden || false
      }
    }));
  };

  const handleStockQuantityChange = (productId, quantity) => {
    setEditingStates(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        stockQuantity: parseInt(quantity) || 0
      }
    }));
  };

  const handleToggleStock = (productId) => {
    setEditingStates(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        inStock: !prev[productId].inStock
      }
    }));
  };

  const handleToggleHidden = (productId) => {
    setEditingStates(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        hidden: !prev[productId].hidden
      }
    }));
  };

  const handleApply = (product) => {
    const state = editingStates[product.id];
    if (!state || !state.selectedSpec) return;

    const updatedSpecs = product.specifications.map(spec => {
      if (spec.name === state.selectedSpec) {
        return {
          ...spec,
          stock_quantity: state.stockQuantity,
          in_stock: state.inStock,
          hidden: state.hidden
        };
      }
      return spec;
    });

    updateStockMutation.mutate({
      productId: product.id,
      updates: { specifications: updatedSpecs }
    });
  };

  const handleAllOutOfStock = async () => {
    const updatePromises = products.map(product => {
      if (product.specifications && product.specifications.length > 0) {
        const updatedSpecs = product.specifications.map(spec => ({
          ...spec,
          stock_quantity: 0,
          in_stock: false
        }));
        
        return base44.entities.Product.update(product.id, { specifications: updatedSpecs });
      }
      return Promise.resolve();
    });
    
    try {
      await Promise.all(updatePromises);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingStates({});
      toast.success('All products marked as out of stock', {
        description: 'All strength options have been disabled and applied successfully'
      });
    } catch (error) {
      toast.error('Failed to update all products', {
        description: error.message
      });
    }
  };

  const handleToggleProductVisibility = async (productId, currentlyHidden) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const updatedSpecs = product.specifications?.map(spec => ({
      ...spec,
      hidden: !currentlyHidden
    })) || [];

    try {
      await base44.entities.Product.update(productId, { specifications: updatedSpecs });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(
        currentlyHidden ? 'Product shown' : 'Product hidden',
        { description: 'All strength options updated' }
      );
    } catch (error) {
      toast.error('Failed to update product visibility');
    }
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
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-[#dc2626] hover:border-[#dc2626] mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-black text-amber-50 mb-2">Stock Management</h1>
              <p className="text-stone-400">Admin only - Manage product inventory and availability by strength</p>
            </div>
            <Button
              onClick={handleAllOutOfStock}
              variant="outline"
              className="bg-[#dc2626]/20 border-[#dc2626]/50 text-red-400 hover:bg-[#dc2626]/30"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Mark All Out of Stock
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-stone-400">Loading products...</p>
        ) : (
          <div className="space-y-4">
            {products.map((product, idx) => {
              if (!editingStates[product.id]) {
                initializeEditingState(product.id, product);
              }
              const state = editingStates[product.id] || {};
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-stone-900/50 border border-stone-700 rounded-lg p-6 hover:border-[#dc2626]/30 transition-all"
                >
                  <div className="flex flex-col gap-6">
                    {/* Product Info */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
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
                          <span className="text-[#dc2626] font-semibold">From ${product.price_from}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleToggleProductVisibility(
                          product.id,
                          product.specifications?.every(s => s.hidden)
                        )}
                        variant="outline"
                        size="sm"
                        className={
                          product.specifications?.every(s => s.hidden)
                            ? 'bg-stone-700/50 border-stone-600 text-stone-400 hover:bg-stone-700/70'
                            : 'bg-blue-600/20 border-blue-600/50 text-blue-400 hover:bg-blue-600/30'
                        }
                      >
                        {product.specifications?.every(s => s.hidden) ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Show Product
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Hide Product
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Stock Controls */}
                    {product.specifications && product.specifications.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-1">
                          <label className="text-stone-400 text-xs uppercase tracking-wide mb-2 block">
                            Strength Option
                          </label>
                          <Select
                            value={state.selectedSpec || product.specifications[0]?.name}
                            onValueChange={(value) => handleSpecChange(product.id, value, product)}
                          >
                            <SelectTrigger className="bg-stone-800 border-stone-700 text-amber-50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-stone-900 border-stone-700">
                              {product.specifications.filter(spec => spec.name && spec.name.trim() !== '').map((spec) => (
                                <SelectItem 
                                  key={spec.name} 
                                  value={spec.name}
                                  className="text-amber-50"
                                >
                                  {spec.name} - ${spec.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-1">
                          <label className="text-stone-400 text-xs uppercase tracking-wide mb-2 block">
                            Stock Quantity
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={state.stockQuantity || 0}
                            onChange={(e) => handleStockQuantityChange(product.id, e.target.value)}
                            className="bg-stone-800 border-stone-700 text-amber-50"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <label className="text-stone-400 text-xs uppercase tracking-wide mb-2 block">
                            Status
                          </label>
                          <Button
                            onClick={() => handleToggleStock(product.id)}
                            variant="outline"
                            className={`w-full ${
                              state.inStock
                                ? 'bg-green-600/20 border-green-600/50 text-green-400 hover:bg-green-600/30'
                                : 'bg-[#dc2626]/20 border-[#dc2626]/50 text-red-400 hover:bg-[#dc2626]/30'
                            }`}
                          >
                            {state.inStock ? (
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

                        <div className="md:col-span-1">
                          <label className="text-stone-400 text-xs uppercase tracking-wide mb-2 block">
                            Visibility
                          </label>
                          <Button
                            onClick={() => handleToggleHidden(product.id)}
                            variant="outline"
                            className={`w-full ${
                              state.hidden
                                ? 'bg-stone-700/50 border-stone-600 text-stone-400 hover:bg-stone-700/70'
                                : 'bg-blue-600/20 border-blue-600/50 text-blue-400 hover:bg-blue-600/30'
                            }`}
                          >
                            {state.hidden ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Hidden
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Visible
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="md:col-span-1">
                          <label className="text-stone-400 text-xs uppercase tracking-wide mb-2 block">
                            &nbsp;
                          </label>
                          <Button
                            onClick={() => handleApply(product)}
                            className="w-full bg-[#dc2626] hover:bg-red-700 text-amber-50"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Apply
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-stone-500 text-sm">No specifications available for this product</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}