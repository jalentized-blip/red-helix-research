import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ResearchDisclaimer() {
  return (
    <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-black text-red-700 mb-1 uppercase tracking-wide text-xs">For Research Use Only</h3>
          <p className="text-sm text-red-800/80 font-medium leading-relaxed">
            These products are intended for laboratory research and educational purposes only. 
            Not for human consumption. Consult qualified healthcare professionals before use.
          </p>
        </div>
      </div>
    </div>
  );
}