import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Pin, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categories = [
  { id: 'general', label: 'General Discussion', icon: '💬' },
  { id: 'research', label: 'Research & Studies', icon: '🔬' },
  { id: 'protocols', label: 'Protocols & Dosing', icon: '📋' },
  { id: 'safety', label: 'Safety & Side Effects', icon: '⚠️' },
  { id: 'results', label: 'Results & Experiences', icon: '✨' },
];

export default function Forums() {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedThread, setSelectedThread] = useState(null);

  const { data: threads = [] } = useQuery({
    queryKey: ['forumThreads'],
    queryFn: () => base44.entities.ForumThread.list('-created_date'),
  });

  const filteredThreads = threads
    .filter(t => t.category === selectedCategory)
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_date) - new Date(a.created_date);
    });

  if (selectedThread) {
    return (
      <div className="min-h-screen bg-stone-950 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <button 
            onClick={() => setSelectedThread(null)}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-50 mb-8 transition-colors"
          >
            <X className="w-4 h-4" />
            Back to Forums
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900/50 border border-stone-700 rounded-lg p-8"
          >
            <div className="mb-8 pb-8 border-b border-stone-700">
              <h1 className="text-3xl md:text-4xl font-black text-amber-50 mb-4">
                {selectedThread.title}
              </h1>
              <p className="text-stone-400 text-sm">
                Posted {new Date(selectedThread.created_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="bg-stone-800/30 border border-stone-700 rounded-lg p-6 text-stone-200 leading-relaxed whitespace-pre-wrap">
                {selectedThread.content}
              </div>
            </div>

            <div className="mt-12 p-6 bg-stone-800/50 border border-stone-700 rounded-lg text-center text-stone-400">
              <p className="text-sm">This is a research and educational thread. Always verify protocols with current research and consult appropriate professionals.</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-50 mb-8 transition-colors">
          <Home className="w-4 h-4" />
          Back to Shop
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black text-amber-50 mb-4">
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Community Forums
            </span>
          </h1>
          <p className="text-stone-300 text-lg">
            Discuss peptides, research protocols, safety, and share experiences with the community
          </p>
        </motion.div>

        {/* Categories Tabs */}
        <Tabs defaultValue="general" onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 bg-transparent border-b border-stone-700 mb-8">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="data-[state=active]:bg-red-600/20 data-[state=active]:border-red-600/50 data-[state=active]:text-amber-50 border border-stone-700 text-stone-400"
              >
                <span className="mr-2">{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="space-y-4">
              {filteredThreads.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-stone-400 text-lg">No threads yet in this category</p>
                  <p className="text-stone-500 text-sm mt-2">Be the first to start a discussion!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredThreads.map((thread, idx) => (
                    <motion.div
                      key={thread.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <button
                        onClick={() => setSelectedThread(thread)}
                        className="w-full text-left p-5 bg-stone-900/50 border border-stone-700 rounded-lg hover:border-red-600/50 hover:bg-stone-800/50 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {thread.is_pinned && (
                                <Pin className="w-4 h-4 text-red-600" fill="currentColor" />
                              )}
                              <h3 className="text-amber-50 font-semibold truncate hover:text-red-600">
                                {thread.title}
                              </h3>
                            </div>
                            <p className="text-stone-400 text-sm line-clamp-2">
                              {thread.content}
                            </p>
                            <p className="text-stone-500 text-xs mt-2">
                              {new Date(thread.created_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}