import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, FlaskConical, FileText, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

// ─── AUDIT TRAIL HELPERS ───
const STORAGE_KEY = 'rhr_age_gate_v2';
const AUDIT_KEY = 'rhr_age_audit_v2';

function appendAudit(entry) {
  try {
    const trail = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
    trail.push(entry);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(trail.slice(-50)));
  } catch {}
}

function logAuditEvent(action, metadata = {}) {
  appendAudit({
    action,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer || 'direct',
    ...metadata,
  });
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
  const exp = new Date(record.expiresAt).toUTCString();
  document.cookie = `rhr_age_v2=1; expires=${exp}; path=/; SameSite=Strict; Secure`;
  return record;
}

// ─── HIGH-SCRUTINY STATES ───
const HIGH_SCRUTINY_STATES = ['CA', 'NY', 'NJ', 'MA', 'OR', 'WA', 'CO', 'IL'];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const RESEARCHER_TYPES = [
  { value: 'academic', label: 'Academic Researcher', desc: 'University / College / Research Institute' },
  { value: 'independent', label: 'Independent Researcher', desc: 'Qualified independent scientific researcher' },
  { value: 'biotech', label: 'Biotech / Pharma', desc: 'Industry laboratory or biotech company' },
  { value: 'licensed_pro', label: 'Licensed Professional', desc: 'Licensed practitioner for research purposes' },
  { value: 'other', label: 'Other Research Purpose', desc: 'I confirm research-only use' },
];

// ─── MAIN COMPONENT ───
export default function AgeGate({ onVerified }) {
  const [stage, setStage] = useState(0); // 0 = age+DOB, 1 = research+compliance
  const [denied, setDenied] = useState(false);
  const [formData, setFormData] = useState({
    dobMonth: '', dobDay: '', dobYear: '',
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
    setTimeout(() => { window.location.href = 'https://www.google.com'; }, 3000);
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
    <div className="fixed inset-0 z-[9999] bg-slate-950/98 backdrop-blur-xl flex flex-col items-center justify-center p-4 overflow-y-auto">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-800 z-[10000]">
        <motion.div
          className="h-full bg-[#dc2626]"
          animate={{ width: `${((stage + 1) / 2) * 100}%` }}
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
          {stage === 0 && (
            <Stage1AgeDOB
              formData={formData}
              setFormData={setFormData}
              onDeny={handleDeny}
              computedAge={computedAge}
              onAdvance={() => {
                logAuditEvent('stage_completed', { stage: 0, stageName: 'age_dob' });
                setStage(1);
              }}
            />
          )}
          {stage === 1 && (
            <Stage2ResearchCompliance
              formData={formData}
              setFormData={setFormData}
              onDeny={handleDeny}
              onAdvance={() => {
                logAuditEvent('stage_completed', { stage: 1, stageName: 'research_compliance' });
                handleFinalVerification();
              }}
            />
          )}

          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold text-center mt-4 pb-4">
            PACT Act Compliant · FDA Research Product Disclosure · Audit Trail Active · Step {stage + 1} of 2
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── STAGE 1: AGE CONFIRMATION + DATE OF BIRTH ───
function Stage1AgeDOB({ formData, setFormData, onDeny, onAdvance, computedAge }) {
  const age = computedAge();
  const valid = age !== null && age >= 21 && formData.dobYear?.length === 4;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-br from-[#8B2635] to-[#6B1827] p-7 text-center">
        <ShieldCheck className="w-12 h-12 text-white mx-auto mb-3" />
        <p className="text-red-300 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Step 1 of 2</p>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Age Verification</h2>
        <p className="text-red-200 text-sm font-medium mt-1">You must be 21+ to access this site</p>
      </div>

      <div className="p-7 space-y-5">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            This site sells <strong>research-grade peptides for laboratory use only</strong>. Access is restricted to individuals <strong>21 years of age or older</strong>. We maintain a PACT Act–compliant audit log of all age verification attempts.
          </p>
        </div>

        {/* DOB Entry */}
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Enter your date of birth</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Month</label>
              <select
                value={formData.dobMonth}
                onChange={e => setFormData(f => ({ ...f, dobMonth: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-3 text-black font-bold text-sm focus:outline-none focus:border-[#8B2635]"
              >
                <option value="">Month</option>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Day</label>
              <select
                value={formData.dobDay}
                onChange={e => setFormData(f => ({ ...f, dobDay: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-3 text-black font-bold text-sm focus:outline-none focus:border-[#8B2635]"
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
                value={formData.dobYear}
                onChange={e => setFormData(f => ({ ...f, dobYear: e.target.value.slice(0, 4) }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-3 text-black font-bold text-sm focus:outline-none focus:border-[#8B2635]"
              />
            </div>
          </div>

          {age !== null && (
            <div className={`mt-3 rounded-xl p-3 text-sm font-bold flex items-center gap-2 ${age >= 21 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {age >= 21 ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {age >= 21 ? `Age verified: ${age} years old` : `Age ${age} does not meet the 21+ requirement`}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onDeny('under_21_self_reported')}
            className="px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-bold text-sm transition-all"
          >
            Exit
          </button>
          <button
            onClick={onAdvance}
            disabled={!valid}
            className="flex-1 flex items-center justify-between px-6 py-4 bg-black hover:bg-[#8B2635] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all group shadow-lg disabled:shadow-none"
          >
            <span>Continue</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          Your birth year is recorded in our compliance audit log per PACT Act requirements. We do not sell or share this data.
        </p>
      </div>
    </div>
  );
}

// ─── STAGE 2: RESEARCH QUALIFICATION + LEGAL COMPLIANCE ───
function Stage2ResearchCompliance({ formData, setFormData, onDeny, onAdvance }) {
  const allValid =
    !!formData.researcherType &&
    !!formData.stateCode &&
    formData.termsAccepted &&
    formData.fdaDisclosureAccepted &&
    formData.pactActAccepted &&
    formData.notForHumanUse;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-br from-[#8B2635] to-[#6B1827] p-7 text-center">
        <FlaskConical className="w-12 h-12 text-white mx-auto mb-3" />
        <p className="text-red-300 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Step 2 of 2</p>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Research & Compliance</h2>
        <p className="text-red-200 text-sm font-medium mt-1">FDA research classification · PACT Act disclosure</p>
      </div>

      <div className="p-7 space-y-5 max-h-[65vh] overflow-y-auto">
        {/* Researcher type */}
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">I am purchasing as a...</p>
          <div className="space-y-2">
            {RESEARCHER_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setFormData(f => ({ ...f, researcherType: t.value }))}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-all text-left ${
                  formData.researcherType === t.value
                    ? 'border-[#8B2635] bg-red-50'
                    : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${formData.researcherType === t.value ? 'border-[#8B2635] bg-[#8B2635]' : 'border-slate-300'}`} />
                <div>
                  <p className="text-sm font-black text-black">{t.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* State */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">State of Residence *</label>
          <select
            value={formData.stateCode}
            onChange={e => setFormData(f => ({ ...f, stateCode: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-black font-bold text-sm focus:outline-none focus:border-[#8B2635]"
          >
            <option value="">Select your state...</option>
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {HIGH_SCRUTINY_STATES.includes(formData.stateCode) && (
            <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 font-bold">Your state has enhanced regulatory oversight for research chemical purchases.</p>
            </div>
          )}
        </div>

        {/* Compliance checkboxes */}
        <div className="space-y-2">
          {[
            {
              key: 'notForHumanUse',
              label: 'I confirm all products are for LABORATORY RESEARCH USE ONLY — not for human consumption, self-administration, veterinary, or clinical use.',
            },
            {
              key: 'fdaDisclosureAccepted',
              label: 'I acknowledge these are research-grade compounds subject to FDA classification and I am purchasing in compliance with applicable federal regulations.',
            },
            {
              key: 'pactActAccepted',
              label: 'I understand Red Helix Research maintains PACT Act–compliant age verification audit logs that may be reviewed by regulatory bodies. I consent to this record.',
            },
            {
              key: 'termsAccepted',
              label: 'I agree to the Terms of Use, Privacy Policy, and Research Use Agreement. All information I provided is truthful and accurate.',
            },
          ].map(item => (
            <div
              key={item.key}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${formData[item.key] ? 'border-[#8B2635] bg-red-50' : 'border-slate-100 bg-slate-50 hover:border-slate-300'}`}
              onClick={() => setFormData(f => ({ ...f, [item.key]: !f[item.key] }))}
            >
              <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all ${formData[item.key] ? 'bg-[#8B2635] border-[#8B2635]' : 'border-slate-300 bg-white'}`}>
                {formData[item.key] && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Audit notice */}
        <div className="bg-black rounded-2xl p-4">
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            <span className="text-white font-black uppercase tracking-wide block mb-1">Audit Trail Notice</span>
            A compliance record including your timestamp, device fingerprint, stated age, researcher category, state, and consent is being recorded per PACT Act requirements.
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
            disabled={!allValid}
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