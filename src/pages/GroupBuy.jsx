import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Home, Plus, Search, FlaskConical, Users, CheckCircle2, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SEO from '@/components/SEO';
import { generateBreadcrumbSchema } from '@/components/utils/advancedSchemaHelpers';
import CreateGroupBuyModal from '@/components/groupbuy/CreateGroupBuyModal';
import JoinGroupBuyModal from '@/components/groupbuy/JoinGroupBuyModal';
import GroupBuyCard from '@/components/groupbuy/GroupBuyCard';
import AdminEscrowPanel from '@/components/groupbuy/AdminEscrowPanel';
import EscrowPaymentModal from '@/components/groupbuy/EscrowPaymentModal';

const PEPTIDES = ['All', 'BPC-157', 'TB-500', 'Semaglutide', 'Tirzepatide', 'Retatrutide', 'Ipamorelin', 'CJC-1295', 'GHK-Cu', 'Other'];
const STATUSES = ['All', 'open', 'funded', 'testing', 'completed', 'cancelled'];
const TEST_FILTERS = ['All', 'purity', 'sterility', 'heavy_metals', 'endotoxin', 'ph', 'vacuum'];

export default function GroupBuy() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [joining, setJoining] = useState(null);
  const [escrowTarget, setEscrowTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPeptide, setFilterPeptide] = useState('All');
  const [filterTest, setFilterTest] = useState('All');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      setIsAdmin(u?.role === 'admin');
    }).catch(() => {});
  }, []);

  const { data: groupBuys = [], isLoading } = useQuery({
    queryKey: ['groupBuys'],
    queryFn: () => base44.entities.GroupBuyTest.list('-created_date'),
  });

  // Fetch current user's participations
  const { data: myParticipations = [] } = useQuery({
    queryKey: ['myParticipations', currentUser?.email],
    queryFn: () => base44.entities.GroupBuyParticipant.filter({ email: currentUser.email }),
    enabled: !!currentUser?.email,
  });

  const filtered = groupBuys.filter(g => {
    const name = `${g.vendor_name} ${g.peptide_name} ${g.title || ''} ${g.batch_number || ''}`.toLowerCase();
    if (search && !name.includes(search.toLowerCase())) return false;
    if (filterStatus !== 'All' && g.status !== filterStatus) return false;
    if (filterPeptide !== 'All' && !g.peptide_name?.includes(filterPeptide)) return false;
    if (filterTest !== 'All' && !g.test_types?.includes(filterTest)) return false;
    return true;
  });

  const openCount = groupBuys.filter(g => g.status === 'open').length;
  const completedCount = groupBuys.filter(g => g.status === 'completed').length;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['groupBuys'] });
    queryClient.invalidateQueries({ queryKey: ['myParticipations'] });
  };

  const handleLeave = async (groupBuy) => {
    const participation = myParticipations.find(p => p.group_buy_id === groupBuy.id);
    if (!participation) return;
    await base44.entities.GroupBuyParticipant.delete(participation.id);
    await base44.entities.GroupBuyTest.update(groupBuy.id, {
      current_participants: Math.max(0, (groupBuy.current_participants || 1) - 1),
    });
    refresh();
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <SEO
        title="Group Buy Testing — Split the Cost of Peptide Testing"
        description="Organize or join group peptide testing to verify vendor quality. Split HPLC purity, sterility, heavy metals, and endotoxin testing costs with other researchers."
        keywords="group buy peptide testing, split cost peptide test, HPLC group test, research peptide quality, community testing"
        canonical="https://redhelixresearch.com/GroupBuy"
        schema={[generateBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Group Buy', url: '/GroupBuy' }])]}
      />

      <div className="max-w-7xl mx-auto px-4">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#8B2635] mb-8 transition-colors text-sm font-bold">
          <Home className="w-4 h-4" /> Back to Shop
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-black mb-3">
                Group Buy <span className="text-[#8B2635]">Testing</span>
              </h1>
              <p className="text-slate-600 text-lg max-w-2xl">
                Split the cost of independent lab testing with other researchers. Verify vendor quality through HPLC purity, sterility, heavy metals, and more — at a fraction of the cost.
              </p>
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span><strong className="text-black">{openCount}</strong> open group buy{openCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  <span><strong className="text-black">{completedCount}</strong> completed</span>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowCreate(true)} className="bg-[#8B2635] hover:bg-[#6B1827] h-12 px-6 flex-shrink-0 shadow-lg shadow-red-900/20">
              <Plus className="w-5 h-5 mr-2" /> Create Group Buy
            </Button>
          </div>
        </motion.div>

        {/* How it Works */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {[
            { step: '1', icon: Plus, title: 'Organize', desc: 'Create a group buy with vendor, peptide, batch, and test details.' },
            { step: '2', icon: Users, title: 'Recruit', desc: 'Others join and commit. Costs split automatically by headcount.' },
            { step: '3', icon: FlaskConical, title: 'Test', desc: 'Samples sent to independent lab for HPLC/sterility analysis.' },
            { step: '4', icon: CheckCircle2, title: 'Results', desc: 'COA published. Protect your research with verified data.' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
              <div className="w-8 h-8 rounded-full bg-[#8B2635] text-white text-xs font-black flex items-center justify-center mb-3">{step}</div>
              <h3 className="font-black text-black text-sm mb-1">{title}</h3>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search vendor, peptide, batch..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex gap-1 flex-wrap">
              {STATUSES.map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize transition-all ${filterStatus === s ? 'bg-[#8B2635] text-white border-[#8B2635]' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <select className="h-9 px-3 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-600 focus:outline-none focus:border-[#8B2635]" value={filterPeptide} onChange={e => setFilterPeptide(e.target.value)}>
            {PEPTIDES.map(p => <option key={p}>{p}</option>)}
          </select>
          <select className="h-9 px-3 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-600 focus:outline-none focus:border-[#8B2635]" value={filterTest} onChange={e => setFilterTest(e.target.value)}>
            {TEST_FILTERS.map(t => <option key={t} value={t}>{t === 'All' ? 'All Tests' : t.replace('_', ' ')}</option>)}
          </select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="font-black text-slate-400 text-lg mb-2">
              {groupBuys.length === 0 ? 'No Group Buys Yet' : 'No Matches Found'}
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              {groupBuys.length === 0
                ? 'Be the first to organize a group buy and help the community verify vendor quality.'
                : 'Try adjusting your filters.'}
            </p>
            {groupBuys.length === 0 && (
              <Button onClick={() => setShowCreate(true)} className="bg-[#8B2635] hover:bg-[#6B1827]">
                <Plus className="w-4 h-4 mr-2" /> Create the First Group Buy
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((g, i) => {
              const myParticipation = myParticipations.find(p => p.group_buy_id === g.id);
              return (
                <div key={g.id}>
                  <GroupBuyCard
                    groupBuy={g}
                    index={i}
                    currentUser={currentUser}
                    myParticipation={myParticipation}
                    onJoin={setJoining}
                    onLeave={handleLeave}
                    onPayEscrow={setEscrowTarget}
                  />
                  {isAdmin && <AdminEscrowPanel groupBuy={g} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 bg-slate-50 border border-slate-100 rounded-2xl p-6 text-xs text-slate-400 text-center">
          <p>All group buy testing is for <strong className="text-slate-500">research purposes only</strong>. Results are independent lab analyses and do not constitute medical advice or product endorsement. For research use only.</p>
        </div>
      </div>

      <CreateGroupBuyModal isOpen={showCreate} onClose={() => setShowCreate(false)} onSuccess={refresh} />
      <JoinGroupBuyModal
        groupBuy={joining}
        isOpen={!!joining}
        onClose={() => setJoining(null)}
        onSuccess={refresh}
        currentUser={currentUser}
      />
      {escrowTarget && (
        <EscrowPaymentModal
          groupBuy={escrowTarget}
          isOpen={!!escrowTarget}
          onClose={() => setEscrowTarget(null)}
          onSuccess={() => { setEscrowTarget(null); refresh(); }}
          prefillName={currentUser?.full_name || ''}
          prefillEmail={currentUser?.email || ''}
        />
      )}
    </div>
  );
}