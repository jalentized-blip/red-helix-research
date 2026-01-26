import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Circle, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TypingIndicator from './TypingIndicator';

export default function TelegramChatWindow({ isOpen, onClose, customerInfo = null, conversationId = null, isAdmin = false }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [user, setUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [typingAdmin, setTypingAdmin] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen]);

  const initializeChat = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      setIsAuthenticated(isAuth);

      let currentUser = null;
      if (isAuth) {
        currentUser = await base44.auth.me();
        setUser(currentUser);
      }

      let conversationToUse = null;

      // If opening a specific conversation from inbox
      if (conversationId) {
        const conv = await base44.entities.SupportConversation.list();
        const targetConv = conv.find(c => c.id === conversationId);
        if (targetConv) {
          setConversation(targetConv);
          conversationToUse = targetConv;
          const msgs = await base44.entities.SupportMessage.filter({
            conversation_id: targetConv.id
          });
          setMessages(msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
        }
      } else if (customerInfo) {
        // New conversation from unauthenticated user
        const conversations = await base44.entities.SupportConversation.filter({
          customer_email: customerInfo.email
        });

        let conv;
        if (conversations.length > 0) {
          conv = conversations[0];
        } else {
          conv = await base44.entities.SupportConversation.create({
            customer_email: customerInfo.email,
            customer_name: customerInfo.name,
            status: 'open'
          });
        }
        setConversation(conv);
        conversationToUse = conv;

        const msgs = await base44.entities.SupportMessage.filter({
          conversation_id: conv.id
        });
        setMessages(msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
      } else if (currentUser) {
        // Existing authenticated user
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
        conversationToUse = conv;

        // Load messages
        const msgs = await base44.entities.SupportMessage.filter({
          conversation_id: conv.id
        });
        setMessages(msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
      }

      // Load admin statuses
      const adminStatuses = await base44.entities.AdminStatus.list();
      setAdmins(adminStatuses);

      // Subscribe to new messages
      const unsubscribe = base44.entities.SupportMessage.subscribe((event) => {
        if (event.type === 'create' && event.data.conversation_id === conversationToUse?.id) {
          setMessages(prev => [...prev, event.data]);
          setTypingAdmin(null);
        }
      });

      // Subscribe to admin status changes
      const unsubscribeAdmin = base44.entities.AdminStatus.subscribe(async (event) => {
        const adminStatuses = await base44.entities.AdminStatus.list();
        setAdmins(adminStatuses);
      });

      // Subscribe to conversation updates to detect typing
      const unsubscribeConv = base44.entities.SupportConversation.subscribe((event) => {
        if (event.id === conversationToUse?.id && event.data?.last_message_at) {
          const adminTyping = adminStatuses.find(a => a.is_online);
          if (adminTyping && adminStatuses.length > 0) {
            setTypingAdmin(adminTyping);
            setTimeout(() => setTypingAdmin(null), 2000);
          }
        }
      });

      return () => {
        unsubscribe();
        unsubscribeAdmin();
        unsubscribeConv();
      };
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !conversation) return;

    setLoading(true);
    try {
      await base44.entities.SupportMessage.create({
        conversation_id: conversation.id,
        message: newMessage,
        sender_role: isAdmin ? 'admin' : 'customer',
        sender_name: isAdmin ? (user?.full_name || 'Support Admin') : (customerInfo?.name || user?.full_name || 'Customer')
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
          className={`fixed z-50 bg-stone-900 border border-stone-700 shadow-2xl overflow-hidden ${isAdmin ? 'bottom-6 right-6 w-[900px] h-[600px] rounded-2xl flex' : 'bottom-24 right-6 w-96 h-[500px] rounded-2xl flex flex-col'}`}
        >
          {/* Admin Sidebar */}
          {isAdmin && (
            <div className="w-72 border-r border-stone-700 flex flex-col overflow-hidden bg-stone-950">
              {/* Online Admins */}
              <div className="p-4 border-b border-stone-700">
                <h3 className="text-sm font-bold text-amber-50 mb-3">Support Team</h3>
                <div className="space-y-2">
                  {admins.map(admin => (
                    <div key={admin.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-800/50">
                      <Circle className={`w-2 h-2 ${admin.is_online ? 'fill-green-400 text-green-400' : 'fill-stone-600 text-stone-600'}`} />
                      <span className="text-xs text-stone-300">{admin.admin_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="text-sm font-bold text-amber-50 mb-3">Conversations</h3>
                <div className="space-y-2">
                  {/* Conversations list would go here */}
                </div>
              </div>
            </div>
          )}

          {/* Main Chat Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-600 p-4 text-amber-50 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">Customer Support</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Circle className={`w-2 h-2 ${onlineAdmins.length > 0 ? 'fill-green-400 text-green-400' : 'fill-stone-400 text-stone-400'}`} />
                  <p className="text-xs text-amber-50/80">
                    {onlineAdmins.length > 0 ? `${onlineAdmins.length} admin${onlineAdmins.length !== 1 ? 's' : ''} online` : 'No admins online'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-amber-50 hover:bg-red-600/50 p-1 rounded transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
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
            {typingAdmin && (
              <div className="flex justify-start">
                <TypingIndicator name={typingAdmin.admin_name} />
              </div>
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
             </>
           )}
          </div>
          </motion.div>
          )}
          </AnimatePresence>
          );
          }