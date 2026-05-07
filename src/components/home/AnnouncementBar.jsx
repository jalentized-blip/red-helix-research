import React from 'react';
import { motion } from "framer-motion";

export default function AnnouncementBar() {
  return (
    <motion.div 
      initial={{ y: -40 }}
      animate={{ y: 0 }}
      className="bg-[#dc2626] text-white py-2.5 px-4 text-center"
    >
      <p className="text-sm font-semibold uppercase tracking-wide">
        Connect with researchers across the globe in our{' '}
        <a href="https://discord.gg/BwQHufvmQ8" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline font-bold">
          Discord Community!
        </a>
      </p>
    </motion.div>
  );
}