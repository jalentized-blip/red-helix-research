import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { rateLimit, sanitizeInput, createSecureResponse } from './securityUtils.js';

/**
 * Server-side order validation
 * Validates prices against the database, validates promo codes server-side,
 * and creates orders with verified amounts
 */

// Promo codes stored server-side only
const PROMO_CODES: Record<string, { discount: number; label: string; isAffiliate?: boolean }> = {
  'SAVE10': { discount: 0.10, label: '10% off' },
  'SAVE20': { discount: 0.20, label: '20% off' },
  'WELCOME': { discount: 0.15, label: '15% off first order' },
  'FIRSTDAY15': { discount: 0.15, label: '15% off' },
  'GOMIE15': { discount: 0.15, label: '15% off', isAffiliate: true },
  'CJ15': { discount: 0.15, label: '15% off', isAffiliate: true },
  'INDO88': { discount: 0.10, label: '10% off' },
};

const SHIPPING_COST = 15.00;

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return createSecureResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    // Rate limit: 5 order validations per minute per user
    const rateLimitResult = rateLimit(`order_${user.email}`, 5, 60000);
    if (!rateLimitResult.allowed) {
      return createSecureResponse({ error: 'Too many requests' }, 429);
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'validate_promo': {
        const code = (body.code || '').toUpperCase().trim();
        if (!code || code.length > 30) {
          return createSecureResponse({ valid: false, error: 'Invalid promo code' });
        }

        const promo = PROMO_CODES[code];
        if (!promo) {
          return createSecureResponse({ valid: false, error: 'Invalid promo code' });
        }

        return createSecureResponse({
          valid: true,
          discount: promo.discount,
          label: promo.label
        });
      }

      case 'validate_order': {
        const { items, promoCode } = body;

        if (!items || !Array.isArray(items) || items.length === 0 || items.length > 50) {
          return createSecureResponse({ error: 'Invalid order items' }, 400);
        }

        // Fetch current product prices from database
        const products = await base44.asServiceRole.entities.Product.list();

        let subtotal = 0;
        const validatedItems = [];

        for (const item of items) {
          if (!item.productName || !item.specification || !item.quantity || item.quantity < 1) {
            return createSecureResponse({ error: `Invalid item: ${item.productName}` }, 400);
          }

          const product = products.find((p: any) => p.name === item.productName);
          if (!product) {
            return createSecureResponse({ error: `Product not found: ${item.productName}` }, 400);
          }

          const spec = product.specifications?.find((s: any) => s.name === item.specification);
          if (!spec) {
            return createSecureResponse({ error: `Specification not found: ${item.specification}` }, 400);
          }

          // Check stock
          if (spec.stock_quantity !== undefined && spec.stock_quantity < item.quantity) {
            return createSecureResponse({ error: `Insufficient stock for ${item.productName} - ${item.specification}` }, 400);
          }

          // Use server-side price, not client-submitted price
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

        // Validate promo code server-side
        let discount = 0;
        let validatedPromo = null;
        if (promoCode) {
          const code = promoCode.toUpperCase().trim();
          const promo = PROMO_CODES[code];
          if (promo) {
            discount = subtotal * promo.discount;
            validatedPromo = code;
          }
        }

        const totalAmount = subtotal - discount + SHIPPING_COST;

        return createSecureResponse({
          valid: true,
          subtotal,
          discount,
          shipping: SHIPPING_COST,
          totalAmount,
          validatedItems,
          validatedPromo
        });
      }

      default:
        return createSecureResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    console.error('Order validation error:', error);
    return createSecureResponse({ error: 'Validation failed' }, 500);
  }
});
