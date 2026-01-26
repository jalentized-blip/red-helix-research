import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function FloatingChatButton({ onClick, isOpen, isMinimized = false }) {
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
    <motion.button
      onClick={() => onClick && onClick()}
      className="fixed bottom-6 right-6 z-50 p-4 bg-red-700 rounded-full shadow-lg hover:bg-red-600 transition-all group"
      whileHover={{ scale: 1.1, y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      whileTap={{ scale: 0.95 }}
    >
        <AnimatePresence mode="wait">
          {isOpen && !isMinimized ? (
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
        
      <div className="absolute bottom-full right-0 mb-2 bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 whitespace-nowrap text-xs text-amber-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {adminsOnline ? 'Admins online' : 'Start a chat'}
      </div>
    </motion.button>
  );
}