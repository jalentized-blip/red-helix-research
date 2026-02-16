import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, ArrowLeft, Save, Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// New prices from the CSV - January 2026 pricing update
const NEW_PRICES = {
  'TRZ': {
    '5mg x 10 vials': 80,
    '10mg x 10 vials': 100,
    '15mg x 10 vials': 120,
    '20mg x 10 vials': 140,
    '30mg x 10 vials': 160,
    '40mg x 10 vials': 180,
    '50mg x 10 vials': 200,
    '60mg x 10 vials': 220,
  },
  'RT': {
    '5mg x 10 vials': 100,
    '10mg x 10 vials': 135,
    '12mg x 10 vials': 145,
    '15mg x 10 vials': 160,
    '20mg x 10 vials': 190,
    '30mg x 10 vials': 250,
    '40mg x 10 vials': 290,
    '50mg x 10 vials': 330,
    '60mg x 10 vials': 360,
  },
  'SM': {
    '5mg x 10 vials': 80,
    '10mg x 10 vials': 95,
    '15mg x 10 vials': 110,
    '20mg x 10 vials': 130,
    '30mg x 10 vials': 150,
  },
  'GLOW': {
    '50mg x 10 vials': 170,
    '70mg x 10 vials': 190,
    '80mg x 10 vials': 210,
  },
  'Hcg': {
    '5000iu x 10 vials': 110,
  },
  'HCG': {
    '5000iu x 10 vials': 110,
  },
  'Hgh': {
    '10iu x 10 vials': 95,
  },
  'HGH': {
    '10iu x 10 vials': 95,
  },
  'PT176-191 (HGH frag)': {
    '5mg x 10 vials': 110,
    '10mg x 10 vials': 170,
  },
  'PT-141': {
    '5mg x 10 vials': 110,
    '10mg x 10 vials': 170,
  },
  'HGH Frag 176-191': {
    '5mg x 10 vials': 110,
    '10mg x 10 vials': 170,
  },
  'Tesamorelin': {
    '5mg x 10 vials': 130,
    '10mg x 10 vials': 210,
  },
  'MT1': {
    '10mg x 10 vials': 80,
  },
  'MT-1': {
    '10mg x 10 vials': 80,
  },
  'Melanotan 1': {
    '10mg x 10 vials': 80,
  },
  'MT2': {
    '10mg x 10 vials': 80,
  },
  'MT-2': {
    '10mg x 10 vials': 80,
  },
  'Melanotan 2': {
    '10mg x 10 vials': 80,
  },
  'Bac': {
    '3ml x 10 vials': 40,
    '10ml x 10 vials': 45,
  },
  'BAC': {
    '3ml x 10 vials': 40,
    '10ml x 10 vials': 45,
  },
  'Bacteriostatic Water': {
    '3ml x 10 vials': 40,
    '10ml x 10 vials': 45,
  },
  'BAC RESEARCH': {
    '3ml x 10 vials': 40,
    '10ml x 10 vials': 45,
  },
  'TB-500': {
    '5mg x 10 vials': 100,
    '10mg x 10 vials': 150,
  },
  'TB500': {
    '5mg x 10 vials': 100,
    '10mg x 10 vials': 150,
  },
  'BPC-157': {
    '5mg x 10 vials': 80,
    '10mg x 10 vials': 100,
  },
  'BPC157': {
    '5mg x 10 vials': 80,
    '10mg x 10 vials': 100,
  },
  'TB5+BPC5': {
    '10mg x 10 vials': 130,
  },
  'TB-500 + BPC-157': {
    '10mg x 10 vials': 130,
    '20mg x 10 vials': 190,
  },
  'TB10+BPC10': {
    '20mg x 10 vials': 190,
  },
  'SS 31': {
    '10mg x 10 vials': 120,
    '25mg x 10 vials': 230,
    '50mg x 10 vials': 350,
  },
  'SS-31': {
    '10mg x 10 vials': 120,
    '25mg x 10 vials': 230,
    '50mg x 10 vials': 350,
  },
  'Elamipretide': {
    '10mg x 10 vials': 120,
    '25mg x 10 vials': 230,
    '50mg x 10 vials': 350,
  },
  'Selank': {
    '5mg x 10 vials': 80,
    '10mg x 10 vials': 90,
  },
  'IGF1-LR3': {
    '0.1mg x 10 vials': 100,
    '1mg x 10 vials': 260,
  },
  'IGF-1 LR3': {
    '0.1mg x 10 vials': 100,
    '1mg x 10 vials': 260,
  },
  'Sermorelin': {
    '5mg x 10 vials': 110,
    '10mg x 10 vials': 220,
  },
};

export default function AdminPriceManagement() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priceEdits, setPriceEdits] = useState({});
  const [updateStatus, setUpdateStatus] = useState({});
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

  const updatePriceMutation = useMutation({
    mutationFn: ({ productId, updates }) => 
      base44.entities.Product.update(productId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setUpdateStatus(prev => ({
        ...prev,
        [variables.productId]: 'success'
      }));
    },
    onError: (error, variables) => {
      setUpdateStatus(prev => ({
        ...prev,
        [variables.productId]: 'error'
      }));
    }
  });

  // Find matching price from NEW_PRICES
  const findNewPrice = (productName, specName) => {
    // Try exact match first
    if (NEW_PRICES[productName] && NEW_PRICES[productName][specName]) {
      return NEW_PRICES[productName][specName];
    }
    
    // Try case-insensitive match
    const productKey = Object.keys(NEW_PRICES).find(
      key => key.toLowerCase() === productName.toLowerCase()
    );
    
    if (productKey && NEW_PRICES[productKey]) {
      const specKey = Object.keys(NEW_PRICES[productKey]).find(
        key => key.toLowerCase() === specName.toLowerCase()
      );
      if (specKey) {
        return NEW_PRICES[productKey][specKey];
      }
    }
    
    return null;
  };

  // Get the minimum price for price_from
  const getMinPrice = (specifications) => {
    if (!specifications || specifications.length === 0) return 0;
    return Math.min(...specifications.map(s => s.price || 0));
  };

  const handlePriceChange = (productId, specIndex, newPrice) => {
    setPriceEdits(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [specIndex]: parseFloat(newPrice) || 0
      }
    }));
  };

  const handleApplyPrices = async (product) => {
    const edits = priceEdits[product.id] || {};
    
    const updatedSpecs = product.specifications.map((spec, index) => ({
      ...spec,
      price: edits[index] !== undefined ? edits[index] : spec.price
    }));

    const newMinPrice = getMinPrice(updatedSpecs);

    updatePriceMutation.mutate({
      productId: product.id,
      updates: { 
        specifications: updatedSpecs,
        price_from: newMinPrice
      }
    });

    toast.success(`Prices updated for ${product.name}`, {
      description: `Minimum price: $${newMinPrice}`
    });
  };

  const handleApplyAllNewPrices = async () => {
    let updatedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      if (!product.specifications || product.specifications.length === 0) continue;

      let hasUpdates = false;
      const updatedSpecs = product.specifications.map(spec => {
        const newPrice = findNewPrice(product.name, spec.name);
        if (newPrice !== null && newPrice !== spec.price) {
          hasUpdates = true;
          return { ...spec, price: newPrice };
        }
        return spec;
      });

      if (hasUpdates) {
        const newMinPrice = getMinPrice(updatedSpecs);
        try {
          await base44.entities.Product.update(product.id, {
            specifications: updatedSpecs,
            price_from: newMinPrice
          });
          updatedCount++;
          setUpdateStatus(prev => ({ ...prev, [product.id]: 'success' }));
        } catch (err) {
          errorCount++;
          setUpdateStatus(prev => ({ ...prev, [product.id]: 'error' }));
        }
      }
    }

    queryClient.invalidateQueries({ queryKey: ['products'] });
    
    toast.success(`Bulk price update complete`, {
      description: `${updatedCount} products updated, ${errorCount} errors`
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
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-[#dc2626] hover:border-[#dc2626] mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-black text-amber-50 mb-2">
                <DollarSign className="inline w-10 h-10 text-[#dc2626] mr-2" />
                Price Management
              </h1>
              <p className="text-stone-400">Admin only - Update product prices across all specifications</p>
            </div>
            <Button
              onClick={handleApplyAllNewPrices}
              className="bg-[#dc2626] hover:bg-red-700 text-amber-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Apply All New Prices
            </Button>
          </div>

          {/* Price Update Summary Card */}
          <div className="bg-stone-900/50 border border-[#dc2626]/30 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-amber-50 mb-3">January 2026 Price Update</h3>
            <p className="text-stone-300 text-sm mb-4">
              This page contains the new pricing structure. Click "Apply All New Prices" to bulk update all products, 
              or manually edit individual prices below.
            </p>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                Green = Price will change
              </span>
              <span className="flex items-center gap-2 text-stone-400">
                <AlertCircle className="w-4 h-4" />
                Gray = No change / Not in price list
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="text-stone-400">Loading products...</p>
        ) : (
          <div className="space-y-4">
            {products.map((product, idx) => {
              const status = updateStatus[product.id];
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`bg-stone-900/50 border rounded-lg p-6 transition-all ${
                    status === 'success' ? 'border-green-600/50' :
                    status === 'error' ? 'border-[#dc2626]/50' :
                    'border-stone-700 hover:border-[#dc2626]/30'
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    {/* Product Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-amber-50">{product.name}</h3>
                          <p className="text-stone-400 text-sm">
                            Current base price: <span className="text-[#dc2626] font-semibold">${product.price_from}</span>
                          </p>
                        </div>
                        {status === 'success' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <Button
                        onClick={() => handleApplyPrices(product)}
                        size="sm"
                        className="bg-[#dc2626] hover:bg-red-700 text-amber-50"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Apply
                      </Button>
                    </div>

                    {/* Specifications Grid */}
                    {product.specifications && product.specifications.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {product.specifications.map((spec, specIndex) => {
                          const newPrice = findNewPrice(product.name, spec.name);
                          const editedPrice = priceEdits[product.id]?.[specIndex];
                          const displayPrice = editedPrice !== undefined ? editedPrice : spec.price;
                          const hasNewPrice = newPrice !== null && newPrice !== spec.price;
                          
                          return (
                            <div 
                              key={specIndex}
                              className={`p-4 rounded-lg border ${
                                hasNewPrice 
                                  ? 'bg-green-900/20 border-green-600/30' 
                                  : 'bg-stone-800/50 border-stone-700'
                              }`}
                            >
                              <div className="text-sm font-semibold text-amber-50 mb-2">
                                {spec.name}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-stone-400 text-sm">$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={displayPrice}
                                  onChange={(e) => handlePriceChange(product.id, specIndex, e.target.value)}
                                  className="bg-stone-800 border-stone-600 text-amber-50 h-9 w-24"
                                />
                                {hasNewPrice && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <span className="text-stone-500 line-through">${spec.price}</span>
                                    <span className="text-green-400">→ ${newPrice}</span>
                                    <button
                                      onClick={() => handlePriceChange(product.id, specIndex, newPrice)}
                                      className="p-1 hover:bg-stone-700 rounded"
                                      title="Apply new price"
                                    >
                                      <RefreshCw className="w-3 h-3 text-green-400" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-stone-500 text-sm">No specifications available</p>
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
