import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, FlaskConical } from 'lucide-react';

export default function ResearchDisclaimerGate({ children }) {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showGate, setShowGate] = useState(true);

  useEffect(() => {
    const agreed = localStorage.getItem('research_disclaimer_agreed');
    if (agreed === 'true') {
      setHasAgreed(true);
      setShowGate(false);
    }
  }, []);

  const handleAgree = () => {
    if (!agreedToTerms) return;
    localStorage.setItem('research_disclaimer_agreed', 'true');
    setHasAgreed(true);
    setShowGate(false);
  };

  if (hasAgreed) {
    return children;
  }

  return (
    <>
      <AnimatePresence>
        {showGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-[#dc2626] to-red-700 p-4 md:p-8 text-center flex-shrink-0">
                <FlaskConical className="w-12 h-12 md:w-16 md:h-16 text-white mx-auto mb-2 md:mb-4" />
                <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight">
                  Research Use Only
                </h2>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-[#dc2626] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-black text-slate-900 mb-3 uppercase">Important Disclaimer</h3>
                      <div className="text-slate-700 space-y-3 text-sm leading-relaxed">
                        <p>
                          All products sold on this website are <strong>strictly for laboratory and research purposes only</strong>.
                        </p>
                        <p>
                          These products are <strong>NOT intended for human consumption, self-administration, or any clinical use</strong>. 
                          They are designed exclusively for qualified researchers conducting scientific studies in controlled laboratory environments.
                        </p>
                        <p>
                          By proceeding, you acknowledge that you understand these restrictions and agree to use all purchased products solely for legitimate research purposes in compliance with applicable laws and regulations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkbox Agreement */}
                <div 
                  className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer active:bg-slate-100 transition-colors"
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                >
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={setAgreedToTerms}
                    className="mt-1 flex-shrink-0"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-slate-700 font-medium leading-relaxed cursor-pointer flex-1"
                  >
                    I confirm that I am purchasing these products exclusively for <strong>research and laboratory use only</strong>, 
                    and I will not use them for human consumption or any clinical purposes. I understand and accept all terms and restrictions.
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleAgree}
                    disabled={!agreedToTerms}
                    className="flex-1 bg-[#dc2626] hover:bg-red-700 text-white py-6 rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    I Agree - Proceed to Site
                  </Button>
                </div>

                <p className="text-xs text-slate-400 text-center">
                  By clicking "I Agree", you acknowledge that you have read and understood the research use disclaimer.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {!showGate && children}
    </>
  );
}