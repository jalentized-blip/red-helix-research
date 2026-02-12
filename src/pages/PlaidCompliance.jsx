import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function PlaidCompliance() {
  const navigate = useNavigate();

  const complianceFeatures = [
    {
      category: 'Data Security',
      icon: <Lock className="w-6 h-6 text-green-600" />,
      features: [
        'TLS 1.3 encryption for all data in-transit',
        'AES-256-GCM encryption for financial data at-rest',
        'Encrypted storage of Plaid access tokens',
        'No storage of user login credentials',
        'Multi-factor authentication for admin access',
        'Zero-trust architecture implementation'
      ]
    },
    {
      category: 'Consent & Authorization',
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      features: [
        'Explicit user consent before Plaid Link initialization',
        'Clear disclosure of data collection practices',
        'Audit trail for all consent actions (IP, timestamp, user agent)',
        'Right to withdraw consent at any time',
        'Granular consent for specific data types',
        'Consent re-verification for sensitive operations'
      ]
    },
    {
      category: 'Privacy Compliance',
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      features: [
        'GLBA compliance for financial data privacy',
        'CCPA compliance (California residents)',
        'Comprehensive privacy policy for Plaid data',
        'Data minimization - only collect necessary information',
        'No sale of financial data to third parties',
        'User access to their stored financial data'
      ]
    },
    {
      category: 'Data Retention',
      icon: <FileText className="w-6 h-6 text-amber-500" />,
      features: [
        '7-year retention for transaction records (IRS requirement)',
        '90-day retention for Plaid access tokens after disconnection',
        'Automated deletion after retention periods',
        'User-requested deletion (subject to legal requirements)',
        'Encrypted archival for required records',
        'Regular cleanup of expired data'
      ]
    },
    {
      category: 'Payment Security',
      icon: <Shield className="w-6 h-6 text-[#dc2626]" />,
      features: [
        'PCI DSS compliant infrastructure',
        'Fraud detection and monitoring',
        'Amount verification before payment processing',
        'Webhook signature verification',
        'Real-time payment status updates',
        'Secure ACH transfer processing via Plaid'
      ]
    },
    {
      category: 'User Rights',
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      features: [
        'Right to access stored financial data',
        'Right to data portability',
        'Right to deletion (subject to legal requirements)',
        'Right to withdraw consent',
        'Right to update payment information',
        'Right to disconnect bank accounts'
      ]
    },
    {
      category: 'Monitoring & Auditing',
      icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
      features: [
        'Real-time security monitoring',
        'Anomaly detection for suspicious activity',
        'Audit logs for all financial operations',
        'Webhook event logging',
        'Failed transaction tracking',
        'Quarterly security reviews'
      ]
    },
    {
      category: 'Incident Response',
      icon: <Shield className="w-6 h-6 text-[#dc2626]" />,
      features: [
        '72-hour breach notification',
        'Documented incident response plan',
        'Credit monitoring for affected users',
        'Forensic investigation procedures',
        'Remediation and prevention measures',
        'Transparent communication with users'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <SEO 
        title="Plaid ACH Compliance Features - Red Helix Research"
        description="Comprehensive overview of Red Helix Research's Plaid ACH payment compliance features including security, privacy, and regulatory compliance."
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-8 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-[#dc2626]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-6">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">Plaid ACH Compliance</span>
          </div>

          <h1 className="text-5xl font-black text-slate-900 mb-4 uppercase tracking-tight">
            Plaid Payment Compliance
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed font-medium max-w-3xl">
            Our comprehensive implementation of Plaid ACH payment processing with full regulatory compliance, security best practices, and user privacy protection.
          </p>
        </div>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Fully Compliant</h3>
            <p className="text-sm text-slate-500 font-medium">
              Meets all Plaid, PCI DSS, GLBA, and CCPA requirements
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Bank-Level Security</h3>
            <p className="text-sm text-slate-500 font-medium">
              AES-256 encryption and zero-trust architecture
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">User Privacy</h3>
            <p className="text-sm text-slate-500 font-medium">
              Transparent data practices with user control
            </p>
          </div>
        </div>

        {/* Compliance Features */}
        <div className="space-y-6">
          {complianceFeatures.map((category, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {category.icon}
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  {category.category}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.features.map((feature, fIdx) => (
                  <div
                    key={fIdx}
                    className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Implementation Details */}
        <div className="mt-12 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Technical Implementation</h3>
            <div className="space-y-4 text-slate-600 font-medium">
              <p>Our Plaid ACH integration includes:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="flex items-start gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong className="text-slate-900">Plaid Link:</strong> Secure bank account connection via Plaid's official SDK</span>
                </li>
                <li className="flex items-start gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong className="text-slate-900">Token Exchange:</strong> Secure server-side public token to access token exchange</span>
                </li>
                <li className="flex items-start gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong className="text-slate-900">ACH Transfers:</strong> Direct ACH debit processing through Plaid's Transfer API</span>
                </li>
                <li className="flex items-start gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong className="text-slate-900">Webhooks:</strong> Real-time payment status updates with signature verification</span>
                </li>
                <li className="flex items-start gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong className="text-slate-900">Encryption:</strong> All financial data encrypted at-rest using Web Crypto API</span>
                </li>
                <li className="flex items-start gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong className="text-slate-900">MFA:</strong> Multi-factor authentication required for payment operations</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Regulatory Compliance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-lg font-bold text-slate-900 mb-2">GLBA Compliance</h4>
                <p className="text-sm text-slate-500 font-medium">
                  Gramm-Leach-Bliley Act requirements for financial data privacy and security safeguards.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-lg font-bold text-slate-900 mb-2">CCPA Compliance</h4>
                <p className="text-sm text-slate-500 font-medium">
                  California Consumer Privacy Act rights for data access, deletion, and non-discrimination.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-lg font-bold text-slate-900 mb-2">PCI DSS</h4>
                <p className="text-sm text-slate-500 font-medium">
                  Payment Card Industry Data Security Standard compliant infrastructure and practices.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-lg font-bold text-slate-900 mb-2">IRS Requirements</h4>
                <p className="text-sm text-slate-500 font-medium">
                  7-year retention of financial transaction records as required by federal tax law.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Policies */}
        <div className="mt-12 p-8 bg-slate-50 border border-slate-200 rounded-[24px]">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Related Policies & Documentation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/PlaidPrivacy"
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#dc2626] hover:shadow-md transition-all group"
            >
              <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-[#dc2626]">Plaid Privacy Policy</h4>
              <p className="text-xs text-slate-500 font-medium">Detailed financial data privacy policy</p>
            </a>
            <a
              href="/DataRetentionPolicy"
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#dc2626] hover:shadow-md transition-all group"
            >
              <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-[#dc2626]">Data Retention Policy</h4>
              <p className="text-xs text-slate-500 font-medium">Retention schedules and deletion procedures</p>
            </a>
            <a
              href="/SecurityDashboard"
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#dc2626] hover:shadow-md transition-all group"
            >
              <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-[#dc2626]">Security Dashboard</h4>
              <p className="text-xs text-slate-500 font-medium">Real-time security monitoring (Admin only)</p>
            </a>
            <a
              href="/Policies"
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#dc2626] hover:shadow-md transition-all group"
            >
              <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-[#dc2626]">Terms & Privacy</h4>
              <p className="text-xs text-slate-500 font-medium">General terms of service and privacy policy</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
