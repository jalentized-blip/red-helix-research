import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Lock, Bitcoin, Zap, CreditCard } from 'lucide-react';

const OWNER_EMAIL = 'jalentized@gmail.com';

// Wallet addresses — same as CryptoCheckout
const WALLETS = [
  { symbol: 'BTC', address: '3BuLwoGXiWx56RD7GsP98Nu6i9G2igYHss', network: 'Bitcoin Network', icon: '₿', color: '#F7931A' },
  { symbol: 'ETH', address: '0x30eD305B89b6207A5fa907575B395c9189728EbC', network: 'Ethereum Mainnet', icon: 'Ξ', color: '#627EEA' },
  { symbol: 'USDT', address: '0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c', network: 'Ethereum (ERC-20)', icon: '₮', color: '#26A17B' },
  { symbol: 'USDC', address: '0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c', network: 'Ethereum (ERC-20)', icon: '$', color: '#2775CA' },
];

const ZELLE_QR = 'https://media.base44.com/images/public/6972f2b59e2787f045b7ae0d/c3e680bfd_image.png';

export default function AdminPaymentAssetsExport() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('exportPaymentAssets', {});
      const json = JSON.stringify(response.data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RHR_PaymentAssets_${new Date().toISOString().slice(0, 10)}.json`;
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
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white font-black text-2xl mb-1">Payment Assets Export</h1>
          <p className="text-slate-400 text-sm">All wallet addresses, QR codes, and Zelle info for migration</p>
        </div>

        {/* Crypto Wallets */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-orange-400">₿</span> Crypto Wallets
          </h2>
          <div className="space-y-4">
            {WALLETS.map((w) => (
              <div key={w.symbol} className="bg-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl font-black" style={{ color: w.color }}>{w.icon}</span>
                  <div>
                    <p className="text-white font-black text-sm">{w.symbol}</p>
                    <p className="text-slate-400 text-xs">{w.network}</p>
                  </div>
                  {/* Live QR */}
                  <div className="ml-auto">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${w.symbol === 'BTC' ? 'bitcoin' : 'ethereum'}:${w.address}`}
                      alt={`${w.symbol} QR`}
                      className="w-16 h-16 rounded-lg bg-white p-1"
                    />
                  </div>
                </div>
                <code className="text-xs text-slate-300 break-all font-mono bg-slate-900/50 block px-3 py-2 rounded-lg">
                  {w.address}
                </code>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${w.symbol === 'BTC' ? 'bitcoin' : 'ethereum'}:${w.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  ↗ Download full-size QR (300×300)
                </a>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-4 bg-slate-800/50 rounded-lg p-3">
            ⚠️ These addresses are hardcoded in <code>pages/CryptoCheckout.jsx</code> (PAYMENT_ADDRESSES) and <code>functions/verifyCryptoTransaction.js</code>. Update BOTH files if you change addresses.
          </p>
        </div>

        {/* Zelle */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="text-purple-400 font-black text-lg">Z</span> Zelle
          </h2>
          <div className="flex gap-6 items-start">
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">Recipient Email</p>
                <p className="text-white font-bold text-sm">jake@redhelixresearch.com</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">Contact Name to Use</p>
                <p className="text-white font-bold text-sm">RHR-Jake, Jake, or RHR</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">Memo Field</p>
                <p className="text-white font-bold text-sm">RHR only</p>
              </div>
            </div>
            <div className="flex-shrink-0 text-center">
              <img
                src={ZELLE_QR}
                alt="Zelle QR Code"
                className="w-28 h-28 object-contain bg-white rounded-xl p-1"
              />
              <a
                href={ZELLE_QR}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-[10px] text-slate-500 hover:text-slate-300 block transition-colors"
              >
                ↗ Download Zelle QR
              </a>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-4 bg-slate-800/50 rounded-lg p-3">
            QR image is hosted on Base44 storage. Download the image above and re-upload to your new platform, then update the img src in <code>pages/CryptoCheckout.jsx</code> (search for <code>media.base44.com</code>).
          </p>
        </div>

        {/* Square */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-red-400" /> Square (Card Payments)
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Processing Fee</span><span className="text-white font-bold">+10% on card orders</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Support Email</span><span className="text-white font-bold">jake@redhelixresearch.com</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Redirect After Pay</span><span className="text-white font-bold text-xs">/PaymentCompleted?order=...</span></div>
          </div>
          <div className="mt-3 bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400 space-y-1">
            <p>Secrets needed: SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_WEBHOOK_SIGNATURE_KEY</p>
            <p>Register webhook at: <a href="https://developer.squareup.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">developer.squareup.com</a></p>
          </div>
        </div>

        {/* Download button */}
        {error && <div className="bg-red-950/40 border border-red-700 rounded-xl p-3 text-red-300 text-sm">{error}</div>}
        {downloaded && <div className="bg-green-950/40 border border-green-700 rounded-xl p-3 text-green-300 text-sm font-semibold">✅ Downloaded. Delete functions/exportPaymentAssets.js and this page when done.</div>}

        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black text-base h-12"
        >
          {downloading
            ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" /> Generating...</span>
            : <span className="flex items-center gap-2"><Download className="w-5 h-5" /> Download Payment Assets JSON</span>
          }
        </Button>

        <p className="text-center text-slate-600 text-xs">
          After downloading: delete <code>functions/exportPaymentAssets.js</code> and <code>pages/AdminPaymentAssetsExport.jsx</code>
        </p>
      </div>
    </div>
  );
}