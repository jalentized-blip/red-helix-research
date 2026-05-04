// Resend-powered email

Deno.serve(async (req) => {
  try {
    const { email, code, expires_at } = await req.json();

    if (!email || !code) {
      return Response.json({ error: 'Missing email or code' }, { status: 400 });
    }

    const expiryDate = new Date(expires_at).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your 10% Welcome Discount – Red Helix Research</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#8B2635,#6B1827);padding:40px 32px;text-align:center;">
              <img src="https://i.imgur.com/8MOtTE2.png" alt="Red Helix Research" style="height:56px;width:auto;margin-bottom:20px;" />
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase;">Your Welcome Gift 🎁</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">First-time visitor exclusive — just for you</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">Welcome to <strong>Red Helix Research</strong>! Here's your exclusive 10% discount on your first order:</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:#fef2f2;border:2px dashed #8B2635;border-radius:12px;">
                <tr>
                  <td style="padding:20px 24px;text-align:center;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Your Discount Code</p>
                    <p style="margin:0;color:#8B2635;font-size:28px;font-weight:900;letter-spacing:4px;font-family:monospace;">${code}</p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f8fafc;border-radius:10px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px;color:#334155;font-size:13px;line-height:1.6;">✅ <strong>10% off</strong> single vials (all products)</p>
                    <p style="margin:0 0 8px;color:#334155;font-size:13px;line-height:1.6;">❌ Does <strong>not</strong> apply to 10-vial kits</p>
                    <p style="margin:0 0 8px;color:#334155;font-size:13px;line-height:1.6;">⏰ Expires <strong>${expiryDate}</strong></p>
                    <p style="margin:0;color:#334155;font-size:13px;line-height:1.6;">🔒 One-time use · Non-transferable</p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://redhelixresearch.com/Products" style="display:inline-block;background:#8B2635;color:#ffffff;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:2px;padding:14px 36px;border-radius:10px;text-decoration:none;">Shop Now & Save 10%</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f1f5f9;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">Red Helix Research · For research use only · Not for human consumption</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Red Helix Research <rhrsupport@redhelixresearch.com>',
        to: email,
        subject: `🎁 Your 10% Welcome Discount Code: ${code}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: err }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});