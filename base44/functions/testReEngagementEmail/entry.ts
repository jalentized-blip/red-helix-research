import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ROTATING_OFFERS = [
  {
    headline: "Your research stack is waiting 🧪",
    subline: "Our most popular peptides are in stock and shipping within 24 hours.",
    highlight: "BPC-157, Semaglutide & TB-500 — all HPLC-verified.",
    cta: "Shop Now",
  },
  {
    headline: "It's been a while — here's what's new 🔬",
    subline: "We've added new batch COA reports and restocked top sellers.",
    highlight: "Fresh stock. Same verified quality. Fair prices.",
    cta: "See What's New",
  },
  {
    headline: "Research never stops 💡",
    subline: "Whether you're in a weight loss, healing, or cognitive protocol — we've got your peptides.",
    highlight: "Free shipping on orders over $100.",
    cta: "Restock Now",
  },
];

const buildHtml = (offer) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

<tr>
<td style="background:linear-gradient(135deg,#8B2635 0%,#6B1827 100%);padding:40px;text-align:center;">
  <img src="https://i.imgur.com/8MOtTE2.png" alt="Red Helix Research" style="height:60px;width:auto;display:block;margin:0 auto 16px auto;" />
  <h1 style="color:#ffffff;font-size:24px;font-weight:900;margin:0 0 8px 0;">${offer.headline}</h1>
  <p style="color:rgba(255,255,255,0.75);font-size:14px;margin:0;">${offer.subline}</p>
</td>
</tr>

<tr>
<td style="padding:40px;">
  <div style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:24px;text-align:center;margin-bottom:28px;">
    <p style="color:#8B2635;font-size:15px;font-weight:800;margin:0;">✅ ${offer.highlight}</p>
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
  <tr>
    <td width="33%" style="padding:0 6px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:22px;margin-bottom:6px;">🧪</div>
        <p style="color:#1e293b;font-size:13px;font-weight:800;margin:0 0 2px 0;">99%+ Purity</p>
        <p style="color:#94a3b8;font-size:11px;margin:0;">HPLC Verified</p>
      </div>
    </td>
    <td width="33%" style="padding:0 6px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:22px;margin-bottom:6px;">📋</div>
        <p style="color:#1e293b;font-size:13px;font-weight:800;margin:0 0 2px 0;">COA Reports</p>
        <p style="color:#94a3b8;font-size:11px;margin:0;">Every Batch</p>
      </div>
    </td>
    <td width="33%" style="padding:0 6px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:22px;margin-bottom:6px;">🚀</div>
        <p style="color:#1e293b;font-size:13px;font-weight:800;margin:0 0 2px 0;">Fast Shipping</p>
        <p style="color:#94a3b8;font-size:11px;margin:0;">24–48h</p>
      </div>
    </td>
  </tr>
  </table>

  <div style="text-align:center;">
    <a href="https://redhelixresearch.com/Products" style="display:inline-block;background:#8B2635;color:#ffffff;font-size:15px;font-weight:800;text-decoration:none;padding:16px 48px;border-radius:12px;letter-spacing:1px;text-transform:uppercase;">${offer.cta} →</a>
  </div>
</td>
</tr>

<tr>
<td style="padding:0 40px 40px 40px;text-align:center;">
  <p style="color:#cbd5e1;font-size:11px;margin:0;">
    Red Helix Research — Fair Pricing. Verified Quality. Community Driven.<br/>
    All products are for laboratory research purposes only.<br/>
    <a href="https://redhelixresearch.com" style="color:#8B2635;text-decoration:none;">redhelixresearch.com</a>
  </p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();
    if (!email) return Response.json({ error: 'Missing email' }, { status: 400 });

    const results = [];
    for (let i = 0; i < ROTATING_OFFERS.length; i++) {
      const offer = ROTATING_OFFERS[i];
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `[TEST ${i + 1}/3] ${offer.headline}`,
        body: buildHtml(offer),
        from_name: 'Red Helix Research',
      });
      results.push(`Sent variant ${i + 1}: ${offer.headline}`);
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});