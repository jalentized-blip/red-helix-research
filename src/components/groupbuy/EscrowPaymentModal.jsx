import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, Shield, Lock, AlertCircle, Info, Send, CreditCard } from 'lucide-react';
import TurnstileWidget from '@/components/TurnstileWidget';

export default function EscrowPaymentModal({ groupBuy, isOpen, onClose, onSuccess, prefillEmail, prefillName }) {
  const [name, setName] = useState(prefillName || '');
  const [email, setEmail] = useState(prefillEmail || '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState(null);

  const amountDollars = groupBuy?.cost_per_participant || 0;
  const amountCents = Math.round(amountDollars * 100);
  const groupBuyTitle = groupBuy?.title || `${groupBuy?.vendor_name} — ${groupBuy?.peptide_name} ${groupBuy?.peptide_strength}`;

  const handleSendLink = async () => {
    if (!name.trim() || !email.trim() || !email.includes('@')) {
      setError('Please enter your name and a valid email address.');
      return;
    }
    if (!turnstileToken) {
      setError('Please complete the security verification.');
      return;
    }
    setError('');
    setLoading(true);

    // 1. Create Square checkout link via the same backend function used in checkout
    const fnRes = await fetch('https://red-helix-research-f58be972.base44.app/functions/createSquareCheckout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{
          productName: `Group Buy Escrow — ${groupBuyTitle}`,
          specification: `${groupBuy?.peptide_name || ''} ${groupBuy?.peptide_strength || ''}`.trim(),
          price: amountDollars,
          quantity: 1,
        }],
        customerEmail: email.trim(),
        customerName: name.trim(),
        orderNumber: `ESCROW-${groupBuy?.id?.slice(-8)?.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
        shippingCost: 0,
        turnstileToken,
        // Flag this as an escrow payment so the webhook/backend can handle it differently
        metadata: {
          type: 'group_buy_escrow',
          group_buy_id: groupBuy?.id,
          participant_name: name.trim(),
          participant_email: email.trim(),
          amount_cents: amountCents,
        },
      }),
    });

    const fnData = await fnRes.json();

    if (!fnRes.ok || !fnData?.checkoutUrl) {
      setError(fnData?.error || 'Failed to create payment link. Please try again.');
      setLoading(false);
      return;
    }

    const checkoutUrl = fnData.checkoutUrl;

    // 2. Record escrow contribution as pending (will be confirmed via webhook or admin)
    await base44.functions.invoke('groupBuyEscrowPayment', {
      action: 'record_pending',
      group_buy_id: groupBuy.id,
      amount_cents: amountCents,
      participant_name: name.trim(),
      participant_email: email.trim(),
      square_payment_link_id: fnData.paymentLinkId || null,
      checkout_url: checkoutUrl,
    });

    // 3. Send email with the payment link
    const emailBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<tr>
  <td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 40px;text-align:center;">
    <div style="width:48px;height:48px;background:#8B2635;border-radius:12px;display:inline-block;line-height:48px;margin-bottom:14px;">
      <span style="color:#fff;font-size:18px;font-weight:900;">RH</span>
    </div>
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px 0;">Group Buy Escrow Payment</h1>
    <p style="color:#94a3b8;font-size:12px;font-weight:600;margin:0;text-transform:uppercase;letter-spacing:1px;">Red Helix Research</p>
  </td>
</tr>
<tr>
  <td style="padding:32px 40px;">
    <p style="color:#334155;font-size:15px;font-weight:600;margin:0 0 8px 0;">Hi ${name.trim()},</p>
    <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 20px 0;">
      Here's your secure escrow payment link for the group buy below. Your funds will be held securely by Red Helix Research and only released to the lab once the group is fully funded.
    </p>
    <div style="background:#f1f5f9;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px 0;">Group Buy</p>
      <p style="color:#0f172a;font-size:15px;font-weight:800;margin:0 0 10px 0;">${groupBuyTitle}</p>
      <div style="border-top:1px solid #e2e8f0;padding-top:10px;display:flex;justify-content:space-between;">
        <span style="color:#64748b;font-size:13px;">Your share (escrow)</span>
        <span style="color:#8B2635;font-size:18px;font-weight:900;">$${amountDollars.toFixed(2)}</span>
      </div>
    </div>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
      <p style="color:#1d4ed8;font-size:12px;font-weight:700;margin:0 0 4px 0;">🔒 How Escrow Protects You</p>
      <p style="color:#3b82f6;font-size:12px;line-height:1.5;margin:0;">
        Your payment is held by Red Helix Research — not the organizer. If the group doesn't reach its funding goal, you receive a <strong>full refund</strong>.
      </p>
    </div>
  </td>
</tr>
<tr>
  <td style="padding:0 40px 28px 40px;" align="center">
    <a href="${checkoutUrl}" target="_blank" style="display:inline-block;background:#8B2635;color:#fff;font-size:15px;font-weight:800;text-decoration:none;padding:16px 48px;border-radius:12px;text-transform:uppercase;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(139,38,53,0.3);">
      Pay $${amountDollars.toFixed(2)} into Escrow
    </a>
    <p style="color:#94a3b8;font-size:11px;margin:12px 0 0 0;">
      If the button doesn't work: <a href="${checkoutUrl}" style="color:#8B2635;word-break:break-all;">${checkoutUrl}</a>
    </p>
  </td>
</tr>
<tr>
  <td style="background:#f8fafc;padding:16px 40px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="color:#94a3b8;font-size:11px;margin:0;">Red Helix Research | <a href="mailto:jake@redhelixresearch.com" style="color:#8B2635;text-decoration:none;">jake@redhelixresearch.com</a></p>
  </td>
</tr>
</table>
</td></tr></table>
</body>
</html>`;

    await base44.integrations.Core.SendEmail({
      from_name: 'Red Helix Research',
      to: email.trim(),
      subject: `Your Group Buy Escrow Payment Link — $${amountDollars.toFixed(2)}`,
      body: emailBody,
    });

    setSent(true);
    setLoading(false);
  };

  const handleClose = () => {
    setSent(false);
    setError('');
    onClose();
  };

  if (!groupBuy) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-black flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#8B2635]" /> Pay into Escrow
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center py-8 gap-3 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="font-black text-black text-lg">Payment Link Sent!</p>
            <p className="text-slate-500 text-sm max-w-xs">
              Check your email at <strong>{email}</strong> and click the secure payment link to complete your escrow contribution.
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 w-full text-left mt-2">
              <p className="text-xs font-black text-blue-700 mb-1">What happens next?</p>
              <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
                <li>Check your inbox (and spam folder)</li>
                <li>Click "Pay into Escrow" in the email</li>
                <li>Complete payment on the secure Square page</li>
                <li>Your funds are held until the group is fully funded</li>
              </ol>
            </div>
            <Button onClick={handleClose} className="mt-2 w-full bg-[#8B2635] hover:bg-[#6B1827]">Done</Button>
          </div>
        ) : (
          <>
            {/* Escrow explanation */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3 flex gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                <strong>How escrow protects you:</strong> Your payment is held securely by Red Helix Research — not the organizer. Funds are only released to the lab once the group is fully funded. If the goal isn't met, you get a full refund.
              </p>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
              <div className="font-black text-black text-sm mb-1 truncate">{groupBuyTitle}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">Your share</span>
                <span className="text-lg font-black text-[#8B2635]">${amountDollars.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                <Lock className="w-3 h-3" /> Held securely in escrow until lab payment
              </div>
            </div>

            {/* How it works */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 flex items-start gap-2">
              <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600">
                We'll email you a secure <strong>Square payment link</strong>. Click it to pay with any debit or credit card — your card details are never shared with us.
              </p>
            </div>

            {/* Name / Email */}
            <div className="space-y-3 mb-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Your Name *</label>
                <Input placeholder="Name or alias" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Email * (payment link will be sent here)</label>
                <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <p className="text-[10px] text-slate-400 mb-3">
              Secured by Square. Red Helix Research acts as escrow holder. By paying you agree this is for research purposes only.
            </p>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1" size="sm">Cancel</Button>
              <Button
                onClick={handleSendLink}
                disabled={!name.trim() || !email.trim() || loading}
                className="flex-1 bg-[#8B2635] hover:bg-[#6B1827]"
                size="sm"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Link...</>
                  : <><Send className="w-4 h-4 mr-1" />Send Payment Link</>
                }
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}