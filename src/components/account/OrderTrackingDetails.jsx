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

  if (!order.tracking_number || order.status === 'delivered') {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'out_for_delivery':
      case 'out for delivery':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'in_transit':
      case 'in transit':
        return <Package className="w-5 h-5 text-[#dc2626]" />;
      case 'exception':
        return <AlertCircle className="w-5 h-5 text-[#dc2626]" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-50 border-green-100 text-green-700';
      case 'out_for_delivery':
      case 'out for delivery':
        return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'in_transit':
      case 'in transit':
        return 'bg-[#dc2626] border-[#dc2626] text-white';
      case 'exception':
        return 'bg-[#dc2626] border-[#dc2626] text-white';
      default:
        return 'bg-slate-50 border-slate-100 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 rounded-2xl p-6 mt-3 border border-slate-100">
        <div className="flex items-center gap-3 justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-[#dc2626]" />
          <span className="text-slate-500 text-sm font-medium">Loading tracking details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#dc2626] rounded-2xl p-6 mt-3 border border-[#dc2626]">
        <div className="flex items-center gap-2 text-white text-sm font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchTrackingInfo}
          className="text-xs text-white hover:text-red-100 font-black uppercase tracking-widest mt-3 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="bg-slate-50 rounded-2xl p-6 mt-3 border border-slate-100">
        <p className="text-sm text-slate-900 mb-2 font-bold">
          <strong>Tracking:</strong> {order.tracking_number}
        </p>
        {order.carrier && (
          <p className="text-xs text-slate-500 font-medium">Carrier: {order.carrier}</p>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-4"
    >
      {/* Status Card */}
      <div className={`rounded-2xl p-6 border ${getStatusColor(trackingData.status)} shadow-sm`}>
        <div className="flex items-center gap-4 mb-3">
          {getStatusIcon(trackingData.status)}
          <div className="flex-1">
            <p className="font-black text-sm uppercase tracking-tight">{trackingData.status_description}</p>
            {trackingData.current_location && (
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-3 h-3 opacity-70" />
                <p className="text-xs font-medium opacity-80">{trackingData.current_location}</p>
              </div>
            )}
          </div>
        </div>
        
        {trackingData.estimated_delivery && (
          <p className="text-xs font-bold opacity-80 mt-3 pt-3 border-t border-current/10">
            <strong>ESTIMATED DELIVERY:</strong> {new Date(trackingData.estimated_delivery).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }).toUpperCase()}
          </p>
        )}

        {trackingData.delivered_date && (
          <p className="text-xs font-bold opacity-80 mt-3 pt-3 border-t border-current/10">
            <strong>DELIVERED:</strong> {new Date(trackingData.delivered_date).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }).toUpperCase()}
          </p>
        )}
      </div>

      {/* Tracking Events Timeline */}
      {trackingData.events && trackingData.events.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h4 className="text-xs font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Clock className="w-4 h-4 text-[#dc2626]" />
            Tracking History
          </h4>
          <div className="space-y-6">
            {trackingData.events.map((event, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex gap-4 relative"
              >
                {idx < trackingData.events.length - 1 && (
                  <div className="absolute left-[7px] top-6 bottom-[-24px] w-0.5 bg-slate-100" />
                )}
                <div className="w-4 h-4 rounded-full border-4 border-white bg-[#dc2626] mt-0.5 shadow-sm relative z-10 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-slate-900 font-bold tracking-tight">{event.description}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>{new Date(event.timestamp).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}</span>
                    {event.location && (
                      <>
                        <span className="opacity-30">•</span>
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
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tracking Number</p>
          {order.carrier && (
            <p className="text-[10px] text-white font-black uppercase tracking-widest bg-[#dc2626] px-2 py-0.5 rounded">{order.carrier}</p>
          )}
        </div>
        <p className="text-sm text-slate-900 font-mono font-bold tracking-wider">{order.tracking_number}</p>
      </div>

      <div className="flex items-center justify-between px-2">
        {trackingData.last_update && (
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Updated: {new Date(trackingData.last_update).toLocaleTimeString()}
          </p>
        )}
        <button
          onClick={fetchTrackingInfo}
          disabled={loading}
          className="text-[10px] text-[#dc2626] hover:text-[#b91c1c] font-black uppercase tracking-widest underline disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>
    </motion.div>
  );
}