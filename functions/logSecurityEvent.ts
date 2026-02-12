import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { rateLimit, createSecureResponse } from './securityUtils.js';

/**
 * Server-side security event logging
 * Stores audit events persistently for admin review
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return createSecureResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const base44 = createClientFromRequest(req);

    // Rate limit: 30 log events per minute per IP
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = rateLimit(`seclog_${clientIP}`, 30, 60000);
    if (!rateLimitResult.allowed) {
      return createSecureResponse({ success: true }); // Don't reveal rate limiting
    }

    const { eventType, data, path, timestamp } = await req.json();

    // Validate event type
    const allowedTypes = [
      'SECURITY_ALERT',
      'SESSION_EXPIRED',
      'SUSPICIOUS_ACTIVITY',
      'FAILED_AUTH',
      'SESSION_VALIDATION_ERROR'
    ];

    if (!allowedTypes.includes(eventType)) {
      return createSecureResponse({ success: true });
    }

    // Get user info if authenticated
    let userEmail = 'anonymous';
    try {
      const user = await base44.auth.me();
      if (user?.email) {
        userEmail = user.email;
      }
    } catch {
      // User not authenticated
    }

    // Store in persistent entity
    await base44.asServiceRole.entities.SecurityLog.create({
      event_type: eventType,
      user_email: userEmail,
      path: (path || '').slice(0, 200),
      data: JSON.stringify(data || {}).slice(0, 2000),
      client_ip: clientIP,
      timestamp: new Date(timestamp || Date.now()).toISOString(),
      severity: getSeverity(eventType)
    });

    return createSecureResponse({ success: true });
  } catch (error) {
    console.error('Security logging error:', error);
    return createSecureResponse({ success: true }); // Don't expose errors
  }
});

function getSeverity(eventType: string): string {
  switch (eventType) {
    case 'SECURITY_ALERT': return 'critical';
    case 'SUSPICIOUS_ACTIVITY': return 'high';
    case 'FAILED_AUTH': return 'medium';
    case 'SESSION_EXPIRED': return 'low';
    default: return 'info';
  }
}
