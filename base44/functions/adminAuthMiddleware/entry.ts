import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { rateLimit, createSecureResponse } from './securityUtils.js';

/**
 * Middleware to verify admin authentication and apply rate limiting
 * Use this for all admin-only backend functions
 */
export async function verifyAdminAuth(req, maxRequests = 30, windowMs = 60000) {
  const base44 = createClientFromRequest(req);
  
  let user;
  try {
    user = await base44.auth.me();
  } catch (error) {
    return { 
      error: createSecureResponse({ error: 'Authentication required' }, 401),
      user: null,
      base44: null
    };
  }

  if (!user) {
    return { 
      error: createSecureResponse({ error: 'Authentication required' }, 401),
      user: null,
      base44: null
    };
  }

  if (user.role !== 'admin') {
    return { 
      error: createSecureResponse({ error: 'Admin access required' }, 403),
      user: null,
      base44: null
    };
  }

  // Rate limiting for admin actions
  const rateLimitCheck = rateLimit(`admin:${user.email}`, maxRequests, windowMs);
  if (!rateLimitCheck.allowed) {
    return { 
      error: createSecureResponse({ 
        error: 'Rate limit exceeded',
        retryAfter: rateLimitCheck.retryAfter 
      }, 429),
      user: null,
      base44: null
    };
  }

  return { error: null, user, base44 };
}