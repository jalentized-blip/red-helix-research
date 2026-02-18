// ============================================================================
// createSquareCheckout — Secured Server-Side Checkout
// ============================================================================
// Security layers:
//   0. Cloudflare Turnstile verification (bot protection)
//   1. Server-side price catalog (uses server price when available, flags mismatches)
//   2. Rate limiting (per-email + global)
//   3. Input validation (quantities, amounts, email)
//   4. Server-side promo/discount validation
//   5. Request logging & fraud signals
//   6. ZERO product metadata sent to Square — only generic codes + prices
// ============================================================================

const TURNSTILE_SECRET_KEY = '0x4AAAAAACfCmfXN08E0PuGUsBRffIvY_FE';
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const SQUARE_ACCESS_TOKEN = 'EAAAl1jVckeTNXaK3mxKgcL_VzKUPtny1RzRoeMhHhyvFg5EkBYAw0Qz2DPwDjGK';
const SQUARE_LOCATION_ID = 'L3WTCJAQGSP5G';
const SQUARE_API_URL = 'https://connect.squareup.com/v2/online-checkout/payment-links';
const SHIPPING_COST = 15; // Fixed shipping in dollars

// ---------------------------------------------------------------------------
// 1. SERVER-SIDE PRICE CATALOG
//    When a product is in this catalog, the server price OVERRIDES client price.
//    Products NOT in catalog (blends, single vials, new DB items) use client price
//    but are flagged in logs for monitoring.
// ---------------------------------------------------------------------------
const PRICE_CATALOG: Record<string, Record<string, number>> = {
  'TRZ': {
    '5mg x 10 vials': 80, '10mg x 10 vials': 100, '15mg x 10 vials': 120,
    '20mg x 10 vials': 140, '30mg x 10 vials': 160, '40mg x 10 vials': 180,
    '50mg x 10 vials': 200, '60mg x 10 vials': 220,
  },
  'RT': {
    '5mg x 10 vials': 100, '10mg x 10 vials': 135, '12mg x 10 vials': 145,
    '15mg x 10 vials': 160, '20mg x 10 vials': 190, '30mg x 10 vials': 250,
    '40mg x 10 vials': 290, '50mg x 10 vials': 330, '60mg x 10 vials': 360,
  },
  'SM': {
    '5mg x 10 vials': 80, '10mg x 10 vials': 95, '15mg x 10 vials': 110,
    '20mg x 10 vials': 130, '30mg x 10 vials': 150,
  },
  'GLOW': {
    '50mg x 10 vials': 170, '70mg x 10 vials': 190, '80mg x 10 vials': 210,
  },
  'Hcg': { '5000iu x 10 vials': 110 },
  'HCG': { '5000iu x 10 vials': 110 },
  'Hgh': { '10iu x 10 vials': 95 },
  'HGH': { '10iu x 10 vials': 95 },
  'PT176-191 (HGH frag)': { '5mg x 10 vials': 110, '10mg x 10 vials': 170 },
  'PT-141': { '5mg x 10 vials': 110, '10mg x 10 vials': 170 },
  'HGH Frag 176-191': { '5mg x 10 vials': 110, '10mg x 10 vials': 170 },
  'Tesamorelin': { '5mg x 10 vials': 130, '10mg x 10 vials': 210 },
  'MT1': { '10mg x 10 vials': 80 },
  'MT-1': { '10mg x 10 vials': 80 },
  'Melanotan 1': { '10mg x 10 vials': 80 },
  'MT2': { '10mg x 10 vials': 80 },
  'MT-2': { '10mg x 10 vials': 80 },
  'Melanotan 2': { '10mg x 10 vials': 80 },
  'Bac': { '3ml x 10 vials': 40, '10ml x 10 vials': 45 },
  'BAC': { '3ml x 10 vials': 40, '10ml x 10 vials': 45 },
  'Bacteriostatic Water': { '3ml x 10 vials': 40, '10ml x 10 vials': 45 },
  'BAC RESEARCH': { '3ml x 10 vials': 40, '10ml x 10 vials': 45 },
  'TB-500': { '5mg x 10 vials': 100, '10mg x 10 vials': 150 },
  'TB500': { '5mg x 10 vials': 100, '10mg x 10 vials': 150 },
  'BPC-157': { '5mg x 10 vials': 80, '10mg x 10 vials': 100 },
  'BPC157': { '5mg x 10 vials': 80, '10mg x 10 vials': 100 },
  'TB5+BPC5': { '10mg x 10 vials': 130 },
  'TB-500 + BPC-157': { '10mg x 10 vials': 130, '20mg x 10 vials': 190 },
  'TB10+BPC10': { '20mg x 10 vials': 190 },
  'SS 31': { '10mg x 10 vials': 120, '25mg x 10 vials': 230, '50mg x 10 vials': 350 },
  'SS-31': { '10mg x 10 vials': 120, '25mg x 10 vials': 230, '50mg x 10 vials': 350 },
  'Elamipretide': { '10mg x 10 vials': 120, '25mg x 10 vials': 230, '50mg x 10 vials': 350 },
  'Selank': { '5mg x 10 vials': 80, '10mg x 10 vials': 90 },
  'IGF1-LR3': { '0.1mg x 10 vials': 100, '1mg x 10 vials': 260 },
  'IGF-1 LR3': { '0.1mg x 10 vials': 100, '1mg x 10 vials': 260 },
  'Sermorelin': { '5mg x 10 vials': 110, '10mg x 10 vials': 220 },
  'Tirzepatide': {
    '5mg x 10 vials': 80, '10mg x 10 vials': 100, '15mg x 10 vials': 120,
    '20mg x 10 vials': 140, '30mg x 10 vials': 160, '40mg x 10 vials': 180,
    '50mg x 10 vials': 200, '60mg x 10 vials': 220,
  },
  'Retatrutide': {
    '5mg x 10 vials': 100, '10mg x 10 vials': 135, '12mg x 10 vials': 145,
    '15mg x 10 vials': 160, '20mg x 10 vials': 190, '30mg x 10 vials': 250,
    '40mg x 10 vials': 290, '50mg x 10 vials': 330, '60mg x 10 vials': 360,
  },
  'Semaglutide': {
    '5mg x 10 vials': 80, '10mg x 10 vials': 95, '15mg x 10 vials': 110,
    '20mg x 10 vials': 130, '30mg x 10 vials': 150,
  },
};

// ---------------------------------------------------------------------------
// 2. RATE LIMITING — In-memory per-email and global
// ---------------------------------------------------------------------------
const emailRateLimits = new Map<string, { count: number; resetAt: number }>();
let globalCheckoutCount = 0;
let globalResetAt = 0;

const MAX_PER_EMAIL_PER_HOUR = 5;
const MAX_GLOBAL_PER_HOUR = 50;

function checkRateLimit(email: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  // Global rate limit
  if (now > globalResetAt) {
    globalCheckoutCount = 0;
    globalResetAt = now + oneHour;
  }
  if (globalCheckoutCount >= MAX_GLOBAL_PER_HOUR) {
    return { allowed: false, reason: 'System is experiencing high volume. Please try again later.' };
  }

  // Per-email rate limit
  const normalizedEmail = email.toLowerCase().trim();
  const entry = emailRateLimits.get(normalizedEmail);
  if (entry) {
    if (now > entry.resetAt) {
      emailRateLimits.set(normalizedEmail, { count: 1, resetAt: now + oneHour });
    } else if (entry.count >= MAX_PER_EMAIL_PER_HOUR) {
      return { allowed: false, reason: 'Too many checkout requests for this email. Please try again later.' };
    } else {
      entry.count++;
    }
  } else {
    emailRateLimits.set(normalizedEmail, { count: 1, resetAt: now + oneHour });
  }

  // Clean up expired entries periodically
  if (Math.random() < 0.05) {
    for (const [key, val] of emailRateLimits) {
      if (now > val.resetAt) emailRateLimits.delete(key);
    }
  }

  globalCheckoutCount++;
  return { allowed: true };
}

// ---------------------------------------------------------------------------
// 3. INPUT VALIDATION
// ---------------------------------------------------------------------------
const MAX_QUANTITY_PER_ITEM = 20;
const MAX_TOTAL_ITEMS = 50;
const MIN_ORDER_AMOUNT = 10;   // $10 minimum
const MAX_ORDER_AMOUNT = 5000; // $5,000 maximum

function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return false;
  const disposable = ['mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email', 'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'dispostable.com', '10minutemail.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  if (disposable.includes(domain)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// 4. PROMO / DISCOUNT VALIDATION — Server-side only
// ---------------------------------------------------------------------------
const VALID_PROMOS: Record<string, number> = {
  'SAVE10': 0.10,
  'SAVE20': 0.20,
  'WELCOME': 0.15,
  'FIRSTDAY15': 0.15,
  'INDO88': 0.10,
  'MELISSA10': 0.10,
};

function getServerDiscount(promoCode: string | undefined, subtotal: number): { discountRate: number; discountAmount: number; validCode: boolean } {
  if (!promoCode || typeof promoCode !== 'string') {
    return { discountRate: 0, discountAmount: 0, validCode: false };
  }
  const upper = promoCode.toUpperCase().trim();
  const rate = VALID_PROMOS[upper];
  if (rate !== undefined) {
    return { discountRate: rate, discountAmount: Math.round(subtotal * rate * 100) / 100, validCode: true };
  }
  return { discountRate: 0, discountAmount: 0, validCode: false };
}

// ---------------------------------------------------------------------------
// 5. PRICE LOOKUP — resolve server price from catalog (returns null if not found)
// ---------------------------------------------------------------------------
function lookupPrice(productName: string, specification: string): number | null {
  // Try exact match first
  const specs = PRICE_CATALOG[productName];
  if (specs && specs[specification] !== undefined) {
    return specs[specification];
  }
  // Try case-insensitive match on product name
  const lowerName = productName.toLowerCase().trim();
  for (const [catalogName, catalogSpecs] of Object.entries(PRICE_CATALOG)) {
    if (catalogName.toLowerCase().trim() === lowerName) {
      if (catalogSpecs[specification] !== undefined) {
        return catalogSpecs[specification];
      }
      // Try case-insensitive spec match
      const lowerSpec = specification.toLowerCase().trim();
      for (const [specName, price] of Object.entries(catalogSpecs)) {
        if (specName.toLowerCase().trim() === lowerSpec) {
          return price;
        }
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// 6. GENERIC LINE ITEM NAME GENERATOR
//    Produces fully random alphanumeric codes. ZERO product data leaks to Square.
//    No product names, no abbreviations, no specifications, no dosages, nothing.
// ---------------------------------------------------------------------------
function generateGenericCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // No I or O (avoid confusion with 1/0)
  const c1 = chars[Math.floor(Math.random() * chars.length)];
  const c2 = chars[Math.floor(Math.random() * chars.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `RH-${c1}${c2}${num}`;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
Deno.serve(async (req) => {
  const startTime = Date.now();

  try {
    // --- Parse request body ---
    let body: any;
    try {
      body = await req.json();
    } catch (parseErr) {
      console.error('[SECURITY] Failed to parse request body:', parseErr);
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { items, customerEmail, customerName, orderNumber, promoCode } = body;
    // NOTE: body.discountAmount and body.shippingCost are IGNORED — calculated server-side

    // --- Chargeback evidence capture ---
    // Priority: cf-connecting-ip (Cloudflare real IP) > x-forwarded-for (first in chain) > x-real-ip
    const xForwardedFor = req.headers.get('x-forwarded-for');
    const clientIP = req.headers.get('cf-connecting-ip') || (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) || req.headers.get('x-real-ip') || 'unknown';
    const serverUserAgent = req.headers.get('user-agent') || 'unknown';
    const consentTimestamp = body.consentTimestamp || null;
    const consentVersion = body.consentVersion || null;
    const clientUserAgent = body.userAgent || null;
    const clientScreen = body.screenResolution || null;
    const clientTimezone = body.timezone || null;
    const clientLanguage = body.language || null;
    const shippingAddr = body.shippingAddress || null;
    const billingAddr = body.billingAddress || null;

    // --- Basic field validation ---
    if (!customerEmail || typeof customerEmail !== 'string') {
      console.warn('[SECURITY] Missing or invalid customerEmail');
      return Response.json({ error: 'Email address is required' }, { status: 400 });
    }

    if (!validateEmail(customerEmail)) {
      console.warn(`[SECURITY] Invalid email rejected: ${customerEmail}`);
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.warn('[SECURITY] Missing or empty items array');
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // --- Cloudflare Turnstile verification ---
    const turnstileToken = body.turnstileToken;
    if (!turnstileToken || typeof turnstileToken !== 'string') {
      console.warn(`[SECURITY][TURNSTILE_MISSING] email=${customerEmail} ip=${clientIP}`);
      return Response.json({ error: 'Security verification required. Please complete the challenge and try again.' }, { status: 400 });
    }

    try {
      const turnstileRes = await fetch(TURNSTILE_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: TURNSTILE_SECRET_KEY,
          response: turnstileToken,
          remoteip: clientIP,
        }),
      });
      const turnstileData = await turnstileRes.json();

      if (!turnstileData.success) {
        console.warn(`[SECURITY][TURNSTILE_FAILED] email=${customerEmail} ip=${clientIP} errors=${JSON.stringify(turnstileData['error-codes'] || [])}`);
        return Response.json({ error: 'Verification failed. Please refresh the page and try again.' }, { status: 400 });
      }

      console.log(`[SECURITY][TURNSTILE_OK] email=${customerEmail} ip=${clientIP} action=${turnstileData.action || 'n/a'}`);
    } catch (turnstileErr) {
      // If Turnstile API is down, log but allow the request through (fail-open)
      // This prevents checkout from breaking if Cloudflare has an outage
      console.error(`[SECURITY][TURNSTILE_ERROR] email=${customerEmail} ip=${clientIP} error=${turnstileErr.message}`);
    }

    // --- Rate limiting ---
    const rateCheck = checkRateLimit(customerEmail);
    if (!rateCheck.allowed) {
      console.warn(`[SECURITY][RATE_LIMIT] Blocked: ${customerEmail} — ${rateCheck.reason}`);
      return Response.json({ error: rateCheck.reason }, { status: 429 });
    }

    // --- Validate quantities ---
    let totalItemCount = 0;
    for (const item of items) {
      const qty = Number(item.quantity) || 0;
      if (qty < 1 || qty > MAX_QUANTITY_PER_ITEM) {
        console.warn(`[SECURITY] Invalid quantity ${qty}`);
        return Response.json({ error: `Invalid quantity. Max ${MAX_QUANTITY_PER_ITEM} per item.` }, { status: 400 });
      }
      totalItemCount += qty;
    }
    if (totalItemCount > MAX_TOTAL_ITEMS) {
      console.warn(`[SECURITY] Total items ${totalItemCount} exceeds max ${MAX_TOTAL_ITEMS}`);
      return Response.json({ error: `Too many items. Maximum ${MAX_TOTAL_ITEMS} total.` }, { status: 400 });
    }

    // --- Price resolution: catalog price wins, fallback to client price for dynamic DB products ---
    const resolvedItems: Array<{ price: number; quantity: number; source: string }> = [];
    for (const item of items) {
      const name = String(item.productName || '').trim();
      const spec = String(item.specification || '').trim();
      const qty = Number(item.quantity) || 1;
      const clientPrice = Number(item.price) || 0;

      if (!name || !spec) {
        console.warn(`[SECURITY] Missing product name or specification`);
        return Response.json({ error: 'Each item must have a product name and specification' }, { status: 400 });
      }

      // Reject zero/negative client prices (can't have a free item)
      if (clientPrice <= 0) {
        console.warn(`[SECURITY][ZERO_PRICE] Rejected: client sent $${clientPrice} for an item`);
        return Response.json({ error: 'Invalid item price' }, { status: 400 });
      }

      const catalogPrice = lookupPrice(name, spec);

      if (catalogPrice !== null) {
        // Product found in catalog — USE SERVER PRICE, ignore client
        if (Math.abs(clientPrice - catalogPrice) > 0.01) {
          console.warn(`[SECURITY][PRICE_MISMATCH] client=$${clientPrice}, server=$${catalogPrice} — using server price`);
        }
        resolvedItems.push({ price: catalogPrice, quantity: qty, source: 'catalog' });
      } else {
        // Product NOT in catalog (blends, single vials, new DB products)
        // Accept client price but flag it for monitoring
        console.warn(`[SECURITY][UNCATALOGED] "${name}" / "${spec}" not in catalog — using client price $${clientPrice}`);
        resolvedItems.push({ price: clientPrice, quantity: qty, source: 'client' });
      }
    }

    // --- Calculate subtotal ---
    const subtotal = resolvedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // --- Server-side discount (CLIENT DISCOUNT IGNORED) ---
    const discount = getServerDiscount(promoCode, subtotal);
    if (promoCode && !discount.validCode) {
      console.warn(`[SECURITY][INVALID_PROMO] Code "${promoCode}" not recognized — no discount applied`);
    }

    // --- Calculate final total ---
    const serverShipping = SHIPPING_COST;
    const finalTotal = subtotal - discount.discountAmount + serverShipping;

    // --- Amount bounds check ---
    if (finalTotal < MIN_ORDER_AMOUNT) {
      console.warn(`[SECURITY][LOW_AMOUNT] Order total $${finalTotal} below minimum $${MIN_ORDER_AMOUNT}`);
      return Response.json({ error: `Order total ($${finalTotal.toFixed(2)}) is below our minimum of $${MIN_ORDER_AMOUNT}` }, { status: 400 });
    }
    if (finalTotal > MAX_ORDER_AMOUNT) {
      console.warn(`[SECURITY][HIGH_AMOUNT] Order total $${finalTotal} exceeds maximum $${MAX_ORDER_AMOUNT}`);
      return Response.json({ error: `Order total ($${finalTotal.toFixed(2)}) exceeds our maximum of $${MAX_ORDER_AMOUNT}. Please contact support.` }, { status: 400 });
    }

    // --- Build Square line items ---
    // ZERO product metadata goes to Square. Each item gets a fully random
    // generic code like "RH-KW4821". No product names, no abbreviations,
    // no dosages, no specifications, no descriptions — nothing identifiable.
    const lineItems = resolvedItems.map((item) => ({
      name: generateGenericCode(),
      quantity: String(item.quantity),
      base_price_money: {
        amount: Math.round(item.price * 100),
        currency: 'USD',
      },
    }));

    // Add shipping as a generic line item
    lineItems.push({
      name: 'FEE',
      quantity: '1',
      base_price_money: {
        amount: Math.round(serverShipping * 100),
        currency: 'USD',
      },
    });

    // --- Build the order object ---
    const orderObj: any = {
      location_id: SQUARE_LOCATION_ID,
      line_items: lineItems,
    };

    // Add discount if applicable (generic name only)
    if (discount.discountAmount > 0) {
      orderObj.discounts = [
        {
          name: 'PROMO',
          amount_money: {
            amount: Math.round(discount.discountAmount * 100),
            currency: 'USD',
          },
          scope: 'ORDER',
        },
      ];
    }

    // --- Build the payment link request ---
    // No product data in the payment note, no descriptions, nothing identifiable.
    const requestBody: any = {
      idempotency_key: `rhr-${orderNumber || Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
      order: orderObj,
      checkout_options: {
        ask_for_shipping_address: true,
      },
    };

    // Pre-populate customer email only
    if (customerEmail) {
      requestBody.pre_populated_data = {
        buyer_email: customerEmail.trim(),
      };
    }

    // Payment note is just the order number — no product info
    if (orderNumber) {
      requestBody.payment_note = `Ref: ${orderNumber}`;
    }

    // --- CHARGEBACK EVIDENCE LOG (server-side only, never sent to Square) ---
    // This log is your evidence package for dispute defense
    const catalogCount = resolvedItems.filter(i => i.source === 'catalog').length;
    const clientCount = resolvedItems.filter(i => i.source === 'client').length;
    console.log(`[CHECKOUT] email=${customerEmail} | items=${resolvedItems.length} (${catalogCount} catalog, ${clientCount} client-priced) | subtotal=$${subtotal} | discount=$${discount.discountAmount} (${promoCode || 'none'}) | shipping=$${serverShipping} | total=$${finalTotal} | order=${orderNumber || 'N/A'}`);
    console.log(`[EVIDENCE] order=${orderNumber || 'N/A'} | ip=${clientIP} | consent_at=${consentTimestamp || 'N/A'} | consent_ver=${consentVersion || 'N/A'} | ua=${clientUserAgent || serverUserAgent} | screen=${clientScreen || 'N/A'} | tz=${clientTimezone || 'N/A'} | lang=${clientLanguage || 'N/A'}`);
    if (shippingAddr) {
      console.log(`[EVIDENCE][SHIPPING] order=${orderNumber || 'N/A'} | ${shippingAddr.address || ''}, ${shippingAddr.city || ''}, ${shippingAddr.state || ''} ${shippingAddr.zip || ''} ${shippingAddr.country || ''}`);
    }
    if (billingAddr) {
      console.log(`[EVIDENCE][BILLING] order=${orderNumber || 'N/A'} | ${billingAddr.address || ''}, ${billingAddr.city || ''}, ${billingAddr.state || ''} ${billingAddr.zip || ''} ${billingAddr.country || ''}`);
    }

    // --- Call Square API ---
    const squareRes = await fetch(SQUARE_API_URL, {
      method: 'POST',
      headers: {
        'Square-Version': '2025-01-23',
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const squareData = await squareRes.json();

    if (!squareRes.ok) {
      console.error(`[CHECKOUT][SQUARE_ERROR] status=${squareRes.status} body=${JSON.stringify(squareData)}`);
      return Response.json(
        { error: 'Failed to create checkout. Please try again.' },
        { status: squareRes.status }
      );
    }

    const paymentLink = squareData.payment_link;
    const checkoutUrl = paymentLink?.url || paymentLink?.long_url;

    if (!checkoutUrl) {
      console.error('[CHECKOUT][NO_URL] Square returned no checkout URL:', JSON.stringify(squareData));
      return Response.json(
        { error: 'Checkout service unavailable. Please try again.' },
        { status: 500 }
      );
    }

    const elapsed = Date.now() - startTime;
    console.log(`[CHECKOUT][SUCCESS] email=${customerEmail} | total=$${finalTotal} | linkId=${paymentLink?.id} | elapsed=${elapsed}ms`);

    return Response.json({
      success: true,
      checkoutUrl,
      paymentLinkId: paymentLink?.id,
      orderId: paymentLink?.order_id,
      serverTotal: finalTotal,
      serverSubtotal: subtotal,
      serverDiscount: discount.discountAmount,
      serverShipping: serverShipping,
    });

  } catch (error) {
    console.error('[CHECKOUT][FATAL]', error);
    return Response.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
});
