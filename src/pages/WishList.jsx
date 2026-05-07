import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, ChevronUp, Plus, Search, Star, Flame, Clock, ShieldCheck, X, Beaker, Brain, Zap, Heart, Leaf, Dna, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SEO from '@/components/SEO';

const CATEGORY_CONFIG = {
  weight_loss: { label: 'Weight Loss', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  recovery_healing: { label: 'Recovery & Healing', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-100' },
  cognitive_focus: { label: 'Cognitive Focus', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
  performance_longevity: { label: 'Performance & Longevity', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  sexual_health: { label: 'Sexual Health', icon: Star, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
  general_health: { label: 'General Health', icon: Leaf, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' },
  other: { label: 'Other', icon: Beaker, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100' },
};

const STATUS_CONFIG = {
  requested: { label: 'Requested', color: 'text-slate-500', bg: 'bg-slate-100' },
  under_review: { label: 'Under Review', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  coming_soon: { label: 'Coming Soon!', color: 'text-green-700', bg: 'bg-green-100' },
  available: { label: '✓ Now Available', color: 'text-[#8B2635]', bg: 'bg-red-50' },
};

// Generate a simple browser fingerprint for vote dedup
const getFingerprint = () => {
  const raw = [navigator.userAgent, navigator.language, screen.width, screen.height, new Date().getTimezoneOffset()].join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return 'fp_' + Math.abs(hash).toString(36);
};

const WishCard = ({ item, fingerprint, onVote, isAdmin, onDelete }) => {
  const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.requested;
  const CatIcon = cat.icon;
  const hasVoted = (item.voter_fingerprints || []).includes(fingerprint);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-lg shadow-slate-100 hover:border-[#8B2635]/30 hover:shadow-xl transition-all group relative overflow-hidden"
    >
      {/* Faint category icon watermark */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
        <CatIcon className="w-32 h-32 text-black" />
      </div>

      <div className="flex items-start gap-4 relative z-10">
        {/* Vote Button */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onVote(item)}
            disabled={hasVoted}
            className={`w-12 h-12 rounded-2xl border-2 flex flex-col items-center justify-center transition-all font-black text-sm ${
              hasVoted
                ? 'bg-[#8B2635] border-[#8B2635] text-white cursor-default'
                : 'border-slate-200 text-slate-400 hover:border-[#8B2635] hover:text-[#8B2635] hover:bg-red-50 active:scale-95'
            }`}
          >
            <ChevronUp className="w-4 h-4" strokeWidth={3} />
            <span className="text-xs leading-none">{item.votes || 0}</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${cat.bg} ${cat.color} ${cat.border} border`}>
              <CatIcon className="w-3 h-3" />
              {cat.label}
            </span>
            {item.status !== 'requested' && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${status.bg} ${status.color}`}>
                {status.label}
              </span>
            )}
          </div>

          <h3 className="text-xl font-black text-black uppercase tracking-tight leading-none mb-2 group-hover:text-[#8B2635] transition-colors">
            {item.product_name}
          </h3>

          {item.description && (
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-3 line-clamp-2">
              {item.description}
            </p>
          )}

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-[10px] font-black text-slate-500">{(item.username || '?')[0].toUpperCase()}</span>
            </div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.username || 'Anonymous'}</span>
            <span className="text-slate-200">·</span>
            <span className="text-[11px] text-slate-400">{new Date(item.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            {isAdmin && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="ml-auto p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete request"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SubmitModal = ({ onClose, onSubmit, savedUsername, onUsernameChange }) => {
  const [form, setForm] = useState({ username: savedUsername || '', product_name: '', category: '', description: '' });
  const [step, setStep] = useState(savedUsername ? 2 : 1);

  const handleNext = () => {
    if (step === 1 && form.username.trim().length >= 2) {
      onUsernameChange(form.username.trim());
      setStep(2);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.product_name.trim() || !form.category) return;
    onSubmit({ ...form, username: form.username.trim() });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#8B2635] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-32 h-32 text-white" />
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-red-200 uppercase tracking-widest mb-1">Community Wish List</p>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
              {step === 1 ? 'Choose a Username' : 'Request a Product'}
            </h2>
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-slate-500 font-medium mb-6">Pick a username to display with your request. Your real name stays private.</p>
                <input
                  type="text"
                  placeholder="e.g. ResearcherX, PepTide42, BiohackerPro..."
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  maxLength={30}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl text-black font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#8B2635]/60 transition-colors text-lg"
                />
                <p className="text-[11px] text-slate-400 mt-2 font-medium">Min. 2 characters · No real names required</p>
                <Button
                  onClick={handleNext}
                  disabled={form.username.trim().length < 2}
                  className="w-full mt-6 bg-[#8B2635] hover:bg-[#6B1827] text-white font-black uppercase tracking-widest rounded-2xl py-6"
                >
                  Continue →
                </Button>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="w-8 h-8 rounded-xl bg-[#8B2635] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-black text-white">{form.username[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Posting as</p>
                      <p className="text-sm font-black text-black">{form.username}</p>
                    </div>
                    <button type="button" onClick={() => setStep(1)} className="ml-auto text-[11px] text-[#8B2635] font-black uppercase tracking-widest hover:underline">Change</button>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Product / Peptide Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Selank, CJC-1295, DSIP..."
                      value={form.product_name}
                      onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))}
                      maxLength={80}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-black font-semibold placeholder:text-slate-300 focus:outline-none focus:border-[#8B2635]/60 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
                        const Icon = cfg.icon;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, category: key }))}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                              form.category === key
                                ? 'border-[#8B2635] bg-red-50 text-[#8B2635]'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${form.category === key ? 'text-[#8B2635]' : cfg.color}`} />
                            <span className="text-[11px] font-black uppercase tracking-wide leading-tight">{cfg.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Why do you want it? (optional)</label>
                    <textarea
                      placeholder="Tell us what research you're doing and why this product would help..."
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      maxLength={300}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-black font-medium placeholder:text-slate-300 focus:outline-none focus:border-[#8B2635]/60 transition-colors resize-none text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!form.product_name.trim() || !form.category}
                    className="w-full bg-[#8B2635] hover:bg-[#6B1827] text-white font-black uppercase tracking-widest rounded-2xl py-6"
                  >
                    <Sparkles className="w-4 h-4 mr-2" /> Submit Request
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function WishList() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('votes');
  const [filterCat, setFilterCat] = useState('all');
  const [fingerprint] = useState(() => getFingerprint());
  const [savedUsername, setSavedUsername] = useState(() => localStorage.getItem('rhr_wishlist_username') || '');
  const [successMsg, setSuccessMsg] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => setIsAdmin(u?.role === 'admin')).catch(() => {});
  }, []);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => base44.entities.WishListItem.list('-votes', 100),
  });

  const voteMutation = useMutation({
    mutationFn: async (item) => {
      const alreadyVoted = (item.voter_fingerprints || []).includes(fingerprint);
      if (alreadyVoted) return;
      await base44.entities.WishListItem.update(item.id, {
        votes: (item.votes || 0) + 1,
        voter_fingerprints: [...(item.voter_fingerprints || []), fingerprint],
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WishListItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.WishListItem.create({ ...data, votes: 0, voter_fingerprints: [], status: 'requested' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      setShowModal(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    },
  });

  const handleUsernameChange = (name) => {
    setSavedUsername(name);
    localStorage.setItem('rhr_wishlist_username', name);
  };

  const filtered = useMemo(() => {
    let list = [...items];
    if (filterCat !== 'all') list = list.filter(i => i.category === filterCat);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i => i.product_name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
    }
    if (sortBy === 'votes') list.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    else if (sortBy === 'newest') list.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    else if (sortBy === 'status') list.sort((a, b) => {
      const order = { available: 0, coming_soon: 1, under_review: 2, requested: 3 };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });
    return list;
  }, [items, filterCat, searchQuery, sortBy]);

  const topItems = items.slice().sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 3);

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 relative overflow-hidden">
      <SEO
        title="Peptide Wish List — Request New Research Products | Red Helix Research"
        description="Vote for and request new research peptides you want to see in our store. Community-driven product suggestions for the Red Helix Research catalog."
        canonical="https://redhelixresearch.com/WishList"
      />

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-[#8B2635] rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-[-10%] w-[600px] h-[600px] bg-slate-600 rounded-full blur-[120px]" />
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 mb-16 relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" className="mb-8 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-bold uppercase tracking-wider text-xs">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#fef2f2] border border-[#fee2e2] rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#8B2635]" />
            <span className="text-[11px] font-black text-[#8B2635] uppercase tracking-widest">Community Driven</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-black mb-6 uppercase tracking-tighter leading-none">
            Research <span className="text-[#8B2635]">Wish List</span>
          </h1>

          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Tell us what peptides and research compounds you want to see in our catalog. 
            Upvote requests from other researchers — top requests get sourced first.
          </p>

          <Button
            onClick={() => setShowModal(true)}
            size="lg"
            className="bg-[#8B2635] hover:bg-[#6B1827] text-white px-10 py-7 rounded-full font-black uppercase tracking-widest text-sm shadow-xl shadow-[#8B2635]/20"
          >
            <Plus className="w-5 h-5 mr-2" /> Request a Product
          </Button>
        </motion.div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-xl font-black uppercase tracking-widest text-sm flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Request submitted! Thanks for the suggestion.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Requests */}
      {topItems.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mb-16 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Flame className="w-5 h-5 text-[#8B2635]" />
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Top Requested</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {topItems.map((item, idx) => {
              const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
              const CatIcon = cat.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-50 border border-slate-100 rounded-[28px] p-6 hover:bg-white hover:border-[#8B2635]/20 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${cat.bg} ${cat.border} border flex items-center justify-center flex-shrink-0`}>
                      <CatIcon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{idx + 1} Most Wanted</div>
                  </div>
                  <h3 className="text-xl font-black text-black uppercase tracking-tight leading-none mb-1 group-hover:text-[#8B2635] transition-colors">{item.product_name}</h3>
                  <p className="text-sm font-black text-[#8B2635]">{item.votes || 0} votes</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-4 mb-8 relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-full text-sm font-medium text-black placeholder:text-slate-400 focus:outline-none focus:border-[#8B2635]/50 transition-colors"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
            {[
              { key: 'votes', label: 'Top', icon: ChevronUp },
              { key: 'newest', label: 'New', icon: Clock },
              { key: 'status', label: 'Status', icon: Star },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  sortBy === key ? 'bg-white shadow-sm text-[#8B2635]' : 'text-slate-500 hover:text-black'
                }`}
              >
                <Icon className="w-3 h-3" /> {label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilterCat('all')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                filterCat === 'all' ? 'bg-[#8B2635] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setFilterCat(key === filterCat ? 'all' : key)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                  filterCat === key ? 'bg-[#8B2635] text-white' : `${cfg.bg} ${cfg.color} hover:opacity-80`
                }`}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="max-w-7xl mx-auto px-4 mb-6 relative z-10">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          {filtered.length} {filtered.length === 1 ? 'request' : 'requests'} {filterCat !== 'all' ? `· ${CATEGORY_CONFIG[filterCat]?.label}` : ''} {searchQuery ? `· "${searchQuery}"` : ''}
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-[28px] p-6 h-40 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="w-20 h-20 bg-slate-100 rounded-[24px] flex items-center justify-center mx-auto mb-6">
              <Dna className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-2">No Requests Yet</h3>
            <p className="text-slate-500 font-medium mb-8">Be the first to request a product in this category!</p>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-[#8B2635] hover:bg-[#6B1827] text-white font-black uppercase tracking-widest rounded-full px-8 py-5"
            >
              <Plus className="w-4 h-4 mr-2" /> Make the First Request
            </Button>
          </motion.div>
        ) : (
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map(item => (
                <WishCard key={item.id} item={item} fingerprint={fingerprint} onVote={voteMutation.mutate} isAdmin={isAdmin} onDelete={deleteMutation.mutate} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-5xl mx-auto px-4 mt-24 relative z-10">
        <div className="bg-white border border-slate-200 rounded-[40px] p-10 md:p-16 text-center relative overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
            <Sparkles className="w-48 h-48 text-black" />
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-black mb-4 uppercase tracking-tighter leading-none">
              Your Voice <span className="text-[#8B2635]">Shapes</span> Our Catalog
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8 font-medium leading-relaxed">
              We actively review the wish list when sourcing new compounds. Top-voted requests are prioritized for our next procurement cycle.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => setShowModal(true)}
                size="lg"
                className="bg-[#8B2635] hover:bg-[#6B1827] text-white px-10 py-7 rounded-full font-black uppercase tracking-widest text-sm shadow-xl shadow-[#8B2635]/20"
              >
                <Plus className="w-5 h-5 mr-2" /> Submit a Request
              </Button>
              <Link to={createPageUrl('Products')}>
                <Button variant="outline" size="lg" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-bold uppercase tracking-wider text-xs px-8 py-7">
                  Browse Current Catalog →
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Compliance Footer */}
      <div className="max-w-4xl mx-auto px-4 mt-16 text-center opacity-50 relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Research Use Only</p>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          All suggested products are intended for in vitro laboratory research only and are not approved for human consumption.
        </p>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <SubmitModal
            onClose={() => setShowModal(false)}
            onSubmit={submitMutation.mutate}
            savedUsername={savedUsername}
            onUsernameChange={handleUsernameChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}