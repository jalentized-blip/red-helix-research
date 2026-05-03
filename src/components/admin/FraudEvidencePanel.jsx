import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Shield, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Download, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const RISK_COLORS = {
  low: 'bg-green-50 border-green-200 text-green-700',
  medium: 'bg-amber-50 border-amber-200 text-amber-700',
  high: 'bg-orange-50 border-orange-200 text-orange-700',
  critical: 'bg-red-50 border-red-200 text-red-700',
};

const RISK_ICONS = {
  low: CheckCircle,
  medium: AlertTriangle,
  high: AlertTriangle,
  critical: XCircle,
};

function FraudFlag({ flag }) {
  const labels = {
    DISPOSABLE_EMAIL: '📧 Disposable Email',
    VPN_OR_PROXY_IP: '🔒 VPN/Proxy IP',
    IP_COUNTRY_MISMATCH: '🌍 IP Country Mismatch',
    MULTI_ACCOUNT_SAME_DEVICE: '🖥 Multi-Account Device',
    PRIOR_CHARGEBACK_HISTORY: '⚠️ Prior Chargebacks',
    HIGH_VELOCITY: '⚡ High Velocity Orders',
    NEW_ACCOUNT_HIGH_VALUE: '🆕 New Acct + High Value',
    FIRST_ORDER_HIGH_VALUE: '📦 First Order High Value',
    FREIGHT_FORWARDER: '📮 Freight Forwarder',
    PO_BOX_SHIPPING: '📫 PO Box Shipping',
    HIGH_RISK_STATE: '🗺 High-Risk State',
    BILLING_SHIPPING_MISMATCH: '📍 Billing/Ship Mismatch',
    NO_REFUND_POLICY_NOT_ACKNOWLEDGED: '📝 No Policy Consent',
  };

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide bg-red-50 border border-red-200 text-red-700">
      {labels[flag] || flag.replace(/_/g, ' ')}
    </span>
  );
}

export default function FraudEvidencePanel({ orderNumber }) {
  const [expanded, setExpanded] = useState(false);
  const [showRawEvidence, setShowRawEvidence] = useState(false);

  const { data: evidenceList = [] } = useQuery({
    queryKey: ['fraud-evidence', orderNumber],
    queryFn: () => base44.entities.OrderFraudEvidence.filter({ order_number: orderNumber }),
    enabled: !!orderNumber,
  });

  const evidence = evidenceList[0];

  if (!evidence) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center gap-3">
        <Shield className="w-4 h-4 text-slate-300" />
        <p className="text-xs text-slate-400 font-medium">No fraud evidence record for this order.</p>
      </div>
    );
  }

  const RiskIcon = RISK_ICONS[evidence.risk_level] || Shield;
  const riskColorClass = RISK_COLORS[evidence.risk_level] || RISK_COLORS.low;

  const downloadEvidence = () => {
    const blob = new Blob([evidence.raw_evidence_json || JSON.stringify(evidence, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fraud-evidence-${orderNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-2">
      {/* Summary bar */}
      <div className={`rounded-xl border-2 p-4 cursor-pointer ${riskColorClass}`} onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <RiskIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-tight">
                Risk Score: {evidence.risk_score}/100 — {evidence.risk_level?.toUpperCase()}
              </p>
              <p className="text-[10px] font-bold opacity-70 break-words">
                {evidence.risk_flags?.length || 0} signal{evidence.risk_flags?.length !== 1 ? 's' : ''} detected
                {evidence.ip_address ? ` · IP: ${evidence.ip_address}` : ''}
                {evidence.ip_city ? ` (${evidence.ip_city}, ${evidence.ip_country})` : ''}
                {evidence.ip_is_vpn ? ' · ⚠️ VPN' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); downloadEvidence(); }}
              className="border-current/30 text-current text-[10px] h-7 px-2 gap-1">
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">Evidence</span>
            </Button>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          {/* Flags */}
          {evidence.risk_flags?.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Risk Flags</p>
              <div className="flex flex-wrap gap-1.5">
                {evidence.risk_flags.map(f => <FraudFlag key={f} flag={f} />)}
              </div>
            </div>
          )}

          {/* Device & IP */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">IP Address</p>
              <p className="text-xs font-bold text-slate-900">{evidence.ip_address || '—'}</p>
              <p className="text-[10px] text-slate-500">{evidence.ip_city}, {evidence.ip_country}</p>
              {evidence.ip_is_vpn && <p className="text-[10px] text-red-600 font-bold">⚠️ VPN/Proxy</p>}
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Device</p>
              <p className="text-[10px] font-mono text-slate-700 break-all leading-tight">{evidence.device_fingerprint?.slice(0, 16) || '—'}…</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{evidence.screen_resolution} · {evidence.timezone}</p>
            </div>
          </div>

          {/* Consent */}
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Consent Record</p>
            <div className="flex flex-wrap gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${evidence.no_refund_policy_accepted ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {evidence.no_refund_policy_accepted ? '✓ No-Refund Policy Accepted' : '✗ No-Refund Policy NOT Accepted'}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${evidence.research_use_accepted ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                {evidence.research_use_accepted ? '✓ Research Use Accepted' : '— Research Use Not Logged'}
              </span>
            </div>
            {evidence.consent_timestamp && (
              <p className="text-[10px] text-slate-400 mt-1.5">
                Consent at: {format(new Date(evidence.consent_timestamp), 'MMM dd, yyyy h:mm:ss a')} · v{evidence.consent_version}
              </p>
            )}
          </div>

          {/* History */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-xl font-black text-slate-900">{evidence.prior_orders_count ?? 0}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prior Orders</p>
            </div>
            <div className={`rounded-lg p-2 ${(evidence.prior_chargebacks_count ?? 0) > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
              <p className={`text-xl font-black ${(evidence.prior_chargebacks_count ?? 0) > 0 ? 'text-red-700' : 'text-slate-900'}`}>
                {evidence.prior_chargebacks_count ?? 0}
              </p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prior Flags</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-xl font-black text-slate-900">{evidence.session_duration_seconds ?? 0}s</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Session</p>
            </div>
          </div>

          {/* View raw evidence for disputes */}
          <button
            onClick={() => setShowRawEvidence(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:border-[#dc2626] hover:text-[#dc2626] transition-all"
          >
            <Eye className="w-3.5 h-3.5" /> View Full Evidence (for dispute submission)
          </button>
        </div>
      )}

      {/* Raw JSON dialog for chargeback disputes */}
      <Dialog open={showRawEvidence} onOpenChange={setShowRawEvidence}>
        <DialogContent className="bg-white border-slate-200 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-black">Chargeback Dispute Evidence — {orderNumber}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-slate-500 mb-3">Copy this JSON evidence when submitting a chargeback dispute. It contains IP, device fingerprint, consent record, and risk analysis.</p>
          <pre className="bg-slate-900 text-green-400 text-xs rounded-xl p-4 overflow-auto max-h-96 whitespace-pre-wrap leading-relaxed">
            {evidence.raw_evidence_json
              ? JSON.stringify(JSON.parse(evidence.raw_evidence_json), null, 2)
              : JSON.stringify(evidence, null, 2)}
          </pre>
          <div className="flex gap-3 mt-3">
            <Button onClick={downloadEvidence} className="flex-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold">
              <Download className="w-4 h-4 mr-2" /> Download Evidence JSON
            </Button>
            <Button onClick={() => {
              navigator.clipboard.writeText(evidence.raw_evidence_json || JSON.stringify(evidence, null, 2));
            }} variant="outline" className="border-slate-200">
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}