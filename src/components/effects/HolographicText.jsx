import React from 'react';
import { motion } from 'framer-motion';

export default function HolographicText({ children, className = "" }) {
  return (
    <div className={`relative inline-block ${className}`}>
      <motion.div className="mt-1 mr-2 relative z-10"

      animate={{
        textShadow: [
        '0 0 10px rgba(125, 74, 43, 0.5), 0 0 20px rgba(196, 149, 91, 0.3)',
        '0 0 20px rgba(125, 74, 43, 0.7), 0 0 30px rgba(196, 149, 91, 0.5)',
        '0 0 10px rgba(125, 74, 43, 0.5), 0 0 20px rgba(196, 149, 91, 0.3)']

      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}>

        {children}
      </motion.div>
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-barn-tan/20 to-transparent"
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