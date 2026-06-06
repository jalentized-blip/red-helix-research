import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Helper: paginate through all records
    const fetchAll = async (entity) => {
      const results = [];
      let skip = 0;
      const limit = 100;
      while (true) {
        const batch = await base44.asServiceRole.entities[entity].list(undefined, limit, skip);
        if (!batch || batch.length === 0) break;
        results.push(...batch);
        if (batch.length < limit) break;
        skip += limit;
      }
      return results;
    };

    // Fetch all entity data in parallel
    const [
      orders,
      products,
      affiliates,
      affiliatePayments,
      affiliateClickLogs,
      promoCodes,
      mailingList,
      welcomeDiscounts,
      orderSnapshots,
      orderCommunications,
      coas,
      userCoas,
      bannerMessages,
      wishListItems,
      testimonials,
      supportConversations,
      addToCartLogs,
      forumThreads,
      seoReports,
    ] = await Promise.all([
      fetchAll('Order'),
      fetchAll('Product'),
      fetchAll('Affiliate'),
      fetchAll('AffiliatePayment'),
      fetchAll('AffiliateClickLog'),
      fetchAll('PromoCode'),
      fetchAll('MailingList'),
      fetchAll('WelcomeDiscount'),
      fetchAll('OrderSnapshot'),
      fetchAll('OrderCommunication'),
      fetchAll('COA'),
      fetchAll('UserCOA'),
      fetchAll('BannerMessage'),
      fetchAll('WishListItem'),
      fetchAll('Testimonial').catch(() => []),
      fetchAll('SupportConversation').catch(() => []),
      fetchAll('AddToCartLog').catch(() => []),
      fetchAll('ForumThread').catch(() => []),
      fetchAll('SEOReport').catch(() => []),
    ]);

    // ── DERIVED ANALYTICS ─────────────────────────────────────────────────────
    const completedOrders = orders.filter(o =>
      o.payment_status === 'completed' || o.status === 'delivered' || o.status === 'shipped'
    );
    const totalRevenue = completedOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const totalOrders = orders.length;
    const uniqueCustomerEmails = [...new Set(orders.map(o => o.customer_email).filter(Boolean))];

    const revenueByMonth = {};
    completedOrders.forEach(o => {
      const month = (o.created_date || '').slice(0, 7);
      if (month) revenueByMonth[month] = (revenueByMonth[month] || 0) + (o.total_amount || 0);
    });

    const revenueByProduct = {};
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        const key = `${item.productName} — ${item.specification}`;
        if (!revenueByProduct[key]) revenueByProduct[key] = { quantity: 0, revenue: 0 };
        revenueByProduct[key].quantity += item.quantity || 1;
        revenueByProduct[key].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    const topProducts = Object.entries(revenueByProduct)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 20)
      .map(([name, stats]) => ({ name, ...stats }));

    const paymentMethodBreakdown = {};
    orders.forEach(o => {
      const pm = o.payment_method || 'unknown';
      if (!paymentMethodBreakdown[pm]) paymentMethodBreakdown[pm] = { count: 0, revenue: 0 };
      paymentMethodBreakdown[pm].count++;
      paymentMethodBreakdown[pm].revenue += o.total_amount || 0;
    });

    const statusBreakdown = {};
    orders.forEach(o => {
      const s = o.status || 'unknown';
      statusBreakdown[s] = (statusBreakdown[s] || 0) + 1;
    });

    const affiliateRevenue = {};
    orders.filter(o => o.affiliate_code).forEach(o => {
      const code = o.affiliate_code;
      if (!affiliateRevenue[code]) affiliateRevenue[code] = { orders: 0, revenue: 0, commission: 0 };
      affiliateRevenue[code].orders++;
      affiliateRevenue[code].revenue += o.total_amount || 0;
      affiliateRevenue[code].commission += o.affiliate_commission || 0;
    });

    const promoUsage = {};
    orders.filter(o => o.promo_code).forEach(o => {
      const code = o.promo_code;
      promoUsage[code] = (promoUsage[code] || 0) + 1;
    });

    // ── CUSTOMER PROFILES ────────────────────────────────────────────────────
    const customerMap = {};
    orders.forEach(o => {
      const email = o.customer_email;
      if (!email) return;
      if (!customerMap[email]) {
        customerMap[email] = {
          email,
          name: o.customer_name,
          phone: o.customer_phone,
          shipping_address: o.shipping_address,
          orders: [],
          total_spent: 0,
          first_order: o.created_date,
          last_order: o.created_date,
          promo_codes_used: [],
          affiliate_codes_used: [],
        };
      }
      const c = customerMap[email];
      c.orders.push({
        order_number: o.order_number,
        date: o.created_date,
        total: o.total_amount,
        status: o.status,
        payment_status: o.payment_status,
        payment_method: o.payment_method,
        items: o.items,
      });
      c.total_spent += o.total_amount || 0;
      if (o.created_date < c.first_order) c.first_order = o.created_date;
      if (o.created_date > c.last_order) c.last_order = o.created_date;
      if (o.promo_code && !c.promo_codes_used.includes(o.promo_code)) c.promo_codes_used.push(o.promo_code);
      if (o.affiliate_code && !c.affiliate_codes_used.includes(o.affiliate_code)) c.affiliate_codes_used.push(o.affiliate_code);
    });

    const customers = Object.values(customerMap).sort((a, b) => b.total_spent - a.total_spent);

    // ── PRODUCT CATALOG NORMALIZED ────────────────────────────────────────────
    const productCatalog = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      badge: p.badge,
      is_featured: p.is_featured,
      hidden: p.hidden,
      in_stock: p.in_stock,
      price_from: p.price_from,
      cost_price: p.cost_price,
      image_url: p.image_url,
      specifications: (p.specifications || []).map(s => ({
        name: s.name,
        price: s.price,
        cost_price: s.cost_price,
        in_stock: s.in_stock,
        stock_quantity: s.stock_quantity,
        hidden: s.hidden,
      })),
      created_date: p.created_date,
      updated_date: p.updated_date,
    }));

    // ── MAILING LIST CLEAN ────────────────────────────────────────────────────
    const mailingListClean = mailingList.map(m => ({
      email: m.email,
      source: m.source,
      discount_code: m.discount_code,
      subscribed: m.subscribed,
      unsubscribed_at: m.unsubscribed_at,
      tags: m.tags,
      created_date: m.created_date,
    }));

    // ── FINAL EXPORT OBJECT ───────────────────────────────────────────────────
    const exportData = {
      _meta: {
        export_version: '2.0',
        exported_at: new Date().toISOString(),
        exported_by: user.email,
        site: 'Red Helix Research',
        description: 'Full data migration export — all business-critical data',
        record_counts: {
          orders: orders.length,
          products: products.length,
          customers: customers.length,
          affiliates: affiliates.length,
          affiliate_payments: affiliatePayments.length,
          affiliate_click_logs: affiliateClickLogs.length,
          promo_codes: promoCodes.length,
          mailing_list: mailingList.length,
          welcome_discounts: welcomeDiscounts.length,
          order_snapshots: orderSnapshots.length,
          order_communications: orderCommunications.length,
          coas: coas.length,
          user_coas: userCoas.length,
          banner_messages: bannerMessages.length,
          wish_list_items: wishListItems.length,
          testimonials: testimonials.length,
          support_conversations: supportConversations.length,
          add_to_cart_logs: addToCartLogs.length,
          forum_threads: forumThreads.length,
          seo_reports: seoReports.length,
        },
      },

      // ── ANALYTICS SUMMARY ──────────────────────────────────────────────────
      analytics: {
        total_orders: totalOrders,
        completed_orders: completedOrders.length,
        total_gross_revenue: parseFloat(totalRevenue.toFixed(2)),
        average_order_value: completedOrders.length
          ? parseFloat((totalRevenue / completedOrders.length).toFixed(2))
          : 0,
        unique_customers: uniqueCustomerEmails.length,
        revenue_by_month: revenueByMonth,
        top_products_by_revenue: topProducts,
        payment_method_breakdown: paymentMethodBreakdown,
        order_status_breakdown: statusBreakdown,
        affiliate_revenue_by_code: affiliateRevenue,
        promo_code_usage: promoUsage,
      },

      // ── CORE BUSINESS DATA ─────────────────────────────────────────────────
      orders,
      order_snapshots: orderSnapshots,
      order_communications: orderCommunications,

      // ── CUSTOMERS ─────────────────────────────────────────────────────────
      customers,

      // ── PRODUCTS ──────────────────────────────────────────────────────────
      products: productCatalog,

      // ── AFFILIATES ────────────────────────────────────────────────────────
      affiliates,
      affiliate_payments: affiliatePayments,
      affiliate_click_logs: affiliateClickLogs,

      // ── PROMOTIONS ────────────────────────────────────────────────────────
      promo_codes: promoCodes,
      welcome_discounts: welcomeDiscounts,

      // ── MAILING LIST ──────────────────────────────────────────────────────
      mailing_list: mailingListClean,

      // ── CONTENT & CATALOG ─────────────────────────────────────────────────
      coas,
      user_coas: userCoas,
      banner_messages: bannerMessages,
      wish_list_items: wishListItems,
      testimonials,
      forum_threads: forumThreads,

      // ── SUPPORT ───────────────────────────────────────────────────────────
      support_conversations: supportConversations,

      // ── ANALYTICS LOGS ────────────────────────────────────────────────────
      add_to_cart_logs: addToCartLogs,
      seo_reports: seoReports,
    };

    const json = JSON.stringify(exportData, null, 2);
    const bytes = new TextEncoder().encode(json);

    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename=RedHelixResearch_FullExport_${new Date().toISOString().slice(0, 10)}.json`,
        'Content-Length': bytes.byteLength.toString(),
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});