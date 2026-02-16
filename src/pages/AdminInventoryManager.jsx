import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ArrowLeft, Plus, Trash2, Save, Search, Package, Eye, EyeOff,
  CheckCircle, AlertCircle, Edit3, X, GripVertical, ImagePlus,
  DollarSign, BarChart2, Star, Flame, TrendingUp, Award, Sparkles,
  Dumbbell, Copy, ChevronDown, ChevronUp, Upload, RefreshCw, Settings2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const CATEGORIES = [
  { id: 'weight_loss', label: 'Weight Loss' },
  { id: 'recovery_healing', label: 'Recovery & Healing' },
  { id: 'cognitive_focus', label: 'Cognitive & Focus' },
  { id: 'performance_longevity', label: 'Performance & Longevity' },
  { id: 'sexual_health', label: 'Sexual Health' },
  { id: 'general_health', label: 'General Health' },
];

const BADGES = [
  { id: '', label: 'None' },
  { id: 'bestseller', label: 'Best Seller', icon: Flame },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'top_rated', label: 'Top Rated', icon: Star },
  { id: 'popular', label: 'Popular', icon: BarChart2 },
  { id: 'classic', label: 'Classic', icon: Award },
  { id: 'newcomer', label: 'Newcomer', icon: Sparkles },
  { id: 'essential', label: 'Essential', icon: Dumbbell },
];

const EMPTY_SPEC = { name: '', price: 0, stock_quantity: 100, in_stock: true, hidden: false };

function SpecificationRow({ spec, index, onChange, onRemove, isOnly }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center group">
      <div className="col-span-4">
        <Input
          value={spec.name}
          onChange={(e) => onChange(index, { ...spec, name: e.target.value })}
          placeholder="e.g. 5mg x 10 vials"
          className="bg-white border-slate-200 text-slate-900 text-sm h-9 focus:border-[#dc2626]/30"
        />
      </div>
      <div className="col-span-2">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={spec.price}
            onChange={(e) => onChange(index, { ...spec, price: parseFloat(e.target.value) || 0 })}
            className="bg-white border-slate-200 text-slate-900 text-sm h-9 pl-6 focus:border-[#dc2626]/30"
          />
        </div>
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          min="-1"
          value={spec.stock_quantity}
          onChange={(e) => onChange(index, { ...spec, stock_quantity: parseInt(e.target.value) || 0 })}
          placeholder="-1 = unlimited"
          className="bg-white border-slate-200 text-slate-900 text-sm h-9 focus:border-[#dc2626]/30"
        />
      </div>
      <div className="col-span-1 flex justify-center">
        <Switch
          checked={spec.in_stock}
          onCheckedChange={(val) => onChange(index, { ...spec, in_stock: val })}
          className="data-[state=checked]:bg-green-600"
        />
      </div>
      <div className="col-span-1 flex justify-center">
        <Switch
          checked={!spec.hidden}
          onCheckedChange={(val) => onChange(index, { ...spec, hidden: !val })}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>
      <div className="col-span-2 flex justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          disabled={isOnly}
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function ProductEditor({ product, onSave, onCancel, onDelete, isSaving }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || 'general_health',
    badge: product?.badge || '',
    image_url: product?.image_url || '',
    is_featured: product?.is_featured || false,
    hidden: product?.hidden || false,
    specifications: product?.specifications?.length > 0
      ? product.specifications.map(s => ({ ...s }))
      : [{ ...EMPTY_SPEC }],
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateSpec = (index, updated) => {
    setForm(prev => {
      const specs = [...prev.specifications];
      specs[index] = updated;
      return { ...prev, specifications: specs };
    });
  };

  const addSpec = () => {
    setForm(prev => ({
      ...prev,
      specifications: [...prev.specifications, { ...EMPTY_SPEC }],
    }));
  };

  const removeSpec = (index) => {
    if (form.specifications.length <= 1) return;
    setForm(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const uploadResponse = await base44.integrations.Core.UploadFile({ file });
      if (uploadResponse?.url) {
        updateField('image_url', uploadResponse.url);
        toast.success('Image uploaded');
      }
    } catch (err) {
      toast.error('Image upload failed', { description: err.message });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    const validSpecs = form.specifications.filter(s => s.name.trim() !== '');
    if (validSpecs.length === 0) {
      toast.error('At least one strength option with a name is required');
      return;
    }
    const minPrice = Math.min(...validSpecs.map(s => s.price || 0));
    onSave({
      ...form,
      specifications: validSpecs,
      price_from: minPrice,
      updated_date: new Date().toISOString(),
    });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDelete(product.id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-[#dc2626]" />
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            {product ? `Edit: ${product.name}` : 'New Product'}
          </h3>
          {product && (
            <Badge variant="outline" className="text-slate-400 border-slate-300 text-xs">
              ID: {product.id?.slice(0, 8)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {product && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold shadow-lg shadow-[#dc2626]/20"
          >
            <Save className="w-4 h-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Row 1: Name, Category, Badge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-widest mb-1.5 block font-black">
              Product Name *
            </label>
            <Input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g. BPC-157"
              className="bg-slate-50 border-slate-200 text-slate-900 focus:border-[#dc2626]/30 focus:bg-white"
            />
          </div>
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-widest mb-1.5 block font-black">
              Category
            </label>
            <Select value={form.category} onValueChange={(v) => updateField('category', v)}>
              <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                {CATEGORIES.map(c => (
                  <SelectItem key={c.id} value={c.id} className="text-slate-900">{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-widest mb-1.5 block font-black">
              Badge
            </label>
            <Select value={form.badge || 'none'} onValueChange={(v) => updateField('badge', v === 'none' ? '' : v)}>
              <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                {BADGES.map(b => (
                  <SelectItem key={b.id || 'none'} value={b.id || 'none'} className="text-slate-900">
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Description */}
        <div>
          <label className="text-slate-500 text-xs uppercase tracking-widest mb-1.5 block font-black">
            Description
          </label>
          <Textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Product description..."
            rows={3}
            className="bg-slate-50 border-slate-200 text-slate-900 resize-none focus:border-[#dc2626]/30 focus:bg-white"
          />
        </div>

        {/* Row 3: Image + Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-widest mb-1.5 block font-black">
              Product Image
            </label>
            <div className="flex gap-3 items-start">
              <div className="w-20 h-20 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {form.image_url ? (
                  <img src={form.image_url} alt="Product" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <Input
                  value={form.image_url}
                  onChange={(e) => updateField('image_url', e.target.value)}
                  placeholder="Image URL or upload"
                  className="bg-slate-50 border-slate-200 text-slate-900 text-sm focus:border-[#dc2626]/30"
                />
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className="border-slate-200 text-slate-500 hover:text-[#dc2626] hover:border-[#dc2626]/30 text-xs"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    {imageUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                  {form.image_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateField('image_url', '')}
                      className="border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 justify-center">
            <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200">
              <div>
                <span className="text-slate-900 text-sm font-bold">Featured Product</span>
                <p className="text-slate-400 text-xs">Show in Best Sellers section</p>
              </div>
              <Switch
                checked={form.is_featured}
                onCheckedChange={(val) => updateField('is_featured', val)}
                className="data-[state=checked]:bg-[#dc2626]"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200">
              <div>
                <span className="text-slate-900 text-sm font-bold">Visible to Customers</span>
                <p className="text-slate-400 text-xs">Toggle product visibility on storefront</p>
              </div>
              <Switch
                checked={!form.hidden}
                onCheckedChange={(val) => updateField('hidden', !val)}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-slate-500 text-xs uppercase tracking-widest font-black">
              Strength Options / Specifications
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={addSpec}
              className="border-slate-200 text-slate-500 hover:text-[#dc2626] hover:border-[#dc2626]/30 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Option
            </Button>
          </div>

          {/* Spec Table Header */}
          <div className="grid grid-cols-12 gap-2 mb-2 px-1">
            <span className="col-span-4 text-slate-400 text-[10px] uppercase tracking-widest font-black">Strength Name</span>
            <span className="col-span-2 text-slate-400 text-[10px] uppercase tracking-widest font-black">Price</span>
            <span className="col-span-2 text-slate-400 text-[10px] uppercase tracking-widest font-black">Stock Qty</span>
            <span className="col-span-1 text-slate-400 text-[10px] uppercase tracking-widest font-black text-center">In Stock</span>
            <span className="col-span-1 text-slate-400 text-[10px] uppercase tracking-widest font-black text-center">Visible</span>
            <span className="col-span-2 text-slate-400 text-[10px] uppercase tracking-widest font-black text-right">Actions</span>
          </div>

          <div className="space-y-2">
            {form.specifications.map((spec, i) => (
              <SpecificationRow
                key={i}
                spec={spec}
                index={i}
                onChange={updateSpec}
                onRemove={removeSpec}
                isOnly={form.specifications.length === 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-white border-slate-200 text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-red-500 font-black">Delete Product</DialogTitle>
            <DialogDescription className="text-slate-500">
              Are you sure you want to delete "{product?.name}"? This will mark the product as deleted and hide it from all customers. This action can be undone by an admin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="border-slate-200 text-slate-500"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductRow({ product, onEdit, onQuickToggle, isUpdating }) {
  const visibleSpecs = product.specifications?.filter(s => !s.hidden) || [];
  const inStockSpecs = visibleSpecs.filter(s => s.in_stock && (s.stock_quantity > 0 || s.stock_quantity === undefined || s.stock_quantity === -1));
  const totalStock = product.specifications?.reduce((sum, s) => {
    if (s.stock_quantity === -1 || s.stock_quantity === undefined) return sum;
    return sum + (s.stock_quantity || 0);
  }, 0) || 0;
  const hasUnlimitedStock = product.specifications?.some(s => s.stock_quantity === -1 || s.stock_quantity === undefined);
  const allHidden = product.specifications?.every(s => s.hidden) || product.hidden;
  const isDeleted = product.is_deleted;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-white border-2 rounded-2xl px-5 py-4 transition-all cursor-pointer hover:border-[#dc2626]/30 hover:shadow-lg hover:shadow-slate-200/50 group ${
        isDeleted ? 'border-red-200 opacity-50' :
        allHidden ? 'border-slate-100 opacity-60' :
        'border-slate-100'
      }`}
      onClick={() => onEdit(product)}
    >
      <div className="flex items-center gap-4">
        {/* Image */}
        <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-5 h-5 text-slate-300" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-slate-900 font-black text-sm truncate tracking-tight">{product.name}</h4>
            {product.badge && (
              <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-400 px-1.5 py-0 font-bold">
                {BADGES.find(b => b.id === product.badge)?.label || product.badge}
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="text-[10px] bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20 px-1.5 py-0 font-bold">
                Featured
              </Badge>
            )}
            {isDeleted && (
              <Badge className="text-[10px] bg-red-50 text-red-500 border-red-200 px-1.5 py-0 font-bold">
                Deleted
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <span>{CATEGORIES.find(c => c.id === product.category)?.label || product.category}</span>
            <span className="text-slate-200">|</span>
            <span>{product.specifications?.length || 0} options</span>
            <span className="text-slate-200">|</span>
            <span className="text-[#dc2626] font-black">${product.price_from}</span>
          </div>
        </div>

        {/* Stock Summary */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <div className={`text-sm font-black ${inStockSpecs.length > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {inStockSpecs.length}/{visibleSpecs.length} in stock
            </div>
            <div className="text-xs text-slate-400 font-medium">
              {hasUnlimitedStock ? 'Unlimited' : `${totalStock} units`}
            </div>
          </div>

          {/* Quick Visibility Toggle */}
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onQuickToggle(product)}
              disabled={isUpdating}
              className={`h-8 px-2 ${
                allHidden
                  ? 'text-slate-300 hover:text-blue-500'
                  : 'text-blue-500 hover:text-slate-400'
              }`}
            >
              {allHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>

          {/* Edit arrow */}
          <Edit3 className="w-4 h-4 text-slate-300 group-hover:text-[#dc2626] transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminInventoryManager() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  // Real-time sync
  useEffect(() => {
    const unsubscribe = base44.entities.Product.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    });
    return unsubscribe;
  }, [queryClient]);

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
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const saveMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      if (id) {
        return base44.entities.Product.update(id, data);
      } else {
        return base44.entities.Product.create(data);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(variables.id ? 'Product updated' : 'Product created', {
        description: `${variables.data.name} saved successfully`,
      });
      setEditingProduct(null);
      setIsCreating(false);
    },
    onError: (err) => {
      toast.error('Failed to save product', { description: err.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (productId) =>
      base44.entities.Product.update(productId, { is_deleted: true, hidden: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
      setEditingProduct(null);
    },
    onError: (err) => {
      toast.error('Failed to delete product', { description: err.message });
    },
  });

  const handleSave = (formData) => {
    const id = editingProduct?.id || null;
    saveMutation.mutate({ id, data: formData });
  };

  const handleDelete = (productId) => {
    deleteMutation.mutate(productId);
  };

  const handleQuickToggle = async (product) => {
    const allHidden = product.specifications?.every(s => s.hidden) || product.hidden;
    const newHidden = !allHidden;

    setUpdatingIds(prev => new Set([...prev, product.id]));

    try {
      const updatedSpecs = product.specifications?.map(spec => ({
        ...spec,
        hidden: newHidden,
      })) || [];

      await base44.entities.Product.update(product.id, {
        hidden: newHidden,
        specifications: updatedSpecs,
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(newHidden ? 'Product hidden' : 'Product shown');
    } catch (err) {
      toast.error('Failed to update visibility');
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  const handleDuplicate = (product) => {
    setEditingProduct(null);
    setIsCreating(true);
    setEditingProduct({
      ...product,
      id: null,
      name: `${product.name} (Copy)`,
    });
  };

  const handleRestoreProduct = async (product) => {
    try {
      await base44.entities.Product.update(product.id, { is_deleted: false, hidden: false });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product restored');
    } catch (err) {
      toast.error('Failed to restore product');
    }
  };

  // Filtering
  const filteredProducts = products.filter(p => {
    if (!showDeleted && p.is_deleted) return false;
    if (showDeleted && !p.is_deleted) return false;

    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

    if (stockFilter === 'in_stock') {
      const hasStock = p.specifications?.some(s => s.in_stock && (s.stock_quantity > 0 || s.stock_quantity === -1 || s.stock_quantity === undefined));
      if (!hasStock) return false;
    }
    if (stockFilter === 'out_of_stock') {
      const allOut = !p.specifications?.some(s => s.in_stock && (s.stock_quantity > 0 || s.stock_quantity === -1 || s.stock_quantity === undefined));
      if (!allOut) return false;
    }
    if (stockFilter === 'hidden') {
      const allHidden = p.specifications?.every(s => s.hidden) || p.hidden;
      if (!allHidden) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Stats
  const totalProducts = products.filter(p => !p.is_deleted).length;
  const hiddenProducts = products.filter(p => !p.is_deleted && (p.hidden || p.specifications?.every(s => s.hidden))).length;
  const outOfStockProducts = products.filter(p => {
    if (p.is_deleted) return false;
    return !p.specifications?.some(s => s.in_stock && (s.stock_quantity > 0 || s.stock_quantity === -1 || s.stock_quantity === undefined));
  }).length;
  const deletedProducts = products.filter(p => p.is_deleted).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#dc2626]"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  const isEditing = editingProduct || isCreating;

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="mb-4 hover:bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-xs">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-2 uppercase tracking-tighter leading-none">
                Inventory <span className="text-[#dc2626]">Manager</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium">
                Full product management — add, edit, delete, and configure everything in one place.
              </p>
            </motion.div>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setIsCreating(true);
                setEditingProduct({
                  name: '',
                  description: '',
                  category: 'general_health',
                  badge: '',
                  image_url: '',
                  is_featured: false,
                  hidden: false,
                  specifications: [{ ...EMPTY_SPEC }],
                });
              }}
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black uppercase tracking-widest text-xs px-6 py-6 rounded-full shadow-lg shadow-[#dc2626]/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            <button
              onClick={() => { setStockFilter('all'); setShowDeleted(false); }}
              className={`bg-white border-2 rounded-2xl p-4 text-left transition-all hover:shadow-md ${
                stockFilter === 'all' && !showDeleted ? 'border-[#dc2626]/30 shadow-lg shadow-[#dc2626]/5' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="text-3xl font-black text-slate-900">{totalProducts}</div>
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Total Products</div>
            </button>
            <button
              onClick={() => { setStockFilter('in_stock'); setShowDeleted(false); }}
              className={`bg-white border-2 rounded-2xl p-4 text-left transition-all hover:shadow-md ${
                stockFilter === 'in_stock' ? 'border-green-300 shadow-lg shadow-green-50' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="text-3xl font-black text-green-600">{totalProducts - outOfStockProducts - hiddenProducts}</div>
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Active & In Stock</div>
            </button>
            <button
              onClick={() => { setStockFilter('out_of_stock'); setShowDeleted(false); }}
              className={`bg-white border-2 rounded-2xl p-4 text-left transition-all hover:shadow-md ${
                stockFilter === 'out_of_stock' ? 'border-red-300 shadow-lg shadow-red-50' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="text-3xl font-black text-red-500">{outOfStockProducts}</div>
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Out of Stock</div>
            </button>
            <button
              onClick={() => { setStockFilter('all'); setShowDeleted(true); }}
              className={`bg-white border-2 rounded-2xl p-4 text-left transition-all hover:shadow-md ${
                showDeleted ? 'border-orange-300 shadow-lg shadow-orange-50' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="text-3xl font-black text-orange-500">{deletedProducts}</div>
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Deleted</div>
            </button>
          </div>
        </div>

        {/* Editor Panel */}
        <AnimatePresence mode="wait">
          {isEditing && editingProduct && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <ProductEditor
                product={editingProduct.id ? editingProduct : null}
                onSave={handleSave}
                onCancel={() => { setEditingProduct(null); setIsCreating(false); }}
                onDelete={handleDelete}
                isSaving={saveMutation.isPending}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#dc2626] transition-colors" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="bg-slate-50 border-slate-200 text-slate-900 pl-11 rounded-full h-12 focus:border-[#dc2626]/30 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-[#dc2626]" />
              </button>
            )}
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 w-full md:w-48 rounded-full h-12">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all" className="text-slate-900">All Categories</SelectItem>
              {CATEGORIES.map(c => (
                <SelectItem key={c.id} value={c.id} className="text-slate-900">{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 w-full md:w-44 rounded-full h-12">
              <SelectValue placeholder="All Stock" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all" className="text-slate-900">All Products</SelectItem>
              <SelectItem value="in_stock" className="text-slate-900">In Stock</SelectItem>
              <SelectItem value="out_of_stock" className="text-slate-900">Out of Stock</SelectItem>
              <SelectItem value="hidden" className="text-slate-900">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Package className="w-4 h-4" />
            <p className="text-xs font-black uppercase tracking-widest">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {showDeleted ? ' (showing deleted)' : ''}
            </p>
          </div>
          {showDeleted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleted(false)}
              className="text-slate-500 hover:text-[#dc2626] hover:bg-slate-50 text-xs font-bold uppercase tracking-widest"
            >
              Show Active Products
            </Button>
          )}
        </div>

        {/* Product List */}
        {isLoading ? (
          <div className="text-center py-40">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#dc2626]"></div>
            <p className="text-slate-500 font-bold mt-4 uppercase tracking-widest text-xs">Loading Products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-40 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No products found</p>
            <button
              onClick={() => { setSearchQuery(''); setCategoryFilter('all'); setStockFilter('all'); }}
              className="mt-4 text-[#dc2626] font-black uppercase text-xs hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <div key={product.id}>
                  {showDeleted ? (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white border-2 border-red-100 rounded-2xl px-5 py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-slate-300" />
                        <div>
                          <h4 className="text-slate-500 font-black text-sm tracking-tight">{product.name}</h4>
                          <p className="text-slate-400 text-xs font-medium">
                            {CATEGORIES.find(c => c.id === product.category)?.label} - {product.specifications?.length || 0} options
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreProduct(product)}
                        className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 text-xs font-bold"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Restore
                      </Button>
                    </motion.div>
                  ) : (
                    <ProductRow
                      product={product}
                      onEdit={(p) => {
                        setIsCreating(false);
                        setEditingProduct(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onQuickToggle={handleQuickToggle}
                      isUpdating={updatingIds.has(product.id)}
                    />
                  )}
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
