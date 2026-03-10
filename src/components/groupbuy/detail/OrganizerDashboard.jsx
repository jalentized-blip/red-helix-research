import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings, UserX, DollarSign, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrganizerDashboard({ groupBuy, currentUser }) {
  const [removing, setRemoving] = useState(null);
  const queryClient = useQueryClient();

  const { data: participants = [] } = useQuery({
    queryKey: ['gbParticipants', groupBuy.id],
    queryFn: () => base44.entities.GroupBuyParticipant.filter({ group_buy_id: groupBuy.id }, 'created_date'),
  });

  const { data: escrows = [] } = useQuery({
    queryKey: ['gbEscrows', groupBuy.id],
    queryFn: () => base44.entities.GroupBuyEscrow.filter({ group_buy_id: groupBuy.id }),
  });

  const handleRemove = async (participant) => {
    setRemoving(participant.id);
    await base44.entities.GroupBuyParticipant.delete(participant.id);
    await base44.entities.GroupBuyTest.update(groupBuy.id, {
      current_participants: Math.max(0, (groupBuy.current_participants || 1) - 1),
    });
    queryClient.invalidateQueries({ queryKey: ['gbParticipants', groupBuy.id] });
    queryClient.invalidateQueries({ queryKey: ['groupBuys'] });
    setRemoving(null);
  };

  const escrowByEmail = {};
  escrows.forEach(e => { escrowByEmail[e.participant_email] = e; });

  const totalEscrow = escrows.filter(e => e.status === 'held').reduce((s, e) => s + (e.amount_cents || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-[#8B2635]/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 bg-[#8B2635]/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#8B2635]" />
          <span className="font-black text-sm text-[#8B2635]">Organizer Dashboard</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-green-600" /><strong className="text-green-700">${(totalEscrow / 100).toFixed(2)}</strong> held</span>
          <span><strong>{participants.length}</strong> participant{participants.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="divide-y divide-slate-50">
        {participants.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">No participants yet.</p>
        ) : (
          participants.map(p => {
            const escrow = escrowByEmail[p.email];
            const paid = escrow?.status === 'held' || p.payment_status === 'paid';
            return (
              <div key={p.id} className="px-4 py-3 flex items-center gap-3 group hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 flex-shrink-0">
                  {(p.name || p.email)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-black truncate">{p.name || p.email}</p>
                  <p className="text-[11px] text-slate-400 truncate">{p.email}</p>
                  {p.social_handle && (
                    <p className="text-[10px] text-slate-400">{p.social_handle} ({p.social_platform})</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {paid ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Paid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                  <button
                    onClick={() => handleRemove(p)}
                    disabled={removing === p.id}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-500 transition-all border border-transparent hover:border-red-200 hover:bg-red-50 rounded px-1.5 py-0.5"
                  >
                    {removing === p.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <UserX className="w-3 h-3" />}
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}