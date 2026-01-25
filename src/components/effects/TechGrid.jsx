import React from 'react';
import { motion } from 'framer-motion';

export default function TechGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Animated grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-barn-brown"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Scanning line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-barn-brown to-transparent"
        animate={{
          top: ['0%', '100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ opacity: 0.3 }}
      />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32">
        <motion.div
          className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-barn-brown to-transparent"
          animate={{ width: ['0%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
        <motion.div
          className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-barn-brown to-transparent"
          animate={{ height: ['0%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      </div>
      
      <div className="absolute top-0 right-0 w-32 h-32">
        <motion.div
          className="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l from-barn-brown to-transparent"
          animate={{ width: ['0%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 0.5 }}
        />
        <motion.div
          className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-barn-brown to-transparent"
          animate={{ height: ['0%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 0.5 }}
        />
      </div>
    </div>
  );
}