import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Package, MapPin, Clock, CheckCircle2, AlertCircle, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderTrackingDetails({ order }) {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (order.tracking_number) {
      fetchTrackingInfo();
      
      // Poll for updates every 60 seconds
      const interval = setInterval(() => {
        fetchTrackingInfo();
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [order.tracking_number]);

  const fetchTrackingInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await base44.functions.invoke('getTrackingInfo', {
        tracking_number: order.tracking_number,
        carrier: order.carrier
      });
      
      setTrackingData(response.data);
    } catch (err) {
      console.error('Failed to fetch tracking:', err);
      setError('Unable to fetch tracking details');
    } finally {
      setLoading(false);
    }
  };

  if (!order.tracking_number) {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'out_for_delivery':
      case 'out for delivery':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'in_transit':
      case 'in transit':
        return <Package className="w-5 h-5 text-yellow-500" />;
      case 'exception':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-stone-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-900/30 border-green-600/30 text-green-400';
      case 'out_for_delivery':
      case 'out for delivery':
        return 'bg-blue-900/30 border-blue-600/30 text-blue-400';
      case 'in_transit':
      case 'in transit':
        return 'bg-yellow-900/30 border-yellow-600/30 text-yellow-400';
      case 'exception':
        return 'bg-red-900/30 border-red-600/30 text-red-400';
      default:
        return 'bg-stone-800/50 border-stone-700 text-stone-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-stone-800/50 rounded-lg p-4 mt-3">
        <div className="flex items-center gap-3 justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-red-600" />
          <span className="text-stone-400 text-sm">Loading tracking details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-stone-800/50 rounded-lg p-4 mt-3">
        <div className="flex items-center gap-2 text-stone-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchTrackingInfo}
          className="text-xs text-red-600 hover:text-red-500 underline mt-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="bg-stone-800/50 rounded-lg p-4 mt-3">
        <p className="text-sm text-stone-400 mb-2">
          <strong>Tracking:</strong> {order.tracking_number}
        </p>
        {order.carrier && (
          <p className="text-xs text-stone-500">Carrier: {order.carrier}</p>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 space-y-3"
    >
      {/* Status Card */}
      <div className={`rounded-lg p-4 border ${getStatusColor(trackingData.status)}`}>
        <div className="flex items-center gap-3 mb-2">
          {getStatusIcon(trackingData.status)}
          <div className="flex-1">
            <p className="font-semibold text-sm">{trackingData.status_description}</p>
            {trackingData.current_location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 opacity-70" />
                <p className="text-xs opacity-80">{trackingData.current_location}</p>
              </div>
            )}
          </div>
        </div>
        
        {trackingData.estimated_delivery && (
          <p className="text-xs opacity-80 mt-2">
            <strong>Estimated Delivery:</strong> {new Date(trackingData.estimated_delivery).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        )}

        {trackingData.delivered_date && (
          <p className="text-xs opacity-80 mt-2">
            <strong>Delivered:</strong> {new Date(trackingData.delivered_date).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        )}
      </div>

      {/* Tracking Events Timeline */}
      {trackingData.events && trackingData.events.length > 0 && (
        <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
          <h4 className="text-sm font-semibold text-amber-50 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Tracking History
          </h4>
          <div className="space-y-3">
            {trackingData.events.map((event, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex gap-3 relative"
              >
                {idx < trackingData.events.length - 1 && (
                  <div className="absolute left-1.5 top-6 bottom-0 w-0.5 bg-stone-700" />
                )}
                <div className="w-3 h-3 rounded-full bg-red-600 mt-1 relative z-10 flex-shrink-0" />
                <div className="flex-1 pb-3">
                  <p className="text-sm text-amber-50">{event.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                    <span>{new Date(event.timestamp).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}</span>
                    {event.location && (
                      <>
                        <span>•</span>
                        <span>{event.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tracking Number */}
      <div className="bg-stone-800/30 rounded-lg p-3 border border-stone-700">
        <p className="text-xs text-stone-500 mb-1">Tracking Number</p>
        <p className="text-sm text-amber-50 font-mono">{order.tracking_number}</p>
        {order.carrier && (
          <p className="text-xs text-stone-500 mt-1">Carrier: {order.carrier}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        {trackingData.last_update && (
          <p className="text-xs text-stone-500">
            Last updated: {new Date(trackingData.last_update).toLocaleString()}
          </p>
        )}
        <button
          onClick={fetchTrackingInfo}
          disabled={loading}
          className="text-xs text-red-600 hover:text-red-500 underline disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </motion.div>
  );
}