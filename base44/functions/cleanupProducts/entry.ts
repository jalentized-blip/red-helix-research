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
      const name = product.name?.trim();
      if (!name) return;
      
      if (productMap.has(name)) {
        // Keep the most recently updated one, delete older ones
        const existing = productMap.get(name);
        const existingDate = new Date(existing.updated_date);
        const currentDate = new Date(product.updated_date);
        
        if (currentDate > existingDate) {
          // Current is newer, delete the old one
          toDelete.push({ id: existing.id, name });
          productMap.set(name, product);
        } else {
          // Existing is newer, delete current
          toDelete.push({ id: product.id, name });
        }
      } else {
        productMap.set(name, product);
      }
    });

    if (toDelete.length > 50) {
      return Response.json({
        error: 'Safety cap exceeded — more than 50 duplicates detected, refusing to delete',
        count: toDelete.length
      });
    }

    // Also remove products that were marked for deletion
    const deletePromises = toDelete.map(product => 
      base44.asServiceRole.entities.Product.delete(product.id).catch(err => ({ error: err.message, id: product.id }))
    );

    const results = await Promise.all(deletePromises);
    const successCount = results.filter(r => !r.error).length;
    const errors = results.filter(r => r.error);
    const deletedNames = toDelete
      .filter((_, index) => !results[index].error)
      .map(product => product.name);

    return Response.json({
      total_products: allProducts.length,
      unique_products: productMap.size,
      deleted_count: successCount,
      deleted_names: deletedNames,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
