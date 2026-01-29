import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign,
  Calendar,
  User,
  Filter,
  X,
  Package,
  Loader2,
  Edit,
  Check,
  Truck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCustomerManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('USPS');
  const [orderStatus, setOrderStatus] = useState('processing');

  // Authentication check
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
          navigate(createPageUrl('Home'));
        }
      } catch (error) {
        navigate(createPageUrl('Login'));
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch all orders
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  const handleUpdateOrder = async (orderId) => {
    try {
      const updates = {
        status: orderStatus,
      };

      if (trackingNumber.trim()) {
        updates.tracking_number = trackingNumber;
        updates.carrier = carrier;
        if (orderStatus === 'processing') {
          updates.status = 'shipped';
        }
      }

      await base44.entities.Order.update(orderId, updates);

      // Send tracking email if tracking number was added
      if (trackingNumber.trim()) {
        const order = orders.find(o => o.id === orderId);
        if (order && order.customer_email) {
          await base44.integrations.Core.SendEmail({
            from_name: 'Red Helix Research',
            to: order.customer_email,
            subject: `Your Order is on its way! - ${order.order_number}`,
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #8B2635;">Your Order Has Shipped!</h2>
                <p>Hi ${order.customer_name || 'Customer'},</p>
                <p>Great news! Your order <strong>${order.order_number}</strong> has been shipped.</p>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                  <p><strong>Carrier:</strong> ${carrier}</p>
                </div>
                <p>You can track your package using the tracking number above on the ${carrier} website.</p>
                <p>Thank you for your order!</p>
              </div>
            `
          });
        }
      }

      await refetchOrders();
      setEditingOrder(null);
      setTrackingNumber('');
      setCarrier('USPS');
      setOrderStatus('processing');
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order');
    }
  };

  // Extract and process unique customers
  const customers = useMemo(() => {
    const customerMap = new Map();

    orders.forEach(order => {
      const email = order.customer_email || order.created_by;
      if (!email || email === 'guest@redhelix.com') return;

      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email,
          name: order.customer_name || 'Unknown',
          phone: order.customer_phone || null,
          orders: [],
          totalSpent: 0,
          orderCount: 0,
          firstOrder: order.created_date,
          lastOrder: order.created_date,
          shippingAddresses: [],
        });
      }

      const customer = customerMap.get(email);
      
      // Update name and phone if current order has them and customer doesn't
      if (order.customer_name && customer.name === 'Unknown') {
        customer.name = order.customer_name;
      }
      if (order.customer_phone && !customer.phone) {
        customer.phone = order.customer_phone;
      }
      
      customer.orders.push(order);
      customer.totalSpent += order.total_amount || 0;
      customer.orderCount++;
      
      if (order.created_date > customer.lastOrder) {
        customer.lastOrder = order.created_date;
      }
      if (order.created_date < customer.firstOrder) {
        customer.firstOrder = order.created_date;
      }

      // Collect shipping addresses - handle both nested object and flat format
      const shippingAddr = order.shipping_address;
      if (shippingAddr) {
        const normalizedAddr = {
          firstName: shippingAddr.firstName || shippingAddr.first_name || '',
          lastName: shippingAddr.lastName || shippingAddr.last_name || '',
          shippingAddress: shippingAddr.shippingAddress || shippingAddr.shipping_address || shippingAddr.address || '',
          shippingCity: shippingAddr.shippingCity || shippingAddr.shipping_city || shippingAddr.city || '',
          shippingState: shippingAddr.shippingState || shippingAddr.shipping_state || shippingAddr.state || '',
          shippingZip: shippingAddr.shippingZip || shippingAddr.shipping_zip || shippingAddr.zip || '',
        };
        
        // Only add if it has actual address data and isn't duplicate
        if (normalizedAddr.shippingAddress && !customer.shippingAddresses.some(addr => 
          addr.shippingAddress === normalizedAddr.shippingAddress &&
          addr.shippingZip === normalizedAddr.shippingZip
        )) {
          customer.shippingAddresses.push(normalizedAddr);
        }
      }
    });

    return Array.from(customerMap.values()).sort((a, b) => 
      new Date(b.lastOrder) - new Date(a.lastOrder)
    );
  }, [orders]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = 
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchQuery));

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && customer.orderCount > 1) ||
        (statusFilter === 'new' && customer.orderCount === 1) ||
        (statusFilter === 'vip' && customer.totalSpent > 500);

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  // Customer stats
  const stats = useMemo(() => ({
    total: customers.length,
    active: customers.filter(c => c.orderCount > 1).length,
    new: customers.filter(c => c.orderCount === 1).length,
    vip: customers.filter(c => c.totalSpent > 500).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
  }), [customers]);

  const getCustomerBadge = (customer) => {
    if (customer.totalSpent > 1000) return { label: 'VIP', color: 'bg-purple-600' };
    if (customer.totalSpent > 500) return { label: 'Premium', color: 'bg-blue-600' };
    if (customer.orderCount > 3) return { label: 'Regular', color: 'bg-green-600' };
    if (customer.orderCount === 1) return { label: 'New', color: 'bg-yellow-600' };
    return { label: 'Active', color: 'bg-stone-600' };
  };

  if (isLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-amber-50 mb-2">Customer Management</h1>
          <p className="text-stone-400">Track and manage your customer relationships</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-stone-900/50 border-stone-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-sm">Total Customers</p>
                  <p className="text-2xl font-bold text-amber-50">{stats.total}</p>
                </div>
                <User className="w-8 h-8 text-stone-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-stone-900/50 border-stone-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-sm">Active</p>
                  <p className="text-2xl font-bold text-green-500">{stats.active}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-stone-900/50 border-stone-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-sm">New</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.new}</p>
                </div>
                <User className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-stone-900/50 border-stone-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-sm">VIP</p>
                  <p className="text-2xl font-bold text-purple-500">{stats.vip}</p>
                </div>
                <User className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-stone-900/50 border-stone-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-red-500">${stats.totalRevenue.toFixed(0)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-stone-900 border-stone-700 text-amber-50"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              className={statusFilter === 'all' ? 'bg-red-600' : ''}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('active')}
              className={statusFilter === 'active' ? 'bg-red-600' : ''}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'new' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('new')}
              className={statusFilter === 'new' ? 'bg-red-600' : ''}
            >
              New
            </Button>
            <Button
              variant={statusFilter === 'vip' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('vip')}
              className={statusFilter === 'vip' ? 'bg-red-600' : ''}
            >
              VIP
            </Button>
          </div>
        </div>

        {/* Customer List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredCustomers.map((customer) => {
              const badge = getCustomerBadge(customer);
              return (
                <motion.div
                  key={customer.email}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card 
                    className="bg-stone-900/50 border-stone-700 hover:border-red-600/50 transition-all cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-amber-50 text-lg mb-1">{customer.name}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-stone-400 mb-2">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-stone-400">
                              <Phone className="w-4 h-4" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                        <Badge className={`${badge.color} text-white`}>
                          {badge.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-stone-500">Orders</p>
                          <p className="text-amber-50 font-semibold">{customer.orderCount}</p>
                        </div>
                        <div>
                          <p className="text-stone-500">Total Spent</p>
                          <p className="text-amber-50 font-semibold">${customer.totalSpent.toFixed(2)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-stone-500">Last Order</p>
                          <p className="text-amber-50 text-xs">
                            {new Date(customer.lastOrder).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-stone-700 mx-auto mb-4" />
            <p className="text-stone-400">No customers found</p>
          </div>
        )}

        {/* Customer Detail Modal */}
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="bg-stone-900 border-stone-700 max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedCustomer && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-2xl text-amber-50 mb-2">
                        {selectedCustomer.name}
                      </DialogTitle>
                      <Badge className={`${getCustomerBadge(selectedCustomer).color} text-white`}>
                        {getCustomerBadge(selectedCustomer).label}
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>

                {/* Contact Info */}
                <div className="space-y-4 mt-4">
                  <div className="bg-stone-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-amber-50 mb-3">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-stone-300">
                        <Mail className="w-4 h-4 text-stone-500" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                      {selectedCustomer.phone && (
                        <div className="flex items-center gap-3 text-stone-300">
                          <Phone className="w-4 h-4 text-stone-500" />
                          <span>{selectedCustomer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-stone-800/50 rounded-lg p-4">
                      <p className="text-stone-400 text-sm mb-1">Total Orders</p>
                      <p className="text-2xl font-bold text-amber-50">{selectedCustomer.orderCount}</p>
                    </div>
                    <div className="bg-stone-800/50 rounded-lg p-4">
                      <p className="text-stone-400 text-sm mb-1">Total Spent</p>
                      <p className="text-2xl font-bold text-green-500">${selectedCustomer.totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="bg-stone-800/50 rounded-lg p-4">
                      <p className="text-stone-400 text-sm mb-1">Avg Order</p>
                      <p className="text-2xl font-bold text-blue-500">
                        ${(selectedCustomer.totalSpent / selectedCustomer.orderCount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Addresses */}
                  {selectedCustomer.shippingAddresses.length > 0 && (
                    <div className="bg-stone-800/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-amber-50 mb-3">Shipping Addresses</h3>
                      <div className="space-y-3">
                        {selectedCustomer.shippingAddresses.map((addr, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-stone-300 text-sm">
                            <MapPin className="w-4 h-4 text-stone-500 mt-0.5" />
                            <div>
                              <p>{addr.firstName} {addr.lastName}</p>
                              <p>{addr.shippingAddress}</p>
                              <p>{addr.shippingCity}, {addr.shippingState} {addr.shippingZip}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order History */}
                  <div className="bg-stone-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-amber-50 mb-3">Order History</h3>
                    <div className="space-y-3">
                      {selectedCustomer.orders.map((order) => (
                        <div key={order.id} className="bg-stone-900/50 rounded-lg p-3 border border-stone-700">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-stone-500" />
                              <span className="font-semibold text-amber-50">{order.order_number}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={
                                order.status === 'delivered' ? 'bg-green-600' :
                                order.status === 'shipped' ? 'bg-blue-600' :
                                order.status === 'processing' ? 'bg-yellow-600' :
                                'bg-stone-600'
                              }>
                                {order.status}
                              </Badge>
                              {editingOrder !== order.id && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingOrder(order.id);
                                    setTrackingNumber(order.tracking_number || '');
                                    setCarrier(order.carrier || 'USPS');
                                    setOrderStatus(order.status || 'processing');
                                  }}
                                  className="h-6 px-2"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-stone-400">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(order.created_date).toLocaleDateString()}</span>
                            </div>
                            <span className="font-semibold text-amber-50">${order.total_amount?.toFixed(2)}</span>
                          </div>
                          <div className="mt-2 text-xs text-stone-500">
                            {order.items?.length || 0} items
                          </div>

                          {/* Tracking Info Display */}
                          {order.tracking_number && editingOrder !== order.id && (
                            <div className="mt-2 pt-2 border-t border-stone-700 text-xs">
                              <div className="flex items-center gap-2 text-stone-400">
                                <Truck className="w-3 h-3" />
                                <span>{order.carrier}: {order.tracking_number}</span>
                              </div>
                            </div>
                          )}

                          {/* Edit Order Form */}
                          {editingOrder === order.id && (
                            <div className="mt-3 pt-3 border-t border-stone-700 space-y-2">
                              <div>
                                <label className="text-xs text-stone-400 block mb-1">Status</label>
                                <select
                                  value={orderStatus}
                                  onChange={(e) => setOrderStatus(e.target.value)}
                                  className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-xs text-amber-50"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-stone-400 block mb-1">Carrier</label>
                                <select
                                  value={carrier}
                                  onChange={(e) => setCarrier(e.target.value)}
                                  className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-xs text-amber-50"
                                >
                                  <option value="USPS">USPS</option>
                                  <option value="UPS">UPS</option>
                                  <option value="FedEx">FedEx</option>
                                  <option value="DHL">DHL</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-stone-400 block mb-1">Tracking Number</label>
                                <Input
                                  value={trackingNumber}
                                  onChange={(e) => setTrackingNumber(e.target.value)}
                                  placeholder="Enter tracking number"
                                  className="bg-stone-800 border-stone-600 text-amber-50 text-xs h-8"
                                />
                              </div>
                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateOrder(order.id)}
                                  className="bg-green-700 hover:bg-green-600 text-xs h-7"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingOrder(null);
                                    setTrackingNumber('');
                                    setCarrier('USPS');
                                    setOrderStatus('processing');
                                  }}
                                  className="text-xs h-7"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}