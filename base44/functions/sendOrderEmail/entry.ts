import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return Response.json({ error: 'Missing to, subject, or body' }, { status: 400 });
    }

    // Use service role to bypass user auth restrictions on SendEmail
    const base44 = createClientFromRequest(req);

    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'Red Helix Research',
      to,
      subject,
      body,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});