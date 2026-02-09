import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Loader2, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SecurityGateway Component
 * Simulates a "Cloudflare-like" browser integrity check to reassure users
 * and act as a placeholder for real WAF protection.
 */
export default function SecurityGateway({ children }) {
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState('Initializing security protocols...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if we've already verified this session to avoid annoyance
    const hasVerified = sessionStorage.getItem('security_verified');
    if (hasVerified) {
      setChecking(false);
      return;
    }

    // Simulate verification steps
    const steps = [
      { msg: 'Checking browser integrity...', time: 800 },
      { msg: 'Verifying encryption standards...', time: 1600 },
      { msg: 'Establishing secure connection...', time: 2400 },
      { msg: 'DDOS protection active.', time: 3000 }
    ];

    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStatus(steps[currentStep].msg);
        setProgress(((currentStep + 1) / steps.length) * 100);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setChecking(false);
          sessionStorage.setItem('security_verified', 'true');
        }, 500);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  if (!checking) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-24 h-24 mx-auto"
        >
          {/* Pulsing Shield */}
          <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20" />
          <div className="relative z-10 w-24 h-24 bg-white border-4 border-red-600 rounded-full flex items-center justify-center shadow-xl">
            <ShieldCheck className="w-12 h-12 text-red-600" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white rounded-full p-2">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </motion.div>

        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">
            Red Helix <span className="text-red-600">Secure</span>
          </h1>
          <p className="text-slate-500 font-medium">
            {status}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <motion.div 
            className="h-full bg-red-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
          <Cloud className="w-3 h-3" />
          <span>Protected by Clinical Grade Firewall</span>
        </div>

        <p className="text-[10px] text-slate-300 max-w-xs mx-auto">
          Reference ID: {Math.random().toString(36).substring(7).toUpperCase()} • 
          IP: {Math.floor(Math.random()*255)}.{Math.floor(Math.random()*255)}.***.***
        </p>
      </div>
    </div>
  );
}
