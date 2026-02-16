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

    let plaidUrl = "https://sandbox.plaid.com";
    if (PLAID_ENV === "production") {
      plaidUrl = "https://production.plaid.com";
    } else if (PLAID_ENV === "development") {
      plaidUrl = "https://development.plaid.com";
    }

    // Construct user object with validation
    const plaidUser: any = {
      client_user_id: user.id
    };

    if (user.email && user.email.includes('@')) {
      plaidUser.email_address = user.email;
    }

    // Plaid requires E.164 format (e.g., +14155552671)
    // Only include phone number if it matches the strict format to avoid 400 errors
    if (user.phone_number && /^\+[1-9]\d{1,14}$/.test(user.phone_number)) {
      plaidUser.phone_number = user.phone_number;
    }

    // Create link token for ACH payment authorization
    const response = await fetch(`${plaidUrl}/link/token/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET,
      },
      body: JSON.stringify({
        user: plaidUser,
        client_name: 'Red Helix Research',
        products: ['auth'], // Add 'transfer' here if using Transfer UI flow, but 'auth' is sufficient for auth-then-transfer
        country_codes: ['US'],
        language: 'en'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Plaid Link Token Error:', JSON.stringify(data));
      return Response.json({ 
        error: data.error_message || data.display_message || 'Failed to create link token',
        details: data
      }, { status: response.status });
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