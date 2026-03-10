import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, FlaskConical, Users, Clock, Globe, Lock, ExternalLink, Shield, CheckCircle2, Beaker, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import EscrowStatusBar from '@/components/groupbuy/EscrowStatusBar';
import JoinGroupBuyModal from '@/components/groupbuy/JoinGroupBuyModal';
import EscrowPaymentModal from '@/components/groupbuy/EscrowPaymentModal';
import GroupBuyChat from '@/components/groupbuy/detail/GroupBuyChat';
import AnnouncementsPanel from '@/components/groupbuy/detail/AnnouncementsPanel';
import PollsPanel from '@/components/groupbuy/detail/PollsPanel';
import VialDonorsPanel from '@/components/groupbuy/detail/VialDonorsPanel';
import OrganizerDashboard from '@/components/groupbuy/detail/OrganizerDashboard';

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-green-100 text-green-700 border-green-200' },
  funded: { label: 'Funded', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  testing: { label: 'In Testing', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  completed: { label: 'Completed', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600 border-red-200' },
};

const TEST_LABELS = {
  purity: 'Purity', sterility: 'Sterility', heavy_metals: 'Heavy Metals',
  endotoxin: 'Endotoxin', ph: 'pH', vacuum: 'Vacuum',
};

export default function GroupBuyDetail() {
  const params = new URLSearchParams(window.location.search);
  const groupBuyId = params.get('id');
  const [currentUser, setCurrentUser] = useState(null);
  const [showJoin, setShowJoin] = useState(false);
  const [showEscrow, setShowEscrow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: groupBuy, isLoading } = useQuery({
    queryKey: ['groupBuy', groupBuyId],
    queryFn: () => base44.entities.GroupBuyTest.filter({ id: groupBuyId }).then(r => r[0]),
    enabled: !!groupBuyId,
  });

  const { data: myParticipations = [] } = useQuery({
    queryKey: ['myParticipations', currentUser?.email],
    queryFn: () => base44.entities.GroupBuyParticipant.filter({ email: currentUser.email }),
    enabled: !!currentUser?.email,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['groupBuy', groupBuyId] });
    queryClient.invalidateQueries({ queryKey: ['myParticipations'] });
    queryClient.invalidateQueries({ queryKey: ['gbParticipants', groupBuyId] });
  };

  if (!groupBuyId) return <div className="pt-32 text-center text-slate-400">No group buy selected.</div>;
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#8B2635]" />
    </div>
  );
  if (!groupBuy) return <div className="pt-32 text-center text-slate-400">Group buy not found.</div>;

  const myParticipation = myParticipations.find(p => p.group_buy_id === groupBuyId);
  const hasJoined = !!myParticipation;
  const needsEscrow = hasJoined && myParticipation?.payment_status === 'pending' && groupBuy.cost_per_participant;
  const cutoff = groupBuy.cutoff_date ? new Date(groupBuy.cutoff_date) : null;
  const isPast = cutoff && cutoff < new Date();
  const canJoin = groupBuy.status === 'open' && !isPast;
  const status = STATUS_CONFIG[groupBuy.status] || STATUS_CONFIG.open;

  // Organizer check: the person who created the group buy or an admin
  const isOrganizer = currentUser && (
    groupBuy.created_by === currentUser.email ||
    groupBuy.organizer_email === currentUser.email ||
    currentUser.role === 'admin'
  );

  const participantPct = groupBuy.max_participants
    ? Math.min(100, ((groupBuy.current_participants || 0) / groupBuy.max_participants) * 100)
    : null;

  const handleLeave = async () => {
    if (!myParticipation) return;
    setLeaving(true);
    await base44.entities.GroupBuyParticipant.delete(myParticipation.id);
    await base44.entities.GroupBuyTest.update(groupBuy.id, {
      current_participants: Math.max(0, (groupBuy.current_participants || 1) - 1),
    });
    refresh();
    setLeaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back */}
        <Link to={createPageUrl('GroupBuy')} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#8B2635] mb-6 transition-colors text-sm font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Group Buys
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — details + actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${status.color}`}>
                  {status.label}
                </span>
                {groupBuy.results_public
                  ? <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><Globe className="w-3 h-3" />Public Results</span>
                  : <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><Lock className="w-3 h-3" />Private</span>
                }
                {hasJoined && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> You're in
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-black mb-4">
                {groupBuy.title || `${groupBuy.vendor_name} — ${groupBuy.peptide_name} ${groupBuy.peptide_strength}`}
              </h1>

              {groupBuy.description && (
                <p className="text-slate-600 text-sm mb-4">{groupBuy.description}</p>
              )}

              {/* Key details grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Vendor</p>
                  <p className="font-black text-black text-sm">{groupBuy.vendor_name}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Peptide</p>
                  <p className="font-black text-black text-sm">{groupBuy.peptide_name} {groupBuy.peptide_strength}</p>
                </div>
                {groupBuy.batch_number && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Batch</p>
                    <p className="font-black text-black text-sm">{groupBuy.batch_number}</p>
                  </div>
                )}
                {groupBuy.cost_per_participant && (
                  <div className="bg-[#8B2635]/5 rounded-xl p-3 border border-[#8B2635]/10">
                    <p className="text-[10px] text-[#8B2635] font-bold uppercase tracking-wider mb-1">Cost / Person</p>
                    <p className="font-black text-[#8B2635] text-xl">${groupBuy.cost_per_participant}</p>
                  </div>
                )}
                {groupBuy.total_cost && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Cost</p>
                    <p className="font-black text-black text-sm">${groupBuy.total_cost}</p>
                  </div>
                )}
                {cutoff && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Cutoff Date</p>
                    <p className="font-black text-black text-sm">{format(cutoff, 'MMM d, yyyy')}</p>
                  </div>
                )}
              </div>

              {/* Participants */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <Users className="w-3.5 h-3.5" />
                    {groupBuy.current_participants || 0}{groupBuy.max_participants ? `/${groupBuy.max_participants}` : ''} participants
                  </span>
                  {participantPct !== null && (
                    <span className="text-[10px] text-slate-400">{Math.round(participantPct)}% full</span>
                  )}
                </div>
                {participantPct !== null && (
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#8B2635] rounded-full transition-all" style={{ width: `${participantPct}%` }} />
                  </div>
                )}
              </div>

              {/* Escrow bar */}
              <EscrowStatusBar groupBuy={groupBuy} />

              {/* Test types */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(groupBuy.test_types || []).map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-xs font-bold bg-[#8B2635]/8 border border-[#8B2635]/20 text-[#8B2635] px-3 py-1 rounded-full">
                    <Beaker className="w-3 h-3" />{TEST_LABELS[t] || t}
                  </span>
                ))}
              </div>

              {/* Organizer info */}
              {groupBuy.organizer_name && (
                <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs">
                  <span className="text-slate-500">Organized by </span>
                  <span className="font-black text-black">{groupBuy.organizer_name}</span>
                  {groupBuy.organizer_social && <span className="text-slate-400 ml-1">— {groupBuy.organizer_social} on {groupBuy.organizer_platform}</span>}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                {groupBuy.status === 'completed' && groupBuy.coa_url ? (
                  <a href={groupBuy.coa_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2"><ExternalLink className="w-4 h-4" /> View Results / COA</Button>
                  </a>
                ) : hasJoined ? (
                  <>
                    {needsEscrow && (
                      <Button onClick={() => setShowEscrow(true)} className="bg-[#8B2635] hover:bg-[#6B1827] gap-2">
                        <Shield className="w-4 h-4" /> Pay ${groupBuy.cost_per_participant} into Escrow
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleLeave} disabled={leaving} className="gap-2 text-slate-500 hover:text-red-500 hover:border-red-300">
                      {leaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />} Leave Group Buy
                    </Button>
                  </>
                ) : canJoin ? (
                  currentUser ? (
                    <Button onClick={() => setShowJoin(true)} className="bg-[#8B2635] hover:bg-[#6B1827] gap-2">
                      <Users className="w-4 h-4" /> Join This Group Buy
                    </Button>
                  ) : (
                    <Button onClick={() => window.location.href = createPageUrl('Login') + '?next=' + encodeURIComponent(window.location.pathname + window.location.search)}
                      variant="outline" className="border-[#8B2635] text-[#8B2635] hover:bg-[#8B2635] hover:text-white gap-2">
                      <Users className="w-4 h-4" /> Sign In to Join
                    </Button>
                  )
                ) : (
                  <Button disabled variant="outline" className="text-slate-400">
                    {isPast ? <><Clock className="w-4 h-4 mr-2" />Closed</> : 'Not Accepting'}
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Announcements */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <AnnouncementsPanel groupBuyId={groupBuyId} isOrganizer={isOrganizer} />
            </motion.div>

            {/* Polls */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <PollsPanel groupBuyId={groupBuyId} currentUser={currentUser} isOrganizer={isOrganizer} />
            </motion.div>

            {/* Vial Donors */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <VialDonorsPanel groupBuyId={groupBuyId} currentUser={currentUser} isOrganizer={isOrganizer} />
            </motion.div>

            {/* Organizer dashboard */}
            {isOrganizer && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <OrganizerDashboard groupBuy={groupBuy} currentUser={currentUser} />
              </motion.div>
            )}
          </div>

          {/* RIGHT — sticky chat */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <GroupBuyChat groupBuyId={groupBuyId} currentUser={currentUser} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <JoinGroupBuyModal
        groupBuy={groupBuy}
        isOpen={showJoin}
        onClose={() => setShowJoin(false)}
        onSuccess={refresh}
        currentUser={currentUser}
      />
      {showEscrow && (
        <EscrowPaymentModal
          groupBuy={groupBuy}
          isOpen={showEscrow}
          onClose={() => setShowEscrow(false)}
          onSuccess={() => { setShowEscrow(false); refresh(); }}
          prefillName={currentUser?.full_name || ''}
          prefillEmail={currentUser?.email || ''}
        />
      )}
    </div>
  );
}