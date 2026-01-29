import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, name, cartItems, totalAmount } = await req.json();

    if (!email || !cartItems || cartItems.length === 0) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create cart items HTML
    const cartItemsHtml = cartItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>${item.productName}</strong><br>
          <span style="color: #666; font-size: 14px;">${item.specification}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    await base44.integrations.Core.SendEmail({
      from_name: 'Red Helix Research',
      to: email,
      subject: 'Did you forget something?',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: #8B2635; padding: 30px; text-align: center;">
            <h1 style="color: #F5E6D3; margin: 0; font-size: 24px;">You left items in your cart</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hi${name ? ` ${name}` : ''},
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              You have items waiting in your cart. Ready to complete your order?
            </p>

            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #8B2635;">Your Cart:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #e5e5e5;">
                    <th style="padding: 10px; text-align: left;">Product</th>
                    <th style="padding: 10px; text-align: center;">Qty</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${cartItemsHtml}
                </tbody>
              </table>
              <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #8B2635; text-align: right;">
                <strong style="font-size: 18px; color: #8B2635;">Total: $${totalAmount.toFixed(2)}</strong>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://redhelixresearch.com/Cart" 
                 style="display: inline-block; background: #8B2635; color: #F5E6D3; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Complete Purchase
              </a>
            </div>

            <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
              <p style="color: #666; font-size: 14px; margin: 5px 0;">Same-day shipping</p>
              <p style="color: #666; font-size: 14px; margin: 5px 0;">Lab-tested with COAs</p>
              <p style="color: #666; font-size: 14px; margin: 5px 0;">Secure payment</p>
            </div>
          </div>

          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
            <p style="margin: 0;">Red Helix Research</p>
            <p style="margin: 5px 0 0 0;">Questions? Contact us on Discord or Telegram</p>
          </div>
        </div>
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});