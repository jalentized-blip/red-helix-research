import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Peptide-industry fraud detection & chargeback evidence collection
 * Runs at checkout for ALL payment methods.
 *
 * Risk signals based on industry research:
 * - IP geolocation vs billing country mismatch
 * - VPN/proxy/Tor detection
 * - Velocity checks (multiple orders same email/IP/device)
 * - High-risk billing states (NY, CA, FL top chargeback states)
 * - First-time buyer + high order value
 * - Billing/shipping address mismatch
 * - Freight forwarder / PO Box shipping
 * - New account age
 * - Disposable email detection
 * - Prior chargeback/failed payment history
 *
 * Also logs a complete evidence record per order for dispute submission.
 */

// NOTE: High-risk state flag removed — NY/CA/FL/TX/NJ have too many legitimate customers.
const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com', 'tempmail.com', 'guerrillamail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'spam4.me', 'trashmail.com', 'dispostable.com', 'maildrop.cc',
  'temp-mail.org', 'fakeinbox.com', 'mytemp.email', '10minutemail.com',
  'tempinbox.com', 'getairmail.com', 'mailnull.com', 'spamgourmet.com',
];
const PO_BOX_PATTERNS = /\b(p\.?o\.?\s*box|post\s*office\s*box)\b/i;
const FREIGHT_FORWARDER_PATTERNS = [
  /\bfreight\b/i, /\bforwarder\b/i, /\bpackage\s*forwarder\b/i,
  /\breshipping\b/i, /\bship\s*2\b/i, /\bmailboxes\s*etc\b/i,
];

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      orderNumber,
      orderAmount,
      paymentMethod,
      customerEmail,
      customerName,
      billingAddress,
      shippingAddress,
      userAgent,
      screenResolution,
      timezone,
      language,
      deviceFingerprint,
      consentTimestamp,
      consentVersion,
      noRefundPolicyAccepted,
      researchUseAccepted,
      sessionDurationSeconds,
      pagesVisited,
    } = body;

    // ─── 1. Resolve IP from request headers ───
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';

    // ─── 2. Geo-IP lookup (free ipapi.co) ───
    let ipData = { country: '', city: '', isp: '', is_proxy: false, is_hosting: false };
    if (ip && ip !== 'unknown') {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
          headers: { 'User-Agent': 'RedHelixResearch/1.0' }
        });
        if (geoRes.ok) {
          const geo = await geoRes.json();
          ipData = {
            country: geo.country_code || '',
            city: geo.city || '',
            isp: geo.org || '',
            is_proxy: geo.proxy || false,
            is_hosting: geo.hosting || false,
          };
        }
      } catch (e) {
        console.warn('IP geo lookup failed:', e.message);
      }
    }

    // ─── 3. Gather prior order history ───
    const [priorOrders, priorFraudAlerts] = await Promise.all([
      base44.asServiceRole.entities.Order.filter({ customer_email: customerEmail }).catch(() => []),
      base44.asServiceRole.entities.OrderFraudEvidence.filter({ customer_email: customerEmail }).catch(() => []),
    ]);

    const completedPriorOrders = (priorOrders || []).filter(o =>
      o.order_number !== orderNumber &&
      ['processing', 'shipped', 'delivered'].includes(o.status)
    );
    const chargebackFlags = (priorFraudAlerts || []).filter(e =>
      e.risk_level === 'critical' || e.risk_level === 'high'
    );

    // ─── 4. Check for same device/IP ordering under different emails ───
    let sameDeviceOtherEmails = 0;
    if (deviceFingerprint) {
      const deviceMatches = await base44.asServiceRole.entities.OrderFraudEvidence
        .filter({ device_fingerprint: deviceFingerprint }).catch(() => []);
      sameDeviceOtherEmails = (deviceMatches || []).filter(e =>
        e.customer_email !== customerEmail
      ).length;
    }

    // ─── 5. Velocity checks (orders in last 24h from same email) ───
    const recentOrders = (priorOrders || []).filter(o => {
      const created = new Date(o.created_date).getTime();
      return Date.now() - created < 24 * 60 * 60 * 1000;
    });

    // ─── 6. Build risk flags ───
    const riskFlags = [];

    // Email signals
    const emailDomain = customerEmail?.split('@')[1]?.toLowerCase() || '';
    if (DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain)) {
      riskFlags.push('DISPOSABLE_EMAIL');
    }

    // VPN/Proxy
    if (ipData.is_proxy || ipData.is_hosting) {
      riskFlags.push('VPN_OR_PROXY_IP');
    }

    // IP country vs billing country mismatch
    const billingCountry = (billingAddress?.country || 'US').toUpperCase().replace('USA', 'US');
    const ipCountry = (ipData.country || '').toUpperCase();
    if (ipCountry && billingCountry && ipCountry !== billingCountry && ipCountry !== 'US') {
      riskFlags.push('IP_COUNTRY_MISMATCH');
    }

    // PO Box shipping
    const shippingAddr = shippingAddress?.address || '';
    if (PO_BOX_PATTERNS.test(shippingAddr)) {
      riskFlags.push('PO_BOX_SHIPPING');
    }

    // Freight forwarder shipping
    if (FREIGHT_FORWARDER_PATTERNS.some(p => p.test(shippingAddr))) {
      riskFlags.push('FREIGHT_FORWARDER');
    }

    // Billing ≠ Shipping address (different ZIP or state)
    const billingZip = (billingAddress?.zip || '').trim();
    const shippingZip = (shippingAddress?.zip || '').trim();
    const billingShippingMatch = billingZip === shippingZip || billingZip === '';
    if (!billingShippingMatch && billingZip && shippingZip) {
      riskFlags.push('BILLING_SHIPPING_MISMATCH');
    }

    // New account + very high value (>$400) — raised threshold to avoid flagging normal first orders
    const accountAgeDays = (Date.now() - new Date(user.created_date).getTime()) / (1000 * 60 * 60 * 24);
    if (accountAgeDays < 7 && orderAmount > 400) {
      riskFlags.push('NEW_ACCOUNT_HIGH_VALUE');
    }

    // First time buyer + very high value (>$500) — gifts/bulk orders are normal
    if (completedPriorOrders.length === 0 && orderAmount > 500) {
      riskFlags.push('FIRST_ORDER_HIGH_VALUE');
    }

    // Velocity — multiple orders same email in 24h
    if (recentOrders.length >= 3) {
      riskFlags.push('HIGH_VELOCITY');
    }

    // Prior chargeback history
    if (chargebackFlags.length > 0) {
      riskFlags.push('PRIOR_CHARGEBACK_HISTORY');
    }

    // Same device, different emails — requires 3+ to reduce family/shared device false positives
    if (sameDeviceOtherEmails >= 3) {
      riskFlags.push('MULTI_ACCOUNT_SAME_DEVICE');
    }

    // No consent given
    if (!noRefundPolicyAccepted) {
      riskFlags.push('NO_REFUND_POLICY_NOT_ACKNOWLEDGED');
    }

    // ─── 7. Calculate risk score ───
    const RISK_WEIGHTS = {
      DISPOSABLE_EMAIL: 35,
      VPN_OR_PROXY_IP: 20,       // lowered — many legit users use VPNs
      IP_COUNTRY_MISMATCH: 15,   // lowered — VPN users, travelers
      MULTI_ACCOUNT_SAME_DEVICE: 30,
      PRIOR_CHARGEBACK_HISTORY: 45,
      HIGH_VELOCITY: 20,
      NEW_ACCOUNT_HIGH_VALUE: 15,
      FIRST_ORDER_HIGH_VALUE: 8,
      FREIGHT_FORWARDER: 20,
      PO_BOX_SHIPPING: 8,        // lowered — many rural customers use PO boxes
      BILLING_SHIPPING_MISMATCH: 5, // lowered — gift orders are common
      NO_REFUND_POLICY_NOT_ACKNOWLEDGED: 10,
    };

    const rawScore = riskFlags.reduce((sum, flag) => sum + (RISK_WEIGHTS[flag] || 5), 0);
    const riskScore = Math.min(rawScore, 100);
    const riskLevel = riskScore >= 75 ? 'critical'
      : riskScore >= 50 ? 'high'
      : riskScore >= 25 ? 'medium'
      : 'low';

    // ─── 8. Build full evidence record ───
    const evidenceRecord = {
      order_number: orderNumber,
      customer_email: customerEmail,
      ip_address: ip,
      ip_country: ipData.country,
      ip_city: ipData.city,
      ip_isp: ipData.isp,
      ip_is_vpn: ipData.is_proxy || ipData.is_hosting,
      device_fingerprint: deviceFingerprint || '',
      user_agent: userAgent || '',
      screen_resolution: screenResolution || '',
      timezone: timezone || '',
      language: language || '',
      consent_timestamp: consentTimestamp || new Date().toISOString(),
      consent_version: consentVersion || 'v1',
      no_refund_policy_accepted: noRefundPolicyAccepted || false,
      research_use_accepted: researchUseAccepted || false,
      billing_shipping_match: billingShippingMatch,
      billing_ip_country_match: !riskFlags.includes('IP_COUNTRY_MISMATCH'),
      risk_score: riskScore,
      risk_level: riskLevel,
      risk_flags: riskFlags,
      payment_method: paymentMethod,
      order_amount: orderAmount,
      session_duration_seconds: sessionDurationSeconds || 0,
      pages_visited: pagesVisited || 0,
      prior_orders_count: completedPriorOrders.length,
      prior_chargebacks_count: chargebackFlags.length,
      raw_evidence_json: JSON.stringify({
        timestamp: new Date().toISOString(),
        order_number: orderNumber,
        customer_email: customerEmail,
        customer_name: customerName,
        ip_address: ip,
        ip_geolocation: ipData,
        device: { userAgent, screenResolution, timezone, language, deviceFingerprint },
        consent: { timestamp: consentTimestamp, version: consentVersion, noRefundAccepted: noRefundPolicyAccepted, researchUseAccepted },
        addresses: { billing: billingAddress, shipping: shippingAddress },
        risk: { score: riskScore, level: riskLevel, flags: riskFlags },
        history: { priorOrders: completedPriorOrders.length, chargebackFlags: chargebackFlags.length },
        session: { durationSeconds: sessionDurationSeconds, pagesVisited },
      }),
    };

    // ─── 9. Save evidence record ───
    await base44.asServiceRole.entities.OrderFraudEvidence.create(evidenceRecord);

    // ─── 10. Alert admin if high/critical risk ───
    if (riskLevel === 'high' || riskLevel === 'critical') {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'jake@redhelixresearch.com',
        subject: `⚠️ ${riskLevel.toUpperCase()} Risk Order: ${orderNumber} — Score ${riskScore}/100`,
        body: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;">
            <h2 style="color:${riskLevel === 'critical' ? '#dc2626' : '#d97706'};">
              ${riskLevel === 'critical' ? '🚨 CRITICAL RISK' : '⚠️ HIGH RISK'} ORDER FLAGGED
            </h2>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;">
              <p><strong>Order:</strong> ${orderNumber}</p>
              <p><strong>Customer:</strong> ${customerEmail}</p>
              <p><strong>Amount:</strong> $${orderAmount}</p>
              <p><strong>Payment:</strong> ${paymentMethod}</p>
              <p><strong>Risk Score:</strong> ${riskScore}/100 (${riskLevel.toUpperCase()})</p>
              <p><strong>Risk Flags:</strong></p>
              <ul>${riskFlags.map(f => `<li style="color:#dc2626;font-weight:bold;">${f.replace(/_/g, ' ')}</li>`).join('')}</ul>
              <p><strong>IP:</strong> ${ip} (${ipData.city}, ${ipData.country}) ${ipData.is_proxy ? '🚨 VPN/PROXY DETECTED' : ''}</p>
              <p><strong>Prior Orders:</strong> ${completedPriorOrders.length} | Prior High-Risk Flags: ${chargebackFlags.length}</p>
            </div>
            <p style="color:#64748b;font-size:13px;">Review this order in the Admin Order Management panel before shipping.</p>
          </div>
        `,
      }).catch(e => console.warn('Alert email failed:', e.message));
    }

    // ─── 11. Block CRITICAL risk orders ───
    // CONSERVATIVE: only block when there are 2+ hard signals together.
    // Never block on a single soft signal alone to protect legitimate customers.
    const hardSignals = riskFlags.filter(f => [
      'DISPOSABLE_EMAIL',
      'MULTI_ACCOUNT_SAME_DEVICE',
      'PRIOR_CHARGEBACK_HISTORY',
    ].includes(f));

    // Must be critical AND have at least 2 hard signals to block
    const blocked = riskLevel === 'critical' && hardSignals.length >= 2;

    return Response.json({
      allowed: !blocked,
      risk_score: riskScore,
      risk_level: riskLevel,
      risk_flags: riskFlags,
      requires_review: riskLevel === 'high' || riskLevel === 'critical',
      blocked,
      block_reason: blocked ? 'Your order has been flagged for manual review. Please contact support.' : null,
    });

  } catch (error) {
    console.error('Fraud check error:', error);
    // Fail OPEN — don't block legitimate orders on system error
    return Response.json({ allowed: true, risk_score: 0, risk_level: 'low', risk_flags: [], requires_review: false, blocked: false });
  }
});