import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Logs every Add-to-Cart event and validates the product ID + spec against
 * the live product catalog. Blocks ghost items (deleted/hidden/out-of-stock)
 * and records a mismatch flag for admin review.
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { productId, productName, specification, price, quantity = 1, sessionId } = body;

  if (!productId || !productName || !specification) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Fetch live catalog (service role so no auth needed)
  const products = await base44.asServiceRole.entities.Product.list();

  const product = products.find(p => p.id === productId)
    || products.find(p => p.name === productName);

  const now = new Date().toISOString();
  let status = 'ok';
  let mismatch = null;

  if (!product) {
    status = 'ghost_product';
    mismatch = `Product ID "${productId}" (${productName}) not found in catalog`;
  } else if (product.hidden) {
    status = 'hidden_product';
    mismatch = `Product "${productName}" is hidden`;
  } else if (product.in_stock === false) {
    status = 'product_out_of_stock';
    mismatch = `Product "${productName}" is marked out of stock`;
  } else {
    const spec = product.specifications?.find(s => s.name === specification);
    if (!spec) {
      status = 'ghost_spec';
      mismatch = `Specification "${specification}" not found on product "${productName}"`;
    } else if (spec.hidden) {
      status = 'hidden_spec';
      mismatch = `Specification "${specification}" is hidden on "${productName}"`;
    } else if (spec.in_stock === false || spec.stock_quantity === 0) {
      status = 'spec_out_of_stock';
      mismatch = `Specification "${specification}" is out of stock on "${productName}"`;
    } else if (price !== undefined && price !== null) {
      const serverPrice = spec.price;
      const clientPrice = parseFloat(price);
      if (!isNaN(clientPrice) && Math.abs(clientPrice - serverPrice) > 0.01) {
        status = 'price_mismatch';
        mismatch = `Price mismatch: client=$${clientPrice}, catalog=$${serverPrice} for "${productName} - ${specification}"`;
      }
    }
  }

  // Log the event to the AddToCartLog entity
  const logEntry = {
    product_id: productId,
    product_name: productName,
    specification,
    price_submitted: price ?? null,
    price_catalog: product?.specifications?.find(s => s.name === specification)?.price ?? null,
    quantity,
    status,
    mismatch_reason: mismatch || null,
    session_id: sessionId || null,
    logged_at: now,
  };

  await base44.asServiceRole.entities.AddToCartLog.create(logEntry);

  if (status !== 'ok') {
    console.warn(`[AddToCart] BLOCKED — ${status}: ${mismatch}`);
    return Response.json({ valid: false, status, reason: mismatch }, { status: 409 });
  }

  return Response.json({ valid: true, status: 'ok' });
});