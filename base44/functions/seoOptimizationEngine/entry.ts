import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch (_e) { /* scheduled */ }
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }
    return Response.json({ ok: true, message: 'SEO engine stub — deploy test' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});