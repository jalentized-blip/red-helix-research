import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'rhr_age_gate_v2';

function setVerificationRecord() {
  const record = {
    version: '2.0',
    site: 'redhelixresearch.com',
    verifiedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  localStorage.setItem('ageVerified', 'true');
  localStorage.setItem('research_disclaimer_agreed', 'true');
  const exp = new Date(record.expiresAt).toUTCString();
  document.cookie = `rhr_age_v2=1; expires=${exp}; path=/; SameSite=Strict; Secure`;
}

export default function AgeGate({ onVerified }) {
  const handleConfirm = () => {
    setVerificationRecord();
    onVerified?.();
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/98 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="bg-gradient-to-br from-[#8B2635] to-[#6B1827] p-8 text-center">
          <ShieldCheck className="w-14 h-14 text-white mx-auto mb-3" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Age Verification</h2>
          <p className="text-red-200 text-sm font-medium mt-2">You must be 21 or older to enter</p>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed text-center">
            This site provides <strong>research-grade peptides for in-vitro laboratory use only</strong>. All products are <strong>NOT for human consumption, NOT for veterinary use</strong>, and are <strong>NOT approved by the FDA</strong> for human or animal use. By entering, you confirm you are <strong>21 years of age or older</strong>, a licensed researcher, and agree to use all products exclusively for lawful in-vitro research.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleExit}
              className="px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-bold text-sm transition-all"
            >
              Exit
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-4 bg-[#8B2635] hover:bg-[#6B1827] text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              I am 21 or Older — Enter
            </button>
          </div>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            For in-vitro laboratory research use only. Not for human consumption. Not FDA approved for human use.
          </p>
        </div>
      </motion.div>
    </div>
  );
}