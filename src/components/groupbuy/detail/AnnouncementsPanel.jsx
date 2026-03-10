import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function AnnouncementsPanel({ groupBuyId, isOrganizer }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: announcements = [] } = useQuery({
    queryKey: ['gbAnnouncements', groupBuyId],
    queryFn: () => base44.entities.GroupBuyAnnouncement.filter({ group_buy_id: groupBuyId }, '-created_date'),
  });

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    await base44.entities.GroupBuyAnnouncement.create({ group_buy_id: groupBuyId, title: title.trim(), body: body.trim() });
    setTitle(''); setBody(''); setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['gbAnnouncements', groupBuyId] });
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.GroupBuyAnnouncement.delete(id);
    queryClient.invalidateQueries({ queryKey: ['gbAnnouncements', groupBuyId] });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-[#8B2635]" />
          <span className="font-black text-sm text-black">Announcements</span>
        </div>
        {isOrganizer && (
          <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-3 h-3 mr-1" /> Post
          </Button>
        )}
      </div>

      {isOrganizer && showForm && (
        <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-2">
          <input
            placeholder="Announcement title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#8B2635]"
          />
          <textarea
            placeholder="Announcement details..."
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={3}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#8B2635] resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handlePost} disabled={saving} className="bg-[#8B2635] hover:bg-[#6B1827] text-xs h-7">Post</Button>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-50">
        {announcements.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">No announcements yet.</p>
        ) : (
          announcements.map(a => (
            <div key={a.id} className="p-4 group">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-black text-sm text-black mb-1">{a.title}</p>
                  <p className="text-xs text-slate-600">{a.body}</p>
                  {a.created_date && (
                    <p className="text-[10px] text-slate-400 mt-1">{format(new Date(a.created_date), 'MMM d, yyyy h:mm a')}</p>
                  )}
                </div>
                {isOrganizer && (
                  <button onClick={() => handleDelete(a.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}