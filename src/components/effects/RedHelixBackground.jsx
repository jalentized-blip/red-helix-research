import React from 'react';
import { motion } from 'framer-motion';

export default function RedHelixBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Large background helix 1 - Top Right */}
      <motion.div 
        className="absolute -top-20 -right-20 w-[600px] h-[600px] opacity-[0.08]"
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <HelixSVG />
      </motion.div>

      {/* Large background helix 2 - Bottom Left */}
      <motion.div 
        className="absolute -bottom-40 -left-20 w-[800px] h-[800px] opacity-[0.06]"
        animate={{ 
          rotate: -360,
          y: [0, 50, 0]
        }}
        transition={{ 
          rotate: { duration: 80, repeat: Infinity, ease: "linear" },
          y: { duration: 15, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <HelixSVG />
      </motion.div>

      {/* Smaller floating helix - Center Right */}
      <motion.div 
        className="absolute top-1/3 right-[10%] w-[300px] h-[300px] opacity-[0.1]"
        animate={{ 
          y: [-20, 20, -20],
          rotate: 180
        }}
        transition={{ 
          y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 40, repeat: Infinity, ease: "linear" }
        }}
      >
        <HelixSVG />
      </motion.div>
    </div>
  );
}

function HelixSVG() {
  return (
    <svg viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="helixGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DC2626" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#991B1B" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Rungs (Base Pairs) */}
      <g stroke="#DC2626" strokeWidth="3" strokeOpacity="0.5" strokeLinecap="round">
        <line x1="100" y1="20" x2="100" y2="20" />
        <line x1="135" y1="40" x2="65" y2="40" />
        <line x1="150" y1="60" x2="50" y2="60" />
        <line x1="135" y1="80" x2="65" y2="80" />
        <line x1="100" y1="100" x2="100" y2="100" />
        <line x1="65" y1="120" x2="135" y2="120" />
        <line x1="50" y1="140" x2="150" y2="140" />
        <line x1="65" y1="160" x2="135" y2="160" />
        <line x1="100" y1="180" x2="100" y2="180" />
        <line x1="135" y1="200" x2="65" y2="200" />
        <line x1="150" y1="220" x2="50" y2="220" />
        <line x1="135" y1="240" x2="65" y2="240" />
        <line x1="100" y1="260" x2="100" y2="260" />
        <line x1="65" y1="280" x2="135" y2="280" />
        <line x1="50" y1="300" x2="150" y2="300" />
        <line x1="65" y1="320" x2="135" y2="320" />
        <line x1="100" y1="340" x2="100" y2="340" />
      </g>

      {/* Strand 1 */}
      <path 
        d="M100 20 
           C 130 20, 150 40, 150 60 
           S 130 100, 100 100
           S 50 140, 50 140
           S 20 180, 100 180
           S 150 220, 150 220
           S 180 260, 100 260
           S 50 300, 50 300
           S 20 340, 100 340"
        stroke="url(#helixGradient)" 
        strokeWidth="6" 
        strokeLinecap="round"
        fill="none"
      />

      {/* Strand 2 */}
      <path 
        d="M100 20 
           C 70 20, 50 40, 50 60 
           S 70 100, 100 100
           S 150 140, 150 140
           S 180 180, 100 180
           S 50 220, 50 220
           S 20 260, 100 260
           S 150 300, 150 300
           S 180 340, 100 340"
        stroke="url(#helixGradient)" 
        strokeWidth="6" 
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
