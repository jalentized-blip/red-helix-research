import React from 'react';
import { motion } from 'framer-motion';

export default function TypingIndicator({ name }) {
  const dotVariants = {
    start: { y: 0 },
    end: { y: -10 },
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-400">{name} is typing</span>
      <div className="flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            variants={dotVariants}
            initial="start"
            animate="end"
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
            className="w-1.5 h-1.5 bg-stone-400 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}