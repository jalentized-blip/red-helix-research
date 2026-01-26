import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TelegramChatWindow({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [user, setUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen]);

  const initializeChat = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Find or create conversation
      const conversations = await base44.entities.SupportConversation.filter({
        customer_email: currentUser.email
      });

      let conv;
      if (conversations.length > 0) {
        conv = conversations[0];
      } else {
        conv = await base44.entities.SupportConversation.create({
          customer_email: currentUser.email,
          customer_name: currentUser.full_name,
          status: 'open'
        });
      }
      setConversation(conv);

      // Load messages
      const msgs = await base44.entities.SupportMessage.filter({
        conversation_id: conv.id
      });
      setMessages(msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));

      // Load admin statuses
      const adminStatuses = await base44.entities.AdminStatus.list();
      setAdmins(adminStatuses);

      // Subscribe to new messages
      const unsubscribe = base44.entities.SupportMessage.subscribe((event) => {
        if (event.type === 'create' && event.data.conversation_id === conv.id) {
          setMessages(prev => [...prev, event.data]);
        }
      });

      // Subscribe to admin status changes
      const unsubscribeAdmin = base44.entities.AdminStatus.subscribe((event) => {
        const adminStatuses = await base44.entities.AdminStatus.list();
        setAdmins(adminStatuses);
      });

      return () => {
        unsubscribe();
        unsubscribeAdmin();
      };
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !conversation || !user) return;

    setLoading(true);
    try {
      await base44.entities.SupportMessage.create({
        conversation_id: conversation.id,
        message: newMessage,
        sender_role: 'customer',
        sender_name: user.full_name
      });

      await base44.entities.SupportConversation.update(conversation.id, {
        last_message: newMessage.slice(0, 100),
        last_message_at: new Date().toISOString(),
        unread_by_admin: true
      });

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const onlineAdmins = admins.filter(a => a.is_online);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 to-red-600 p-4 text-amber-50">
            <h3 className="font-bold text-lg">Customer Support</h3>
            <div className="flex items-center gap-2 mt-1">
              <Circle className={`w-2 h-2 ${onlineAdmins.length > 0 ? 'fill-green-400 text-green-400' : 'fill-stone-400 text-stone-400'}`} />
              <p className="text-xs text-amber-50/80">
                {onlineAdmins.length > 0 ? `${onlineAdmins.length} admin${onlineAdmins.length !== 1 ? 's' : ''} online` : 'No admins online'}
              </p>
            </div>
          </div>

          {/* Admin List */}
          {admins.length > 0 && (
            <div className="px-4 py-2 bg-stone-800/50 border-b border-stone-700">
              <p className="text-xs font-semibold text-stone-400 mb-2">Available Support</p>
              <div className="space-y-1">
                {admins.map(admin => (
                  <div key={admin.id} className="flex items-center gap-2">
                    <Circle className={`w-2 h-2 ${admin.is_online ? 'fill-green-400 text-green-400' : 'fill-stone-600 text-stone-600'}`} />
                    <p className="text-xs text-stone-300">{admin.admin_name}</p>
                    {!admin.is_online && admin.last_seen && (
                      <p className="text-xs text-stone-500">
                        ({new Date(admin.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-stone-400 text-sm mt-8">
                <p>Welcome! How can we help you today?</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_role === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      msg.sender_role === 'customer'
                        ? 'bg-red-700 text-amber-50'
                        : 'bg-stone-800 text-amber-50'
                    }`}
                  >
                    {msg.sender_role === 'admin' && (
                      <p className="text-xs text-stone-400 mb-1">{msg.sender_name || 'Support Team'}</p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-stone-700">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder="Type your message..."
                className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !newMessage.trim()}
                className="bg-red-700 hover:bg-red-600"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}