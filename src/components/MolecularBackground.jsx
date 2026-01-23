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
            <path d="M 50 0 Q 80 25, 80 50 Q 80 75, 50 100 Q 20 125, 20 150 Q 20 175, 50 200" stroke="#dc2626" strokeWidth="2" fill="none" />
            <path d="M 50 0 Q 20 25, 20 50 Q 20 75, 50 100 Q 80 125, 80 150 Q 80 175, 50 200" stroke="#dc2626" strokeWidth="2" fill="none" opacity="0.5" />
            <circle cx="50" cy="50" r="3" fill="#dc2626" opacity="0.6" />
            <circle cx="50" cy="150" r="3" fill="#dc2626" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#helix)" />
      </svg>
    </div>
  );
}

function SVGMolecule({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="text-red-600">
      <defs>
        <linearGradient id="vialGradient" x1="0%" y1="0%" x2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {/* Vial cap */}
      <rect x="40" y="15" width="20" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
      {/* Vial body */}
      <path d="M 35 23 L 30 35 Q 28 50 30 65 Q 32 75 50 78 Q 68 75 70 65 Q 72 50 70 35 L 65 23 Z" 
            fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      {/* Vial shine/highlight */}
      <path d="M 38 28 Q 37 45 38 60" 
            fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}