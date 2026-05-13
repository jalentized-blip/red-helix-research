/**
 * decrementStock — Server-side atomic stock decrement
 *
 * Called at order creation time for ALL payment methods (crypto, zelle, square).
 * This is the authoritative server-side stock decrement — the frontend decrementStock
 * calls are kept as optimistic UI updates but this function is the source of truth.
 *
 * Actions:
 *   - decrement: Validate stock is available THEN decrement in one server-side call.
 *                Returns { success, decremented, skipped, errors }
 *   - restore:   Restore stock (used when order is cancelled / payment expires).
 *                Returns { success, restored }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Mirrors the frontend isSpecInStock logic exactly
const isSpecInStock = (spec) => {
  if (!spec) return false;
  if (spec.in_stock === false) return false;
  if (spec.stock_quantity === 0) return false;
  return true;
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, items, orderNumber } = body;

    if (!action || !items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Missing action or items' }, { status: 400 });
    }

    // Load all products once
    const products = await base44.asServiceRole.entities.Product.list();

    // ── DECREMENT ─────────────────────────────────────────────────────────────
    if (action === 'decrement') {
      const decremented = [];
      const skipped = [];
      const errors = [];

      // Check ALL items first before touching anything (all-or-nothing pre-flight)
      const outOfStock = [];
      for (const item of items) {
        const product = products.find(p =>
          p.id === item.productId || p.id === item.product_id ||
          p.name === (item.productName || item.product_name)
        );
        if (!product) {
          skipped.push(`${item.productName || item.product_name} — product not found in DB`);
          continue;
        }
        const spec = (product.specifications || []).find(s => s.name === item.specification);
        if (!spec) {
          skipped.push(`${item.productName} (${item.specification}) — spec not found`);
          continue;
        }
        // Hard out-of-stock check: in_stock: false OR stock_quantity === 0
        if (!isSpecInStock(spec)) {
          outOfStock.push(`${item.productName} — ${item.specification}`);
          continue;
        }
        // Quantity check: if tracked, ensure enough stock
        if (spec.stock_quantity !== undefined && spec.stock_quantity !== null && spec.stock_quantity !== -1) {
          if (spec.stock_quantity < (item.quantity || 1)) {
            outOfStock.push(`${item.productName} — ${item.specification} (only ${spec.stock_quantity} left, ordered ${item.quantity})`);
          }
        }
      }

      if (outOfStock.length > 0) {
        return Response.json({
          success: false,
          error: 'Some items are out of stock',
          outOfStock,
        }, { status: 409 }); // 409 Conflict
      }

      // All items passed pre-flight — now decrement
      for (const item of items) {
        try {
          const cachedProduct = products.find(p =>
            p.id === item.productId || p.id === item.product_id ||
            p.name === (item.productName || item.product_name)
          );
          if (!cachedProduct) {
            skipped.push(`${item.productName || item.product_name} — not found`);
            continue;
          }

          // Re-fetch the FRESH product immediately before mutating so concurrent
          // admin price/spec edits aren't clobbered by the stale snapshot from
          // the initial .list() call. We MUST NOT fall back to cached on fetch
          // failure — writing the full specifications array from stale data is
          // exactly the clobber bug this commit prevents.
          let product;
          try {
            product = await base44.asServiceRole.entities.Product.get(cachedProduct.id);
          } catch (fetchErr) {
            console.error(`[decrementStock] Re-fetch failed for ${cachedProduct.name} — skipping write to avoid stale-data clobber:`, fetchErr.message);
            errors.push(`${item.productName}: re-fetch failed, write skipped to protect price data`);
            continue;
          }

          // Re-check stock against the FRESH product. Between the initial
          // pre-flight and this re-fetch, another concurrent decrement may have
          // depleted inventory below the requested quantity.
          const freshSpec = (product.specifications || []).find(s => s.name === item.specification);
          if (!freshSpec) {
            skipped.push(`${item.productName} (${item.specification}) — spec disappeared between pre-flight and write`);
            continue;
          }
          const freshIsTracked = freshSpec.stock_quantity !== undefined && freshSpec.stock_quantity !== null && freshSpec.stock_quantity !== -1;
          if (freshSpec.in_stock === false) {
            skipped.push(`${item.productName} (${item.specification}) — went out of stock between pre-flight and write`);
            continue;
          }
          if (freshIsTracked && freshSpec.stock_quantity < (item.quantity || 1)) {
            skipped.push(`${item.productName} (${item.specification}) — only ${freshSpec.stock_quantity} left at write time (requested ${item.quantity})`);
            continue;
          }

          const updatedSpecs = (product.specifications || []).map(spec => {
            if (spec.name === item.specification) {
              const isTracked = spec.stock_quantity !== undefined && spec.stock_quantity !== null && spec.stock_quantity !== -1;
              const newQty = isTracked
                ? Math.max(0, spec.stock_quantity - (item.quantity || 1))
                : spec.stock_quantity;
              return {
                ...spec,
                stock_quantity: newQty,
                in_stock: isTracked ? newQty > 0 : spec.in_stock,
              };
            }
            return spec;
          });

          const allOut = updatedSpecs.every(s => !s.in_stock);
          await base44.asServiceRole.entities.Product.update(product.id, {
            specifications: updatedSpecs,
            in_stock: !allOut,
          });

          cachedProduct.specifications = updatedSpecs;
          decremented.push(`${item.productName} — ${item.specification}`);
          console.log(`[decrementStock] Decremented ${item.quantity}x ${item.productName} (${item.specification}) for order ${orderNumber || 'unknown'}`);
        } catch (err) {
          console.error(`[decrementStock] Failed for ${item.productName}:`, err.message);
          errors.push(`${item.productName}: ${err.message}`);
        }
      }

      return Response.json({ success: true, decremented, skipped, errors });
    }

    // ── RESTORE ───────────────────────────────────────────────────────────────
    if (action === 'restore') {
      const restored = [];
      const errors = [];

      for (const item of items) {
        try {
          const cachedProduct = products.find(p =>
            p.id === item.productId || p.id === item.product_id ||
            p.name === (item.productName || item.product_name)
          );
          if (!cachedProduct) {
            console.warn(`[decrementStock restore] Product not found: ${item.productName}`);
            continue;
          }

          let product;
          try {
            product = await base44.asServiceRole.entities.Product.get(cachedProduct.id);
          } catch (fetchErr) {
            console.error(`[decrementStock restore] Re-fetch failed for ${cachedProduct.name} — skipping write to avoid stale-data clobber:`, fetchErr.message);
            errors.push(`${item.productName}: re-fetch failed during restore, write skipped`);
            continue;
          }

          const updatedSpecs = (product.specifications || []).map(spec => {
            if (spec.name === item.specification) {
              const isTracked = spec.stock_quantity !== undefined && spec.stock_quantity !== null && spec.stock_quantity !== -1;
              if (!isTracked) return spec;
              const restored = (spec.stock_quantity || 0) + (item.quantity || 1);
              return { ...spec, stock_quantity: restored, in_stock: restored > 0 };
            }
            return spec;
          });

          cachedProduct.specifications = updatedSpecs;
          await base44.asServiceRole.entities.Product.update(product.id, {
            specifications: updatedSpecs,
            in_stock: updatedSpecs.some(s => s.in_stock),
          });

          restored.push(`${item.productName} — ${item.specification}`);
          console.log(`[decrementStock] Restored ${item.quantity}x ${item.productName} (${item.specification}) for order ${orderNumber || 'unknown'}`);
        } catch (err) {
          console.error(`[decrementStock restore] Failed for ${item.productName}:`, err.message);
          errors.push(`${item.productName}: ${err.message}`);
        }
      }

      return Response.json({ success: true, restored, errors });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[decrementStock] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});