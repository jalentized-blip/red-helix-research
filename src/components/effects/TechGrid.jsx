import React from 'react';
import { motion } from 'framer-motion';

export default function TechGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Animated grid lines - Slate version for clinical feel */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#0f172a" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Scanning line effect - Medical red scan */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dc2626]/20 to-transparent"
        animate={{
          top: ['0%', '100%'],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ opacity: 0.2 }}
      />

      {/* Corner accents - Precise clinical marks */}
      <div className="absolute top-12 left-12 w-16 h-16">
        <motion.div
          className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#dc2626]/40 to-transparent"
          animate={{ width: ['0%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
        />
        <motion.div
          className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-[#dc2626]/40 to-transparent"
          animate={{ height: ['0%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
        />
      </div>
      
      <div className="absolute bottom-12 right-12 w-16 h-16 rotate-180">
        <motion.div
          className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-slate-900/20 to-transparent"
          animate={{ width: ['0%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, delay: 1 }}
        />
        <motion.div
          className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-slate-900/20 to-transparent"
          animate={{ height: ['0%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, delay: 1 }}
        />
      </div>
    </div>
  );
}
