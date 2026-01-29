import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AgeVerificationBot({ isOpen, onVerify }) {
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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-stone-900 border-2 border-red-600 rounded-lg p-8 max-w-md w-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-bold text-amber-50">Age Verification</h2>
        </div>

        <p className="text-stone-300 mb-6">
          Red Helix Research supplies research-grade peptides for <span className="font-semibold">research and educational purposes only</span>. 
          These products are not for human consumption.
        </p>

        <p className="text-stone-400 text-sm mb-8">
          By clicking "I Confirm", you certify that you are 18+ years old and understand these products are for research use only.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => handleVerify(false)}
            className="flex-1 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-amber-50 rounded-lg font-semibold transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => handleVerify(true)}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-amber-50 rounded-lg font-semibold transition-colors"
          >
            I Confirm
          </button>
        </div>

        <p className="text-xs text-stone-500 mt-4 text-center">
          This verification is required by law. Your choice will be remembered for 1 year.
        </p>
      </motion.div>
    </motion.div>
  );
}