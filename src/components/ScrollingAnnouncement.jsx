import React from 'react';

export default function ScrollingAnnouncement() {
  const message = "🚀 SOFT LAUNCH - LIMITED STOCK AVAILABLE 🚀 • Limited quantities while we scale • ";

  return (
    <div className="w-full bg-gradient-to-r from-red-600/10 to-red-700/10 backdrop-blur-sm border-b border-red-600/20 overflow-hidden py-2.5">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .scrolling-text {
          animation: scroll 10s linear infinite;
        }
      `}</style>
      <div className="scrolling-text whitespace-nowrap text-sm font-semibold text-amber-50 inline-block">
        {message}{message}{message}
      </div>
    </div>
  );
}