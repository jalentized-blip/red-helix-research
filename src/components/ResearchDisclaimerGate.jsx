import React, { useState, useEffect } from 'react';
import AgeGate from '@/components/AgeGate';

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

export default function ResearchDisclaimerGate({ children }) {
  const [verified, setVerified] = useState(null); // null = loading

  useEffect(() => {
    setVerified(isVerified());
  }, []);

  if (verified === null) {
    // Loading - don't flash gate or content
    return null;
  }

  if (!verified) {
    return (
      <AgeGate
        onVerified={() => setVerified(true)}
      />
    );
  }

  return children;
}