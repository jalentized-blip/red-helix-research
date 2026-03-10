import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import EscrowPaymentModal from './EscrowPaymentModal';

const PLATFORMS = ['Discord', 'Telegram', 'Reddit', 'Facebook', 'Other'];

export default function JoinGroupBuyModal({ groupBuy, isOpen, onClose, onSuccess, currentUser }) {
  const [form, setForm] = useState({ name: '', email: '', social_handle: '', social_platform: 'Discord', notes: '' });
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [showEscrow, setShowEscrow] = useState(false);

  // Auto-fill from logged-in user whenever modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setForm(f => ({
        ...f,
        name: f.name || currentUser.full_name || '',
        email: f.email || currentUser.email || '',
      }));
    }
  }, [isOpen, currentUser]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canSubmit = form.name && form.email;

  const handleJoin = async () => {
    setLoading(true);
    await base44.entities.GroupBuyParticipant.create({
      group_buy_id: groupBuy.id,
      ...form,
      payment_status: 'pending',
    });
    await base44.entities.GroupBuyTest.update(groupBuy.id, {
      current_participants: (groupBuy.current_participants || 0) + 1,
    });
    setLoading(false);
    setJoined(true);
  };

  const resetForm = () => {
    setForm({ name: currentUser?.full_name || '', email: currentUser?.email || '', social_handle: '', social_platform: 'Discord', notes: '' });
  };

  const handleSkipEscrow = () => {
    setJoined(false);
    resetForm();
    onSuccess();
    onClose();
  };

  const handleEscrowSuccess = () => {
    setJoined(false);
    setShowEscrow(false);
    resetForm();
    onSuccess();
    onClose();
  };

  if (!groupBuy) return null;

  // Step 2: After joining — prompt for escrow payment
  if (joined && !showEscrow) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={handleSkipEscrow}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-black flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> You're in!
              </DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <p className="text-slate-600 text-sm mb-4">
                You've joined the group buy. Now, would you like to secure your spot by paying into escrow?
              </p>

              {groupBuy.cost_per_participant ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-blue-900 text-sm mb-1">Escrow Protection Available</p>
                      <p className="text-xs text-blue-700">
                        Your ${groupBuy.cost_per_participant} is held securely by Red Helix Research — not the organizer. Funds only go to the lab once the group is fully funded. Full refund if it doesn't fund.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowEscrow(true)}
                    className="w-full mt-3 bg-[#8B2635] hover:bg-[#6B1827]"
                    size="sm"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Pay ${groupBuy.cost_per_participant} into Escrow
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5 text-sm text-slate-500">
                  Payment coordination will be handled via email before the payment deadline.
                </div>
              )}

              <button
                onClick={handleSkipEscrow}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors py-2"
              >
                Skip for now — I'll coordinate payment manually
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Dialog open={isOpen && !showEscrow} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-black">Join Group Buy</DialogTitle>
          </DialogHeader>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
            <div className="font-black text-black text-sm">{groupBuy.title || `${groupBuy.vendor_name} — ${groupBuy.peptide_name} ${groupBuy.peptide_strength}`}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {groupBuy.test_types?.map(t => (
                <span key={t} className="text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
            {groupBuy.cost_per_participant && (
              <div className="mt-2 text-[#8B2635] font-black text-sm">≈ ${groupBuy.cost_per_participant} / person</div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Your Name / Alias *</label>
              <Input placeholder="Name or handle" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Email * (private, for payment coordination)</label>
              <Input type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Social Handle</label>
                <Input placeholder="@handle" value={form.social_handle} onChange={e => set('social_handle', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Platform</label>
                <select className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#8B2635]" value={form.social_platform} onChange={e => set('social_platform', e.target.value)}>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Notes (optional)</label>
              <Input placeholder="Any questions or notes for the organizer" value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-3">By joining you agree this is for research purposes only.</p>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" size="sm">Cancel</Button>
            <Button onClick={handleJoin} disabled={!canSubmit || loading} className="flex-1 bg-[#8B2635] hover:bg-[#6B1827]" size="sm">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Joining...</> : 'Join Group Buy'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showEscrow && (
        <EscrowPaymentModal
          groupBuy={groupBuy}
          isOpen={showEscrow}
          onClose={() => { setShowEscrow(false); handleSkipEscrow(); }}
          onSuccess={handleEscrowSuccess}
          prefillName={form.name}
          prefillEmail={form.email}
        />
      )}
    </>
  );
}