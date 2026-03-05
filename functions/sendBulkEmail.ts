import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify admin
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { subject, htmlBody } = body;

    if (!subject || !htmlBody) {
      return Response.json({ error: 'Missing subject or htmlBody' }, { status: 400 });
    }

    // Get all active orders (pending, processing, shipped)
    const orders = await base44.asServiceRole.entities.Order.filter({
      status: { $in: ['pending', 'processing', 'shipped'] }
    }, '-created_date', 500);

    // Deduplicate by email
    const seen = new Set();
    const uniqueCustomers = [];
    for (const order of orders) {
      const email = order.customer_email || order.created_by;
      if (email && !seen.has(email) && !email.includes('jscaudio')) {
        seen.add(email);
        uniqueCustomers.push({
          email,
          name: order.customer_name || 'there',
          order_number: order.order_number
        });
      }
    }

    const results = [];
    for (const customer of uniqueCustomers) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customer.email,
          subject,
          body: htmlBody,
          from_name: 'Red Helix Research'
        });
        results.push({ email: customer.email, status: 'sent' });
      } catch (err) {
        results.push({ email: customer.email, status: 'failed', error: err.message });
      }
    }

    return Response.json({
      success: true,
      total: uniqueCustomers.length,
      results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});