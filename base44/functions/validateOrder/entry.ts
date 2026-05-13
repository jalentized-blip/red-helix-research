import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Server-side order validation — works for both authenticated users and guests.
 * Validates prices against the database and validates promo codes server-side.
 */

const STATIC_PROMO_CODES = {
  'SAVE10': { discount: 0.10, label: '10% off' },
  'SAVE20': { discount: 0.20, label: '20% off' },
  'WELCOME': { discount: 0.15, label: '15% off first order' },
  'FIRSTDAY15': { discount: 0.15, label: '15% off' },
  'INDO88': { discount: 0.10, label: '10% off' },
  'MELLISA10': { discount: 0.10, label: '10% off (Affiliate)' },
};

const SHIPPING_COST = 15.00;

async function getAllPromoCodes(base44) {
  const codes = { ...STATIC_PROMO_CODES };
  try {
    const affiliates = await base44.asServiceRole.entities.Affiliate.list();
    if (affiliates && Array.isArray(affiliates)) {
      for (const aff of affiliates) {
        if (aff.is_active && aff.code) {
          codes[aff.code.toUpperCase()] = {
            discount: (aff.discount_percent || 15) / 100,
            label: `${aff.discount_percent || 15}% off`,
          };
        }
      }
    }
  } catch (e) {
    console.warn('Could not load affiliate codes from DB:', e);
  }
  return codes;
}

async function lookupWelcomeDiscount(base44, codeUpper) {
  try {
    const records = await base44.asServiceRole.entities.WelcomeDiscount.filter({ code: codeUpper });
    if (!records || !Array.isArray(records)) return null;
    const now = new Date();
    return records.find(record => !record.used && (!record.expires_at || new Date(record.expires_at) > now)) || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'validate_promo': {
        const code = (body.code || '').toUpperCase().trim();
        if (!code || code.length > 30) {
          return Response.json({ valid: false, error: 'Invalid promo code' });
        }
        const allCodes = await getAllPromoCodes(base44);
        const promo = allCodes[code];
        if (!promo) {
          const welcomeDiscount = await lookupWelcomeDiscount(base44, code);
          if (welcomeDiscount) {
            return Response.json({ valid: true, discount: 0.10, label: '10% off welcome discount', singleVialsOnly: true, isWelcome: true });
          }
          return Response.json({ valid: false, error: 'Invalid promo code' });
        }
        return Response.json({ valid: true, discount: promo.discount, label: promo.label });
      }

      case 'validate_order': {
        const { items, promoCode } = body;
        if (!items || !Array.isArray(items) || items.length === 0 || items.length > 50) {
          return Response.json({ error: 'Invalid order items' }, { status: 400 });
        }

        const products = await base44.asServiceRole.entities.Product.list();
        let subtotal = 0;
        const validatedItems = [];

        for (const item of items) {
          if (!item.productName || !item.specification || !item.quantity || item.quantity < 1) {
            return Response.json({ error: `Invalid item: ${item.productName}` }, { status: 400 });
          }
          // Look up by productId FIRST so a stale cart productName (after an
          // admin rename) still resolves to the current product. Falls back to
          // name match for older cart data without productId.
          const product = (item.productId && products.find(p => p.id === item.productId))
            || products.find(p => p.name === item.productName);
          if (!product) {
            return Response.json({ error: `Product not found: ${item.productName}` }, { status: 400 });
          }
          const spec = product.specifications?.find(s => s.name === item.specification);
          if (!spec) {
            return Response.json({ error: `Specification not found: ${item.specification}` }, { status: 400 });
          }
          // Authoritative stock check — mirrors frontend isSpecInStock:
          // out of stock if in_stock === false OR stock_quantity === 0
          if (spec.in_stock === false || spec.stock_quantity === 0) {
            return Response.json({ error: `Out of stock: ${item.productName} - ${item.specification}` }, { status: 409 });
          }
          // Quantity check: reject if tracked quantity is insufficient
          if (spec.stock_quantity !== undefined && spec.stock_quantity !== null && spec.stock_quantity !== -1 && spec.stock_quantity < item.quantity) {
            return Response.json({ error: `Insufficient stock for ${item.productName} - ${item.specification} (${spec.stock_quantity} available)` }, { status: 409 });
          }
          // Hidden spec — reject
          if (spec.hidden) {
            return Response.json({ error: `Product not available: ${item.productName} - ${item.specification}` }, { status: 400 });
          }
          const serverPrice = spec.price;
          subtotal += serverPrice * item.quantity;
          validatedItems.push({
            product_id: product.id,
            product_name: product.name,
            specification: spec.name,
            quantity: item.quantity,
            price: serverPrice,
          });
        }

        let discount = 0;
        let discountNote = null;
        let validatedPromo = null;
        let welcomeDiscountId = null;
        if (promoCode) {
          const code = promoCode.toUpperCase().trim();
          const allCodes = await getAllPromoCodes(base44);
          let promo = allCodes[code];
          if (!promo) {
            const welcomeDiscount = await lookupWelcomeDiscount(base44, code);
            if (welcomeDiscount) {
              promo = { discount: 0.10, singleVialsOnly: true, isWelcome: true };
              welcomeDiscountId = welcomeDiscount.id;
            }
          }
          if (promo) {
            if (promo.singleVialsOnly) {
              const singleVialSubtotal = validatedItems.reduce((sum, item) => {
                const specification = item.specification.toLowerCase();
                const productName = item.product_name.toLowerCase();
                if (specification.includes('10 vial') || specification.includes('kit') || productName.includes('kit') || productName.includes('bundle')) {
                  return sum;
                }
                return sum + item.price * item.quantity;
              }, 0);
              discount = singleVialSubtotal * promo.discount;
              if (singleVialSubtotal === 0) {
                discountNote = 'Promo applies to single vials only — no qualifying items in cart';
              }
            } else {
              discount = subtotal * promo.discount;
            }
            validatedPromo = code;
          }
        }

        const totalAmount = subtotal - discount + SHIPPING_COST;
        return Response.json({
          valid: true,
          subtotal,
          discount,
          shipping: SHIPPING_COST,
          totalAmount,
          validatedItems,
          validatedPromo,
          ...(discountNote ? { discountNote } : {}),
          ...(welcomeDiscountId ? { welcomeDiscountId } : {}),
        });
      }

      // Real-time stock check — called just before order submission
      case 'check_stock': {
        const { items: stockItems } = body;
        if (!stockItems || !Array.isArray(stockItems) || stockItems.length === 0) {
          return Response.json({ error: 'Missing items' }, { status: 400 });
        }
        const products = await base44.asServiceRole.entities.Product.list();
        const outOfStock = [];
        for (const item of stockItems) {
          const product = products.find(p => p.name === item.productName || p.id === item.productId);
          if (!product) continue; // give benefit of the doubt if product not found
          const spec = product.specifications?.find(s => s.name === item.specification);
          if (!spec) continue;
          if (spec.in_stock === false || spec.stock_quantity === 0 || spec.hidden) {
            outOfStock.push(`${item.productName} — ${item.specification}`);
          } else if (spec.stock_quantity !== undefined && spec.stock_quantity !== null && spec.stock_quantity !== -1 && spec.stock_quantity < item.quantity) {
            outOfStock.push(`${item.productName} — ${item.specification} (only ${spec.stock_quantity} available)`);
          }
        }
        return Response.json({ valid: outOfStock.length === 0, outOfStock });
      }

      case 'mark_promo_used': {
        const code = (body.code || '').toUpperCase().trim();
        const { orderNumber } = body;
        if (!code || code.length > 30) {
          return Response.json({ success: true, marked: false });
        }
        const records = await base44.asServiceRole.entities.WelcomeDiscount.filter({ code });
        const record = records && Array.isArray(records) ? records[0] : null;
        let marked = false;
        if (record && !record.used) {
          await base44.asServiceRole.entities.WelcomeDiscount.update(record.id, { used: true, used_on_order: orderNumber });
          marked = true;
        }
        return Response.json({ success: true, marked });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Order validation error:', error);
    return Response.json({ error: 'Validation failed' }, { status: 500 });
  }
});
