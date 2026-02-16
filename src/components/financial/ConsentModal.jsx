import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { Shield, Lock, AlertCircle, FileText } from 'lucide-react';

export default function ConsentModal({ isOpen, onClose, onConsent, consentType = 'plaid_ach' }) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const consentTexts = {
    plaid_ach: {
      title: 'Financial Data Collection & Processing Consent',
      icon: <Shield className="w-6 h-6 text-[#dc2626]" />,
      sections: [
        {
          title: 'What We Collect',
          content: 'By connecting your bank account via Plaid, you authorize us to collect and process your financial account information including account numbers, balances, transaction history, and routing numbers.'
        },
        {
          title: 'How We Use Your Data',
          content: 'Your financial data is used solely to process ACH payments for your orders. We encrypt all financial data at-rest using AES-256-GCM encryption and in-transit using TLS 1.3.'
        },
        {
          title: 'Data Storage & Security',
          content: 'All financial data received from Plaid is encrypted at-rest and stored securely. We implement zero-trust architecture, multi-factor authentication for admin access, and continuous security monitoring.'
        },
        {
          title: 'Third-Party Sharing',
          content: 'We only share your financial data with Plaid (our payment processor) and do not sell or share your data with any other third parties without your explicit consent.'
        },
        {
          title: 'Your Rights',
          content: 'You have the right to withdraw consent at any time, request data deletion, or export your data. Upon withdrawal, we will delete your financial data within 30 days as per our data retention policy.'
        },
        {
          title: 'Data Retention',
          content: 'We retain financial transaction records for 7 years as required by law. Plaid account credentials and access tokens are deleted within 90 days of disconnection or upon your request.'
        }
      ]
    }
  };

  const consent = consentTexts[consentType];

  const handleConsent = async () => {
    if (!agreed) return;

    setLoading(true);
    try {
      // Always store consent in localStorage as primary fallback
      localStorage.setItem('plaid_ach_consent', 'true');
      localStorage.setItem('plaid_ach_consent_date', new Date().toISOString());

      // Try to record in DB if entity exists
      try {
        const user = await base44.auth.me();
        if (base44.entities.FinancialConsent) {
          await base44.entities.FinancialConsent.create({
            user_email: user.email,
            consent_type: consentType,
            consent_given: true,
            consent_text: JSON.stringify(consent),
            ip_address: 'client-side',
            user_agent: navigator.userAgent
          });
        }
      } catch (dbError) {
        // DB entity may not exist — localStorage is our fallback
        console.warn('Could not record consent in DB (non-blocking):', dbError.message);
      }

      onConsent();
    } catch (error) {
      console.error('Consent error:', error);
      // Still proceed since localStorage was set
      onConsent();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border border-slate-200 max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl" aria-describedby="consent-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-slate-900 text-xl font-black uppercase tracking-tight">
            {consent.icon}
            {consent.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Important Notice */}
          <p id="consent-description" className="sr-only">Financial data consent form for Plaid ACH payment processing</p>
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-700 font-bold mb-1">
                  Required for Payment Processing
                </p>
                <p className="text-xs text-slate-500">
                  Please read and agree to the following terms before connecting your bank account for ACH payments.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Sections */}
          <div className="space-y-3">
            {consent.sections.map((section, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <h4 className="text-sm font-black text-slate-900 mb-1.5 flex items-center gap-2 uppercase tracking-tight">
                  <FileText className="w-4 h-4 text-[#dc2626]" />
                  {section.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Encryption Notice */}
          <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-green-700 font-bold mb-1">
                  Bank-Level Encryption
                </p>
                <p className="text-xs text-slate-500">
                  All data transmitted between your browser and our servers uses TLS 1.3 encryption. Financial data is encrypted at-rest using AES-256-GCM.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <Checkbox
              id="consent"
              checked={agreed}
              onCheckedChange={setAgreed}
              className="mt-1"
            />
            <label htmlFor="consent" className="text-sm text-slate-700 cursor-pointer">
              I have read and agree to the financial data collection, processing, and storage terms outlined above. I understand my data will be encrypted and I can withdraw consent at any time.
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold uppercase tracking-wider text-xs py-5 h-auto"
            >
              Decline
            </Button>
            <Button
              onClick={handleConsent}
              disabled={!agreed || loading}
              className="flex-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-black uppercase tracking-widest text-xs py-5 h-auto shadow-lg shadow-red-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              <Shield className="w-4 h-4 mr-2" />
              Accept & Continue
            </Button>
          </div>

          {/* Privacy Policy Link */}
          <p className="text-xs text-center text-slate-400">
            Read our full{' '}
            <a href="/Policies" className="text-[#dc2626] font-bold hover:underline">
              Privacy Policy
            </a>
            {' '}and{' '}
            <a href="/PlaidPrivacy" className="text-[#dc2626] font-bold hover:underline">
              Plaid Financial Data Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
