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

    const itemCount = cartItems.length;

    const itemRows = cartItems.map(item => {
      const itemName = item.productName || item.name || 'Research Peptide';
      const qty = item.quantity || 1;
      const price = parseFloat(item.price) || 0;
      const lineTotal = (qty * price).toFixed(2);
      return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #f1f5f9;">
          <p style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 2px 0;">${itemName}</p>
          <p style="color:#94a3b8;font-size:12px;margin:0;">Qty: ${qty}</p>
        </td>
        <td style="padding:14px 0;border-bottom:1px solid #f1f5f9;text-align:right;vertical-align:top;">
          <p style="color:#1e293b;font-size:15px;font-weight:800;margin:0;">$${lineTotal}</p>
        </td>
      </tr>`;
    }).join('');

    const emailBody = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Cart is Waiting</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:48px 40px;text-align:center;">
  <div style="width:60px;height:60px;background-color:#dc2626;border-radius:16px;display:inline-block;line-height:60px;margin-bottom:20px;">
    <span style="color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-1px;">RH</span>
  </div>
  <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0 0 8px 0;letter-spacing:-0.5px;">Your Research Cart is Waiting 🧪</h1>
  <p style="color:#94a3b8;font-size:14px;font-weight:600;margin:0;letter-spacing:1px;text-transform:uppercase;">Don't lose your selections</p>
</td>
</tr>

<!-- Greeting -->
<tr>
<td style="padding:40px 40px 0 40px;">
  <p style="color:#1e293b;font-size:18px;font-weight:700;margin:0 0 16px 0;">Hi ${resolvedName} 👋</p>
  <p style="color:#475569;font-size:15px;line-height:1.7;margin:0;">
    We noticed you left ${itemCount === 1 ? 'an item' : 'some items'} in your cart. Your research-grade peptides are still reserved — but we wanted to make sure you don't miss out.
  </p>
</td>
</tr>

<!-- Cart Items -->
<tr>
<td style="padding:32px 40px 0 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
  <tr><td style="padding:24px 28px;">
    <p style="color:#1e293b;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px 0;">🛒 Your Cart (${itemCount} ${itemCount === 1 ? 'Item' : 'Items'})</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemRows}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
    <tr>
      <td><p style="color:#1e293b;font-size:16px;font-weight:800;margin:0;">Total</p></td>
      <td style="text-align:right;"><p style="color:#dc2626;font-size:20px;font-weight:900;margin:0;">$${resolvedCartValue.toFixed(2)}</p></td>
    </tr>
    </table>
  </td></tr>
  </table>
</td>
</tr>

<!-- CTA Button -->
<tr>
<td style="padding:28px 40px 0 40px;text-align:center;">
  <a href="https://redhelixresearch.com/Cart" style="display:inline-block;background-color:#dc2626;color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;padding:18px 56px;border-radius:14px;letter-spacing:1px;text-transform:uppercase;">Complete Your Order →</a>
</td>
</tr>

<!-- Why Red Helix -->
<tr>
<td style="padding:36px 40px 0 40px;">
  <p style="color:#1e293b;font-size:18px;font-weight:800;margin:0 0 20px 0;">✅ Why Researchers Choose Red Helix</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding:0 0 14px 0;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td width="36" valign="top"><div style="width:28px;height:28px;background-color:#f0fdf4;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">🧪</div></td>
          <td style="padding-left:12px;">
            <p style="color:#1e293b;font-size:14px;font-weight:700;margin:0 0 2px 0;">>98% Purity — HPLC Verified</p>
            <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0;">Every batch independently tested and verified for research-grade quality.</p>
          </td>
        </tr></table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 14px 0;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td width="36" valign="top"><div style="width:28px;height:28px;background-color:#eff6ff;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">📋</div></td>
          <td style="padding-left:12px;">
            <p style="color:#1e293b;font-size:14px;font-weight:700;margin:0 0 2px 0;">Third-Party Certificate of Analysis</p>
            <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0;">Transparent, publicly available COA reports for every product we sell.</p>
          </td>
        </tr></table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 14px 0;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td width="36" valign="top"><div style="width:28px;height:28px;background-color:#fef3c7;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">💰</div></td>
          <td style="padding-left:12px;">
            <p style="color:#1e293b;font-size:14px;font-weight:700;margin:0 0 2px 0;">Fair, Transparent Pricing</p>
            <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0;">No 500–800% markups. Same overseas sources, honest margins.</p>
          </td>
        </tr></table>
      </td>
    </tr>
    <tr>
      <td style="padding:0;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td width="36" valign="top"><div style="width:28px;height:28px;background-color:#faf5ff;border-radius:8px;text-align:center;line-height:28px;font-size:14px;">🇺🇸</div></td>
          <td style="padding-left:12px;">
            <p style="color:#1e293b;font-size:14px;font-weight:700;margin:0 0 2px 0;">USA-Based, Discreet Shipping</p>
            <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0;">Fast, secure delivery with professional packaging. Free shipping over $200.</p>
          </td>
        </tr></table>
      </td>
    </tr>
  </table>
</td>
</tr>

<!-- Support Section -->
<tr>
<td style="padding:32px 40px 0 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:16px;">
  <tr><td style="padding:28px;text-align:center;">
    <p style="color:#ffffff;font-size:16px;font-weight:700;margin:0 0 8px 0;">💬 Need Help Deciding?</p>
    <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 16px 0;">Our research team is here to answer your questions about peptides, dosing, reconstitution, or anything else.</p>
    <a href="mailto:jake@redhelixresearch.com" style="display:inline-block;background-color:rgba(255,255,255,0.1);color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:10px 28px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);">📧 jake@redhelixresearch.com</a>
  </td></tr>
  </table>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:32px 40px 40px 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;padding-top:24px;">
  <tr><td style="text-align:center;">
    <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0 0 8px 0;">
      <a href="https://redhelixresearch.com" style="color:#dc2626;text-decoration:none;font-weight:700;">redhelixresearch.com</a>
    </p>
    <p style="color:#cbd5e1;font-size:11px;line-height:1.5;margin:0;">
      Red Helix Research — Fair Pricing. Verified Quality. Community Driven.<br />
      All products are for laboratory research purposes only. Not for human consumption.
    </p>
  </td></tr>
  </table>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    const result = await base44.integrations.Core.SendEmail({
      to: email,
      subject: `🧪 Your Research Cart is Waiting — ${itemCount} ${itemCount === 1 ? 'Item' : 'Items'} Reserved`,
      body: emailBody,
      from_name: 'Red Helix Research'
    });

    // Track email sent
    base44.analytics.track({
      eventName: 'abandoned_cart_email_sent',
      properties: {
        email: email,
        cart_value: resolvedCartValue,
        item_count: itemCount
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
