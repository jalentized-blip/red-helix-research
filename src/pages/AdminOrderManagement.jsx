import React, { useState, useEffect, useRef, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  ArrowLeft, Package, User, MapPin, Truck, Calendar, DollarSign, CheckCircle,
  Clock, AlertCircle, Search, X, ChevronDown, ChevronUp, Printer, Mail,
  Download, RefreshCw, Edit3, Save, FileText, BarChart2, Hash, CreditCard,
  Globe, Phone, Copy, ExternalLink, Filter, ArrowUpDown, Receipt, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CARRIERS = [
  { id: 'USPS', label: 'USPS', trackUrl: (t) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}` },
  { id: 'UPS', label: 'UPS', trackUrl: (t) => `https://www.ups.com/track?tracknum=${t}` },
  { id: 'FedEx', label: 'FedEx', trackUrl: (t) => `https://tracking.fedex.com/en/tracking/${t}` },
  { id: 'DHL', label: 'DHL', trackUrl: (t) => `https://www.dhl.com/en/en/shipped.html?AWB=${t}` },
];

const STATUS_CONFIG = {
  pending: { color: 'bg-amber-50 border-amber-200 text-amber-700', icon: Clock, label: 'Pending' },
  processing: { color: 'bg-blue-50 border-blue-200 text-blue-700', icon: Package, label: 'Processing' },
  shipped: { color: 'bg-purple-50 border-purple-200 text-purple-700', icon: Truck, label: 'Shipped' },
  delivered: { color: 'bg-green-50 border-green-200 text-green-700', icon: CheckCircle, label: 'Delivered' },
  cancelled: { color: 'bg-red-50 border-red-200 text-red-700', icon: AlertCircle, label: 'Cancelled' },
};

// ─── Resolve product name from order item using multiple strategies ───
const resolveProductName = (item, products = [], productMap = {}) => {
  // 1. Already has name stored on the item
  if (item.productName) return item.productName;
  if (item.product_name) return item.product_name;

  // 2. Lookup by product ID
  const byId = productMap[item.product_id] || productMap[item.productId];
  if (byId) return byId;

  // 3. Exact spec name + price match
  const specLower = item.specification?.toLowerCase().trim() || '';
  const itemPrice = Number(item.price) || 0;

  for (const p of products) {
    const match = p.specifications?.find(s =>
      s.name?.toLowerCase().trim() === specLower &&
      Math.abs(Number(s.price) - itemPrice) < 0.01
    );
    if (match) return p.name;
  }

  // 4. Partial spec name match + price (e.g. "30mg single vial" contains "30mg")
  for (const p of products) {
    const match = p.specifications?.find(s => {
      const sNameLower = s.name?.toLowerCase().trim() || '';
      return (specLower.includes(sNameLower) || sNameLower.includes(specLower)) &&
             sNameLower.length > 0 &&
             Math.abs(Number(s.price) - itemPrice) < 0.01;
    });
    if (match) return p.name;
  }

  // 5. Price-only match (last resort — find the only product with this exact price)
  const priceMatches = [];
  for (const p of products) {
    const match = p.specifications?.find(s => Math.abs(Number(s.price) - itemPrice) < 0.01);
    if (match) priceMatches.push(p.name);
  }
  if (priceMatches.length === 1) return priceMatches[0];

  return null;
};

// ─── Shipping Label Component ───
function ShippingLabel({ order, carrier }) {
  const labelRef = useRef(null);
  const carrierInfo = CARRIERS.find(c => c.id === carrier) || CARRIERS[0];
  const addr = order.shipping_address || {};

  const handlePrint = () => {
    const content = labelRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank', 'width=450,height=650');
    printWindow.document.write(`
      <html><head><title>Shipping Label - ${order.order_number}</title>
      <style>
        @page { size: 4in 6in; margin: 0; }
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; }
        .label { width: 4in; height: 6in; padding: 0.3in; box-sizing: border-box; border: 2px solid #000; display: flex; flex-direction: column; }
        .carrier-bar { background: #000; color: #fff; text-align: center; padding: 8px; font-weight: 900; font-size: 18px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
        .section { margin-bottom: 10px; }
        .section-title { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 2px; }
        .from-addr { font-size: 10px; line-height: 1.4; }
        .to-addr { font-size: 14px; font-weight: 700; line-height: 1.5; border: 2px solid #000; padding: 10px; }
        .barcode { text-align: center; font-family: monospace; font-size: 14px; letter-spacing: 3px; padding: 12px; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; margin-top: auto; }
        .order-ref { text-align: center; font-size: 9px; color: #666; margin-top: 6px; }
        .weight { font-size: 11px; text-align: right; margin-top: 6px; }
        .divider { border-top: 1px dashed #ccc; margin: 8px 0; }
      </style></head><body>
      <div class="label">
        <div class="carrier-bar">${carrierInfo.id} ${carrierInfo.id === 'USPS' ? 'PRIORITY MAIL' : carrierInfo.id === 'UPS' ? 'GROUND' : carrierInfo.id === 'FedEx' ? 'HOME DELIVERY' : 'EXPRESS'}</div>
        <div class="section">
          <div class="section-title">From</div>
          <div class="from-addr">Red Helix Research<br/>USA</div>
        </div>
        <div class="divider"></div>
        <div class="section">
          <div class="section-title">Ship To</div>
          <div class="to-addr">
            ${order.customer_name || 'Customer'}<br/>
            ${addr.address || addr.shippingAddress || ''}<br/>
            ${addr.city || addr.shippingCity || ''}, ${addr.state || addr.shippingState || ''} ${addr.zip || addr.shippingZip || ''}<br/>
            ${addr.country || 'USA'}
          </div>
        </div>
        ${order.customer_phone ? `<div style="font-size:10px;margin-top:4px;">Phone: ${order.customer_phone}</div>` : ''}
        <div class="weight">Weight: _____ lbs</div>
        <div class="barcode">${order.tracking_number || 'NO TRACKING ASSIGNED'}</div>
        <div class="order-ref">Order: ${order.order_number} | ${format(new Date(order.created_date), 'MM/dd/yyyy')}</div>
      </div>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 300);
  };

  return (
    <div>
      <div ref={labelRef} className="bg-white border-2 border-slate-900 rounded-xl p-4 text-sm max-w-xs mx-auto">
        <div className="bg-slate-900 text-white text-center py-1.5 rounded-lg font-black text-xs uppercase tracking-widest mb-3">
          {carrierInfo.id} {carrierInfo.id === 'USPS' ? 'Priority Mail' : carrierInfo.id === 'UPS' ? 'Ground' : carrierInfo.id === 'FedEx' ? 'Home Delivery' : 'Express'}
        </div>
        <div className="mb-2">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">From</p>
          <p className="text-xs text-slate-600">Red Helix Research, USA</p>
        </div>
        <div className="border-t border-dashed border-slate-200 my-2" />
        <div className="mb-2">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Ship To</p>
          <p className="font-black text-slate-900 text-sm">{order.customer_name || 'Customer'}</p>
          <p className="text-xs text-slate-700">{addr.address || addr.shippingAddress || '—'}</p>
          <p className="text-xs text-slate-700">{addr.city || addr.shippingCity || ''}, {addr.state || addr.shippingState || ''} {addr.zip || addr.shippingZip || ''}</p>
        </div>
        <div className="border-t border-slate-200 pt-2 mt-2 text-center">
          <p className="font-mono text-xs tracking-widest text-slate-900 font-bold">{order.tracking_number || '—'}</p>
          <p className="text-[9px] text-slate-400 mt-1">{order.order_number}</p>
        </div>
      </div>
      <Button onClick={handlePrint} className="w-full mt-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-full">
        <Printer className="w-3.5 h-3.5 mr-2" />
        Print Label
      </Button>
    </div>
  );
}

// ─── Order Detail Editor ───
function OrderDetailEditor({ order, onSave, onClose, isSaving, productMap = {}, products = [] }) {
  const [form, setForm] = useState({
    status: order.status || 'pending',
    tracking_number: order.tracking_number || '',
    carrier: order.carrier || 'USPS',
    customer_name: order.customer_name || '',
    customer_email: order.customer_email || order.created_by || '',
    customer_phone: order.customer_phone || '',
    shipping_address: order.shipping_address?.address || order.shipping_address?.shippingAddress || '',
    shipping_city: order.shipping_address?.city || order.shipping_address?.shippingCity || '',
    shipping_state: order.shipping_address?.state || order.shipping_address?.shippingState || '',
    shipping_zip: order.shipping_address?.zip || order.shipping_address?.shippingZip || '',
    shipping_country: order.shipping_address?.country || 'USA',
    admin_notes: order.admin_notes || '',
    estimated_delivery: order.estimated_delivery ? format(new Date(order.estimated_delivery), 'yyyy-MM-dd') : '',
  });
  const [labelCarrier, setLabelCarrier] = useState(form.carrier || 'USPS');
  const [showLabel, setShowLabel] = useState(false);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    const updates = {
      status: form.status,
      tracking_number: form.tracking_number,
      carrier: form.carrier,
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone,
      admin_notes: form.admin_notes,
      shipping_address: {
        address: form.shipping_address,
        city: form.shipping_city,
        state: form.shipping_state,
        zip: form.shipping_zip,
        country: form.shipping_country,
      },
    };
    if (form.estimated_delivery) {
      updates.estimated_delivery = new Date(form.estimated_delivery).toISOString();
    }
    if (form.status === 'delivered' && !order.delivered_date) {
      updates.delivered_date = new Date().toISOString();
    }
    onSave(order.id, updates);
  };

  const handleSendTrackingEmail = async () => {
    if (!form.tracking_number || !form.customer_email) {
      toast.error('Need tracking number and email');
      return;
    }
    try {
      const carrierInfo = CARRIERS.find(c => c.id === form.carrier);
      const trackingLink = carrierInfo ? carrierInfo.trackUrl(form.tracking_number) : '';
      await base44.integrations.Core.SendEmail({
        to: form.customer_email,
        subject: `Your Order ${order.order_number} Has Shipped!`,
        body: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;">
            <h2 style="color:#dc2626;margin-bottom:20px;">Your Order Has Shipped!</h2>
            <p>Hi ${form.customer_name || 'there'},</p>
            <p>Great news! Your order <strong>${order.order_number}</strong> has been shipped.</p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
              <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Tracking Number</p>
              <p style="margin:0;font-size:18px;font-weight:700;font-family:monospace;">${form.tracking_number}</p>
              <p style="margin:8px 0 0;font-size:13px;color:#64748b;">Carrier: ${form.carrier}</p>
              ${trackingLink ? `<a href="${trackingLink}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;">Track Your Package</a>` : ''}
            </div>
            <p style="color:#64748b;font-size:13px;">Thank you for choosing Red Helix Research!</p>
          </div>
        `,
      });
      toast.success('Tracking email sent', { description: `Sent to ${form.customer_email}` });
    } catch (err) {
      toast.error('Failed to send email', { description: err.message });
    }
  };

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(form.tracking_number);
    toast.success('Tracking number copied');
  };

  const labelOrder = {
    ...order,
    customer_name: form.customer_name,
    customer_phone: form.customer_phone,
    tracking_number: form.tracking_number,
    shipping_address: {
      address: form.shipping_address,
      city: form.shipping_city,
      state: form.shipping_state,
      zip: form.shipping_zip,
      country: form.shipping_country,
    },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-[#dc2626]" />
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Order #{order.order_number}
          </h3>
          <span className={`${STATUS_CONFIG[order.status]?.color} px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border`}>
            {order.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="border-slate-200 text-slate-500 hover:text-slate-900">
            <X className="w-4 h-4 mr-1" /> Close
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold shadow-lg shadow-[#dc2626]/20">
            <Save className="w-4 h-4 mr-1" /> {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Status & Shipping */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Tracking Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-400 text-[10px] uppercase tracking-widest font-black block mb-1.5">Order Status</label>
                <Select value={form.status} onValueChange={(v) => updateField('status', v)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="pending" className="text-slate-900">Pending</SelectItem>
                    <SelectItem value="processing" className="text-slate-900">Processing</SelectItem>
                    <SelectItem value="shipped" className="text-slate-900">Shipped</SelectItem>
                    <SelectItem value="delivered" className="text-slate-900">Delivered</SelectItem>
                    <SelectItem value="cancelled" className="text-red-600">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-slate-400 text-[10px] uppercase tracking-widest font-black block mb-1.5">Carrier</label>
                <Select value={form.carrier} onValueChange={(v) => { updateField('carrier', v); setLabelCarrier(v); }}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {CARRIERS.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-slate-900">{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-slate-400 text-[10px] uppercase tracking-widest font-black block mb-1.5">Est. Delivery</label>
                <Input
                  type="date"
                  value={form.estimated_delivery}
                  onChange={(e) => updateField('estimated_delivery', e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-900 h-11"
                />
              </div>
            </div>

            {/* Tracking Number */}
            <div>
              <label className="text-slate-400 text-[10px] uppercase tracking-widest font-black block mb-1.5">Tracking Number</label>
              <div className="flex gap-2">
                <Input
                  value={form.tracking_number}
                  onChange={(e) => updateField('tracking_number', e.target.value)}
                  placeholder="Enter tracking number..."
                  className="bg-slate-50 border-slate-200 text-slate-900 font-mono flex-1 h-11"
                />
                {form.tracking_number && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleCopyTracking} className="border-slate-200 text-slate-500 h-11 px-3">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      const c = CARRIERS.find(cr => cr.id === form.carrier);
                      if (c) window.open(c.trackUrl(form.tracking_number), '_blank');
                    }} className="border-slate-200 text-slate-500 h-11 px-3">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSendTrackingEmail} className="border-blue-200 text-blue-600 hover:bg-blue-50 h-11">
                      <Mail className="w-4 h-4 mr-1" /> Email
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h4 className="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-3">Customer Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase tracking-widest font-black block mb-1">Name</label>
                  <Input value={form.customer_name} onChange={(e) => updateField('customer_name', e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900 h-10" />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase tracking-widest font-black block mb-1">Email</label>
                  <Input value={form.customer_email} onChange={(e) => updateField('customer_email', e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900 h-10" />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase tracking-widest font-black block mb-1">Phone</label>
                  <Input value={form.customer_phone} onChange={(e) => updateField('customer_phone', e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900 h-10" />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h4 className="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-3">Shipping Address</h4>
              <div className="grid grid-cols-1 gap-3">
                <Input value={form.shipping_address} onChange={(e) => updateField('shipping_address', e.target.value)} placeholder="Street address" className="bg-slate-50 border-slate-200 text-slate-900 h-10" />
                <div className="grid grid-cols-3 gap-3">
                  <Input value={form.shipping_city} onChange={(e) => updateField('shipping_city', e.target.value)} placeholder="City" className="bg-slate-50 border-slate-200 text-slate-900 h-10" />
                  <Input value={form.shipping_state} onChange={(e) => updateField('shipping_state', e.target.value)} placeholder="State" className="bg-slate-50 border-slate-200 text-slate-900 h-10" />
                  <Input value={form.shipping_zip} onChange={(e) => updateField('shipping_zip', e.target.value)} placeholder="ZIP" className="bg-slate-50 border-slate-200 text-slate-900 h-10" />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-3">Order Items</h4>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{resolveProductName(item, products, productMap) || 'Product'}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.specification} &middot; Qty: {item.quantity}</p>
                    </div>
                    <p className="font-black text-[#dc2626] text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 px-1">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total</span>
                  <span className="text-lg font-black text-slate-900">${order.total_amount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h4 className="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-3">Payment Details</h4>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider mb-0.5">Method</p>
                  <p className="text-slate-900 font-bold">{order.payment_method || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider mb-0.5">Status</p>
                  <p className={`font-bold ${order.payment_status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>{order.payment_status || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider mb-0.5">Currency</p>
                  <p className="text-slate-900 font-bold">{order.crypto_currency || 'USD'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider mb-0.5">Transaction</p>
                  <p className="text-slate-900 font-mono text-[10px] break-all">{order.transaction_id?.slice(0, 20) || '—'}{order.transaction_id?.length > 20 ? '...' : ''}</p>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="text-slate-400 text-[10px] uppercase tracking-widest font-black block mb-1.5">Admin Notes</label>
              <Textarea
                value={form.admin_notes}
                onChange={(e) => updateField('admin_notes', e.target.value)}
                placeholder="Internal notes about this order..."
                rows={3}
                className="bg-slate-50 border-slate-200 text-slate-900 resize-none"
              />
            </div>
          </div>

          {/* Column 2: Shipping Label Preview */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-slate-400 text-[10px] uppercase tracking-widest font-black">Shipping Label</h4>
                <Select value={labelCarrier} onValueChange={setLabelCarrier}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {CARRIERS.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-slate-900 text-xs">{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ShippingLabel order={labelOrder} carrier={labelCarrier} />
            </div>

            {/* Quick Financial Summary */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <h4 className="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-3">Financial</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="text-slate-900 font-bold">${order.subtotal?.toFixed(2) || '—'}</span></div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="text-green-600 font-bold">-${order.discount_amount?.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span className="text-slate-900 font-bold">${order.shipping_cost?.toFixed(2) || '15.00'}</span></div>
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="text-slate-900 font-black">Total</span>
                  <span className="text-[#dc2626] font-black text-lg">${order.total_amount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <h4 className="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-3">Timeline</h4>
              <div className="space-y-3 text-xs">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-slate-900 font-bold">Order Created</p>
                    <p className="text-slate-400">{format(new Date(order.created_date), 'MMM dd, yyyy h:mm a')}</p>
                  </div>
                </div>
                {order.tracking_number && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-slate-900 font-bold">Tracking Added</p>
                      <p className="text-slate-400 font-mono">{order.tracking_number}</p>
                    </div>
                  </div>
                )}
                {order.estimated_delivery && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-slate-900 font-bold">Est. Delivery</p>
                      <p className="text-slate-400">{format(new Date(order.estimated_delivery), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                )}
                {order.delivered_date && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-green-700 font-bold">Delivered</p>
                      <p className="text-slate-400">{format(new Date(order.delivered_date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tax Report Modal ───
function TaxReportModal({ orders, isOpen, onClose }) {
  const [dateRange, setDateRange] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      if (o.is_deleted || o.status === 'cancelled') return false;
      const d = new Date(o.created_date);
      if (dateRange === 'ytd') return d.getFullYear() === now.getFullYear();
      if (dateRange === 'last_year') return d.getFullYear() === now.getFullYear() - 1;
      if (dateRange === 'q1') return d.getFullYear() === now.getFullYear() && d.getMonth() < 3;
      if (dateRange === 'q2') return d.getFullYear() === now.getFullYear() && d.getMonth() >= 3 && d.getMonth() < 6;
      if (dateRange === 'q3') return d.getFullYear() === now.getFullYear() && d.getMonth() >= 6 && d.getMonth() < 9;
      if (dateRange === 'q4') return d.getFullYear() === now.getFullYear() && d.getMonth() >= 9;
      if (dateRange === 'custom' && customStart && customEnd) {
        return d >= new Date(customStart) && d <= new Date(customEnd + 'T23:59:59');
      }
      return true;
    });
  }, [orders, dateRange, customStart, customEnd]);

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const totalShipping = filteredOrders.reduce((s, o) => s + (o.shipping_cost || 15), 0);
    const totalDiscounts = filteredOrders.reduce((s, o) => s + (o.discount_amount || 0), 0);
    const totalSubtotal = filteredOrders.reduce((s, o) => s + (o.subtotal || o.total_amount || 0), 0);
    const orderCount = filteredOrders.length;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    const byMonth = {};
    filteredOrders.forEach(o => {
      const key = format(new Date(o.created_date), 'yyyy-MM');
      if (!byMonth[key]) byMonth[key] = { revenue: 0, orders: 0, shipping: 0, discounts: 0 };
      byMonth[key].revenue += o.total_amount || 0;
      byMonth[key].orders += 1;
      byMonth[key].shipping += o.shipping_cost || 15;
      byMonth[key].discounts += o.discount_amount || 0;
    });

    const byPaymentMethod = {};
    filteredOrders.forEach(o => {
      const method = o.payment_method || 'unknown';
      if (!byPaymentMethod[method]) byPaymentMethod[method] = { revenue: 0, count: 0 };
      byPaymentMethod[method].revenue += o.total_amount || 0;
      byPaymentMethod[method].count += 1;
    });

    return { totalRevenue, totalShipping, totalDiscounts, totalSubtotal, orderCount, avgOrderValue, byMonth, byPaymentMethod };
  }, [filteredOrders]);

  const exportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Customer Email', 'Items', 'Subtotal', 'Discount', 'Shipping', 'Total', 'Payment Method', 'Payment Status', 'Crypto Currency', 'Transaction ID', 'Status', 'Carrier', 'Tracking Number', 'Shipping Address', 'City', 'State', 'ZIP'];
    const rows = filteredOrders.map(o => {
      const addr = o.shipping_address || {};
      const items = o.items?.map(i => `${i.productName || i.product_name} (${i.specification} x${i.quantity})`).join('; ') || '';
      return [
        o.order_number, format(new Date(o.created_date), 'yyyy-MM-dd HH:mm'),
        `"${o.customer_name || ''}"`, o.customer_email || o.created_by || '',
        `"${items}"`,
        (o.subtotal || 0).toFixed(2), (o.discount_amount || 0).toFixed(2),
        (o.shipping_cost || 15).toFixed(2), (o.total_amount || 0).toFixed(2),
        o.payment_method || '', o.payment_status || '', o.crypto_currency || '',
        o.transaction_id || '', o.status || '',
        o.carrier || '', o.tracking_number || '',
        `"${addr.address || addr.shippingAddress || ''}"`,
        addr.city || addr.shippingCity || '', addr.state || addr.shippingState || '',
        addr.zip || addr.shippingZip || '',
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-tax-report-${dateRange}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-black text-xl flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#dc2626]" />
            Tax & Revenue Report
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Financial overview for tax filing and business analysis.
          </DialogDescription>
        </DialogHeader>

        {/* Date Range Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'ytd', label: 'This Year' },
            { id: 'last_year', label: 'Last Year' },
            { id: 'q1', label: 'Q1' },
            { id: 'q2', label: 'Q2' },
            { id: 'q3', label: 'Q3' },
            { id: 'q4', label: 'Q4' },
            { id: 'custom', label: 'Custom' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setDateRange(r.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                dateRange === r.id ? 'bg-[#dc2626] border-[#dc2626] text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {dateRange === 'custom' && (
          <div className="flex gap-3 mb-4">
            <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900 h-9" />
            <span className="text-slate-400 self-center text-sm">to</span>
            <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900 h-9" />
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Revenue</p>
            <p className="text-2xl font-black text-slate-900">${stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Orders</p>
            <p className="text-2xl font-black text-slate-900">{stats.orderCount}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Avg Order Value</p>
            <p className="text-2xl font-black text-slate-900">${stats.avgOrderValue.toFixed(2)}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Gross Sales</p>
            <p className="text-2xl font-black text-slate-900">${stats.totalSubtotal.toFixed(2)}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Shipping Collected</p>
            <p className="text-2xl font-black text-slate-900">${stats.totalShipping.toFixed(2)}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Discounts Given</p>
            <p className="text-2xl font-black text-red-500">-${stats.totalDiscounts.toFixed(2)}</p>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="mb-6">
          <h4 className="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-3">Monthly Breakdown</h4>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-slate-100 border-b border-slate-200">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Month</span>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-right">Orders</span>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-right">Revenue</span>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-right">Shipping</span>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-right">Discounts</span>
            </div>
            {Object.entries(stats.byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, data]) => (
              <div key={month} className="grid grid-cols-5 gap-2 px-4 py-2.5 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-900 font-bold">{format(new Date(month + '-01'), 'MMM yyyy')}</span>
                <span className="text-sm text-slate-900 text-right">{data.orders}</span>
                <span className="text-sm text-slate-900 font-bold text-right">${data.revenue.toFixed(2)}</span>
                <span className="text-sm text-slate-500 text-right">${data.shipping.toFixed(2)}</span>
                <span className="text-sm text-red-500 text-right">-${data.discounts.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="mb-6">
          <h4 className="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-3">By Payment Method</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(stats.byPaymentMethod).map(([method, data]) => (
              <div key={method} className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500 font-bold capitalize">{method.replace(/_/g, ' ')}</p>
                <p className="text-lg font-black text-slate-900">${data.revenue.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400">{data.count} orders</p>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-200 text-slate-500">Close</Button>
          <Button onClick={exportCSV} className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold shadow-lg shadow-[#dc2626]/20">
            <Download className="w-4 h-4 mr-2" />
            Export CSV for Tax Filing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Quick Status Updater (Bulk) ───
function BulkActions({ selectedOrders, orders, onBulkUpdate }) {
  if (selectedOrders.size === 0) return null;

  const handleBulkStatus = (status) => {
    onBulkUpdate(Array.from(selectedOrders), { status });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-4 z-50"
    >
      <span className="text-sm font-bold">{selectedOrders.size} selected</span>
      <div className="w-px h-5 bg-slate-700" />
      <button onClick={() => handleBulkStatus('processing')} className="text-xs font-bold hover:text-blue-400 transition-colors">Processing</button>
      <button onClick={() => handleBulkStatus('shipped')} className="text-xs font-bold hover:text-purple-400 transition-colors">Shipped</button>
      <button onClick={() => handleBulkStatus('delivered')} className="text-xs font-bold hover:text-green-400 transition-colors">Delivered</button>
      <button onClick={() => handleBulkStatus('cancelled')} className="text-xs font-bold hover:text-red-400 transition-colors">Cancel</button>
    </motion.div>
  );
}

// ─── Order Row ───
function OrderRow({ order, isSelected, onSelect, onEdit, productMap = {}, products = [] }) {
  const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock;
  const addr = order.shipping_address || {};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border-2 rounded-2xl px-5 py-4 transition-all cursor-pointer group hover:shadow-lg hover:shadow-slate-200/50 ${
        isSelected ? 'border-[#dc2626]/40 shadow-md' : 'border-slate-100 hover:border-[#dc2626]/20'
      }`}
      onClick={() => onEdit(order)}
    >
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <div onClick={(e) => { e.stopPropagation(); onSelect(order.id); }}>
          <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer ${
            isSelected ? 'bg-[#dc2626] border-[#dc2626]' : 'border-slate-300 hover:border-[#dc2626]'
          }`}>
            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
          </div>
        </div>

        {/* Order Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-slate-900 font-black text-sm tracking-tight">#{order.order_number}</h4>
            <span className={`${STATUS_CONFIG[order.status]?.color} px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {order.status}
            </span>
            {order.tracking_number && (
              <Badge variant="outline" className="text-[10px] border-purple-200 text-purple-600 px-1.5 py-0 font-bold">
                <Truck className="w-3 h-3 mr-0.5" /> Tracked
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <span>{order.customer_name || order.created_by || 'Guest'}</span>
            <span className="text-slate-200">|</span>
            <span>{format(new Date(order.created_date), 'MMM dd, yyyy')}</span>
            <span className="text-slate-200">|</span>
            <span>{order.items?.length || 0} items</span>
          </div>
          {order.items?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {order.items.map((item, i) => (
                <span key={i} className="inline-flex items-center bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                  {resolveProductName(item, products, productMap) || 'Product'}
                  {item.specification ? ` — ${item.specification}` : ''}
                  {item.quantity > 1 ? ` ×${item.quantity}` : ''}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p className="text-[#dc2626] font-black text-sm">${order.total_amount?.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order.payment_method?.replace(/_/g, ' ') || '—'}</p>
        </div>

        <Edit3 className="w-4 h-4 text-slate-300 group-hover:text-[#dc2626] transition-colors flex-shrink-0" />
      </div>
    </motion.div>
  );
}

// ─── Main Component ───
export default function AdminOrderManagement() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [showTaxReport, setShowTaxReport] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  // Build a lookup map: product id → product name
  const productMap = useMemo(() => {
    const map = {};
    products.forEach(p => { map[p.id] = p.name; });
    return map;
  }, [products]);

  // Auto-backfill missing product names on orders (runs once on load)
  const backfillRan = useRef(false);
  useEffect(() => {
    if (backfillRan.current || !orders.length || !products.length) return;
    backfillRan.current = true;

    const backfillOrders = async () => {
      let patched = 0;
      for (const order of orders) {
        if (!order.items?.length) continue;

        let needsUpdate = false;
        const updatedItems = order.items.map(item => {
          if (item.productName || item.product_name) return item;

          const resolvedName = resolveProductName(item, products, productMap);
          if (resolvedName) {
            needsUpdate = true;
            return { ...item, product_name: resolvedName };
          }
          return item;
        });

        if (needsUpdate) {
          try {
            await base44.entities.Order.update(order.id, { items: updatedItems });
            patched++;
          } catch (err) {
            console.error(`Failed to backfill order ${order.order_number}:`, err);
          }
        }
      }
      if (patched > 0) {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        toast.success(`Fixed product names on ${patched} order${patched > 1 ? 's' : ''}`);
      }
    };

    backfillOrders();
  }, [orders, products]);

  useEffect(() => {
    const unsubscribe = base44.entities.Order.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });
    return unsubscribe;
  }, [queryClient]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);
      } catch (err) {
        navigate(createPageUrl('Home'));
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, updates }) => base44.entities.Order.update(orderId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order updated');
    },
    onError: (err) => {
      toast.error('Failed to update order', { description: err.message });
    },
  });

  // ─── Restore stock when an order is cancelled ───
  const restoreStock = async (items) => {
    if (!items?.length) return;
    try {
      const currentProducts = await base44.entities.Product.list();
      for (const item of items) {
        const product = currentProducts.find(p =>
          p.id === item.product_id || p.id === item.productId ||
          p.name === (item.productName || item.product_name)
        );
        if (product) {
          const updatedSpecs = product.specifications.map(spec => {
            if (spec.name === item.specification) {
              return {
                ...spec,
                stock_quantity: (spec.stock_quantity || 0) + (item.quantity || 1),
                in_stock: true
              };
            }
            return spec;
          });
          await base44.entities.Product.update(product.id, {
            specifications: updatedSpecs,
            in_stock: true
          });
        }
      }
      toast.success('Stock restored for cancelled order');
    } catch (err) {
      console.error('Failed to restore stock:', err);
      toast.error('Failed to restore stock', { description: err.message });
    }
  };

  const handleSaveOrder = async (orderId, updates) => {
    // If changing to cancelled from a non-cancelled status, restore stock
    const order = orders.find(o => o.id === orderId);
    if (updates.status === 'cancelled' && order?.status !== 'cancelled') {
      await restoreStock(order.items);
    }
    updateOrderMutation.mutate({ orderId, updates });
    setEditingOrder(null);
  };

  const handleBulkUpdate = async (orderIds, updates) => {
    try {
      // If bulk-cancelling, restore stock for each order
      if (updates.status === 'cancelled') {
        for (const id of orderIds) {
          const order = orders.find(o => o.id === id);
          if (order && order.status !== 'cancelled') {
            await restoreStock(order.items);
          }
        }
      }
      await Promise.all(orderIds.map(id => base44.entities.Order.update(id, updates)));
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrders(new Set());
      toast.success(`${orderIds.length} orders updated to ${updates.status}`);
    } catch (err) {
      toast.error('Bulk update failed', { description: err.message });
    }
  };

  const toggleSelect = (id) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredOrders = useMemo(() => {
    let result = orders.filter(order => {
      const statusMatch = filterStatus === 'all' || order.status === filterStatus;
      const searchMatch = searchQuery === '' ||
        order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.created_by?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shipping_address?.address?.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && searchMatch;
    });

    if (sortBy === 'oldest') result.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    else if (sortBy === 'highest') result.sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0));
    else if (sortBy === 'lowest') result.sort((a, b) => (a.total_amount || 0) - (b.total_amount || 0));

    return result;
  }, [orders, filterStatus, searchQuery, sortBy]);

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });
    return counts;
  }, [orders]);

  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + (o.total_amount || 0), 0), [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#dc2626]"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back */}
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="mb-4 hover:bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-xs">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-2 uppercase tracking-tighter leading-none">
              Order <span className="text-[#dc2626]">Hub</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium">
              Manage orders, shipping, tracking, and generate tax reports.
            </p>
          </motion.div>
          <Button onClick={() => setShowTaxReport(true)} className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs px-6 py-5 rounded-full shadow-lg">
            <Receipt className="w-4 h-4 mr-2" /> Tax Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const StatusIcon = config.icon;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
                className={`${config.color} rounded-2xl p-4 border-2 transition-all text-left hover:shadow-md ${
                  filterStatus === status ? 'ring-2 ring-offset-2 ring-slate-900/10' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-black tracking-widest">{config.label}</span>
                </div>
                <p className="text-3xl font-black">{statusCounts[status]}</p>
              </button>
            );
          })}
          <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-200 text-left">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Revenue</span>
            </div>
            <p className="text-3xl font-black text-slate-900">${totalRevenue.toFixed(0)}</p>
          </div>
        </div>

        {/* Editor Panel */}
        <AnimatePresence mode="wait">
          {editingOrder && (
            <motion.div
              key={editingOrder.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <OrderDetailEditor
                key={editingOrder.id}
                order={editingOrder}
                onSave={handleSaveOrder}
                onClose={() => setEditingOrder(null)}
                isSaving={updateOrderMutation.isPending}
                productMap={productMap}
                products={products}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#dc2626] transition-colors" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, customers, tracking..."
              className="bg-slate-50 border-slate-200 text-slate-900 pl-11 rounded-full h-12 focus:border-[#dc2626]/30 focus:bg-white"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-slate-400 hover:text-[#dc2626]" />
              </button>
            )}
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 w-full md:w-44 rounded-full h-12">
              <SelectValue placeholder="All Orders" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all" className="text-slate-900">All Orders</SelectItem>
              <SelectItem value="pending" className="text-slate-900">Pending</SelectItem>
              <SelectItem value="processing" className="text-slate-900">Processing</SelectItem>
              <SelectItem value="shipped" className="text-slate-900">Shipped</SelectItem>
              <SelectItem value="delivered" className="text-slate-900">Delivered</SelectItem>
              <SelectItem value="cancelled" className="text-red-600">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 w-full md:w-44 rounded-full h-12">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="newest" className="text-slate-900">Newest First</SelectItem>
              <SelectItem value="oldest" className="text-slate-900">Oldest First</SelectItem>
              <SelectItem value="highest" className="text-slate-900">Highest Amount</SelectItem>
              <SelectItem value="lowest" className="text-slate-900">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Package className="w-4 h-4" />
            <p className="text-xs font-black uppercase tracking-widest">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
            </p>
          </div>
          {selectedOrders.size > 0 && (
            <button onClick={() => setSelectedOrders(new Set())} className="text-xs text-[#dc2626] font-black uppercase tracking-widest hover:underline">
              Clear Selection
            </button>
          )}
        </div>

        {/* Order List */}
        {isLoading ? (
          <div className="text-center py-40">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#dc2626]"></div>
            <p className="text-slate-500 font-bold mt-4 uppercase tracking-widest text-xs">Loading Orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-40 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No orders found</p>
            <button onClick={() => { setSearchQuery(''); setFilterStatus('all'); }} className="mt-4 text-[#dc2626] font-black uppercase text-xs hover:underline">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  isSelected={selectedOrders.has(order.id)}
                  onSelect={toggleSelect}
                  onEdit={(o) => {
                    setEditingOrder(o);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  productMap={productMap}
                  products={products}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          <BulkActions selectedOrders={selectedOrders} orders={orders} onBulkUpdate={handleBulkUpdate} />
        </AnimatePresence>

        {/* Tax Report Modal */}
        <TaxReportModal orders={orders} isOpen={showTaxReport} onClose={() => setShowTaxReport(false)} />
      </div>
    </div>
  );
}
