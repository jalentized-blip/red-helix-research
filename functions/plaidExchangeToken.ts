import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { encryptFinancialData, hashSensitiveData } from './encryptionUtils.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { public_token, account_id, metadata } = await req.json();

    if (!public_token) {
      return Response.json({ error: 'Public token required' }, { status: 400 });
    }

    const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID");
    const PLAID_SECRET = Deno.env.get("PLAID_SECRET");
    const PLAID_ENV = Deno.env.get("PLAID_ENVIRONMENT") || "sandbox";

    const plaidUrl = PLAID_ENV === "production" 
      ? "https://production.plaid.com"
      : "https://sandbox.plaid.com";

    // Exchange public token for access token
    const tokenResponse = await fetch(`${plaidUrl}/item/public_token/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET,
      },
      body: JSON.stringify({ public_token })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange error:', tokenData);
      return Response.json({ 
        error: tokenData.error_message || 'Token exchange failed' 
      }, { status: 500 });
    }

    // Get account details for verification
    const authResponse = await fetch(`${plaidUrl}/auth/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET,
      },
      body: JSON.stringify({ 
        access_token: tokenData.access_token 
      })
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      console.error('Auth get error:', authData);
      return Response.json({ 
        error: 'Failed to retrieve account information' 
      }, { status: 500 });
    }

    // Find the selected account
    const selectedAccount = authData.accounts.find(acc => 
      account_id ? acc.account_id === account_id : acc.subtype === 'checking'
    );

    if (!selectedAccount) {
      return Response.json({ 
        error: 'Selected account not found' 
      }, { status: 404 });
    }

    // Encrypt and store financial data
    const financialData = {
      access_token: tokenData.access_token,
      item_id: tokenData.item_id,
      account_id: selectedAccount.account_id,
      account_name: selectedAccount.name,
      account_mask: selectedAccount.mask,
      account_type: selectedAccount.type,
      account_subtype: selectedAccount.subtype,
      routing_numbers: authData.numbers.ach.find(n => 
        n.account_id === selectedAccount.account_id
      ),
      institution: metadata?.institution || {}
    };

    const encryptedData = await encryptFinancialData(JSON.stringify(financialData));
    const userEmailHash = await hashSensitiveData(user.email);

    // Store encrypted financial data
    await base44.asServiceRole.entities.EncryptedFinancialData.create({
      user_email: userEmailHash,
      data_type: 'plaid_account',
      encrypted_data: encryptedData,
      data_hash: await hashSensitiveData(JSON.stringify(financialData)),
      plaid_item_id: tokenData.item_id,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      last_accessed: new Date().toISOString()
    });

    // Return safe data to client (no sensitive info)
    return Response.json({
      success: true,
      payment_method: {
        id: tokenData.item_id,
        account_name: selectedAccount.name,
        account_mask: selectedAccount.mask,
        account_type: selectedAccount.subtype,
        institution_name: metadata?.institution?.name || 'Bank Account'
      }
    });

  } catch (error) {
    console.error('Token exchange error:', error);
    return Response.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
});