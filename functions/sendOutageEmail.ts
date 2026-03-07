import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { to, customerName = 'Valued Customer' } = await req.json();

    if (!to) {
      return Response.json({ error: 'Missing recipient email' }, { status: 400 });
    }

    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Important Order Update - Red Helix Research</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px auto;">
                <tr>
                  <td style="background-color:#8B2635;border-radius:12px;width:56px;height:56px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:22px;font-weight:900;letter-spacing:-1px;line-height:56px;">RH</span>
                  </td>
                </tr>
              </table>
              <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 6px 0;letter-spacing:-0.3px;">Important Order Update</h1>
              <p style="color:#94a3b8;font-size:11px;font-weight:700;margin:0;letter-spacing:2px;text-transform:uppercase;">Red Helix Research</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 40px 0 40px;">

              <p style="color:#0f172a;font-size:16px;font-weight:700;margin:0 0 16px 0;">Hi ${customerName},</p>

              <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 24px 0;">
                We want to reach out personally to <strong style="color:#0f172a;">sincerely apologize</strong> for an issue that affected your recent order. Your trust means everything to us, and we are truly sorry for the inconvenience this has caused.
              </p>

              <!-- RED ALERT BOX -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
                <tr>
                  <td style="background:linear-gradient(135deg,#fef2f2,#fff5f5);border:1px solid #fecaca;border-left:4px solid #8B2635;border-radius:10px;padding:20px 24px;">
                    <p style="color:#7f1d1d;font-size:11px;font-weight:800;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:1px;">What Happened</p>
                    <p style="color:#991b1b;font-size:13px;line-height:1.8;margin:0;">
                      Our order management system experienced a <strong>temporary outage</strong> that caused some order details to not be saved correctly on our end. Your payment was received successfully — this was entirely a technical issue on our side, and we take full responsibility.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 24px 0;">
                To ensure we fulfill your order quickly and accurately, <strong style="color:#0f172a;">could you please reply to this email with the items you ordered?</strong> A simple list is all we need — product name and quantity. Once we receive your reply, we will prioritize your shipment immediately.
              </p>

              <!-- GREEN PROMISE BOX -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
                <tr>
                  <td style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px 24px;">
                    <p style="color:#14532d;font-size:11px;font-weight:800;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:1px;">Our Promise to You</p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:#16a34a;font-size:14px;margin-right:8px;">✓</span>
                          <span style="color:#166534;font-size:13px;">Your payment was received — your order <strong>will be fulfilled</strong></span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:#16a34a;font-size:14px;margin-right:8px;">✓</span>
                          <span style="color:#166534;font-size:13px;">We will prioritize your shipment the moment we hear back</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:#16a34a;font-size:14px;margin-right:8px;">✓</span>
                          <span style="color:#166534;font-size:13px;">Your peptides will be packaged with our full quality standards</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:#16a34a;font-size:14px;margin-right:8px;">✓</span>
                          <span style="color:#166534;font-size:13px;">We are here for any questions or concerns you may have</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- REPLY CTA BOX -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
                <tr>
                  <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;text-align:center;">
                    <p style="color:#0f172a;font-size:14px;font-weight:700;margin:0 0 6px 0;">Simply reply to this email with your order details</p>
                    <p style="color:#94a3b8;font-size:12px;margin:0;">Or reach us directly at <a href="mailto:jake@redhelixresearch.com" style="color:#8B2635;font-weight:700;text-decoration:none;">jake@redhelixresearch.com</a></p>
                  </td>
                </tr>
              </table>

              <p style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 8px 0;">
                Again, we are truly sorry for this experience. You chose Red Helix Research because you trust the quality and reliability we stand behind — and we are committed to making this right.
              </p>

              <p style="color:#0f172a;font-size:14px;font-weight:700;margin:0 0 40px 0;">— The Red Helix Research Team</p>

            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;">
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px 40px;text-align:center;background-color:#f8fafc;">
              <p style="color:#94a3b8;font-size:11px;font-weight:600;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:1px;">Red Helix Research</p>
              <p style="color:#94a3b8;font-size:11px;margin:0;">
                <a href="mailto:jake@redhelixresearch.com" style="color:#8B2635;text-decoration:none;font-weight:600;">jake@redhelixresearch.com</a>
                &nbsp;·&nbsp;
                <a href="https://redhelixresearch.com" style="color:#8B2635;text-decoration:none;font-weight:600;">redhelixresearch.com</a>
              </p>
              <p style="color:#cbd5e1;font-size:10px;margin:10px 0 0 0;">For research use only. Not for human consumption.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const result = await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      subject: 'Important Update Regarding Your Order — Red Helix Research',
      body: htmlBody,
      from_name: 'Red Helix Research'
    });

    return Response.json({ success: true, result });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});