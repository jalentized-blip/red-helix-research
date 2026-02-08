import React from 'react';
import { motion } from 'framer-motion';

export default function RedHelixBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Large background helix 1 - Top Right */}
      <motion.div 
        className="absolute -top-20 -right-20 w-[600px] h-[600px] opacity-[0.03]"
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
        className="absolute -bottom-40 -left-20 w-[800px] h-[800px] opacity-[0.02]"
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
        className="absolute top-1/3 right-[10%] w-[300px] h-[300px] opacity-[0.04]"
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
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="helixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
      </defs>
      
      {/* Abstract Helix Shape */}
      <path 
        d="M100 20 
           C 140 20, 160 50, 160 80 
           C 160 110, 130 130, 100 130 
           C 70 130, 40 150, 40 180" 
        stroke="url(#helixGradient)" 
        strokeWidth="20" 
        strokeLinecap="round"
        opacity="0.8"
      />
      <path 
        d="M100 180 
           C 60 180, 40 150, 40 120 
           C 40 90, 70 70, 100 70 
           C 130 70, 160 50, 160 20" 
        stroke="url(#helixGradient)" 
        strokeWidth="20" 
        strokeLinecap="round"
        opacity="0.4"
      />
      
      {/* Connecting rungs/dots */}
      <circle cx="100" cy="20" r="8" fill="#DC2626" />
      <circle cx="160" cy="80" r="8" fill="#DC2626" />
      <circle cx="100" cy="130" r="8" fill="#DC2626" />
      <circle cx="40" cy="180" r="8" fill="#DC2626" />
      
      <circle cx="100" cy="180" r="8" fill="#DC2626" opacity="0.5" />
      <circle cx="40" cy="120" r="8" fill="#DC2626" opacity="0.5" />
      <circle cx="100" cy="70" r="8" fill="#DC2626" opacity="0.5" />
      <circle cx="160" cy="20" r="8" fill="#DC2626" opacity="0.5" />
    </svg>
  );
}
