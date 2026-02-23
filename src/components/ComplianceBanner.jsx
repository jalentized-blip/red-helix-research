import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function ComplianceBanner() {
  return (
    <div className="bg-[#dc2626] border-b-2 border-red-700 py-3">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 text-white">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <p className="text-xs md:text-sm font-black uppercase tracking-wider text-center">
            ⚠️ RESEARCH USE ONLY • NOT FOR HUMAN CONSUMPTION • 21+ QUALIFIED RESEARCHERS ONLY
          </p>
        </div>
      </div>
    </div>
  );
}