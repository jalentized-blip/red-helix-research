import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, ExternalLink, Search, Trash2, Edit2, Upload, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import UploadCOAModal from '@/components/COA/UploadCOAModal';
import SEO from '@/components/SEO';

export default function COAReports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [user, setUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const { data: coas = [], isLoading, refetch } = useQuery({
    queryKey: ['userCOAs'],
    queryFn: () => base44.entities.UserCOA.list('-created_date'),
  });

  const isAdmin = user?.role === 'admin';

  // Show all COAs to admins, only approved to regular users
  const displayedCOAs = isAdmin ? coas : coas.filter(coa => coa.approved);

  const filteredCOAs = displayedCOAs.filter(coa =>
    coa.peptide_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coa.peptide_strength.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCOAs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCOAs.map(coa => coa.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} COA(s)?`)) return;

    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedIds).map(id =>
        base44.entities.UserCOA.delete(id)
      );
      await Promise.all(deletePromises);
      setSelectedIds(new Set());
      refetch();
    } catch (error) {
      alert('Error deleting COAs: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this COA?')) return;

    try {
      await base44.entities.UserCOA.delete(id);
      refetch();
    } catch (error) {
      alert('Error deleting COA: ' + error.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      await base44.entities.UserCOA.update(id, { approved: true });
      refetch();
    } catch (error) {
      alert('Error approving COA: ' + error.message);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Delete this COA?')) return;

    try {
      await base44.entities.UserCOA.delete(id);
      refetch();
    } catch (error) {
      alert('Error rejecting COA: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-8">
      <SEO 
        title="Gray Market Peptide COA Database - Community Lab Testing Verification"
        description="Comprehensive database of verified peptide COAs from gray market suppliers. Community-uploaded third-party lab testing results for research peptides. Verify peptide purity, potency, and authenticity before purchase."
        keywords="peptide COA, gray market peptide testing, certificate of analysis, peptide lab testing, third party peptide testing, peptide purity verification, research peptide COA, community COA database, underground peptide testing, peptide vendor verification, research chemical COA, peptide source verification"
      />
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

        {/* Search and Admin Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <Input
              type="text"
              placeholder="Search by peptide name or strength..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-stone-900 border-stone-700 text-amber-50 placeholder:text-stone-400"
            />
          </div>

          {isAdmin && selectedIds.size > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={toggleSelectAll}
                variant="outline"
                className="border-stone-700 text-amber-50"
              >
                {selectedIds.size === filteredCOAs.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="bg-red-900 hover:bg-red-800 text-amber-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedIds.size})
              </Button>
            </div>
          )}

          {isAdmin && selectedIds.size === 0 && filteredCOAs.length > 0 && (
            <Button
              onClick={toggleSelectAll}
              variant="outline"
              className="border-stone-700 text-amber-50"
            >
              Select All
            </Button>
          )}
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
                className={`bg-stone-900/50 border rounded-lg p-6 transition-all hover:shadow-lg hover:shadow-barn-brown/20 ${
                  selectedIds.has(coa.id)
                    ? 'border-barn-brown bg-barn-brown/10'
                    : 'border-stone-800 hover:border-barn-brown/50'
                }`}
              >
                {isAdmin && (
                  <div className="space-y-3 mb-4 pb-4 border-b border-stone-800">
                    {/* Checkbox and Delete */}
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedIds.has(coa.id)}
                        onCheckedChange={() => toggleSelect(coa.id)}
                        className="w-4 h-4"
                      />
                      <button
                        onClick={() => handleDelete(coa.id)}
                        className="ml-auto p-2 rounded-lg bg-red-900/20 text-red-500 hover:bg-red-900/40 transition-colors"
                        title="Delete this COA"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Approval Status and Controls */}
                    {!coa.approved && (
                      <div className="flex items-center gap-2 bg-yellow-900/20 border border-yellow-700/30 rounded px-3 py-2">
                        <span className="text-xs font-semibold text-yellow-400">PENDING APPROVAL</span>
                        <div className="flex gap-2 ml-auto">
                          <button
                            onClick={() => handleApprove(coa.id)}
                            className="p-1.5 rounded bg-green-900/40 text-green-500 hover:bg-green-900/60 transition-colors"
                            title="Approve this COA"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(coa.id)}
                            className="p-1.5 rounded bg-red-900/40 text-red-500 hover:bg-red-900/60 transition-colors"
                            title="Reject this COA"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {coa.approved && (
                      <div className="flex items-center gap-2 bg-green-900/20 border border-green-700/30 rounded px-3 py-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-semibold text-green-400">APPROVED</span>
                      </div>
                    )}
                  </div>
                )}
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

                  {coa.is_from_barn && (
                    <div>
                      <p className="text-xs text-amber-400 uppercase tracking-wider font-semibold">Source</p>
                      <p className="text-sm text-amber-300">From Barn</p>
                    </div>
                  )}

                  {coa.batch_number && (
                    <div>
                      <p className="text-xs text-stone-400 uppercase tracking-wider">Batch Number</p>
                      <p className="text-sm text-stone-300">{coa.batch_number}</p>
                    </div>
                  )}

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
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-barn-brown hover:bg-barn-brown/90 rounded-lg text-amber-50 transition-colors text-sm font-semibold"
                    >
                      View Image
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {coa.coa_link && (
                      <a
                        href={coa.coa_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-barn-brown hover:bg-barn-brown/90 rounded-lg text-amber-50 transition-colors text-sm font-semibold"
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

        {/* Submit COA Button */}
        <div className="mt-12 text-center">
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-barn-brown hover:bg-barn-brown/90 text-amber-50 gap-2"
            size="lg"
          >
            <Upload className="w-5 h-5" />
            Submit COA
          </Button>
        </div>
      </div>

      <UploadCOAModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          setShowUploadModal(false);
          refetch();
        }}
      />
    </div>
  );
}