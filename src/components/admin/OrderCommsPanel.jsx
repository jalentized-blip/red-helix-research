import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Clock, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CARRIERS = {
  USPS: (t) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}`,
  UPS: (t) => `https://www.ups.com/track?tracknum=${t}`,
  FedEx: (t) => `https://www.fedex.com/fedextrack/?tracknumbers=${t}`,
  DHL: (t) => `https://www.dhl.com/en/express/tracking.html?AWB=${t}`,
};

const buildTemplates = (order) => {
  const name = order.customer_name || 'there';
  const num = order.order_number;
  const trackUrl = order.tracking_number && order.carrier && CARRIERS[order.carrier]
    ? CARRIERS[order.carrier](order.tracking_number) : null;
  const trackBtn = trackUrl
    ? `<a href="${trackUrl}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;">Track Your Package →</a>`
    : '';
  const kitTrackUrl = order.kit_tracking_number && order.carrier && CARRIERS[order.carrier]
    ? CARRIERS[order.carrier](order.kit_tracking_number) : null;
  const mainTrackingBlock = order.tracking_number ? `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:12px;">
      <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:800;">📦 Package 1 — Single Vials (from Red Helix Research)</p>
      <p style="margin:0;font-size:20px;font-weight:900;font-family:monospace;color:#0f172a;">${order.tracking_number}</p>
      <p style="margin:6px 0 0;font-size:12px;color:#64748b;">Carrier: ${order.carrier || 'USPS'}</p>
      ${trackUrl ? `<a href="${trackUrl}" style="display:inline-block;margin-top:10px;padding:8px 18px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:12px;">Track Package 1 →</a>` : ''}
    </div>` : '';
  const kitTrackingBlock = order.kit_tracking_number ? `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:12px;">
      <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:800;">🧪 Package 2 — Kit Shipment (from Kit Fulfillment Center)</p>
      <p style="margin:0;font-size:20px;font-weight:900;font-family:monospace;color:#0f172a;">${order.kit_tracking_number}</p>
      <p style="margin:6px 0 0;font-size:12px;color:#64748b;">Carrier: ${order.carrier || 'USPS'}</p>
      ${kitTrackUrl ? `<a href="${kitTrackUrl}" style="display:inline-block;margin-top:10px;padding:8px 18px;background:#8B2635;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:12px;">Track Kit Package →</a>` : ''}
    </div>` : '';

  const itemsHtml = (order.items || []).map(item =>
    `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;font-weight:600;">${item.productName || item.product_name || 'Product'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center;">${item.specification || '—'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center;">×${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#0f172a;text-align:right;">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
    </tr>`
  ).join('');

  const addr = order.shipping_address || {};
  const shippingLine = [addr.address, addr.city, addr.state, addr.zip].filter(Boolean).join(', ');

  return [
    {
      id: 'order_confirmation',
      label: '✅ Order Confirmation',
      subject: `Order Confirmed — #${num} | Red Helix Research`,
      body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#ffffff;">
<div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;margin:-30px -30px 24px -30px;">
  <div style="width:48px;height:48px;background:#dc2626;border-radius:12px;display:inline-block;line-height:48px;margin-bottom:12px;">
    <span style="color:#fff;font-size:18px;font-weight:900;">RH</span>
  </div>
  <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 4px 0;">Order Confirmed!</h1>
  <p style="color:#94a3b8;font-size:12px;margin:0;letter-spacing:1px;text-transform:uppercase;">Order #${num}</p>
</div>
<p>Hi ${name},</p>
<p>Thank you for your order! We've received it and it's now being prepared for shipment. You'll get a separate shipping notification with your tracking number once it's on its way.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:20px 0;">
  <tr style="background:#f8fafc;">
    <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Item</th>
    <th style="padding:8px 8px;text-align:center;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Spec</th>
    <th style="padding:8px 8px;text-align:center;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Qty</th>
    <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Price</th>
  </tr>
  ${itemsHtml}
  ${order.discount_amount > 0 ? `<tr><td colspan="3" style="padding:8px 12px;font-size:13px;color:#16a34a;font-weight:700;">Discount</td><td style="padding:8px 12px;font-size:13px;color:#16a34a;font-weight:700;text-align:right;">-$${(order.discount_amount || 0).toFixed(2)}</td></tr>` : ''}
  <tr><td colspan="3" style="padding:8px 12px;font-size:13px;color:#64748b;">Shipping</td><td style="padding:8px 12px;font-size:13px;color:#64748b;text-align:right;">$${(order.shipping_cost || 15).toFixed(2)}</td></tr>
  <tr style="background:#f8fafc;"><td colspan="3" style="padding:12px;font-size:14px;font-weight:900;color:#0f172a;text-transform:uppercase;">Total</td><td style="padding:12px;font-size:18px;font-weight:900;color:#dc2626;text-align:right;">$${(order.total_amount || 0).toFixed(2)}</td></tr>
</table>
${shippingLine ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:20px;"><p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Shipping To</p><p style="margin:0;font-size:14px;color:#334155;font-weight:600;">${name}</p><p style="margin:2px 0 0;font-size:13px;color:#64748b;">${shippingLine}</p></div>` : ''}
<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
  <p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">Research Use Only</p>
  <p style="margin:0;font-size:12px;color:#7f1d1d;line-height:1.6;">These products are for laboratory research use only — not for human consumption. All sales are final. Contact <a href="mailto:jake@redhelixresearch.com" style="color:#dc2626;">jake@redhelixresearch.com</a> with any questions before contacting your bank.</p>
</div>
<p style="color:#64748b;font-size:13px;">Thank you for choosing Red Helix Research!</p>
</div>`,
    },
    {
      id: 'processing',
      label: '🔄 Order Processing',
      subject: `Order #${num} Confirmed — We're Processing Your Order`,
      body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;">
<h2 style="color:#8B2635;">Order Confirmed!</h2>
<p>Hi ${name},</p>
<p>Thank you for your order! We're pleased to confirm that we have received your order <strong>#${num}</strong> and it is currently being processed.</p>
<p>You can expect to receive your tracking information within the next <strong>24–48 hours</strong> once your order has been dispatched.</p>
<p>If you have any questions or concerns in the meantime, please don't hesitate to reach out to us — we're happy to help.</p>
<p style="margin-top:24px;">Kind regards,<br/><strong>Red Helix Research</strong></p>
</div>`,
    },
    {
      id: 'shipped',
      label: '📦 Order Shipped',
      subject: `Your Order #${num} Has Shipped!`,
      body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;">
<h2 style="color:#dc2626;">Your Order Has Shipped!</h2>
<p>Hi ${name},</p>
<p>Great news — your order <strong>#${num}</strong> is on its way!</p>
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
  <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Tracking Number</p>
  <p style="margin:0;font-size:18px;font-weight:700;font-family:monospace;">${order.tracking_number || 'Tracking number will be added'}</p>
  <p style="margin:6px 0 0;font-size:13px;color:#64748b;">Carrier: ${order.carrier || 'USPS'}</p>
  ${trackBtn}
</div>
<p style="color:#64748b;font-size:13px;">Thank you for choosing Red Helix Research!</p>
</div>`,
    },
    {
      id: 'delay',
      label: '⚠️ Shipping Delay',
      subject: `Update on Your Order #${num}`,
      body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;">
<h2 style="color:#d97706;">Shipping Update for Order #${num}</h2>
<p>Hi ${name},</p>
<p>We wanted to reach out with an update on your order <strong>#${num}</strong>. Unfortunately, there has been a slight delay in shipping.</p>
<p>We sincerely apologize for any inconvenience and are working to get your order to you as soon as possible. We'll send you another update as soon as it ships.</p>
<p>If you have any questions, please don't hesitate to reach out.</p>
<p style="color:#64748b;font-size:13px;">Thank you for your patience — Red Helix Research</p>
</div>`,
    },
    {
      id: 'delivered',
      label: '✅ Order Delivered',
      subject: `Your Order #${num} Has Been Delivered`,
      body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;">
<h2 style="color:#16a34a;">Your Order Has Been Delivered!</h2>
<p>Hi ${name},</p>
<p>Your order <strong>#${num}</strong> has been delivered. We hope you're happy with your purchase!</p>
<p>If you have any questions or concerns about your order, please reach out to us and we'll be happy to help.</p>
<p style="color:#64748b;font-size:13px;">Thank you for choosing Red Helix Research!</p>
</div>`,
    },
    {
      id: 'return_approved',
      label: '↩️ Return Approved',
      subject: `Your Return for Order #${num} Has Been Approved`,
      body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;">
<h2 style="color:#dc2626;">Return Approved — Order #${num}</h2>
<p>Hi ${name},</p>
<p>Your return request for order <strong>#${num}</strong> has been approved. Please ship the item(s) back using the original packaging if possible.</p>
<p>Once we receive your return, we will process your refund within 3–5 business days.</p>
<p>If you have any questions, please contact us.</p>
<p style="color:#64748b;font-size:13px;">Thank you — Red Helix Research</p>
</div>`,
    },
    {
      id: 'kit_info',
      label: '📦 Kit Order Info',
      subject: `Important Info About Your Order #${num} — Kit Shipment Details`,
      body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#ffffff;">
<div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;margin:-30px -30px 24px -30px;">
  <div style="width:48px;height:48px;background:#8B2635;border-radius:12px;display:inline-block;line-height:48px;margin-bottom:12px;">
    <span style="color:#fff;font-size:18px;font-weight:900;">RH</span>
  </div>
  <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 4px 0;">Your Kit Order Is On Its Way!</h1>
  <p style="color:#94a3b8;font-size:12px;margin:0;letter-spacing:1px;text-transform:uppercase;">Order #${num}</p>
</div>
<p>Hi ${name},</p>
<p>Thank you for your order! We wanted to share a few important details since your order includes one of our research kits.</p>

<div style="background:#fef9f0;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:20px 0;">
  <p style="margin:0 0 8px;font-size:11px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:1px;">📦 Two Tracking Numbers</p>
  <p style="margin:0 0 8px;font-size:14px;color:#78350f;line-height:1.7;">Your order may arrive in <strong>two separate shipments</strong> with two different tracking numbers:</p>
  <ul style="margin:0;padding-left:20px;color:#78350f;font-size:14px;line-height:2;">
    <li><strong>Single vial orders</strong> ship directly from us at Red Helix Research.</li>
    <li><strong>Kit orders</strong> ship from our dedicated fulfillment center.</li>
  </ul>
  <p style="margin:10px 0 0;font-size:13px;color:#92400e;">Both packages are on their way — they may arrive on different days, so don't be alarmed!</p>
</div>

<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px 20px;margin:20px 0;">
  <p style="margin:0 0 8px;font-size:11px;font-weight:800;color:#166534;text-transform:uppercase;letter-spacing:1px;">🧪 About Your Kit — Unlabeled Vials</p>
  <p style="margin:0 0 8px;font-size:14px;color:#15803d;line-height:1.7;">Your kit vials will arrive <strong>unlabeled</strong>. This is intentional — our kits are our <strong>wholesale option</strong>, which is how we're able to pass significant savings on to you. By fulfilling kits directly from our fulfillment center without individual labeling, we eliminate additional handling costs and pass those savings directly to you.</p>
  <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#166534;">How to identify your products:</p>
  <ul style="margin:0;padding-left:20px;color:#15803d;font-size:14px;line-height:2;">
    <li>The <strong>label on your kit's box</strong> will display a <strong>batch number</strong> — this corresponds directly to the matching COA on our website.</li>
    <li>Alternatively, you can match the <strong>colored cap</strong> on each vial to its corresponding Certificate of Analysis.</li>
    <li>Visit our COA Reports page at <a href="https://redhelixresearch.com/COAReports" style="color:#16a34a;font-weight:700;">redhelixresearch.com/COAReports</a> to find your batch.</li>
    <li>Each COA includes the peptide name, concentration, purity results, and batch ID — giving you full traceability and confidence in every vial.</li>
  </ul>
</div>

<div style="background:#f0f4ff;border:1px solid #a5b4fc;border-radius:10px;padding:16px 20px;margin:20px 0;">
  <p style="margin:0 0 8px;font-size:11px;font-weight:800;color:#3730a3;text-transform:uppercase;letter-spacing:1px;">🚚 Fulfillment & Delivery Timeline</p>
  <ul style="margin:0;padding-left:20px;color:#4338ca;font-size:14px;line-height:2;">
    <li>Kit fulfillment can take <strong>up to 36 hours</strong> for processing after order confirmation.</li>
    <li>You may receive a tracking number <strong>before tracking updates appear online</strong> — this is normal and simply means the carrier hasn't scanned the first update yet.</li>
    <li>We recommend <strong>USPS Informed Delivery</strong> at <a href="https://informeddelivery.usps.com" style="color:#4338ca;font-weight:700;">informeddelivery.usps.com</a> for real-time visibility if tracking updates are delayed.</li>
    <li>We always aim to have your products delivered <strong>within one week</strong> of your order date.</li>
  </ul>
</div>

<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
  <p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">Research Use Only</p>
  <p style="margin:0;font-size:12px;color:#7f1d1d;line-height:1.6;">These products are for laboratory research use only — not for human consumption. For any issues, please contact <a href="mailto:jake@redhelixresearch.com" style="color:#dc2626;">jake@redhelixresearch.com</a> before contacting your payment provider.</p>
</div>
<p style="color:#64748b;font-size:13px;">Thank you for choosing Red Helix Research!</p>
</div>`,
    },
    {
      id: 'dual_tracking',
      label: '🚚 Both Tracking Numbers (Kit)',
      subject: `Your Order ${num} — Tracking Updates for Both Shipments`,
      body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#ffffff;">
<div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;margin:-30px -30px 24px -30px;">
  <div style="width:48px;height:48px;background:#8B2635;border-radius:12px;display:inline-block;line-height:48px;margin-bottom:12px;">
    <span style="color:#fff;font-size:18px;font-weight:900;">RH</span>
  </div>
  <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 4px 0;">Your Order Is Shipping in Two Packages!</h1>
  <p style="color:#94a3b8;font-size:12px;margin:0;letter-spacing:1px;text-transform:uppercase;">Order #${num}</p>
</div>
<p>Hi ${name},</p>
<p>Because your order includes a <strong>10-vial kit</strong>, it ships from two separate locations. You have <strong>two tracking numbers</strong> below — don't worry if they arrive on different days!</p>
<div style="background:#fef9f0;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
  <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">⚠️ This is normal — both packages are confirmed on their way. Kit processing can take up to 36 hours, so tracking updates may appear at different times.</p>
</div>
${mainTrackingBlock}
${kitTrackingBlock}
<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px 20px;margin:20px 0;">
  <p style="margin:0 0 8px;font-size:11px;font-weight:800;color:#166534;text-transform:uppercase;letter-spacing:1px;">🧪 About Your Kit — Unlabeled Vials</p>
  <p style="margin:0;font-size:14px;color:#15803d;line-height:1.7;">Your kit vials arrive <strong>unlabeled</strong> to keep costs low. Use the <strong>batch number on the kit box</strong> or the <strong>colored vial cap</strong> to identify each peptide. Match them at <a href="https://redhelixresearch.com/COAReports" style="color:#16a34a;font-weight:700;">redhelixresearch.com/COAReports</a>.</p>
</div>
<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;">
  <p style="margin:0 0 4px;font-size:10px;font-weight:800;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">Research Use Only</p>
  <p style="margin:0;font-size:12px;color:#7f1d1d;line-height:1.6;">These products are for laboratory research use only — not for human consumption. For any issues, please contact <a href="mailto:jake@redhelixresearch.com" style="color:#dc2626;">jake@redhelixresearch.com</a> before contacting your payment provider.</p>
</div>
<p style="color:#64748b;font-size:13px;margin-top:20px;">Thank you for choosing Red Helix Research!</p>
</div>`,
    },
    {
      id: 'custom',
      label: '✏️ Custom Message',
      subject: `Regarding Your Order #${num}`,
      body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;">
<p>Hi ${name},</p>
<p></p>
<p style="color:#64748b;font-size:13px;">Thank you — Red Helix Research</p>
</div>`,
    },
  ];
};

export default function OrderCommsPanel({ order, adminEmail }) {
  const queryClient = useQueryClient();
  const templates = useMemo(() => buildTemplates(order), [
    order.tracking_number, order.kit_tracking_number, order.carrier,
    order.customer_name, order.order_number, order.customer_email,
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  // When tracking numbers change and a template is already selected, refresh the body
  useEffect(() => {
    if (selectedTemplate) {
      const tpl = templates.find(t => t.id === selectedTemplate);
      if (tpl) {
        setSubject(tpl.subject);
        setBody(tpl.body);
      }
    }
  }, [templates]);

  const { data: history = [] } = useQuery({
    queryKey: ['order-comms', order.id],
    queryFn: () => base44.entities.OrderCommunication.filter({ order_id: order.id }, '-sent_at'),
  });

  const handleTemplateSelect = (templateId) => {
    const tpl = templates.find(t => t.id === templateId);
    if (tpl) {
      setSelectedTemplate(templateId);
      setSubject(tpl.subject);
      setBody(tpl.body);
    }
  };

  const handleSend = async () => {
    const email = order.customer_email || order.created_by;
    if (!email) { toast.error('No customer email on this order'); return; }
    if (!subject.trim()) { toast.error('Subject is required'); return; }
    if (!body.trim()) { toast.error('Message body is required'); return; }

    setSending(true);
    try {
      await base44.functions.invoke('sendOrderEmail', { to: email, subject, body });

      await base44.entities.OrderCommunication.create({
        order_id: order.id,
        order_number: order.order_number,
        customer_email: email,
        customer_name: order.customer_name || '',
        subject,
        body,
        template_used: selectedTemplate || 'custom',
        sent_by: adminEmail || '',
        sent_at: new Date().toISOString(),
      });

      queryClient.invalidateQueries({ queryKey: ['order-comms', order.id] });
      toast.success('Email sent', { description: `Sent to ${email}` });
      setSubject('');
      setBody('');
      setSelectedTemplate('');
    } catch (err) {
      toast.error('Failed to send email', { description: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Compose */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4 text-[#dc2626]" />
          <h4 className="text-slate-700 text-[10px] uppercase tracking-widest font-black">Send Customer Email</h4>
        </div>

        <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
          <SelectTrigger className="bg-white border-slate-200 text-slate-900 h-9 text-sm">
            <SelectValue placeholder="Choose a template..." />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            {templates.map(t => (
              <SelectItem key={t.id} value={t.id} className="text-slate-900 text-sm">{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject..."
          className="bg-white border-slate-200 text-slate-900 h-9 text-sm"
        />

        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Email body (HTML supported)..."
          rows={6}
          className="bg-white border-slate-200 text-slate-900 text-xs font-mono resize-none"
        />

        {/* Preview Toggle */}
        {body && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setPreviewOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100 hover:bg-slate-200 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                {previewOpen ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">
                  {previewOpen ? 'Hide Preview' : 'Preview Email'}
                </span>
              </div>
              {previewOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {previewOpen && (
              <div className="bg-white border-t border-slate-200">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Subject: <span className="text-slate-700 normal-case font-semibold">{subject || '(no subject)'}</span>
                </div>
                <div
                  className="p-4 max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-400">
            To: <span className="font-bold text-slate-600">{order.customer_email || order.created_by || '—'}</span>
          </p>
          <Button
            onClick={handleSend}
            disabled={sending || !subject || !body}
            size="sm"
            className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-xs h-8"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            {sending ? 'Sending...' : 'Send Email'}
          </Button>
        </div>
      </div>

      {/* History */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setHistoryOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">
              Communication History ({history.length})
            </span>
          </div>
          {historyOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {historyOpen && (
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-6">No emails sent yet for this order.</p>
            ) : (
              history.map((msg) => (
                <div key={msg.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className="text-sm font-bold text-slate-900 leading-tight">{msg.subject}</p>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap flex-shrink-0">
                      {msg.sent_at ? format(new Date(msg.sent_at), 'MMM d, h:mm a') : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span>To: {msg.customer_email}</span>
                    {msg.template_used && msg.template_used !== 'custom' && (
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded-full capitalize">{msg.template_used.replace('_', ' ')}</span>
                    )}
                    {msg.sent_by && <span>By: {msg.sent_by}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}