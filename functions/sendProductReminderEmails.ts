import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  // Get all user preferences with recent views
  const allPreferences = await base44.asServiceRole.entities.UserPreference.list();
  const products = await base44.asServiceRole.entities.Product.list();
  const orders = await base44.asServiceRole.entities.Order.list();

  const emailsSent = [];
  const now = new Date();

  for (const pref of allPreferences) {
    if (!pref.viewed_products || pref.viewed_products.length === 0) continue;

    // Get the most recent view
    const recentViews = pref.viewed_products
      .filter(view => {
        const viewedAt = new Date(view.viewed_at);
        const hoursSinceView = (now - viewedAt) / (1000 * 60 * 60);
        return hoursSinceView >= 24 && hoursSinceView <= 72; // Between 24-72 hours ago
      })
      .sort((a, b) => new Date(b.viewed_at) - new Date(a.viewed_at));

    if (recentViews.length === 0) continue;

    const latestView = recentViews[0];
    
    // Check if user already purchased this product
    const userOrders = orders.filter(o => o.created_by === pref.created_by);
    const alreadyPurchased = userOrders.some(order => 
      order.items?.some(item => 
        item.productName === latestView.product_name
      )
    );

    if (alreadyPurchased) continue;

    // Find the product details
    const product = products.find(p => p.id === latestView.product_id || p.name === latestView.product_name);
    if (!product) continue;

    // Send reminder email
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: 'Barn Research',
        to: pref.created_by,
        subject: `Still interested in ${product.name}?`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1c1917; color: #fef3c7; padding: 40px; border-radius: 8px;">
            <h1 style="color: #7D4A2B; font-size: 28px; margin-bottom: 20px;">Still researching ${product.name}?</h1>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We noticed you were looking at <strong>${product.name}</strong> recently. 
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              ${product.description || 'This research peptide is available with verified COAs and same-day shipping.'}
            </p>
            
            <div style="background-color: #292524; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="font-size: 14px; color: #a8a29e; margin: 0;">Starting at</p>
              <p style="font-size: 32px; font-weight: bold; color: #7D4A2B; margin: 10px 0;">$${product.price_from}</p>
              <p style="font-size: 14px; color: #a8a29e; margin: 0;">Third-party tested • COA included • Same-day shipping</p>
            </div>
            
            <a href="https://yourwebsite.com" style="display: inline-block; background-color: #7D4A2B; color: #fef3c7; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Product
            </a>
            
            <p style="font-size: 12px; color: #78716c; margin-top: 40px; padding-top: 20px; border-top: 1px solid #44403c;">
              FOR RESEARCH USE ONLY. Not for human or animal consumption.
            </p>
          </div>
        `
      });

      emailsSent.push({
        email: pref.created_by,
        product: product.name
      });
    } catch (error) {
      console.error(`Failed to send email to ${pref.created_by}:`, error);
    }
  }

  return Response.json({
    success: true,
    emailsSent: emailsSent.length,
    details: emailsSent
  });
});