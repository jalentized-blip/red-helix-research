import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ResearchDisclaimer() {
  return (
    <div className="bg-[#dc2626] border border-red-500 rounded-lg p-4 mb-6">
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-black text-white mb-1 uppercase tracking-wide text-xs">For Research Use Only</h3>
          <p className="text-sm text-white font-medium leading-relaxed">
            These products are intended for laboratory research and educational purposes only. 
            Not for human consumption. Consult qualified healthcare professionals before use.
          </p>
        </div>
      </div>
    </div>
  );
}