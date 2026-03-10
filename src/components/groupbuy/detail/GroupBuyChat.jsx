import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, Hash, SmilePlus, AtSign, PlusCircle } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

function getDateLabel(date) {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = null;
  let currentGroup = null;
  messages.forEach(msg => {
    const d = new Date(msg.created_date);
    const dateLabel = getDateLabel(d);
    if (dateLabel !== currentDate) {
      currentDate = dateLabel;
      currentGroup = { dateLabel, messages: [] };
      groups.push(currentGroup);
    }
    currentGroup.messages.push(msg);
  });
  return groups;
}

// Compact consecutive messages from same sender
function compactMessages(messages) {
  return messages.map((msg, i) => {
    const prev = messages[i - 1];
    const isCompact = prev &&
      prev.sender_email === msg.sender_email &&
      new Date(msg.created_date) - new Date(prev.created_date) < 5 * 60 * 1000;
    return { ...msg, isCompact };
  });
}

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-600',
  'bg-amber-500', 'bg-pink-500', 'bg-teal-600', 'bg-[#8B2635]',
];

function emailToColor(email) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function GroupBuyChat({ groupBuyId, groupBuyTitle, currentUser }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['gbMessages', groupBuyId],
    queryFn: () => base44.entities.GroupBuyMessage.filter({ group_buy_id: groupBuyId }, 'created_date', 300),
    refetchInterval: 4000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!message.trim() || !currentUser) return;
    setSending(true);
    const optimisticMsg = {
      id: '__optimistic__',
      group_buy_id: groupBuyId,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name || currentUser.email.split('@')[0],
      message: message.trim(),
      created_date: new Date().toISOString(),
    };
    setMessage('');
    await base44.entities.GroupBuyMessage.create({
      group_buy_id: groupBuyId,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name || currentUser.email.split('@')[0],
      message: optimisticMsg.message,
    });
    queryClient.invalidateQueries({ queryKey: ['gbMessages', groupBuyId] });
    setSending(false);
    inputRef.current?.focus();
  };

  const dateGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full bg-white rounded-none overflow-hidden" style={{ height: '100%', minHeight: 0 }}>

      {/* Channel header — Discord style */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0 shadow-sm">
        <Hash className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <span className="font-black text-black text-sm truncate">general</span>
        <div className="h-4 w-px bg-slate-200 mx-1" />
        <span className="text-xs text-slate-500 truncate">{groupBuyTitle || 'Group Buy Chat'}</span>
        <span className="ml-auto text-[10px] text-slate-400 font-bold flex-shrink-0">{messages.length} msgs</span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-0 py-2 space-y-0 min-h-0 scrollbar-thin"
        style={{ scrollbarColor: '#4a4d55 transparent' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#8B2635]/20 border border-[#8B2635]/30 flex items-center justify-center mb-4">
              <Hash className="w-7 h-7 text-[#8B2635]" />
            </div>
            <p className="font-black text-white text-base mb-1">Welcome to #general!</p>
            <p className="text-slate-400 text-sm">This is the start of the group buy discussion. Say hi! 👋</p>
          </div>
        )}

        {dateGroups.map(group => (
          <div key={group.dateLabel}>
            {/* Date divider */}
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">{group.dateLabel}</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {compactMessages(group.messages).map(msg => {
              const isMe = msg.sender_email === currentUser?.email;
              const avatarColor = emailToColor(msg.sender_email);
              const initial = (msg.sender_name || msg.sender_email)[0].toUpperCase();
              const nameDisplay = isMe ? 'You' : (msg.sender_name || msg.sender_email.split('@')[0]);

              return (
                <div
                  key={msg.id}
                  onMouseEnter={() => setHoveredId(msg.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`group relative flex gap-3 px-4 py-0.5 hover:bg-slate-50 transition-colors ${msg.isCompact ? 'mt-0' : 'mt-3'}`}
                >
                  {/* Avatar or spacer */}
                  <div className="w-10 flex-shrink-0">
                    {!msg.isCompact ? (
                      <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-black mt-0.5`}>
                        {initial}
                      </div>
                    ) : (
                      <span className={`text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1 block text-right leading-none`}>
                        {msg.created_date ? format(new Date(msg.created_date), 'h:mm') : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {!msg.isCompact && (
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className={`font-black text-sm ${isMe ? 'text-[#8B2635]' : 'text-black'}`}>{nameDisplay}</span>
                        {msg.created_date && (
                          <span className="text-[10px] text-slate-500">{format(new Date(msg.created_date), 'h:mm a')}</span>
                        )}
                      </div>
                    )}
                    <p className="text-slate-700 text-sm leading-relaxed break-words">{msg.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area — Discord style */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0 bg-white border-t border-slate-100">
        {currentUser ? (
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            <button className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
              <PlusCircle className="w-5 h-5" />
            </button>
            <input
              ref={inputRef}
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={`Message #general`}
              className="flex-1 bg-transparent text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none"
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <AtSign className="w-4 h-4" />
              </button>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <SmilePlus className="w-4 h-4" />
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className={`ml-1 w-7 h-7 rounded-md flex items-center justify-center transition-all ${message.trim() ? 'bg-[#8B2635] hover:bg-[#6B1827] text-white' : 'bg-[#4e5058] text-slate-500 cursor-not-allowed'}`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#383a40] rounded-xl px-4 py-3 text-center">
            <span className="text-slate-400 text-sm">You must be signed in to chat.</span>
          </div>
        )}
      </div>
    </div>
  );
}