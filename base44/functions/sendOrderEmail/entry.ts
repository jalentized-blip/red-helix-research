import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // No user-auth required — this is called during guest checkout flows.
    // Abuse protection: validate that recipient email is well-formed below.
    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return Response.json({ error: 'Missing to, subject, or body' }, { status: 400 });
    }
    // Basic abuse guard: recipient must look like an email address
    if (typeof to !== 'string' || !to.includes('@')) {
      return Response.json({ error: 'Invalid recipient address' }, { status: 400 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Red Helix Research <rhrsupport@redhelixresearch.com>',
        to,
        subject,
        html: body,
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