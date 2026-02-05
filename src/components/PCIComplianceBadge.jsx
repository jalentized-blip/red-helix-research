import React from 'react';
import { Shield, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PCIComplianceBadge({ variant = 'full' }) {
  if (variant === 'minimal') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-900/20 border border-green-700/50 rounded-lg">
        <Shield className="w-3 h-3 text-green-500" />
        <span className="text-xs font-semibold text-green-400">PCI Compliant</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-700/50 rounded-lg">
        <div className="flex items-center justify-center w-10 h-10 bg-green-600/20 rounded-full">
          <Shield className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-green-400">PCI-DSS Compliant</p>
          <p className="text-xs text-green-500/70">Secure Payment Processing</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-900/30 via-green-800/20 to-stone-900/30 border border-green-700/50 rounded-xl p-6"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="flex items-center justify-center w-12 h-12 bg-green-600/20 rounded-full flex-shrink-0">
          <Shield className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-green-400 mb-1">PCI-DSS Compliant</h3>
          <p className="text-xs text-green-500/80">Payment Card Industry Data Security Standard</p>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-stone-300">
            <span className="font-semibold text-green-400">Zero Card Data Storage:</span> We never store credit card information on our servers
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Lock className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-stone-300">
            <span className="font-semibold text-green-400">Blockchain Security:</span> Cryptocurrency payments eliminate card data exposure
          </p>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-stone-300">
            <span className="font-semibold text-green-400">Encrypted Transmission:</span> All data encrypted with industry-standard SSL/TLS
          </p>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-stone-300">
            <span className="font-semibold text-green-400">Regular Audits:</span> Continuous security monitoring and compliance verification
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-green-700/30">
        <p className="text-xs text-center text-green-500/60">
          Your payment information is always secure and protected
        </p>
      </div>
    </motion.div>
  );
}