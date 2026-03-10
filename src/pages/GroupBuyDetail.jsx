import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, FlaskConical, Users, Clock, Globe, Lock, ExternalLink,
  Shield, CheckCircle2, Beaker, Loader2, LogOut, Hash, Megaphone,
  BarChart2, Settings, Info
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('overview');
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

  const groupTitle = groupBuy.title || `${groupBuy.vendor_name} — ${groupBuy.peptide_name} ${groupBuy.peptide_strength}`;

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'chat', label: 'Chat', icon: Hash },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'polls', label: 'Polls', icon: BarChart2 },
    { id: 'vials', label: 'Vial Donors', icon: FlaskConical },
    ...(isOrganizer ? [{ id: 'manage', label: 'Manage', icon: Settings }] : []),
  ];

  const isChatTab = activeTab === 'chat';

  return (
    <div className="min-h-screen bg-slate-50 pt-20 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          <Link to={createPageUrl('GroupBuy')} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#8B2635] transition-colors text-sm font-bold flex-shrink-0">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex-shrink-0 ${status.color}`}>
              {status.label}
            </span>
            <h1 className="font-black text-black text-sm md:text-base truncate">{groupTitle}</h1>
            {hasJoined && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Joined
              </span>
            )}
          </div>
          {/* Quick action */}
          <div className="flex-shrink-0">
            {hasJoined ? (
              <Button variant="outline" size="sm" onClick={handleLeave} disabled={leaving} className="gap-1.5 text-slate-500 hover:text-red-500 hover:border-red-300 h-8 text-xs">
                {leaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />} Leave
              </Button>
            ) : canJoin && currentUser ? (
              <Button size="sm" onClick={() => setShowJoin(true)} className="bg-[#8B2635] hover:bg-[#6B1827] h-8 text-xs gap-1.5">
                <Users className="w-3 h-3" /> Join
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tab bar — Discord-style dark sidebar feel but horizontal */}
      <div className="bg-white border-b border-slate-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'border-[#8B2635] text-[#8B2635]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className={`flex-1 flex flex-col ${isChatTab ? 'overflow-hidden' : ''}`}>
        <AnimatePresence mode="wait">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                {groupBuy.description && <p className="text-slate-600 text-sm mb-6">{groupBuy.description}</p>}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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

                {/* Participants bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                      <Users className="w-3.5 h-3.5" />
                      {groupBuy.current_participants || 0}{groupBuy.max_participants ? `/${groupBuy.max_participants}` : ''} participants
                    </span>
                    {participantPct !== null && <span className="text-[10px] text-slate-400">{Math.round(participantPct)}% full</span>}
                  </div>
                  {participantPct !== null && (
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8B2635] rounded-full transition-all" style={{ width: `${participantPct}%` }} />
                    </div>
                  )}
                </div>

                <EscrowStatusBar groupBuy={groupBuy} />

                <div className="flex flex-wrap gap-2 mb-6">
                  {(groupBuy.test_types || []).map(t => (
                    <span key={t} className="flex items-center gap-1.5 text-xs font-bold bg-[#8B2635]/8 border border-[#8B2635]/20 text-[#8B2635] px-3 py-1 rounded-full">
                      <Beaker className="w-3 h-3" />{TEST_LABELS[t] || t}
                    </span>
                  ))}
                </div>

                {groupBuy.organizer_name && (
                  <div className="bg-slate-50 rounded-xl p-3 mb-6 text-xs">
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
                      <Button variant="outline" onClick={() => setActiveTab('chat')} className="gap-2">
                        <Hash className="w-4 h-4" /> Open Chat
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
              </div>
            </motion.div>
          )}

          {/* CHAT TAB — full height Discord interface */}
          {activeTab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-hidden"
              style={{ height: 'calc(100vh - 140px)' }}>
              {/* Discord-style outer wrapper */}
              <div className="flex-1 flex overflow-hidden bg-white">
                {/* Sidebar — channels list */}
                <div className="w-48 bg-slate-100 flex-shrink-0 flex flex-col hidden md:flex border-r border-slate-200">
                  {/* Server name */}
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-black text-black text-sm truncate">{groupTitle.length > 18 ? groupTitle.slice(0, 18) + '…' : groupTitle}</span>
                  </div>
                  {/* Channel list */}
                  <div className="px-2 py-3 flex-1 overflow-y-auto">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 mb-1">Text Channels</p>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[#8B2635]/10 text-[#8B2635] border border-[#8B2635]/20">
                      <Hash className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-bold">general</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-800 cursor-pointer transition-colors mt-0.5"
                      onClick={() => setActiveTab('announcements')}>
                      <Megaphone className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">announcements</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-800 cursor-pointer transition-colors mt-0.5"
                      onClick={() => setActiveTab('polls')}>
                      <BarChart2 className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">polls</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-800 cursor-pointer transition-colors mt-0.5"
                      onClick={() => setActiveTab('vials')}>
                      <FlaskConical className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">vials</span>
                    </div>
                    {isOrganizer && (
                      <>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 mb-1 mt-4">Admin</p>
                        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-800 cursor-pointer transition-colors"
                          onClick={() => setActiveTab('manage')}>
                          <Settings className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">manage</span>
                        </div>
                      </>
                    )}
                  </div>
                  {/* User identity bar at bottom */}
                  {currentUser && (
                    <div className="px-2 py-2 bg-slate-200 border-t border-slate-300 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#8B2635] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                        {(currentUser.full_name || currentUser.email)[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-black truncate">{currentUser.full_name || currentUser.email.split('@')[0]}</p>
                        <p className="text-green-400 text-[10px]">● Online</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Main chat area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                  <GroupBuyChat groupBuyId={groupBuyId} groupBuyTitle={groupTitle} currentUser={currentUser} />
                </div>

                {/* Members sidebar */}
                <div className="w-44 bg-[#2b2d31] hidden lg:flex flex-col flex-shrink-0">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-4 py-3 border-b border-black/20">Members</p>
                  <MembersList groupBuyId={groupBuyId} currentUser={currentUser} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === 'announcements' && (
            <motion.div key="announcements" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto px-4 py-6 w-full">
              <AnnouncementsPanel groupBuyId={groupBuyId} isOrganizer={isOrganizer} />
            </motion.div>
          )}

          {/* POLLS TAB */}
          {activeTab === 'polls' && (
            <motion.div key="polls" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto px-4 py-6 w-full">
              <PollsPanel groupBuyId={groupBuyId} currentUser={currentUser} isOrganizer={isOrganizer} />
            </motion.div>
          )}

          {/* VIALS TAB */}
          {activeTab === 'vials' && (
            <motion.div key="vials" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto px-4 py-6 w-full">
              <VialDonorsPanel groupBuyId={groupBuyId} currentUser={currentUser} isOrganizer={isOrganizer} />
            </motion.div>
          )}

          {/* MANAGE TAB */}
          {activeTab === 'manage' && isOrganizer && (
            <motion.div key="manage" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto px-4 py-6 w-full">
              <OrganizerDashboard groupBuy={groupBuy} currentUser={currentUser} />
            </motion.div>
          )}

        </AnimatePresence>
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

// Inline members list component
function MembersList({ groupBuyId, currentUser }) {
  const { data: participants = [] } = useQuery({
    queryKey: ['gbParticipants', groupBuyId],
    queryFn: () => base44.entities.GroupBuyParticipant.filter({ group_buy_id: groupBuyId }, 'created_date'),
    refetchInterval: 15000,
  });

  const AVATAR_COLORS = ['bg-indigo-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-600', 'bg-amber-500', 'bg-pink-500', 'bg-[#8B2635]'];
  const emailToColor = (email) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  };

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
      {participants.length === 0 ? (
        <p className="text-[11px] text-slate-600 px-2 mt-2">No members yet</p>
      ) : (
        <>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-2 mb-1.5">
            Members — {participants.length}
          </p>
          {participants.map(p => {
            const isMe = p.email === currentUser?.email;
            const name = p.name || p.email.split('@')[0];
            const color = emailToColor(p.email);
            return (
              <div key={p.id} className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 transition-colors">
                <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center text-white text-[11px] font-black flex-shrink-0`}>
                  {name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${isMe ? 'text-[#c0677a]' : 'text-slate-300'}`}>{isMe ? name + ' (you)' : name}</p>
                  {p.payment_status === 'paid' && (
                    <p className="text-[9px] text-green-400">✓ paid</p>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}