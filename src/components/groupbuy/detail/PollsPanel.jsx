import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart2, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PollsPanel({ groupBuyId, currentUser, isOrganizer }) {
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: polls = [] } = useQuery({
    queryKey: ['gbPolls', groupBuyId],
    queryFn: () => base44.entities.GroupBuyPoll.filter({ group_buy_id: groupBuyId }, '-created_date'),
  });

  const handleCreate = async () => {
    const cleanOpts = options.filter(o => o.trim());
    if (!question.trim() || cleanOpts.length < 2) return;
    setSaving(true);
    const votes = {};
    cleanOpts.forEach((_, i) => { votes[i] = []; });
    await base44.entities.GroupBuyPoll.create({ group_buy_id: groupBuyId, question: question.trim(), options: cleanOpts, votes, created_by: currentUser?.email });
    setQuestion(''); setOptions(['', '']); setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['gbPolls', groupBuyId] });
    setSaving(false);
  };

  const handleVote = async (poll, optionIdx) => {
    if (!currentUser) return;
    const votes = { ...(poll.votes || {}) };
    // Remove existing vote
    Object.keys(votes).forEach(k => {
      votes[k] = (votes[k] || []).filter(e => e !== currentUser.email);
    });
    // Add new vote
    votes[optionIdx] = [...(votes[optionIdx] || []), currentUser.email];
    await base44.entities.GroupBuyPoll.update(poll.id, { votes });
    queryClient.invalidateQueries({ queryKey: ['gbPolls', groupBuyId] });
  };

  const handleClose = async (poll) => {
    await base44.entities.GroupBuyPoll.update(poll.id, { is_closed: true });
    queryClient.invalidateQueries({ queryKey: ['gbPolls', groupBuyId] });
  };

  const handleDelete = async (id) => {
    await base44.entities.GroupBuyPoll.delete(id);
    queryClient.invalidateQueries({ queryKey: ['gbPolls', groupBuyId] });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#8B2635]" />
          <span className="font-black text-sm text-black">Polls</span>
        </div>
        {isOrganizer && (
          <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-3 h-3 mr-1" /> Create Poll
          </Button>
        )}
      </div>

      {isOrganizer && showForm && (
        <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-2">
          <input
            placeholder="Poll question..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#8B2635]"
          />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Options</p>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-1">
              <input
                placeholder={`Option ${i + 1}...`}
                value={opt}
                onChange={e => { const o = [...options]; o[i] = e.target.value; setOptions(o); }}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#8B2635]"
              />
              {options.length > 2 && (
                <button onClick={() => setOptions(options.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          <button onClick={() => setOptions([...options, ''])} className="text-[10px] text-[#8B2635] font-bold hover:underline">
            + Add option
          </button>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={saving} className="bg-[#8B2635] hover:bg-[#6B1827] text-xs h-7">Create</Button>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-50">
        {polls.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">No polls yet.</p>
        ) : (
          polls.map(poll => {
            const totalVotes = Object.values(poll.votes || {}).reduce((s, arr) => s + (arr?.length || 0), 0);
            const myVote = Object.keys(poll.votes || {}).find(k => (poll.votes[k] || []).includes(currentUser?.email));
            return (
              <div key={poll.id} className="p-4 group">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="font-black text-sm text-black">{poll.question}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isOrganizer && !poll.is_closed && (
                      <button onClick={() => handleClose(poll)} className="text-[10px] text-slate-400 hover:text-[#8B2635] font-bold border border-slate-200 rounded px-1.5 py-0.5">Close</button>
                    )}
                    {isOrganizer && (
                      <button onClick={() => handleDelete(poll.id)} className="text-slate-300 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {(poll.options || []).map((opt, i) => {
                    const count = (poll.votes?.[i] || []).length;
                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isMyVote = String(i) === myVote;
                    return (
                      <button
                        key={i}
                        onClick={() => !poll.is_closed && handleVote(poll, i)}
                        disabled={poll.is_closed}
                        className={`w-full text-left rounded-lg border transition-all overflow-hidden ${isMyVote ? 'border-[#8B2635]' : 'border-slate-200 hover:border-slate-300'} ${poll.is_closed ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="relative px-3 py-2">
                          <div className={`absolute inset-0 ${isMyVote ? 'bg-[#8B2635]/10' : 'bg-slate-50'}`} style={{ width: `${pct}%`, transition: 'width 0.4s' }} />
                          <div className="relative flex items-center justify-between">
                            <span className={`text-xs font-bold ${isMyVote ? 'text-[#8B2635]' : 'text-slate-700'}`}>{opt}</span>
                            <span className="text-[10px] text-slate-400">{count} ({pct}%)</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}{poll.is_closed && ' • Closed'}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}