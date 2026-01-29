import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tracking_number, carrier } = await req.json();

    if (!tracking_number) {
      return Response.json({ error: 'Tracking number is required' }, { status: 400 });
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

    return Response.json(trackingData);
  } catch (error) {
    console.error('Tracking error:', error);
    return Response.json({ 
      error: 'Failed to fetch tracking information',
      details: error.message 
    }, { status: 500 });
  }
});