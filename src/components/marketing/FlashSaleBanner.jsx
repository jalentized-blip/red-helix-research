import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

const DEFAULT_DEALS = [
  { label: "Today Only", headline: "Free shipping on any order over $100", cta: "Shop Now", link: "Products" },
  { label: "Limited Time", headline: "10-vial kit: best value per mg in the market", cta: "See Kits", link: "KitInfo" },
  { label: "Hot Right Now", headline: "BPC-157 — our #1 seller is back in stock", cta: "Order Now", link: "Products" },
  { label: "Research Bundle", headline: "Stack Semaglutide + TB-500 for recovery + weight research", cta: "Learn More", link: "PeptideComparison" },
  { label: "Reward Points", headline: "Earn points on every order — redeem for future discounts", cta: "View Account", link: "Account" },
];

const SHOW_DURATION = 8000;
const STORAGE_KEY = 'rhr_flash_banner_dismissed';

export default function FlashSaleBanner() {
  const [deals, setDeals] = useState(DEFAULT_DEALS);
  const [dealIndex, setDealIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  // Load DB messages (active only), fall back to defaults
  useEffect(() => {
    base44.entities.BannerMessage.list('sort_order', 50).then(rows => {
      const active = rows.filter(r => r.is_active);
      if (active.length > 0) setDeals(active);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(STORAGE_KEY);
    if (wasDismissed) return;

    const showTimer = setTimeout(() => setVisible(true), 6000);
    const rotateTimer = setInterval(() => {
      setDealIndex(i => (i + 1) % deals.length);
    }, SHOW_DURATION + 2000);

    return () => {
      clearTimeout(showTimer);
      clearInterval(rotateTimer);
    };
  }, [deals.length]);

  // Mirror the header's scroll hide/show behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setHeaderVisible(currentY < 50 || currentY < lastScrollY.current);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide when header menu (hamburger/sheet) is open
  useEffect(() => {
    const handleMenuOpen = () => setMenuOpen(true);
    const handleMenuClose = () => setMenuOpen(false);
    window.addEventListener('headerMenuOpen', handleMenuOpen);
    window.addEventListener('headerMenuClose', handleMenuClose);
    return () => {
      window.removeEventListener('headerMenuOpen', handleMenuOpen);
      window.removeEventListener('headerMenuClose', handleMenuClose);
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, '1');
  };

  if (dismissed) return null;

  const deal = deals[dealIndex] || deals[0];

  return (
    <AnimatePresence>
      {visible && (
        <div
          style={{
            position: 'fixed',
            top: (headerVisible && !menuOpen) ? '88px' : '-60px',
            left: 0,
            right: 0,
            zIndex: 65,
            transition: 'top 300ms ease',
          }}
          className="bg-gradient-to-r from-[#8B2635] via-[#7a2030] to-[#6B1827] shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={dealIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 min-w-0"
                >
                  <span className="flex-shrink-0 inline-flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5">
                    <Zap className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{deal.label}</span>
                  </span>
                  <span className="text-white text-sm font-bold truncate">{deal.headline}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Link to={createPageUrl(deal.link)}>
                <button className="flex items-center gap-1 bg-white text-[#8B2635] text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  {deal.cta} <ChevronRight className="w-3 h-3" />
                </button>
              </Link>
              <button
                onClick={dismiss}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}