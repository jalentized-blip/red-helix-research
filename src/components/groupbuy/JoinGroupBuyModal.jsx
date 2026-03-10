import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2 } from 'lucide-react';

const PLATFORMS = ['Discord', 'Telegram', 'Reddit', 'Facebook', 'Other'];

export default function JoinGroupBuyModal({ groupBuy, isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', social_handle: '', social_platform: 'Discord', notes: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canSubmit = form.name && form.email;

  const handleJoin = async () => {
    setLoading(true);
    await base44.entities.GroupBuyParticipant.create({
      group_buy_id: groupBuy.id,
      ...form,
      payment_status: 'pending',
    });
    // Increment participant count
    await base44.entities.GroupBuyTest.update(groupBuy.id, {
      current_participants: (groupBuy.current_participants || 0) + 1,
    });
    setLoading(false);
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setForm({ name: '', email: '', social_handle: '', social_platform: 'Discord', notes: '' });
      onSuccess();
      onClose();
    }, 2500);
  };

  if (!groupBuy) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-black">Join Group Buy</DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="font-black text-black text-lg">You're in!</p>
            <p className="text-slate-500 text-sm text-center">You'll receive payment instructions at <strong>{form.email}</strong> before the payment deadline.</p>
          </div>
        ) : (
          <>
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

            <p className="text-xs text-slate-400 mt-3">By joining you agree this is for research purposes only. Payment will be coordinated via email before the payment deadline.</p>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={onClose} className="flex-1" size="sm">Cancel</Button>
              <Button onClick={handleJoin} disabled={!canSubmit || loading} className="flex-1 bg-[#8B2635] hover:bg-[#6B1827]" size="sm">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Joining...</> : 'Join Group Buy'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}