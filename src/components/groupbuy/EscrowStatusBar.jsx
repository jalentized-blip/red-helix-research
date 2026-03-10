import React from 'react';
import { Shield, Lock } from 'lucide-react';

export default function EscrowStatusBar({ groupBuy }) {
  const totalCents = (groupBuy.cost_per_participant || 0) * 100 * (groupBuy.max_participants || groupBuy.current_participants || 1);
  const heldCents = groupBuy.escrow_balance_cents || 0;
  const pct = totalCents > 0 ? Math.min(100, (heldCents / totalCents) * 100) : 0;
  const heldDollars = (heldCents / 100).toFixed(2);
  const totalDollars = (totalCents / 100).toFixed(2);

  if (!heldCents && groupBuy.status !== 'open') return null;

  return (
    <div className="mb-3 bg-blue-50/60 border border-blue-100 rounded-xl px-3 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1 text-[10px] font-black text-blue-700 uppercase tracking-wider">
          <Shield className="w-3 h-3" /> Escrow
        </div>
        <div className="text-[10px] font-bold text-blue-600">
          ${heldDollars} held{totalCents > 0 ? ` / $${totalDollars} goal` : ''}
        </div>
      </div>
      <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-1 mt-1 text-[10px] text-blue-500">
        <Lock className="w-2.5 h-2.5" />
        Funds held by Red Helix — not released until lab payment
      </div>
    </div>
  );
}