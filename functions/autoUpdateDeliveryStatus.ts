import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both scheduled (service role) and manual admin calls
    let isAuthorized = false;
    try {
      const user = await base44.auth.me();
      if (user?.role === 'admin') isAuthorized = true;
    } catch (_) {
      // Scheduled call — no user session, use service role
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all shipped orders that have a tracking number
    const orders = await base44.asServiceRole.entities.Order.filter({
      status: 'shipped',
    });

    const shippedWithTracking = orders.filter(o => o.tracking_number?.trim() && o.carrier);

    if (shippedWithTracking.length === 0) {
      return Response.json({ message: 'No shipped orders with tracking to check', updated: 0 });
    }

    let updated = 0;
    const results = [];

    for (const order of shippedWithTracking) {
      try {
        // Use LLM with internet to get real-time tracking status
        const trackingData = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Check the CURRENT delivery status for tracking number "${order.tracking_number}" with carrier "${order.carrier}".
          
          Has this package been delivered? Return ONLY the essential status info.
          
          Return JSON:
          {
            "status": "delivered" | "in_transit" | "out_for_delivery" | "exception" | "pending",
            "delivered_date": "ISO date string or null",
            "status_description": "brief description"
          }`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              delivered_date: { type: ['string', 'null'] },
              status_description: { type: 'string' }
            },
            required: ['status']
          }
        });

        results.push({
          order_number: order.order_number,
          tracking: order.tracking_number,
          carrier: order.carrier,
          tracking_status: trackingData.status,
          description: trackingData.status_description
        });

        if (trackingData.status === 'delivered') {
          const updateData = {
            status: 'delivered',
            delivered_date: trackingData.delivered_date || new Date().toISOString()
          };
          await base44.asServiceRole.entities.Order.update(order.id, updateData);
          updated++;
          results[results.length - 1].order_updated = true;
        }

        // Small delay to avoid hammering the LLM
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Failed to check tracking for order ${order.order_number}:`, err.message);
        results.push({
          order_number: order.order_number,
          tracking: order.tracking_number,
          error: err.message
        });
      }
    }

    console.log(`Auto-delivery check: ${updated} orders updated to delivered out of ${shippedWithTracking.length} checked`);

    return Response.json({
      message: `Checked ${shippedWithTracking.length} orders, updated ${updated} to delivered`,
      updated,
      results
    });

  } catch (error) {
    console.error('Auto delivery update error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});