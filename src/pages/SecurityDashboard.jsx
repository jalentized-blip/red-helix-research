import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Activity, AlertTriangle, Lock, Eye, Download, RefreshCw } from 'lucide-react';
import { useZeroTrust } from '@/components/security/ZeroTrustProvider';
import SEO from '@/components/SEO';

export default function SecurityDashboard() {
  const navigate = useNavigate();
  const { trustScore, anomalies, activityLog } = useZeroTrust();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [securityLogs, setSecurityLogs] = useState([]);

  useEffect(() => {
    checkAuth();
    loadSecurityLogs();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        navigate('/');
        return;
      }
      setIsAdmin(true);
    } catch (error) {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityLogs = () => {
    const logs = JSON.parse(sessionStorage.getItem('security_logs') || '[]');
    setSecurityLogs(logs.reverse());
  };

  const downloadLogs = () => {
    const dataStr = JSON.stringify(securityLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-logs-${Date.now()}.json`;
    link.click();
  };

  const clearLogs = () => {
    sessionStorage.removeItem('security_logs');
    setSecurityLogs([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length;
  const highAnomalies = anomalies.filter(a => a.severity === 'high').length;

  return (
    <div className="min-h-screen bg-stone-950 py-24 px-6">
      <SEO 
        title="Security Dashboard - Zero Trust Monitoring"
        description="Real-time security monitoring and zero trust architecture dashboard"
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-600/20 border border-red-600/30 rounded-2xl">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Zero Trust Security</h1>
              <p className="text-stone-400">Real-time monitoring & threat detection</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-stone-900/60 border-stone-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="text-3xl font-bold text-white">{trustScore}</span>
            </div>
            <p className="text-sm text-stone-400">Trust Score</p>
          </Card>

          <Card className="bg-stone-900/60 border-stone-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-3xl font-bold text-white">{criticalAnomalies}</span>
            </div>
            <p className="text-sm text-stone-400">Critical Alerts</p>
          </Card>

          <Card className="bg-stone-900/60 border-stone-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="text-3xl font-bold text-white">{highAnomalies}</span>
            </div>
            <p className="text-sm text-stone-400">High Priority</p>
          </Card>

          <Card className="bg-stone-900/60 border-stone-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-green-500" />
              <span className="text-3xl font-bold text-white">{securityLogs.length}</span>
            </div>
            <p className="text-sm text-stone-400">Total Events</p>
          </Card>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-stone-900/60 border-stone-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-500" />
              Active Protection
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-stone-800/50 rounded-xl">
                <span className="text-sm text-stone-300">Continuous Session Validation</span>
                <span className="text-xs text-green-500 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-stone-800/50 rounded-xl">
                <span className="text-sm text-stone-300">Anomaly Detection</span>
                <span className="text-xs text-green-500 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-stone-800/50 rounded-xl">
                <span className="text-sm text-stone-300">Real-time Monitoring</span>
                <span className="text-xs text-green-500 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-stone-800/50 rounded-xl">
                <span className="text-sm text-stone-300">Rate Limiting</span>
                <span className="text-xs text-green-500 font-medium">Active</span>
              </div>
            </div>
          </Card>

          <Card className="bg-stone-900/60 border-stone-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Activity Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-stone-800/50 rounded-xl">
                <span className="text-sm text-stone-300">Page Views (Recent)</span>
                <span className="text-lg font-bold text-white">{activityLog.pageChanges.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-stone-800/50 rounded-xl">
                <span className="text-sm text-stone-300">API Calls (Recent)</span>
                <span className="text-lg font-bold text-white">{activityLog.apiCalls.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-stone-800/50 rounded-xl">
                <span className="text-sm text-stone-300">Auth Attempts</span>
                <span className="text-lg font-bold text-white">{activityLog.authAttempts.length}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Security Logs */}
        <Card className="bg-stone-900/60 border-stone-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Security Event Log
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadSecurityLogs}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={downloadLogs}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="destructive" size="sm" onClick={clearLogs}>
                Clear Logs
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {securityLogs.length === 0 ? (
              <p className="text-center text-stone-400 py-8">No security events recorded</p>
            ) : (
              securityLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-stone-800/50 border border-stone-700/50 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        log.type.includes('ALERT') || log.type.includes('SUSPICIOUS') 
                          ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                          : log.type.includes('ERROR')
                          ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30'
                          : 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                      }`}>
                        {log.type}
                      </span>
                      <span className="text-sm text-stone-300">{log.path || 'N/A'}</span>
                    </div>
                    <span className="text-xs text-stone-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {log.data && (
                    <pre className="text-xs text-stone-400 mt-2 overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}