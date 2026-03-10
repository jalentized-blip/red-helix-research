import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, group_buy_id, amount_cents, nonce, participant_name, participant_email, escrow_id, square_payment_link_id, checkout_url } = body;

    const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN');
    const headers = {
      'Square-Version': '2024-02-22',
      'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    };

    // --- ACTION: record_pending (payment link sent, awaiting completion) ---
    if (action === 'record_pending') {
      const { square_payment_link_id, checkout_url } = await req.json().catch(() => ({}));
      if (!amount_cents || !group_buy_id || !participant_email) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Record escrow contribution as held (Square payment link = committed)
      const escrow = await base44.asServiceRole.entities.GroupBuyEscrow.create({
        group_buy_id,
        participant_name,
        participant_email,
        amount_cents,
        square_payment_id: square_payment_link_id || null,
        status: 'held',
        notes: checkout_url ? `Payment link: ${checkout_url}` : 'Payment link sent',
      });

      // Update group buy escrow balance
      const groupBuy = await base44.asServiceRole.entities.GroupBuyTest.get(group_buy_id);
      const newBalance = (groupBuy.escrow_balance_cents || 0) + amount_cents;
      await base44.asServiceRole.entities.GroupBuyTest.update(group_buy_id, {
        escrow_balance_cents: newBalance,
      });

      return Response.json({ success: true, escrow_id: escrow.id });
    }

    // --- ACTION: refund (admin only) ---
    if (action === 'refund') {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      if (!escrow_id) return Response.json({ error: 'Missing escrow_id' }, { status: 400 });

      const escrow = await base44.asServiceRole.entities.GroupBuyEscrow.get(escrow_id);
      if (!escrow) return Response.json({ error: 'Escrow not found' }, { status: 404 });
      if (escrow.status !== 'held') return Response.json({ error: 'Already processed' }, { status: 400 });

      // Issue Square refund
      const refundRes = await fetch('https://connect.squareup.com/v2/refunds', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          payment_id: escrow.square_payment_id,
          amount_money: { amount: escrow.amount_cents, currency: 'USD' },
          reason: 'Group buy escrow refund',
        }),
      });

      const refundData = await refundRes.json();
      if (!refundRes.ok || refundData.errors) {
        return Response.json({ error: refundData.errors?.[0]?.detail || 'Refund failed' }, { status: 400 });
      }

      await base44.asServiceRole.entities.GroupBuyEscrow.update(escrow_id, {
        status: 'refunded',
        refunded_at: new Date().toISOString(),
      });

      // Deduct from group buy balance
      const groupBuy = await base44.asServiceRole.entities.GroupBuyTest.get(escrow.group_buy_id);
      await base44.asServiceRole.entities.GroupBuyTest.update(escrow.group_buy_id, {
        escrow_balance_cents: Math.max(0, (groupBuy.escrow_balance_cents || 0) - escrow.amount_cents),
      });

      return Response.json({ success: true });
    }

    // --- ACTION: release (admin marks as released to lab) ---
    if (action === 'release') {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      const contributions = await base44.asServiceRole.entities.GroupBuyEscrow.filter({ group_buy_id, status: 'held' });
      for (const c of contributions) {
        await base44.asServiceRole.entities.GroupBuyEscrow.update(c.id, {
          status: 'released_to_lab',
          released_at: new Date().toISOString(),
        });
      }
      await base44.asServiceRole.entities.GroupBuyTest.update(group_buy_id, { status: 'testing' });

      return Response.json({ success: true, released_count: contributions.length });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});