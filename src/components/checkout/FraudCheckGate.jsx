/**
 * FraudCheckGate — runs at checkout and collects device/behavioral signals.
 * Calls fraudCheck backend function before allowing payment to proceed.
 * 
 * Usage: wrap the "pay" action. Call runFraudCheck() and only proceed if allowed.
 */

/**
 * Builds a browser device fingerprint hash from available signals.
 * Not 100% unique but consistent enough for fraud matching.
 */
export async function buildDeviceFingerprint() {
  try {
    const signals = [
      navigator.userAgent,
      navigator.language,
      navigator.hardwareConcurrency,
      navigator.deviceMemory || 0,
      screen.width,
      screen.height,
      screen.colorDepth,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.platform,
      new Date().getTimezoneOffset(),
    ].join('|');

    // Use SubtleCrypto to hash
    const encoder = new TextEncoder();
    const data = encoder.encode(signals);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
  } catch {
    // Fallback fingerprint
    return [navigator.userAgent.slice(0, 20), screen.width, screen.height].join('-');
  }
}

/**
 * Track session info from localStorage (set on first page visit).
 */
export function getSessionInfo() {
  const sessionStart = parseInt(localStorage.getItem('rhr_session_start') || '0', 10);
  const pagesVisited = parseInt(localStorage.getItem('rhr_pages_visited') || '1', 10);
  const now = Date.now();

  if (!sessionStart) {
    localStorage.setItem('rhr_session_start', String(now));
  }

  return {
    sessionDurationSeconds: sessionStart ? Math.round((now - sessionStart) / 1000) : 0,
    pagesVisited,
  };
}

/**
 * Main fraud check runner. Call before finalizing any payment.
 * Returns { allowed, riskLevel, riskScore, blocked, blockReason, requiresReview }
 */
export async function runFraudCheck({ base44, orderNumber, orderAmount, paymentMethod, customerEmail, customerName, billingAddress, shippingAddress, consentTimestamp, consentVersion, noRefundPolicyAccepted, researchUseAccepted }) {
  const deviceFingerprint = await buildDeviceFingerprint();
  const { sessionDurationSeconds, pagesVisited } = getSessionInfo();

  const payload = {
    orderNumber,
    orderAmount,
    paymentMethod,
    customerEmail,
    customerName,
    billingAddress,
    shippingAddress,
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    deviceFingerprint,
    consentTimestamp: consentTimestamp || new Date().toISOString(),
    consentVersion: consentVersion || 'v2-2025-02',
    noRefundPolicyAccepted: noRefundPolicyAccepted || false,
    researchUseAccepted: researchUseAccepted || false,
    sessionDurationSeconds,
    pagesVisited,
  };

  const result = await base44.functions.invoke('fraudCheck', payload);
  const data = result?.data || result;

  return {
    allowed: data?.allowed !== false, // fail open
    blocked: data?.blocked || false,
    blockReason: data?.block_reason || null,
    riskLevel: data?.risk_level || 'low',
    riskScore: data?.risk_score || 0,
    riskFlags: data?.risk_flags || [],
    requiresReview: data?.requires_review || false,
  };
}