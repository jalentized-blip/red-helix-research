import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
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

<!-- Header -->
<tr>
<td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);padding:48px 40px;text-align:center;">
  <div style="width:60px;height:60px;background-color:#dc2626;border-radius:16px;display:inline-block;line-height:60px;margin-bottom:20px;">
    <span style="color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-1px;">RH</span>
  </div>
  <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0 0 8px 0;letter-spacing:-0.5px;">Welcome to the Movement 🔬</h1>
  <p style="color:#94a3b8;font-size:14px;font-weight:600;margin:0;letter-spacing:1px;text-transform:uppercase;">Red Helix Research</p>
</td>
</tr>

<!-- Welcome Message -->
<tr>
<td style="padding:40px 40px 0 40px;">
  <p style="color:#1e293b;font-size:18px;font-weight:700;margin:0 0 16px 0;">Hi ${firstName} 👋</p>
  <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px 0;">
    Thank you for joining Red Helix Research. You're not just signing up for a peptide supplier — you're joining a <strong style="color:#1e293b;">community on a mission</strong> to bring fairness, transparency, and honesty to the research peptide market.
  </p>
  <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px 0;">
    We know you probably have one big question: <strong style="color:#dc2626;">"Why are your prices so much lower than everyone else?"</strong>
  </p>
  <p style="color:#475569;font-size:15px;line-height:1.7;margin:0;">
    The answer is simple — and it's exactly why we started Red Helix.
  </p>
</td>
</tr>

<!-- The Problem Section -->
<tr>
<td style="padding:32px 40px 0 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border-radius:12px;border-left:4px solid #dc2626;">
  <tr><td style="padding:24px 28px;">
    <p style="color:#dc2626;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px 0;">⚠️ The Industry Problem</p>
    <p style="color:#1e293b;font-size:15px;line-height:1.7;margin:0 0 12px 0;">
      Most peptide vendors in the United States purchase their inventory from the <strong>exact same overseas manufacturers</strong> — then mark them up <strong style="color:#dc2626;">500–800%</strong> before selling them to you.
    </p>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0;">
      A peptide that costs a vendor $5–$10 to source gets sold to researchers for $60–$120. The quality is the same. The COA is the same. The only difference? The price tag — and the marketing budget used to justify it.
    </p>
  </td></tr>
  </table>
</td>
</tr>

<!-- Our Mission Section -->
<tr>
<td style="padding:32px 40px 0 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:12px;border-left:4px solid #16a34a;">
  <tr><td style="padding:24px 28px;">
    <p style="color:#16a34a;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px 0;">✅ The Red Helix Standard</p>
    <p style="color:#1e293b;font-size:15px;line-height:1.7;margin:0 0 12px 0;">
      We operate on <strong>fair, transparent margins</strong> — not inflated ones. Every product ships with an independent, third-party <strong>Certificate of Analysis (COA)</strong> verifying purity via HPLC and mass spectrometry. No games. No mystery sourcing.
    </p>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0;">
      Our goal isn't to be the cheapest — it's to force a <strong style="color:#1e293b;">new standard of honesty</strong> in the research-use-only peptide community. When we grow, the entire market has to adjust.
    </p>
  </td></tr>
  </table>
</td>
</tr>

<!-- Education First Section -->
<tr>
<td style="padding:32px 40px 0 40px;">
  <p style="color:#1e293b;font-size:20px;font-weight:800;margin:0 0 8px 0;">📚 Education Comes First</p>
  <p style="color:#94a3b8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0 0 20px 0;">Knowledge is the foundation of good research</p>
  <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px 0;">
    We believe you should <strong>fully understand</strong> what you're working with before you purchase. That's why we've built the most comprehensive free education platform in the peptide space — and it's all available to you right now:
  </p>
</td>
</tr>

<!-- Tool 1: Health Benefit Matcher -->
<tr>
<td style="padding:0 40px 16px 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
  <tr><td style="padding:20px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="48" valign="top"><div style="width:40px;height:40px;background-color:#eff6ff;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">🎯</div></td>
      <td style="padding-left:16px;">
        <p style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 4px 0;">Health-Specific Peptide Matching</p>
        <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">Select specific health benefits and research areas — our tool matches you with clinically studied peptides proven to support that area. No guesswork, just science.</p>
        <a href="https://redhelixresearch.com/LearnMore" style="color:#dc2626;font-size:13px;font-weight:700;text-decoration:none;display:inline-block;margin-top:8px;">Explore the Database →</a>
      </td>
    </tr>
    </table>
  </td></tr>
  </table>
</td>
</tr>

<!-- Tool 2: Dosage Calculator -->
<tr>
<td style="padding:0 40px 16px 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
  <tr><td style="padding:20px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="48" valign="top"><div style="width:40px;height:40px;background-color:#fef3c7;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">⚗️</div></td>
      <td style="padding-left:16px;">
        <p style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 4px 0;">Peptide Reconstitution & Dosage Calculator</p>
        <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">Calculate exact volumes, concentrations, and dosages for any peptide. Supports BPC-157, TB-500, Semaglutide, and 25+ more. Precision matters in research.</p>
        <a href="https://redhelixresearch.com/PeptideCalculator" style="color:#dc2626;font-size:13px;font-weight:700;text-decoration:none;display:inline-block;margin-top:8px;">Open Calculator →</a>
      </td>
    </tr>
    </table>
  </td></tr>
  </table>
</td>
</tr>

<!-- Tool 3: Research Database -->
<tr>
<td style="padding:0 40px 16px 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
  <tr><td style="padding:20px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="48" valign="top"><div style="width:40px;height:40px;background-color:#f0fdf4;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">🧬</div></td>
      <td style="padding-left:16px;">
        <p style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 4px 0;">Clinical Research Database</p>
        <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">Compiled clinical data and research summaries that break down complex studies into clear, actionable insights. No more struggling through dense medical papers — we've done the heavy lifting for you.</p>
        <a href="https://redhelixresearch.com/BlogGuide" style="color:#dc2626;font-size:13px;font-weight:700;text-decoration:none;display:inline-block;margin-top:8px;">Browse Research Guides →</a>
      </td>
    </tr>
    </table>
  </td></tr>
  </table>
</td>
</tr>

<!-- Tool 4: Glossary -->
<tr>
<td style="padding:0 40px 16px 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
  <tr><td style="padding:20px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="48" valign="top"><div style="width:40px;height:40px;background-color:#faf5ff;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">📖</div></td>
      <td style="padding-left:16px;">
        <p style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 4px 0;">Peptide Glossary & Learning Academy</p>
        <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">40+ research terms defined in plain language, plus structured learning modules that take you from beginner to confident researcher.</p>
        <a href="https://redhelixresearch.com/PeptideGlossary" style="color:#dc2626;font-size:13px;font-weight:700;text-decoration:none;display:inline-block;margin-top:8px;">View Glossary →</a>
      </td>
    </tr>
    </table>
  </td></tr>
  </table>
</td>
</tr>

<!-- Tool 5: COA Reports -->
<tr>
<td style="padding:0 40px 16px 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
  <tr><td style="padding:20px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="48" valign="top"><div style="width:40px;height:40px;background-color:#fff7ed;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">🔍</div></td>
      <td style="padding-left:16px;">
        <p style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 4px 0;">Verified COA Reports</p>
        <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">Every batch tested by independent labs. View HPLC purity results, mass spectrometry data, and endotoxin panels — all publicly available before you buy.</p>
        <a href="https://redhelixresearch.com/COAReports" style="color:#dc2626;font-size:13px;font-weight:700;text-decoration:none;display:inline-block;margin-top:8px;">View COA Reports →</a>
      </td>
    </tr>
    </table>
  </td></tr>
  </table>
</td>
</tr>

<!-- Community CTA Section -->
<tr>
<td style="padding:32px 40px 0 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);border-radius:16px;">
  <tr><td style="padding:32px 28px;text-align:center;">
    <p style="color:#ffffff;font-size:20px;font-weight:800;margin:0 0 12px 0;">🤝 Join the Community</p>
    <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px 0;">
      This isn't just about buying peptides — it's about building something better <em>together</em>. Our community vets sources, shares research, holds vendors accountable, and pushes for industry-wide transparency.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr>
      <td style="padding:0 8px;">
        <a href="https://discord.gg/BwQHufvmQ8" style="display:inline-block;background-color:#5865F2;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:10px;letter-spacing:0.5px;">💬 Discord</a>
      </td>
      <td style="padding:0 8px;">
        <a href="https://t.me/Redhelixresearch" style="display:inline-block;background-color:#0088cc;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:10px;letter-spacing:0.5px;">📲 Telegram</a>
      </td>
      <td style="padding:0 8px;">
        <a href="https://www.tiktok.com/@redhelixresearch" style="display:inline-block;background-color:#000000;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:10px;letter-spacing:0.5px;">🎵 TikTok</a>
      </td>
    </tr>
    </table>
  </td></tr>
  </table>
</td>
</tr>

<!-- What You Can Do Section -->
<tr>
<td style="padding:32px 40px 0 40px;">
  <p style="color:#1e293b;font-size:18px;font-weight:800;margin:0 0 20px 0;">💪 How You Can Help</p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
  <tr>
    <td width="28" valign="top" style="padding-top:2px;"><span style="color:#dc2626;font-weight:900;">1.</span></td>
    <td style="padding-left:8px;padding-bottom:12px;">
      <p style="color:#1e293b;font-size:14px;font-weight:700;margin:0 0 2px 0;">Spread the Word</p>
      <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">Tell fellow researchers about fair pricing. The more people who demand transparency, the faster the industry changes.</p>
    </td>
  </tr>
  <tr>
    <td width="28" valign="top" style="padding-top:2px;"><span style="color:#dc2626;font-weight:900;">2.</span></td>
    <td style="padding-left:8px;padding-bottom:12px;">
      <p style="color:#1e293b;font-size:14px;font-weight:700;margin:0 0 2px 0;">Join Our Vetting Efforts</p>
      <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">Our community actively reviews and verifies peptide sources, shares lab results, and flags bad actors. Your expertise matters.</p>
    </td>
  </tr>
  <tr>
    <td width="28" valign="top" style="padding-top:2px;"><span style="color:#dc2626;font-weight:900;">3.</span></td>
    <td style="padding-left:8px;padding-bottom:12px;">
      <p style="color:#1e293b;font-size:14px;font-weight:700;margin:0 0 2px 0;">Participate in Group Buys</p>
      <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">Pool orders with other researchers to unlock even deeper discounts. Collective buying power is how we keep margins honest.</p>
    </td>
  </tr>
  <tr>
    <td width="28" valign="top" style="padding-top:2px;"><span style="color:#dc2626;font-weight:900;">4.</span></td>
    <td style="padding-left:8px;padding-bottom:12px;">
      <p style="color:#1e293b;font-size:14px;font-weight:700;margin:0 0 2px 0;">Share Your Research</p>
      <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">Contribute findings, ask questions, and help build the largest open-knowledge peptide research community online.</p>
    </td>
  </tr>
  </table>
</td>
</tr>

<!-- CTA Button -->
<tr>
<td style="padding:24px 40px 0 40px;text-align:center;">
  <a href="https://redhelixresearch.com/Products" style="display:inline-block;background-color:#dc2626;color:#ffffff;font-size:15px;font-weight:800;text-decoration:none;padding:16px 48px;border-radius:14px;letter-spacing:1px;text-transform:uppercase;">🛒 Explore Our Products</a>
</td>
</tr>

<!-- Quality Promise -->
<tr>
<td style="padding:32px 40px 0 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;padding-top:24px;">
  <tr>
    <td width="33%" style="text-align:center;padding:0 8px;">
      <p style="font-size:20px;margin:0 0 4px 0;">🧪</p>
      <p style="color:#1e293b;font-size:12px;font-weight:800;margin:0;">HPLC Verified</p>
      <p style="color:#94a3b8;font-size:11px;margin:0;">>98% Purity</p>
    </td>
    <td width="33%" style="text-align:center;padding:0 8px;">
      <p style="font-size:20px;margin:0 0 4px 0;">📋</p>
      <p style="color:#1e293b;font-size:12px;font-weight:800;margin:0;">Third-Party COA</p>
      <p style="color:#94a3b8;font-size:11px;margin:0;">Every Batch</p>
    </td>
    <td width="33%" style="text-align:center;padding:0 8px;">
      <p style="font-size:20px;margin:0 0 4px 0;">🇺🇸</p>
      <p style="color:#1e293b;font-size:12px;font-weight:800;margin:0;">USA Based</p>
      <p style="color:#94a3b8;font-size:11px;margin:0;">Fast Shipping</p>
    </td>
  </tr>
  </table>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:32px 40px 40px 40px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;padding-top:24px;">
  <tr><td style="text-align:center;">
    <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0 0 8px 0;">
      Questions? Reply to this email or reach us at<br />
      <a href="mailto:jake@redhelixresearch.com" style="color:#dc2626;text-decoration:none;font-weight:700;">jake@redhelixresearch.com</a>
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
      subject: '🔬 Welcome to Red Helix Research — Here\'s Why We\'re Different',
      body: emailBody,
      from_name: 'Red Helix Research'
    });

    base44.analytics.track({
      eventName: 'welcome_email_sent',
      properties: {
        email: email,
        first_name: firstName
      }
    });

    return Response.json({
      success: true,
      message: 'Welcome email sent',
      result
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
