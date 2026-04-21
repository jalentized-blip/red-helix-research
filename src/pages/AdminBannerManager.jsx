import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Save, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BLANK = { label: '', headline: '', cta: '', link: '', is_active: true, sort_order: 0 };

const PAGE_OPTIONS = [
  'Products', 'Account', 'KitInfo', 'PeptideComparison', 'LearnMore',
  'Cart', 'COAReports', 'PeptideCalculator', 'Contact', 'About'
];

export default function AdminBannerManager() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null); // null | 'new' | {id,...}
  const [form, setForm] = useState(BLANK);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['banner-messages'],
    queryFn: () => base44.entities.BannerMessage.list('sort_order', 50),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.BannerMessage.create(data),
    onSuccess: () => { qc.invalidateQueries(['banner-messages']); setEditing(null); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BannerMessage.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['banner-messages']); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.BannerMessage.delete(id),
    onSuccess: () => qc.invalidateQueries(['banner-messages']),
  });

  const openNew = () => { setForm({ ...BLANK, sort_order: messages.length }); setEditing('new'); };
  const openEdit = (msg) => { setForm({ ...msg }); setEditing(msg); };

  const save = () => {
    if (editing === 'new') {
      createMut.mutate(form);
    } else {
      updateMut.mutate({ id: editing.id, data: form });
    }
  };

  const toggleActive = (msg) => {
    updateMut.mutate({ id: msg.id, data: { ...msg, is_active: !msg.is_active } });
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Banner Messages</h1>
            <p className="text-sm text-slate-500 mt-1">Manage the rotating promotional banner shown to visitors</p>
          </div>
          <Button onClick={openNew} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Message
          </Button>
        </div>

        {/* Edit / New Form */}
        {editing && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="font-black text-slate-800 mb-4">{editing === 'new' ? 'New Message' : 'Edit Message'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Label Tag</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B2635]"
                  placeholder="e.g. Today Only"
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">CTA Button Text</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B2635]"
                  placeholder="e.g. Shop Now"
                  value={form.cta}
                  onChange={e => setForm(f => ({ ...f, cta: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Headline</label>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B2635]"
                  placeholder="e.g. Free shipping on any order over $100"
                  value={form.headline}
                  onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Link Page</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B2635] bg-white"
                  value={form.link}
                  onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                >
                  <option value="">— Select a page —</option>
                  {PAGE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Sort Order</label>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B2635]"
                  value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="accent-[#8B2635] w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Active (shown in banner rotation)</label>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <Button onClick={save} disabled={isSaving || !form.label || !form.headline || !form.cta || !form.link}>
                <Save className="w-4 h-4 mr-1" /> {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Messages List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="font-medium">No banner messages yet.</p>
            <p className="text-sm mt-1">The banner will use built-in defaults until you add messages here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`bg-white border rounded-xl px-4 py-3.5 flex items-center gap-4 shadow-sm transition-opacity ${!msg.is_active ? 'opacity-50' : ''}`}
              >
                <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black text-[#8B2635] uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full">{msg.label}</span>
                    {!msg.is_active && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hidden</span>}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 truncate">{msg.headline}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{msg.cta} → {msg.link}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(msg)}
                    className="text-slate-400 hover:text-[#8B2635] transition-colors"
                    title={msg.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {msg.is_active
                      ? <ToggleRight className="w-5 h-5 text-[#8B2635]" />
                      : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => openEdit(msg)} className="text-slate-400 hover:text-slate-700 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this banner message?')) deleteMut.mutate(msg.id); }}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-400 mt-6 text-center">
          If no active messages exist, the banner uses built-in default deals.
        </p>
      </div>
    </div>
  );
}