import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Clock, Database, Shield, FileCheck, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function PlaidDataRetention() {
  const navigate = useNavigate();

  const retentionSchedule = [
    {
      dataType: 'Plaid Access Tokens',
      retention: '90 days after disconnection',
      legalBasis: 'Grace period for reconnection',
      disposalMethod: 'Secure deletion + token revocation via Plaid API',
      automated: true,
      encryption: 'AES-256-GCM'
    },
    {
      dataType: 'Bank Account Numbers',
      retention: 'While payment method is active',
      legalBasis: 'Active payment processing',
      disposalMethod: 'Immediate secure deletion upon removal',
      automated: true,
      encryption: 'AES-256-GCM'
    },
    {
      dataType: 'Routing Numbers',
      retention: 'While payment method is active',
      legalBasis: 'ACH transaction processing',
      disposalMethod: 'Immediate secure deletion upon removal',
      automated: true,
      encryption: 'AES-256-GCM'
    },
    {
      dataType: 'Transaction Records',
      retention: '7 years',
      legalBasis: 'IRS tax compliance (26 USC § 6001)',
      disposalMethod: 'Secure multi-pass deletion after 7 years',
      automated: true,
      encryption: 'AES-256-GCM'
    },
    {
      dataType: 'ACH Transfer IDs',
      retention: '7 years',
      legalBasis: 'Tax and audit compliance',
      disposalMethod: 'Secure deletion with transaction records',
      automated: true,
      encryption: 'AES-256-GCM'
    },
    {
      dataType: 'Account Verification Data',
      retention: '90 days after verification',
      legalBasis: 'Fraud prevention and dispute resolution',
      disposalMethod: 'Secure deletion after retention period',
      automated: true,
      encryption: 'AES-256-GCM'
    },
    {
      dataType: 'Payment Failure Logs',
      retention: '2 years',
      legalBasis: 'Fraud analysis and customer support',
      disposalMethod: 'Secure log rotation and deletion',
      automated: true,
      encryption: 'AES-256-GCM'
    },
    {
      dataType: 'Plaid Link Metadata',
      retention: '30 days',
      legalBasis: 'Technical support and debugging',
      disposalMethod: 'Automatic log deletion',
      automated: true,
      encryption: 'Not stored (ephemeral)'
    },
    {
      dataType: 'Consent Records',
      retention: '7 years after withdrawal',
      legalBasis: 'Legal compliance and audit trail',
      disposalMethod: 'Archived then securely deleted',
      automated: true,
      encryption: 'Standard database encryption'
    }
  ];

  const disposalProcedures = [
    {
      title: 'Automated Deletion Process',
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      steps: [
        'Daily automated job runs at 2:00 AM UTC',
        'Scans all financial data records for expired retention dates',
        '30-day grace period before permanent deletion',
        'User notification 7 days before deletion (non-legally required data)',
        'Secure deletion using DoD 5220.22-M standard (3-pass overwrite)',
        'Audit log entry for every deletion operation'
      ]
    },
    {
      title: 'Plaid Token Revocation',
      icon: <Shield className="w-6 h-6 text-red-500" />,
      steps: [
        'Immediate API call to Plaid to revoke access token',
        'Verification of revocation status',
        'Encrypted token deleted from database',
        'All associated metadata removed',
        'User receives disconnection confirmation',
        'Item status updated to "disconnected" in records'
      ]
    },
    {
      title: 'User-Requested Deletion',
      icon: <Trash2 className="w-6 h-6 text-orange-500" />,
      steps: [
        'User submits deletion request via account settings or email',
        'Identity verification (login or email confirmation)',
        'Review of legal retention requirements',
        'Immediate deletion of non-legally-required data',
        'Flagging of legally-required data for deletion after retention period',
        'Confirmation email sent within 48 hours'
      ]
    },
    {
      title: 'Backup & Archive Disposal',
      icon: <Database className="w-6 h-6 text-purple-500" />,
      steps: [
        'Data removed from active database immediately',
        'Backup retention: 90 days for disaster recovery',
        'Secure deletion from all backup systems within 90 days',
        'Cold storage archives (legally required data only)',
        'Encrypted archives with rotating encryption keys',
        'Archive disposal after legal retention period expires'
      ]
    }
  ];

  const legalCompliance = [
    {
      regulation: 'IRS Tax Code (26 USC § 6001)',
      requirement: '7-year retention of financial transaction records',
      applicability: 'All ACH transactions, payment records',
      consequence: 'Required by federal law - cannot be deleted earlier'
    },
    {
      regulation: 'GLBA (Gramm-Leach-Bliley Act)',
      requirement: 'Reasonable safeguards for financial data',
      applicability: 'All consumer financial information',
      consequence: 'Encryption, access controls, secure disposal required'
    },
    {
      regulation: 'CCPA (California Consumer Privacy Act)',
      requirement: 'Right to deletion upon request',
      applicability: 'California residents',
      consequence: 'Must delete within 45 days (subject to legal exceptions)'
    },
    {
      regulation: 'NACHA Rules',
      requirement: '2-year retention for ACH transaction records',
      applicability: 'All ACH transfers',
      consequence: 'Required for dispute resolution'
    },
    {
      regulation: 'Bank Secrecy Act (BSA)',
      requirement: '5-year retention for certain financial records',
      applicability: 'Transactions over $10,000',
      consequence: 'Anti-money laundering compliance'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 py-24 px-6">
      <SEO 
        title="Plaid Data Retention & Disposal Policy - Red Helix Research"
        description="Comprehensive data retention and secure disposal policy for Plaid financial data, including automated deletion schedules and regulatory compliance."
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-950/30 border border-red-700/30 rounded-full mb-6">
            <Trash2 className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-300">Data Retention & Disposal</span>
          </div>

          <h1 className="text-5xl font-black text-white mb-4">
            Plaid Data Retention & Disposal Policy
          </h1>
          <p className="text-stone-400 text-lg leading-relaxed">
            Comprehensive policy for the retention and secure disposal of financial data collected through Plaid ACH payment processing.
          </p>
          <p className="text-stone-500 text-sm mt-4">
            Last Updated: February 7, 2026 | Effective Date: February 7, 2026
          </p>
        </div>

        {/* Key Principles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-stone-900/60 border border-blue-700/50 rounded-2xl p-6">
            <div className="w-12 h-12 bg-blue-600/20 border border-blue-600/30 rounded-xl flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Legal Compliance</h3>
            <p className="text-xs text-stone-400">
              Full compliance with IRS, GLBA, and CCPA requirements
            </p>
          </div>

          <div className="bg-stone-900/60 border border-green-700/50 rounded-2xl p-6">
            <div className="w-12 h-12 bg-green-600/20 border border-green-600/30 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Automated</h3>
            <p className="text-xs text-stone-400">
              Scheduled deletion jobs run daily
            </p>
          </div>

          <div className="bg-stone-900/60 border border-red-700/50 rounded-2xl p-6">
            <div className="w-12 h-12 bg-red-600/20 border border-red-600/30 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Secure Disposal</h3>
            <p className="text-xs text-stone-400">
              DoD 5220.22-M multi-pass deletion
            </p>
          </div>

          <div className="bg-stone-900/60 border border-purple-700/50 rounded-2xl p-6">
            <div className="w-12 h-12 bg-purple-600/20 border border-purple-600/30 rounded-xl flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Encrypted</h3>
            <p className="text-xs text-stone-400">
              AES-256-GCM encryption until disposal
            </p>
          </div>
        </div>

        {/* Retention Schedule Table */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-white mb-6">Data Retention Schedule</h2>
          
          <div className="bg-stone-900/60 border border-stone-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-stone-800/50 border-b border-stone-700">
                    <th className="text-left text-xs font-bold text-stone-300 px-6 py-4">Data Type</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-6 py-4">Retention Period</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-6 py-4">Legal Basis</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-6 py-4">Disposal Method</th>
                    <th className="text-center text-xs font-bold text-stone-300 px-6 py-4">Auto</th>
                  </tr>
                </thead>
                <tbody>
                  {retentionSchedule.map((item, idx) => (
                    <tr key={idx} className="border-b border-stone-800 hover:bg-stone-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-white">{item.dataType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-stone-400">{item.retention}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-stone-500">{item.legalBasis}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-stone-400">{item.disposalMethod}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.automated ? (
                          <span className="inline-flex px-2 py-1 bg-green-600/20 border border-green-600/30 rounded-full text-xs text-green-400 font-medium">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 bg-orange-600/20 border border-orange-600/30 rounded-full text-xs text-orange-400 font-medium">
                            Manual
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Disposal Procedures */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-white mb-6">Secure Disposal Procedures</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {disposalProcedures.map((procedure, idx) => (
              <div
                key={idx}
                className="bg-stone-900/60 border border-stone-700/50 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-stone-800/50 rounded-xl">
                    {procedure.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white">{procedure.title}</h3>
                </div>
                
                <ul className="space-y-2">
                  {procedure.steps.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2 text-sm text-stone-400">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Compliance Requirements */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-white mb-6">Legal Compliance Requirements</h2>
          
          <div className="space-y-4">
            {legalCompliance.map((item, idx) => (
              <div
                key={idx}
                className="bg-stone-900/60 border border-stone-700/50 rounded-2xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-yellow-600/20 border border-yellow-600/30 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">{item.regulation}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-stone-500 block mb-1">Requirement:</span>
                        <span className="text-stone-300">{item.requirement}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block mb-1">Applies To:</span>
                        <span className="text-stone-300">{item.applicability}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block mb-1">Consequence:</span>
                        <span className="text-stone-300">{item.consequence}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Rights Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-white mb-6">User Rights & Data Deletion Requests</h2>
          
          <div className="bg-stone-900/60 border border-stone-700/50 rounded-2xl p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">How to Request Data Deletion</h3>
                <ol className="space-y-2 ml-6 list-decimal text-stone-400">
                  <li>Log in to your account and go to Settings → Privacy & Data</li>
                  <li>Click "Delete Financial Data" or "Disconnect Bank Account"</li>
                  <li>Confirm your identity via email verification</li>
                  <li>Review what data will be deleted vs. retained (legal requirements)</li>
                  <li>Submit deletion request</li>
                  <li>Receive confirmation within 48 hours</li>
                </ol>
              </div>

              <div className="pt-6 border-t border-stone-700">
                <h3 className="text-xl font-bold text-white mb-3">What Gets Deleted Immediately</h3>
                <ul className="space-y-2 ml-6 list-disc text-stone-400">
                  <li>Plaid access tokens (revoked via API)</li>
                  <li>Encrypted bank account numbers</li>
                  <li>Routing numbers</li>
                  <li>Account verification data (if past 90-day retention)</li>
                  <li>Payment failure logs (if past 2-year retention)</li>
                </ul>
              </div>

              <div className="pt-6 border-t border-stone-700">
                <h3 className="text-xl font-bold text-white mb-3">What Cannot Be Deleted (Legal Requirements)</h3>
                <ul className="space-y-2 ml-6 list-disc text-stone-400">
                  <li><strong className="text-white">Transaction records:</strong> Must be retained for 7 years per IRS requirements</li>
                  <li><strong className="text-white">Consent records:</strong> Must be retained for 7 years for audit trail</li>
                  <li><strong className="text-white">Active disputes:</strong> Data related to ongoing disputes or investigations</li>
                  <li><strong className="text-white">Legal holds:</strong> Data subject to subpoenas or legal proceedings</li>
                </ul>
                <p className="text-sm text-stone-500 mt-4">
                  Note: Legally-required data will be automatically deleted after the retention period expires.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification & Audit */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-white mb-6">Verification & Audit Trail</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-stone-900/60 border border-stone-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileCheck className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-bold text-white">Deletion Verification</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-400">
                <li>• Every deletion generates an audit log entry</li>
                <li>• Logs include: data type, timestamp, user ID, reason</li>
                <li>• Verification that data is removed from all systems</li>
                <li>• Backup deletion verified within 90 days</li>
                <li>• Quarterly audit of deletion compliance</li>
              </ul>
            </div>

            <div className="bg-stone-900/60 border border-stone-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-bold text-white">Security Measures</h3>
              </div>
              <ul className="space-y-2 text-sm text-stone-400">
                <li>• Multi-pass secure deletion (DoD 5220.22-M)</li>
                <li>• Encryption keys rotated and destroyed</li>
                <li>• Database vacuum and cleanup operations</li>
                <li>• Access logs reviewed for unauthorized access</li>
                <li>• Annual third-party security audit</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 p-6 bg-stone-900/60 border border-stone-700/50 rounded-2xl text-center">
          <h3 className="text-lg font-bold text-white mb-2">Questions About Data Retention or Disposal?</h3>
          <p className="text-stone-400 text-sm mb-4">
            Contact our Data Protection Officer for assistance with data deletion requests or retention policy questions.
          </p>
          <div className="flex flex-col items-center gap-2">
            <a
              href="mailto:privacy@redhelixresearch.com"
              className="inline-flex items-center gap-2 text-blue-400 hover:underline"
            >
              privacy@redhelixresearch.com
            </a>
            <p className="text-xs text-stone-500">
              Response time: Within 5 business days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}