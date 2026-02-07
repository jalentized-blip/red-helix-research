import React, { createContext, useContext, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Lock, Mail } from 'lucide-react';

const MFAContext = createContext(null);

export function MFAProvider({ children }) {
  const [showMFAChallenge, setShowMFAChallenge] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requireMFA = useCallback(async (action, callback) => {
    // Check if user has admin role
    try {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      // For critical financial operations, require MFA
      if (action.includes('payment') || action.includes('financial') || action.includes('order')) {
        setPendingAction({ action, callback });
        setShowMFAChallenge(true);
        
        // Send MFA code via email
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: 'Multi-Factor Authentication Code',
          body: `Your MFA code for ${action}: ${generateMFACode()}\n\nThis code will expire in 5 minutes.`
        });
      } else {
        // Non-financial actions don't require MFA
        callback();
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const generateMFACode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('mfa_code', code);
    sessionStorage.setItem('mfa_expires', Date.now() + 300000); // 5 minutes
    return code;
  };

  const verifyMFACode = async () => {
    setLoading(true);
    setError('');

    try {
      const storedCode = sessionStorage.getItem('mfa_code');
      const expires = parseInt(sessionStorage.getItem('mfa_expires'));

      if (!storedCode || Date.now() > expires) {
        throw new Error('MFA code expired. Please request a new one.');
      }

      if (mfaCode !== storedCode) {
        throw new Error('Invalid MFA code');
      }

      // Code verified - execute pending action
      if (pendingAction?.callback) {
        await pendingAction.callback();
      }

      // Clear MFA session
      sessionStorage.removeItem('mfa_code');
      sessionStorage.removeItem('mfa_expires');
      setShowMFAChallenge(false);
      setMfaCode('');
      setPendingAction(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MFAContext.Provider value={{ requireMFA }}>
      {children}

      <Dialog open={showMFAChallenge} onOpenChange={setShowMFAChallenge}>
        <DialogContent className="bg-stone-900 border-stone-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              <Shield className="w-6 h-6 text-red-600" />
              Multi-Factor Authentication Required
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-blue-950/30 border border-blue-700/30 rounded-xl">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-300 font-medium mb-1">
                    Verification Code Sent
                  </p>
                  <p className="text-xs text-stone-400">
                    A 6-digit code has been sent to your registered email address. Enter it below to proceed.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Enter 6-Digit Code
              </label>
              <Input
                type="text"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="bg-stone-800 border-stone-700 text-white text-center text-2xl tracking-widest"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-950/30 border border-red-700/30 rounded-lg text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMFAChallenge(false);
                  setMfaCode('');
                  setError('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={verifyMFACode}
                disabled={mfaCode.length !== 6 || loading}
                className="flex-1"
              >
                <Lock className="w-4 h-4 mr-2" />
                Verify & Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MFAContext.Provider>
  );
}

export function useMFA() {
  const context = useContext(MFAContext);
  if (!context) {
    throw new Error('useMFA must be used within MFAProvider');
  }
  return context;
}