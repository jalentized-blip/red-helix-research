import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "🧪 HPLC-VERIFIED PURITY • 99%+ on every batch",
  "🚀 FREE SHIPPING on orders over $100",
  "📋 THIRD-PARTY COA • Every product, every batch",
  "🔬 BPC-157 • Back in stock — limited quantities",
  "⚡ 24–48H DISPATCH • Orders ship fast",
  "💊 SEMAGLUTIDE & TIRZEPATIDE • GLP-1 research grade",
  "🏆 BEST PRICES in the market — no 500% markups",
  "🇺🇸 USA-BASED • Discreet, professional packaging",
  "🎁 REFER A FRIEND • Earn rewards on every order",
  "🔒 ISO-CERTIFIED SOURCING • Batch traceability guaranteed",
];

const ROTATION_INTERVAL = 5000;

export default function ScrollingAnnouncement() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % MESSAGES.length);
        setFade(true);
      }, 300);
    }, ROTATION_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#8B2635] overflow-hidden py-2 text-center">
      <p
        className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-white transition-opacity duration-300"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {MESSAGES[index]}
      </p>
    </div>
  );
}