import React from 'react';
import { motion } from 'framer-motion';

export default function MolecularBackground() {
  const floatingElements = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    delay: i * 0.2,
    duration: 6 + i * 0.5,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 30 + Math.random() * 50
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
            opacity: [0, 0.1, 0.15, 0],
            y: [`${el.y}%`, `${el.y - 20}%`],
            x: [`${el.x}%`, `${el.x + 5}%`]
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: "linear"
          }}
        >
          <SVGMolecule size={el.size} />
        </motion.div>
      ))}

      {/* DNA helix pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="helix" x="0" y="0" width="100" height="200" patternUnits="userSpaceOnUse">
            <path d="M 50 0 Q 80 25, 80 50 Q 80 75, 50 100 Q 20 125, 20 150 Q 20 175, 50 200" stroke="#7D4A2B" strokeWidth="2" fill="none" />
            <path d="M 50 0 Q 20 25, 20 50 Q 20 75, 50 100 Q 80 125, 80 150 Q 80 175, 50 200" stroke="#7D4A2B" strokeWidth="2" fill="none" opacity="0.5" />
            <circle cx="50" cy="50" r="3" fill="#7D4A2B" opacity="0.6" />
            <circle cx="50" cy="150" r="3" fill="#7D4A2B" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#helix)" />
      </svg>
    </div>
  );
}

function SVGMolecule({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="text-[#7D4A2B]">
      <circle cx="50" cy="30" r="6" fill="currentColor" opacity="0.7" />
      <circle cx="30" cy="60" r="5" fill="currentColor" opacity="0.6" />
      <circle cx="70" cy="60" r="5" fill="currentColor" opacity="0.6" />
      <circle cx="50" cy="80" r="4" fill="currentColor" opacity="0.5" />
      <line x1="50" y1="36" x2="35" y2="55" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="50" y1="36" x2="65" y2="55" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="30" y1="65" x2="50" y2="76" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="70" y1="65" x2="50" y2="76" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}