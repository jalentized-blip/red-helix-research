/**
 * exportPaymentDocs — Owner-only full payment system code dump
 * Downloads complete architecture guide + annotated docs for every payment method.
 * Hard-locked to owner email. Delete after downloading.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const OWNER_EMAIL = 'jalentized@gmail.com';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin' || user.email !== OWNER_EMAIL) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const doc = {
    _meta: {
      title: "Red Helix Research — Complete Payment System Documentation",
      exported_at: new Date().toISOString(),
      exported_by: user.email,
      warning: "OWNER ONLY. Delete after use.",
      purpose: "Transfer all payment system knowledge to a new AI builder on a new platform.",
    },

    architecture_overview: {
      payment_methods: [
        "1. Square (card payment via emailed payment link)",
        "2. Zelle (manual bank transfer, admin-confirmed)",
        "3. Cryptocurrency (BTC, ETH, USDT, USDC — customer self-reports TX hash)",
      ],
      order_flow: [
        "1. Customer fills cart",
        "2. CustomerInfo page (name, email, phone, shipping/billing address) — saved to localStorage as 'customerInfo'",
        "3. CryptoCheckout page handles ALL payment methods",
        "4. Customer picks payment method",
        "5. Order record created in DB with payment_status: 'pending' or 'completed'",
        "6. Stock decremented via decrementStock backend function",
        "7. Emails sent: customer confirmation + admin notification",
        "8. For Square: webhook from Square later confirms payment",
        "9. For Zelle: admin manually confirms in AdminOrderManagement",
        "10. Customer redirected to PaymentCompleted page",
      ],
      key_files: {
        main_checkout_page: "pages/CryptoCheckout.jsx",
        square_panel: "components/checkout/SquarePaymentPanel.jsx",
        square_checkout_fn: "functions/createSquareCheckout.js",
        square_webhook_fn: "functions/squareWebhook.js",
        square_sync_fn: "functions/syncSquarePayments.js",
        order_validation_fn: "functions/validateOrder.js",
        stock_decrement_fn: "functions/decrementStock.js",
        crypto_verify_fn: "functions/verifyCryptoTransaction.js",
        checkout_failsafe: "components/checkout/checkoutFailsafe.js",
        fraud_check: "components/checkout/FraudCheckGate.jsx",
        cart_utils: "components/utils/cart.js",
        affiliate_store: "components/utils/affiliateStore.js",
      },
    },

    square_payment: {
      flow_explanation: "The checkout does NOT use Square embedded card reader. It uses Square Online Checkout Payment Links API. A dynamic payment link is created per order, emailed to the customer, who clicks it to pay on Square's hosted page.",
      step_by_step: [
        "1. Customer selects 'Pay with Card'",
        "2. Disclaimer modal shown — TWO checkboxes required (order agreement + no-refund policy). consentTimestamp recorded.",
        "3. SquarePaymentPanel rendered — customer enters email, solves Turnstile CAPTCHA",
        "4. 'Send Payment Link' (email only) OR 'PAY NOW' (opens Square checkout in new tab)",
        "5. Frontend calls createSquareCheckout backend function",
        "6. Backend: validateOrder called server-side to re-verify all prices and promos",
        "7. Backend: Square line items built with SCRAMBLED names ('Order X — Item 1' etc)",
        "8. Backend: POST /v2/online-checkout/payment-links called",
        "9. Returns checkoutUrl, paymentLinkId, orderId",
        "10. Frontend creates Order record: payment_status='pending', status='awaiting_payment', transaction_id=paymentLinkId, square_order_id=orderId",
        "11. Frontend emails checkoutUrl to customer via sendOrderEmail function",
        "12. Square sends webhooks to squareWebhook.js as customer pays",
        "13. Webhook payment.updated COMPLETED triggers: update order, decrement stock, send emails",
        "14. syncSquarePayments runs every 15 min as fallback poll",
      ],
      why_scrambled_item_names: "Square reviews merchant activity. If item names include peptides or research chemicals, the merchant account can be suspended. By naming items 'Order RDR-XXXX — Item 1', the actual products are never disclosed to Square. The totals still match.",
      processing_fee: "10% added to card payments only. Formula: Math.round((subtotalAfterDiscount + 15) * 0.10 * 100) / 100. Added as a separate line item in Square.",
      disclaimer_checkboxes: [
        "squareDisclaimerAccepted: 'I have reviewed my order and confirm it is correct. I understand card payments are processed via a secure payment link.'",
        "squareRefundPolicyAccepted: 'I agree to the no-refund policy and understand all sales are final...'"
      ],
      consent_timestamp: "Recorded when customer clicks 'I Agree'. Used as chargeback evidence stored on OrderFraudEvidence entity.",
      turnstile_captcha: "Cloudflare Turnstile required. Token presence checked client-side. TurnstileWidget component in components/TurnstileWidget.jsx.",
      env_vars: {
        SQUARE_ACCESS_TOKEN: "Your Square API access token from developer.squareup.com",
        SQUARE_LOCATION_ID: "Your Square location ID (auto-fetched from /v2/locations if not set)",
        SQUARE_WEBHOOK_SIGNATURE_KEY: "Webhook signature key from Square Developer Dashboard > Webhooks",
        TURNSTILE_SECRET_KEY: "Cloudflare Turnstile secret key",
      },
      square_api_endpoints: {
        create_payment_link: "POST https://connect.squareup.com/v2/online-checkout/payment-links",
        get_locations: "GET https://connect.squareup.com/v2/locations",
        get_order: "GET https://connect.squareup.com/v2/orders/{orderId}",
        search_orders: "POST https://connect.squareup.com/v2/orders/search",
        get_payment: "GET https://connect.squareup.com/v2/payments/{paymentId}",
      },
      api_version: "2024-01-18 (createSquareCheckout) / 2026-01-22 (syncSquarePayments)",
      webhook_events: ["payment.created", "payment.updated", "order.updated", "order.fulfillment.updated", "refund.created", "refund.updated"],
      webhook_security: {
        algorithm: "HMAC-SHA256(signatureKey, notificationURL + rawBody) → base64",
        header: "X-Square-HmacSha256-Signature",
        important: "Deno uses Web Crypto (SubtleCrypto) which is ASYNC unlike Node.js. Do NOT use synchronous crypto.",
        timing_safe: "Use constant-time comparison to prevent timing attacks",
        replay_protection: "Reject events older than 24 hours using event.created_at",
        deduplication: "In-memory Map cache of event_ids prevents double-processing on Square retries",
        merchant_id: "Optional — set SQUARE_MERCHANT_ID env var to restrict to your account",
      },
      order_matching_priority: [
        "1. square_order_id direct match (stored when payment.created webhook fires)",
        "2. transaction_id match (paymentLinkId stored at order creation)",
        "3. order_number === reference_id (Square reference_id is set to our order number)",
      ],
      why_three_matching_strategies: "Square's payment.created event fires very quickly — before our DB write may have finished. The reference_id fallback handles race conditions.",
      stale_order_handling: "syncSquarePayments runs every 15 min. Orders stuck in awaiting_payment for 168+ hours (7 days) are auto-cancelled. Late webhooks on abandoned orders trigger rescueOrder which resurrects and re-decrements stock.",
      webhook_response_codes: {
        "200": "Always returned for processed or auth-failed events. Returning 200 on auth failures prevents retry spam from bad actors.",
        "503": "Returned ONLY for transient DB errors (timeout, network). Square retries on 503 — up to 10 times over 24 hours.",
      },
      idempotency_key_format: "{orderNumber}-{timestamp}",
      redirect_url: "https://redhelixresearch.com/PaymentCompleted?order={orderNumber}",
      sandbox_testing: "Use https://connect.squareupsandbox.com for testing. Test card: 4111 1111 1111 1111.",
    },

    zelle_payment: {
      flow_explanation: "Zelle is a MANUAL payment method. There is no API, no webhook, no automatic confirmation. Admin manually verifies each payment.",
      step_by_step: [
        "1. Customer selects 'Pay with Zelle'",
        "2. Mandatory disclaimer modal — customer must check box and agree before proceeding",
        "3. Customer sees QR code + Zelle email address",
        "4. Customer scans QR in banking app OR sends to the email",
        "5. Customer enters their Zelle account name + optional confirmation number",
        "6. Customer clicks 'I've Sent the Payment'",
        "7. Order created: payment_method='zelle', payment_status='pending', status='awaiting_confirmation'",
        "8. admin_notes stores: 'Zelle account name: {name} | Confirmation #: {number}'",
        "9. Stock decremented immediately on submission",
        "10. Emails sent to customer and admin",
        "11. Admin verifies in AdminOrderManagement and manually updates status to 'processing' and payment_status to 'completed'",
      ],
      disclaimer_reason: "Zelle monitors payments. If keywords related to peptides or research chemicals appear in contact names, memos, or descriptions, accounts (both sender and recipient) can be frozen or permanently suspended.",
      allowed_contact_names: ["RHR-Jake", "Jake", "RHR"],
      allowed_memo_text: "RHR only — nothing else",
      forbidden: "Any product names, abbreviations, descriptions, or additional text in any Zelle field",
      zelle_email: "jake@redhelixresearch.com",
      zelle_qr_code: "https://media.base44.com/images/public/6972f2b59e2787f045b7ae0d/c3e680bfd_image.png",
      order_status_flow: "pending -> awaiting_confirmation -> (admin manually confirms) -> processing",
      no_api: "Zelle has no API. Confirmation is entirely manual.",
    },

    crypto_payment: {
      flow_explanation: "Customer self-reports their TX hash. Order is created immediately and marked complete without waiting for on-chain confirmations.",
      step_by_step: [
        "1. Customer selects 'Pay with Crypto'",
        "2. Customer picks coin: USDT, USDC, BTC, or ETH",
        "3. Exchange rate fetched from CoinGecko API. Stablecoins = $1.00 always.",
        "4. 15-minute countdown timer shown (rate expiry warning)",
        "5. Customer sees wallet address + QR code",
        "6. Customer sends crypto from their wallet app",
        "7. Customer pastes transaction hash (TX ID)",
        "8. On submit: createPendingOrder() creates Order in DB + decrements stock",
        "9. processSuccessfulPayment() marks order complete, sends emails",
        "10. verifyCryptoTransaction called but non-blocking — order proceeds regardless",
        "11. Customer redirected to PaymentCompleted",
      ],
      why_self_report: "Bitcoin needs 3+ confirmations (10 min each = 30+ min). ETH needs 12. Making customers wait causes abandonment. Accept immediately, admin verifies TX on block explorer.",
      wallet_addresses: {
        BTC: "3BuLwoGXiWx56RD7GsP98Nu6i9G2igYHss",
        ETH: "0x30eD305B89b6207A5fa907575B395c9189728EbC",
        USDT: "0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c",
        USDC: "0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c",
      },
      networks: {
        USDT: "Ethereum (ERC-20) ONLY — NOT Tron or BSC",
        USDC: "Ethereum (ERC-20) ONLY",
        ETH: "Ethereum Mainnet",
        BTC: "Bitcoin Network",
      },
      wrong_network_warning: "Sending on wrong network = funds permanently lost. ALWAYS warn customers prominently.",
      min_confirmations: { BTC: 3, ETH: 12, USDT: 12, USDC: 12 },
      exchange_rate_api: "https://api.coingecko.com/api/v3/simple/price?ids={bitcoin|ethereum}&vs_currencies=usd",
      fallback_rates_if_api_fails: { BTC: 95000, ETH: 3200 },
      blockchain_verification: {
        BTC: "https://blockchain.info/rawtx/{txHash}",
        ETH_tokens: "https://api.etherscan.io/api (ETHERSCAN_API_KEY optional)",
      },
      qr_code_generator: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data={bitcoin|ethereum}:{address}?amount={amount}",
    },

    order_validation: {
      function: "functions/validateOrder.js",
      actions: {
        validate_order: "Full validation: prices + stock + promo code",
        validate_promo: "Validate a single promo code",
        check_stock: "Quick stock check only (no price validation)",
        mark_promo_used: "Increment used_count on PromoCode, mark WelcomeDiscount used",
      },
      hardcoded_promos: { SAVE10: "10% off", SAVE20: "20% off", WELCOME: "15% off", FIRSTDAY15: "15% off", INDO88: "10% off", MELLISA10: "10% off (Affiliate)" },
      dynamic_promo_sources: ["Affiliate entity (is_active affiliates)", "PromoCode entity (DB-managed)"],
      welcome_discount: "WelcomeDiscount entity. One-time 10% codes. singleVialsOnly: true (excludes kits). Expires 30 days from issue. Keyed by browser fingerprint.",
      price_integrity: "Client-submitted prices compared to server catalog. Difference > $0.01 = order rejected. Customer must refresh cart.",
      stock_logic: "stock_quantity > 0 = IN STOCK. stock_quantity === 0 = OUT OF STOCK. stock_quantity === -1 or null = unlimited, defer to in_stock flag. in_stock === false = OUT OF STOCK.",
    },

    stock_decrement: {
      function: "functions/decrementStock.js",
      actions: {
        decrement: "Atomic stock decrement. Pre-flight checks ALL items first, then decrements.",
        restore: "Adds stock back (used when payment expires or order cancelled).",
      },
      double_fetch_reason: "Fetches product list once for lookup, then re-fetches each product individually before writing. Prevents concurrent admin edits from being clobbered.",
      stock_reserved_flag: "stock_reserved: true on Order = stock already decremented. Webhooks check this to prevent double-decrements.",
      called_by: ["CryptoCheckout.jsx (all payment methods)", "squareWebhook.js", "syncSquarePayments.js"],
    },

    order_entity: {
      status_values: ["pending", "processing", "shipped", "delivered", "awaiting_payment", "awaiting_confirmation", "cancelled"],
      payment_status_values: ["pending", "completed", "abandoned", "refunded"],
      payment_method_values: ["cryptocurrency", "square_payment", "zelle", "bank_ach"],
      order_number_format: "RDR-{timestamp_base36}-{random_hex4} — e.g. RDR-LWXYZ123-AB12",
      transaction_id: "Square paymentLinkId OR crypto TX hash (stored at order creation)",
      square_order_id: "Square's internal order ID — stored when payment.created webhook fires. Used to match webhook events.",
      stock_reserved: "boolean — true = stock already decremented. Prevents double-decrement.",
      reserved_until: "ISO datetime — 15 minutes from order creation. Informational only.",
      admin_notes: "Freetext log. Multiple entries appended with ' | '. Contains: Zelle account name, webhook events, fraud flags, stock notes.",
      affiliate_fields: "affiliate_code, affiliate_email, affiliate_name, affiliate_commission (10% of order total)",
    },

    checkout_failsafe: {
      file: "components/checkout/checkoutFailsafe.js",
      saveCheckoutSnapshot: "Saves full checkout state to OrderSnapshot entity BEFORE any payment attempt. Survives browser crashes.",
      createOrderWithRetry: "Wraps Order.create with 3 retries + exponential backoff.",
      markSnapshotComplete: "Marks OrderSnapshot as complete after successful order.",
      clearCheckoutSnapshot: "Removes localStorage entry after successful order.",
    },

    pricing: {
      shipping_cost: 15.00,
      processing_fee_percent: 0.10,
      processing_fee_formula: "Math.round((subtotalAfterDiscount + 15) * 0.10 * 100) / 100",
      processing_fee_applies: "Square card payments ONLY — crypto and Zelle have NO fee",
      total_formula: "subtotal - discount + shipping (+ processingFee for card only)",
      discount_formula: "subtotal * discountPercent OR singleVialSubtotal * discountPercent (for welcome/singleVialsOnly codes)",
    },

    emails: {
      library: "base44.integrations.Core.SendEmail() — uses Resend API",
      admin_email: "jake@redhelixresearch.com",
      from_address: "Sent as Red Helix Research",
      customer_confirmation_timing: {
        crypto: "Sent immediately when customer submits TX hash",
        zelle: "Sent when customer clicks 'I've Sent the Payment'",
        square: "Two separate emails: (1) order confirmation, (2) payment link email with Square checkout URL",
      },
      square_payment_link_email: "Full branded HTML email with order summary table, 'Complete Payment' CTA button linking to Square checkout URL, no-refund reminder, and explanation of why payment link is unconventional.",
      env_vars: { RESEND_API_KEY: "Resend API key", GMAIL_USER: "Gmail fallback", GMAIL_APP_PASSWORD: "Gmail app password" },
    },

    fraud_prevention: {
      files: ["components/checkout/FraudCheckGate.jsx", "functions/fraudCheck.js"],
      checks: ["IP velocity", "Disposable email detection", "Address validation (Geoapify)", "Order amount thresholds", "Blacklist (banned emails/addresses)"],
      chargeback_evidence_recorded: ["consentTimestamp", "consentVersion", "userAgent", "screenResolution", "timezone", "language", "noRefundPolicyAccepted", "researchUseAccepted"],
      env_vars: { GEOAPIFY_API_KEY: "For address validation" },
    },

    affiliate_system: {
      commission_rate: "10% of order total",
      customer_discount: "affiliate.discount_percent (default 15%)",
      link_format: "/?affiliate=CODE or /?aff=CODE",
      storage: "rdr_pending_affiliate in localStorage",
      click_logging: "AffiliateClickLog entity: affiliate_code, affiliate_id, destination_page, referrer, user_agent",
    },

    promo_codes: {
      sources: ["STATIC_PROMO_CODES in validateOrder.js", "Affiliate entity (active affiliates)", "PromoCode entity (DB)", "WelcomeDiscount entity (fingerprint-based)"],
      welcome_discount_entity_fields: "code, fingerprint, ip_hash, email, used, used_on_order, expires_at",
      cart_storage_key: "rdr_promo_code in localStorage",
    },

    migration_checklist: {
      env_vars_to_set: [
        "SQUARE_ACCESS_TOKEN — from developer.squareup.com",
        "SQUARE_LOCATION_ID — from Square Dashboard",
        "SQUARE_WEBHOOK_SIGNATURE_KEY — from Square Dashboard > Webhooks",
        "RESEND_API_KEY — from resend.com",
        "TURNSTILE_SECRET_KEY — from Cloudflare",
        "GEOAPIFY_API_KEY — for address validation",
      ],
      steps: [
        "1. Set up Square merchant account",
        "2. Get access token and location ID",
        "3. Register webhook endpoint (your new squareWebhook function URL)",
        "4. Subscribe to: payment.created, payment.updated, order.updated, refund.created",
        "5. Get webhook signature key",
        "6. Set all env vars",
        "7. Port all backend functions",
        "8. Port all frontend pages/components",
        "9. Set up syncSquarePayments scheduled automation (every 15 minutes)",
        "10. Test with Square sandbox ($1 test order)",
        "11. Update all hardcoded URLs and email addresses",
      ],
      urls_to_update: [
        "createSquareCheckout.js: redirect_url (currently redhelixresearch.com/PaymentCompleted)",
        "squareWebhook.js: all admin email links",
        "syncSquarePayments.js: admin email links",
        "All 'jake@redhelixresearch.com' references",
        "All 'redhelixresearch.com' domain references",
      ],
      do_not_change: [
        "Wallet addresses (changing loses in-flight crypto payments)",
        "Order number format (existing orders use RDR- prefix)",
        "Zelle email (customers may have it saved)",
      ],
    },
  };

  const json = JSON.stringify(doc, null, 2);
  const bytes = new TextEncoder().encode(json);

  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename=RHR_PaymentSystemDocs_${new Date().toISOString().slice(0, 10)}.json`,
      'Content-Length': bytes.byteLength.toString(),
      'Cache-Control': 'no-store',
    },
  });
});