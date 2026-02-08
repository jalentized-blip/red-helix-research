import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Activity, AlertTriangle, Lock, Eye, Download, RefreshCw, ArrowLeft } from 'lucide-react';
import { useZeroTrust } from '@/components/security/ZeroTrustProvider';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length;
  const highAnomalies = anomalies.filter(a => a.severity === 'high').length;

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-red-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-40 left-[-5%] w-[400px] h-[400px] bg-slate-400 rounded-full blur-[100px]" />
      </div>

      <SEO 
        title="Security Dashboard - Zero Trust Monitoring"
        description="Real-time security monitoring and zero trust architecture dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="text-slate-500 hover:text-red-600 mb-8 font-bold uppercase tracking-widest text-xs">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-red-600 text-white rounded-[24px] shadow-lg shadow-red-200">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                Zero Trust <span className="text-red-600">Security</span>
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-2">Real-time monitoring & threat detection</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-slate-200 rounded-[32px] p-8 shadow-xl shadow-slate-100 border-b-4 border-b-blue-500">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-6 h-6 text-blue-500" />
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{trustScore}</span>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Trust Score</p>
          </Card>

          <Card className="bg-white border-slate-200 rounded-[32px] p-8 shadow-xl shadow-slate-100 border-b-4 border-b-red-600">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{criticalAnomalies}</span>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Critical Alerts</p>
          </Card>

          <Card className="bg-white border-slate-200 rounded-[32px] p-8 shadow-xl shadow-slate-100 border-b-4 border-b-orange-500">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{highAnomalies}</span>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">High Priority</p>
          </Card>

          <Card className="bg-white border-slate-200 rounded-[32px] p-8 shadow-xl shadow-slate-100 border-b-4 border-b-green-500">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-6 h-6 text-green-500" />
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{securityLogs.length}</span>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Events</p>
          </Card>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white border-slate-200 rounded-[40px] p-10 shadow-xl shadow-slate-100">
            <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter flex items-center gap-3">
              <Lock className="w-6 h-6 text-red-600" />
              Active Protection
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Continuous Session Validation', status: 'Active' },
                { label: 'Anomaly Detection', status: 'Active' },
                { label: 'Real-time Monitoring', status: 'Active' },
                { label: 'Rate Limiting', status: 'Active' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-[20px]">
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{item.label}</span>
                  <span className="text-[10px] font-black bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-widest">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-white border-slate-200 rounded-[40px] p-10 shadow-xl shadow-slate-100">
            <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter flex items-center gap-3">
              <Activity className="w-6 h-6 text-red-600" />
              Activity Summary
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Page Views (Recent)', value: activityLog.pageChanges.length },
                { label: 'API Calls (Recent)', value: activityLog.apiCalls.length },
                { label: 'Auth Attempts', value: activityLog.authAttempts.length }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-[20px]">
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{item.label}</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Security Logs */}
        <Card className="bg-white border-slate-200 rounded-[40px] p-10 shadow-xl shadow-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
              <Shield className="w-6 h-6 text-red-600" />
              Security Event Log
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadSecurityLogs}
                className="rounded-full border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadLogs}
                className="rounded-full border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50"
              >
                <Download className="w-3 h-3 mr-2" />
                Export
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={clearLogs}
                className="rounded-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[10px]"
              >
                Clear Logs
              </Button>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {securityLogs.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[32px]">
                <Shield className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No security events recorded</p>
              </div>
            ) : (
              securityLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-white border border-slate-100 rounded-[24px] hover:border-red-600/30 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        log.type.includes('ALERT') || log.type.includes('SUSPICIOUS') 
                          ? 'bg-red-100 text-red-600'
                          : log.type.includes('ERROR')
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {log.type}
                      </span>
                      <span className="text-xs font-bold text-slate-400 font-mono">{log.path || 'N/A'}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {log.data && (
                    <div className="bg-slate-900 rounded-[16px] p-4 mt-3">
                      <pre className="text-[10px] text-slate-300 overflow-x-auto font-mono leading-relaxed">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </div>
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
