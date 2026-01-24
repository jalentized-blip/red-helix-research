import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all products
    const allProducts = await base44.asServiceRole.entities.Product.list();
    
    // Track products by name to identify duplicates
    const productMap = new Map();
    const toDelete = [];

    allProducts.forEach(product => {
      const name = product.data.name.trim();
      
      if (productMap.has(name)) {
        // Keep the most recently updated one, delete older ones
        const existing = productMap.get(name);
        const existingDate = new Date(existing.updated_date);
        const currentDate = new Date(product.updated_date);
        
        if (currentDate > existingDate) {
          // Current is newer, delete the old one
          toDelete.push(existing.id);
          productMap.set(name, product);
        } else {
          // Existing is newer, delete current
          toDelete.push(product.id);
        }
      } else {
        productMap.set(name, product);
      }
    });

    // Also remove products that were marked for deletion
    const deletePromises = toDelete.map(id => 
      base44.asServiceRole.entities.Product.delete(id).catch(err => ({ error: err.message, id }))
    );

    const results = await Promise.all(deletePromises);
    const successCount = results.filter(r => !r.error).length;
    const errors = results.filter(r => r.error);

    return Response.json({
      total_products: allProducts.length,
      unique_products: productMap.size,
      deleted_count: successCount,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});