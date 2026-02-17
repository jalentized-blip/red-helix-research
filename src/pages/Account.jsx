import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { LogOut, Package, User, Settings, Home, LayoutDashboard, Heart, TrendingUp, History, Share2, Gift, Copy, Check, CheckCircle2, ExternalLink, Loader2, Mail, Video, Link as LinkIcon, AlertCircle, Award, DollarSign, Coins, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/SEO';
import { getAffiliateByEmail, getTransactionsForAffiliate } from '@/components/utils/affiliateStore';
import DashboardStats from '@/components/account/DashboardStats';
import FavoritePeptides from '@/components/account/FavoritePeptides';
import RecommendedPeptides from '@/components/account/RecommendedPeptides';
import RecentActivity from '@/components/account/RecentActivity';
import QuickCategories from '@/components/account/QuickCategories';
import OrderTrackingDetails from '@/components/account/OrderTrackingDetails';

// ─── REFERRAL LINK SECTION ───
function ReferralSection({ user }) {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Generate a unique referral code from user email
  const referralCode = user?.email
    ? 'REF' + btoa(user.email).replace(/[^A-Za-z0-9]/g, '').substring(0, 8).toUpperCase()
    : '';

  const referralLink = `https://redhelixresearch.com/?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Referral Link Card */}
      <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#dc2626] rounded-2xl flex items-center justify-center shadow-lg shadow-[#dc2626]/20">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Refer a Friend</h2>
            <p className="text-xs text-slate-400 font-medium">Share your link and earn rewards when they buy</p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 mb-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-black text-[#dc2626]">1</span>
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Share Your Link</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Send your unique referral link to friends</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-black text-[#dc2626]">2</span>
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">They Make a Purchase</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Your friend shops using your referral link</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-black text-[#dc2626]">3</span>
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">You Get 10% Off</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">We email you a one-time 10% discount code as a thank you</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Your Referral Link</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2 overflow-hidden">
                <LinkIcon className="w-4 h-4 text-[#dc2626] flex-shrink-0" />
                <span className="text-sm font-bold text-slate-700 truncate">{referralLink}</span>
              </div>
              <Button
                onClick={copyLink}
                className={`rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3 transition-all ${
                  copied
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-[#dc2626] hover:bg-[#b91c1c] text-white shadow-lg shadow-[#dc2626]/20'
                }`}
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Your Referral Code</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 tracking-widest">{referralCode}</span>
              </div>
              <Button
                onClick={copyCode}
                variant="outline"
                className={`rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3 transition-all ${
                  copiedCode
                    ? 'bg-green-50 border-green-300 text-green-600'
                    : 'border-slate-200 text-slate-600 hover:border-[#dc2626] hover:text-[#dc2626]'
                }`}
              >
                {copiedCode ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Quick Share</label>
          <div className="flex flex-wrap gap-3">
            <a
              href={`sms:?body=Check out Red Helix Research for premium research peptides! Use my referral link: ${referralLink}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-100 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition-all"
            >
              <Mail className="w-3.5 h-3.5" /> Text
            </a>
            <a
              href={`mailto:?subject=Check out Red Helix Research&body=Hey! I've been using Red Helix Research for premium research peptides and thought you might be interested. Use my referral link to shop: ${referralLink}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=Check out Red Helix Research for premium research peptides!&url=${encodeURIComponent(referralLink)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> X / Twitter
            </a>
          </div>
        </div>
      </div>

      {/* Referral Info */}
      <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Gift className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">Referral Reward Details</p>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              When someone makes a purchase using your referral link, we'll send a <strong className="text-[#dc2626]">one-time 10% discount code</strong> to your email (<strong>{user?.email}</strong>)
              as a thank you. There's no limit to how many friends you can refer &mdash; each successful referral earns you a new code!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TIKTOK REWARD SECTION ───
function TikTokRewardSection({ user }) {
  const [tiktokLink, setTiktokLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Check if user already submitted
  useEffect(() => {
    const alreadySubmitted = localStorage.getItem(`tiktok_submitted_${user?.email}`);
    if (alreadySubmitted) {
      setSubmitted(true);
    }
  }, [user]);

  const isValidTikTokLink = (url) => {
    return url.includes('tiktok.com') && url.length > 20;
  };

  const handleSubmit = async () => {
    if (!tiktokLink.trim()) {
      setError('Please paste your TikTok video link');
      return;
    }
    if (!isValidTikTokLink(tiktokLink)) {
      setError('Please enter a valid TikTok video URL');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Send the TikTok link to the admin email for review
      await base44.integrations.Core.SendEmail({
        from_name: 'Red Helix Research - TikTok Promotion',
        to: 'jakehboen95@gmail.com',
        subject: 'TikTok Promotion Submission - ' + (user?.full_name || user?.email),
        body: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
          '<h2 style="color: #dc2626;">New TikTok Promotion Submission</h2>' +
          '<div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0;">' +
          '<p><strong>User Name:</strong> ' + (user?.full_name || 'Not provided') + '</p>' +
          '<p><strong>User Email:</strong> ' + user?.email + '</p>' +
          '<p><strong>TikTok Video Link:</strong> <a href="' + tiktokLink + '" style="color: #dc2626;">' + tiktokLink + '</a></p>' +
          '<p><strong>Submitted At:</strong> ' + new Date().toLocaleString() + '</p>' +
          '</div>' +
          '<p style="color: #64748b; font-size: 14px;">This user is requesting a one-time <strong>20% discount code</strong> in exchange for promoting Red Helix Research on their TikTok.</p>' +
          '<p style="color: #64748b; font-size: 14px;">Please review the video and send the discount code to <strong>' + user?.email + '</strong> if approved.</p>' +
          '</div>'
      });

      // Mark as submitted locally
      localStorage.setItem(`tiktok_submitted_${user?.email}`, 'true');
      setSubmitted(true);
      setTiktokLink('');
    } catch (err) {
      console.error('Failed to submit TikTok link:', err);
      setError('Failed to submit. Please try again or contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">TikTok Promotion</h2>
            <p className="text-xs text-slate-400 font-medium">Get 20% off by sharing us on TikTok</p>
          </div>
        </div>

        {submitted ? (
          /* Already submitted state */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-100 rounded-[24px] p-8 text-center"
          >
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-green-800 uppercase tracking-tight mb-2">Submission Received!</h3>
            <p className="text-sm text-green-600 font-medium max-w-md mx-auto">
              Your TikTok video is under review. Once approved, you'll receive your one-time <strong>20% discount code</strong> via email at <strong>{user?.email}</strong>.
            </p>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-4">
              Please allow 24-48 hours for review
            </p>
          </motion.div>
        ) : (
          /* Submission form */
          <>
            {/* Instructions */}
            <div className="bg-white border border-slate-100 rounded-[24px] p-6 mb-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#dc2626]" /> Instructions
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-[#dc2626]">1</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    <strong className="text-slate-900">Create a TikTok video</strong> referring <strong className="text-[#dc2626]">Red Helix Research</strong>.
                    Mention our products, show our website, or share your experience with our research peptides.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-[#dc2626]">2</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    <strong className="text-slate-900">Post the video</strong> on your TikTok account. Make sure it's public so we can view it.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-[#dc2626]">3</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    <strong className="text-slate-900">Copy the video link</strong> from TikTok and paste it in the field below, then hit submit.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    <strong className="text-green-700">Once the video is reviewed</strong>, you will receive your one-time <strong className="text-[#dc2626]">20% off discount code</strong> via email at <strong>{user?.email}</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* TikTok Link Input */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Paste Your TikTok Video Link</label>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Video className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={tiktokLink}
                      onChange={(e) => { setTiktokLink(e.target.value); setError(''); }}
                      placeholder="https://www.tiktok.com/@username/video/..."
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]/20 transition-all"
                    />
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !tiktokLink.trim()}
                    className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-widest text-xs px-8 py-3.5 shadow-lg shadow-[#dc2626]/20 disabled:opacity-50 disabled:shadow-none"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                      </>
                    ) : (
                      'Submit for Review'
                    )}
                  </Button>
                </div>
                {error && (
                  <p className="text-xs text-[#dc2626] font-bold mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {error}
                  </p>
                )}
              </div>
            </div>

            {/* Fine print */}
            <div className="mt-6 p-4 bg-slate-100 rounded-xl">
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                This is a one-time offer per account. The 20% discount code is single-use and will be sent to your registered email after we verify your TikTok video.
                Videos must be genuine and publicly viewable. Red Helix Research reserves the right to deny submissions that don't meet our promotion standards.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── AFFILIATE DASHBOARD SECTION ───
function AffiliateDashboard({ user }) {
  const [affiliate, setAffiliate] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const aff = await getAffiliateByEmail(base44, user?.email);
        if (aff) {
          setAffiliate(aff);
          const txns = await getTransactionsForAffiliate(base44, aff.code);
          setTransactions(txns);
        }
      } catch (err) {
        console.error('Failed to load affiliate data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const affiliateLink = affiliate ? `https://redhelixresearch.com/?affiliate=${affiliate.code}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!affiliate) return null;

  const totalPoints = affiliate.total_points || 0;
  const totalCommission = affiliate.total_commission || 0;
  const totalOrders = affiliate.total_orders || 0;
  const totalRevenue = affiliate.total_revenue || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-[#dc2626] rounded-2xl flex items-center justify-center shadow-lg shadow-[#dc2626]/30">
            <Award className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Affiliate Dashboard</h2>
            <p className="text-sm text-slate-400 font-medium">Welcome, {affiliate.affiliate_name}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl px-5 py-4 flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Code:</span>
          <span className="text-xl font-black text-white tracking-widest">{affiliate.code}</span>
          <span className="ml-auto text-[10px] font-black text-[#dc2626] bg-[#dc2626]/10 px-3 py-1 rounded-full uppercase tracking-widest">
            {affiliate.discount_percent}% off
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Points Earned</span>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{totalPoints.toFixed(2)}</p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Commission</span>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">${totalCommission.toFixed(2)}</p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-blue-500" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Orders</span>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{totalOrders}</p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Revenue</span>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Shareable Link */}
      <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">Your Affiliate Link</h3>
        <p className="text-[10px] text-slate-400 font-medium mb-4">
          Share this link with friends. When they use your code, you earn points and commission on every order.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2 overflow-hidden">
            <LinkIcon className="w-4 h-4 text-[#dc2626] flex-shrink-0" />
            <span className="text-sm font-bold text-slate-700 truncate">{affiliateLink}</span>
          </div>
          <Button
            onClick={copyLink}
            className={`rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3 transition-all ${
              copied
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-[#dc2626] hover:bg-[#b91c1c] text-white shadow-lg shadow-[#dc2626]/20'
            }`}
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* How Points Work */}
      <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Gift className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">How You Earn</p>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              When someone uses your code <strong className="text-[#dc2626]">{affiliate.code}</strong>, they get <strong>{affiliate.discount_percent}% off</strong> their order.
              You earn <strong className="text-green-600">1.5% in reward points</strong> and <strong className="text-green-600">10% commission</strong> on every order placed with your code.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6">Transaction History</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-10">
            <Coins className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No transactions yet</p>
            <p className="text-[10px] text-slate-300 font-medium mt-1">Share your link to start earning</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, idx) => (
              <motion.div
                key={tx.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-black text-slate-900 tracking-tight">Order #{tx.order_number}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {tx.created_date ? new Date(tx.created_date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Order Total</p>
                    <p className="text-sm font-black text-slate-900">${(tx.order_total || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Points</p>
                    <p className="text-sm font-black text-amber-600">+{(tx.points_earned || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-green-500 uppercase tracking-widest">Commission</p>
                    <p className="text-sm font-black text-green-600">+${(tx.commission_amount || 0).toFixed(2)}</p>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                    tx.status === 'paid' ? 'bg-green-100 text-green-600' :
                    tx.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {tx.status || 'pending'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const [isAffiliate, setIsAffiliate] = useState(false);

  useEffect(() => {
    if (user?.email) {
      getAffiliateByEmail(base44, user.email).then(aff => {
        if (aff) setIsAffiliate(true);
      });
    }
  }, [user]);

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.filter({ created_by: user?.email }),
    enabled: !!user
  });

  const { data: preferences, refetch: refetchPreferences } = useQuery({
    queryKey: ['userPreferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreference.filter({ created_by: user?.email });
      if (prefs.length === 0) {
        const newPref = await base44.entities.UserPreference.create({
          favorite_products: [],
          viewed_products: [],
          preferred_categories: [],
          search_history: []
        });
        return newPref;
      }
      return prefs[0];
    },
    enabled: !!user
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          navigate(createPageUrl('Login') + '?returnUrl=' + encodeURIComponent(createPageUrl('Account')));
          return;
        }
        setUser(currentUser);
      } catch (err) {
        // Redirect to our custom login page
        navigate(createPageUrl('Login') + '?returnUrl=' + encodeURIComponent(createPageUrl('Account')));
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleRemoveFavorite = async (productId) => {
    if (!preferences) return;
    const updatedFavorites = preferences.favorite_products.filter(id => id !== productId);
    await base44.entities.UserPreference.update(preferences.id, {
      favorite_products: updatedFavorites
    });
    refetchPreferences();
  };

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Home'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <SEO title="My Account" description="Manage your Red Helix Research account, orders, and preferences." noindex={true} />
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-400 hover:text-[#dc2626] mb-8 transition-colors">
          <Home className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 border border-slate-100 rounded-[32px] p-6 sticky top-24 shadow-sm"
            >
              <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 bg-[#dc2626] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#dc2626]/20">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-slate-900 font-black text-lg tracking-tighter uppercase">{user.full_name || 'User'}</h3>
                <p className="text-slate-500 text-xs mt-1 font-medium">{user.email}</p>
              </div>

              <nav className="space-y-2 mb-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-[#dc2626] text-white shadow-md shadow-[#dc2626]/20'
                      : 'text-slate-500 hover:text-[#dc2626] hover:bg-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
                </button>

                {isAffiliate && (
                  <button
                    onClick={() => setActiveTab('affiliate')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      activeTab === 'affiliate'
                        ? 'bg-[#dc2626] text-white shadow-md shadow-[#dc2626]/20'
                        : 'text-slate-500 hover:text-[#dc2626] hover:bg-white'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Affiliate</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('referrals')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === 'referrals'
                      ? 'bg-[#dc2626] text-white shadow-md shadow-[#dc2626]/20'
                      : 'text-slate-500 hover:text-[#dc2626] hover:bg-white'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Referrals</span>
                </button>

                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === 'rewards'
                      ? 'bg-[#dc2626] text-white shadow-md shadow-[#dc2626]/20'
                      : 'text-slate-500 hover:text-[#dc2626] hover:bg-white'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Rewards</span>
                </button>

                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === 'favorites'
                      ? 'bg-[#dc2626] text-white shadow-md shadow-[#dc2626]/20'
                      : 'text-slate-500 hover:text-[#dc2626] hover:bg-white'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Favorites</span>
                  {preferences?.favorite_products?.length > 0 && (
                    <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${
                      activeTab === 'favorites' ? 'bg-white text-[#dc2626]' : 'bg-[#dc2626] text-white'
                    }`}>
                      {preferences.favorite_products.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === 'recommendations'
                      ? 'bg-[#dc2626] text-white shadow-md shadow-[#dc2626]/20'
                      : 'text-slate-500 hover:text-[#dc2626] hover:bg-white'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Recommended</span>
                </button>

                <button
                  onClick={() => setActiveTab('activity')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === 'activity'
                      ? 'bg-[#dc2626] text-white shadow-md shadow-[#dc2626]/20'
                      : 'text-slate-500 hover:text-[#dc2626] hover:bg-white'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Activity</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === 'orders'
                      ? 'bg-[#dc2626] text-white shadow-md shadow-[#dc2626]/20'
                      : 'text-slate-500 hover:text-[#dc2626] hover:bg-white'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Orders</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === 'settings'
                      ? 'bg-[#dc2626] text-white shadow-md shadow-[#dc2626]/20'
                      : 'text-slate-500 hover:text-[#dc2626] hover:bg-white'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Settings</span>
                </button>
              </nav>

              <div className="space-y-4">
                <Link to={createPageUrl('CustomerInfo') + '?source=account'}>
                  <Button
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 gap-2 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-xs py-6"
                  >
                    <User className="w-4 h-4" />
                    Customer Info
                  </Button>
                </Link>

                <Button
                  onClick={handleLogout}
                  className="w-full bg-slate-900 hover:bg-[#dc2626] text-white gap-2 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-xs py-6"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                    <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Research Dashboard</h2>
                    <DashboardStats preferences={preferences} orders={orders} />
                  </div>

                  {/* Affiliate Quick Card */}
                  {isAffiliate && (
                    <button
                      onClick={() => setActiveTab('affiliate')}
                      className="w-full bg-gradient-to-r from-slate-900 to-slate-800 rounded-[24px] p-6 shadow-lg text-left hover:shadow-xl transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#dc2626] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#dc2626]/30">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Affiliate Dashboard</h3>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Track your points, commission, and share your affiliate link</p>
                    </button>
                  )}

                  {/* Quick Referral & Rewards Cards on Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab('referrals')}
                      className="bg-slate-50 border border-slate-100 rounded-[24px] p-6 shadow-sm text-left hover:border-[#dc2626]/30 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#dc2626] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#dc2626]/20">
                          <Share2 className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Refer a Friend</h3>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Share your link and earn a 10% discount when they buy</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('rewards')}
                      className="bg-slate-50 border border-slate-100 rounded-[24px] p-6 shadow-sm text-left hover:border-[#dc2626]/30 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">TikTok Promotion</h3>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Share us on TikTok and get a one-time 20% discount code</p>
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Quick Access Categories</h2>
                    <QuickCategories preferences={preferences} />
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Recommended For You</h2>
                    <RecommendedPeptides preferences={preferences} orders={orders} />
                  </div>
                </div>
              )}

              {activeTab === 'affiliate' && (
                <AffiliateDashboard user={user} />
              )}

              {activeTab === 'referrals' && (
                <ReferralSection user={user} />
              )}

              {activeTab === 'rewards' && (
                <TikTokRewardSection user={user} />
              )}

              {activeTab === 'favorites' && (
                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tighter uppercase">My Favorite Peptides</h2>
                  <FavoritePeptides preferences={preferences} onRemoveFavorite={handleRemoveFavorite} />
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Recommended For You</h2>
                  <p className="text-slate-500 text-sm mb-6 font-medium">Based on your browsing history and research interests</p>
                  <RecommendedPeptides preferences={preferences} orders={orders} />
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Recent Activity</h2>
                  <RecentActivity preferences={preferences} />
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Order History</h2>

                  {orders.length === 0 ? (
                    <div className="text-center py-16">
                      <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-500 mb-6 text-lg font-medium">No orders yet</p>
                      <Link to={createPageUrl('Home')}>
                        <Button className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-2xl font-black uppercase tracking-widest text-xs px-8 py-6 shadow-lg shadow-[#dc2626]/20">
                          Start Shopping
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order, idx) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white border border-slate-100 rounded-3xl p-6 hover:border-[#dc2626]/30 hover:shadow-lg transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <p className="text-slate-900 font-black text-lg tracking-tighter uppercase">Order #{order.order_number}</p>
                              <p className="text-slate-500 text-xs mt-1 font-medium">
                                Placed {new Date(order.created_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>

                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                              <div className="text-right">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total</p>
                                <p className="text-slate-900 font-black text-xl tracking-tighter">${order.total_amount.toFixed(2)}</p>
                              </div>
                              <div className="h-px w-full md:w-px md:h-8 bg-slate-100"></div>
                              <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                                <p className="text-slate-900 font-bold capitalize">
                                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>
                                    {order.status}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {order.items && order.items.length > 0 && (
                           <div className="mt-4 pt-4 border-t border-slate-100">
                             <p className="text-xs text-slate-500 mb-3 font-medium">
                               {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                             </p>

                             {/* Real-time Tracking Information */}
                             <OrderTrackingDetails order={order} />

                             {/* Resend Confirmation Email */}
                             <button
                               onClick={async () => {
                                 try {
                                   const orderItemsList = order.items.map(item => {
                                     const name = item.product_name || item.productName;
                                     const price = (item.price * item.quantity).toFixed(2);
                                     return '<li>' + name + ' (' + item.specification + ') x' + item.quantity + ' - $' + price + '</li>';
                                   }).join('');

                                   let paymentInfo = '';
                                   if (order.crypto_amount && order.crypto_currency) {
                                     paymentInfo = '<p><strong>Payment:</strong> ' + order.crypto_amount + ' ' + order.crypto_currency + '</p>';
                                   }
                                   if (order.transaction_id) {
                                     paymentInfo += '<p><strong>Transaction ID:</strong> ' + order.transaction_id + '</p>';
                                   }

                                   let trackingInfo = '';
                                   if (order.tracking_number) {
                                     trackingInfo = '<p><strong>Tracking Number:</strong> ' + order.tracking_number + '</p>';
                                     trackingInfo += '<p><strong>Carrier:</strong> ' + (order.carrier || 'N/A') + '</p>';
                                     if (order.estimated_delivery) {
                                       trackingInfo += '<p><strong>Est. Delivery:</strong> ' + new Date(order.estimated_delivery).toLocaleDateString() + '</p>';
                                     }
                                   }

                                   let shippingInfo = '';
                                   if (order.shipping_address) {
                                     const addr = order.shipping_address;
                                     shippingInfo = '<h3>Shipping Address:</h3><p>' + order.customer_name + '<br>' +
                                       (addr.address || addr.shippingAddress) + '<br>' +
                                       (addr.city || addr.shippingCity) + ', ' + (addr.state || addr.shippingState) + ' ' + (addr.zip || addr.shippingZip) + '</p>';
                                   }

                                   const emailBody = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
                                     '<h2 style="color: #8B2635;">Thank You for Your Order!</h2>' +
                                     '<p>Hi ' + (order.customer_name || 'Customer') + ',</p>' +
                                     '<p>We\'ve received your order and it\'s being processed.</p>' +
                                     '<div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">' +
                                       '<h3 style="margin-top: 0;">Order #' + order.order_number + '</h3>' +
                                       paymentInfo +
                                       '<p><strong>Total:</strong> $' + order.total_amount.toFixed(2) + ' USD</p>' +
                                       '<p><strong>Status:</strong> ' + order.status + '</p>' +
                                       trackingInfo +
                                     '</div>' +
                                     '<h3>Order Items:</h3>' +
                                     '<ul>' + orderItemsList + '</ul>' +
                                     shippingInfo +
                                     '<p style="margin-top: 20px;">You will receive tracking information once your order ships.</p>' +
                                     '</div>';

                                   await base44.integrations.Core.SendEmail({
                                     from_name: 'Red Helix Research',
                                     to: order.customer_email,
                                     subject: 'Order Confirmation - ' + order.order_number,
                                     body: emailBody
                                   });
                                   alert('Confirmation email resent!');
                                 } catch (error) {
                                   console.error('Failed to resend email:', error);
                                   alert('Failed to resend email. Please contact support.');
                                 }
                               }}
                               className="text-[10px] font-black uppercase tracking-tighter text-[#dc2626] hover:text-red-500 underline transition-colors"
                             >
                               Resend Confirmation Email
                             </button>
                           </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Account Settings</h2>

                  <div className="space-y-6">
                    <div className="pb-6 border-b border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</p>
                      <p className="text-slate-900 text-lg font-bold">{user.full_name || 'Not set'}</p>
                    </div>

                    <div className="pb-6 border-b border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</p>
                      <p className="text-slate-900 text-lg font-bold">{user.email}</p>
                    </div>

                    <div className="pb-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Account Type</p>
                      <p className="text-slate-900 text-lg font-bold capitalize">{user.role}</p>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-2xl p-4 mt-8">
                      <p className="text-slate-500 text-sm mb-2 font-medium">Need to update your information?</p>
                      <p className="text-slate-400 text-xs font-medium">Contact support at support@redhelixresearch.com</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
