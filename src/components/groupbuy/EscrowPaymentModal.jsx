import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, Shield, Lock, AlertCircle, Info } from 'lucide-react';

export default function EscrowPaymentModal({ groupBuy, isOpen, onClose, onSuccess, prefillEmail, prefillName }) {
  const [cardLoaded, setCardLoaded] = useState(false);
  const [card, setCard] = useState(null);
  const [payments, setPayments] = useState(null);
  const [name, setName] = useState(prefillName || '');
  const [email, setEmail] = useState(prefillEmail || '');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const amountDollars = groupBuy?.cost_per_participant || 0;
  const amountCents = Math.round(amountDollars * 100);

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
    if (prefillName) setName(prefillName);
  }, [prefillEmail, prefillName]);

  useEffect(() => {
    if (!isOpen || !amountCents) return;

    const appId = 'sandbox-sq0idb-XUb-Hf6z9wsMmCxp8iINEA'; // Square App ID
    const locationId = 'LBV8JNM70C8ZK'; // Square Location ID

    const loadSquare = async () => {
      if (!window.Square) {
        const script = document.createElement('script');
        script.src = 'https://web.squarecdn.com/v1/square.js';
        script.onload = () => initCard(appId, locationId);
        document.head.appendChild(script);
      } else {
        initCard(appId, locationId);
      }
    };

    const initCard = async (appId, locationId) => {
      try {
        const p = window.Square.payments(appId, locationId);
        setPayments(p);
        const c = await p.card();
        await c.attach('#escrow-card-container');
        setCard(c);
        setCardLoaded(true);
      } catch (e) {
        setError('Failed to load payment form. Please try again.');
      }
    };

    loadSquare();

    return () => {
      if (card) {
        card.destroy().catch(() => {});
        setCard(null);
        setCardLoaded(false);
      }
    };
  }, [isOpen]);

  const handlePay = async () => {
    if (!card || !name || !email) return;
    setLoading(true);
    setError('');

    const result = await card.tokenize();
    if (result.status !== 'OK') {
      setError(result.errors?.[0]?.message || 'Card tokenization failed.');
      setLoading(false);
      return;
    }

    const res = await base44.functions.invoke('groupBuyEscrowPayment', {
      action: 'charge',
      group_buy_id: groupBuy.id,
      amount_cents: amountCents,
      nonce: result.token,
      participant_name: name,
      participant_email: email,
    });

    if (res.data?.success) {
      setDone(true);
      setTimeout(() => {
        setDone(false);
        onSuccess?.();
        onClose();
      }, 3000);
    } else {
      setError(res.data?.error || 'Payment failed. Please try again.');
    }
    setLoading(false);
  };

  if (!groupBuy) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-black flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#8B2635]" /> Pay into Escrow
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="font-black text-black text-lg">Payment Held in Escrow!</p>
            <p className="text-slate-500 text-sm text-center max-w-xs">
              Your ${amountDollars} is securely held. It will only be released to the lab once enough participants have funded — otherwise you'll be refunded.
            </p>
          </div>
        ) : (
          <>
            {/* Escrow explanation */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3 flex gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                <strong>How escrow protects you:</strong> Your payment is held securely by Red Helix Research — not sent to the organizer. Funds are only released to the lab once the group is fully funded. If the group buy doesn't reach its goal, you receive a full refund.
              </p>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
              <div className="font-black text-black text-sm mb-1">
                {groupBuy.title || `${groupBuy.vendor_name} — ${groupBuy.peptide_name} ${groupBuy.peptide_strength}`}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">Your share</span>
                <span className="text-lg font-black text-[#8B2635]">${amountDollars.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                <Lock className="w-3 h-3" /> Held securely in escrow until lab payment
              </div>
            </div>

            {/* Name / Email */}
            <div className="space-y-3 mb-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Your Name *</label>
                <Input placeholder="Name or alias" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Email * (for refund/receipt)</label>
                <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            {/* Square Card Form */}
            <div className="mb-3">
              <label className="text-xs font-bold text-slate-500 mb-1 block">Card Details *</label>
              <div
                id="escrow-card-container"
                className="border border-slate-200 rounded-lg p-3 bg-white min-h-[44px]"
              />
              {!cardLoaded && (
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading secure payment form...
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <p className="text-[10px] text-slate-400 mb-3">
              Secured by Square. Red Helix Research acts as escrow holder. By paying you agree this is for research purposes only.
            </p>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1" size="sm">Cancel</Button>
              <Button
                onClick={handlePay}
                disabled={!cardLoaded || !name || !email || loading}
                className="flex-1 bg-[#8B2635] hover:bg-[#6B1827]"
                size="sm"
              >
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : <><Lock className="w-4 h-4 mr-1" />Pay ${amountDollars.toFixed(2)} into Escrow</>}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}