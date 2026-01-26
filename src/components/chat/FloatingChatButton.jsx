import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function FloatingChatButton({ onClick, isOpen }) {
  const [adminsOnline, setAdminsOnline] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const admins = await base44.entities.AdminStatus.list();
        setAdminsOnline(admins.some(a => a.is_online));
      } catch (error) {
        console.error('Failed to check admin status:', error);
      }
    };

    checkAdminStatus();

    // Subscribe to status changes
    const unsubscribe = base44.entities.AdminStatus.subscribe(() => {
      checkAdminStatus();
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div
      className="fixed right-0 top-0 h-screen z-50 flex items-center justify-center"
      style={{ opacity: 0.25 }}
      whileHover={{ opacity: 1 }}
    >
      <button
        onClick={onClick}
        className="p-4 bg-red-700 rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110 group relative"
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-amber-50" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageCircle className="w-6 h-6 text-amber-50" />
              {adminsOnline && (
                <Circle className="absolute -top-1 -right-1 w-3 h-3 fill-green-400 text-green-400" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 whitespace-nowrap text-xs text-amber-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {adminsOnline ? 'Admins online' : 'Start a chat'}
        </div>
      </button>
    </motion.div>
  );
}