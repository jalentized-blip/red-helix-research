import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function AgeVerification({ isOpen, onVerify }) {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (confirmed) {
      localStorage.setItem('ageVerified', 'true');
      onVerify();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-white border border-slate-200 max-w-md rounded-[32px] shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-6 h-6 text-[#dc2626]" />
            <DialogTitle className="text-slate-900 text-2xl font-black uppercase tracking-tight">Age Verification</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <DialogDescription className="text-slate-600 text-base font-medium leading-relaxed">
            This website contains research chemicals and peptides. These products are intended for laboratory <span className="text-[#dc2626] font-bold">RESEARCH USE ONLY</span>. You must be at least 21 years old to access this content.
          </DialogDescription>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 bg-slate-50 cursor-pointer accent-[#dc2626] transition-all group-hover:border-[#dc2626]"
              />
              <span className="text-slate-500 text-sm font-semibold group-hover:text-slate-700 transition-colors">I confirm that I am at least 21 years old and understand the research-only nature of these products</span>
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              disabled={!confirmed}
              className="flex-1 bg-[#dc2626] hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-6 rounded-2xl shadow-lg shadow-[#dc2626]/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              Enter Laboratory
            </Button>
          </div>

          <p className="text-slate-400 text-[10px] text-center font-bold uppercase tracking-widest">
            By clicking continue, you agree to our terms and conditions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}