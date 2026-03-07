import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Mail, Search, X, Eye, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const TEMPLATE_LABELS = {
  outage_apology: { label: 'Outage Apology', color: 'bg-red-50 border-red-200 text-red-700' },
  order_confirmation: { label: 'Order Confirmation', color: 'bg-green-50 border-green-200 text-green-700' },
  tracking: { label: 'Tracking Update', color: 'bg-purple-50 border-purple-200 text-purple-700' },
};

export default function AdminSentEmails() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [previewEmail, setPreviewEmail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);
      } catch {
        navigate(createPageUrl('Home'));
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['order-communications'],
    queryFn: () => base44.entities.OrderCommunication.list('-sent_at'),
    enabled: !!user,
  });

  const filtered = emails.filter(e =>
    !search ||
    e.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
    e.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.subject?.toLowerCase().includes(search.toLowerCase()) ||
    e.order_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#dc2626]"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('AdminOrderManagement')}>
          <Button variant="ghost" className="mb-4 hover:bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-xs">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
              Sent <span className="text-[#dc2626]">Emails</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">All customer emails sent by admins</p>
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 px-5 py-3 text-center">
            <p className="text-3xl font-black text-slate-900">{emails.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Sent</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, name, subject, or order..."
            className="bg-slate-50 border-slate-200 text-slate-900 pl-11 rounded-full h-12"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-400 hover:text-[#dc2626]" />
            </button>
          )}
        </div>

        {/* Email List */}
        {isLoading ? (
          <div className="text-center py-24">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-[#dc2626]"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
            <Mail className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No emails found</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((email) => {
                const tmpl = TEMPLATE_LABELS[email.template_used] || { label: email.template_used || 'Custom', color: 'bg-slate-100 border-slate-200 text-slate-600' };
                return (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border-2 border-slate-100 hover:border-[#dc2626]/20 rounded-2xl px-5 py-4 flex items-center gap-4 group cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setPreviewEmail(email)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-slate-900 font-black text-sm truncate">{email.subject}</p>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${tmpl.color}`}>
                          {tmpl.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-medium flex-wrap">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{email.customer_name || '—'}</span>
                        <span className="text-slate-200">|</span>
                        <span>{email.customer_email}</span>
                        {email.order_number && email.order_number !== 'OUTAGE' && (
                          <>
                            <span className="text-slate-200">|</span>
                            <span>#{email.order_number}</span>
                          </>
                        )}
                        <span className="text-slate-200">|</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {email.sent_at ? format(new Date(email.sent_at), 'MMM dd, yyyy h:mm a') : format(new Date(email.created_date), 'MMM dd, yyyy h:mm a')}
                        </span>
                      </div>
                    </div>
                    <Eye className="w-4 h-4 text-slate-300 group-hover:text-[#dc2626] transition-colors flex-shrink-0" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Email Preview Dialog */}
      <Dialog open={!!previewEmail} onOpenChange={() => setPreviewEmail(null)}>
        <DialogContent className="bg-white border-slate-200 max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-black text-lg">{previewEmail?.subject}</DialogTitle>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500 pt-1">
              <span><strong>To:</strong> {previewEmail?.customer_email}</span>
              {previewEmail?.customer_name && <span><strong>Name:</strong> {previewEmail.customer_name}</span>}
              <span><strong>Sent:</strong> {previewEmail?.sent_at ? format(new Date(previewEmail.sent_at), 'MMM dd, yyyy h:mm a') : '—'}</span>
              {previewEmail?.sent_by && <span><strong>By:</strong> {previewEmail.sent_by}</span>}
            </div>
          </DialogHeader>
          <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
            {previewEmail?.body ? (
              <iframe
                srcDoc={previewEmail.body}
                className="w-full h-[500px] border-0"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            ) : (
              <p className="p-6 text-slate-500 text-sm whitespace-pre-wrap">{previewEmail?.body}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}