import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AgeVerificationBot({ isOpen, onVerify }) {
  // Bot detection bypass for search engine crawlers
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      const isCrawler = /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|semrush|ahrefs|mj12bot|dotbot|rogerbot|ahrefsbot|screaming frog/i.test(userAgent);
      
      if (isCrawler) {
        localStorage.setItem('ageVerified', 'true');
        onVerify();
      }
    }
  }, [onVerify]);
  const [isBot, setIsBot] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);

  // Check if user is a bot/crawler
  useEffect(() => {
    const checkBot = () => {
      const botPatterns = /bot|crawler|spider|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|slack|skype/i;
      const userAgent = navigator.userAgent;
      const isBotByUA = botPatterns.test(userAgent);
      
      // Check if JavaScript is disabled (bots usually have limited JS support)
      const isJSDisabled = !window.navigator.javaEnabled;
      
      return isBotByUA || isJSDisabled;
    };

    const botDetected = checkBot();
    setIsBot(botDetected);

    // If bot, auto-verify and set cookie
    if (botDetected) {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      document.cookie = `ageVerified=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
      setAgeVerified(true);
      onVerify();
    }
  }, [onVerify]);

  // Check existing cookie
  useEffect(() => {
    const cookies = document.cookie.split(';');
    const verified = cookies.some(cookie => cookie.trim().startsWith('ageVerified=true'));
    if (verified) {
      setAgeVerified(true);
      onVerify();
    }
  }, [onVerify]);

  const handleVerify = (confirmed) => {
    if (confirmed) {
      // Set cookie to expire in 1 year
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      document.cookie = `ageVerified=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
      setAgeVerified(true);
      localStorage.setItem('ageVerified', 'true');
      onVerify();
    }
  };

  if (!isOpen || ageVerified || isBot) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border-2 border-red-600 rounded-[40px] p-10 max-w-md w-full shadow-[0_32px_64px_-16px_rgba(220,38,38,0.2)]"
      >
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Access Control</h2>
        </div>

        <p className="text-slate-600 mb-6 font-medium leading-relaxed">
          Red Helix Research supplies high-purity peptides for <span className="text-red-600 font-bold">LABORATORY AND SCIENTIFIC RESEARCH USE ONLY</span>. 
          These products are strictly not for human consumption.
        </p>

        <p className="text-slate-400 text-sm mb-10 font-bold uppercase tracking-widest">
          Certify that you are 21+ and understand the research nature of these products.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleVerify(true)}
            className="w-full px-8 py-4 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-600/20"
          >
            I Confirm (21+)
          </button>
          <button
            onClick={() => handleVerify(false)}
            className="w-full px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95"
          >
            Exit Site
          </button>
        </div>

        <p className="text-[10px] text-slate-400 mt-6 text-center font-bold uppercase tracking-widest opacity-60">
          Strict Regulatory Compliance Protocol Active
        </p>
      </motion.div>
    </motion.div>
  );
}