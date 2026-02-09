import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Activity, Lock, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useZeroTrust } from './ZeroTrustProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function SecurityMonitor() {
  const { trustScore, sessionValid, lastVerified, anomalies } = useZeroTrust();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Auto-show if trust score drops below 70
    if (trustScore < 70) {
      setIsVisible(true);
    }
  }, [trustScore]);

  const getTrustLevel = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-500', bg: 'bg-green-500/20', border: 'border-green-500/30' };
    if (score >= 70) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-500/20', border: 'border-blue-500/30' };
    if (score >= 50) return { label: 'Fair', color: 'text-yellow-500', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' };
    return { label: 'Low', color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/30' };
  };

  const trustLevel = getTrustLevel(trustScore);
  const recentAnomalies = anomalies.slice(-3);

  return (
    <>
      {/* Floating Security Badge */}
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border backdrop-blur-sm transition-all ${trustLevel.bg} ${trustLevel.border}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Shield className={`w-6 h-6 ${trustLevel.color}`} />
        {anomalies.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
            {anomalies.length}
          </span>
        )}
      </motion.button>

      {/* Security Dashboard */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-96"
          >
            <Card className="bg-stone-900/95 backdrop-blur-xl border-stone-700/50 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${trustLevel.bg} ${trustLevel.border} border`}>
                    <Shield className={`w-5 h-5 ${trustLevel.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Zero Trust Security</h3>
                    <p className="text-xs text-stone-400">Real-time monitoring active</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Trust Score */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-stone-300">Trust Score</span>
                  <span className={`text-2xl font-bold ${trustLevel.color}`}>{trustScore}</span>
                </div>
                <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${trustLevel.bg} border-r-2 ${trustLevel.border}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${trustScore}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className={`text-xs mt-1 ${trustLevel.color}`}>{trustLevel.label} Security Level</p>
              </div>

              {/* Session Status */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-stone-800/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    {sessionValid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-stone-300">Session Status</span>
                  </div>
                  <span className={`text-xs font-medium ${sessionValid ? 'text-green-500' : 'text-stone-400'}`}>
                    {sessionValid ? 'Valid' : 'Guest Session'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-stone-800/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-stone-300">Last Verified</span>
                  </div>
                  <span className="text-xs text-stone-400">
                    {Math.floor((Date.now() - lastVerified) / 1000)}s ago
                  </span>
                </div>
              </div>

              {/* Recent Anomalies */}
              {recentAnomalies.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-stone-300 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    Recent Anomalies
                  </h4>
                  <div className="space-y-2">
                    {recentAnomalies.map((anomaly, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-stone-800/50 border border-stone-700/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-stone-400">{anomaly.type.replace(/_/g, ' ')}</span>
                          <span className={`text-xs font-medium ${
                            anomaly.severity === 'critical' ? 'text-red-500' :
                            anomaly.severity === 'high' ? 'text-orange-500' :
                            'text-yellow-500'
                          }`}>
                            {anomaly.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Features */}
              <div className="mt-6 pt-6 border-t border-stone-700/50">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Lock className="w-3 h-3 text-green-500" />
                    <span>Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400">
                    <Eye className="w-3 h-3 text-blue-500" />
                    <span>Monitored</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400">
                    <Shield className="w-3 h-3 text-purple-500" />
                    <span>Zero Trust</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400">
                    <Activity className="w-3 h-3 text-red-500" />
                    <span>Real-time</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}