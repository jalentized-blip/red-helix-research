import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { email, firstName = 'Researcher', lastOrderDate, lastProducts = [] } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const daysSincePurchase = lastOrderDate ? Math.floor((Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)) : 30;
    
    const productMentions = lastProducts.length > 0 
      ? `\n\nBased on your previous order (${daysSincePurchase} days ago), you may need:\n${lastProducts.map(p => `• ${p}`).join('\n')}`
      : '';

    const emailBody = `Hi ${firstName},

It's been a while since your last order with Red Helix Research. We hope your research is going well!

${productMentions}

Why Reorder from Red Helix?
✓ Same high-quality, third-party tested peptides
✓ Batch consistency you can trust
✓ Discounts for repeat customers
✓ Priority support for established researchers

Shop Now: https://redhelixresearch.com/Home

Questions about your previous order or peptides?
Our research team is ready to help: jake@redhelixresearch.com

Best regards,
Red Helix Research
Trusted by Researchers Since 2020`;

    const result = await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Welcome Back! Premium Research Peptides Await`,
      body: emailBody,
      from_name: 'Red Helix Research'
    });

    base44.analytics.track({
      eventName: 'reorder_reminder_sent',
      properties: { 
        email: email,
        days_since_purchase: daysSincePurchase,
        product_count: lastProducts.length
      }
    });

    return Response.json({ 
      success: true, 
      message: 'Reorder reminder sent',
      result 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});