import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GroupBuy() {
  return (
    <div className="min-h-screen bg-stone-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-50 mb-8 transition-colors">
          <Home className="w-4 h-4" />
          Back to Shop
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-stone-900/50 border border-stone-700 rounded-lg p-8 md:p-12"
        >
          <h1 className="text-4xl md:text-5xl font-black text-amber-50 mb-4">
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Group Buy Testing
            </span>
          </h1>
          
          <p className="text-stone-300 text-lg mb-8 max-w-2xl">
            Organize and manage group testing directly through PeptideTest. Fill out the form below to create a new group test and coordinate with others.
          </p>

          {/* Embedded JotForm */}
          <div className="bg-stone-800/30 border border-stone-700 rounded-lg p-6 md:p-8 overflow-hidden">
            <iframe
              title="Create Group Test Form"
              src="https://form.jotform.com/243527434360252?parentURL=https%3A%2F%2Fpeptidetest.com%2Fpages%2Fcreate-group-test"
              allow="geolocation; microphone; camera; fullscreen"
              scrolling="auto"
              style={{
                width: '100%',
                minHeight: '1858px',
                border: 'none',
                borderRadius: '8px'
              }}
            />
          </div>

          <p className="text-stone-400 text-sm mt-8">
            For more information, visit <a href="https://peptidetest.com/pages/create-group-test" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-400">PeptideTest.com</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}