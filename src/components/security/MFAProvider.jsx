import React, { createContext, useContext, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Lock, Mail, Fingerprint, Key } from 'lucide-react';

const MFAContext = createContext(null);

export function MFAProvider({ children }) {
  const [showMFAChallenge, setShowMFAChallenge] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [challengeType, setChallengeType] = useState('');
  const [mfaMethod, setMfaMethod] = useState('otp'); // 'otp' or 'webauthn'
  const [isPhishingResistant, setIsPhishingResistant] = useState(false);

  const requireMFA = useCallback(async (action, callback, phishingResistant = false) => {
    try {
      const user = await base44.auth.me();
      if (!user) {
        throw new Error('User not authenticated');
      }

      setChallengeType(action);
      setPendingAction({ action, callback });
      setIsPhishingResistant(phishingResistant);

      // Determine MFA method based on requirements and browser capability
      const useWebAuthn = phishingResistant && window.PublicKeyCredential;
      setMfaMethod(useWebAuthn ? 'webauthn' : 'otp');

      if (!useWebAuthn) {
        // Send MFA code via email for OTP method
        const code = generateMFACode();
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: 'Multi-Factor Authentication Code',
          body: `Your MFA verification code: ${code}\n\nAction: ${action}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this, please contact support immediately.`
        });
      }

      setShowMFAChallenge(true);
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

  const verifyWebAuthn = async () => {
    try {
      // Create a challenge (in production, this should come from your server)
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Request WebAuthn credential
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          rpId: window.location.hostname,
          userVerification: 'required',
          timeout: 60000
        }
      });

      if (credential) {
        // In production, verify the credential with your server
        if (pendingAction?.callback) {
          await pendingAction.callback();
        }
        setShowMFAChallenge(false);
        setMfaCode('');
        setPendingAction(null);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      throw new Error('WebAuthn verification failed: ' + err.message);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');

    try {
      if (mfaMethod === 'webauthn') {
        await verifyWebAuthn();
      } else {
        await verifyMFACode();
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const getChallengeDescription = () => {
    switch (challengeType) {
      case 'payment_processing':
        return 'Please verify your identity before processing this payment.';
      case 'admin_access':
        return 'Administrator verification required to access financial data.';
      case 'plaid_link':
        return 'Verify your identity before connecting your bank account.';
      default:
        return 'Please verify your identity to continue.';
    }
  };

  return (
    <MFAContext.Provider value={{ requireMFA }}>
      {children}

      <Dialog open={showMFAChallenge} onOpenChange={setShowMFAChallenge}>
        <DialogContent className="bg-stone-900 border-stone-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white text-xl">
              {mfaMethod === 'webauthn' ? (
                <Fingerprint className="w-6 h-6 text-green-500" />
              ) : (
                <Shield className="w-6 h-6 text-blue-500" />
              )}
              {mfaMethod === 'webauthn' ? 'Phishing-Resistant Authentication' : 'Multi-Factor Authentication'}
            </DialogTitle>
            <DialogDescription className="text-stone-400 mt-2">
              {getChallengeDescription()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {mfaMethod === 'webauthn' ? (
              <>
                {/* WebAuthn Phishing-Resistant UI */}
                <div className="p-4 bg-green-950/30 border border-green-700/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Key className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-300 mb-1">
                        Phishing-Resistant Authentication
                      </p>
                      <p className="text-xs text-stone-400">
                        Use your security key, fingerprint, or face recognition to authenticate. 
                        This method is cryptographically bound to this domain and cannot be phished.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center py-8">
                  <Fingerprint className="w-20 h-20 text-green-500 mx-auto mb-4 animate-pulse" />
                  <p className="text-stone-300 font-medium text-lg mb-2">
                    Touch your security key or biometric sensor
                  </p>
                  <p className="text-sm text-stone-500">
                    Follow your browser's prompt to authenticate
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-950/30 border border-red-700/30 rounded-lg text-sm text-red-300">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowMFAChallenge(false);
                      setError('');
                      setPendingAction(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleVerify}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Authenticating...' : 'Authenticate'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* OTP Email-Based UI */}
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
                    autoFocus
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
                      setPendingAction(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleVerify}
                    disabled={mfaCode.length !== 6 || loading}
                    className="flex-1"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Verify & Continue
                  </Button>
                </div>
              </>
            )}
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