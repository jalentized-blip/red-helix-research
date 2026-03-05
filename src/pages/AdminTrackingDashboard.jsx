import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Truck, Package, Search, RefreshCw, ExternalLink,
  MapPin, Clock, CheckCircle, AlertCircle, User, Mail, Hash,
  ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CARRIERS = {
  USPS: (t) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}`,
  UPS: (t) => `https://www.ups.com/track?tracknum=${t}`,
  FedEx: (t) => `https://tracking.fedex.com/en/tracking/${t}`,
  DHL: (t) => `https://www.dhl.com/en/en/shipped.html?AWB=${t}`,
};

const STATUS_COLORS = {
  delivered: 'bg-green-50 border-green-200 text-green-700',
  out_for_delivery: 'bg-blue-50 border-blue-200 text-blue-700',
  in_transit: 'bg-purple-50 border-purple-200 text-purple-700',
  exception: 'bg-red-50 border-red-200 text-red-700',
  pending: 'bg-amber-50 border-amber-200 text-amber-700',
};

const STATUS_ICONS = {
  delivered: CheckCircle,
  out_for_delivery: Truck,
  in_transit: Truck,
  exception: AlertCircle,
  pending: Clock,
};

function TrackingCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const addr = order.shipping_address || {};
  const carrierUrl = CARRIERS[order.carrier];

  const fetchTracking = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('getTrackingInfo', {
        tracking_number: order.tracking_number,
        carrier: order.carrier || 'auto-detect',
      });
      setTrackingData(res.data);
      setLoaded(true);
      setExpanded(true);
    } catch (err) {
      toast.error('Failed to fetch tracking', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!loaded) {
      fetchTracking();
    } else {
      setExpanded(!expanded);
    }
  };

  const statusColor = trackingData ? (STATUS_COLORS[trackingData.status] || STATUS_COLORS.pending) : 'bg-slate-50 border-slate-200 text-slate-500';
  const StatusIcon = trackingData ? (STATUS_ICONS[trackingData.status] || Clock) : Truck;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden hover:border-slate-200 transition-all"
    >
      {/* Card Header */}
      <div className="px-5 py-4">
        <div className="flex items-start gap-4">
          {/* Status Icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${statusColor}`}>
            <StatusIcon className="w-5 h-5" />
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-black text-slate-900 text-sm">#{order.order_number}</span>
              {order.carrier && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                  {order.carrier}
                </span>
              )}
              {trackingData && (
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${statusColor}`}>
                  {trackingData.status_description}
                </span>
              )}
            </div>

            {/* Tracking Number */}
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-sm text-slate-700 font-bold">{order.tracking_number}</span>
              {carrierUrl && (
                <a href={carrierUrl(order.tracking_number)} target="_blank" rel="noopener noreferrer"
                  className="text-[#dc2626] hover:text-[#b91c1c] transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Customer Info Row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {(order.customer_name) && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {order.customer_name}
                </span>
              )}
              {(order.customer_email || order.created_by) && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {order.customer_email || order.created_by}
                </span>
              )}
              {addr.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {addr.address}, {addr.city}, {addr.state} {addr.zip}
                </span>
              )}
            </div>

            {/* Items */}
            {order.items?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {order.items.map((item, i) => (
                  <span key={i} className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                    {item.productName || item.product_name || 'Product'} — {item.specification}
                    {item.quantity > 1 ? ` ×${item.quantity}` : ''}
                  </span>
                ))}
              </div>
            )}

            {/* Tracking Summary (when loaded) */}
            {trackingData && (
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                {trackingData.current_location && (
                  <span className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3 h-3 text-[#dc2626]" />
                    <strong>Now:</strong> {trackingData.current_location}
                  </span>
                )}
                {trackingData.estimated_delivery && (
                  <span className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <strong>Est:</strong> {format(new Date(trackingData.estimated_delivery), 'MMM dd, yyyy')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 border-slate-200 hover:border-[#dc2626] hover:text-[#dc2626] transition-all text-slate-500 flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : expanded ? (
              <><ChevronUp className="w-3.5 h-3.5" /> Hide</>
            ) : (
              <><Truck className="w-3.5 h-3.5" /> Track</>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Tracking Events */}
      <AnimatePresence>
        {expanded && trackingData?.events?.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tracking History</p>
              <div className="space-y-3">
                {trackingData.events.map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${i === 0 ? 'bg-[#dc2626]' : 'bg-slate-300'}`} />
                      {i < trackingData.events.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-sm font-bold text-slate-900">{event.description}</p>
                      <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
                        {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>}
                        {event.timestamp && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(event.timestamp), 'MMM dd, h:mm a')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdminTrackingDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', refreshKey],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  // Only orders that have a tracking number
  const trackedOrders = useMemo(() => {
    return orders.filter(o => o.tracking_number && o.tracking_number.trim() !== '');
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return trackedOrders.filter(o => {
      const statusMatch = filterStatus === 'all' || o.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const searchMatch = !q ||
        o.order_number?.toLowerCase().includes(q) ||
        o.tracking_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q) ||
        o.created_by?.toLowerCase().includes(q);
      return statusMatch && searchMatch;
    });
  }, [trackedOrders, filterStatus, searchQuery]);

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back */}
        <Link to={createPageUrl('AdminOrderManagement')}>
          <Button variant="ghost" className="mb-4 hover:bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-xs">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Button>
        </Link>

        {/* Header */}
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

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order, tracking, customer..."
              className="bg-slate-50 border-slate-200 pl-11 rounded-full h-11"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'processing', 'shipped', 'delivered'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 transition-all ${
                  filterStatus === s
                    ? 'bg-[#dc2626] border-[#dc2626] text-white'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
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
              <TrackingCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}