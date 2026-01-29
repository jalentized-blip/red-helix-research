import React from 'react';
import { motion } from 'framer-motion';

export default function ScrollingAnnouncement() {
  const message = "🚀 SOFT LAUNCH - LIMITED STOCK AVAILABLE 🚀 • Limited quantities while we scale • 🚀 SOFT LAUNCH - LIMITED STOCK AVAILABLE 🚀 • Limited quantities while we scale • ";

  return (
    <div className="w-full bg-gradient-to-r from-red-600/10 to-red-700/10 backdrop-blur-sm border-b border-red-600/20 overflow-hidden py-2.5">
      <motion.div
        animate={{ x: [0, -2000] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="whitespace-nowrap text-sm font-semibold text-amber-50"
      >
        {message}
      </motion.div>
    </div>
  );
}