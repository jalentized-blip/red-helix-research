import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Database, FileText, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function PlaidPrivacy() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: 'Financial Data We Collect via Plaid',
      content: [
        'When you connect your bank account through Plaid, we collect the following information:',
        '• Bank account numbers and routing numbers',
        '• Account holder name and address',
        '• Account balance information',
        '• Transaction history (for verification purposes only)',
        '• Account type (checking, savings)',
        '',
        'This data is collected solely for the purpose of processing ACH payments for your research peptide orders.'
      ]
    },
    {
      icon: <Lock className="w-6 h-6 text-green-600" />,
      title: 'How We Protect Your Financial Data',
      content: [
        'Security Measures:',
        '• All data transmitted uses TLS 1.3 encryption (bank-level security)',
        '• Financial data encrypted at-rest with AES-256-GCM encryption',
        '• Multi-factor authentication (MFA) required for admin access to financial systems',
        '• Zero-trust architecture with continuous session validation',
        '• Real-time security monitoring and anomaly detection',
        '• Annual third-party security audits',
        '• PCI DSS compliant payment infrastructure',
        '',
        'We never store your Plaid login credentials. Plaid handles authentication securely through their platform.'
      ]
    },
    {
      icon: <Database className="w-6 h-6 text-purple-600" />,
      title: 'How We Use Your Financial Data',
      content: [
        'Your financial data is used exclusively for:',
        '• Processing ACH payment transactions',
        '• Verifying bank account ownership',
        '• Reconciling payments and refunds',
        '• Complying with financial regulations and tax requirements',
        '• Fraud prevention and security monitoring',
        '',
        'We do NOT:',
        '• Sell your financial data to third parties',
        '• Use your transaction history for marketing',
        '• Share your data except as required by law or with your explicit consent'
      ]
    },
    {
      icon: <FileText className="w-6 h-6 text-amber-600" />,
      title: 'Third-Party Data Sharing',
      content: [
        'Plaid, Inc.:',
        '• Acts as our payment processor and facilitates secure bank connections',
        '• Has their own privacy policy governing data use',
        '• Complies with financial regulations including GLBA and state privacy laws',
        '• View Plaid\'s privacy policy at: https://plaid.com/legal/',
        '',
        'We may share your financial data with:',
        '• Law enforcement if required by subpoena or legal process',
        '• Financial institutions for payment processing and fraud prevention',
        '• Our auditors and legal counsel (under confidentiality agreements)',
        '',
        'We will never sell your financial data or use it for purposes beyond payment processing.'
      ]
    },
    {
      icon: <Trash2 className="w-6 h-6 text-red-600" />,
      title: 'Data Retention & Deletion Policy',
      content: [
        'Retention Periods:',
        '• Payment transaction records: 7 years (required by tax law)',
        '• Plaid access tokens: 90 days after disconnection or until deletion requested',
        '• Account verification data: 90 days after account disconnection',
        '• Encrypted bank account numbers: Retained for active payment methods only',
        '',
        'Automatic Deletion:',
        '• Inactive financial data is automatically flagged for deletion after retention periods',
        '• Access tokens are revoked immediately upon account disconnection',
        '• All encrypted financial data is permanently deleted 30 days after user account closure',
        '',
        'Upon request, we will delete your financial data within 30 days, except where retention is required by law (e.g., completed transaction records for tax purposes).'
      ]
    },
    {
      icon: <Eye className="w-6 h-6 text-orange-600" />,
      title: 'Your Rights & Data Control',
      content: [
        'You have the right to:',
        '• Access your stored financial data at any time',
        '• Request a copy of your financial data (data portability)',
        '• Disconnect your bank account and revoke Plaid access',
        '• Request deletion of your financial data (subject to legal retention requirements)',
        '• Withdraw consent for financial data processing',
        '• Update or correct your financial information',
        '• File a complaint with relevant data protection authorities',
        '',
        'To exercise these rights, contact us at support@redhelixresearch.com or through your account settings.',
        '',
        'Response Time: We will respond to data requests within 30 days.'
      ]
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: 'Consent & Authorization',
      content: [
        'By connecting your bank account via Plaid, you explicitly consent to:',
        '• Collection of financial account information as described',
        '• Encrypted storage of financial data for payment processing',
        '• Sharing data with Plaid for payment facilitation',
        '• Retention of transaction records as required by law',
        '',
        'You may withdraw consent at any time by:',
        '1. Disconnecting your bank account in Account Settings',
        '2. Contacting support@redhelixresearch.com',
        '3. Submitting a written request to our mailing address',
        '',
        'Upon withdrawal, we will cease processing new payments and delete non-legally-required data within 30 days.'
      ]
    },
    {
      icon: <Lock className="w-6 h-6 text-red-600" />,
      title: 'Security Incident Response',
      content: [
        'In the unlikely event of a data breach affecting financial data:',
        '• We will notify affected users within 72 hours',
        '• Provide details of compromised data and recommended actions',
        '• Offer credit monitoring services if applicable',
        '• Report to relevant authorities as required by law',
        '',
        'Our incident response plan includes:',
        '• Immediate isolation of affected systems',
        '• Forensic investigation to determine scope',
        '• Coordination with law enforcement',
        '• Implementation of remediation measures',
        '• Transparent communication with affected parties'
      ]
    },
    {
      icon: <FileText className="w-6 h-6 text-green-600" />,
      title: 'Compliance & Regulations',
      content: [
        'We comply with:',
        '• Gramm-Leach-Bliley Act (GLBA) - Financial privacy requirements',
        '• California Consumer Privacy Act (CCPA) - If applicable',
        '• State-specific financial privacy laws',
        '• PCI DSS - Payment card industry standards',
        '• Federal and state data breach notification laws',
        '',
        'Regular Audits:',
        '• Annual third-party security assessments',
        '• Quarterly internal security reviews',
        '• Continuous compliance monitoring',
        '• Employee security training (quarterly)',
        '',
        'Certifications: PCI DSS Level 1 compliant infrastructure'
      ]
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      title: 'Contact Information',
      content: [
        'For questions about financial data privacy:',
        '',
        'Email: privacy@redhelixresearch.com',
        'Subject: Financial Data Privacy Inquiry',
        '',
        'Mailing Address:',
        'Red Helix Research',
        'Financial Privacy Office',
        '[Address to be added]',
        '',
        'Response Time: Within 5 business days for privacy inquiries',
        '',
        'Data Protection Officer: privacy@redhelixresearch.com'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <SEO 
        title="Plaid Financial Data Privacy Policy - Red Helix Research"
        description="Learn how Red Helix Research protects your financial data collected through Plaid ACH payment processing. Comprehensive privacy policy for financial information."
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 text-slate-500 hover:text-red-600 font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">Financial Data Privacy</span>
          </div>

          <h1 className="text-5xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
            Plaid Financial Data Privacy Policy
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed font-medium">
            Our commitment to protecting your financial information collected through Plaid ACH payment processing.
          </p>
          <p className="text-slate-400 text-sm mt-4 font-medium">
            Last Updated: February 7, 2026 | Effective Date: February 7, 2026
          </p>
        </div>

        {/* Important Notice */}
        <div className="p-8 bg-gradient-to-r from-blue-50 via-white to-blue-50 border border-blue-100 rounded-[24px] mb-12 shadow-sm">
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-blue-800 mb-2 uppercase tracking-wide">
                Your Financial Data is Protected
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                This policy specifically addresses how we collect, use, store, and protect financial data obtained through Plaid for ACH payment processing. All financial data is encrypted at-rest and in-transit with bank-level security.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-3">
                {section.content.map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    className={`text-slate-600 font-medium ${
                      paragraph.startsWith('•') ? 'ml-4' : ''
                    } ${paragraph === '' ? 'h-2' : ''}`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 p-8 bg-slate-50 border border-slate-200 rounded-[24px] text-center">
          <p className="text-slate-600 text-sm font-medium">
            Questions about this policy? Contact us at{' '}
            <a href="mailto:privacy@redhelixresearch.com" className="text-red-600 hover:underline font-bold">
              privacy@redhelixresearch.com
            </a>
          </p>
          <p className="text-slate-400 text-xs mt-3 font-medium">
            This policy is part of our overall{' '}
            <a href="/Policies" className="text-red-600 hover:underline">
              Terms of Service and Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
