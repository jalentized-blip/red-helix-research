import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Clock, ChevronDown, ChevronUp } from 'lucide-react';
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

  return [
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
  const templates = buildTemplates(order);

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);

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
      await base44.integrations.Core.SendEmail({ to: email, subject, body });

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