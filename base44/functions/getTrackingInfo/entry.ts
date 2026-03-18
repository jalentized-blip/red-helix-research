import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { rateLimit, sanitizeInput, createSecureResponse } from './securityUtils.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    // Rate limiting: 20 requests per minute per user
    const rateLimitCheck = rateLimit(`tracking:${user.email}`, 20, 60000);
    if (!rateLimitCheck.allowed) {
      return createSecureResponse({ 
        error: 'Too many requests',
        retryAfter: rateLimitCheck.retryAfter 
      }, 429);
    }

    const body = await req.json();
    const { tracking_number, carrier } = sanitizeInput(body);

    if (!tracking_number || typeof tracking_number !== 'string' || tracking_number.length > 100) {
      return createSecureResponse({ error: 'Invalid tracking number' }, 400);
    }

    // Use LLM to fetch real-time tracking information
    const trackingData = await base44.integrations.Core.InvokeLLM({
      prompt: `IMPORTANT: Fetch the LATEST, REAL-TIME tracking information right now (as of ${new Date().toISOString()}) for tracking number "${tracking_number}" with carrier "${carrier || 'auto-detect'}".
      
      Do NOT use cached data. Look up the CURRENT status directly from the carrier's tracking system.
      
      Return detailed tracking information including:
      - Current status (in transit, delivered, out for delivery, etc.)
      - Complete location history with timestamps (ordered from most recent to oldest)
      - Current/latest location where the package is RIGHT NOW
      - Estimated delivery date
      - Any exceptions or delays
      
      Make sure the "current_location" field shows where the package is RIGHT NOW, not where it was previously.
      
      Format as JSON with this structure:
      {
        "status": "in_transit" | "delivered" | "out_for_delivery" | "exception" | "pending",
        "status_description": "human readable status",
        "estimated_delivery": "ISO date string or null",
        "current_location": "city, state (the LATEST/CURRENT location)",
        "last_update": "ISO datetime string",
        "events": [
          {
            "timestamp": "ISO datetime",
            "location": "city, state",
            "description": "event description",
            "status": "event status"
          }
        ],
        "delivered_date": "ISO date string or null"
      }`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          status_description: { type: 'string' },
          estimated_delivery: { type: ['string', 'null'] },
          current_location: { type: 'string' },
          last_update: { type: 'string' },
          delivered_date: { type: ['string', 'null'] },
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                timestamp: { type: 'string' },
                location: { type: 'string' },
                description: { type: 'string' },
                status: { type: 'string' }
              }
            }
          }
        },
        required: ['status', 'status_description']
      }
    });

    return createSecureResponse(trackingData);
  } catch (error) {
    console.error('Tracking error:', error);
    return createSecureResponse({ 
      error: 'Failed to fetch tracking information'
    }, 500);
  }
});