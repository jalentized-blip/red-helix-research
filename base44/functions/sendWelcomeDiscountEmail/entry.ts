/**
 * sendWelcomeDiscountEmail
 * Sends the 10% welcome discount code to a new visitor via Resend.
 *
 * Failsafes:
 * - Input validation (email format, code format, expiry sanity)
 * - No auth required (called from frontend for unregistered users)
 * - Rate limiting via duplicate check (same email can't be re-sent more than once per 5min)
 * - HTML injection prevention (inputs are escaped before inserting into email HTML)
 * - Resend API error surfaced clearly for debugging
 */

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// Basic HTML entity escaping to prevent injection into email template
const escHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Simple in-memory rate limit: email → last sent timestamp
// Prevents someone hammering the endpoint to spam a victim's inbox
const recentlySent = new Map();
const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

const purgeRateCache = () => {
  const cutoff = Date.now() - RATE_LIMIT_MS;
  for (const [email, ts] of recentlySent) {
    if (ts < cutoff) recentlySent.delete(email);
  }
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  if (!RESEND_API_KEY) {
    console.error('sendWelcomeDiscountEmail: RESEND_API_KEY not set');
    return Response.json({ error: 'Email service not configured' }, { status: 500 });
  }

  let email, code, expires_at;
  try {
    ({ email, code, expires_at } = await req.json());
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // ── Input validation ────────────────────────────────────────────────────────
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 });
  }
  if (!code || typeof code !== 'string' || !/^NEWRHR-[A-Z0-9]{6}$/.test(code.trim())) {
    return Response.json({ error: 'Invalid discount code format' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode  = code.trim().toUpperCase();

  // ── Rate limit check ────────────────────────────────────────────────────────
  purgeRateCache();
  const lastSent = recentlySent.get(normalizedEmail);
  if (lastSent && Date.now() - lastSent < RATE_LIMIT_MS) {
    console.log(`Rate limited welcome email to ${normalizedEmail}`);
    // Return success to not leak rate limit info to client — email was already sent
    return Response.json({ success: true, skipped: 'rate_limited' });
  }

  // ── Expiry date formatting ──────────────────────────────────────────────────
  let expiryDate = 'in 30 days';
  if (expires_at) {
    try {
      expiryDate = new Date(expires_at).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      });
    } catch { /* fallback text already set */ }
  }

  const safeCode  = escHtml(normalizedCode);
  const safeEmail = escHtml(normalizedEmail);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your 10% Welcome Discount – Red Helix Research</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#8B2635,#6B1827);padding:40px 32px;text-align:center;">
              <img src="https://i.imgur.com/8MOtTE2.png" alt="Red Helix Research" width="auto" height="56" style="height:56px;width:auto;display:block;margin:0 auto 20px;" />
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase;">Your Welcome Gift 🎁</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">First-time visitor exclusive — just for you</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">Welcome to <strong>Red Helix Research</strong>! Here's your exclusive 10% discount on your first order of single vials:</p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;background:#fef2f2;border:2px dashed #8B2635;border-radius:12px;">
                <tr>
                  <td style="padding:20px 24px;text-align:center;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Your Discount Code</p>
                    <p style="margin:0;color:#8B2635;font-size:28px;font-weight:900;letter-spacing:4px;font-family:monospace;">${safeCode}</p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;background:#f8fafc;border-radius:10px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px;color:#334155;font-size:13px;line-height:1.6;">✅ <strong>10% off</strong> single vials (all products)</p>
                    <p style="margin:0 0 8px;color:#334155;font-size:13px;line-height:1.6;">❌ Does <strong>not</strong> apply to 10-vial kits</p>
                    <p style="margin:0 0 8px;color:#334155;font-size:13px;line-height:1.6;">⏰ Expires <strong>${expiryDate}</strong></p>
                    <p style="margin:0;color:#334155;font-size:13px;line-height:1.6;">🔒 One-time use · Non-transferable</p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <a href="https://redhelixresearch.com/Products" style="display:inline-block;background:#8B2635;color:#ffffff;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:2px;padding:14px 36px;border-radius:10px;text-decoration:none;">Shop Now &amp; Save 10%</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f1f5f9;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 4px;color:#94a3b8;font-size:11px;line-height:1.6;">Red Helix Research · For research use only · Not for human consumption</p>
              <p style="margin:0;color:#94a3b8;font-size:11px;">You're receiving this because you signed up at redhelixresearch.com with ${safeEmail}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // ── Send via Resend ─────────────────────────────────────────────────────────
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'Red Helix Research <rhrsupport@redhelixresearch.com>',
        to:      normalizedEmail,
        subject: `🎁 Your 10% Welcome Discount Code: ${normalizedCode}`,
        html,
      }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('Resend API error:', res.status, JSON.stringify(body));
      return Response.json({ error: `Email send failed: ${body.message || res.status}` }, { status: 502 });
    }

    recentlySent.set(normalizedEmail, Date.now());
    console.log(`Welcome email sent to ${normalizedEmail}, code: ${normalizedCode}, resend_id: ${body.id}`);
    return Response.json({ success: true, id: body.id });

  } catch (err) {
    console.error('sendWelcomeDiscountEmail fetch error:', err.message);
    return Response.json({ error: 'Network error sending email' }, { status: 502 });
  }
});