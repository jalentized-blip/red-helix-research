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
    <div className="min-h-screen bg-white pt-32 pb-8">
      <SEO 
        title="Gray Market Peptide COA Database - Community Lab Testing Verification"
        description="Comprehensive database of verified peptide COAs from gray market suppliers. Community-uploaded third-party lab testing results for research peptides. Verify peptide purity, potency, and authenticity before purchase."
        keywords="peptide COA, gray market peptide testing, certificate of analysis, peptide lab testing, third party peptide testing, peptide purity verification, research peptide COA, community COA database, underground peptide testing, peptide vendor verification, research chemical COA, peptide source verification"
      />
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors mb-4 font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-4 tracking-tighter uppercase leading-none">Community <span className="text-red-600">COA Reports</span></h1>
          <p className="text-slate-500 text-lg font-medium">Browse Certificates of Analysis uploaded by our community</p>
        </div>

        {/* Search and Admin Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by peptide name or strength..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400 rounded-2xl h-12 font-medium"
            />
          </div>

          <div className="flex gap-3">
            {isAdmin && selectedIds.size > 0 && (
              <>
                <Button
                  onClick={toggleSelectAll}
                  variant="outline"
                  className="border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] px-6"
                >
                  {selectedIds.size === filteredCOAs.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] px-6"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete ({selectedIds.size})
                </Button>
              </>
            )}

            {isAdmin && selectedIds.size === 0 && filteredCOAs.length > 0 && (
              <Button
                onClick={toggleSelectAll}
                variant="outline"
                className="border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] px-6"
              >
                Select All
              </Button>
            )}
            
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-slate-900 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] px-6 shadow-lg shadow-slate-900/10"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload COA
            </Button>
          </div>
        </div>

        {/* COA Grid */}
        {isLoading ? (
          <div className="text-center py-24 text-slate-400 font-medium">Loading database...</div>
        ) : filteredCOAs.length === 0 ? (
          <div className="text-center py-24 text-slate-400 font-medium bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
            {coas.length === 0 ? 'No COAs uploaded yet. Be the first!' : 'No COAs match your search.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCOAs.map((coa, index) => (
              <motion.div
                key={coa.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-slate-50 border rounded-[32px] p-8 transition-all hover:shadow-xl hover:shadow-red-600/5 ${
                  selectedIds.has(coa.id)
                    ? 'border-red-600 bg-red-50/30'
                    : 'border-slate-100 hover:border-red-600/30'
                }`}
              >
                {isAdmin && (
                  <div className="space-y-3 mb-6 pb-6 border-b border-slate-100">
                    {/* Checkbox and Delete */}
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedIds.has(coa.id)}
                        onCheckedChange={() => toggleSelect(coa.id)}
                        className="border-slate-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Controls</span>
                      <button
                        onClick={() => handleDelete(coa.id)}
                        className="ml-auto p-2 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete this COA"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Approval Status and Controls */}
                    {!coa.approved && (
                      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                        <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Pending Approval</span>
                        <div className="flex gap-2 ml-auto">
                          <button
                            onClick={() => handleApprove(coa.id)}
                            className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm shadow-green-600/20"
                            title="Approve this COA"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(coa.id)}
                            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
                            title="Reject this COA"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {coa.approved && (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Approved</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Thumbnail */}
                <div className="mb-6 bg-white rounded-2xl h-56 overflow-hidden border border-slate-100 shadow-inner group">
                  <img
                    src={coa.coa_image_url}
                    alt={`${coa.peptide_name} COA`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">Research Compound</p>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{coa.peptide_name}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Concentration</p>
                      <p className="text-sm font-bold text-slate-900">{coa.peptide_strength}</p>
                    </div>

                    {coa.batch_number && (
                      <div className="bg-white/50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch ID</p>
                        <p className="text-sm font-bold text-slate-900">{coa.batch_number}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-3 border-t border-slate-100">
                    <div className="flex flex-col">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uploaded On</p>
                      <p className="text-sm font-bold text-slate-900">{new Date(coa.created_date).toLocaleDateString()}</p>
                    </div>
                    {coa.uploaded_by && (
                      <div className="flex flex-col text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Researcher</p>
                        <p className="text-sm font-bold text-slate-900">{coa.uploaded_by.split('@')[0]}</p>
                      </div>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex gap-3 pt-2">
                    <a
                      href={coa.coa_image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-900 hover:border-red-600 hover:text-red-600 transition-all rounded-2xl font-black uppercase tracking-widest text-[10px] py-4 shadow-sm"
                    >
                      Full Analysis
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    
                    {coa.coa_link && (
                      <a
                        href={coa.coa_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 transition-all rounded-2xl font-black uppercase tracking-widest text-[10px] py-4 shadow-lg shadow-red-600/20"
                      >
                        Verification
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Submit COA Button */}
        <div className="mt-16 text-center">
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-[#dc2626] hover:bg-[#b91c1c] text-white gap-3 rounded-[32px] font-black uppercase tracking-widest text-xs px-12 py-8 shadow-xl shadow-red-600/20"
          >
            <Upload className="w-5 h-5" />
            Submit New Report
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
