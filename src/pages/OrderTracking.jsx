import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, Bell, ExternalLink, Mail, Loader2 } from 'lucide-react';
import { resendOrderConfirmationEmail } from '@/components/utils/resendOrderEmail';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function OrderTracking() {
  const queryClient = useQueryClient();
  const [trackingUpdate, setTrackingUpdate] = useState(null);
  const [resendingOrderId, setResendingOrderId] = useState(null);

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
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'processing':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-600" />;
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'processing':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'shipped':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'delivered':
        return 'bg-green-50 border-green-200 text-green-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-500';
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
    <div className="min-h-screen bg-white pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Account')} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#dc2626] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Account
          </Link>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Order Tracking</h1>
          <p className="text-slate-500 mt-2 font-medium">Track your orders in real-time</p>
        </div>

        {/* Real-time Update Banner */}
        <AnimatePresence>
          {trackingUpdate && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm"
            >
              <div className="flex-shrink-0">
                <Bell className="w-5 h-5 text-green-600 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-green-800 font-bold text-sm">
                  Tracking Update Received!
                </p>
                <p className="text-green-700 text-xs mt-1 font-medium">
                  Order #{trackingUpdate.orderNumber} - {trackingUpdate.carrier}: {trackingUpdate.trackingNumber}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTrackingUpdate(null)}
                className="text-green-700 hover:text-green-900 hover:bg-green-100 rounded-full"
              >
                Dismiss
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center text-slate-400 py-12">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-12 text-center">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 mb-6 font-medium">No orders yet</p>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-[#dc2626] hover:bg-red-700 text-white rounded-full px-8 py-6 font-bold uppercase tracking-wider shadow-lg shadow-red-200">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white border rounded-[24px] p-6 transition-all shadow-sm hover:shadow-md ${
                  trackingUpdate?.orderNumber === order.order_number
                    ? 'border-green-500 ring-2 ring-green-100'
                    : 'border-slate-200 hover:border-red-200'
                }`}
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-6 border-b border-slate-100 gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Order #{order.order_number}</p>
                      <span className="text-slate-300">|</span>
                      <p className="text-xs text-slate-400 font-medium">
                        {new Date(order.created_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <p className="text-2xl font-black text-slate-900">${order.total_amount?.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-bold uppercase tracking-wide">{getStatusLabel(order.status)}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Items</p>
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-700 font-medium">
                          {item.productName} <span className="text-slate-400 text-xs ml-1">{item.specification}</span>
                        </span>
                        <span className="text-slate-900 font-bold">
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
                    className="mb-4 bg-purple-50 border border-purple-100 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="w-4 h-4 text-purple-600" />
                      <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Tracking Information</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-lg text-slate-900 font-mono font-bold tracking-tight">{order.tracking_number}</p>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                          Carrier: <span className="text-purple-700 font-bold">{order.carrier}</span>
                        </p>
                      </div>
                      {order.carrier && getTrackingUrl(order.carrier, order.tracking_number) && (
                        <a
                          href={getTrackingUrl(order.carrier, order.tracking_number)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Track Package
                        </a>
                      )}
                    </div>
                    {order.estimated_delivery && (
                      <p className="text-xs text-slate-400 mt-3 font-medium border-t border-purple-100 pt-3">
                        Estimated delivery: {new Date(order.estimated_delivery).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </motion.div>
                ) : order.status === 'processing' ? (
                  <div className="mb-4 bg-blue-50 border border-blue-100 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-200"></div>
                      <p className="text-sm text-blue-700 font-medium">
                        Your order is being processed. Tracking information will appear here automatically once shipped.
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Delivery Date */}
                {order.delivered_date && (
                  <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-bold text-green-800">
                        Delivered on {new Date(order.delivered_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Resend Confirmation Email */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    disabled={resendingOrderId === order.id}
                    onClick={async () => {
                      setResendingOrderId(order.id);
                      try {
                        await resendOrderConfirmationEmail(base44, order);
                        toast.success('Confirmation email resent!', {
                          description: `Sent to ${order.customer_email}`,
                          duration: 5000,
                        });
                      } catch (error) {
                        console.error('Failed to resend email:', error);
                        toast.error('Failed to resend email', {
                          description: 'Please contact support if the issue persists.',
                          duration: 5000,
                        });
                      } finally {
                        setResendingOrderId(null);
                      }
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter text-[#dc2626] hover:text-red-500 underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendingOrderId === order.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Mail className="w-3 h-3" />
                    )}
                    {resendingOrderId === order.id ? 'Sending...' : 'Resend Confirmation Email'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Real-time indicator */}
        <div className="mt-12 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wide">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-200"></div>
          <span>Live updates enabled</span>
        </div>
      </div>
    </div>
  );
}
