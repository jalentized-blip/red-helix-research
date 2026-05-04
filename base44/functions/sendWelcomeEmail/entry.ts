// Resend-powered email

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, firstName = 'Researcher' } = body;

    if (!email) {
      return Response.json({ error: 'Missing required email field' }, { status: 400 });
    }

    const emailBody = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Red Helix Research</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<tr>
<td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);padding:48px 40px;text-align:center;">
  <div style="width:60px;height:60px;background-color:#dc2626;border-radius:16px;display:inline-block;line-height:60px;margin-bottom:20px;">
    <span style="color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-1px;">RH</span>
  </div>
  <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0 0 8px 0;">Welcome to the Movement 🔬</h1>
  <p style="color:#94a3b8;font-size:14px;font-weight:600;margin:0;letter-spacing:1px;text-transform:uppercase;">Red Helix Research</p>
</td>
</tr>
<tr>
<td style="padding:40px 40px 0 40px;">
  <p style="color:#1e293b;font-size:18px;font-weight:700;margin:0 0 16px 0;">Hi ${firstName} 👋</p>
  <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px 0;">
    Thank you for joining Red Helix Research. You're not just signing up for a peptide supplier — you're joining a <strong style="color:#1e293b;">community on a mission</strong> to bring fairness, transparency, and honesty to the research peptide market.
  </p>
</td>
</tr>
<tr>
<td style="padding:24px 40px 0 40px;text-align:center;">
  <a href="https://redhelixresearch.com/Products" style="display:inline-block;background-color:#dc2626;color:#ffffff;font-size:15px;font-weight:800;text-decoration:none;padding:16px 48px;border-radius:14px;letter-spacing:1px;text-transform:uppercase;">🛒 Explore Our Products</a>
</td>
</tr>
<tr>
<td style="padding:32px 40px 40px 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;padding-top:24px;">
  <tr><td style="text-align:center;">
    <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0 0 8px 0;">
      Questions? Reach us at <a href="mailto:jake@redhelixresearch.com" style="color:#dc2626;text-decoration:none;font-weight:700;">jake@redhelixresearch.com</a>
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

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Red Helix Research <rhrsupport@redhelixresearch.com>',
        to: email,
        subject: "🔬 Welcome to Red Helix Research — Here's Why We're Different",
        html: emailBody,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: err }, { status: 500 });
    }

    return Response.json({ success: true, message: 'Welcome email sent' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});