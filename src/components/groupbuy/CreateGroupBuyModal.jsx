import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { X, ChevronRight, ChevronLeft, CheckCircle2, Loader2 } from 'lucide-react';

const PEPTIDES = [
  'BPC-157', 'TB-500', 'Semaglutide', 'Tirzepatide', 'Retatrutide',
  'Ipamorelin', 'CJC-1295 (no DAC)', 'Tesamorelin', 'GHK-Cu', 'LIPO C + B12',
  'SS-31 Elamipretide', 'PT-141', 'Selank', 'Semax', 'NAD+', 'Other'
];

const TEST_OPTIONS = [
  { id: 'purity', label: 'Purity (HPLC)', description: 'Verify compound identity & concentration' },
  { id: 'sterility', label: 'Sterility', description: 'Microbial contamination testing' },
  { id: 'heavy_metals', label: 'Heavy Metals', description: 'Detect harmful metal contaminants' },
  { id: 'endotoxin', label: 'Endotoxin / LAL', description: 'Bacterial endotoxin detection' },
  { id: 'ph', label: 'pH Test', description: 'Verify reconstitution pH levels' },
  { id: 'vacuum', label: 'Vial Vacuum Test', description: 'Integrity of sealed vials' },
];

const PLATFORMS = ['Discord', 'Telegram', 'Reddit', 'Facebook', 'Other'];

export default function CreateGroupBuyModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    vendor_name: '',
    peptide_name: '',
    peptide_strength: '',
    batch_number: '',
    test_types: [],
    max_participants: '',
    cutoff_date: '',
    payment_deadline: '',
    results_public: true,
    organizer_name: '',
    organizer_email: '',
    organizer_social: '',
    organizer_platform: 'Discord',
    description: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleTest = (id) => {
    set('test_types', form.test_types.includes(id)
      ? form.test_types.filter(t => t !== id)
      : [...form.test_types, id]);
  };

  const estimateCost = () => {
    let base = 0;
    if (form.test_types.includes('purity')) {
      const glp1 = ['Semaglutide', 'Tirzepatide', 'Retatrutide'].includes(form.peptide_name);
      base += glp1 ? 300 : 180;
    }
    if (form.test_types.includes('sterility')) base += 250;
    if (form.test_types.includes('heavy_metals')) base += 250;
    if (form.test_types.includes('endotoxin')) base += 250;
    if (form.test_types.includes('ph')) base += 50;
    if (form.test_types.includes('vacuum')) base += 25;
    return base;
  };

  const estimatedCost = estimateCost();
  const maxP = parseInt(form.max_participants) || 0;
  const costPerPerson = maxP > 0 ? (estimatedCost / maxP).toFixed(2) : null;

  const canNext = () => {
    if (step === 1) return form.vendor_name && form.peptide_name && form.peptide_strength;
    if (step === 2) return form.test_types.length > 0;
    if (step === 3) return form.cutoff_date && form.payment_deadline && form.organizer_email && form.organizer_name;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    const title = `${form.vendor_name} — ${form.peptide_name} ${form.peptide_strength}${form.batch_number ? ` (${form.batch_number})` : ''}`;
    await base44.entities.GroupBuyTest.create({
      ...form,
      title,
      total_cost: estimatedCost,
      cost_per_participant: costPerPerson ? parseFloat(costPerPerson) : null,
      max_participants: maxP || null,
      current_participants: 0,
      status: 'open',
    });
    setLoading(false);
    onSuccess();
    onClose();
    setStep(1);
    setForm({ vendor_name: '', peptide_name: '', peptide_strength: '', batch_number: '', test_types: [], max_participants: '', cutoff_date: '', payment_deadline: '', results_public: true, organizer_name: '', organizer_email: '', organizer_social: '', organizer_platform: 'Discord', description: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-black">Create Group Buy Test</DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= s ? 'bg-[#8B2635] text-white' : 'bg-slate-100 text-slate-400'}`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-1 rounded-full transition-all ${step > s ? 'bg-[#8B2635]' : 'bg-slate-100'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Sample Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-black text-black text-sm uppercase tracking-widest">Sample Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Vendor / Manufacturer *</label>
                <Input placeholder="e.g. Barn Research, Limitless Life..." value={form.vendor_name} onChange={e => set('vendor_name', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Peptide *</label>
                <select className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#8B2635]" value={form.peptide_name} onChange={e => set('peptide_name', e.target.value)}>
                  <option value="">Select peptide...</option>
                  {PEPTIDES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Label Claim / Strength *</label>
                <Input placeholder="e.g. 5mg, 10mg, 2mg..." value={form.peptide_strength} onChange={e => set('peptide_strength', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Batch / Lot Number (if known)</label>
                <Input placeholder="e.g. Batch #2024-11A" value={form.batch_number} onChange={e => set('batch_number', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Additional Notes</label>
                <Textarea placeholder="Any extra context about the sample, sourcing, etc." rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Tests */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-black text-black text-sm uppercase tracking-widest">Select Tests *</h3>
            <div className="grid grid-cols-2 gap-2">
              {TEST_OPTIONS.map(t => (
                <button key={t.id} onClick={() => toggleTest(t.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${form.test_types.includes(t.id) ? 'border-[#8B2635] bg-[#8B2635]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${form.test_types.includes(t.id) ? 'bg-[#8B2635] border-[#8B2635]' : 'border-slate-300'}`}>
                    {form.test_types.includes(t.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-black">{t.label}</div>
                    <div className="text-[11px] text-slate-500 leading-tight">{t.description}</div>
                  </div>
                </button>
              ))}
            </div>

            {estimatedCost > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Estimated Cost Breakdown</div>
                <div className="text-2xl font-black text-black">${estimatedCost}</div>
                <div className="mt-3">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Max Participants (to split cost)</label>
                  <Input type="number" placeholder="e.g. 10" value={form.max_participants} onChange={e => set('max_participants', e.target.value)} className="w-32" />
                  {costPerPerson && <p className="text-sm font-bold text-[#8B2635] mt-1">≈ ${costPerPerson} per person</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Organizer & Dates */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-black text-black text-sm uppercase tracking-widest">Organizer & Dates</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Your Name / Alias (appears on COA) *</label>
                <Input placeholder="Name or handle to appear on Certificate of Analysis" value={form.organizer_name} onChange={e => set('organizer_name', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Your Email * (private, not shared)</label>
                <Input type="email" placeholder="your@email.com" value={form.organizer_email} onChange={e => set('organizer_email', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Social Handle (optional)</label>
                <Input placeholder="@yourhandle" value={form.organizer_social} onChange={e => set('organizer_social', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Platform</label>
                <select className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#8B2635]" value={form.organizer_platform} onChange={e => set('organizer_platform', e.target.value)}>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Join Cutoff Date *</label>
                <Input type="date" value={form.cutoff_date} onChange={e => set('cutoff_date', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Payment Deadline *</label>
                <Input type="date" value={form.payment_deadline} onChange={e => set('payment_deadline', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Results Visibility</label>
                <div className="flex gap-3">
                  {[true, false].map(v => (
                    <button key={String(v)} onClick={() => set('results_public', v)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${form.results_public === v ? 'border-[#8B2635] bg-[#8B2635] text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      {v ? '🌐 Public Results' : '🔒 Private Results'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={step === 1 ? onClose : () => setStep(s => s - 1)} size="sm">
            {step === 1 ? <><X className="w-4 h-4 mr-1" />Cancel</> : <><ChevronLeft className="w-4 h-4 mr-1" />Back</>}
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} size="sm" className="bg-[#8B2635] hover:bg-[#6B1827]">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canNext() || loading} size="sm" className="bg-[#8B2635] hover:bg-[#6B1827]">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : '🚀 Create Group Buy'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}