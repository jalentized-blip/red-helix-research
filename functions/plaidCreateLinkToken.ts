import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID");
    const PLAID_SECRET = Deno.env.get("PLAID_SECRET");
    const PLAID_ENV = Deno.env.get("PLAID_ENVIRONMENT") || "sandbox";

    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      return Response.json({ 
        error: 'Plaid credentials not configured. Please contact support.' 
      }, { status: 500 });
    }

    const plaidUrl = PLAID_ENV === "production" 
      ? "https://production.plaid.com"
      : "https://sandbox.plaid.com";

    // Create link token for ACH payment authorization
    const response = await fetch(`${plaidUrl}/link/token/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET,
      },
      body: JSON.stringify({
        user: {
          client_user_id: user.id,
          email_address: user.email,
          name: user.full_name || user.email
        },
        client_name: 'Red Helix Research',
        products: ['auth', 'transactions'],
        country_codes: ['US'],
        language: 'en',
        redirect_uri: null,
        webhook: `${req.headers.get('origin')}/api/plaidWebhook`,
        account_filters: {
          depository: {
            account_subtypes: ['checking', 'savings']
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Plaid Link Token Error:', data);
      return Response.json({ 
        error: data.error_message || 'Failed to create link token' 
      }, { status: 500 });
    }

    return Response.json({ 
      link_token: data.link_token,
      expiration: data.expiration 
    });

  } catch (error) {
    console.error('Link token creation error:', error);
    return Response.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
});