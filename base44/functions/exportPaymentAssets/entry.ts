/**
 * exportPaymentAssets — Owner-only download of all payment wallet addresses,
 * QR code links, Zelle info, and setup notes for platform migration.
 *
 * Hard-locked to owner email. Delete this function after downloading.
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

    const exportedAt = new Date().toISOString();

    const payload = {
      _meta: {
        title: "Red Helix Research — Payment Assets Export",
        exported_at: exportedAt,
        exported_by: user.email,
        warning: "OWNER ONLY. Delete this file after transferring. Do not store publicly.",
      },

      // ─── CRYPTO WALLETS ────────────────────────────────────────────────────────
      crypto_wallets: {
        _note: "These addresses are hardcoded in TWO places: pages/CryptoCheckout.jsx (PAYMENT_ADDRESSES constant) and functions/verifyCryptoTransaction.js (PAYMENT_ADDRESSES constant). Update BOTH when migrating.",
        wallets: {
          BTC: {
            address: "3BuLwoGXiWx56RD7GsP98Nu6i9G2igYHss",
            network: "Bitcoin Network",
            label: "Bitcoin (BTC)",
            min_confirmations: 3,
            verification_api: "https://blockchain.info/rawtx/{txHash}",
            qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=bitcoin:3BuLwoGXiWx56RD7GsP98Nu6i9G2igYHss",
            qr_with_amount_template: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=bitcoin:3BuLwoGXiWx56RD7GsP98Nu6i9G2igYHss?amount={AMOUNT_BTC}",
            explorer_url: "https://www.blockchain.com/btc/address/3BuLwoGXiWx56RD7GsP98Nu6i9G2igYHss",
          },
          ETH: {
            address: "0x30eD305B89b6207A5fa907575B395c9189728EbC",
            network: "Ethereum Mainnet",
            label: "Ethereum (ETH)",
            min_confirmations: 12,
            verification_api: "https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash={txHash}&apikey={ETHERSCAN_API_KEY}",
            qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ethereum:0x30eD305B89b6207A5fa907575B395c9189728EbC",
            qr_with_amount_template: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ethereum:0x30eD305B89b6207A5fa907575B395c9189728EbC?value={AMOUNT_WEI}",
            explorer_url: "https://etherscan.io/address/0x30eD305B89b6207A5fa907575B395c9189728EbC",
          },
          USDT: {
            address: "0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c",
            network: "Ethereum (ERC-20)",
            label: "Tether (USDT)",
            min_confirmations: 12,
            token_contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            verification_api: "Etherscan token transfer events — same API as ETH but look at ERC-20 Transfer logs",
            qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ethereum:0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c",
            explorer_url: "https://etherscan.io/address/0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c",
            note: "USDT and USDC share the same Ethereum wallet address",
          },
          USDC: {
            address: "0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c",
            network: "Ethereum (ERC-20)",
            label: "USD Coin (USDC)",
            min_confirmations: 12,
            token_contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            verification_api: "Etherscan token transfer events",
            qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ethereum:0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c",
            explorer_url: "https://etherscan.io/address/0xbC1bF337c63B2A1B8115001b356E6b5C2F09685c",
            note: "USDT and USDC share the same Ethereum wallet address",
          },
        },
        qr_code_service: {
          provider: "api.qrserver.com (free, no API key needed)",
          base_url: "https://api.qrserver.com/v1/create-qr-code/",
          params: "size=300x300&data={URI_ENCODED_ADDRESS}",
          example: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=bitcoin:3BuLwoGXiWx56RD7GsP98Nu6i9G2igYHss",
          note: "The checkout page uses this same service dynamically — no static images to transfer",
        },
        frontend_qr_implementation: {
          file: "pages/CryptoCheckout.jsx (line ~1203)",
          code_snippet: `<img src={\`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=\${selectedCrypto === 'BTC' ? 'bitcoin' : 'ethereum'}:\${PAYMENT_ADDRESSES[selectedCrypto]}?amount=\${cryptoAmount}\`} alt="Payment QR Code" />`,
          note: "QR is generated live in the browser — just update PAYMENT_ADDRESSES constant and the QR updates automatically",
        },
      },

      // ─── ZELLE ─────────────────────────────────────────────────────────────────
      zelle: {
        recipient_email: "jake@redhelixresearch.com",
        recipient_name_for_contact: "RHR-Jake (or Jake, or RHR)",
        memo_instructions: "RHR only — no other text",
        qr_code_image_url: "https://media.base44.com/images/public/6972f2b59e2787f045b7ae0d/c3e680bfd_image.png",
        qr_code_note: "This is a static image uploaded to Base44 storage. Download it from the URL above and re-upload to your new platform's storage. Then update the <img src> in pages/CryptoCheckout.jsx at the zelle_payment step section.",
        zelle_qr_img_location_in_code: "pages/CryptoCheckout.jsx around line 1322 — look for the img tag with media.base44.com URL",
        disclaimer_rules: [
          "Contact name: RHR-Jake, Jake, or RHR ONLY",
          "Memo field: RHR ONLY — no product names, no descriptions",
          "Sending wrong memo can get both accounts flagged/frozen by Zelle",
        ],
        how_zelle_orders_work: "Customer submits order with their Zelle account name + optional confirmation number. Order is created with payment_status: 'pending', status: 'awaiting_confirmation'. Admin manually confirms in AdminOrderManagement and marks paid.",
        admin_action_needed: "After customer pays via Zelle, go to AdminOrderManagement, find the order, verify Zelle account name matches, mark payment_status as 'completed' and status as 'processing'.",
      },

      // ─── SQUARE (CARD PAYMENTS) ────────────────────────────────────────────────
      square: {
        payment_method_label: "square_payment",
        processing_fee: "10% added on top of order total for card payments (to offset Square's fees)",
        checkout_flow: "Customer clicks Pay with Card → disclaimer modal → createSquareCheckout backend function creates a Square Payment Link → link emailed to customer → customer pays on Square's hosted page → Square webhook confirms payment",
        redirect_url_after_payment: "https://redhelixresearch.com/PaymentCompleted?order=ORDER_NUMBER",
        webhook_events: ["payment.created", "payment.updated", "order.updated", "order.fulfillment.updated", "refund.created", "refund.updated"],
        webhook_function: "functions/squareWebhook.js",
        credentials_needed: {
          SQUARE_ACCESS_TOKEN: "Square Developer Dashboard → Your App → Production Access Token",
          SQUARE_LOCATION_ID: "Square Developer Dashboard → Locations",
          SQUARE_WEBHOOK_SIGNATURE_KEY: "Square Developer Dashboard → Webhooks → your endpoint → Signature Key",
        },
        square_dashboard_url: "https://developer.squareup.com/apps",
        statement_descriptor: "RED HELIX RESEARCH (appears on customer card statements)",
        support_email_in_square: "jake@redhelixresearch.com",
      },

      // ─── MIGRATION CHECKLIST FOR PAYMENT ASSETS ───────────────────────────────
      migration_checklist: {
        crypto: [
          "1. DECIDE: Keep same wallet addresses (easiest) or generate new ones",
          "2. If NEW addresses: update PAYMENT_ADDRESSES in pages/CryptoCheckout.jsx AND functions/verifyCryptoTransaction.js",
          "3. QR codes auto-generate from wallet address via api.qrserver.com — no action needed if keeping same address",
          "4. Verify blockchain.info API still works for BTC verification (free, no key needed)",
          "5. Optional: Get Etherscan API key (ETHERSCAN_API_KEY secret) for ETH verification — works without it but rate-limited",
        ],
        zelle: [
          "1. Download the Zelle QR image from: https://media.base44.com/images/public/6972f2b59e2787f045b7ae0d/c3e680bfd_image.png",
          "2. Upload to your new platform's file storage",
          "3. Update the <img src> in pages/CryptoCheckout.jsx (search for 'media.base44.com' to find the line)",
          "4. Zelle email (jake@redhelixresearch.com) and rules don't change — just update if your email changes",
        ],
        square: [
          "1. Log in to Square Developer Dashboard",
          "2. Get new SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID",
          "3. Register your new webhook endpoint URL with Square",
          "4. Get SQUARE_WEBHOOK_SIGNATURE_KEY from the new webhook endpoint",
          "5. Update redirect_url in createSquareCheckout.js (search for PaymentCompleted) to your new domain",
          "6. Update support email in the Square checkout options if changing email",
          "7. Test with a small $1 transaction before going live",
        ],
        domain_search_and_replace: [
          "Search all function files for 'redhelixresearch.com' and replace with your new domain",
          "Key files: createSquareCheckout.js, squareWebhook.js, fraudCheck.js, sendOrderEmail.js, sendWelcomeEmail.js",
          "Also update admin email: jake@redhelixresearch.com appears in many function files",
        ],
      },

      // ─── STATIC PROMO CODES (to carry over) ───────────────────────────────────
      static_promo_codes_in_code: {
        _location: "functions/validateOrder.js — STATIC_PROMO_CODES constant at top of file",
        codes: {
          SAVE10: "10% off",
          SAVE20: "20% off",
          WELCOME: "15% off first order",
          FIRSTDAY15: "15% off",
          INDO88: "10% off",
          MELLISA10: "10% off (Affiliate)",
        },
        note: "These are in addition to DB-managed PromoCode entity records and Affiliate codes. All three sources are merged in validateOrder.js getAllPromoCodes().",
      },
    };

    const json = JSON.stringify(payload, null, 2);
    const bytes = new TextEncoder().encode(json);

    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename=RHR_PaymentAssets_${new Date().toISOString().slice(0, 10)}.json`,
        'Content-Length': bytes.byteLength.toString(),
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});