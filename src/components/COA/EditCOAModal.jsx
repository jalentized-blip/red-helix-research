import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function EditCOAModal({ isOpen, onClose, onSuccess, coa }) {
  const [peptideName, setPeptideName] = useState('');
  const [peptideStrength, setPeptideStrength] = useState('');
  const [coaLink, setCoaLink] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [isFromBarn, setIsFromBarn] = useState(null);
  const [approved, setApproved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (coa) {
      setPeptideName(coa.peptide_name || '');
      setPeptideStrength(coa.peptide_strength || '');
      setCoaLink(coa.coa_link || '');
      setBatchNumber(coa.batch_number || '');
      setIsFromBarn(coa.is_from_barn ?? null);
      setApproved(coa.approved || false);
    }
  }, [coa]);

  const handleSave = async () => {
    if (!peptideName || !peptideStrength) {
      alert('Peptide name and concentration are required.');
      return;
    }

    setIsSaving(true);
    try {
      await base44.entities.UserCOA.update(coa.id, {
        peptide_name: peptideName,
        peptide_strength: peptideStrength,
        coa_link: coaLink || null,
        batch_number: batchNumber || null,
        is_from_barn: isFromBarn,
        approved,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      alert('Error saving: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-slate-200 max-w-lg rounded-[32px] overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-slate-900 text-2xl font-black uppercase tracking-tighter">
            Edit <span className="text-[#8B2635]">COA Report</span>
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Update the details for this certificate of analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-4 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Peptide Name *
              </label>
              <Input
                value={peptideName}
                onChange={(e) => setPeptideName(e.target.value)}
                placeholder="e.g., BPC-157"
                className="bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-xl font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Concentration *
              </label>
              <Input
                value={peptideStrength}
                onChange={(e) => setPeptideStrength(e.target.value)}
                placeholder="e.g., 5mg"
                className="bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Reference Link (Optional)
            </label>
            <Input
              value={coaLink}
              onChange={(e) => setCoaLink(e.target.value)}
              placeholder="Direct link to lab result"
              className="bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-xl font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Batch ID (Optional)
            </label>
            <Input
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="e.g., LOT-2024-001"
              className="bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-xl font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Red Helix Research Verified?
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFromBarn(true)}
                className={`flex-1 h-11 rounded-xl font-black uppercase tracking-wider text-xs transition-all ${
                  isFromBarn === true
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100'
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => setIsFromBarn(false)}
                className={`flex-1 h-11 rounded-xl font-black uppercase tracking-wider text-xs transition-all ${
                  isFromBarn === false
                    ? 'bg-[#8B2635] text-white shadow-lg'
                    : 'bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100'
                }`}
              >
                Third-Party
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Approval Status
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setApproved(true)}
                className={`flex-1 h-11 rounded-xl font-black uppercase tracking-wider text-xs transition-all ${
                  approved
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setApproved(false)}
                className={`flex-1 h-11 rounded-xl font-black uppercase tracking-wider text-xs transition-all ${
                  !approved
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100'
                }`}
              >
                Pending
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-200 text-slate-500 h-12 rounded-full font-black uppercase tracking-wider text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-[#8B2635] hover:bg-[#6B1827] text-white h-12 rounded-full font-black uppercase tracking-wider text-xs shadow-lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}