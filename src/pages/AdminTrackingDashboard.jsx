import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Truck, Package, Search, RefreshCw,
  MapPin, Clock, CheckCircle, AlertCircle, User, Mail, Hash, CreditCard, Loader2, Copy, X, Map
} from 'lucide-react';
import ShipmentMap from '@/components/admin/ShipmentMap';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CARRIER_TRACK_URL = {
  USPS: (t) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}`,
  UPS: (t) => `https://www.ups.com/track?tracknum=${t}`,
  FedEx: (t) => `https://www.fedex.com/fedextrack/?tracknumbers=${t}`,
  DHL: (t) => `https://www.dhl.com/en/express/tracking.html?AWB=${t}`,
};

const ORDER_STATUS_CONFIG = {
  awaiting_payment: { color: 'bg-orange-50 border-orange-200 text-orange-700', icon: CreditCard, label: 'Awaiting Payment' },
  pending: { color: 'bg-amber-50 border-amber-200 text-amber-700', icon: Clock, label: 'Pending' },
  processing: { color: 'bg-blue-50 border-blue-200 text-blue-700', icon: Package, label: 'Processing' },
  shipped: { color: 'bg-purple-50 border-purple-200 text-purple-700', icon: Truck, label: 'Shipped' },
  delivered: { color: 'bg-green-50 border-green-200 text-green-700', icon: CheckCircle, label: 'Delivered' },
  cancelled: { color: 'bg-red-50 border-red-200 text-red-700', icon: AlertCircle, label: 'Cancelled' },
};

function TrackingIframeModal({ order, onClose }) {
  const carrierUrl = CARRIER_TRACK_URL[order.carrier];
  const url = carrierUrl ? carrierUrl(order.tracking_number) : null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden" style={{ height: '80vh' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <p className="font-black text-slate-900 text-sm">Tracking #{order.tracking_number}</p>
            <p className="text-xs text-slate-400 font-medium">{order.carrier} — Order #{order.order_number} — {order.customer_name || order.customer_email || order.created_by}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        {url ? (
          <iframe
            src={url}
            className="flex-1 w-full border-0"
            title={`Tracking ${order.tracking_number}`}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-bold">
            No tracking URL available for this carrier.
          </div>
        )}
      </div>
    </div>
  );
}

function TrackingCard({ order, onViewTracking }) {
  const addr = order.shipping_address || {};
  const statusCfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  const copyTracking = () => {
    navigator.clipboard.writeText(order.tracking_number);
    toast.success('Tracking number copied');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 hover:border-slate-200 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${statusCfg.color}`}>
          <StatusIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-black text-slate-900 text-sm">#{order.order_number}</span>
            <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
            {order.carrier && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                {order.carrier}
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-medium">
              {format(new Date(order.created_date), 'MMM dd, yyyy')}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Hash className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-mono text-sm text-slate-800 font-bold">{order.tracking_number}</span>
            <button onClick={copyTracking} className="text-slate-400 hover:text-slate-600 transition-colors">
              <Copy className="w-3.5 h-3.5" />
            </button>
            {order.carrier && (
              <button
                onClick={() => onViewTracking(order)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#dc2626] text-white hover:bg-[#b91c1c] transition-colors"
              >
                <Truck className="w-3 h-3" />
                Track on {order.carrier}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-2">
            {order.customer_name && (
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{order.customer_name}</span>
            )}
            {(order.customer_email || order.created_by) && (
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{order.customer_email || order.created_by}</span>
            )}
            {addr.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {[addr.address, addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}
              </span>
            )}
          </div>

          {order.items?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {order.items.map((item, i) => (
                <span key={i} className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                  {item.productName || item.product_name || 'Product'}
                  {item.specification ? ` — ${item.specification}` : ''}
                  {item.quantity > 1 ? ` ×${item.quantity}` : ''}
                </span>
              ))}
            </div>
          )}

          {order.estimated_delivery && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600">
              <Clock className="w-3 h-3" />
              <span className="font-bold">Est. Delivery:</span>
              {format(new Date(order.estimated_delivery), 'MMM dd, yyyy')}
            </div>
          )}
          {order.delivered_date && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-green-600">
              <CheckCircle className="w-3 h-3" />
              <span className="font-bold">Delivered:</span>
              {format(new Date(order.delivered_date), 'MMM dd, yyyy')}
            </div>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-[#dc2626] font-black text-sm">${order.total_amount?.toFixed(2)}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminTrackingDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [trackingModal, setTrackingModal] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', refreshKey],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  const trackedOrders = useMemo(() =>
    orders.filter(o => o.tracking_number?.trim()),
  [orders]);

  const filteredOrders = useMemo(() => {
    return trackedOrders.filter(o => {
      const statusMatch = filterStatus === 'all' || o.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const searchMatch = !q ||
        o.order_number?.toLowerCase().includes(q) ||
        o.tracking_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        (o.customer_email || o.created_by || '').toLowerCase().includes(q);
      return statusMatch && searchMatch;
    });
  }, [trackedOrders, filterStatus, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts = {};
    trackedOrders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, [trackedOrders]);

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('AdminOrderManagement')}>
          <Button variant="ghost" className="mb-4 hover:bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-xs">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Button>
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">
              Tracking <span className="text-[#dc2626]">Hub</span>
            </h1>
            <p className="text-slate-500 font-medium">
              {trackedOrders.length} shipment{trackedOrders.length !== 1 ? 's' : ''} with tracking numbers
            </p>
          </div>
          <Button
            onClick={() => setRefreshKey(k => k + 1)}
            variant="outline"
            className="border-slate-200 text-slate-500 hover:text-slate-900 rounded-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 transition-all ${
              filterStatus === 'all' ? 'bg-[#dc2626] border-[#dc2626] text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            All ({trackedOrders.length})
          </button>
          {Object.entries(ORDER_STATUS_CONFIG).map(([status, cfg]) => {
            const count = statusCounts[status] || 0;
            if (count === 0) return null;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 transition-all ${
                  filterStatus === status ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Shipment Map */}
        {!isLoading && orders.filter(o => o.status === 'shipped' && o.tracking_number).length > 0 && (
          <div className="mb-8">
            <ShipmentMap orders={orders} />
          </div>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, tracking number, customer name or email..."
            className="bg-slate-50 border-slate-200 pl-11 rounded-full h-11"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-[#dc2626] mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading shipments...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
              {trackedOrders.length === 0 ? 'No orders with tracking numbers yet' : 'No results found'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => (
              <TrackingCard key={order.id} order={order} onViewTracking={setTrackingModal} />
            ))}
          </div>
        )}
      </div>

      {trackingModal && (
        <TrackingIframeModal order={trackingModal} onClose={() => setTrackingModal(null)} />
      )}
    </div>
  );
}