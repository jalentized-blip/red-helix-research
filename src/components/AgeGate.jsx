import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, FlaskConical, FileText, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

// ─── AUDIT TRAIL HELPERS ───
const STORAGE_KEY = 'rhr_age_gate_v2';
const AUDIT_KEY = 'rhr_age_audit_v2';

function getAuditTrail() {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
  } catch {
    return [];
  }
}

function appendAudit(entry) {
  const trail = getAuditTrail();
  trail.push(entry);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(trail.slice(-50))); // keep last 50 events
}

function logAuditEvent(action, metadata = {}) {
  const entry = {
    action,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer || 'direct',
    ...metadata
  };
  appendAudit(entry);
}

function getVerificationRecord() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function setVerificationRecord(data) {
  const record = {
    ...data,
    version: '2.0',
    site: 'redhelixresearch.com',
    verifiedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    sessionId: Math.random().toString(36).slice(2),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  // Also set a secure cookie
  const exp = new Date(record.expiresAt).toUTCString();
  document.cookie = `rhr_age_v2=1; expires=${exp}; path=/; SameSite=Strict; Secure`;
  return record;
}

function isVerified() {
  const record = getVerificationRecord();
  if (!record) return false;
  const expired = new Date(record.expiresAt) < new Date();
  if (expired) {
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
  return true;
}

// ─── STAGE DATA ───
const STAGES = [
  {
    id: 'age',
    title: 'Age Verification',
    subtitle: 'STAGE 1 OF 4',
    icon: ShieldCheck,
    color: 'from-slate-800 to-slate-900',
  },
  {
    id: 'dob',
    title: 'Date of Birth',
    subtitle: 'STAGE 2 OF 4',
    icon: FileText,
    color: 'from-slate-800 to-slate-900',
  },
  {
    id: 'researcher',
    title: 'Research Qualification',
    subtitle: 'STAGE 3 OF 4',
    icon: FlaskConical,
    color: 'from-slate-800 to-slate-900',
  },
  {
    id: 'compliance',
    title: 'Legal Compliance',
    subtitle: 'STAGE 4 OF 4',
    icon: FileText,
    color: 'from-slate-800 to-slate-900',
  },
];

// ─── RESTRICTED STATES (high-risk per PACT Act / FDA guidance) ───
const HIGH_SCRUTINY_STATES = ['CA', 'NY', 'NJ', 'MA', 'OR', 'WA', 'CO', 'IL'];

// ─── MAIN COMPONENT ───
export default function AgeGate({ onVerified }) {
  const [stage, setStage] = useState(0);
  const [denied, setDenied] = useState(false);
  const [formData, setFormData] = useState({
    ageConfirmed: false,
    dobMonth: '',
    dobDay: '',
    dobYear: '',
    researcherType: '',
    institutionName: '',
    stateCode: '',
    termsAccepted: false,
    fdaDisclosureAccepted: false,
    pactActAccepted: false,
    notForHumanUse: false,
  });

  useEffect(() => {
    logAuditEvent('gate_displayed', { stage: 0 });
  }, []);

  const computedAge = () => {
    const { dobMonth, dobDay, dobYear } = formData;
    if (!dobMonth || !dobDay || !dobYear || dobYear.length < 4) return null;
    const dob = new Date(Number(dobYear), Number(dobMonth) - 1, Number(dobDay));
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };

  const handleDeny = (reason) => {
    logAuditEvent('access_denied', { reason, stage });
    setDenied(true);
    // Hard redirect after brief delay
    setTimeout(() => {
      window.location.href = 'https://www.google.com';
    }, 3000);
  };

  const advanceStage = () => {
    const nextStage = stage + 1;
    logAuditEvent('stage_completed', { stage, stageName: STAGES[stage].id });
    if (nextStage >= STAGES.length) {
      handleFinalVerification();
    } else {
      setStage(nextStage);
    }
  };

  const handleFinalVerification = () => {
    const record = setVerificationRecord({
      ageConfirmed: true,
      dobYear: formData.dobYear,
      researcherType: formData.researcherType,
      institutionName: formData.institutionName,
      stateCode: formData.stateCode,
      highScrutinyState: HIGH_SCRUTINY_STATES.includes(formData.stateCode),
      termsAccepted: formData.termsAccepted,
      fdaDisclosureAccepted: formData.fdaDisclosureAccepted,
      pactActAccepted: formData.pactActAccepted,
    });
    logAuditEvent('verification_complete', { sessionId: record.sessionId, researcherType: formData.researcherType });
    // Legacy keys for backward compat
    localStorage.setItem('ageVerified', 'true');
    localStorage.setItem('research_disclaimer_agreed', 'true');
    onVerified?.();
  };

  if (denied) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Access Denied</h2>
          <p className="text-slate-400 font-medium mb-2">You do not meet the requirements to access this site.</p>
          <p className="text-slate-500 text-sm">Redirecting you away from this site...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/98 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-800 z-[10000]">
        <motion.div
          className="h-full bg-[#dc2626]"
          animate={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg"
        >
          {stage === 0 && <Stage1Age formData={formData} setFormData={setFormData} onDeny={handleDeny} onAdvance={advanceStage} />}
          {stage === 1 && <Stage2DOB formData={formData} setFormData={setFormData} onDeny={handleDeny} onAdvance={advanceStage} computedAge={computedAge} />}
          {stage === 2 && <Stage3Researcher formData={formData} setFormData={setFormData} onAdvance={advanceStage} />}
          {stage === 3 && <Stage4Compliance formData={formData} setFormData={setFormData} onDeny={handleDeny} onAdvance={advanceStage} />}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
          PACT Act Compliant · FDA Research Product Disclosure · Audit Trail Active · Stage {stage + 1} of {STAGES.length}
        </p>
      </div>
    </div>
  );
}

// ─── STAGE 1: AGE CONFIRMATION ───
function Stage1Age({ formData, setFormData, onDeny, onAdvance }) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-br from-[#8B2635] to-[#6B1827] p-8 text-center">
        <ShieldCheck className="w-14 h-14 text-white mx-auto mb-3" />
        <p className="text-red-300 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Stage 1 of 4</p>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Age Verification</h2>
        <p className="text-red-200 text-sm font-medium mt-2">Mandatory federal compliance checkpoint</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-amber-800 uppercase tracking-wide mb-1">Federal Compliance Notice</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                This site sells <strong>research-grade peptides</strong> regulated under FDA guidelines. Access is restricted to individuals <strong>21 years of age or older</strong> who are qualified researchers. Pursuant to PACT Act enforcement protocols, we maintain complete audit logs of all access verification.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-black text-slate-700 uppercase tracking-wide">Confirm your age:</p>
          <button
            onClick={() => { setFormData(f => ({ ...f, ageConfirmed: true })); onAdvance(); }}
            className="w-full flex items-center justify-between px-6 py-5 bg-slate-900 hover:bg-[#8B2635] text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all group shadow-lg"
          >
            <span>I am 21 years of age or older</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onDeny('under_21_self_reported')}
            className="w-full px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-bold text-sm transition-all"
          >
            I am under 21 years old
          </button>
        </div>

        <p className="text-[10px] text-slate-400 text-center font-medium leading-relaxed">
          By proceeding, you consent to age verification data collection for regulatory compliance purposes. Your verification record is stored locally per PACT Act audit requirements.
        </p>
      </div>
    </div>
  );
}

// ─── STAGE 2: DATE OF BIRTH ───
function Stage2DOB({ formData, setFormData, onDeny, onAdvance, computedAge }) {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const age = computedAge();
  const valid = age !== null && age >= 21 && formData.dobYear?.length === 4;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-br from-[#8B2635] to-[#6B1827] p-8 text-center">
        <FileText className="w-14 h-14 text-white mx-auto mb-3" />
        <p className="text-red-300 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Stage 2 of 4</p>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Date of Birth</h2>
        <p className="text-red-200 text-sm font-medium mt-2">Required for audit trail compliance</p>
      </div>

      <div className="p-8 space-y-6">
        <p className="text-sm font-bold text-slate-600">Enter your date of birth for verification record:</p>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Month</label>
            <select
              value={formData.dobMonth}
              onChange={e => setFormData(f => ({ ...f, dobMonth: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-[#8B2635]"
            >
              <option value="">Month</option>
              {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Day</label>
            <select
              value={formData.dobDay}
              onChange={e => setFormData(f => ({ ...f, dobDay: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-[#8B2635]"
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Year</label>
            <input
              type="number"
              placeholder="YYYY"
              maxLength={4}
              value={formData.dobYear}
              onChange={e => setFormData(f => ({ ...f, dobYear: e.target.value.slice(0, 4) }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-[#8B2635]"
            />
          </div>
        </div>

        {age !== null && (
          <div className={`rounded-xl p-3 text-sm font-bold flex items-center gap-2 ${age >= 21 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {age >= 21 ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {age >= 21 ? `Age verified: ${age} years old` : `Age ${age} does not meet the 21+ requirement`}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => onDeny('dob_underage')}
            className="px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-bold text-sm transition-all"
          >
            Exit
          </button>
          <button
            onClick={onAdvance}
            disabled={!valid}
            className="flex-1 flex items-center justify-between px-6 py-4 bg-slate-900 hover:bg-[#8B2635] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all group shadow-lg"
          >
            <span>Continue</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-[10px] text-slate-400 text-center">
          Your birth year is recorded in our compliance audit log. We do not sell or share this data.
        </p>
      </div>
    </div>
  );
}

// ─── STAGE 3: RESEARCHER QUALIFICATION ───
function Stage3Researcher({ formData, setFormData, onAdvance }) {
  const types = [
    { value: 'academic', label: 'Academic Researcher', desc: 'University / College / Research Institute' },
    { value: 'independent', label: 'Independent Researcher', desc: 'Qualified independent scientific researcher' },
    { value: 'biotech', label: 'Biotech / Pharma', desc: 'Industry laboratory or biotech company' },
    { value: 'licensed_pro', label: 'Licensed Professional', desc: 'Licensed practitioner for research purposes' },
    { value: 'other', label: 'Other Research Purpose', desc: 'I confirm research-only use' },
  ];

  const valid = !!formData.researcherType;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-br from-[#8B2635] to-[#6B1827] p-8 text-center">
        <FlaskConical className="w-14 h-14 text-white mx-auto mb-3" />
        <p className="text-red-300 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Stage 3 of 4</p>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Research Qualification</h2>
        <p className="text-red-200 text-sm font-medium mt-2">FDA research product classification compliance</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-xs text-blue-800 font-bold leading-relaxed">
            Per FDA regulations, research-grade peptides may only be purchased by qualified researchers for <strong>non-clinical, non-human laboratory research</strong>. Select your research category below.
          </p>
        </div>

        <div className="space-y-2">
          {types.map(t => (
            <button
              key={t.value}
              onClick={() => setFormData(f => ({ ...f, researcherType: t.value }))}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all text-left ${
                formData.researcherType === t.value
                  ? 'border-[#8B2635] bg-red-50'
                  : 'border-slate-100 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${formData.researcherType === t.value ? 'border-[#8B2635] bg-[#8B2635]' : 'border-slate-300'}`} />
              <div>
                <p className="text-sm font-black text-slate-900">{t.label}</p>
                <p className="text-[10px] text-slate-500 font-medium">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Institution / Organization (Optional)</label>
          <input
            type="text"
            placeholder="e.g. MIT, LabCorp, Independent"
            value={formData.institutionName}
            onChange={e => setFormData(f => ({ ...f, institutionName: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium text-sm focus:outline-none focus:border-[#8B2635]"
          />
        </div>

        <button
          onClick={onAdvance}
          disabled={!valid}
          className="w-full flex items-center justify-between px-6 py-5 bg-slate-900 hover:bg-[#8B2635] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all group shadow-lg"
        >
          <span>Continue</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

// ─── STAGE 4: LEGAL COMPLIANCE ───
function Stage4Compliance({ formData, setFormData, onDeny, onAdvance }) {
  const states = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
  ];

  const allChecked = formData.termsAccepted && formData.fdaDisclosureAccepted && formData.pactActAccepted && formData.notForHumanUse && formData.stateCode;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-br from-[#8B2635] to-[#6B1827] p-8 text-center">
        <FileText className="w-14 h-14 text-white mx-auto mb-3" />
        <p className="text-red-300 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Stage 4 of 4</p>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Legal Compliance</h2>
        <p className="text-red-200 text-sm font-medium mt-2">PACT Act · FDA · State-level verification</p>
      </div>

      <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto">
        {/* State selection */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Your State of Residence *</label>
          <select
            value={formData.stateCode}
            onChange={e => setFormData(f => ({ ...f, stateCode: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-[#8B2635]"
          >
            <option value="">Select your state...</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {HIGH_SCRUTINY_STATES.includes(formData.stateCode) && (
            <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 font-bold">Your state has enhanced regulatory oversight for research chemical purchases. Additional verification may be required for your order.</p>
            </div>
          )}
        </div>

        {/* Compliance checkboxes */}
        <div className="space-y-3">
          {[
            {
              key: 'notForHumanUse',
              label: 'I understand and agree that ALL products on this site are for LABORATORY AND SCIENTIFIC RESEARCH USE ONLY — not for human consumption, self-administration, veterinary use, or any clinical purpose.'
            },
            {
              key: 'fdaDisclosureAccepted',
              label: 'I acknowledge that these are research-grade compounds subject to FDA classification guidelines and I am purchasing in compliance with applicable federal regulations.'
            },
            {
              key: 'pactActAccepted',
              label: 'I understand that under PACT Act enforcement protocols, Red Helix Research maintains age verification audit logs and may be required to report to regulatory bodies. I consent to this compliance record.'
            },
            {
              key: 'termsAccepted',
              label: 'I agree to the Terms of Use, Privacy Policy, and Research Use Agreement. I confirm all information provided is truthful and accurate.'
            },
          ].map(item => (
            <div
              key={item.key}
              className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData[item.key] ? 'border-[#8B2635] bg-red-50' : 'border-slate-100 bg-slate-50 hover:border-slate-300'}`}
              onClick={() => setFormData(f => ({ ...f, [item.key]: !f[item.key] }))}
            >
              <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all ${formData[item.key] ? 'bg-[#8B2635] border-[#8B2635]' : 'border-slate-300 bg-white'}`}>
                {formData[item.key] && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Final compliance warning */}
        <div className="bg-slate-900 rounded-2xl p-5">
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            <span className="text-white font-black uppercase tracking-wide block mb-2">Audit Trail Notice</span>
            A tamper-evident compliance record including your timestamp, device fingerprint, stated age, researcher category, state, and consent to all disclosures is being recorded. This record complies with PACT Act age verification requirements and may be reviewed in the event of a regulatory inquiry.
          </p>
        </div>

        <div className="flex gap-3 pb-2">
          <button
            onClick={() => onDeny('compliance_declined')}
            className="px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-bold text-sm transition-all"
          >
            Decline
          </button>
          <button
            onClick={onAdvance}
            disabled={!allChecked}
            className="flex-1 flex items-center justify-between px-6 py-4 bg-[#8B2635] hover:bg-[#6B1827] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all group shadow-lg disabled:shadow-none"
          >
            <span>Enter Site</span>
            <ShieldCheck className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}