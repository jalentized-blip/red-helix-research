import React from 'react';
import { motion } from 'framer-motion';

export default function HolographicText({ children, className = "" }) {
  return (
    <div className={`relative inline-block ${className}`}>
      <motion.div className="mt-1 mr-2 relative z-10"
      animate={{
        textShadow: [
        '0 0 10px rgba(220, 38, 38, 0.2), 0 0 20px rgba(15, 23, 42, 0.1)',
        '0 0 20px rgba(220, 38, 38, 0.4), 0 0 30px rgba(15, 23, 42, 0.2)',
        '0 0 10px rgba(220, 38, 38, 0.2), 0 0 20px rgba(15, 23, 42, 0.1)']
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}>
        {children}
      </motion.div>
      
      {/* Shimmer effect - Medical Red/White */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600/10 to-transparent"
        animate={{
          x: ['-100%', '200%']
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2,
          ease: "linear"
        }}
        style={{ mixBlendMode: 'overlay' }} />
    </div>);
}
