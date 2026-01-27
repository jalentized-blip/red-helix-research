import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, Bell, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function OrderTracking() {
  const queryClient = useQueryClient();
  const [trackingUpdate, setTrackingUpdate] = useState(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    initialData: [],
  });

  // Subscribe to real-time order updates
  useEffect(() => {
    const unsubscribe = base44.entities.Order.subscribe((event) => {
      // Check if this update is relevant (has tracking info added)
      if (event.type === 'update' && event.data?.tracking_number) {
        // Refetch orders to get the latest data
        queryClient.invalidateQueries({ queryKey: ['orders'] });

        // Show a toast notification for the tracking update
        setTrackingUpdate({
          orderNumber: event.data.order_number,
          trackingNumber: event.data.tracking_number,
          carrier: event.data.carrier
        });

        toast.success(
          `Tracking updated for order #${event.data.order_number}`,
          {
            description: `Carrier: ${event.data.carrier} - ${event.data.tracking_number}`,
            duration: 8000,
          }
        );
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-stone-400" />;
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-900/20 border-amber-600/30 text-amber-400';
      case 'processing':
        return 'bg-blue-900/20 border-blue-600/30 text-blue-400';
      case 'shipped':
        return 'bg-purple-900/20 border-purple-600/30 text-purple-400';
      case 'delivered':
        return 'bg-green-900/20 border-green-600/30 text-green-400';
      default:
        return 'bg-stone-800/50 border-stone-600/30 text-stone-400';
    }
  };

  const getTrackingUrl = (carrier, trackingNumber) => {
    const urls = {
      USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
      UPS: `https://www.ups.com/track?tracknum=${trackingNumber}`,
      FedEx: `https://tracking.fedex.com/en/tracking/${trackingNumber}`,
      DHL: `https://www.dhl.com/en/en/shipped.html?AWB=${trackingNumber}`,
    };
    return urls[carrier] || null;
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Account')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Account
          </Link>
          <h1 className="text-4xl font-black text-amber-50">Order Tracking</h1>
          <p className="text-stone-400 mt-2">Track your orders in real-time</p>
        </div>

        {/* Real-time Update Banner */}
        <AnimatePresence>
          {trackingUpdate && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-900/30 border border-green-600/50 rounded-lg p-4 flex items-center gap-3"
            >
              <div className="flex-shrink-0">
                <Bell className="w-5 h-5 text-green-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-green-400 font-semibold text-sm">
                  Tracking Update Received!
                </p>
                <p className="text-stone-300 text-xs mt-1">
                  Order #{trackingUpdate.orderNumber} - {trackingUpdate.carrier}: {trackingUpdate.trackingNumber}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTrackingUpdate(null)}
                className="text-stone-400 hover:text-stone-300"
              >
                Dismiss
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center text-stone-400 py-12">
            <div className="w-8 h-8 border-4 border-stone-600 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-12 text-center">
            <Package className="w-12 h-12 text-stone-600 mx-auto mb-4" />
            <p className="text-stone-300 mb-6">No orders yet</p>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-red-700 hover:bg-red-600 text-amber-50">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-stone-900/50 border rounded-lg p-6 transition-all ${
                  trackingUpdate?.orderNumber === order.order_number
                    ? 'border-green-500 ring-2 ring-green-500/20'
                    : 'border-stone-700 hover:border-stone-600'
                }`}
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-stone-700">
                  <div className="flex-1">
                    <p className="text-sm text-stone-500 mb-1">Order #{order.order_number}</p>
                    <p className="text-amber-50 font-semibold">${order.total_amount?.toFixed(2)}</p>
                    <p className="text-xs text-stone-400 mt-1">
                      {new Date(order.created_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-semibold">{getStatusLabel(order.status)}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4 pb-4 border-b border-stone-700">
                  <p className="text-xs font-semibold text-stone-400 mb-2">ITEMS</p>
                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-stone-300">
                          {item.productName} - {item.specification}
                        </span>
                        <span className="text-stone-400">
                          {item.quantity}x ${item.price?.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking Info */}
                {order.tracking_number ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 bg-purple-900/20 border border-purple-600/30 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="w-4 h-4 text-purple-400" />
                      <p className="text-xs font-semibold text-purple-400 uppercase">Tracking Information</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-lg text-amber-50 font-mono font-semibold">{order.tracking_number}</p>
                        <p className="text-sm text-stone-400 mt-1">
                          Carrier: <span className="text-purple-400 font-semibold">{order.carrier}</span>
                        </p>
                      </div>
                      {order.carrier && getTrackingUrl(order.carrier, order.tracking_number) && (
                        <a
                          href={getTrackingUrl(order.carrier, order.tracking_number)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-amber-50 text-sm font-semibold rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Track Package
                        </a>
                      )}
                    </div>
                    {order.estimated_delivery && (
                      <p className="text-xs text-stone-400 mt-3">
                        Estimated delivery: {new Date(order.estimated_delivery).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </motion.div>
                ) : order.status === 'processing' ? (
                  <div className="mb-4 bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <p className="text-sm text-blue-400">
                        Your order is being processed. Tracking information will appear here automatically once shipped.
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Delivery Date */}
                {order.delivered_date && (
                  <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <p className="text-sm font-semibold text-green-400">
                        Delivered on {new Date(order.delivered_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Real-time indicator */}
        <div className="mt-8 flex items-center justify-center gap-2 text-stone-500 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates enabled - tracking info will appear automatically</span>
        </div>
      </div>
    </div>
  );
}
