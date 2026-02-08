import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function AlertsDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ['coaAlerts'],
    queryFn: () => base44.entities.COAAlert.filter({ read: false }, '-created_date'),
  });

  const unreadCount = alerts.length;

  useEffect(() => {
    const unsubscribe = base44.entities.COAAlert.subscribe((event) => {
      if (event.type === 'create') {
        refetch();
      }
    });

    return () => unsubscribe();
  }, [refetch]);

  const handleMarkAsRead = async (alertId) => {
    try {
      await base44.entities.COAAlert.update(alertId, { read: true });
      refetch();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-600/30 transition-all shadow-sm"
        title="COA Submission Alerts"
      >
        <Mail className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 max-h-96 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 z-50 overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">COA Submissions ({unreadCount})</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-slate-400 text-sm font-medium">Loading alerts...</div>
              ) : unreadCount === 0 ? (
                <div className="p-8 text-center">
                   <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                     <Mail className="w-5 h-5 text-slate-300" />
                   </div>
                   <p className="text-slate-400 text-sm font-medium">No pending submissions</p>
                </div>
              ) : (
                <div className="space-y-2 p-3">
                  {alerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-white border border-slate-100 rounded-xl hover:border-red-600/30 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <Link to={createPageUrl('COAReports')}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1" onClick={() => handleMarkAsRead(alert.id)}>
                            <p className="text-sm font-black text-slate-900">{alert.peptide_name}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">by {alert.uploaded_by.split('@')[0]}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleMarkAsRead(alert.id);
                            }}
                            className="p-1 rounded hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
                            title="Mark as read"
                          >
                            <X className="w-3 h-3 text-slate-400 hover:text-red-600" />
                          </button>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {unreadCount > 0 && (
              <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
                <Link to={createPageUrl('COAReports')}>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-red-600/20"
                  >
                    Review Submissions
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}