import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * SecurityGateway Component
 * Shows a brief loading screen while the app initializes.
 * Does not make false security claims - actual security is handled server-side.
 */
export default function SecurityGateway({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('app_loaded');
    if (hasLoaded) {
      setReady(true);
      return;
    }

    // Brief initialization delay for app hydration
    const timer = setTimeout(() => {
      setReady(true);
      sessionStorage.setItem('app_loaded', 'true');
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (ready) {
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
          <div className="relative z-10 w-24 h-24 bg-white border-4 border-[#dc2626] rounded-full flex items-center justify-center shadow-xl">
            <ShieldCheck className="w-12 h-12 text-[#dc2626]" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white rounded-full p-2">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </motion.div>

        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">
            Red Helix <span className="text-[#dc2626]">Research</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Loading secure environment...
          </p>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-[#dc2626]"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
    </div>
  );
}
