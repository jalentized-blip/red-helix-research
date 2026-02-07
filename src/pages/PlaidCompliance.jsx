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
      icon: <Lock className="w-6 h-6 text-green-500" />,
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
      icon: <FileText className="w-6 h-6 text-blue-500" />,
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
      icon: <Shield className="w-6 h-6 text-purple-500" />,
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
      icon: <FileText className="w-6 h-6 text-yellow-500" />,
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
      icon: <Shield className="w-6 h-6 text-red-500" />,
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
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
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
      icon: <Shield className="w-6 h-6 text-red-500" />,
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
    <div className="min-h-screen bg-stone-950 py-24 px-6">
      <SEO 
        title="Plaid ACH Compliance Features - Red Helix Research"
        description="Comprehensive overview of Red Helix Research's Plaid ACH payment compliance features including security, privacy, and regulatory compliance."
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-950/30 border border-blue-700/30 rounded-full mb-6">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Plaid ACH Compliance</span>
          </div>

          <h1 className="text-5xl font-black text-white mb-4">
            Plaid Payment Compliance
          </h1>
          <p className="text-stone-400 text-lg leading-relaxed">
            Our comprehensive implementation of Plaid ACH payment processing with full regulatory compliance, security best practices, and user privacy protection.
          </p>
        </div>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-stone-900/60 border border-green-700/50 rounded-2xl p-6">
            <div className="w-12 h-12 bg-green-600/20 border border-green-600/30 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Fully Compliant</h3>
            <p className="text-sm text-stone-400">
              Meets all Plaid, PCI DSS, GLBA, and CCPA requirements
            </p>
          </div>

          <div className="bg-stone-900/60 border border-blue-700/50 rounded-2xl p-6">
            <div className="w-12 h-12 bg-blue-600/20 border border-blue-600/30 rounded-xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Bank-Level Security</h3>
            <p className="text-sm text-stone-400">
              AES-256 encryption and zero-trust architecture
            </p>
          </div>

          <div className="bg-stone-900/60 border border-purple-700/50 rounded-2xl p-6">
            <div className="w-12 h-12 bg-purple-600/20 border border-purple-600/30 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">User Privacy</h3>
            <p className="text-sm text-stone-400">
              Transparent data practices with user control
            </p>
          </div>
        </div>

        {/* Compliance Features */}
        <div className="space-y-6">
          {complianceFeatures.map((category, idx) => (
            <div
              key={idx}
              className="bg-stone-900/60 border border-stone-700/50 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-stone-800/50 rounded-xl">
                  {category.icon}
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {category.category}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.features.map((feature, fIdx) => (
                  <div
                    key={fIdx}
                    className="flex items-start gap-3 p-3 bg-stone-800/30 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-stone-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Implementation Details */}
        <div className="mt-12 space-y-6">
          <div className="bg-stone-900/60 border border-stone-700/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Technical Implementation</h3>
            <div className="space-y-3 text-stone-400">
              <p>Our Plaid ACH integration includes:</p>
              <ul className="ml-6 space-y-2">
                <li>• <strong className="text-white">Plaid Link:</strong> Secure bank account connection via Plaid's official SDK</li>
                <li>• <strong className="text-white">Token Exchange:</strong> Secure server-side public token to access token exchange</li>
                <li>• <strong className="text-white">ACH Transfers:</strong> Direct ACH debit processing through Plaid's Transfer API</li>
                <li>• <strong className="text-white">Webhooks:</strong> Real-time payment status updates with signature verification</li>
                <li>• <strong className="text-white">Encryption:</strong> All financial data encrypted at-rest using Web Crypto API</li>
                <li>• <strong className="text-white">MFA:</strong> Multi-factor authentication required for payment operations</li>
              </ul>
            </div>
          </div>

          <div className="bg-stone-900/60 border border-stone-700/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Regulatory Compliance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-bold text-white mb-2">GLBA Compliance</h4>
                <p className="text-sm text-stone-400">
                  Gramm-Leach-Bliley Act requirements for financial data privacy and security safeguards.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">CCPA Compliance</h4>
                <p className="text-sm text-stone-400">
                  California Consumer Privacy Act rights for data access, deletion, and non-discrimination.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">PCI DSS</h4>
                <p className="text-sm text-stone-400">
                  Payment Card Industry Data Security Standard compliant infrastructure and practices.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">IRS Requirements</h4>
                <p className="text-sm text-stone-400">
                  7-year retention of financial transaction records as required by federal tax law.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Policies */}
        <div className="mt-12 p-6 bg-stone-900/60 border border-stone-700/50 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-4">Related Policies & Documentation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              href="/PlaidPrivacy"
              className="p-3 bg-stone-800/50 border border-stone-700 rounded-lg hover:border-blue-600/50 transition-colors"
            >
              <h4 className="text-sm font-bold text-white mb-1">Plaid Privacy Policy</h4>
              <p className="text-xs text-stone-400">Detailed financial data privacy policy</p>
            </a>
            <a
              href="/DataRetentionPolicy"
              className="p-3 bg-stone-800/50 border border-stone-700 rounded-lg hover:border-blue-600/50 transition-colors"
            >
              <h4 className="text-sm font-bold text-white mb-1">Data Retention Policy</h4>
              <p className="text-xs text-stone-400">Retention schedules and deletion procedures</p>
            </a>
            <a
              href="/SecurityDashboard"
              className="p-3 bg-stone-800/50 border border-stone-700 rounded-lg hover:border-blue-600/50 transition-colors"
            >
              <h4 className="text-sm font-bold text-white mb-1">Security Dashboard</h4>
              <p className="text-xs text-stone-400">Real-time security monitoring (Admin only)</p>
            </a>
            <a
              href="/Policies"
              className="p-3 bg-stone-800/50 border border-stone-700 rounded-lg hover:border-blue-600/50 transition-colors"
            >
              <h4 className="text-sm font-bold text-white mb-1">Terms & Privacy</h4>
              <p className="text-xs text-stone-400">General terms of service and privacy policy</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}