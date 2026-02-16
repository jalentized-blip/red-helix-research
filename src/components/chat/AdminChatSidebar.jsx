import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Circle, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminChatSidebar({ selectedConvId, onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [convs, adminStatuses] = await Promise.all([
          base44.entities.SupportConversation.list(),
          base44.entities.AdminStatus.list()
        ]);
        setConversations(convs.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)));
        setAdmins(adminStatuses);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to conversation changes
    const unsubscribeConv = base44.entities.SupportConversation.subscribe(() => {
      fetchData();
    });

    // Subscribe to admin status changes
    const unsubscribeAdmin = base44.entities.AdminStatus.subscribe(() => {
      fetchData();
    });

    return () => {
      unsubscribeConv();
      unsubscribeAdmin();
    };
  }, []);

  const onlineAdmins = admins.filter(a => a.is_online);

  return (
    <div className="w-80 bg-stone-900 border-r border-stone-700 flex flex-col overflow-hidden">
      {/* Online Admins Section */}
      <div className="p-4 border-b border-stone-700">
        <h3 className="text-sm font-bold text-amber-50 mb-3">Support Team</h3>
        <div className="space-y-2">
          {admins.map(admin => (
            <div key={admin.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-800/50">
              <Circle className={`w-2 h-2 ${admin.is_online ? 'fill-green-400 text-green-400' : 'fill-stone-600 text-stone-600'}`} />
              <span className="text-xs text-stone-300">{admin.admin_name}</span>
              {!admin.is_online && admin.last_seen && (
                <span className="text-xs text-stone-500 ml-auto">
                  {new Date(admin.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Conversations Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-bold text-amber-50 mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Conversations
          </h3>
          {loading ? (
            <p className="text-xs text-stone-400">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-stone-400">No conversations yet</p>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {conversations.map(conv => (
                  <motion.button
                    key={conv.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={() => onSelectConversation(conv)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedConvId === conv.id
                        ? 'bg-red-700/20 border border-[#dc2626]/50'
                        : 'bg-stone-800/30 border border-stone-700/30 hover:bg-stone-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-amber-50">{conv.customer_name}</p>
                        <p className="text-xs text-stone-400 truncate mt-1">{conv.customer_email}</p>
                        {conv.last_message && (
                          <p className="text-xs text-stone-500 truncate mt-1">{conv.last_message}</p>
                        )}
                      </div>
                      {conv.unread_by_admin && (
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-1 ml-2" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}