import React from 'react';
import { motion } from 'framer-motion';

export default function RedHelixBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Floating Molecule 1 - Top Right */}
      <motion.div 
        className="absolute -top-10 -right-10 w-[500px] h-[500px] opacity-[0.06]"
        animate={{ 
          rotate: 360,
          y: [0, 30, 0]
        }}
        transition={{ 
          rotate: { duration: 120, repeat: Infinity, ease: "linear" },
          y: { duration: 20, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <PeptideStructureSVG variant="complex" />
      </motion.div>

      {/* Floating Molecule 2 - Bottom Left */}
      <motion.div 
        className="absolute -bottom-20 -left-20 w-[600px] h-[600px] opacity-[0.05]"
        animate={{ 
          rotate: -360,
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          rotate: { duration: 150, repeat: Infinity, ease: "linear" },
          scale: { duration: 25, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <PeptideStructureSVG variant="kekule" />
      </motion.div>

      {/* Floating Molecule 3 - Center Right */}
      <motion.div 
        className="absolute top-1/2 right-[5%] w-[300px] h-[300px] opacity-[0.08]"
        animate={{ 
          y: [-40, 40, -40],
          rotate: 45
        }}
        transition={{ 
          y: { duration: 15, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 60, repeat: Infinity, ease: "linear" }
        }}
      >
        <PeptideStructureSVG variant="simple" />
      </motion.div>

      {/* Floating Molecule 4 - Top Left */}
      <motion.div 
        className="absolute top-20 left-[10%] w-[250px] h-[250px] opacity-[0.04]"
        animate={{ 
          rotate: 180,
          x: [-20, 20, -20]
        }}
        transition={{ 
          rotate: { duration: 90, repeat: Infinity, ease: "linear" },
          x: { duration: 18, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <PeptideStructureSVG variant="ring" />
      </motion.div>
    </div>
  );
}

function PeptideStructureSVG({ variant }) {
  const strokeColor = "#DC2626"; // Red-600

  // Standard chemical bond styles
  const bondStyle = {
    stroke: strokeColor,
    strokeWidth: "2",
    strokeLinecap: "round",
    fill: "none"
  };

  const atomStyle = {
    fill: strokeColor,
    opacity: 0.2
  };

  if (variant === 'kekule') {
    // Hexagonal Benzene-like Ring Structure (Kekulé)
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <g transform="translate(100,100) scale(3)">
          {/* Central Ring */}
          <path d="M0,-20 L17.32,-10 L17.32,10 L0,20 L-17.32,10 L-17.32,-10 Z" {...bondStyle} />
          {/* Double Bonds */}
          <line x1="0" y1="-16" x2="13" y2="-8.5" {...bondStyle} />
          <line x1="13" y1="8.5" x2="0" y2="16" {...bondStyle} />
          <line x1="-13" y1="-8.5" x2="-13" y2="8.5" {...bondStyle} />
          
          {/* Attached Groups */}
          <line x1="17.32" y1="-10" x2="30" y2="-20" {...bondStyle} />
          <line x1="-17.32" y1="10" x2="-30" y2="20" {...bondStyle} />
          
          {/* Atoms */}
          <circle cx="30" cy="-20" r="3" {...atomStyle} />
          <circle cx="-30" cy="20" r="3" {...atomStyle} />
        </g>
      </svg>
    );
  }

  if (variant === 'complex') {
    // Long Peptide Chain Representation
    return (
      <svg viewBox="0 0 400 200" className="w-full h-full">
        <g transform="translate(20,100) scale(1.5)">
          {/* Backbone */}
          <polyline 
            points="0,0 20,-20 40,0 60,-20 80,0 100,-20 120,0 140,-20 160,0 180,-20 200,0" 
            {...bondStyle} 
          />
          
          {/* Side Chains */}
          <line x1="20" y1="-20" x2="20" y2="-40" {...bondStyle} />
          <line x1="60" y1="-20" x2="60" y2="-40" {...bondStyle} />
          <line x1="100" y1="-20" x2="100" y2="-40" {...bondStyle} />
          <line x1="140" y1="-20" x2="140" y2="-40" {...bondStyle} />
          <line x1="180" y1="-20" x2="180" y2="-40" {...bondStyle} />
          
          {/* Functional Groups */}
          <circle cx="20" cy="-45" r="4" {...atomStyle} />
          <circle cx="60" cy="-45" r="4" {...atomStyle} />
          <rect x="96" y="-48" width="8" height="8" {...atomStyle} />
          <path d="M140,-40 L135,-50 L145,-50 Z" {...atomStyle} />
          <circle cx="180" cy="-45" r="4" {...atomStyle} />
        </g>
      </svg>
    );
  }

  if (variant === 'ring') {
    // Cyclic Peptide / Steroid Core
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <g transform="translate(50,50) scale(2)">
          {/* Ring A */}
          <path d="M0,20 L17.3,10 L17.3,-10 L0,-20 L-17.3,-10 L-17.3,10 Z" {...bondStyle} />
          {/* Ring B (Attached) */}
          <path d="M17.3,10 L34.6,20 L51.9,10 L51.9,-10 L34.6,-20 L17.3,-10" {...bondStyle} />
          
          {/* Methyl Group */}
          <line x1="17.3" y1="-10" x2="17.3" y2="-25" {...bondStyle} />
        </g>
      </svg>
    );
  }

  // Simple / Default (Amino Acid Structure)
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <g transform="translate(100,100) scale(2)">
        {/* Central Carbon */}
        <circle cx="0" cy="0" r="2" {...atomStyle} />
        
        {/* Bonds */}
        <line x1="0" y1="0" x2="-20" y2="10" {...bondStyle} /> {/* N-term */}
        <line x1="0" y1="0" x2="20" y2="10" {...bondStyle} />  {/* C-term */}
        <line x1="0" y1="0" x2="0" y2="-20" {...bondStyle} />  {/* Side chain */}
        <line x1="0" y1="0" x2="0" y2="15" {...bondStyle} strokeDasharray="2,2" />   {/* H */}

        {/* Groups */}
        <text x="-35" y="15" fill="#DC2626" fontSize="10" fontFamily="Arial" opacity="0.4">H₂N</text>
        <text x="25" y="15" fill="#DC2626" fontSize="10" fontFamily="Arial" opacity="0.4">COOH</text>
        <circle cx="0" cy="-25" r="4" {...atomStyle} /> {/* R-Group */}
      </g>
    </svg>
  );
}
