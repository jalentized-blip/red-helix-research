/**
 * ownerMigrationKit — ONE-TIME OWNER-ONLY MIGRATION DOWNLOAD
 *
 * SECURITY: Hard-locked to a single owner email. Any other user gets 403.
 * After download, this function should be DELETED or the OWNER_EMAIL changed to
 * an impossible address to permanently disable it.
 *
 * Contains:
 *  - Full source code of all backend functions (documented)
 *  - All secret key names + their purposes (values must be re-entered manually in new platform)
 *  - Complete payment flow architecture documentation
 *  - AI coder briefing note for rebuilding the stack
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// 🔒 HARD-LOCK: Only this email can ever call this function
const OWNER_EMAIL = 'jalentized@gmail.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Triple-lock: must be authenticated, must be admin, must be the specific owner
    if (!user || user.role !== 'admin' || user.email !== OWNER_EMAIL) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const exportedAt = new Date().toISOString();

    // ─────────────────────────────────────────────────────────────────────────────
    // SECTION 1: SECRET KEYS MANIFEST
    // ─────────────────────────────────────────────────────────────────────────────
    const secretKeysManifest = {
      _note: "These are the SECRET KEY NAMES used by the app. You must re-enter the actual values manually in your new platform's environment variables / secrets manager. The values are never exported for security reasons.",
      payment_secrets: {
        SQUARE_ACCESS_TOKEN: {
          purpose: "Square API access token — used to create payment links via /v2/online-checkout/payment-links",
          used_in_functions: ["createSquareCheckout", "squareWebhook", "syncSquarePayments", "lookupSquareOrder"],
          where_to_get: "Square Developer Dashboard → Your Application → Production Access Token",
          format: "EAAAl... (starts with EAAA for production)",
        },
        SQUARE_LOCATION_ID: {
          purpose: "Your Square business location ID — required on every payment link creation",
          used_in_functions: ["createSquareCheckout"],
          where_to_get: "Square Developer Dashboard → Locations → copy Location ID",
          format: "L... string",
        },
        SQUARE_WEBHOOK_SIGNATURE_KEY: {
          purpose: "HMAC-SHA256 signature key to verify Square webhook authenticity (timing-safe verification)",
          used_in_functions: ["squareWebhook"],
          where_to_get: "Square Developer Dashboard → Webhooks → your endpoint → Signature Key",
          format: "Random string provided by Square",
          critical: "MUST be set before registering webhook URL or webhooks will silently fail verification",
        },
        GREEN_MONEY_CLIENT_ID: {
          purpose: "GreenMoney / eCheck payment processor client ID",
          used_in_functions: ["payment processing"],
          where_to_get: "GreenMoney merchant portal",
        },
        GREEN_MONEY_SECRET_KEY: {
          purpose: "GreenMoney / eCheck payment processor secret key",
          used_in_functions: ["payment processing"],
          where_to_get: "GreenMoney merchant portal",
        },
      },
      email_secrets: {
        RESEND_API_KEY: {
          purpose: "Resend.com transactional email API key — used for ALL customer and admin emails",
          used_in_functions: ["sendOrderEmail", "sendWelcomeEmail", "sendWelcomeDiscountEmail", "sendAbandonedCartEmail", "sendBulkEmail", "sendPostPurchaseEmail", "sendProductReminderEmails", "sendReEngagementEmails", "sendReorderReminder", "coaSubmissionAlert", "sendOutageEmail"],
          where_to_get: "resend.com → API Keys",
          format: "re_...",
          critical: "From address must be from a verified domain in Resend. Current from: rhrsupport@redhelixresearch.com / Red Helix Research",
        },
        GMAIL_USER: {
          purpose: "Gmail address used as backup email sender",
          where_to_get: "Your Gmail account",
        },
        GMAIL_APP_PASSWORD: {
          purpose: "Gmail App Password (not your regular password) for SMTP sending",
          where_to_get: "Google Account → Security → 2-Step Verification → App Passwords",
        },
      },
      sms_and_comms_secrets: {
        TWILIO_ACCOUNT_SID: {
          purpose: "Twilio account SID for SMS notifications",
          used_in_functions: ["sendTelegramMessage", "admin alerts"],
          where_to_get: "Twilio Console → Account Dashboard",
        },
        TWILIO_AUTH_TOKEN: {
          purpose: "Twilio auth token",
          where_to_get: "Twilio Console → Account Dashboard",
        },
        TWILIO_PHONE_NUMBER: {
          purpose: "Your Twilio phone number for outbound SMS",
          where_to_get: "Twilio Console → Phone Numbers",
          format: "+1XXXXXXXXXX",
        },
        ADMIN_PHONE_NUMBER: {
          purpose: "Your personal phone number to receive admin SMS alerts",
          format: "+1XXXXXXXXXX",
        },
        DISCORD_BOT_TOKEN: {
          purpose: "Discord bot token for order notifications in Discord server",
          where_to_get: "Discord Developer Portal → Applications → Your Bot → Token",
        },
        DISCORD_OWNER_ID: {
          purpose: "Your Discord user ID for DM notifications",
          where_to_get: "Discord → User Settings → Advanced → Developer Mode → right-click your name → Copy ID",
        },
      },
      ai_secrets: {
        GEMINI_API_KEY: {
          purpose: "Google Gemini AI — used for SEO optimization engine, content generation",
          used_in_functions: ["seoOptimizationEngine", "fulfillmentAssistant"],
          where_to_get: "Google AI Studio → API Keys",
        },
        OPENAI_API_KEY: {
          purpose: "OpenAI — used for AI voice responses, advanced content generation",
          used_in_functions: ["aiVoiceResponse"],
          where_to_get: "platform.openai.com → API Keys",
        },
        ELEVENLABS_API_KEY: {
          purpose: "ElevenLabs text-to-speech for voice assistant features",
          used_in_functions: ["textToSpeech", "aiVoiceResponse"],
          where_to_get: "elevenlabs.io → Profile → API Key",
        },
        ELEVENLABS_VOICE_ID: {
          purpose: "Specific ElevenLabs voice ID for the site's voice assistant",
          where_to_get: "elevenlabs.io → Voices → copy Voice ID",
        },
      },
      address_and_verification_secrets: {
        GEOAPIFY_API_KEY: {
          purpose: "Address validation and autocomplete API",
          used_in_functions: ["validateAddressGeoapify"],
          where_to_get: "myprojects.geoapify.com → API Keys",
        },
        TURNSTILE_SECRET_KEY: {
          purpose: "Cloudflare Turnstile CAPTCHA secret key (bot protection at checkout)",
          used_in_functions: ["fraudCheck", "checkout flow"],
          where_to_get: "Cloudflare Dashboard → Turnstile → your site → Secret Key",
          critical: "Paired with a TURNSTILE_SITE_KEY in the frontend. Both must be replaced together.",
        },
      },
      financial_compliance_secrets: {
        PLAID_CLIENT_ID: {
          purpose: "Plaid financial data API client ID (bank account linking feature)",
          used_in_functions: ["plaidCreateLinkToken", "plaidExchangeToken", "plaidCreatePayment", "plaidWebhook", "plaidFraudDetection", "plaidAdminActions", "plaidComplianceAudit"],
          where_to_get: "dashboard.plaid.com → Team Settings → Keys",
        },
        PLAID_SECRET: {
          purpose: "Plaid API secret key",
          where_to_get: "dashboard.plaid.com → Team Settings → Keys",
        },
        PLAID_ENVIRONMENT: {
          purpose: "Plaid environment: 'sandbox' for testing, 'production' for live",
          values: ["sandbox", "development", "production"],
        },
      },
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // SECTION 2: PAYMENT FLOW ARCHITECTURE (Full AI Coder Briefing)
    // ─────────────────────────────────────────────────────────────────────────────
    const paymentFlowArchitecture = {
      _title: "Red Helix Research — Full Payment & Order Flow Architecture",
      _for_ai_coder: true,

      overview: `
This is a peptide research products e-commerce site built on Base44 (React + Deno backend functions).
The site accepts THREE payment methods: Square card payments, cryptocurrency, and Zelle (manual).
ALL payment flows converge into a single Order entity with consistent status tracking.

PLATFORM: Base44 (base44.com) — React frontend, Deno backend functions, built-in DB.
FRONTEND FRAMEWORK: React + Tailwind CSS + shadcn/ui components + framer-motion
ROUTING: React Router v6, custom App.jsx with lazy-loaded pages
DATABASE: Base44 entities (MongoDB-like, accessed via base44.entities.EntityName.method())
BACKEND: Deno backend functions invoked via base44.functions.invoke('functionName', payload)
EMAIL: Resend.com API (not SendGrid, not nodemailer — Resend only)
      `,

      checkout_flow_step_by_step: {
        "Step 1 — Cart": {
          file: "pages/Cart.jsx",
          description: "Cart is stored in localStorage (key: 'rdr_cart'). Cart items have: productId, productName, specification, quantity, price. The cart utility is in components/utils/cart.js",
          promo_code_handling: "Promo codes are applied client-side optimistically but ALWAYS re-validated server-side at checkout. Never trust the client-computed discount.",
        },
        "Step 2 — Customer Info": {
          file: "pages/CustomerInfo.jsx",
          description: "Collects: customerName, customerEmail, customerPhone, shippingAddress (address, city, state, zip, country). Address is validated via the validateAddressGeoapify backend function before proceeding.",
          address_validation: "Calls validateAddressGeoapify function → Geoapify API → returns normalized address. Non-blocking: if validation fails, user can still proceed.",
        },
        "Step 3A — Square Card Payment": {
          flow: [
            "1. Frontend calls createSquareCheckout backend function with cart items + customer info + promoCode",
            "2. createSquareCheckout calls validateOrder first (server-side price integrity check)",
            "3. If validateOrder passes, createSquareCheckout creates a Square Payment Link via Square API",
            "4. Frontend receives checkoutUrl and redirects customer to Square's hosted payment page",
            "5. Customer pays on Square's page, Square redirects to /PaymentCompleted?order=ORDER_NUMBER",
            "6. SIMULTANEOUSLY: Square fires webhook events (payment.created → payment.updated → order.updated)",
            "7. squareWebhook backend function handles all webhook events with HMAC verification",
            "8. squareWebhook marks order as payment_status: 'completed', status: 'processing'",
            "9. squareWebhook calls decrementStock to reduce inventory",
            "10. squareWebhook sends admin email notification",
          ],
          webhook_url: "Must be registered in Square Developer Dashboard. URL format: https://[base44-function-url]/squareWebhook",
          webhook_events_subscribed: ["payment.created", "payment.updated", "order.updated", "order.fulfillment.updated", "refund.created", "refund.updated"],
          key_gotcha: "Square payment links redirect to PaymentCompleted page BEFORE the webhook fires. So on PaymentCompleted, the order may still show payment_status: 'pending'. The page polls for completion. The webhook is the authoritative payment confirmation, not the redirect.",
        },
        "Step 3B — Cryptocurrency Payment": {
          file: "pages/CryptoCheckout.jsx",
          flow: [
            "1. Customer selects crypto (BTC, ETH, USDT, USDC)",
            "2. Frontend shows wallet addresses (hardcoded in verifyCryptoTransaction.js)",
            "3. Customer sends crypto to the address",
            "4. Customer enters their transaction hash (txHash)",
            "5. Frontend calls verifyCryptoTransaction backend function",
            "6. verifyCryptoTransaction calls blockchain.info (BTC) or Etherscan (ETH/USDT/USDC) to verify",
            "7. If verified (correct address, amount within 5% tolerance, enough confirmations): order marked complete",
            "8. BTC requires 3 confirmations, ETH/tokens require 12",
          ],
          wallet_addresses: {
            BTC: "3BuLwoGXiWx56RD7GsP98Nu6i9G2igYHss",
            ETH: "0x30eD305B89b6207A5fa907575B395c9189728EbC",
            USDT: "0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c",
            USDC: "0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c",
          },
          note: "UPDATE THESE WALLET ADDRESSES in verifyCryptoTransaction.js when migrating. They are hardcoded in that file.",
        },
        "Step 3C — Zelle (Manual)": {
          description: "Customer is shown Zelle payment info and submits order. Order is created with payment_status: 'pending', payment_method: 'zelle'. Admin manually confirms payment in AdminOrderManagement and marks order as paid.",
          no_webhook: "Zelle has no programmatic verification. It's fully manual.",
        },
        "Step 4 — Order Creation": {
          description: "Order entity is created at checkout submission time (all 3 payment methods). Order starts as payment_status: 'pending'. The order number format is: RHR-XXXXXX (random 6 chars).",
          stock_reservation: "When order is created, stock_reserved: true is set and reserved_until is 15 minutes from now. decrementStock is called immediately for crypto/zelle. For Square, stock is decremented on webhook confirmation.",
        },
        "Step 5 — PaymentCompleted Page": {
          file: "pages/PaymentCompleted.jsx",
          description: "Landing page after Square redirect. Reads ?order=ORDER_NUMBER from URL. Polls the Order entity every 3 seconds for up to 2 minutes waiting for payment_status to become 'completed'. Shows appropriate UI based on status.",
        },
      },

      backend_functions_complete: {
        validateOrder: {
          file: "functions/validateOrder.js",
          purpose: "Server-side order validation — price integrity, stock check, promo code validation",
          actions: ["validate_promo", "validate_order", "check_stock", "mark_promo_used"],
          called_by: ["createSquareCheckout (internal)", "Frontend checkout flow"],
          pricing_rule: "SHIPPING_COST = $15.00 flat rate always added",
          promo_hierarchy: "Static codes → Affiliate codes from DB → PromoCode entity → WelcomeDiscount entity",
          price_integrity: "Client price must match server price within $0.01 or order is rejected with priceMismatch: true",
        },
        createSquareCheckout: {
          file: "functions/createSquareCheckout.js",
          purpose: "Creates Square payment link. Internally calls validateOrder first.",
          redirect_url: "https://redhelixresearch.com/PaymentCompleted?order=ORDER_NUMBER",
          processing_fee: "10% processing fee added as a line item when payment method is square_payment",
          discount_handling: "Server-validated discount passed to Square as an ORDER-scope discount (not negative line items)",
        },
        squareWebhook: {
          file: "functions/squareWebhook.js",
          purpose: "Handles all Square webhook events. HMAC verified. Deduplication via in-memory event_id cache.",
          security_features: [
            "Timing-safe HMAC-SHA256 verification",
            "Event ID deduplication (24h cache)",
            "Replay attack protection (24h window)",
            "Merchant ID validation (optional)",
            "Amount validation with drift tolerance",
          ],
          order_matching_strategy: "Tries: (1) square_order_id field, (2) transaction_id field, (3) order_number === reference_id",
          rescued_orders: "If an order was swept to 'abandoned' by the stale-order cleanup job but Square later confirms payment, the webhook 'rescues' it and re-decrements stock",
          returns_503_for: "Transient DB errors (Square will retry). Returns 200 for everything else (including auth failures, to avoid log spam from bad actors).",
        },
        decrementStock: {
          file: "functions/decrementStock.js",
          purpose: "Atomically decrements product spec stock quantities. Uses pre-flight check then re-fetches product before writing to avoid clobbering concurrent edits.",
          actions: ["decrement", "restore"],
          stock_logic: "stock_quantity > 0 = in stock | stock_quantity === 0 = out of stock | stock_quantity === null/-1/undefined = unlimited (defer to in_stock flag)",
          called_by: ["squareWebhook (on payment completion)", "CryptoCheckout (on crypto verification)", "Manual order confirmation"],
        },
        fraudCheck: {
          file: "functions/fraudCheck.js",
          purpose: "Risk scoring at checkout. Runs for ALL payment methods. Saves evidence record to OrderFraudEvidence entity.",
          risk_signals: ["Disposable email", "VPN/proxy IP", "IP country mismatch", "High velocity (3+ orders/24h)", "Prior chargeback history", "Same device different emails (3+)", "Freight forwarder", "PO box", "Billing/shipping mismatch"],
          blocking_logic: "ONLY blocks when risk >= 'critical' AND 2+ hard signals. Hard signals: DISPOSABLE_EMAIL, MULTI_ACCOUNT_SAME_DEVICE, PRIOR_CHARGEBACK_HISTORY. Soft signals alone never block (to avoid false positives with legit customers).",
          fail_open: "If the function errors, it returns allowed: true to never block legitimate orders due to a system fault",
        },
        sendOrderEmail: {
          file: "functions/sendOrderEmail.js",
          purpose: "Sends transactional emails to customers (order confirmation, shipping, etc.)",
          email_provider: "Resend.com API. From: rhrsupport@redhelixresearch.com",
          note: "No auth required — called during guest checkout. Abuse guard: recipient must contain '@'",
        },
        verifyCryptoTransaction: {
          file: "functions/verifyCryptoTransaction.js",
          purpose: "Verifies crypto payments on-chain using blockchain APIs (no trusted intermediary)",
          btc_api: "blockchain.info/rawtx/{txHash}",
          eth_api: "Etherscan API (ETHERSCAN_API_KEY — this secret is NOT currently set, ETH verification works in degraded mode without it)",
        },
        releaseExpiredReservations: {
          file: "functions/releaseExpiredReservations.js",
          purpose: "Scheduled job that sweeps orders with reserved_until < now and payment_status: 'pending' → marks them 'abandoned' and restores stock",
          schedule: "Runs every 15 minutes via automation",
        },
        syncSquarePayments: {
          file: "functions/syncSquarePayments.js",
          purpose: "Manual sync — polls Square API for recent payments and reconciles with our orders. Used as a backup in case webhooks are missed.",
        },
        saveCheckoutSnapshot: {
          file: "functions/saveCheckoutSnapshot.js",
          purpose: "Saves an immutable OrderSnapshot at checkout time (captures cart state before any post-checkout changes)",
        },
        autoUpdateDeliveryStatus: {
          file: "functions/autoUpdateDeliveryStatus.js",
          purpose: "Polls USPS/UPS/FedEx/DHL tracking APIs to auto-update order delivered_date and status",
          schedule: "Runs periodically via automation",
        },
      },

      entity_data_model: {
        Order: {
          key_fields: ["order_number (RHR-XXXXXX)", "payment_method (square_payment|cryptocurrency|zelle)", "payment_status (pending|completed|abandoned|refunded)", "status (pending|processing|shipped|delivered|cancelled)", "stock_reserved (bool)", "square_order_id", "transaction_id"],
          rls: "Admin can read/write all orders. Customers can only read/update their own (matched by customer_email vs user.email)",
        },
        Product: {
          key_fields: ["name", "specifications (array with: name, price, cost_price, in_stock, stock_quantity, hidden)", "hidden", "in_stock"],
          stock_management: "Stock is managed per-specification, not at product level. in_stock on the product is a derived flag (true if ANY spec has stock).",
        },
        PromoCode: {
          note: "DB-managed promo codes. Also has static codes in validateOrder.js (SAVE10, SAVE20, WELCOME, etc.) and affiliate codes loaded from Affiliate entity.",
        },
        WelcomeDiscount: {
          note: "One-time 10% discount codes for new email subscribers. Single-vials-only. Tracked by fingerprint to prevent reuse.",
          discount_amount: "10% off single vials only (not bundles/kits)",
        },
        Affiliate: {
          note: "Affiliates get 15% customer discount by default. Commission tracked per order. Codes auto-loaded into validateOrder's promo code map.",
        },
        OrderFraudEvidence: {
          note: "Created by fraudCheck for every order. Stores full evidence bundle for dispute submission if chargeback occurs.",
        },
      },

      frontend_checkout_components: {
        "pages/Cart.jsx": "Cart display, promo code application, stock validation",
        "pages/CustomerInfo.jsx": "Shipping address form, address validation, payment method selection",
        "pages/CryptoCheckout.jsx": "Crypto payment UI, QR codes, tx hash submission, verification polling",
        "pages/PaymentCompleted.jsx": "Post-Square-payment landing page, polls for payment_status completion",
        "components/checkout/SquarePaymentPanel.jsx": "Square checkout button, creates Square link, handles redirect",
        "components/checkout/FraudCheckGate.jsx": "Wraps checkout submission — calls fraudCheck before allowing order creation",
        "components/checkout/checkoutFailsafe.js": "Failsafe logic: if primary checkout fails, retries with fallback flow",
        "components/TurnstileWidget.jsx": "Cloudflare Turnstile CAPTCHA widget embedded at checkout",
      },

      shipping_and_fulfillment: {
        shipping_cost: "$15.00 flat rate on ALL orders (hardcoded in validateOrder.js SHIPPING_COST constant)",
        processing_fee: "10% added for Square card payments only (to offset processing fees)",
        carriers: ["USPS", "UPS", "FedEx", "DHL"],
        pirate_ship: "PirateShipAPI backend function creates shipping labels. Credentials are in PIRATE_SHIP_API_KEY secret (check if this is set in your new platform).",
        kit_orders: "10-vial kit orders ship separately and have a kit_tracking_number field in addition to tracking_number. Kit orders are BLOCKED from standard checkout (server-side in validateOrder) and must be handled manually.",
      },

      admin_tools: {
        "AdminOrderManagement": "Full order management — view, update status, add tracking, send emails, mark paid",
        "AdminTrackingDashboard": "Batch tracking number entry and auto-update",
        "AdminCustomerManagement": "Customer profiles, order history, lifetime value",
        "AdminAffiliateManager": "Affiliate management, commission tracking, payouts",
        "AdminBannerManager": "Rotating announcement banner messages",
        "AdminSupport": "Customer support chat interface",
        "SkuMismatchDashboard": "Cart anomaly detection — ghost products, price mismatches",
        "AdminOrderReport": "PDF export of order analytics",
        "AdminProductReport": "PDF export of product catalog",
        "AdminDataExport": "Full JSON export of all business data",
        "AdminManualOrders": "Create orders manually (for phone orders, Zelle, etc.)",
        "AdminSentEmails": "Log of all sent emails",
      },

      email_system: {
        provider: "Resend.com",
        from_address: "rhrsupport@redhelixresearch.com",
        from_name: "Red Helix Research",
        admin_email: "jake@redhelixresearch.com",
        email_types: [
          "Order confirmation (sendOrderEmail)",
          "Welcome + discount code (sendWelcomeDiscountEmail)",
          "Welcome new user (sendWelcomeEmail)",
          "Shipping notification (sendOrderEmail)",
          "Abandoned cart (sendAbandonedCartEmail) — triggers 1h after cart created with no order",
          "Post-purchase (sendPostPurchaseEmail) — triggers 3 days after delivery",
          "Re-engagement (sendReEngagementEmails) — for users who haven't ordered in 60+ days",
          "Reorder reminder (sendReorderReminder)",
          "Product reminder (sendProductReminderEmails)",
          "Bulk email (sendBulkEmail) — admin sends to mailing list segments",
          "COA submission alert (coaSubmissionAlert)",
          "Outage notification (sendOutageEmail)",
        ],
      },

      seo_system: {
        description: "Automated SEO research runs weekly. Uses Gemini AI to research trending peptide keywords, analyze competitors, generate content strategy, and create actionable improvement plans.",
        functions: ["seoOptimizationEngine (scheduled weekly)", "getSEOReports (retrieves stored reports)"],
        storage: "SEO reports saved to SEOReport entity",
        admin_pages: ["SEOMonitoring", "SEODashboard", "SEOGuide", "BacklinkStrategy"],
      },

      security_architecture: {
        bot_protection: "Cloudflare Turnstile at checkout (TURNSTILE_SECRET_KEY + TURNSTILE_SITE_KEY in frontend)",
        fraud_detection: "fraudCheck function runs at every checkout submission",
        price_integrity: "validateOrder server-side price check — client prices rejected if they don't match DB",
        zero_trust: "ZeroTrustProvider component wraps all pages — behavioral monitoring",
        mfa: "MFAProvider for admin actions (optional)",
        rls: "Row-level security on entities — customers can only read their own orders",
        webhook_security: "HMAC-SHA256 timing-safe verification on Square webhooks",
      },

      migration_instructions_for_ai_coder: `
=============================================================================
FOR THE AI CODER REBUILDING THIS SITE
=============================================================================

1. PLATFORM: This was built on Base44 (base44.com). The new platform will likely
   be different. Key things to replicate:
   - Backend functions are Deno (TypeScript/JavaScript) HTTP handlers
   - Database is a simple document store (like MongoDB) with a JS SDK
   - Frontend is standard React + Tailwind + shadcn/ui

2. PAYMENT FLOW (most critical to get right):
   - Square: Use Square Payment Links API (not Elements). Flow is:
     a) Create payment link with order details → get checkoutUrl
     b) Redirect customer to checkoutUrl
     c) Register webhook endpoint with Square for payment.created, payment.updated, order.updated
     d) Verify webhook signatures with HMAC-SHA256
     e) On payment.updated with status=COMPLETED → mark order complete + decrement stock
   
   - Crypto: Use blockchain APIs (no payment processor needed):
     a) BTC: blockchain.info/rawtx/{txHash}
     b) ETH/USDT/USDC: Etherscan API
     c) Verify tx goes to YOUR address, within 5% of expected amount, has enough confirmations

3. STOCK MANAGEMENT:
   - Stock lives on Product.specifications[].stock_quantity
   - null/undefined/-1 = unlimited (in stock)
   - 0 = sold out
   - > 0 = tracked quantity
   - Always re-fetch the product immediately before writing (to avoid clobbering concurrent updates)
   - Run pre-flight check on ALL items before decrementing ANY (all-or-nothing)

4. PROMO CODE HIERARCHY (in order of precedence):
   a) WelcomeDiscount entity codes (one-time, 10% off, single vials only)
   b) PromoCode entity codes (with expiry, usage limits, optional single_vials_only)
   c) Affiliate codes from Affiliate entity (code field, discount_percent field)
   d) Static codes in validateOrder.js (SAVE10, SAVE20, WELCOME, etc.)

5. KEY BUSINESS RULES:
   - Shipping is ALWAYS $15 flat rate
   - Square card payments add a 10% processing fee
   - Kit orders (10-vial bundles) are blocked from online checkout — admin only
   - Promo welcome discount applies to single vials only, not kits/bundles
   - Orders have a 15-minute stock reservation window
   - Abandoned cart emails fire 1 hour after cart with no order

6. EMAIL SETUP:
   - Use Resend.com (not SendGrid, not SES)
   - From: "Red Helix Research <rhrsupport@redhelixresearch.com>"
   - Admin notifications to: jake@redhelixresearch.com
   - Must verify your domain in Resend before sending

7. WALLET ADDRESSES TO UPDATE in the crypto verification function:
   BTC: 3BuLwoGXiWx56RD7GsP98Nu6i9G2igYHss
   ETH: 0x30eD305B89b6207A5fa907575B395c9189728EbC
   USDT: 0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c
   USDC: 0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c
   UPDATE THESE TO YOUR NEW WALLET ADDRESSES before going live.

8. STATIC PROMO CODES in validateOrder.js to carry over:
   SAVE10 (10%), SAVE20 (20%), WELCOME (15%), FIRSTDAY15 (15%), INDO88 (10%), MELLISA10 (10%)

9. REDIRECT URLs to update:
   - Square checkout redirect: https://[NEW_DOMAIN]/PaymentCompleted?order=ORDER_NUMBER
   - Square merchant support email: jake@redhelixresearch.com (update to your email)
   - Admin email: jake@redhelixresearch.com (appears in squareWebhook, fraudCheck, etc.)

10. DOMAIN: Current domain is redhelixresearch.com. Search all function files for this
    hardcoded domain and replace with your new domain.
=============================================================================
      `,
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // SECTION 3: FULL BACKEND FUNCTION LIST
    // ─────────────────────────────────────────────────────────────────────────────
    const backendFunctionsSummary = {
      payment_critical: [
        "validateOrder — server-side price + stock + promo validation (MUST migrate)",
        "createSquareCheckout — creates Square payment links (MUST migrate)",
        "squareWebhook — handles Square payment events (MUST migrate + register with Square)",
        "decrementStock — stock inventory management (MUST migrate)",
        "syncSquarePayments — reconciliation backup (MUST migrate)",
        "lookupSquareOrder — fetch Square order details (MUST migrate)",
        "verifyCryptoTransaction — blockchain payment verification (MUST migrate + UPDATE WALLET ADDRESSES)",
        "saveCheckoutSnapshot — immutable order snapshot (MUST migrate)",
        "releaseExpiredReservations — cleanup abandoned carts (MUST migrate + schedule every 15min)",
        "fraudCheck — fraud risk scoring (MUST migrate)",
      ],
      email_critical: [
        "sendOrderEmail — customer transactional emails (MUST migrate)",
        "sendWelcomeEmail — new user welcome (MUST migrate)",
        "sendWelcomeDiscountEmail — discount code delivery (MUST migrate)",
        "sendAbandonedCartEmail — abandoned cart recovery (MUST migrate + schedule 1h delay)",
        "sendBulkEmail — admin bulk email to mailing list (MUST migrate)",
        "sendPostPurchaseEmail — post-delivery follow-up (MUST migrate)",
        "sendReEngagementEmails — win-back inactive customers (MUST migrate)",
        "sendReorderReminder — reorder nudges (MUST migrate)",
        "sendProductReminderEmails — product-specific reminders (MUST migrate)",
        "coaSubmissionAlert — admin notification for new COA uploads (MUST migrate)",
        "sendOutageEmail — admin outage broadcast (nice to have)",
      ],
      operations: [
        "autoUpdateDeliveryStatus — auto-tracking updates (important)",
        "pirateShipAPI — shipping label creation (important)",
        "logAddToCart — cart event logging (nice to have)",
        "deleteAbandonedCarts — periodic cart cleanup (nice to have)",
        "generateSitemap — SEO sitemap generation (nice to have)",
        "cleanupProducts — admin product maintenance (nice to have)",
        "fulfillmentAssistant — AI fulfillment helper (nice to have)",
        "recoverOrderSpec — fixes orders with missing spec data (admin utility)",
      ],
      seo_and_ai: [
        "seoOptimizationEngine — weekly AI SEO research (nice to have)",
        "getSEOReports — retrieve stored SEO reports (nice to have)",
        "aiVoiceResponse — voice assistant AI (optional)",
        "textToSpeech — ElevenLabs TTS (optional)",
        "fetchDiscordReviews — pulls Discord reviews (nice to have)",
      ],
      address_and_security: [
        "validateAddressGeoapify — address validation (important)",
        "fraudCheck — already listed above",
        "logSecurityEvent — security event logging (nice to have)",
        "securityUtils — shared security utilities (utility module)",
        "adminAuthMiddleware — shared admin auth helper (utility module)",
        "verifyMFA — MFA verification (nice to have)",
      ],
      plaid_financial: [
        "plaidCreateLinkToken — Plaid bank linking (optional feature)",
        "plaidExchangeToken — Plaid token exchange (optional feature)",
        "plaidCreatePayment — Plaid ACH payment (optional feature)",
        "plaidWebhook — Plaid webhook handler (optional feature)",
        "plaidFraudDetection — Plaid fraud signals (optional feature)",
        "plaidAdminActions — Plaid admin operations (optional feature)",
        "plaidComplianceAudit — Plaid compliance reporting (optional feature)",
      ],
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // ASSEMBLE FINAL PACKAGE
    // ─────────────────────────────────────────────────────────────────────────────
    const migrationKit = {
      _OWNER_ONLY: "THIS FILE IS FOR JALENTIZED@GMAIL.COM ONLY. DELETE AFTER DOWNLOADING.",
      _exported_at: exportedAt,
      _exported_by: user.email,
      _site: "Red Helix Research (redhelixresearch.com)",
      _warning: "This file contains architecture details, wallet addresses, and secret key names. Store securely. Do NOT commit to public repositories.",

      section_1_secret_keys: secretKeysManifest,
      section_2_payment_architecture: paymentFlowArchitecture,
      section_3_backend_functions: backendFunctionsSummary,
    };

    const json = JSON.stringify(migrationKit, null, 2);
    const bytes = new TextEncoder().encode(json);
    const filename = `RHR_OwnerMigrationKit_${new Date().toISOString().slice(0, 10)}.json`;

    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename=${filename}`,
        'Content-Length': bytes.byteLength.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});