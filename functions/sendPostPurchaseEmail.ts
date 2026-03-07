import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { email, orderNumber, orderItems, firstName = 'Researcher', trackingNumber = null, totalAmount, shippingAddress, paymentMethod, customerPhone } = body;

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

    // Admin notification email
    const itemsHtml = orderItems.map(item => `<tr><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;">${item.name}</td><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">${item.quantity}</td><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;text-align:right;">$${item.price ? (item.price * item.quantity).toFixed(2) : '—'}</td></tr>`).join('');
    const addr = shippingAddress || {};
    const addrStr = [addr.address || addr.shippingAddress, addr.city || addr.shippingCity, addr.state || addr.shippingState, addr.zip || addr.shippingZip].filter(Boolean).join(', ');

    await base44.integrations.Core.SendEmail({
      to: 'jake@redhelixresearch.com',
      subject: `🛍️ New Order #${orderNumber} — ${firstName} — $${totalAmount || '?'}`,
      from_name: 'Red Helix Research Orders',
      body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#fff;">
        <h2 style="color:#dc2626;margin-bottom:4px;">New Order Placed</h2>
        <p style="color:#64748b;font-size:13px;margin-top:0;">Order <strong>#${orderNumber}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;width:40%;">Customer</td><td style="padding:8px 0;font-weight:700;">${firstName}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Email</td><td style="padding:8px 0;">${email}</td></tr>
          ${customerPhone ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Phone</td><td style="padding:8px 0;">${customerPhone}</td></tr>` : ''}
          ${addrStr ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Ship To</td><td style="padding:8px 0;">${addrStr}</td></tr>` : ''}
          ${paymentMethod ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Payment</td><td style="padding:8px 0;">${paymentMethod}</td></tr>` : ''}
          ${totalAmount ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Total</td><td style="padding:8px 0;font-size:18px;font-weight:900;color:#dc2626;">$${totalAmount}</td></tr>` : ''}
        </table>
        <h4 style="margin-bottom:8px;color:#0f172a;">Items Ordered</h4>
        <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;">
          <tr style="background:#e2e8f0;"><th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Product</th><th style="padding:8px 12px;text-align:center;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Qty</th><th style="padding:8px 12px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Total</th></tr>
          ${itemsHtml}
        </table>
        <p style="margin-top:24px;font-size:12px;color:#94a3b8;">View in Admin: <a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;">Order Management →</a></p>
      </div>`
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