import React from 'react';
import { ExternalLink, Truck } from 'lucide-react';

export default function OrderTrackingDetails({ order }) {
  const getTrackingUrl = (carrier, trackingNumber) => {
    if (!trackingNumber) return null;
    const normalized = carrier?.toUpperCase();
    switch (normalized) {
      case 'USPS':
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
      case 'UPS':
        return `https://www.ups.com/track?tracknum=${trackingNumber}`;
      case 'FEDEX':
        return `https://tracking.fedex.com/en/tracking/${trackingNumber}`;
      case 'DHL':
        return `https://www.dhl.com/en/en/shipped.html?AWB=${trackingNumber}`;
      default:
        return null;
    }
  };

  if (!order.tracking_number) {
    return null;
  }

  const trackingUrl = getTrackingUrl(order.carrier, order.tracking_number);

  return (
    <div className="bg-purple-50 rounded-2xl p-4 mt-3 border border-purple-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-purple-600" />
            <p className="text-[10px] text-purple-700 font-black uppercase tracking-widest">Tracking</p>
          </div>
          <p className="text-sm text-slate-900 font-mono font-bold tracking-wide">{order.tracking_number}</p>
          {order.carrier && (
            <p className="text-[10px] text-slate-500 font-medium mt-1">{order.carrier}</p>
          )}
        </div>
        {trackingUrl && (
          <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-sm hover:shadow-md"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Track
          </a>
        )}
      </div>
    </div>
  );
}