import React, { useState, useEffect } from 'react';
import { Bell, X, MessageSquare, Package, Truck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function NotificationCenter({ userEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const queryClient = useQueryClient();

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['unread-notifications', userEmail],
    queryFn: async () => {
      // Fetch notifications for this admin OR notifications sent to admin@redhelix.com
      const adminNotifications = await base44.entities.Notification.filter(
        { read: false },
        '-created_date',
        50
      );
      // Filter for this user's email or the general admin email
      return adminNotifications.filter(n =>
        n.admin_email === userEmail ||
        n.admin_email === 'admin@redhelix.com' ||
        n.type === 'blockchain_confirmed'
      );
    },
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  useEffect(() => {
    // Subscribe to real-time notification updates
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      // Refetch on any notification event
      if (event.type === 'create' || event.type === 'update') {
        refetch();
        // Play notification sound for new blockchain confirmations
        if (event.type === 'create' && event.data?.type === 'blockchain_confirmed') {
          toast.success(`New order received: ${event.data?.order_number}`, {
            description: 'Click the bell to add tracking number',
            duration: 10000,
          });
        }
      }
    });

    return () => unsubscribe();
  }, [refetch]);

  const markAsRead = async (notificationId) => {
    await base44.entities.Notification.update(notificationId, { read: true });
    refetch();
  };

  const markAllAsRead = async () => {
    for (const notif of notifications) {
      await base44.entities.Notification.update(notif.id, { read: true });
    }
    refetch();
  };

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }) => {
      return await base44.entities.Order.update(orderId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Tracking number added successfully');
      setTrackingModalOpen(false);
      setTrackingNumber('');
      setCarrier('');
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast.error('Failed to update tracking: ' + error.message);
    }
  });

  const handleNotificationClick = async (notif) => {
    if (notif.type === 'blockchain_confirmed' && notif.requires_tracking) {
      // Fetch the order details
      try {
        const order = await base44.entities.Order.get(notif.order_id);
        setSelectedOrder({ ...order, notification_id: notif.id });
        setTrackingModalOpen(true);
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        toast.error('Failed to load order details');
      }
    } else {
      markAsRead(notif.id);
    }
  };

  const handleApplyTracking = async () => {
    if (!trackingNumber || !carrier) {
      toast.error('Please enter tracking number and select carrier');
      return;
    }

    // Update the order with tracking info
    await updateOrderMutation.mutateAsync({
      orderId: selectedOrder.id,
      updates: {
        tracking_number: trackingNumber,
        carrier: carrier,
        status: 'shipped'
      }
    });

    // Send tracking email notification to customer
    try {
      const trackingUrls = {
        USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
        UPS: `https://www.ups.com/track?tracknum=${trackingNumber}`,
        FedEx: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
        DHL: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`
      };

      await base44.integrations.Core.SendEmail({
        to: selectedOrder.customer_email,
        subject: `Your Order Has Shipped! - ${selectedOrder.order_number} | Red Helix Research`,
        body: `
Hello ${selectedOrder.customer_name || 'Valued Customer'},

Great news! Your order has been shipped and is on its way to you!

ORDER DETAILS
─────────────────────────────
Order Number: ${selectedOrder.order_number}
Status: SHIPPED

TRACKING INFORMATION
─────────────────────────────
Carrier: ${carrier}
Tracking Number: ${trackingNumber}

Track your package: ${trackingUrls[carrier] || `Search "${trackingNumber}" on ${carrier}'s website`}

SHIPPING ADDRESS
─────────────────────────────
${selectedOrder.shipping_address?.firstName || ''} ${selectedOrder.shipping_address?.lastName || ''}
${selectedOrder.shipping_address?.shippingAddress || ''}
${selectedOrder.shipping_address?.shippingCity || ''}, ${selectedOrder.shipping_address?.shippingState || ''} ${selectedOrder.shipping_address?.shippingZip || ''}

You can also track your order on our website: ${window.location.origin}/OrderTracking

Questions? Contact us on Discord: https://discord.gg/s78Jeajp

Thank you for choosing Red Helix Research!

Best regards,
Red Helix Research Team
        `.trim()
      });
      toast.success('Tracking email sent to customer');
      console.log('Tracking email sent to:', selectedOrder.customer_email);
    } catch (emailError) {
      console.error('Failed to send tracking email:', emailError);
      toast.error('Tracking updated but email failed to send');
    }

    // Mark the notification as read and update requires_tracking
    if (selectedOrder.notification_id) {
      await base44.entities.Notification.update(selectedOrder.notification_id, {
        read: true,
        requires_tracking: false
      });
      refetch();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'blockchain_confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'new_order':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'new_session':
        return <MessageSquare className="w-4 h-4 text-red-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-red-600" />;
    }
  };

  const getNotificationTitle = (notif) => {
    switch (notif.type) {
      case 'blockchain_confirmed':
        return 'Payment Confirmed on Blockchain';
      case 'new_order':
        return 'New Order Received';
      case 'new_session':
        return 'New chat session';
      default:
        return 'New message';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-lg bg-stone-900/50 border border-red-600/30 text-amber-50 hover:bg-red-600/10 hover:border-red-600/70 transition-all group"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-red-600 to-red-700 text-amber-50 text-xs font-bold rounded-full flex items-center justify-center shadow-lg border border-red-600">
            {notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-y-auto bg-stone-900/95 border border-stone-700 rounded-lg shadow-2xl z-50"
          >
            <div className="sticky top-0 bg-stone-900/95 border-b border-stone-700 p-4 flex items-center justify-between">
              <h3 className="text-amber-50 font-semibold">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-red-600 hover:text-red-500 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 text-center text-stone-400 text-sm">
                No new notifications
              </div>
            ) : (
              <div className="divide-y divide-stone-800">
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 hover:bg-stone-800/50 cursor-pointer transition-colors group ${
                      notif.type === 'blockchain_confirmed' && notif.requires_tracking
                        ? 'bg-green-900/20 border-l-4 border-green-500'
                        : ''
                    }`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-amber-50">
                          {getNotificationTitle(notif)}
                        </div>
                        {notif.order_number && (
                          <div className="text-xs text-stone-300 mt-1 font-mono">
                            Order #{notif.order_number}
                          </div>
                        )}
                        <div className="text-xs text-stone-400 mt-1">
                          From {notif.customer_name}
                        </div>
                        {notif.total_amount && (
                          <div className="text-xs text-green-400 mt-1">
                            ${notif.total_amount.toFixed(2)} {notif.crypto_currency && `(${notif.crypto_currency})`}
                          </div>
                        )}
                        {notif.message_preview && (
                          <div className="text-xs text-stone-400 mt-1 line-clamp-2">
                            {notif.message_preview}
                          </div>
                        )}
                        {notif.type === 'blockchain_confirmed' && notif.requires_tracking && (
                          <div className="mt-2 flex items-center gap-2">
                            <Truck className="w-3 h-3 text-amber-500" />
                            <span className="text-xs text-amber-500 font-semibold">
                              Click to add tracking number
                            </span>
                          </div>
                        )}
                        <div className="text-xs text-stone-500 mt-2">
                          {new Date(notif.created_date).toLocaleTimeString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-stone-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tracking Number Modal */}
      <Dialog open={trackingModalOpen} onOpenChange={setTrackingModalOpen}>
        <DialogContent className="bg-stone-900 border-stone-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-50 flex items-center gap-2">
              <Truck className="w-5 h-5 text-green-500" />
              Add Tracking Number
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-stone-400">Order Number</p>
                    <p className="text-amber-50 font-mono font-semibold">#{selectedOrder.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-400">Total</p>
                    <p className="text-green-400 font-semibold">${selectedOrder.total_amount?.toFixed(2)}</p>
                  </div>
                </div>
                <div className="border-t border-stone-700 pt-3">
                  <p className="text-xs text-stone-400 mb-1">Customer</p>
                  <p className="text-sm text-amber-50">{selectedOrder.customer_name || selectedOrder.created_by}</p>
                  {selectedOrder.shipping_address && (
                    <p className="text-xs text-stone-400 mt-1">
                      {selectedOrder.shipping_address.shippingAddress}, {selectedOrder.shipping_address.shippingCity}, {selectedOrder.shipping_address.shippingState} {selectedOrder.shipping_address.shippingZip}
                    </p>
                  )}
                </div>
              </div>

              {/* Tracking Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-stone-300 block mb-2">
                    Carrier
                  </label>
                  <Select value={carrier} onValueChange={setCarrier}>
                    <SelectTrigger className="bg-stone-800 border-stone-700 text-amber-50">
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-900 border-stone-700">
                      <SelectItem value="USPS" className="text-amber-50">USPS</SelectItem>
                      <SelectItem value="UPS" className="text-amber-50">UPS</SelectItem>
                      <SelectItem value="FedEx" className="text-amber-50">FedEx</SelectItem>
                      <SelectItem value="DHL" className="text-amber-50">DHL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-stone-300 block mb-2">
                    Tracking Number
                  </label>
                  <Input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500 font-mono"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTrackingModalOpen(false);
                    setSelectedOrder(null);
                    setTrackingNumber('');
                    setCarrier('');
                  }}
                  className="flex-1 border-stone-700 text-stone-300 hover:text-amber-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyTracking}
                  disabled={updateOrderMutation.isPending || !trackingNumber || !carrier}
                  className="flex-1 bg-green-700 hover:bg-green-600 text-amber-50 font-semibold"
                >
                  {updateOrderMutation.isPending ? 'Applying...' : 'Apply Tracking'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
