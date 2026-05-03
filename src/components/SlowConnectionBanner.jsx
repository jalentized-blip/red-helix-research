import React, { useState, useEffect } from 'react';
import { Wifi, X } from 'lucide-react';

export default function SlowConnectionBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check sessionStorage flag set by inline script in index.html
    const flagged = sessionStorage.getItem('rhr_slow_connection') === '1';
    if (flagged) { setShow(true); return; }

    // Also check Network Information API directly
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      const slow = conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.saveData === true;
      if (slow) setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="w-full bg-amber-50 border-b border-amber-300 px-4 py-2 flex items-center justify-between gap-3 z-[69] relative">
      <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
        <Wifi className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Slow connection detected — images will load progressively. The site is fully functional.</span>
      </div>
      <button
        onClick={() => setShow(false)}
        className="text-amber-600 hover:text-amber-900 flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}