// ⚠ DEPRECATED — this file is NOT the deployed entrypoint for createSquareCheckout.
//   function.jsonc deploys index.ts. Any edits here are dead code.
//   Make changes in index.ts instead. This file is retained only to avoid
//   churning history during refactors; do not extend it.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN');
const SQUARE_LOCATION_ID = Deno.env.get('SQUARE_LOCATION_ID');

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const {
      items,
      customerEmail,
      customerName,
      orderNumber,
      promoCode,
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

    // Server-validate items + promo to defeat frontend price/promo tampering.
    // validateOrder re-fetches authoritative prices from the Product DB and
    // applies promo rules server-side (including welcome-promo singleVialsOnly).
    // The request's discountAmount and item.price are NOT trusted; we use the
    // server-validated values below.
    let validation;
    try {
      const validationRes = await base44.asServiceRole.functions.invoke('validateOrder', {
        action: 'validate_order',
        items,
        promoCode,
      });
      validation = validationRes?.data || validationRes;
    } catch (err) {
      console.error('createSquareCheckout: validateOrder invoke failed:', err.message);
      return Response.json({ error: 'Order validation failed — please try again' }, { status: 502 });
    }

    if (!validation?.valid) {
      return Response.json({ error: validation?.error || 'Order failed server-side validation' }, { status: 400 });
    }

    const validatedItems = validation.validatedItems || [];
    const serverDiscount = validation.discount || 0;

    const lineItems = validatedItems.map((item, idx) => ({
      name: `Order ${orderNumber} — Item ${idx + 1}`,
      quantity: String(item.quantity || 1),
      base_price_money: {
        amount: Math.round(item.price * 100),
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
    if (serverDiscount > 0) {
      discounts.push({
        name: `Discount${promoCode ? ` (${promoCode})` : ''}`,
        amount_money: {
          amount: Math.round(serverDiscount * 100),
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
      // Server-validated amounts so the Order entity matches what Square charged.
      // Frontend should prefer these over its locally-computed values.
      validated: {
        subtotal: validation.subtotal,
        discount: serverDiscount,
        shipping: finalShippingCost,
        processingFee: processingFeeAmount || 0,
        totalAmount: validation.subtotal - serverDiscount + finalShippingCost + (processingFeeAmount || 0),
        validatedPromo: validation.validatedPromo || null,
        welcomeDiscountId: validation.welcomeDiscountId || null,
        discountNote: validation.discountNote || null,
      },
    });

  } catch (error) {
    console.error('createSquareCheckout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});