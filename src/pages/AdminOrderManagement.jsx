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
  Globe, Phone, Copy, ExternalLink, Filter, ArrowUpDown, Receipt, Building2, Trash2, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import PredictionDashboard from '@/components/admin/PredictionDashboard';
import OrderCommsPanel from '@/components/admin/OrderCommsPanel';
import PirateShipLabelCreator from '@/components/admin/PirateShipLabelCreator';
import FraudEvidencePanel from '@/components/admin/FraudEvidencePanel';
import TaxReportModal from '@/components/admin/TaxReportModal';

const CARRIERS = [
  { id: 'USPS', label: 'USPS', trackUrl: (t) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}` },
  { id: 'UPS', label: 'UPS', trackUrl: (t) => `https://www.ups.com/track?tracknum=${t}` },
  { id: 'FedEx', label: 'FedEx', trackUrl: (t) => `https://tracking.fedex.com/en/tracking/${t}` },
  { id: 'DHL', label: 'DHL', trackUrl: (t) => `https://www.dhl.com/en/en/shipped.html?AWB=${t}` },
];

const STATUS_CONFIG = {
  awaiting_payment: { color: 'bg-orange-50 border-orange-200 text-orange-700', icon: CreditCard, label: 'Awaiting Payment' },
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
function OrderDetailEditor({ order, onSave, onClose, onDelete, isSaving, productMap = {}, products = [], adminEmail }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPirateShip, setShowPirateShip] = useState(false);
  // Detect if this order has a kit (10-vial) item
  const hasKitItem = order.items?.some(item =>
    item.specification?.toLowerCase().includes('10') ||
    item.specification?.toLowerCase().includes('kit') ||
    item.specification?.toLowerCase().includes('vial') && parseInt(item.quantity) >= 10
  );

  const [form, setForm] = useState({
    status: order.status || 'pending',
    tracking_number: order.tracking_number || '',
    kit_tracking_number: order.kit_tracking_number || '',
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
    total_product_cost: order.total_product_cost != null ? order.total_product_cost : '',
  });
  const [labelCarrier, setLabelCarrier] = useState(form.carrier || 'USPS');
  const [showLabel, setShowLabel] = useState(false);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    const updates = {
      status: form.status,
      tracking_number: form.tracking_number,
      kit_tracking_number: form.kit_tracking_number,
      carrier: form.carrier,
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone,
      admin_notes: form.admin_notes,
      total_product_cost: form.total_product_cost !== '' ? parseFloat(form.total_product_cost) : null,
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

  const handleSendKitEmail = async () => {
    if (!form.customer_email) {
      toast.error('No customer email on this order');
      return;
    }
    try {
      await base44.integrations.Core.SendEmail({
        from_name: 'Red Helix Research',
        to: form.customer_email,
        subject: `Important Info About Your Order ${order.order_number} — Kit Shipment Details`,
        body: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);"><tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:36px 40px;text-align:center;"><div style="width:52px;height:52px;background:#8B2635;border-radius:14px;display:inline-block;line-height:52px;margin-bottom:14px;"><span style="color:#fff;font-size:20px;font-weight:900;">RH</span></div><h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 6px 0;">Your Kit Order Is On Its Way!</h1><p style="color:#94a3b8;font-size:13px;font-weight:600;margin:0;letter-spacing:1px;text-transform:uppercase;">Red Helix Research · Order #${order.order_number}</p></td></tr><tr><td style="padding:32px 40px 0 40px;"><p style="color:#334155;font-size:15px;font-weight:600;margin:0 0 8px 0;">Hi ${form.customer_name || 'there'},</p><p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px 0;">Thank you for your order! We wanted to share a few important details since your order includes one of our research kits.</p></td></tr><tr><td style="padding:0 40px 24px 40px;"><div style="background:#fef9f0;border:1px solid #fde68a;border-radius:12px;padding:20px 24px;margin-bottom:20px;"><p style="margin:0 0 10px 0;font-size:12px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:1px;">📦 Two Tracking Numbers</p><p style="margin:0;font-size:14px;color:#78350f;line-height:1.7;">Your order may arrive in <strong>two separate shipments</strong> with two different tracking numbers:</p><ul style="margin:10px 0 0 0;padding-left:20px;color:#78350f;font-size:14px;line-height:2;"><li><strong>Single vial orders</strong> ship directly from us at Red Helix Research.</li><li><strong>Kit orders</strong> ship from our dedicated fulfillment center.</li></ul><p style="margin:10px 0 0 0;font-size:13px;color:#92400e;">Both packages are on their way — they may arrive on different days, so don't be alarmed!</p></div><div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px 24px;margin-bottom:20px;"><p style="margin:0 0 10px 0;font-size:12px;font-weight:800;color:#166534;text-transform:uppercase;letter-spacing:1px;">🧪 About Your Kit — Unlabeled Vials</p><p style="margin:0 0 10px 0;font-size:14px;color:#15803d;line-height:1.7;">Your kit vials will arrive <strong>unlabeled</strong>. This is intentional — our kits are our <strong>wholesale option</strong>, which is how we're able to pass significant savings on to you. By fulfilling kits directly from our fulfillment center without individual labeling, we eliminate additional handling and packaging costs.</p><p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#166534;">How to identify your products:</p><ul style="margin:0;padding-left:20px;color:#15803d;font-size:14px;line-height:2;"><li>Each vial has a <strong>colored cap</strong> and/or a <strong>batch number</strong> on the stopper or packaging.</li><li>Visit our COA Reports page at <a href="https://redhelixresearch.com/COAReports" style="color:#16a34a;font-weight:700;">redhelixresearch.com/COAReports</a>.</li><li>Match the <strong>cap color</strong> or <strong>batch number</strong> on your vial to the corresponding Certificate of Analysis listed on the page.</li><li>Each COA includes the peptide name, concentration, purity results, and batch ID — giving you full traceability and confidence in every vial.</li></ul></div><div style="background:#f0f4ff;border:1px solid #a5b4fc;border-radius:12px;padding:20px 24px;margin-bottom:20px;"><p style="margin:0 0 10px 0;font-size:12px;font-weight:800;color:#3730a3;text-transform:uppercase;letter-spacing:1px;">🚚 Fulfillment & Delivery Timeline</p><ul style="margin:0;padding-left:20px;color:#4338ca;font-size:14px;line-height:2;"><li>Kit fulfillment can take <strong>up to 36 hours</strong> for processing after order confirmation.</li><li>You may receive a tracking number <strong>before tracking updates appear online</strong> — this is normal and simply means the carrier hasn't scanned the first update yet.</li><li>For real-time package visibility, we recommend <strong>USPS Informed Delivery</strong> at <a href="https://informeddelivery.usps.com" style="color:#4338ca;font-weight:700;">informeddelivery.usps.com</a> in case tracking updates are delayed.</li><li>We always aim to have your products delivered <strong>within one week</strong> of your order date.</li></ul></div><div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;"><p style="margin:0 0 6px 0;font-size:10px;font-weight:800;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">Research Use Only</p><p style="margin:0;font-size:12px;color:#7f1d1d;line-height:1.6;">These products are for laboratory research use only. Not for human consumption. For any issues, please contact <a href="mailto:jake@redhelixresearch.com" style="color:#dc2626;font-weight:700;">jake@redhelixresearch.com</a> before contacting your payment provider.</p></div></td></tr><tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;"><p style="color:#94a3b8;font-size:11px;margin:0;">Red Helix Research | <a href="mailto:jake@redhelixresearch.com" style="color:#8B2635;text-decoration:none;">jake@redhelixresearch.com</a></p></td></tr></table></td></tr></table></body></html>`,
      });
      toast.success('Kit info email sent', { description: `Sent to ${form.customer_email}` });
    } catch (err) {
      toast.error('Failed to send email', { description: err.message });
    }
  };

  const handleSendConfirmationEmail = async () => {
    if (!form.customer_email) {
      toast.error('No customer email on this order');
      return;
    }
    try {
      const itemsHtml = order.items?.map(item =>
        `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;font-weight:600;">${resolveProductName(item, products, productMap) || item.productName || item.product_name || 'Product'}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center;">${item.specification || '—'}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center;">×${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#0f172a;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
      ).join('') || '';

      const addr = order.shipping_address || {};
      const shippingLine = [addr.address, addr.city, addr.state, addr.zip].filter(Boolean).join(', ');

      await base44.integrations.Core.SendEmail({
        from_name: 'Red Helix Research',
        to: form.customer_email,
        subject: `Order Confirmed — #${order.order_number} | Red Helix Research`,
        body: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

<tr>
<td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:36px 40px;text-align:center;">
  <div style="width:52px;height:52px;background:#dc2626;border-radius:14px;display:inline-block;line-height:52px;margin-bottom:14px;">
    <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-1px;">RH</span>
  </div>
  <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 6px 0;letter-spacing:-0.5px;">Order Confirmed!</h1>
  <p style="color:#94a3b8;font-size:13px;font-weight:600;margin:0;letter-spacing:1px;text-transform:uppercase;">Red Helix Research · Order #${order.order_number}</p>
</td>
</tr>

<tr>
<td style="padding:32px 40px 0 40px;">
  <p style="color:#334155;font-size:15px;font-weight:600;margin:0 0 8px 0;">Hi ${form.customer_name || 'there'},</p>
  <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px 0;">
    Thank you for your order! We've received it and it's being prepared. You'll receive another email once your order ships with a tracking number.
  </p>
</td>
</tr>

<tr>
<td style="padding:0 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <tr style="background:#f8fafc;">
      <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Item</th>
      <th style="padding:10px 8px;text-align:center;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Spec</th>
      <th style="padding:10px 8px;text-align:center;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Qty</th>
      <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Price</th>
    </tr>
    ${itemsHtml}
    ${order.discount_amount > 0 ? `<tr><td colspan="3" style="padding:8px 12px;font-size:13px;color:#16a34a;font-weight:700;">Discount Applied</td><td style="padding:8px 12px;font-size:13px;color:#16a34a;font-weight:700;text-align:right;">-$${order.discount_amount.toFixed(2)}</td></tr>` : ''}
    <tr><td colspan="3" style="padding:8px 12px;font-size:13px;color:#64748b;font-weight:600;">Shipping</td><td style="padding:8px 12px;font-size:13px;color:#64748b;font-weight:600;text-align:right;">$${(order.shipping_cost || 15).toFixed(2)}</td></tr>
    <tr style="background:#f8fafc;">
      <td colspan="3" style="padding:12px;font-size:14px;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">Total</td>
      <td style="padding:12px;font-size:20px;font-weight:900;color:#dc2626;text-align:right;">$${order.total_amount?.toFixed(2)}</td>
    </tr>
  </table>
</td>
</tr>

${shippingLine ? `
<tr>
<td style="padding:24px 40px 0 40px;">
  <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;border:1px solid #e2e8f0;">
    <p style="margin:0 0 6px 0;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Shipping To</p>
    <p style="margin:0;font-size:14px;color:#334155;font-weight:600;">${form.customer_name || ''}</p>
    <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${shippingLine}</p>
  </div>
</td>
</tr>` : ''}

<tr>
<td style="padding:24px 40px;">
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;">
    <p style="margin:0 0 6px 0;font-size:10px;font-weight:800;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">Research Use Only</p>
    <p style="margin:0;font-size:12px;color:#7f1d1d;line-height:1.6;">These products are for laboratory research use only. Not for human consumption. All sales are final — no refunds or returns. For any issues, please contact <a href="mailto:jake@redhelixresearch.com" style="color:#dc2626;font-weight:700;">jake@redhelixresearch.com</a> before contacting your bank.</p>
  </div>
</td>
</tr>

<tr>
<td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="color:#94a3b8;font-size:11px;margin:0;">Red Helix Research | <a href="mailto:jake@redhelixresearch.com" style="color:#dc2626;text-decoration:none;">jake@redhelixresearch.com</a></p>
</td>
</tr>

</table>
</td></tr></table>
</body>
</html>`,
      });
      toast.success('Confirmation email sent', { description: `Sent to ${form.customer_email}` });
    } catch (err) {
      toast.error('Failed to send email', { description: err.message });
    }
  };

  const handleSendDualTrackingEmail = async () => {
    if (!form.customer_email) {
      toast.error('No customer email on this order');
      return;
    }
    if (!form.tracking_number && !form.kit_tracking_number) {
      toast.error('Add at least one tracking number first');
      return;
    }
    try {
      const carrierInfo = CARRIERS.find(c => c.id === form.carrier);
      const mainTrackUrl = carrierInfo && form.tracking_number ? carrierInfo.trackUrl(form.tracking_number) : '';
      const kitTrackUrl = carrierInfo && form.kit_tracking_number ? carrierInfo.trackUrl(form.kit_tracking_number) : '';

      const mainTrackingBlock = form.tracking_number ? `
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:12px;">
          <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:800;">📦 Package 1 — Single Vials (from Red Helix Research)</p>
          <p style="margin:0;font-size:20px;font-weight:900;font-family:monospace;color:#0f172a;">${form.tracking_number}</p>
          <p style="margin:6px 0 0;font-size:12px;color:#64748b;">Carrier: ${form.carrier}</p>
          ${mainTrackUrl ? `<a href="${mainTrackUrl}" style="display:inline-block;margin-top:10px;padding:8px 18px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:12px;">Track Package 1 →</a>` : ''}
        </div>` : '';

      const kitTrackingBlock = form.kit_tracking_number ? `
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:12px;">
          <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:800;">🧪 Package 2 — Kit Shipment (from Kit Fulfillment Center)</p>
          <p style="margin:0;font-size:20px;font-weight:900;font-family:monospace;color:#0f172a;">${form.kit_tracking_number}</p>
          <p style="margin:6px 0 0;font-size:12px;color:#64748b;">Carrier: ${form.carrier}</p>
          ${kitTrackUrl ? `<a href="${kitTrackUrl}" style="display:inline-block;margin-top:10px;padding:8px 18px;background:#8B2635;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:12px;">Track Kit Package →</a>` : ''}
        </div>` : '';

      await base44.integrations.Core.SendEmail({
        from_name: 'Red Helix Research',
        to: form.customer_email,
        subject: `Your Order ${order.order_number} — Tracking Updates for Both Shipments`,
        body: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);"><tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:36px 40px;text-align:center;"><div style="width:52px;height:52px;background:#8B2635;border-radius:14px;display:inline-block;line-height:52px;margin-bottom:14px;"><span style="color:#fff;font-size:20px;font-weight:900;">RH</span></div><h1 style="color:#ffffff;font-size:24px;font-weight:900;margin:0 0 6px 0;">Your Order Is Shipping in Two Packages!</h1><p style="color:#94a3b8;font-size:13px;font-weight:600;margin:0;letter-spacing:1px;text-transform:uppercase;">Order #${order.order_number}</p></td></tr><tr><td style="padding:32px 40px 0 40px;"><p style="color:#334155;font-size:15px;font-weight:600;margin:0 0 8px 0;">Hi ${form.customer_name || 'there'},</p><p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 20px 0;">Because your order includes a <strong>10-vial kit</strong>, it ships from two separate locations. You have <strong>two tracking numbers</strong> below — don't worry if they arrive on different days!</p><div style="background:#fef9f0;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;margin-bottom:24px;"><p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">⚠️ This is normal — both packages are confirmed on their way. Kit processing can take up to 36 hours, so tracking updates may appear at different times.</p></div></td></tr><tr><td style="padding:0 40px 24px 40px;">${mainTrackingBlock}${kitTrackingBlock}<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:16px 20px;margin-top:8px;"><p style="margin:0 0 6px 0;font-size:11px;font-weight:800;color:#166534;text-transform:uppercase;letter-spacing:1px;">🧪 About Your Kit — Unlabeled Vials</p><p style="margin:0;font-size:13px;color:#15803d;line-height:1.7;">Your kit vials arrive <strong>unlabeled</strong> to keep costs low. Use the <strong>batch number on the kit box</strong> or the <strong>colored vial cap</strong> to identify each peptide. Match them at <a href="https://redhelixresearch.com/COAReports" style="color:#16a34a;font-weight:700;">redhelixresearch.com/COAReports</a>.</p></div></td></tr><tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;"><p style="color:#94a3b8;font-size:11px;margin:0;">Red Helix Research | <a href="mailto:jake@redhelixresearch.com" style="color:#8B2635;text-decoration:none;">jake@redhelixresearch.com</a></p></td></tr></table></td></tr></table></body></html>`,
      });
      toast.success('Dual tracking email sent', { description: `Sent to ${form.customer_email}` });
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
          <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)} className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
          <Button variant="outline" size="sm" onClick={onClose} className="border-slate-200 text-slate-500 hover:text-slate-900">
            <X className="w-4 h-4 mr-1" /> Close
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold shadow-lg shadow-[#dc2626]/20">
            <Save className="w-4 h-4 mr-1" /> {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 overflow-hidden">
          {/* Column 1: Status & Shipping */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6 min-w-0">
            {/* Status & Tracking Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <div>
                <label className="text-slate-400 text-[10px] uppercase tracking-widest font-black block mb-1.5">Order Status</label>
                <Select value={form.status} onValueChange={(v) => updateField('status', v)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="awaiting_payment" className="text-orange-600">Awaiting Payment</SelectItem>
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
              <label className="text-slate-400 text-[10px] uppercase tracking-widest font-black block mb-1.5">Tracking Number (Single Vials)</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={form.tracking_number}
                  onChange={(e) => updateField('tracking_number', e.target.value)}
                  placeholder="Enter tracking number..."
                  className="bg-slate-50 border-slate-200 text-slate-900 font-mono flex-1 h-11"
                />
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  {form.tracking_number && (
                       <>
                         <Button variant="outline" size="sm" onClick={handleCopyTracking} className="border-slate-200 text-slate-500 h-11 px-3 flex-1 sm:flex-none">
                           <Copy className="w-4 h-4" />
                         </Button>
                         <Button variant="outline" size="sm" onClick={() => {
                           const c = CARRIERS.find(cr => cr.id === form.carrier);
                           if (c) window.open(c.trackUrl(form.tracking_number), '_blank');
                         }} className="border-slate-200 text-slate-500 h-11 px-3 flex-1 sm:flex-none">
                           <ExternalLink className="w-4 h-4" />
                         </Button>
                         <Button variant="outline" size="sm" onClick={handleSendTrackingEmail} className="border-blue-200 text-blue-600 hover:bg-blue-50 h-11 flex-1 sm:flex-none">
                           <Mail className="w-4 h-4 mr-1" /> Shipped
                         </Button>
                       </>
                     )}
                     <Button variant="outline" size="sm" onClick={handleSendConfirmationEmail} className="border-green-200 text-green-600 hover:bg-green-50 h-11 flex-1 sm:flex-none">
                       <Mail className="w-4 h-4 mr-1" /> Confirm
                     </Button>
                     <Button variant="outline" size="sm" onClick={handleSendKitEmail} className="border-purple-200 text-purple-600 hover:bg-purple-50 h-11 flex-1 sm:flex-none">
                       <Mail className="w-4 h-4 mr-1" /> Kit Info
                     </Button>
                     <Button size="sm" onClick={() => setShowPirateShip(true)} className="bg-[#dc2626] hover:bg-[#b91c1c] text-white h-11 font-bold flex-1 sm:flex-none">
                       <Package className="w-4 h-4 mr-1" /> Label
                     </Button>
                </div>
              </div>
            </div>

            {/* Kit Tracking Number */}
            <div>
              <label className="text-slate-400 text-[10px] uppercase tracking-widest font-black block mb-1.5">
                Kit Tracking Number (10-Vial Fulfillment)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={form.kit_tracking_number}
                  onChange={(e) => updateField('kit_tracking_number', e.target.value)}
                  placeholder="Enter kit tracking number..."
                  className="bg-amber-50 border-amber-200 text-slate-900 font-mono flex-1 h-11"
                />
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  {form.kit_tracking_number && (
                    <Button variant="outline" size="sm" onClick={() => {
                      const c = CARRIERS.find(cr => cr.id === form.carrier);
                      if (c) window.open(c.trackUrl(form.kit_tracking_number), '_blank');
                    }} className="border-slate-200 text-slate-500 h-11 px-3 flex-1 sm:flex-none">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleSendDualTrackingEmail} className="border-amber-300 text-amber-700 hover:bg-amber-50 h-11 flex-1 sm:flex-none">
                    <Mail className="w-4 h-4 mr-1" /> Both Tracking
                  </Button>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h4 className="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-3">Customer Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
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
              <div className="grid grid-cols-1 gap-2 lg:gap-3">
                <Input value={form.shipping_address} onChange={(e) => updateField('shipping_address', e.target.value)} placeholder="Street address" className="bg-slate-50 border-slate-200 text-slate-900 h-10" />
                <div className="grid grid-cols-3 gap-2 lg:gap-3">
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
              <div className="bg-slate-50 rounded-xl p-3 lg:p-4 border border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4 text-xs">
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

            {/* Fraud & Chargeback Evidence */}
            <div>
              <h4 className="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-3 flex items-center gap-2">
                <span>Fraud Protection & Chargeback Evidence</span>
              </h4>
              <FraudEvidencePanel orderNumber={order.order_number} />
            </div>

            {/* Customer Communications */}
            <OrderCommsPanel order={{ ...order, customer_email: form.customer_email, customer_name: form.customer_name }} adminEmail={adminEmail} />
          </div>

          {/* Column 2: Shipping Label Preview */}
          <div className="space-y-4 min-w-0">
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
              {/* Manual COGS override */}
              <div className="border-t border-slate-200 mt-3 pt-3">
                <label className="text-slate-400 text-[10px] uppercase tracking-widest font-black block mb-1.5">Total Product Cost (COGS) $</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter total cost..."
                  value={form.total_product_cost}
                  onChange={(e) => updateField('total_product_cost', e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 h-9 text-sm"
                />
                {form.total_product_cost !== '' && !isNaN(parseFloat(form.total_product_cost)) && (
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Revenue</span><span className="font-bold">${(order.total_amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-orange-600">
                      <span>COGS</span><span className="font-bold">-${parseFloat(form.total_product_cost).toFixed(2)}</span>
                    </div>
                    <div className={`flex justify-between font-black border-t border-slate-200 pt-1 ${(order.total_amount || 0) - parseFloat(form.total_product_cost) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      <span>Profit</span>
                      <span>${((order.total_amount || 0) - parseFloat(form.total_product_cost)).toFixed(2)}</span>
                    </div>
                  </div>
                )}
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
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-white border-slate-200 text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-black">Delete Order #{order.order_number}?</DialogTitle>
            <DialogDescription className="text-slate-500">
              This will permanently remove this order. Stock will NOT be restored.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="border-slate-200 text-slate-500">Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white font-bold" onClick={() => onDelete(order.id)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PirateShip Label Creator Modal */}
      {showPirateShip && (
        <PirateShipLabelCreator
          order={labelOrder}
          onClose={() => setShowPirateShip(false)}
        />
      )}
      </div>
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
      <button onClick={() => handleBulkStatus('awaiting_payment')} className="text-xs font-bold hover:text-orange-400 transition-colors">Awaiting Payment</button>
      <button onClick={() => handleBulkStatus('processing')} className="text-xs font-bold hover:text-blue-400 transition-colors">Processing</button>
      <button onClick={() => handleBulkStatus('shipped')} className="text-xs font-bold hover:text-purple-400 transition-colors">Shipped</button>
      <button onClick={() => handleBulkStatus('delivered')} className="text-xs font-bold hover:text-green-400 transition-colors">Delivered</button>
      <button onClick={() => handleBulkStatus('cancelled')} className="text-xs font-bold hover:text-red-400 transition-colors">Cancel</button>
    </motion.div>
  );
}

// ─── Payment Status Badge ───
function PaymentBadge({ order }) {
  const isAbandoned = order.status === 'awaiting_payment' || order.payment_status === 'abandoned';
  const isPaid = order.payment_status === 'completed' || 
    (!isAbandoned && ['pending', 'processing', 'shipped', 'delivered'].includes(order.status));
  const isCancelled = order.status === 'cancelled';

  if (isCancelled) return null;

  if (isPaid) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 border border-green-200 text-green-700">
        <CheckCircle className="w-3 h-3" /> Paid
      </span>
    );
  }
  if (isAbandoned) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-50 border border-orange-200 text-orange-700">
        <AlertCircle className="w-3 h-3" /> Abandoned
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 border border-slate-200 text-slate-500">
      <Clock className="w-3 h-3" /> {order.payment_status || 'Unknown'}
    </span>
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
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h4 className="text-slate-900 font-black text-sm tracking-tight">#{order.order_number}</h4>
            <span className={`${STATUS_CONFIG[order.status]?.color} px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {order.status}
            </span>
            <PaymentBadge order={order} />
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
  const [showPredictions, setShowPredictions] = useState(false);
  const [hideCogsEntered, setHideCogsEntered] = useState(false);
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

  // Build a lookup map: product name → cost_price
  const productCostMap = useMemo(() => {
    const map = {};
    products.forEach(p => { if (p.name) map[p.name.toLowerCase()] = p.cost_price || 0; });
    return map;
  }, [products]);

  // Calculate COGS for an order (manual override takes priority, then spec-level, then product-level)
  const calcOrderCOGS = (order) => {
    if (order.total_product_cost != null && order.total_product_cost !== '') {
      return Number(order.total_product_cost);
    }
    if (!order.items?.length) return 0;
    return order.items.reduce((sum, item) => {
      const name = (item.productName || item.product_name || '').toLowerCase();
      const product = products.find(p => p.name?.toLowerCase() === name);
      const spec = product?.specifications?.find(s => s.name === item.specification);
      const cost = (spec?.cost_price != null ? spec.cost_price : productCostMap[name]) || 0;
      return sum + cost * (item.quantity || 1);
    }, 0);
  };

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
    try {
      await updateOrderMutation.mutateAsync({ orderId, updates });
      setEditingOrder(null);
    } catch (err) {
      // Error toast already handled by mutation onError
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await base44.entities.Order.delete(orderId);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setEditingOrder(null);
      toast.success('Order deleted');
    } catch (err) {
      toast.error('Failed to delete order', { description: err.message });
    }
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

    if (hideCogsEntered) result = result.filter(o => o.total_product_cost == null || o.total_product_cost === '');

    if (sortBy === 'oldest') result.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    else if (sortBy === 'highest') result.sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0));
    else if (sortBy === 'lowest') result.sort((a, b) => (a.total_amount || 0) - (b.total_amount || 0));

    return result;
  }, [orders, filterStatus, searchQuery, sortBy, hideCogsEntered]);

  const statusCounts = useMemo(() => {
    const counts = { awaiting_payment: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 min-w-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 mb-2 uppercase tracking-tighter leading-tight">
            Order <span className="text-[#dc2626]">Hub</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-xl text-slate-500 font-medium">
            Manage orders, shipping, tracking, and generate tax reports.
          </p>
        </motion.div>
        <div className="flex flex-wrap gap-2 lg:gap-2 flex-shrink-0">
          <Link to={createPageUrl('AdminTrackingDashboard')} className="w-full sm:w-auto">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-xs px-3 sm:px-5 py-4 sm:py-5 rounded-full shadow-lg w-full sm:w-auto">
              <Truck className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Tracking Hub</span><span className="sm:hidden">Track</span>
            </Button>
          </Link>
          <Button onClick={() => setShowPredictions(true)} className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black uppercase tracking-widest text-xs px-3 sm:px-5 py-4 sm:py-5 rounded-full shadow-lg flex-1 sm:flex-none">
            <TrendingUp className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Predictions</span><span className="sm:hidden">Stats</span>
          </Button>
          <Button onClick={() => setShowTaxReport(true)} className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs px-3 sm:px-6 py-4 sm:py-5 rounded-full shadow-lg flex-1 sm:flex-none">
            <Receipt className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Tax Report</span><span className="sm:hidden">Tax</span>
          </Button>
          <Button onClick={() => {
            const log = orders.map(o => ({
              order_number: o.order_number,
              created_date: o.created_date,
              status: o.status,
              customer_name: o.customer_name || '',
              customer_email: o.customer_email || o.created_by || '',
              customer_phone: o.customer_phone || '',
              items: (o.items || []).map(item => ({
                ...item,
                productName: resolveProductName(item, products, productMap) || item.productName || item.product_name || 'Unknown',
              })),
              total_amount: o.total_amount,
              subtotal: o.subtotal,
              discount_amount: o.discount_amount,
              shipping_cost: o.shipping_cost,
              payment_method: o.payment_method || '',
              payment_status: o.payment_status || '',
              transaction_id: o.transaction_id || '',
              crypto_currency: o.crypto_currency || '',
              carrier: o.carrier || '',
              tracking_number: o.tracking_number || '',
              estimated_delivery: o.estimated_delivery || '',
              delivered_date: o.delivered_date || '',
              shipping_address: o.shipping_address || {},
              admin_notes: o.admin_notes || '',
              total_product_cost: o.total_product_cost ?? null,
              id: o.id,
            }));
            const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `order-log-${format(new Date(), 'yyyy-MM-dd')}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Downloaded log of ${log.length} orders`);
          }} className="bg-green-700 hover:bg-green-800 text-white font-black uppercase tracking-widest text-xs px-3 sm:px-5 py-4 sm:py-5 rounded-full shadow-lg flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Order Log</span><span className="sm:hidden">Log</span>
          </Button>
        </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
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
                onDelete={handleDeleteOrder}
                isSaving={updateOrderMutation.isPending}
                productMap={productMap}
                products={products}
                adminEmail={user?.email}
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
              <SelectItem value="awaiting_payment" className="text-orange-600">Awaiting Payment</SelectItem>
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
            <button
              onClick={() => setHideCogsEntered(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                hideCogsEntered
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-500'
              }`}
            >
              <DollarSign className="w-3 h-3" />
              {hideCogsEntered ? 'Needs COGS Only' : 'All Orders'}
            </button>
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

        {/* Prediction Dashboard */}
        <PredictionDashboard
          isOpen={showPredictions}
          onClose={() => setShowPredictions(false)}
          orders={orders}
          products={products}
          productCostMap={productCostMap}
        />

        {/* Tax Report Modal */}
        <TaxReportModal
          orders={orders}
          isOpen={showTaxReport}
          onClose={() => setShowTaxReport(false)}
          productCostMap={productCostMap}
          products={products}
          onUpdateProductCost={async (productId, newCost, updatedSpecs) => {
            const updates = updatedSpecs ? { specifications: updatedSpecs } : { cost_price: newCost };
            await base44.entities.Product.update(productId, updates);
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Cost price updated');
          }}
        />
      </div>
    </div>
  );
}