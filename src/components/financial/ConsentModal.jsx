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
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      sections: [
        {
          title: 'What We Collect',
          content: 'By connecting your bank account via Plaid, you authorize us to collect and process your financial account information including account numbers, balances, transaction history, and routing numbers.'
        },
        {
          title: 'How We Use Your Data',
          content: 'Your financial data is used solely to process ACH payments for your research peptide orders. We encrypt all financial data at-rest using AES-256-GCM encryption and in-transit using TLS 1.3.'
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
      const user = await base44.auth.me();

      // Record consent with full audit trail
      const consentRecord = {
        user_email: user.email,
        consent_type: consentType,
        consent_given: true,
        consent_text: JSON.stringify(consent),
        ip_address: 'client-side',
        user_agent: navigator.userAgent
      };

      await base44.entities.FinancialConsent.create(consentRecord);

      onConsent();
    } catch (error) {
      console.error('Consent recording error:', error);
      alert('Failed to record consent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-stone-900 border-stone-700 max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="consent-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white text-xl">
            {consent.icon}
            {consent.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Important Notice */}
          <p id="consent-description" className="sr-only">Financial data consent form for Plaid ACH payment processing</p>
          <div className="p-4 bg-blue-950/30 border border-blue-700/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-300 font-medium mb-1">
                  Required for Payment Processing
                </p>
                <p className="text-xs text-stone-400">
                  Please read and agree to the following terms before connecting your bank account for ACH payments.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Sections */}
          <div className="space-y-4">
            {consent.sections.map((section, idx) => (
              <div key={idx} className="p-4 bg-stone-800/50 border border-stone-700/50 rounded-xl">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  {section.title}
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Encryption Notice */}
          <div className="p-4 bg-green-950/20 border border-green-700/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <p className="text-sm text-green-300 font-medium mb-1">
                  Bank-Level Encryption
                </p>
                <p className="text-xs text-stone-400">
                  All data transmitted between your browser and our servers uses TLS 1.3 encryption. Financial data is encrypted at-rest using AES-256-GCM.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-stone-800/30 border border-stone-700 rounded-xl">
            <Checkbox
              id="consent"
              checked={agreed}
              onCheckedChange={setAgreed}
              className="mt-1"
            />
            <label htmlFor="consent" className="text-sm text-stone-300 cursor-pointer">
              I have read and agree to the financial data collection, processing, and storage terms outlined above. I understand my data will be encrypted and I can withdraw consent at any time.
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Decline
            </Button>
            <Button
              onClick={handleConsent}
              disabled={!agreed || loading}
              className="flex-1"
            >
              <Shield className="w-4 h-4 mr-2" />
              Accept & Continue
            </Button>
          </div>

          {/* Privacy Policy Link */}
          <p className="text-xs text-center text-stone-500">
            Read our full{' '}
            <a href="/Policies" className="text-blue-400 hover:underline">
              Privacy Policy
            </a>
            {' '}and{' '}
            <a href="/PlaidPrivacy" className="text-blue-400 hover:underline">
              Plaid Financial Data Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}