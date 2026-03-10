import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FlaskConical, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VialDonorsPanel({ groupBuyId, currentUser, isOrganizer }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ donor_name: '', donor_email: '', vial_label: '', quantity: 1, notes: '' });
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: donors = [] } = useQuery({
    queryKey: ['gbDonors', groupBuyId],
    queryFn: () => base44.entities.GroupBuyVialDonor.filter({ group_buy_id: groupBuyId }, 'created_date'),
  });

  const handleAdd = async () => {
    if (!form.donor_name.trim() || !form.vial_label.trim()) return;
    setSaving(true);
    await base44.entities.GroupBuyVialDonor.create({ ...form, group_buy_id: groupBuyId });
    setForm({ donor_name: '', donor_email: '', vial_label: '', quantity: 1, notes: '' });
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['gbDonors', groupBuyId] });
    setSaving(false);
  };

  const handleConfirm = async (donor) => {
    await base44.entities.GroupBuyVialDonor.update(donor.id, { confirmed: !donor.confirmed });
    queryClient.invalidateQueries({ queryKey: ['gbDonors', groupBuyId] });
  };

  const handleDelete = async (id) => {
    await base44.entities.GroupBuyVialDonor.delete(id);
    queryClient.invalidateQueries({ queryKey: ['gbDonors', groupBuyId] });
  };

  // Pre-fill with current user info
  const openForm = () => {
    setForm(f => ({ ...f, donor_name: currentUser?.full_name || '', donor_email: currentUser?.email || '' }));
    setShowForm(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-[#8B2635]" />
          <span className="font-black text-sm text-black">Vial Donors</span>
          <span className="text-[10px] text-slate-400 font-bold">{donors.length} logged</span>
        </div>
        {currentUser && (
          <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={openForm}>
            <Plus className="w-3 h-3 mr-1" /> Add Vial
          </Button>
        )}
      </div>

      {showForm && (
        <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Your name" value={form.donor_name} onChange={e => setForm(f => ({ ...f, donor_name: e.target.value }))}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#8B2635]" />
            <input placeholder="Your email" value={form.donor_email} onChange={e => setForm(f => ({ ...f, donor_email: e.target.value }))}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#8B2635]" />
          </div>
          <input placeholder="Vial label (e.g. BPC-157 5mg, Lot ABC)" value={form.vial_label} onChange={e => setForm(f => ({ ...f, vial_label: e.target.value }))}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#8B2635]" />
          <div className="flex gap-2">
            <input type="number" min={1} placeholder="Qty" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
              className="w-20 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#8B2635]" />
            <input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#8B2635]" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={saving} className="bg-[#8B2635] hover:bg-[#6B1827] text-xs h-7">Submit</Button>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-50">
        {donors.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">No vials logged yet. Be the first!</p>
        ) : (
          donors.map(d => (
            <div key={d.id} className="p-4 flex items-center gap-3 group">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${d.confirmed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {d.confirmed ? <CheckCircle2 className="w-4 h-4" /> : (d.donor_name[0] || '?').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-black truncate">{d.donor_name}</p>
                <p className="text-xs text-slate-500">{d.vial_label} × {d.quantity}</p>
                {d.notes && <p className="text-[10px] text-slate-400">{d.notes}</p>}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isOrganizer && (
                  <button onClick={() => handleConfirm(d)} className={`text-[10px] font-bold border rounded px-1.5 py-0.5 transition-colors ${d.confirmed ? 'border-green-200 text-green-600 bg-green-50 hover:bg-white' : 'border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-300'}`}>
                    {d.confirmed ? 'Confirmed' : 'Confirm'}
                  </button>
                )}
                {(isOrganizer || d.donor_email === currentUser?.email) && (
                  <button onClick={() => handleDelete(d.id)} className="text-slate-300 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}