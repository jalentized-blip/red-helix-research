import React, { useState, useEffect } from 'react';
import { Bell, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function NotificationCenter({ userEmail }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['unread-notifications', userEmail],
    queryFn: async () => {
      return await base44.entities.Notification.filter(
        { admin_email: userEmail, read: false },
        '-created_date',
        20
      );
    },
  });

  useEffect(() => {
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.data?.admin_email === userEmail) {
        refetch();
      }
    });

    return () => unsubscribe();
  }, [userEmail, refetch]);

  const markAsRead = async (notificationId) => {
    await base44.entities.Notification.update(notificationId, { read: true });
    refetch();
  };

  const markAllAsRead = async () => {
    for (const notif of notifications) {
      await base44.entities.Notification.update(notif.id, { read: true });
    }
    refetch();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-lg bg-stone-900/50 border border-red-600/30 text-amber-50 hover:bg-red-600/10 hover:border-red-600/70 transition-all group"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-red-600 to-red-700 text-amber-50 text-xs font-bold rounded-full flex items-center justify-center shadow-lg border border-red-600">
            {notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-stone-900/95 border border-stone-700 rounded-lg shadow-2xl z-50"
          >
            <div className="sticky top-0 bg-stone-900/95 border-b border-stone-700 p-4 flex items-center justify-between">
              <h3 className="text-amber-50 font-semibold">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-red-600 hover:text-red-500 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 text-center text-stone-400 text-sm">
                No new notifications
              </div>
            ) : (
              <div className="divide-y divide-stone-800">
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 hover:bg-stone-800/50 cursor-pointer transition-colors group"
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <MessageSquare className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-amber-50">
                          {notif.type === 'new_session'
                            ? 'New chat session'
                            : 'New message'}
                        </div>
                        <div className="text-xs text-stone-400 mt-1">
                          From {notif.customer_name}
                        </div>
                        {notif.message_preview && (
                          <div className="text-xs text-stone-400 mt-1 line-clamp-2">
                            {notif.message_preview}
                          </div>
                        )}
                        <div className="text-xs text-stone-500 mt-2">
                          {new Date(notif.created_date).toLocaleTimeString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-stone-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}