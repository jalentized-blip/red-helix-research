import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN');
const SQUARE_LOCATION_ID = Deno.env.get('SQUARE_LOCATION_ID');

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      items,
      customerEmail,
      customerName,
      orderNumber,
      promoCode,
      discountAmount,
      shippingCost,
      processingFeeAmount,
      turnstileToken,
      shippingAddress,
      billingAddress,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'No items provided' }, { status: 400 });
    }

    if (!SQUARE_ACCESS_TOKEN) {
      return Response.json({ error: 'Square not configured' }, { status: 500 });
    }

    // Build Square line items — use order number instead of product names
    const lineItems = items.map((item, idx) => ({
      name: `Order ${orderNumber} — Item ${idx + 1}`,
      quantity: String(item.quantity || 1),
      base_price_money: {
        amount: Math.round(item.price * 100), // cents
        currency: 'USD',
      },
    }));

    // Always add $15 flat rate shipping
    const finalShippingCost = (shippingCost && shippingCost > 0) ? shippingCost : 15;
    lineItems.push({
      name: 'Shipping (Flat Rate)',
      quantity: '1',
      base_price_money: {
        amount: Math.round(finalShippingCost * 100),
        currency: 'USD',
      },
    });

    // Add processing fee as a line item
    if (processingFeeAmount && processingFeeAmount > 0) {
      lineItems.push({
        name: 'Processing Fee (10%)',
        quantity: '1',
        base_price_money: {
          amount: Math.round(processingFeeAmount * 100),
          currency: 'USD',
        },
      });
    }

    // Build discounts array for Square (Square does not allow negative line item amounts)
    const discounts = [];
    if (discountAmount && discountAmount > 0) {
      discounts.push({
        name: `Discount${promoCode ? ` (${promoCode})` : ''}`,
        amount_money: {
          amount: Math.round(discountAmount * 100),
          currency: 'USD',
        },
        scope: 'ORDER',
      });
    }

    // Determine location ID
    let locationId = SQUARE_LOCATION_ID;
    if (!locationId) {
      // Auto-fetch location ID
      const locRes = await fetch('https://connect.squareup.com/v2/locations', {
        headers: {
          'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
          'Square-Version': '2024-01-18',
        },
      });
      const locData = await locRes.json();
      locationId = locData.locations?.[0]?.id;
      if (!locationId) {
        return Response.json({ error: 'No Square location found' }, { status: 500 });
      }
    }

    const idempotencyKey = `${orderNumber}-${Date.now()}`;

    // Create Square payment link
    const squareRes = await fetch('https://connect.squareup.com/v2/online-checkout/payment-links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        quick_pay: undefined,
        order: {
          location_id: locationId,
          reference_id: orderNumber,
          line_items: lineItems,
          ...(discounts.length > 0 ? { discounts } : {}),
          metadata: {
            order_number: orderNumber,
            customer_name: customerName || '',
          },
        },
        checkout_options: {
          allow_tipping: false,
          redirect_url: `https://redhelixresearch.com/PaymentCompleted?order=${orderNumber}`,
          merchant_support_email: 'jake@redhelixresearch.com',
          ask_for_shipping_address: false,
        },
        pre_populated_data: {
          buyer_email: customerEmail,
          buyer_address: shippingAddress ? {
            address_line_1: shippingAddress.address,
            locality: shippingAddress.city,
            administrative_district_level_1: shippingAddress.state,
            postal_code: shippingAddress.zip,
            country: 'US',
          } : undefined,
        },
      }),
    });

    const squareData = await squareRes.json();

    if (!squareRes.ok || !squareData.payment_link) {
      console.error('Square API error:', JSON.stringify(squareData));
      return Response.json({
        error: squareData.errors?.[0]?.detail || 'Failed to create Square payment link',
      }, { status: 500 });
    }

    return Response.json({
      checkoutUrl: squareData.payment_link.url,
      paymentLinkId: squareData.payment_link.id,
      orderId: squareData.payment_link.order_id,
    });

  } catch (error) {
    console.error('createSquareCheckout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});