import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { email, orderNumber, orderItems, firstName = 'Researcher', trackingNumber = null } = body;

    if (!email || !orderNumber || !orderItems) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const itemsList = orderItems.map(item => `- ${item.name} (${item.quantity}x)`).join('\n');
    const trackingInfo = trackingNumber ? `\n\nTracking Number: ${trackingNumber}\nCheck Status: https://redhelixresearch.com/OrderTracking` : '';

    const emailBody = `Hi ${firstName},

Thank you for your order! Your research-grade peptides are being prepared for shipment.

Order Details:
Order #${orderNumber}
Items:
${itemsList}

${trackingInfo}

What's Next:
1. Your order will be carefully packaged and shipped within 1-2 business days
2. You'll receive a tracking update via email
3. All peptides include Certificates of Analysis for quality verification

Getting Started:
→ Reconstitution Guide: https://redhelixresearch.com/BlogGuide
→ Peptide Calculator: https://redhelixresearch.com/PeptideCalculator
→ Customer Support: jake@redhelixresearch.com

We're here if you have any questions during your research!

Best regards,
Red Helix Research
Research-Grade Peptides Since 2020`;

    const result = await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Order Confirmed #${orderNumber} - Red Helix Research`,
      body: emailBody,
      from_name: 'Red Helix Research'
    });

    base44.analytics.track({
      eventName: 'post_purchase_email_sent',
      properties: { 
        email: email,
        order_number: orderNumber,
        item_count: orderItems.length
      }
    });

    return Response.json({ 
      success: true, 
      message: 'Post-purchase email sent',
      result 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});