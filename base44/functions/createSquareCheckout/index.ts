import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SQUARE_ACCESS_TOKEN = 'EAAAl1jVckeTNXaK3mxKgcL_VzKUPtny1RzRoeMhHhyvFg5EkBYAw0Qz2DPwDjGK';
const SQUARE_LOCATION_ID = 'L3WTCJAQGSP5G';
const SQUARE_API_URL = 'https://connect.squareup.com/v2/online-checkout/payment-links';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { items, customerEmail, customerName, orderNumber, promoCode, discountAmount, shippingCost } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Missing or empty items array' }, { status: 400 });
    }

    // Build Square line items from cart items
    const lineItems = items.map((item: any) => ({
      name: `${item.productName}${item.specification ? ' — ' + item.specification : ''}`,
      quantity: String(item.quantity || 1),
      base_price_money: {
        amount: Math.round((item.price || 0) * 100), // Convert dollars to cents
        currency: 'USD',
      },
    }));

    // Add shipping as a line item if present
    if (shippingCost && shippingCost > 0) {
      lineItems.push({
        name: 'Shipping & Handling',
        quantity: '1',
        base_price_money: {
          amount: Math.round(shippingCost * 100),
          currency: 'USD',
        },
      });
    }

    // Build the order object
    const orderObj: any = {
      location_id: SQUARE_LOCATION_ID,
      line_items: lineItems,
    };

    // Add discount if applicable
    if (discountAmount && discountAmount > 0) {
      orderObj.discounts = [
        {
          name: promoCode ? `Promo: ${promoCode}` : 'Discount',
          amount_money: {
            amount: Math.round(discountAmount * 100),
            currency: 'USD',
          },
          scope: 'ORDER',
        },
      ];
    }

    // Build the payment link request
    const requestBody: any = {
      idempotency_key: `rhr-${orderNumber || Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
      order: orderObj,
      checkout_options: {
        ask_for_shipping_address: true,
        merchant_support_email: 'jake@redhelixresearch.com',
      },
    };

    // Pre-populate customer data if available
    if (customerEmail || customerName) {
      requestBody.pre_populated_data = {};
      if (customerEmail) {
        requestBody.pre_populated_data.buyer_email = customerEmail;
      }
    }

    if (orderNumber) {
      requestBody.payment_note = `Order: ${orderNumber}`;
    }

    // Call Square API to create payment link
    const squareRes = await fetch(SQUARE_API_URL, {
      method: 'POST',
      headers: {
        'Square-Version': '2026-01-22',
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const squareData = await squareRes.json();

    if (!squareRes.ok) {
      console.error('Square API error:', JSON.stringify(squareData));
      return Response.json(
        { error: 'Failed to create Square checkout', details: squareData },
        { status: squareRes.status }
      );
    }

    const paymentLink = squareData.payment_link;
    const checkoutUrl = paymentLink?.url || paymentLink?.long_url;

    if (!checkoutUrl) {
      return Response.json(
        { error: 'Square returned no checkout URL', details: squareData },
        { status: 500 }
      );
    }

    // Track the event
    try {
      base44.analytics.track({
        eventName: 'square_checkout_created',
        properties: {
          order_number: orderNumber,
          customer_email: customerEmail,
          total_items: items.length,
          checkout_url: checkoutUrl,
        },
      });
    } catch (_trackErr) {
      // non-blocking
    }

    return Response.json({
      success: true,
      checkoutUrl,
      paymentLinkId: paymentLink?.id,
      orderId: paymentLink?.order_id,
    });

  } catch (error) {
    console.error('createSquareCheckout error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});
