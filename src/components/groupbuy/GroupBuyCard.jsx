import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, FlaskConical, ExternalLink, Lock, Globe, CheckCircle2, Clock, Beaker, Shield, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import EscrowStatusBar from './EscrowStatusBar';

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-green-100 text-green-700 border-green-200' },
  funded: { label: 'Funded', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  testing: { label: 'In Testing', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  completed: { label: 'Completed', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600 border-red-200' },
};

const TEST_LABELS = {
  purity: 'Purity',
  sterility: 'Sterility',
  heavy_metals: 'Heavy Metals',
  endotoxin: 'Endotoxin',
  ph: 'pH',
  vacuum: 'Vacuum',
};

export default function GroupBuyCard({ groupBuy, onJoin, onLeave, onPayEscrow, index, currentUser, myParticipation }) {
  const [leaving, setLeaving] = useState(false);
  const status = STATUS_CONFIG[groupBuy.status] || STATUS_CONFIG.open;
  const cutoff = groupBuy.cutoff_date ? new Date(groupBuy.cutoff_date) : null;
  const isPast = cutoff && cutoff < new Date();
  const canJoin = groupBuy.status === 'open' && !isPast;
  const isLoggedIn = !!currentUser;
  const hasJoined = !!myParticipation;
  const needsEscrow = hasJoined && myParticipation?.payment_status === 'pending' && groupBuy.cost_per_participant;
  const participantPct = groupBuy.max_participants
    ? Math.min(100, ((groupBuy.current_participants || 0) / groupBuy.max_participants) * 100)
    : null;

  const handleLeave = async () => {
    setLeaving(true);
    await onLeave(groupBuy);
    setLeaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${status.color}`}>
              {status.label}
            </span>
            {groupBuy.results_public ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><Globe className="w-3 h-3" />Public Results</span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><Lock className="w-3 h-3" />Private</span>
            )}
          </div>
          <h3 className="font-black text-black text-sm leading-tight">
            {groupBuy.title || `${groupBuy.vendor_name} — ${groupBuy.peptide_name} ${groupBuy.peptide_strength}`}
          </h3>
        </div>
        {groupBuy.cost_per_participant && (
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-black text-[#8B2635]">${groupBuy.cost_per_participant}</div>
            <div className="text-[10px] text-slate-400 font-bold">/ person</div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Beaker className="w-3.5 h-3.5 text-[#8B2635]" />
          <span className="font-bold">{groupBuy.vendor_name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <FlaskConical className="w-3.5 h-3.5 text-slate-400" />
          <span>{groupBuy.peptide_name} {groupBuy.peptide_strength}</span>
        </div>
        {groupBuy.batch_number && (
          <div className="col-span-2 text-slate-400 text-[11px]">
            Batch: {groupBuy.batch_number}
          </div>
        )}
        {cutoff && (
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Cutoff: {format(cutoff, 'MMM d, yyyy')}</span>
          </div>
        )}
        {groupBuy.current_participants !== undefined && (
          <div className="flex items-center gap-1.5 text-slate-500">
            <Users className="w-3.5 h-3.5" />
            <span>{groupBuy.current_participants || 0}{groupBuy.max_participants ? `/${groupBuy.max_participants}` : ''} joined</span>
          </div>
        )}
      </div>

      {/* Participant progress bar */}
      {participantPct !== null && (
        <div className="mb-3">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#8B2635] rounded-full transition-all" style={{ width: `${participantPct}%` }} />
          </div>
        </div>
      )}

      {/* Escrow status */}
      <EscrowStatusBar groupBuy={groupBuy} />

      {/* Test tags */}
      <div className="flex flex-wrap gap-1.5 mb-4 flex-1 content-start">
        {(groupBuy.test_types || []).map(t => (
          <span key={t} className="inline-flex text-[10px] font-bold uppercase tracking-wider bg-[#8B2635]/8 border border-[#8B2635]/20 text-[#8B2635] px-2 py-0.5 rounded-full w-fit">
            {TEST_LABELS[t] || t}
          </span>
        ))}
      </div>

      {/* Organizer */}
      {groupBuy.organizer_name && (
        <div className="text-[11px] text-slate-400 mb-3">
          Organized by <span className="font-bold text-slate-500">{groupBuy.organizer_name}</span>
          {groupBuy.organizer_social && <span className="ml-1">({groupBuy.organizer_social} on {groupBuy.organizer_platform})</span>}
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto">
        {groupBuy.status === 'completed' && groupBuy.coa_url ? (
          <a href={groupBuy.coa_url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="w-3.5 h-3.5 mr-2" /> View Results / COA
            </Button>
          </a>
        ) : canJoin ? (
          <Button onClick={() => onJoin(groupBuy)} size="sm" className="w-full bg-[#8B2635] hover:bg-[#6B1827]">
            <Users className="w-3.5 h-3.5 mr-2" /> Join This Group Buy
          </Button>
        ) : (
          <Button disabled size="sm" variant="outline" className="w-full text-slate-400">
            {groupBuy.status === 'completed' ? <><CheckCircle2 className="w-3.5 h-3.5 mr-2" />Completed</> : isPast ? <><Clock className="w-3.5 h-3.5 mr-2" />Closed</>  : 'Not Accepting'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}