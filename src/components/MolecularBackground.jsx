import React from 'react';
import { motion } from 'framer-motion';

export default function MolecularBackground() {
  const floatingElements = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 0.5,
    duration: 10 + i * 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 20 + Math.random() * 40
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating molecular structures */}
      {floatingElements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute"
          initial={{ opacity: 0, x: `${el.x}%`, y: `${el.y}%` }}
          animate={{
            opacity: [0, 0.15, 0.2, 0],
            y: [`${el.y}%`, `${el.y - 15}%`],
            x: [`${el.x}%`, `${el.x + 2}%`]
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: "easeInOut"
          }}
        >
          <SVGMolecule size={el.size} />
        </motion.div>
      ))}

      {/* DNA helix pattern - Clinical Slate/Red variation */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="helix" x="0" y="0" width="120" height="240" patternUnits="userSpaceOnUse">
            <path 
              d="M 60 0 Q 100 30, 100 60 Q 100 90, 60 120 Q 20 150, 20 180 Q 20 210, 60 240" 
              stroke="#0f172a" 
              strokeWidth="0.5" 
              fill="none" 
            />
            <path 
              d="M 60 0 Q 20 30, 20 60 Q 20 90, 60 120 Q 100 150, 100 180 Q 100 210, 60 240" 
              stroke="#dc2626" 
              strokeWidth="0.5" 
              fill="none" 
              opacity="0.3" 
            />
            <circle cx="60" cy="60" r="1.5" fill="#dc2626" opacity="0.2" />
            <circle cx="60" cy="180" r="1.5" fill="#0f172a" opacity="0.1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#helix)" />
      </svg>
    </div>
  );
}

function SVGMolecule({ size }) {
  const isRed = Math.random() > 0.7;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={isRed ? "text-[#dc2626]" : "text-slate-200"}>
      <circle cx="50" cy="30" r="6" fill="currentColor" opacity="0.4" />
      <circle cx="30" cy="60" r="5" fill="currentColor" opacity="0.3" />
      <circle cx="70" cy="60" r="5" fill="currentColor" opacity="0.3" />
      <circle cx="50" cy="80" r="4" fill="currentColor" opacity="0.2" />
      <line x1="50" y1="36" x2="35" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="50" y1="36" x2="65" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="30" y1="65" x2="50" y2="76" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="70" y1="65" x2="50" y2="76" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    </svg>
  );
}
