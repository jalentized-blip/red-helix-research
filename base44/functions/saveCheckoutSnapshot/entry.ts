import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Saves a checkout snapshot immediately when customer starts checkout.
 * This is a FAILSAFE — even if the order DB write fails later, admin gets an email
 * with ALL order details so no customer data is ever lost.
 * 
 * Called at the start of every checkout method, before payment is initiated.
 */

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const {
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      discountAmount,
      shippingCost,
      totalAmount,
      promoCode,
      shippingAddress,
      paymentMethod,
    } = body;

    if (!orderNumber || !customerEmail || !items?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Persist a durable snapshot of the checkout state. The admin alert email
    // below is a backup, but the entity record is the canonical recovery source
    // for the new recoverOrderSpec function when an Order's items get corrupted.
    base44.asServiceRole.entities.OrderSnapshot.create({
      order_number: orderNumber,
      customer_email: customerEmail,
      customer_name: customerName,
      customer_phone: customerPhone,
      items,
      subtotal,
      discount_amount: discountAmount,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      promo_code: promoCode,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      captured_at: new Date().toISOString(),
    }).catch(e => console.warn('OrderSnapshot.create failed (non-blocking, email backup still sent):', e?.message || e));

    const BASE_URL = 'https://redhelixresearch.com';
    const itemsText = items.map(i => `  • ${i.productName} (${i.specification || '—'}) x${i.quantity} = $${(i.price * i.quantity).toFixed(2)}\n    🔗 ${BASE_URL}/Products?search=${encodeURIComponent(i.productName)}`).join('\n');
    const addrText = shippingAddress
      ? `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`
      : 'Not provided';

    // Send admin alert immediately with ALL order data as a backup
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'jake@redhelixresearch.com',
      from_name: 'Red Helix Research — Checkout Snapshot',
      subject: `📋 Checkout Started: #${orderNumber} — ${customerName} — $${Number(totalAmount).toFixed(2)} [${(paymentMethod || 'unknown').toUpperCase()}]`,
      body: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#fff;">
  <div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:12px;padding:16px;margin-bottom:24px;">
    <h2 style="margin:0 0 4px;color:#92400e;font-size:18px;">📋 Checkout Snapshot — Order Data Backup</h2>
    <p style="margin:0;color:#a16207;font-size:13px;">This email is sent immediately when a customer starts checkout. If you never see a "New Order" email for this order number, the DB write may have failed — use the data below to manually create the order.</p>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
    <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;width:35%;">Order #</td><td style="padding:6px 0;font-weight:900;font-size:15px;color:#dc2626;">${orderNumber}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;">Customer</td><td style="padding:6px 0;font-weight:700;">${customerName}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;">Email</td><td style="padding:6px 0;">${customerEmail}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;">Phone</td><td style="padding:6px 0;">${customerPhone || 'Not provided'}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;">Payment</td><td style="padding:6px 0;">${paymentMethod || 'Unknown'}</td></tr>
    <tr><td style="padding:6px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;">Ship To</td><td style="padding:6px 0;">${addrText}</td></tr>
  </table>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:16px;">
    <p style="margin:0 0 8px;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Items Ordered</p>
    <pre style="margin:0;font-size:13px;color:#334155;white-space:pre-wrap;font-family:monospace;">${items.map(i => {
      const productUrl = `${BASE_URL}/Products?search=${encodeURIComponent(i.productName)}`;
      return `• ${i.productName} (${i.specification || '—'}) x${i.quantity} = $${(i.price * i.quantity).toFixed(2)}\n  <a href="${productUrl}" style="color:#dc2626;font-size:11px;">🔗 View Product →</a>`;
    }).join('\n\n')}</pre>
  </div>

  <table style="width:100%;border-collapse:collapse;">
    ${promoCode ? `<tr><td style="padding:4px 0;color:#16a34a;">Promo Code</td><td style="text-align:right;color:#16a34a;">${promoCode}</td></tr>` : ''}
    ${discountAmount > 0 ? `<tr><td style="padding:4px 0;color:#16a34a;">Discount</td><td style="text-align:right;color:#16a34a;">-$${Number(discountAmount).toFixed(2)}</td></tr>` : ''}
    <tr><td style="padding:4px 0;color:#64748b;">Shipping</td><td style="text-align:right;color:#64748b;">$${Number(shippingCost).toFixed(2)}</td></tr>
    <tr><td style="padding:6px 0;font-size:16px;font-weight:900;color:#0f172a;">TOTAL</td><td style="text-align:right;font-size:20px;font-weight:900;color:#dc2626;">$${Number(totalAmount).toFixed(2)}</td></tr>
  </table>

  <p style="margin-top:24px;font-size:11px;color:#94a3b8;">
    Admin panel: <a href="https://redhelixresearch.com/AdminOrderManagement" style="color:#dc2626;">Order Management →</a><br/>
    Snapshot time: ${new Date().toISOString()}
  </p>
</div>`,
    });

    return Response.json({ success: true, message: 'Snapshot saved and admin notified' });
  } catch (error) {
    console.error('saveCheckoutSnapshot error:', error);
    // Never fail hard — this is a best-effort backup
    return Response.json({ success: false, error: error.message });
  }
});