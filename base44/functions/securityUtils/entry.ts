// Security utilities for backend functions
// Rate limiting and authentication helpers

const rateLimitStore = new Map();

export function rateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  const record = rateLimitStore.get(key);
  
  if (now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (record.count >= maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup old entries every 5 minutes
setInterval(cleanupRateLimitStore, 300000);

export function sanitizeInput(input) {
  if (typeof input === 'string') {
    // Strip HTML/script tags and limit length
    return input.replace(/<[^>]*>/g, '').trim().slice(0, 10000);
  }
  if (typeof input === 'object' && input !== null) {
    if (Array.isArray(input)) {
      return input.slice(0, 100).map(item => sanitizeInput(item));
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      if (typeof value === 'string') {
        sanitized[key] = value.replace(/<[^>]*>/g, '').trim().slice(0, 10000);
      } else if (typeof value === 'number' && isFinite(value)) {
        sanitized[key] = value;
      } else if (typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.slice(0, 100).map(item => sanitizeInput(item));
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeInput(value);
      }
    }
    return sanitized;
  }
  return input;
}

export async function verifyAdmin(base44) {
  try {
    const user = await base44.auth.me();
    return user?.role === 'admin';
  } catch (error) {
    return false;
  }
}

export function createSecureResponse(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '0', // Disabled per modern best practice; use CSP instead
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.coingecko.com https://*.plaid.com https://*.base44.io; frame-ancestors 'none'; form-action 'self'; base-uri 'self'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    }
  });
}