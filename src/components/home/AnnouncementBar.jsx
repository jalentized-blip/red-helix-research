import React from 'react';
import { motion } from "framer-motion";

export default function AnnouncementBar() {
  return (
    <motion.div 
      initial={{ y: -40 }}
      animate={{ y: 0 }}
      className="bg-red-600 text-white py-2.5 px-4 text-center"
    >
      <p className="text-sm font-semibold uppercase tracking-wide">
        Connect with researchers across the globe in our{' '}
        <a href="#" className="underline hover:no-underline font-bold">
          Community!
        </a>
      </p>
    </motion.div>
  );
}