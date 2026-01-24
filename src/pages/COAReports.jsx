import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, ExternalLink, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function COAReports() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: coas = [], isLoading } = useQuery({
    queryKey: ['userCOAs'],
    queryFn: () => base44.entities.UserCOA.list('-created_date'),
  });

  const filteredCOAs = coas.filter(coa =>
    coa.peptide_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coa.peptide_strength.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-50 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-50 mb-2">Community COA Reports</h1>
          <p className="text-stone-400">Browse Certificates of Analysis uploaded by our community</p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <Input
              type="text"
              placeholder="Search by peptide name or strength..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-stone-900 border-stone-700 text-amber-50 placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* COA Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-stone-400">Loading COAs...</div>
        ) : filteredCOAs.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            {coas.length === 0 ? 'No COAs uploaded yet. Be the first!' : 'No COAs match your search.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCOAs.map((coa, index) => (
              <motion.div
                key={coa.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-stone-900/50 border border-stone-800 rounded-lg p-6 hover:border-barn-brown/50 transition-all hover:shadow-lg hover:shadow-barn-brown/20"
              >
                {/* Thumbnail */}
                <div className="mb-4 bg-stone-800 rounded-lg h-48 overflow-hidden border border-stone-700">
                  <img
                    src={coa.coa_image_url}
                    alt={`${coa.peptide_name} COA`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-stone-400 uppercase tracking-wider">Peptide</p>
                    <h3 className="text-lg font-bold text-amber-50">{coa.peptide_name}</h3>
                  </div>

                  <div>
                    <p className="text-xs text-stone-400 uppercase tracking-wider">Strength</p>
                    <p className="text-sm font-semibold text-stone-300">{coa.peptide_strength}</p>
                  </div>

                  {coa.uploaded_by && (
                    <div>
                      <p className="text-xs text-stone-400 uppercase tracking-wider">Uploaded By</p>
                      <p className="text-sm text-stone-400">{coa.uploaded_by.split('@')[0]}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-stone-400 uppercase tracking-wider">Date</p>
                    <p className="text-sm text-stone-400">
                      {new Date(coa.created_date).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Links */}
                  <div className="flex gap-2 pt-4 border-t border-stone-800">
                    <a
                      href={coa.coa_image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-barn-brown/20 border border-barn-brown/30 rounded-lg text-barn-tan hover:bg-barn-brown/30 transition-colors text-sm font-semibold"
                    >
                      View Image
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {coa.coa_link && (
                      <a
                        href={coa.coa_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-barn-brown/20 border border-barn-brown/30 rounded-lg text-barn-tan hover:bg-barn-brown/30 transition-colors text-sm font-semibold"
                      >
                        Original Link
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}