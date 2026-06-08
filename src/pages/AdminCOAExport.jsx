import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Lock, ExternalLink, FileText, Image } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const OWNER_EMAIL = 'jalentized@gmail.com';

export default function AdminCOAExport() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const { data: userCOAs = [] } = useQuery({
    queryKey: ['userCOAs-export'],
    queryFn: () => base44.entities.UserCOA.list('-created_date'),
    enabled: !!user && user.email === OWNER_EMAIL,
  });

  const { data: adminCOAs = [] } = useQuery({
    queryKey: ['adminCOAs-export'],
    queryFn: () => base44.entities.COA.list('-created_date'),
    enabled: !!user && user.email === OWNER_EMAIL,
  });

  const allImageUrls = [
    ...userCOAs.filter(c => c.coa_image_url).map(c => ({ name: `${c.peptide_name} ${c.peptide_strength}`, url: c.coa_image_url, type: 'UserCOA' })),
    ...adminCOAs.filter(c => c.image_url).map(c => ({ name: c.product_name, url: c.image_url, type: 'COA' })),
  ];

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('exportCOAData', {});
      const json = JSON.stringify(response.data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RHR_COAExport_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
    } catch (err) {
      setError(err.message || 'Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!user || user.email !== OWNER_EMAIL) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-white text-xl font-bold">Access Denied</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white font-black text-2xl mb-1">COA Data Export</h1>
          <p className="text-slate-400 text-sm">All certificates of analysis + image URLs + migration instructions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Community COAs', value: userCOAs.length, sub: `${userCOAs.filter(c => c.approved).length} approved` },
            { label: 'Admin COAs', value: adminCOAs.length, sub: 'official product COAs' },
            { label: 'Total Images', value: allImageUrls.length, sub: 'files to download' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-slate-300 text-xs font-bold mt-1">{label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div className="bg-amber-950/40 border border-amber-700/50 rounded-xl p-4 text-amber-200 text-sm space-y-1">
          <p className="font-bold text-amber-300">⚠️ Important: Download images BEFORE migrating</p>
          <p>All COA images are hosted on Base44 storage. The URLs will stop working once you leave Base44. Download each file first and re-upload to your new platform.</p>
        </div>

        {/* Image URL List */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-4">All COA Files ({allImageUrls.length})</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {allImageUrls.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-800 rounded-lg px-3 py-2">
                {item.url.toLowerCase().includes('.pdf') ? (
                  <FileText className="w-4 h-4 text-red-400 flex-shrink-0" />
                ) : (
                  <Image className="w-4 h-4 text-blue-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold truncate">{item.name}</p>
                  <p className="text-slate-500 text-[10px] truncate">{item.url}</p>
                </div>
                <span className="text-[9px] text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded font-bold flex-shrink-0">{item.type}</span>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors flex-shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
            {allImageUrls.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">Loading...</p>
            )}
          </div>
        </div>

        {/* What's included */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-3">What's in the JSON</h2>
          <ul className="space-y-1.5 text-slate-400 text-sm">
            <li>✓ All {userCOAs.length} UserCOA records (community COAs) with full metadata</li>
            <li>✓ All {adminCOAs.length} admin COA records (official product COAs)</li>
            <li>✓ Flat list of all image URLs for bulk downloading</li>
            <li>✓ Python download script for batch-downloading all images</li>
            <li>✓ Entity schemas for recreating on new platform</li>
            <li>✓ Step-by-step migration instructions</li>
            <li>✓ Code reference (which files handle COA upload/display/edit)</li>
            <li>✓ AI verification flow documentation</li>
          </ul>
        </div>

        {error && <div className="bg-red-950/40 border border-red-700 rounded-xl p-3 text-red-300 text-sm">{error}</div>}
        {downloaded && (
          <div className="bg-green-950/40 border border-green-700 rounded-xl p-3 text-green-300 text-sm font-semibold">
            ✅ Downloaded. Now download all the individual image files, then delete this page and its backend function.
          </div>
        )}

        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black text-base h-12"
        >
          {downloading
            ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" /> Generating...</span>
            : <span className="flex items-center gap-2"><Download className="w-5 h-5" /> Download COA Export JSON</span>
          }
        </Button>

        <p className="text-center text-slate-600 text-xs">
          After downloading: delete <code>functions/exportCOAData.js</code> and <code>pages/AdminCOAExport.jsx</code>
        </p>
      </div>
    </div>
  );
}