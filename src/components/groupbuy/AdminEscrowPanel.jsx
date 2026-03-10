import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, RefreshCw, CheckCircle2, Loader2, AlertCircle, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS_COLORS = {
  held: 'bg-blue-100 text-blue-700',
  released_to_lab: 'bg-green-100 text-green-700',
  refunded: 'bg-slate-100 text-slate-500',
};

export default function AdminEscrowPanel({ groupBuy }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const { data: contributions = [], isLoading } = useQuery({
    queryKey: ['escrow', groupBuy.id],
    queryFn: () => base44.entities.GroupBuyEscrow.filter({ group_buy_id: groupBuy.id }),
    enabled: expanded,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['escrow', groupBuy.id] });
    queryClient.invalidateQueries({ queryKey: ['groupBuys'] });
  };

  const heldTotal = contributions.filter(c => c.status === 'held').reduce((s, c) => s + c.amount_cents, 0);
  const displayBalance = (groupBuy.escrow_balance_cents || 0) / 100;

  const handleRefund = async (escrowId) => {
    setActionLoading(escrowId);
    setError('');
    const res = await base44.functions.invoke('groupBuyEscrowPayment', { action: 'refund', escrow_id: escrowId });
    if (!res.data?.success) setError(res.data?.error || 'Refund failed');
    setActionLoading(null);
    refresh();
  };

  const handleRelease = async () => {
    setActionLoading('release');
    setError('');
    const res = await base44.functions.invoke('groupBuyEscrowPayment', { action: 'release', group_buy_id: groupBuy.id });
    if (!res.data?.success) setError(res.data?.error || 'Release failed');
    setActionLoading(null);
    refresh();
  };

  return (
    <div className="mt-3 border border-blue-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="font-black text-blue-800 text-sm">Escrow</span>
          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">${displayBalance.toFixed(2)} held</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-blue-500" />}
      </button>

      {expanded && (
        <div className="bg-white p-4">
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {/* Release all */}
          {heldTotal > 0 && (
            <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl p-3 mb-4">
              <div>
                <p className="font-black text-green-800 text-sm">Release to Lab</p>
                <p className="text-xs text-green-600">${(heldTotal / 100).toFixed(2)} ready — marks group buy as "testing"</p>
              </div>
              <Button
                size="sm"
                onClick={handleRelease}
                disabled={actionLoading === 'release'}
                className="bg-green-600 hover:bg-green-700 text-white text-xs"
              >
                {actionLoading === 'release' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" />Release</>}
              </Button>
            </div>
          )}

          {/* Contributions list */}
          {isLoading ? (
            <div className="text-center py-4 text-slate-400 text-xs">Loading...</div>
          ) : contributions.length === 0 ? (
            <div className="text-center py-4 text-slate-400 text-xs">No escrow contributions yet.</div>
          ) : (
            <div className="space-y-2">
              {contributions.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-black truncate">{c.participant_name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{c.participant_email}</div>
                    <div className="text-[10px] text-slate-400">${(c.amount_cents / 100).toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                    {c.status === 'held' && (
                      <button
                        onClick={() => handleRefund(c.id)}
                        disabled={!!actionLoading}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
                      >
                        {actionLoading === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Refund'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}