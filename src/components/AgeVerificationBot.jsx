import React, { useEffect } from 'react';

const STORAGE_KEY = 'rhr_age_gate_v2';

function isVerified() {
  try {
    const record = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!record) return false;
    if (new Date(record.expiresAt) < new Date()) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Legacy wrapper — the full gate is now handled by ResearchDisclaimerGate in Layout.
// This component simply calls onVerify if already verified (backward compat).
export default function AgeVerificationBot({ isOpen, onVerify }) {
  useEffect(() => {
    if (isVerified()) {
      onVerify?.();
    }
  }, [onVerify]);

  // Gate is handled at the layout level — nothing to render here
  return null;
}