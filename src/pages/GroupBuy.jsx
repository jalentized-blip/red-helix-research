import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import { generateBreadcrumbSchema } from '@/components/utils/advancedSchemaHelpers';

export default function GroupBuy() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <SEO
        title="Group Buy Testing — Coordinate Research Peptide Testing"
        description="Organize group peptide testing through Red Helix Research. Coordinate with other researchers to verify research peptide quality and share results."
        keywords="group buy peptides, group peptide testing, research peptide verification, peptide quality testing, collaborative research"
        canonical="https://redhelixresearch.com/GroupBuy"
        schema={[generateBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Group Buy', url: '/GroupBuy' }])]}
      />
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#dc2626] mb-8 transition-colors">
          <Home className="w-4 h-4" />
          Back to Shop
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-sm"
        >
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            <span className="text-[#dc2626]">
              Group Buy Testing
            </span>
          </h1>
          
          <p className="text-slate-600 text-lg mb-8 max-w-2xl font-medium">
            Organize and manage group testing directly through PeptideTest. Fill out the form below to create a new group test and coordinate with others.
          </p>

          {/* Embedded JotForm */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 overflow-hidden">
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

          <p className="text-slate-500 text-sm mt-8 font-medium">
            For more information, visit <a href="https://peptidetest.com/pages/create-group-test" target="_blank" rel="noopener noreferrer" className="text-[#dc2626] hover:text-red-700 font-bold">PeptideTest.com</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}