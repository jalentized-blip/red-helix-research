/**
 * exportCustomerAccounts — Owner-only customer account migration download
 * Exports all registered User accounts + their full order history, mailing list
 * status, affiliate status, welcome discounts, and migration instructions.
 *
 * Hard-locked to owner email. Delete after downloading.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const OWNER_EMAIL = 'jalentized@gmail.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin' || user.email !== OWNER_EMAIL) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Paginate helper
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

    // Fetch users + all related data in parallel
    const [users, orders, mailingList, affiliates, welcomeDiscounts] = await Promise.all([
      fetchAll('User'),
      fetchAll('Order'),
      fetchAll('MailingList'),
      fetchAll('Affiliate'),
      fetchAll('WelcomeDiscount'),
    ]);

    // Index orders by customer email for fast lookup
    const ordersByEmail = {};
    orders.forEach(o => {
      if (!o.customer_email) return;
      const email = o.customer_email.toLowerCase().trim();
      if (!ordersByEmail[email]) ordersByEmail[email] = [];
      ordersByEmail[email].push(o);
    });

    // Index mailing list by email
    const mailingByEmail = {};
    mailingList.forEach(m => {
      if (m.email) mailingByEmail[m.email.toLowerCase().trim()] = m;
    });

    // Index affiliates by email
    const affiliateByEmail = {};
    affiliates.forEach(a => {
      if (a.affiliate_email) affiliateByEmail[a.affiliate_email.toLowerCase().trim()] = a;
    });

    // Index welcome discounts by email
    const discountByEmail = {};
    welcomeDiscounts.forEach(d => {
      if (d.email) discountByEmail[d.email.toLowerCase().trim()] = d;
    });

    // Build enriched customer profiles for ALL registered users
    const registeredAccounts = users.map(u => {
      const email = (u.email || '').toLowerCase().trim();
      const userOrders = ordersByEmail[email] || [];
      const completedOrders = userOrders.filter(o =>
        o.payment_status === 'completed' || o.status === 'shipped' || o.status === 'delivered'
      );
      const totalSpent = completedOrders.reduce((s, o) => s + (o.total_amount || 0), 0);

      return {
        // ── ACCOUNT INFO ──────────────────────────────────────────────────────
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        created_date: u.created_date,
        updated_date: u.updated_date,

        // ── EXTRA USER FIELDS (custom fields if any set via updateMe) ─────────
        ...(() => {
          const builtIn = new Set(['id', 'email', 'full_name', 'role', 'created_date', 'updated_date']);
          const extra = {};
          Object.entries(u).forEach(([k, v]) => { if (!builtIn.has(k)) extra[k] = v; });
          return Object.keys(extra).length > 0 ? { custom_fields: extra } : {};
        })(),

        // ── ORDER HISTORY ─────────────────────────────────────────────────────
        order_count: userOrders.length,
        completed_order_count: completedOrders.length,
        total_spent: parseFloat(totalSpent.toFixed(2)),
        first_order_date: userOrders.length > 0
          ? userOrders.map(o => o.created_date).sort()[0]
          : null,
        last_order_date: userOrders.length > 0
          ? userOrders.map(o => o.created_date).sort().reverse()[0]
          : null,
        orders: userOrders.map(o => ({
          order_number: o.order_number,
          date: o.created_date,
          status: o.status,
          payment_status: o.payment_status,
          payment_method: o.payment_method,
          total_amount: o.total_amount,
          items: o.items,
          tracking_number: o.tracking_number || null,
          carrier: o.carrier || null,
          promo_code: o.promo_code || null,
          affiliate_code: o.affiliate_code || null,
          shipping_address: o.shipping_address,
          customer_phone: o.customer_phone || null,
          admin_notes: o.admin_notes || null,
        })),

        // ── MAILING LIST STATUS ────────────────────────────────────────────────
        mailing_list: mailingByEmail[email] ? {
          subscribed: mailingByEmail[email].subscribed,
          source: mailingByEmail[email].source,
          tags: mailingByEmail[email].tags,
          discount_code: mailingByEmail[email].discount_code,
          joined_date: mailingByEmail[email].created_date,
          unsubscribed_at: mailingByEmail[email].unsubscribed_at || null,
        } : null,

        // ── AFFILIATE STATUS ──────────────────────────────────────────────────
        affiliate: affiliateByEmail[email] ? {
          code: affiliateByEmail[email].code,
          discount_percent: affiliateByEmail[email].discount_percent,
          is_active: affiliateByEmail[email].is_active,
          total_commission: affiliateByEmail[email].total_commission,
          total_orders: affiliateByEmail[email].total_orders,
          total_revenue: affiliateByEmail[email].total_revenue,
          total_clicks: affiliateByEmail[email].total_clicks,
        } : null,

        // ── WELCOME DISCOUNT ──────────────────────────────────────────────────
        welcome_discount: discountByEmail[email] ? {
          code: discountByEmail[email].code,
          used: discountByEmail[email].used,
          used_on_order: discountByEmail[email].used_on_order || null,
          expires_at: discountByEmail[email].expires_at || null,
        } : null,
      };
    }).sort((a, b) => b.total_spent - a.total_spent);

    // Also capture "guest" customers (placed orders but never registered an account)
    const registeredEmails = new Set(users.map(u => (u.email || '').toLowerCase().trim()));
    const guestEmails = [...new Set(
      orders
        .map(o => (o.customer_email || '').toLowerCase().trim())
        .filter(e => e && !registeredEmails.has(e))
    )];

    const guestCustomers = guestEmails.map(email => {
      const userOrders = ordersByEmail[email] || [];
      const completedOrders = userOrders.filter(o =>
        o.payment_status === 'completed' || o.status === 'shipped' || o.status === 'delivered'
      );
      const totalSpent = completedOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
      const sample = userOrders[0] || {};
      return {
        email,
        full_name: sample.customer_name || null,
        phone: sample.customer_phone || null,
        account_type: 'guest',
        order_count: userOrders.length,
        completed_order_count: completedOrders.length,
        total_spent: parseFloat(totalSpent.toFixed(2)),
        last_known_shipping_address: sample.shipping_address || null,
        mailing_list: mailingByEmail[email] ? {
          subscribed: mailingByEmail[email].subscribed,
          source: mailingByEmail[email].source,
          tags: mailingByEmail[email].tags,
        } : null,
        orders: userOrders.map(o => ({
          order_number: o.order_number,
          date: o.created_date,
          status: o.status,
          payment_status: o.payment_status,
          total_amount: o.total_amount,
          items: o.items,
        })),
      };
    }).sort((a, b) => b.total_spent - a.total_spent);

    const exportedAt = new Date().toISOString();

    const payload = {
      _meta: {
        title: "Red Helix Research — Customer Accounts Migration Export",
        exported_at: exportedAt,
        exported_by: user.email,
        warning: "OWNER ONLY. Contains PII. Delete after transferring. Do not share.",
        counts: {
          registered_accounts: registeredAccounts.length,
          guest_customers: guestCustomers.length,
          total_unique_customers: registeredAccounts.length + guestCustomers.length,
          mailing_list_subscribers: mailingList.filter(m => m.subscribed).length,
          affiliates: affiliates.length,
          total_orders: orders.length,
        },
      },

      // ─── REGISTERED ACCOUNTS (have Base44 login) ──────────────────────────
      registered_accounts: {
        _description: "Users who created an account (Base44 auth). Includes full order history, mailing list status, affiliate info. Re-invite these users to your new platform.",
        _important: "PASSWORDS CANNOT BE EXPORTED — Base44 handles auth internally. You must re-invite all users to the new platform. They will need to set a new password. Send them a 'platform migration' email with a re-signup link.",
        _reinvite_note: "Use your new platform's invite/import feature. Send each email address an invitation. Their order history will need to be linked by email match after they sign up.",
        _fields_explained: {
          role: "'admin' = admin user, 'user' = regular customer",
          custom_fields: "Any extra data saved via base44.auth.updateMe() — e.g. preferences, saved addresses",
          orders: "Full order history linked by email",
          mailing_list: "Newsletter subscription status",
          affiliate: "Affiliate program details if they are an affiliate",
          welcome_discount: "Welcome discount code issued to this user",
        },
        records: registeredAccounts,
      },

      // ─── GUEST CUSTOMERS (ordered but never registered) ────────────────────
      guest_customers: {
        _description: "Customers who placed orders without creating an account. No login exists for them — only order data and possibly mailing list subscriptions.",
        _migration_note: "You can import these as contacts/customers in your new CRM. Consider sending them a 'create your account' email with their order history.",
        records: guestCustomers,
      },

      // ─── MAILING LIST (full) ───────────────────────────────────────────────
      mailing_list_full: {
        _description: "Complete mailing list export — all subscribers regardless of whether they have an account.",
        _import_tip: "Import into your new email platform (Klaviyo, Mailchimp, etc.) using the email + subscribed + tags fields. Filter out subscribed=false.",
        active_subscribers: mailingList.filter(m => m.subscribed).map(m => ({
          email: m.email,
          source: m.source,
          tags: m.tags || [],
          discount_code: m.discount_code || null,
          joined: m.created_date,
        })),
        unsubscribed: mailingList.filter(m => !m.subscribed).map(m => ({
          email: m.email,
          unsubscribed_at: m.unsubscribed_at,
        })),
      },

      // ─── MIGRATION INSTRUCTIONS ────────────────────────────────────────────
      migration_instructions: {
        auth_system: {
          warning: "Base44 uses its own managed auth. Passwords, sessions, and tokens CANNOT be exported — they never leave Base44's systems.",
          action_required: "You MUST re-invite every user to your new platform. They get a fresh password.",
          recommended_flow: [
            "1. Export this file.",
            "2. Set up your new platform with user auth.",
            "3. Send a bulk 'platform migration' email to all registered_accounts emails.",
            "4. In the email, explain they need to re-create their account at the new URL.",
            "5. After they sign up, their order history auto-links by email match.",
            "6. For guests, import as contacts only — they have no login to migrate.",
          ],
        },
        data_to_import: {
          crm_contacts: "Import mailing_list_full.active_subscribers into your email/CRM platform",
          customer_profiles: "Create customer records using registered_accounts + guest_customers",
          order_history: "Each record's 'orders' array contains full order history to link to the new customer profile",
          affiliates: "Re-create affiliate accounts using each record's 'affiliate' field (code, commission rate, etc.)",
        },
        pii_handling: {
          warning: "This file contains PII (names, emails, phone numbers, shipping addresses). Handle per GDPR/CCPA.",
          delete_after_use: "Delete this file once you've completed migration.",
          do_not_store: "Do not store this file in cloud storage without encryption.",
        },
        entities_to_recreate: {
          User: "Built-in to your new auth platform. Re-invite each email.",
          MailingList: "Custom entity — recreate with: email, source, subscribed, tags, discount_code",
          Affiliate: "Custom entity — recreate with: code, affiliate_email, affiliate_name, discount_percent, is_active, totals",
          WelcomeDiscount: "Custom entity — recreate with: code, email, used, used_on_order, expires_at",
        },
        key_files_on_current_platform: {
          auth: "lib/AuthContext.jsx — handles login/logout/user state",
          account_page: "pages/Account.jsx — customer-facing account dashboard",
          affiliate_dashboard: "pages/AffiliateDashboard.jsx — affiliate tracking",
          admin_customer_management: "pages/AdminCustomerManagement.jsx — admin customer list",
          mailing_list_logic: "Customers are added to MailingList entity on: (1) welcome discount signup, (2) checkout, (3) manually by admin",
          invite_function: "base44.users.inviteUser(email, role) — used to invite new users programmatically",
        },
      },
    };

    const json = JSON.stringify(payload, null, 2);
    const bytes = new TextEncoder().encode(json);

    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename=RHR_CustomerAccounts_${new Date().toISOString().slice(0, 10)}.json`,
        'Content-Length': bytes.byteLength.toString(),
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});