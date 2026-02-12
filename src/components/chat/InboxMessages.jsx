import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InboxMessages({ onSelectConversation }) {
  const { data: conversations = [], refetch } = useQuery({
    queryKey: ['unread-conversations'],
    queryFn: async () => {
      return await base44.entities.SupportConversation.filter(
        { unread_by_admin: false },
        '-last_message_at',
        10
      );
    },
  });

  useEffect(() => {
    const unsubscribe = base44.entities.SupportConversation.subscribe(() => {
      refetch();
    });

    return () => unsubscribe();
  }, [refetch]);

  const [expanded, setExpanded] = useState(false);

  if (conversations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed left-6 bottom-6 z-40"
    >
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-4 w-80 max-h-96 overflow-y-auto bg-stone-900/95 border border-stone-700 rounded-lg shadow-2xl"
          >
            <div className="sticky top-0 bg-stone-900 border-b border-stone-700 p-4 flex items-center justify-between">
              <h3 className="text-amber-50 font-semibold text-sm">Unread Messages</h3>
              <button
                onClick={() => setExpanded(false)}
                className="text-stone-400 hover:text-amber-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-stone-800">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className="w-full text-left p-4 hover:bg-stone-800/50 transition-colors"
                >
                  <div className="font-medium text-amber-50 text-sm">{conv.customer_name}</div>
                  <div className="text-xs text-stone-400 mt-1 line-clamp-2">
                    {conv.last_message}
                  </div>
                  <div className="text-xs text-stone-500 mt-2">
                    {new Date(conv.last_message_at).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setExpanded(!expanded)}
        className="relative p-4 bg-red-700 rounded-full shadow-lg hover:bg-[#dc2626] transition-all group"
      >
        <MessageSquare className="w-6 h-6 text-amber-50" />
        {conversations.length > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-[#dc2626] to-red-700 text-amber-50 text-xs font-bold rounded-full flex items-center justify-center shadow-lg border border-[#dc2626]">
            {conversations.length}
          </span>
        )}
        <div className="absolute left-full ml-2 bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 whitespace-nowrap text-xs text-amber-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Inbox
        </div>
      </button>
    </motion.div>
  );
}