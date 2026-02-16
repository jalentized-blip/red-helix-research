import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function GlowingCard({ children, className = "" }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glowing border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-barn-brown via-barn-tan to-barn-brown rounded-lg opacity-0 group-hover:opacity-75 blur-sm transition-opacity duration-300" />
      
      {/* Spotlight effect on hover */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-lg opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(circle 150px at ${mousePosition.x}px ${mousePosition.y}px, rgba(125, 74, 43, 0.4), transparent)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
        />
      )}
      
      {/* Content */}
      <div className="relative bg-stone-900/50 border border-stone-700 rounded-lg group">
        {children}
      </div>
      
      {/* Corner accent lines */}
      <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-barn-brown to-transparent" />
        <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-barn-brown to-transparent" />
      </div>
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l from-barn-brown to-transparent" />
        <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-barn-brown to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-barn-brown to-transparent" />
        <div className="absolute bottom-0 left-0 w-0.5 h-full bg-gradient-to-t from-barn-brown to-transparent" />
      </div>
      <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-barn-brown to-transparent" />
        <div className="absolute bottom-0 right-0 w-0.5 h-full bg-gradient-to-t from-barn-brown to-transparent" />
      </div>
    </motion.div>
  );
}