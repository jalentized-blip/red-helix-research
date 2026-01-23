import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function OrderTracking() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    initialData: [],
  });

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
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center text-stone-400 py-12">Loading orders...</div>
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
                className="bg-stone-900/50 border border-stone-700 rounded-lg p-6 hover:border-stone-600 transition-colors"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-stone-700">
                  <div className="flex-1">
                    <p className="text-sm text-stone-500 mb-1">Order #{order.order_number}</p>
                    <p className="text-amber-50 font-semibold">${order.total_amount.toFixed(2)}</p>
                    <p className="text-xs text-stone-400 mt-1">
                      {new Date(order.created_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="text-amber-50 font-semibold text-sm">{getStatusLabel(order.status)}</p>
                      {order.estimated_delivery && (
                        <p className="text-xs text-stone-400">
                          Est. {new Date(order.estimated_delivery).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4 pb-4 border-b border-stone-700">
                  <p className="text-xs font-semibold text-stone-400 mb-2">ITEMS</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-stone-300">
                          {item.productName} - {item.specification}
                        </span>
                        <span className="text-stone-400">
                          {item.quantity}x ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking Info */}
                {order.tracking_number && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-stone-400 mb-2">TRACKING</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-stone-300 font-mono">{order.tracking_number}</p>
                        <p className="text-xs text-stone-500">{order.carrier}</p>
                      </div>
                      {order.carrier && getTrackingUrl(order.carrier, order.tracking_number) && (
                        <a
                          href={getTrackingUrl(order.carrier, order.tracking_number)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-red-600 hover:text-red-500 text-xs font-semibold rounded transition-colors"
                        >
                          Track
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Date */}
                {order.delivered_date && (
                  <div className="bg-green-900/20 border border-green-700/30 rounded p-3">
                    <p className="text-xs font-semibold text-green-400">
                      Delivered on {new Date(order.delivered_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}