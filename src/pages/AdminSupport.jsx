import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function AdminSupport() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser?.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);

        // Set admin as online
        const adminStatuses = await base44.entities.AdminStatus.filter({
          admin_email: currentUser.email
        });
        
        if (adminStatuses.length > 0) {
          await base44.entities.AdminStatus.update(adminStatuses[0].id, {
            is_online: true,
            last_seen: new Date().toISOString()
          });
        } else {
          await base44.entities.AdminStatus.create({
            admin_email: currentUser.email,
            admin_name: currentUser.full_name,
            is_online: true,
            last_seen: new Date().toISOString()
          });
        }
      } catch (error) {
        navigate(createPageUrl('Home'));
      }
    };
    checkAuth();

    // Cleanup: set admin as offline when leaving
    return () => {
      const setOffline = async () => {
        try {
          const currentUser = await base44.auth.me();
          const adminStatuses = await base44.entities.AdminStatus.filter({
            admin_email: currentUser.email
          });
          if (adminStatuses.length > 0) {
            await base44.entities.AdminStatus.update(adminStatuses[0].id, {
              is_online: false,
              last_seen: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Failed to set offline:', error);
        }
      };
      setOffline();
    };
  }, [navigate]);

  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['support-conversations'],
    queryFn: () => base44.entities.SupportConversation.list('-last_message_at'),
    enabled: !!user,
  });

  useEffect(() => {
    if (!selectedConversation) return;

    const loadMessages = async () => {
      const msgs = await base44.entities.SupportMessage.filter({
        conversation_id: selectedConversation.id
      });
      setMessages(msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));

      // Mark as read
      if (selectedConversation.unread_by_admin) {
        await base44.entities.SupportConversation.update(selectedConversation.id, {
          unread_by_admin: false
        });
        refetchConversations();
      }
    };

    loadMessages();

    // Subscribe to new messages
    const unsubscribe = base44.entities.SupportMessage.subscribe((event) => {
      if (event.type === 'create' && event.data.conversation_id === selectedConversation.id) {
        setMessages(prev => [...prev, event.data]);
      }
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setLoading(true);
    try {
      await base44.entities.SupportMessage.create({
        conversation_id: selectedConversation.id,
        message: newMessage,
        sender_role: 'admin',
        sender_name: user.full_name
      });

      await base44.entities.SupportConversation.update(selectedConversation.id, {
        last_message: newMessage.slice(0, 100),
        last_message_at: new Date().toISOString()
      });

      setNewMessage('');
      refetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-amber-50 mb-8">Customer Support</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-stone-900/50 border border-stone-700 rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-stone-700">
              <h2 className="font-bold text-amber-50">Conversations</h2>
              <p className="text-xs text-stone-400 mt-1">
                {conversations.filter(c => c.unread_by_admin).length} unread
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-stone-400 text-sm">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-4 border-b border-stone-800 hover:bg-stone-800/50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-stone-800/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-amber-50 text-sm">{conv.customer_name}</p>
                      {conv.unread_by_admin && (
                        <Circle className="w-2 h-2 text-red-600 fill-red-600 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-stone-400 truncate">{conv.last_message}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      {new Date(conv.last_message_at).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-stone-900/50 border border-stone-700 rounded-lg overflow-hidden flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-stone-700 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-amber-50">{selectedConversation.customer_name}</h3>
                    <p className="text-xs text-stone-400">{selectedConversation.customer_email}</p>
                  </div>
                  <Badge variant={selectedConversation.status === 'open' ? 'default' : 'secondary'}>
                    {selectedConversation.status}
                  </Badge>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          msg.sender_role === 'admin'
                            ? 'bg-red-700 text-amber-50'
                            : 'bg-stone-800 text-amber-50'
                        }`}
                      >
                        {msg.sender_role === 'admin' && (
                          <p className="text-xs text-amber-50/70 mb-1">{msg.sender_name}</p>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs text-amber-50/60 mt-1">
                          {new Date(msg.created_date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-stone-700">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                      placeholder="Type your response..."
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
            ) : (
              <div className="flex-1 flex items-center justify-center text-stone-400">
                Select a conversation to start
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}