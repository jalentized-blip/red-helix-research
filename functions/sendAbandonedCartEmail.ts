import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { email, cartItems, cartValue, totalAmount, firstName, name } = body;
    const resolvedName = firstName || name || 'Researcher';
    const resolvedCartValue = cartValue || totalAmount || 0;

    if (!email || !cartItems || cartItems.length === 0) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const itemsList = cartItems.map(item => `- ${item.productName || item.name} (${item.quantity}x @ $${item.price})`).join('\n');

    const emailBody = `Hi ${resolvedName},

We noticed you left some high-quality research peptides in your cart! Don't miss out on verified, third-party tested products.

Your Cart:
${itemsList}

Cart Total: $${resolvedCartValue.toFixed(2)}

Your research deserves the best. All Red Helix peptides come with:
✓ >98% Purity (HPLC Verified)
✓ Third-Party Certificate of Analysis
✓ USA-Based, Discreet Shipping
✓ 24/7 Research Support

Complete your order: https://redhelixresearch.com/Cart

Questions? Our research team is here to help.

Best regards,
Red Helix Research
jake@redhelixresearch.com`;

    const result = await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Complete Your Research Order - ${resolvedName}'s Cart (${itemsList.split('\n').length} items)`,
      body: emailBody,
      from_name: 'Red Helix Research'
    });

    // Track email sent
    base44.analytics.track({
      eventName: 'abandoned_cart_email_sent',
      properties: { 
        email: email,
        cart_value: resolvedCartValue,
        item_count: cartItems.length
      }
    });

    return Response.json({ 
      success: true, 
      message: 'Abandoned cart email sent',
      result 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});