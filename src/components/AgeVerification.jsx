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
      <DialogContent className="bg-stone-900 border border-stone-700 max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <DialogTitle className="text-amber-50 text-2xl">Age Verification</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <DialogDescription className="text-stone-300 text-base">
            This website contains research chemicals and peptides. You must be at least 21 years old to access this content.
          </DialogDescription>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-5 h-5 rounded border-stone-600 bg-stone-800 cursor-pointer"
              />
              <span className="text-stone-300 text-sm">I confirm that I am at least 21 years old</span>
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              disabled={!confirmed}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-amber-50"
            >
              Continue
            </Button>
          </div>

          <p className="text-stone-500 text-xs text-center">
            By clicking continue, you agree that you are of legal age and understand the terms of use.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}