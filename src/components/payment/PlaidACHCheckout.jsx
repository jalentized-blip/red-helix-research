import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Shield,
  Building,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  User,
} from 'lucide-react';
import ConsentModal from '@/components/financial/ConsentModal';
import TurnstileWidget from '@/components/TurnstileWidget';

const GREEN_MONEY_FUNCTION_URL = 'https://red-helix-research-f58be972.base44.app/functions/greenMoneyCheckout';
const GREEN_PLAID_BASE_URL = 'https://greenbyphone.com/Plaid';
const GREEN_CLIENT_ID = '118636'; // Public — only used for iframe URL construction

export default function PlaidACHCheckout({ order, billingInfo, onSuccess, onError }) {
  // Flow state: idle | creating_customer | plaid_iframe | confirming_bank | ready_to_pay | processing
  const [step, setStep] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Consent
  const [showConsent, setShowConsent] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  // Customer info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [payorId, setPayorId] = useState(null);

  // Bank info (after Plaid connection)
  const [bankInfo, setBankInfo] = useState(null);

  // Payment
  const [processingPayment, setProcessingPayment] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);

  const iframeRef = useRef(null);

  // Pre-populate name from localStorage (if available from checkout form)
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('customerInfo') || 'null');
      if (stored?.firstName) setFirstName(stored.firstName);
      if (stored?.lastName) setLastName(stored.lastName);
    } catch {}
    checkExistingConsent();
  }, []);

  // Check for existing financial consent
  const checkExistingConsent = async () => {
    try {
      const localConsent = localStorage.getItem('plaid_ach_consent');
      if (localConsent === 'true') {
        setConsentGiven(true);
      }
    } catch {}
  };

  // Listen for Green.money Plaid iframe postMessage events
  useEffect(() => {
    if (step !== 'plaid_iframe') return;

    function handleMessage(event) {
      // Only accept messages from greenbyphone.com
      if (event.origin && !event.origin.includes('greenbyphone.com')) return;

      const data = event.data;
      const eventName = typeof data === 'string' ? data : data?.event || data?.type || '';

      if (eventName === 'GreenPlaidOnSuccess' || eventName.includes('Success')) {
        handlePlaidSuccess();
      } else if (eventName === 'GreenPlaidOnExit' || eventName.includes('Exit')) {
        setStep('idle');
        setErrorMessage('Bank connection was cancelled. You can try again.');
      } else if (eventName === 'GreenPlaidOnError' || eventName.includes('Error')) {
        setStep('idle');
        setErrorMessage('Bank connection failed. Please try again.');
        onError?.('Bank connection failed');
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [step, payorId]);

  // Step 1: Create customer on Green.money, then show Plaid iframe
  const handleConnectBank = async () => {
    setErrorMessage(null);

    if (!consentGiven) {
      setShowConsent(true);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Please enter your first and last name.');
      return;
    }

    setLoading(true);
    setStep('creating_customer');

    try {
      const res = await fetch(GREEN_MONEY_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createCustomer',
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: order.customer_email || '',
          address: billingInfo?.address || '',
          city: billingInfo?.city || '',
          state: billingInfo?.state || '',
          zip: billingInfo?.zip || '',
          country: billingInfo?.country || 'US',
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.payorId) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      setPayorId(data.payorId);
      setStep('plaid_iframe');
    } catch (err) {
      setErrorMessage(err.message);
      setStep('idle');
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: After Plaid iframe success, verify bank was connected
  const handlePlaidSuccess = async () => {
    setStep('confirming_bank');
    setErrorMessage(null);

    try {
      const res = await fetch(GREEN_MONEY_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getCustomerInfo',
          payorId,
        }),
      });
      const data = await res.json();

      if (data.bankConnected) {
        setBankInfo(data);
        setStep('ready_to_pay');
      } else {
        throw new Error('Bank account not connected. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.message);
      setStep('idle');
    }
  };

  // Step 3: Execute ACH payment
  const handlePayment = async () => {
    if (!payorId || !turnstileToken) return;

    setProcessingPayment(true);
    setErrorMessage(null);

    try {
      const res = await fetch(GREEN_MONEY_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createDraft',
          payorId,
          amount: order.total_amount,
          orderNumber: order.order_number,
          email: order.customer_email || '',
          turnstileToken,
        }),
      });
      const data = await res.json();

      if (data.success) {
        onSuccess?.({
          payment_id: data.checkId,
          method: 'bank_ach',
          verify_result: data.verifyResult,
        });
      } else {
        throw new Error(data.error || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.message);
      onError?.(err.message);
    } finally {
      setProcessingPayment(false);
      setTurnstileToken(null); // Tokens are single-use
    }
  };

  // Consent callback
  const handleConsentGiven = async () => {
    setConsentGiven(true);
    setShowConsent(false);
    // Don't auto-proceed — let user click the button again
  };

  return (
    <div className="space-y-5 text-left">
      {/* Security Badge */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm text-green-700 font-bold mb-1">
              Secure Bank Payment
            </p>
            <p className="text-xs text-slate-500">
              Bank-level encryption. Your login credentials are never stored. Powered by Plaid's secure infrastructure.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 font-bold">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* ─── STEP: IDLE — Name inputs + Connect button ─── */}
      {(step === 'idle' || step === 'creating_customer') && (
        <>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
              <div className="relative">
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="peer pl-12 bg-slate-50 border-slate-100 rounded-xl px-4 py-5 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#dc2626]/30 transition-all font-bold"
                  disabled={step === 'creating_customer'}
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
              <div className="relative">
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="peer pl-12 bg-slate-50 border-slate-100 rounded-xl px-4 py-5 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#dc2626]/30 transition-all font-bold"
                  disabled={step === 'creating_customer'}
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              </div>
            </div>
          </div>

          <Button
            onClick={handleConnectBank}
            disabled={loading || step === 'creating_customer'}
            className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-widest text-xs py-6 h-auto shadow-lg shadow-red-200"
            size="lg"
          >
            {step === 'creating_customer' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Connect Bank Account
              </>
            )}
          </Button>
        </>
      )}

      {/* ─── STEP: PLAID IFRAME — Green.money hosted Plaid ─── */}
      {step === 'plaid_iframe' && payorId && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-700 font-bold text-center">
              Connect your bank account below. Select your bank and log in securely.
            </p>
          </div>

          <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 bg-white">
            <iframe
              ref={iframeRef}
              src={`${GREEN_PLAID_BASE_URL}?client_id=${GREEN_CLIENT_ID}&customer_id=${payorId}`}
              className="w-full border-0"
              style={{ height: '500px', minHeight: '500px' }}
              title="Connect Your Bank Account"
              allow="same-origin"
            />
          </div>

          <button
            onClick={() => { setStep('idle'); setErrorMessage(null); }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#dc2626] font-bold transition-colors mx-auto"
          >
            <ArrowLeft className="w-3 h-3" /> Cancel
          </button>
        </div>
      )}

      {/* ─── STEP: CONFIRMING BANK ─── */}
      {step === 'confirming_bank' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="w-8 h-8 text-[#dc2626] animate-spin" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Verifying bank connection...</p>
        </div>
      )}

      {/* ─── STEP: READY TO PAY — Bank connected, show payment button ─── */}
      {step === 'ready_to_pay' && bankInfo && (
        <>
          {/* Connected bank display */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {bankInfo.bankName}
                  </p>
                  {bankInfo.accountLast4 && (
                    <p className="text-xs text-slate-500">
                      Account ending in ••••{bankInfo.accountLast4}
                    </p>
                  )}
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>

          {/* Turnstile verification */}
          <div className="flex justify-center">
            <TurnstileWidget
              action="ach-payment"
              theme="light"
              onSuccess={(token) => setTurnstileToken(token)}
              onError={() => setTurnstileToken(null)}
              onExpired={() => setTurnstileToken(null)}
            />
          </div>

          {/* Complete Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={processingPayment || !turnstileToken}
            className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-widest text-xs py-6 h-auto shadow-lg shadow-red-200"
            size="lg"
          >
            {processingPayment ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                Complete Payment — ${order.total_amount?.toFixed(2)}
              </>
            )}
          </Button>

          {/* Switch bank option */}
          <button
            onClick={() => { setStep('idle'); setBankInfo(null); setPayorId(null); setTurnstileToken(null); }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#dc2626] font-bold transition-colors mx-auto"
          >
            <ArrowLeft className="w-3 h-3" /> Use a different bank
          </button>
        </>
      )}

      {/* ─── ORDER SUMMARY (always visible) ─── */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-3">Order Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Order Number</span>
            <span className="text-slate-900 font-bold">{order.order_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Items</span>
            <span className="text-slate-900 font-bold">{order.items?.length || 0}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            <span className="text-slate-900 font-black uppercase text-sm">Total</span>
            <span className="text-xl font-black text-[#dc2626]">
              ${order.total_amount?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── INFO NOTICE ─── */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-slate-500 space-y-1">
            <p>ACH payments typically take 3-5 business days to process</p>
            <p>Your order will ship once payment is confirmed</p>
            <p>You'll receive email notifications on payment status</p>
            <p>All financial data is encrypted and securely processed</p>
          </div>
        </div>
      </div>

      {/* ─── CONSENT MODAL ─── */}
      <ConsentModal
        isOpen={showConsent}
        onClose={() => setShowConsent(false)}
        onConsent={handleConsentGiven}
        consentType="plaid_ach"
      />
    </div>
  );
}