import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Package, User, MapPin, Truck, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminOrderManagement() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
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

  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, updates }) => base44.entities.Order.update(orderId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order updated successfully');
    },
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderMutation.mutate({ orderId, updates: { status: newStatus } });
  };

  const handleTrackingUpdate = (orderId, trackingNumber, carrier) => {
    updateOrderMutation.mutate({ 
      orderId, 
      updates: { tracking_number: trackingNumber, carrier } 
    });
  };

  const filteredOrders = orders.filter(order => {
    const statusMatch = filterStatus === 'all' || order.status === filterStatus;
    const searchMatch = searchQuery === '' || 
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.created_by?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address?.address?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const statusColors = {
    pending: 'bg-yellow-600/20 border-yellow-600/50 text-yellow-400',
    processing: 'bg-blue-600/20 border-blue-600/50 text-blue-400',
    shipped: 'bg-purple-600/20 border-purple-600/50 text-purple-400',
    delivered: 'bg-green-600/20 border-green-600/50 text-green-400'
  };

  const statusIcons = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle
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
      <div className="max-w-7xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-black text-amber-50 mb-2">Order Management</h1>
          <p className="text-stone-400">Admin only - Manage customer orders and shipping</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Input
            placeholder="Search by order #, email, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-stone-900 border-stone-700 text-amber-50 max-w-md"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-stone-900 border-stone-700 text-amber-50 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-stone-700">
              <SelectItem value="all" className="text-amber-50">All Orders</SelectItem>
              <SelectItem value="pending" className="text-amber-50">Pending</SelectItem>
              <SelectItem value="processing" className="text-amber-50">Processing</SelectItem>
              <SelectItem value="shipped" className="text-amber-50">Shipped</SelectItem>
              <SelectItem value="delivered" className="text-amber-50">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {['pending', 'processing', 'shipped', 'delivered'].map(status => {
            const count = orders.filter(o => o.status === status).length;
            const StatusIcon = statusIcons[status];
            return (
              <div key={status} className={`${statusColors[status]} rounded-lg p-4 border`}>
                <div className="flex items-center gap-2 mb-1">
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-xs uppercase font-semibold">{status}</span>
                </div>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <p className="text-stone-400">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-stone-600 mx-auto mb-4" />
            <p className="text-stone-400">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, idx) => {
              const StatusIcon = statusIcons[order.status];
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-stone-900/50 border border-stone-700 rounded-lg p-6 hover:border-red-600/30 transition-all"
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-amber-50">#{order.order_number}</h3>
                        <span className={`${statusColors[order.status]} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-400">
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          {order.created_by}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(order.created_date), 'MMM dd, yyyy h:mm a')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4" />
                          ${order.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Status Controls */}
                    <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                      <SelectTrigger className="bg-stone-800 border-stone-700 text-amber-50 w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-900 border-stone-700">
                        <SelectItem value="pending" className="text-amber-50">Pending</SelectItem>
                        <SelectItem value="processing" className="text-amber-50">Processing</SelectItem>
                        <SelectItem value="shipped" className="text-amber-50">Shipped</SelectItem>
                        <SelectItem value="delivered" className="text-amber-50">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="text-sm font-semibold text-stone-300 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Order Items
                      </h4>
                      <div className="space-y-2">
                        {order.items?.map((item, i) => (
                          <div key={i} className="bg-stone-800/50 rounded-lg p-3 border border-stone-700">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-amber-50 text-sm">{item.productName}</p>
                                <p className="text-xs text-stone-400">{item.specification}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-red-600 text-sm">${item.price}</p>
                                <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div>
                      <h4 className="text-sm font-semibold text-stone-300 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Shipping Information
                      </h4>
                      {order.shipping_address ? (
                        <div className="bg-stone-800/50 rounded-lg p-3 border border-stone-700 mb-3">
                          <p className="text-sm text-amber-50">{order.shipping_address.address}</p>
                          <p className="text-sm text-stone-400">
                            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-stone-500 mb-3">No shipping address provided</p>
                      )}

                      {/* Tracking Info */}
                      <div className="space-y-2">
                        {order.tracking_number && (
                          <div className="bg-stone-800/50 rounded-lg p-3 border border-stone-700">
                            <p className="text-xs text-stone-400 mb-1">Tracking Number</p>
                            <p className="text-sm font-mono text-amber-50">{order.tracking_number}</p>
                            {order.carrier && (
                              <p className="text-xs text-stone-400 mt-1">Carrier: {order.carrier}</p>
                            )}
                          </div>
                        )}
                        {order.estimated_delivery && (
                          <div className="text-xs text-stone-400">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" />
                              Est. Delivery: {format(new Date(order.estimated_delivery), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        )}
                        {order.delivered_date && (
                          <div className="text-xs text-green-400">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle className="w-3 h-3" />
                              Delivered: {format(new Date(order.delivered_date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
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