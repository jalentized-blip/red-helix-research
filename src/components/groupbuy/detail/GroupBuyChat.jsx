import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function GroupBuyChat({ groupBuyId, currentUser }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['gbMessages', groupBuyId],
    queryFn: () => base44.entities.GroupBuyMessage.filter({ group_buy_id: groupBuyId }, 'created_date', 200),
    refetchInterval: 5000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !currentUser) return;
    setSending(true);
    await base44.entities.GroupBuyMessage.create({
      group_buy_id: groupBuyId,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name || currentUser.email.split('@')[0],
      message: message.trim(),
    });
    setMessage('');
    queryClient.invalidateQueries({ queryKey: ['gbMessages', groupBuyId] });
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-[#8B2635]" />
        <span className="font-black text-sm text-black">Participant Chat</span>
        <span className="ml-auto text-[10px] text-slate-400 font-bold">{messages.length} messages</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0" style={{ maxHeight: '420px' }}>
        {messages.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">
            No messages yet. Start the discussion!
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_email === currentUser?.email;
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${isMe ? 'bg-[#8B2635] text-white' : 'bg-slate-100 text-slate-600'}`}>
                {(msg.sender_name || msg.sender_email)[0].toUpperCase()}
              </div>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <span className={`text-[10px] font-bold text-slate-400 ${isMe ? 'text-right' : ''}`}>
                  {isMe ? 'You' : (msg.sender_name || msg.sender_email.split('@')[0])}
                  {msg.created_date && <span className="ml-1 font-normal">{format(new Date(msg.created_date), 'h:mm a')}</span>}
                </span>
                <div className={`px-3 py-2 rounded-2xl text-xs ${isMe ? 'bg-[#8B2635] text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {currentUser ? (
        <div className="p-3 border-t border-slate-100 flex gap-2">
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Write a message..."
            className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#8B2635] bg-slate-50"
          />
          <Button size="sm" onClick={handleSend} disabled={sending || !message.trim()} className="bg-[#8B2635] hover:bg-[#6B1827] px-3">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      ) : (
        <div className="p-3 border-t border-slate-100 text-center text-xs text-slate-400">
          Sign in to join the discussion
        </div>
      )}
    </div>
  );
}