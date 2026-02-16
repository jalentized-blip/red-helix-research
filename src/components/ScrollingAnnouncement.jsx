import React from 'react';

export default function ScrollingAnnouncement() {
  const message = "🚀 SOFT LAUNCH - LIMITED STOCK AVAILABLE 🚀 • Limited quantities while we scale • ";

  return (
    <div className="w-full bg-gradient-to-r from-[#dc2626]/10 to-red-700/10 backdrop-blur-sm border-b border-[#dc2626]/20 overflow-hidden py-2.5">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .scrolling-text {
          animation: scroll 10s linear infinite;
        }
      `}</style>
      <div className="scrolling-text whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] text-[#dc2626] inline-block">
        {message}{message}{message}
      </div>
    </div>
  );
}