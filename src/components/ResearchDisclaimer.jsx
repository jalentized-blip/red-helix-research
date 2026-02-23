import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export default function ResearchDisclaimer() {
  return (
    <div className="bg-[#dc2626] border-2 border-red-600 rounded-2xl p-6 mb-6 shadow-lg">
      <div className="flex gap-4">
        <ShieldAlert className="w-8 h-8 text-white flex-shrink-0 mt-0.5" />
        <div className="space-y-3">
          <h3 className="font-black text-white text-lg uppercase tracking-wide">⚠️ RESEARCH USE ONLY - NOT FOR HUMAN CONSUMPTION</h3>
          <div className="space-y-2 text-white font-bold text-sm leading-relaxed">
            <p>
              <span className="underline">THESE PRODUCTS ARE STRICTLY FOR LABORATORY RESEARCH PURPOSES ONLY.</span>
            </p>
            <p>
              ❌ NOT FOR HUMAN USE, CONSUMPTION, OR INJECTION<br/>
              ❌ NOT APPROVED BY FDA FOR HUMAN OR VETERINARY USE<br/>
              ❌ NOT INTENDED TO DIAGNOSE, TREAT, CURE, OR PREVENT ANY DISEASE
            </p>
            <p>
              By purchasing, you certify that you are 21+ years of age, a qualified researcher or institution, and will use these products solely for in-vitro research and educational purposes in a controlled laboratory environment. Misuse of these research materials may violate federal, state, and local laws.
            </p>
            <p className="text-white/90 text-xs pt-2 border-t border-white/30">
              All products sold are for research purposes only. Buyer assumes all responsibility for proper handling, storage, and use in compliance with applicable laws and regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}