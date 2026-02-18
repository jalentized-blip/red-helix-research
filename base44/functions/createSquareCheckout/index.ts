import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let body: any;
    try {
      body = await req.json();
    } catch (parseErr) {
      return Response.json({ error: 'Invalid request body', details: String(parseErr) }, { status: 400 });
    }

    const { items, customerEmail, customerName, orderNumber, promoCode, discountAmount, shippingCost } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Missing or empty items array', receivedKeys: Object.keys(body || {}) }, { status: 400 });
    }

    // Build Square line items from cart items
    const lineItems = items.map((item: any) => ({
      name: `${item.productName || 'Item'}${item.specification ? ' - ' + item.specification : ''}`,
      quantity: String(item.quantity || 1),
      base_price_money: {
        amount: Math.round((item.price || 0) * 100),
        currency: 'USD',
      },
    }));

    // Add shipping as a line item if present
    if (shippingCost && shippingCost > 0) {
      lineItems.push({
        name: 'Shipping & Handling',
        quantity: '1',
        base_price_money: { amount: Math.round(shippingCost * 100), currency: 'USD' },
      });
    }

    // Build the order object
    const orderObj: any = {
      location_id: 'L3WTCJAQGSP5G',
      line_items: lineItems,
    };

    // Add discount if applicable
    if (discountAmount && discountAmount > 0) {
      orderObj.discounts = [{
        name: promoCode ? `Promo: ${promoCode}` : 'Discount',
        amount_money: { amount: Math.round(discountAmount * 100), currency: 'USD' },
        scope: 'ORDER',
      }];
    }

    const squareBody: any = {
      idempotency_key: `rhr-${orderNumber || Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
      order: orderObj,
      checkout_options: {
        ask_for_shipping_address: true,
        merchant_support_email: 'jake@redhelixresearch.com',
      },
    };

    if (customerEmail) {
      squareBody.pre_populated_data = { buyer_email: customerEmail };
    }

    if (orderNumber) {
      squareBody.payment_note = `Order: ${orderNumber}`;
    }

    // Call Square API to create payment link
    let squareRes: Response;
    try {
      squareRes = await fetch('https://connect.squareup.com/v2/online-checkout/payment-links', {
        method: 'POST',
        headers: {
          'Square-Version': '2025-01-23',
          'Authorization': 'Bearer EAAAl1jVckeTNXaK3mxKgcL_VzKUPtny1RzRoeMhHhyvFg5EkBYAw0Qz2DPwDjGK',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(squareBody),
      });
    } catch (fetchErr: any) {
      return Response.json(
        { error: 'Failed to reach Square API', details: fetchErr?.message || String(fetchErr) },
        { status: 502 }
      );
    }

    let squareData: any;
    try {
      squareData = await squareRes.json();
    } catch (jsonErr: any) {
      return Response.json(
        { error: 'Failed to parse Square response', status: squareRes.status, details: jsonErr?.message },
        { status: 502 }
      );
    }

    if (!squareRes.ok) {
      return Response.json(
        { error: 'Square API error', status: squareRes.status, details: squareData },
        { status: squareRes.status }
      );
    }

    const paymentLink = squareData.payment_link;
    const checkoutUrl = paymentLink?.url || paymentLink?.long_url;

    if (!checkoutUrl) {
      return Response.json(
        { error: 'No checkout URL in Square response', details: squareData },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      checkoutUrl,
      paymentLinkId: paymentLink?.id,
      orderId: paymentLink?.order_id,
    });

  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Internal server error', stack: String(error) },
      { status: 500 }
    );
  }
});
