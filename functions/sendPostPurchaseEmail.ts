import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { email, orderNumber, orderItems, firstName = 'Researcher', trackingNumber = null, totalAmount, shippingAddress, paymentMethod, customerPhone } = body;

    if (!email || !orderNumber || !orderItems) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ── Customer confirmation email (plain text) ──
    const itemsList = orderItems.map(item => {
      const productName = item.productName || item.name || 'Product';
      const spec = item.specification || item.spec || '';
      return `- ${productName}${spec ? ' (' + spec + ')' : ''} x${item.quantity}`;
    }).join('\n');
    const trackingInfo = trackingNumber ? `\n\nTracking Number: ${trackingNumber}\nCheck Status: https://redhelixresearch.com/OrderTracking` : '';

    const customerEmailBody = `Hi ${firstName},

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
      body: customerEmailBody,
      from_name: 'Red Helix Research'
    });

    // ── Admin notification email (HTML, separate) ──
    const addr = shippingAddress || {};
    const addrStr = [addr.address || addr.shippingAddress, addr.city || addr.shippingCity, addr.state || addr.shippingState, addr.zip || addr.shippingZip].filter(Boolean).join(', ');

    const itemsHtml = orderItems.map(item => {
      const productName = item.productName || item.name || 'Product';
      const spec = item.specification || item.spec || '';
      const label = spec ? `<strong>${productName}</strong><br><span style="color:#94a3b8;font-size:11px;">${spec}</span>` : `<strong>${productName}</strong>`;
      const lineTotal = item.price ? (item.price * item.quantity).toFixed(2) : '—';
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;">$${lineTotal}</td>
      </tr>`;
    }).join('');

    await base44.integrations.Core.SendEmail({
      to: 'jake@redhelixresearch.com',
      subject: `🛍️ New Order #${orderNumber} — ${firstName} — $${totalAmount || '?'}`,
      from_name: 'RHR Order Alert',
      body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;">
        <div style="background:#0f172a;padding:20px 24px;border-radius:8px;margin-bottom:24px;">
          <h2 style="color:#fff;margin:0;font-size:20px;">🛍️ New Order Placed</h2>
          <p style="color:#94a3b8;margin:4px 0 0 0;font-size:13px;">Order <strong style="color:#fff;">#${orderNumber}</strong></p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;width:35%;">Customer</td><td style="padding:8px 0;font-weight:700;color:#0f172a;">${firstName}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Email</td><td style="padding:8px 0;color:#0f172a;">${email}</td></tr>
          ${customerPhone ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Phone</td><td style="padding:8px 0;color:#0f172a;">${customerPhone}</td></tr>` : ''}
          ${addrStr ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Ship To</td><td style="padding:8px 0;color:#0f172a;">${addrStr}</td></tr>` : ''}
          ${paymentMethod ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Payment</td><td style="padding:8px 0;color:#0f172a;">${paymentMethod}</td></tr>` : ''}
          ${totalAmount ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Total</td><td style="padding:8px 0;font-size:22px;font-weight:900;color:#dc2626;">$${totalAmount}</td></tr>` : ''}
        </table>
        <h4 style="margin:0 0 8px 0;color:#0f172a;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Items Ordered</h4>
        <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;">
          <tr style="background:#e2e8f0;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Product</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Total</th>
          </tr>
          ${itemsHtml}
        </table>
        <p style="margin-top:24px;font-size:12px;color:#94a3b8;text-align:center;">
          <a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;font-weight:700;text-decoration:none;">View in Admin Order Management →</a>
        </p>
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