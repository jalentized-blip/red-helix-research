import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, Trash2, Clock, Shield, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function DataRetentionPolicy() {
  const navigate = useNavigate();

  const retentionSchedule = [
    {
      category: 'Financial Transaction Records',
      retention: '7 years',
      reason: 'Required by federal tax law (IRS)',
      autoDelete: true,
      icon: <FileText className="w-5 h-5 text-green-600" />
    },
    {
      category: 'Plaid Access Tokens',
      retention: '90 days after disconnection',
      reason: 'Grace period for reconnection',
      autoDelete: true,
      icon: <Shield className="w-5 h-5 text-blue-600" />
    },
    {
      category: 'Bank Account Verification Data',
      retention: '90 days after disconnection',
      reason: 'Fraud prevention and dispute resolution',
      autoDelete: true,
      icon: <Database className="w-5 h-5 text-purple-600" />
    },
    {
      category: 'Encrypted Bank Account Numbers',
      retention: 'Until payment method removed',
      reason: 'Active payment processing',
      autoDelete: false,
      icon: <Shield className="w-5 h-5 text-amber-600" />
    },
    {
      category: 'Order History',
      retention: '7 years',
      reason: 'Tax compliance and customer service',
      autoDelete: true,
      icon: <FileText className="w-5 h-5 text-red-600" />
    },
    {
      category: 'User Account Data',
      retention: 'Until account deletion',
      reason: 'Active account management',
      autoDelete: false,
      icon: <Database className="w-5 h-5 text-orange-600" />
    },
    {
      category: 'Security Logs',
      retention: '2 years',
      reason: 'Security audits and incident response',
      autoDelete: true,
      icon: <Shield className="w-5 h-5 text-blue-600" />
    },
    {
      category: 'Marketing Communications',
      retention: 'Until unsubscribe',
      reason: 'Active marketing consent',
      autoDelete: false,
      icon: <FileText className="w-5 h-5 text-green-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <SEO 
        title="Data Retention & Deletion Policy - Red Helix Research"
        description="Learn about Red Helix Research's data retention periods and automated deletion policies for financial and personal data."
      />

      <div className="max-w-5xl mx-auto">
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-full mb-6">
            <Database className="w-4 h-4 text-red-600" />
            <span className="text-sm font-bold text-red-700 uppercase tracking-wide">Data Management</span>
          </div>

          <h1 className="text-5xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
            Data Retention & Deletion Policy
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed font-medium">
            Our commitment to responsible data management and your right to deletion.
          </p>
          <p className="text-slate-400 text-sm mt-4 font-medium">
            Last Updated: February 7, 2026 | Effective Date: February 7, 2026
          </p>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-tight">Automated Deletion</h3>
            <p className="text-sm text-slate-500 font-medium">
              Data is automatically deleted after retention periods expire
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-tight">Legal Compliance</h3>
            <p className="text-sm text-slate-500 font-medium">
              Retention periods comply with federal and state laws
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-tight">User Control</h3>
            <p className="text-sm text-slate-500 font-medium">
              Request deletion of your data at any time (subject to legal requirements)
            </p>
          </div>
        </div>

        {/* Retention Schedule */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase tracking-tighter">Data Retention Schedule</h2>
          
          <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left text-xs font-bold text-slate-500 px-6 py-4 uppercase tracking-wider">Data Category</th>
                    <th className="text-left text-xs font-bold text-slate-500 px-6 py-4 uppercase tracking-wider">Retention Period</th>
                    <th className="text-left text-xs font-bold text-slate-500 px-6 py-4 uppercase tracking-wider">Legal Basis</th>
                    <th className="text-center text-xs font-bold text-slate-500 px-6 py-4 uppercase tracking-wider">Auto-Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {retentionSchedule.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span className="text-sm font-bold text-slate-900">{item.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-medium">{item.retention}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500 font-medium">{item.reason}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.autoDelete ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-100 rounded-full text-xs text-green-700 font-bold uppercase tracking-wider">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-500 font-bold uppercase tracking-wider">
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

        {/* Policy Details */}
        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 uppercase tracking-tight">
              <Trash2 className="w-6 h-6 text-red-600" />
              Automated Deletion Process
            </h3>
            <div className="space-y-3 text-slate-600 font-medium">
              <p>
                Our system automatically identifies and deletes data that has exceeded its retention period:
              </p>
              <ul className="ml-6 space-y-2">
                <li>• <strong className="text-slate-900">Daily Scan:</strong> Automated job runs daily at 2:00 AM UTC</li>
                <li>• <strong className="text-slate-900">Grace Period:</strong> 30-day grace period before permanent deletion</li>
                <li>• <strong className="text-slate-900">User Notification:</strong> Email notification 7 days before deletion</li>
                <li>• <strong className="text-slate-900">Secure Deletion:</strong> Multi-pass secure deletion (DoD 5220.22-M standard)</li>
                <li>• <strong className="text-slate-900">Audit Log:</strong> All deletions logged for compliance</li>
              </ul>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 uppercase tracking-tight">
              <Shield className="w-6 h-6 text-blue-600" />
              Legal Retention Requirements
            </h3>
            <div className="space-y-3 text-slate-600 font-medium">
              <p>
                Certain data must be retained to comply with legal obligations:
              </p>
              <ul className="ml-6 space-y-2">
                <li>• <strong className="text-slate-900">Tax Records:</strong> IRS requires 7-year retention of financial transactions</li>
                <li>• <strong className="text-slate-900">Anti-Money Laundering:</strong> Bank Secrecy Act (BSA) compliance</li>
                <li>• <strong className="text-slate-900">Consumer Protection:</strong> State-specific requirements for order records</li>
                <li>• <strong className="text-slate-900">Dispute Resolution:</strong> Payment processor requirements (180 days minimum)</li>
              </ul>
              <p className="mt-4">
                We cannot delete data subject to legal holds, ongoing investigations, or required by law.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 uppercase tracking-tight">
              <FileText className="w-6 h-6 text-green-600" />
              Your Right to Deletion
            </h3>
            <div className="space-y-3 text-slate-600 font-medium">
              <p>
                You can request deletion of your data at any time:
              </p>
              <ul className="ml-6 space-y-2">
                <li>• <strong className="text-slate-900">Account Settings:</strong> Delete account and associated data</li>
                <li>• <strong className="text-slate-900">Email Request:</strong> privacy@redhelixresearch.com</li>
                <li>• <strong className="text-slate-900">Response Time:</strong> We will respond within 30 days</li>
                <li>• <strong className="text-slate-900">Confirmation:</strong> You'll receive confirmation once deletion is complete</li>
              </ul>
              <p className="mt-4">
                <strong className="text-slate-900">Note:</strong> Data subject to legal retention requirements will be deleted after the required retention period expires.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 uppercase tracking-tight">
              <Database className="w-6 h-6 text-purple-600" />
              Backup & Archival Data
            </h3>
            <div className="space-y-3 text-slate-600 font-medium">
              <p>
                Data in backups and archives is subject to the same retention policies:
              </p>
              <ul className="ml-6 space-y-2">
                <li>• <strong className="text-slate-900">Backup Retention:</strong> 90 days for disaster recovery backups</li>
                <li>• <strong className="text-slate-900">Archive Deletion:</strong> Deleted from all backups within 90 days</li>
                <li>• <strong className="text-slate-900">Cold Storage:</strong> 7-year archives for legally required data only</li>
                <li>• <strong className="text-slate-900">Encrypted Archives:</strong> All archival data encrypted with rotating keys</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 p-8 bg-slate-50 border border-slate-200 rounded-[24px] text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-tight">Questions About Data Retention?</h3>
          <p className="text-slate-500 text-sm mb-4 font-medium">
            Contact our Data Protection Officer for questions about retention policies or deletion requests.
          </p>
          <a
            href="mailto:privacy@redhelixresearch.com"
            className="inline-flex items-center gap-2 text-red-600 hover:underline font-bold"
          >
            privacy@redhelixresearch.com
          </a>
        </div>
      </div>
    </div>
  );
}
