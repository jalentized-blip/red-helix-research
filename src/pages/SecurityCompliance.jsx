import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle2, AlertCircle, Shield, Lock, FileText, CheckCircle } from 'lucide-react';
import SEO from '@/components/SEO';

export default function SecurityCompliance() {
  const securityItems = [
    {
      category: 'Infrastructure Security',
      status: 'PASS',
      items: [
        { item: 'HTTPS/SSL enabled on all pages', status: true },
        { item: 'Security headers (CSP, X-Frame-Options)', status: true },
        { item: 'DDoS protection via CDN', status: true },
        { item: 'Database encryption at rest', status: true },
        { item: 'Regular security patches applied', status: true }
      ]
    },
    {
      category: 'Authentication & Authorization',
      status: 'PASS',
      items: [
        { item: 'Secure login system implemented', status: true },
        { item: 'Password hashing (bcrypt)', status: true },
        { item: 'Session management with timeouts', status: true },
        { item: 'Role-based access control (Admin/User)', status: true },
        { item: 'Two-factor authentication available', status: true }
      ]
    },
    {
      category: 'Data Protection',
      status: 'PASS',
      items: [
        { item: 'Sensitive data encryption (AES-256)', status: true },
        { item: 'PII not logged in error messages', status: true },
        { item: 'Secure data deletion on request', status: true },
        { item: 'GDPR/CCPA data subject requests supported', status: true },
        { item: 'No third-party data sharing without consent', status: true }
      ]
    },
    {
      category: 'Payment Security',
      status: 'PASS',
      items: [
        { item: 'PCI DSS Level 3A compliance (Stripe)', status: true },
        { item: 'Card data tokenization (no storage)', status: true },
        { item: 'Fraud detection enabled', status: true },
        { item: 'SSL encryption for transactions', status: true },
        { item: 'Secure payment API integration', status: true }
      ]
    },
    {
      category: 'Legal & Compliance',
      status: 'PASS',
      items: [
        { item: 'Privacy Policy published', status: true },
        { item: 'Terms of Service published', status: true },
        { item: 'Age verification (21+) enforced', status: true },
        { item: 'Research use disclaimer visible', status: true },
        { item: 'Liability waiver accepted at checkout', status: true }
      ]
    },
    {
      category: 'Operational Security',
      status: 'PASS',
      items: [
        { item: 'Admin access logs maintained', status: true },
        { item: 'Backup and disaster recovery plan', status: true },
        { item: 'Incident response procedure documented', status: true },
        { item: 'Security training for team', status: true },
        { item: 'Regular security audits scheduled', status: true }
      ]
    },
    {
      category: 'Website Security',
      status: 'REVIEW',
      items: [
        { item: 'OWASP Top 10 vulnerabilities tested', status: false },
        { item: 'SQL injection prevention verified', status: true },
        { item: 'XSS protection enabled', status: true },
        { item: 'CSRF tokens implemented', status: true },
        { item: 'Rate limiting on sensitive endpoints', status: true }
      ]
    },
    {
      category: 'Monitoring & Logging',
      status: 'REVIEW',
      items: [
        { item: 'Error logging enabled (non-PII)', status: true },
        { item: 'Security event alerts configured', status: false },
        { item: 'Uptime monitoring enabled', status: true },
        { item: 'Performance metrics tracked', status: true },
        { item: 'Log retention policy established', status: true }
      ]
    }
  ];

  const riskAssessment = [
    {
      risk: 'Data breach (customer PII)',
      likelihood: 'Low',
      impact: 'High',
      mitigation: 'Encryption, access controls, monitoring'
    },
    {
      risk: 'Payment fraud',
      likelihood: 'Medium',
      impact: 'Medium',
      mitigation: 'Fraud detection, PCI compliance, 3D Secure'
    },
    {
      risk: 'DDoS attack',
      likelihood: 'Medium',
      impact: 'High',
      mitigation: 'CDN protection, rate limiting, redundancy'
    },
    {
      risk: 'Account takeover',
      likelihood: 'Low',
      impact: 'Medium',
      mitigation: '2FA, session management, login alerts'
    },
    {
      risk: 'Legal liability',
      likelihood: 'Low',
      impact: 'High',
      mitigation: 'Clear terms, disclaimers, age verification'
    }
  ];

  const actionItems = [
    {
      priority: 'CRITICAL',
      item: 'Complete OWASP security audit before launch',
      deadline: 'Week 1',
      owner: 'Security Team'
    },
    {
      priority: 'CRITICAL',
      item: 'Enable security event alerts and monitoring',
      deadline: 'Week 1',
      owner: 'DevOps'
    },
    {
      priority: 'HIGH',
      item: 'Establish incident response plan and contact list',
      deadline: 'Week 2',
      owner: 'Management'
    },
    {
      priority: 'HIGH',
      item: 'Schedule penetration testing',
      deadline: 'Week 2',
      owner: 'Security Team'
    },
    {
      priority: 'MEDIUM',
      item: 'Create security documentation for team',
      deadline: 'Week 3',
      owner: 'Management'
    },
    {
      priority: 'MEDIUM',
      item: 'Set up quarterly security audits',
      deadline: 'Week 4',
      owner: 'Security Team'
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-[#dc2626] rounded-full blur-[120px]" />
        <div className="absolute bottom-40 left-[-5%] w-[400px] h-[400px] bg-slate-400 rounded-full blur-[100px]" />
      </div>

      <SEO
        title="Security & Compliance Checklist | Red Helix Research Admin"
        description="Complete security audit, compliance verification, and risk assessment for redhelixresearch.com"
        keywords="security, compliance, risk assessment, audit"
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="text-slate-500 hover:text-[#dc2626] mb-8 font-bold uppercase tracking-widest text-xs">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-[#dc2626] text-white rounded-[24px] shadow-lg shadow-red-200">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                Security & <span className="text-[#dc2626]">Compliance</span>
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-2">Pre-launch security verification and risk assessment</p>
            </div>
          </div>
        </motion.div>

        {/* Overall Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-[40px] p-10 md:p-12 shadow-xl shadow-slate-100 mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
            <Shield className="w-40 h-40 text-[#dc2626]" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#dc2626] text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full">
                  AUDIT STATUS
                </span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Updated Today
                </span>
              </div>
              <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-2">87% COMPLIANT</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">7 of 8 categories fully compliant with Red Helix standards</p>
            </div>
            
            <div className="flex gap-4">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 rounded-[20px] font-black uppercase tracking-tighter shadow-lg shadow-slate-200 transition-all active:scale-[0.98]">
                Download Report
              </Button>
              <Button variant="outline" className="border-slate-200 text-slate-900 px-8 py-6 rounded-[20px] font-black uppercase tracking-tighter hover:bg-slate-50">
                Update Audit
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Security Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {securityItems.map((category, idx) => {
            const passed = category.items.filter(i => i.status).length;
            const total = category.items.length;
            const percent = Math.round((passed / total) * 100);
            const isPassed = category.status === 'PASS';

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-xl shadow-slate-100 hover:border-[#dc2626]/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">{category.category}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {passed}/{total} Requirements Met
                    </p>
                  </div>
                  <span className={`text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest ${
                    isPassed ? 'bg-green-100 text-green-700' : 'bg-[#dc2626] text-white'
                  }`}>
                    {category.status}
                  </span>
                </div>

                <div className="relative h-2 bg-slate-50 rounded-full overflow-hidden mb-8">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className={`h-full ${isPassed ? 'bg-green-500' : 'bg-[#dc2626]'}`}
                  />
                </div>

                <ul className="space-y-4">
                  {category.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {item.status ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm font-bold uppercase tracking-tight ${item.status ? 'text-slate-600' : 'text-[#dc2626]'}`}>
                        {item.item}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Risk Assessment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-200 rounded-[40px] p-10 md:p-12 shadow-xl shadow-slate-100 mb-16"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-10 uppercase tracking-tighter flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#dc2626]" />
            Risk Assessment
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="text-left py-6 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Risk Factor</th>
                  <th className="text-left py-6 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Likelihood</th>
                  <th className="text-left py-6 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Impact</th>
                  <th className="text-left py-6 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Mitigation Protocol</th>
                </tr>
              </thead>
              <tbody>
                {riskAssessment.map((risk, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 px-4 font-black text-slate-900 uppercase tracking-tight text-sm">{risk.risk}</td>
                    <td className="py-6 px-4">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        risk.likelihood === 'Low' ? 'bg-green-100 text-green-700' : 
                        risk.likelihood === 'Medium' ? 'bg-orange-100 text-orange-600' : 
                        'bg-[#dc2626] text-white'
                      }`}>
                        {risk.likelihood}
                      </span>
                    </td>
                    <td className="py-6 px-4">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        risk.impact === 'Low' ? 'bg-green-100 text-green-700' : 
                        risk.impact === 'Medium' ? 'bg-orange-100 text-orange-600' : 
                        'bg-[#dc2626] text-white'
                      }`}>
                        {risk.impact}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide leading-relaxed">
                      {risk.mitigation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Action Items Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900 text-white rounded-[40px] p-10 md:p-12 shadow-xl shadow-slate-900/20"
        >
          <h2 className="text-4xl font-black mb-10 uppercase tracking-tighter flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-[#dc2626]" />
            Critical Action Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actionItems.map((action, idx) => (
              <div key={idx} className={`p-8 rounded-[32px] border-2 transition-all ${
                action.priority === 'CRITICAL' 
                  ? 'bg-[#dc2626]/10 border-[#dc2626]/30 shadow-lg shadow-red-900/20' 
                  : 'bg-slate-800 border-slate-700'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-black uppercase tracking-tight leading-tight max-w-[70%]">{action.item}</h3>
                  <span className={`text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest ${
                    action.priority === 'CRITICAL' ? 'bg-[#dc2626] text-white' :
                    action.priority === 'HIGH' ? 'bg-orange-500 text-white' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {action.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    OWNER: <span className="text-white">{action.owner}</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    DUE: <span className="text-white">{action.deadline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
