import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, CreditCard, AlertTriangle, FileText, Trash2, 
  CheckCircle, XCircle, Clock, Search, RefreshCw, Download 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function PlaidAdminDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('payment-methods');

  // Check admin auth
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  if (user && user.role !== 'admin') {
    navigate('/');
    return null;
  }

  // Fetch payment methods
  const { data: paymentMethods, refetch: refetchPaymentMethods } = useQuery({
    queryKey: ['plaid-payment-methods'],
    queryFn: () => base44.entities.PlaidPaymentMethod.list(),
    initialData: []
  });

  // Fetch fraud alerts
  const { data: fraudAlerts, refetch: refetchFraudAlerts } = useQuery({
    queryKey: ['plaid-fraud-alerts'],
    queryFn: () => base44.entities.PlaidFraudAlert.list('-created_date'),
    initialData: []
  });

  // Fetch webhook logs
  const { data: webhookLogs, refetch: refetchWebhooks } = useQuery({
    queryKey: ['plaid-webhook-logs'],
    queryFn: () => base44.entities.PlaidWebhookLog.list('-created_date', 50),
    initialData: []
  });

  // Fetch consent records
  const { data: consentRecords } = useQuery({
    queryKey: ['financial-consents'],
    queryFn: () => base44.entities.FinancialConsent.list('-created_date'),
    initialData: []
  });

  // Fetch audit logs
  const { data: auditLogs } = useQuery({
    queryKey: ['plaid-audit-logs'],
    queryFn: () => base44.entities.PlaidAuditLog.list('-created_date', 100),
    initialData: []
  });

  // Fetch compliance reports
  const { data: complianceReports, refetch: refetchReports } = useQuery({
    queryKey: ['plaid-compliance-reports'],
    queryFn: () => base44.entities.PlaidComplianceReport.list('-created_date', 20),
    initialData: []
  });

  const handleRevokeToken = async (itemId, userEmail) => {
    if (!confirm('Revoke Plaid access token? User will need to reconnect their bank.')) return;

    try {
      await base44.functions.invoke('plaidAdminActions', {
        action: 'revoke_token',
        plaid_item_id: itemId,
        user_email: userEmail
      });
      alert('Token revoked successfully');
      refetchPaymentMethods();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    if (!confirm('Delete payment method? This cannot be undone.')) return;

    try {
      await base44.functions.invoke('plaidAdminActions', {
        action: 'delete_payment_method',
        payment_method_id: id
      });
      alert('Payment method deleted');
      refetchPaymentMethods();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleApproveTransaction = async (alertId, approved) => {
    try {
      await base44.functions.invoke('plaidAdminActions', {
        action: 'approve_transaction',
        alert_id: alertId,
        approved,
        notes: approved ? 'Approved by admin' : 'Rejected by admin',
        admin_email: user.email
      });
      alert(approved ? 'Transaction approved' : 'Transaction rejected');
      refetchFraudAlerts();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleRunComplianceAudit = async (type) => {
    try {
      await base44.functions.invoke('plaidComplianceAudit', { type });
      alert('Compliance audit completed');
      refetchReports();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      low: 'text-green-500 bg-green-500/20 border-green-500/30',
      medium: 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30',
      high: 'text-orange-500 bg-orange-500/20 border-orange-500/30',
      critical: 'text-red-500 bg-red-500/20 border-red-500/30'
    };
    return colors[level] || colors.low;
  };

  return (
    <div className="min-h-screen bg-stone-950 py-24 px-6">
      <SEO title="Plaid Admin Dashboard - Red Helix Research" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Plaid Admin Dashboard</h1>
              <p className="text-stone-400">Manage Plaid payment methods, fraud detection, and compliance</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-stone-900/60 border border-stone-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-white">{paymentMethods.length}</p>
                  <p className="text-xs text-stone-400">Payment Methods</p>
                </div>
              </div>
            </div>
            <div className="bg-stone-900/60 border border-stone-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {fraudAlerts.filter(a => a.status === 'pending').length}
                  </p>
                  <p className="text-xs text-stone-400">Pending Alerts</p>
                </div>
              </div>
            </div>
            <div className="bg-stone-900/60 border border-stone-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-white">{webhookLogs.length}</p>
                  <p className="text-xs text-stone-400">Webhook Events</p>
                </div>
              </div>
            </div>
            <div className="bg-stone-900/60 border border-stone-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-white">{consentRecords.length}</p>
                  <p className="text-xs text-stone-400">Consent Records</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-stone-900/60 border border-stone-700">
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="fraud-alerts">Fraud Alerts</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="consent">Consent Records</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* Payment Methods Tab */}
          <TabsContent value="payment-methods" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <Input
                  placeholder="Search by email or institution..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-stone-900 border-stone-700"
                />
              </div>
            </div>

            <div className="bg-stone-900/60 border border-stone-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-stone-800/50 border-b border-stone-700">
                  <tr>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">User</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Institution</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Account</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Status</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Last Used</th>
                    <th className="text-right text-xs font-bold text-stone-300 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentMethods
                    .filter(pm => 
                      !searchQuery || 
                      pm.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      pm.institution_name?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((pm) => (
                    <tr key={pm.id} className="border-b border-stone-800 hover:bg-stone-800/30">
                      <td className="px-4 py-3 text-sm text-white">{pm.user_email}</td>
                      <td className="px-4 py-3 text-sm text-stone-400">{pm.institution_name}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-stone-400">
                          {pm.account_type} ••••{pm.account_mask}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pm.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          pm.status === 'error' ? 'bg-red-500/20 text-red-400' :
                          'bg-stone-700 text-stone-400'
                        }`}>
                          {pm.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-400">
                        {pm.last_used ? new Date(pm.last_used).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRevokeToken(pm.plaid_item_id, pm.user_email)}
                          >
                            Revoke
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePaymentMethod(pm.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Fraud Alerts Tab */}
          <TabsContent value="fraud-alerts" className="space-y-4">
            {fraudAlerts.map((alert) => (
              <div key={alert.id} className="bg-stone-900/60 border border-stone-700 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-6 h-6 ${getRiskColor(alert.risk_level).split(' ')[0]}`} />
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {alert.alert_type.replace(/_/g, ' ').toUpperCase()}
                      </h3>
                      <p className="text-sm text-stone-400">Order: {alert.order_id}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(alert.risk_level)}`}>
                    Risk: {alert.risk_score}/100 - {alert.risk_level.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm text-stone-400">
                    <strong className="text-white">User:</strong> {alert.user_email}
                  </div>
                  <div className="text-sm text-stone-400">
                    <strong className="text-white">Status:</strong> {alert.status}
                  </div>
                  {alert.details && (
                    <div className="text-xs text-stone-500 bg-stone-800/50 p-3 rounded">
                      <pre>{JSON.stringify(JSON.parse(alert.details), null, 2)}</pre>
                    </div>
                  )}
                </div>

                {alert.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveTransaction(alert.id, true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveTransaction(alert.id, false)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-4">
            <div className="bg-stone-900/60 border border-stone-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-stone-800/50 border-b border-stone-700">
                  <tr>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Type</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Code</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Item ID</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Status</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {webhookLogs.map((log) => (
                    <tr key={log.id} className="border-b border-stone-800">
                      <td className="px-4 py-3 text-sm text-white">{log.webhook_type}</td>
                      <td className="px-4 py-3 text-sm text-stone-400">{log.webhook_code}</td>
                      <td className="px-4 py-3 text-sm text-stone-400">{log.item_id || '-'}</td>
                      <td className="px-4 py-3">
                        {log.processed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-400">
                        {new Date(log.created_date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Consent Records Tab */}
          <TabsContent value="consent" className="space-y-4">
            <div className="bg-stone-900/60 border border-stone-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-stone-800/50 border-b border-stone-700">
                  <tr>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">User</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Type</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Consent Given</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Timestamp</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {consentRecords.map((record) => (
                    <tr key={record.id} className="border-b border-stone-800">
                      <td className="px-4 py-3 text-sm text-white">{record.user_email}</td>
                      <td className="px-4 py-3 text-sm text-stone-400">{record.consent_type}</td>
                      <td className="px-4 py-3">
                        {record.consent_given ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-400">
                        {new Date(record.consent_timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.withdrawal_timestamp 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {record.withdrawal_timestamp ? 'Withdrawn' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-4">
            <div className="bg-stone-900/60 border border-stone-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-stone-800/50 border-b border-stone-700">
                  <tr>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Action</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">User</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Success</th>
                    <th className="text-left text-xs font-bold text-stone-300 px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.slice(0, 50).map((log) => (
                    <tr key={log.id} className="border-b border-stone-800">
                      <td className="px-4 py-3 text-sm text-white">{log.action}</td>
                      <td className="px-4 py-3 text-sm text-stone-400">{log.user_email || log.admin_email || '-'}</td>
                      <td className="px-4 py-3">
                        {log.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-400">
                        {new Date(log.created_date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Button onClick={() => handleRunComplianceAudit('data_retention')}>
                Data Retention Audit
              </Button>
              <Button onClick={() => handleRunComplianceAudit('encryption_audit')}>
                Encryption Audit
              </Button>
              <Button onClick={() => handleRunComplianceAudit('consent_compliance')}>
                Consent Compliance
              </Button>
              <Button onClick={() => handleRunComplianceAudit('data_integrity')}>
                Data Integrity Check
              </Button>
            </div>

            <div className="space-y-4">
              {complianceReports.map((report) => (
                <div key={report.id} className="bg-stone-900/60 border border-stone-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {report.report_type.replace(/_/g, ' ').toUpperCase()}
                      </h3>
                      <p className="text-sm text-stone-400">
                        {new Date(report.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">{report.compliance_score}</p>
                      <p className="text-xs text-stone-400">Compliance Score</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-stone-500">Records Reviewed</p>
                      <p className="text-lg font-bold text-white">{report.total_records_reviewed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">Issues Found</p>
                      <p className="text-lg font-bold text-red-400">{report.issues_found}</p>
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.status === 'action_required' 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  </div>

                  {report.recommendations && (
                    <div className="p-3 bg-blue-950/20 border border-blue-700/30 rounded text-sm text-blue-300">
                      <strong>Recommendations:</strong> {report.recommendations}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}