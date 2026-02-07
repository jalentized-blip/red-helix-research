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

    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      return Response.json({ 
        error: 'Plaid credentials not configured. Please contact support.' 
      }, { status: 500 });
    }

    // Always use sandbox for now
    const plaidUrl = "https://sandbox.plaid.com";

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
          client_user_id: user.id
        },
        client_name: 'Red Helix Research',
        products: ['auth'],
        country_codes: ['US'],
        language: 'en',
        redirect_uri: 'https://localhost:3000'
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