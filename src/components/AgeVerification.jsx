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

// Legacy component — gate is handled by ResearchDisclaimerGate/AgeGate in Layout.
export default function AgeVerification({ isOpen, onVerify }) {
  useEffect(() => {
    if (isVerified()) {
      onVerify?.();
    }
  }, [onVerify]);

  return null;
}