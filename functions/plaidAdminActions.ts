import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { hashSensitiveData } from './encryptionUtils.js';
import { rateLimit, createSecureResponse } from './securityUtils.js';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return createSecureResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return createSecureResponse({ error: 'Unauthorized' }, 403);
    }

    // Rate limit admin actions: 20 per minute
    const rateLimitResult = rateLimit(`admin_${user.email}`, 20, 60000);
    if (!rateLimitResult.allowed) {
      return createSecureResponse({ error: 'Too many requests' }, 429);
    }

    const body = await req.json();
    const { action, plaid_item_id, user_email, payment_method_id } = body;

    if (!action) {
      return createSecureResponse({ error: 'Action required' }, 400);
    }

    let result;
    switch (action) {
      case 'revoke_token':
        if (!plaid_item_id || !user_email) {
          return createSecureResponse({ error: 'plaid_item_id and user_email required' }, 400);
        }
        result = await revokeToken(base44, plaid_item_id, user_email);
        break;
      case 'delete_payment_method':
        if (!payment_method_id) {
          return createSecureResponse({ error: 'payment_method_id required' }, 400);
        }
        result = await deletePaymentMethod(base44, payment_method_id);
        break;
      case 'delete_financial_data':
        if (!user_email) {
          return createSecureResponse({ error: 'user_email required' }, 400);
        }
        result = await deleteFinancialData(base44, user_email);
        break;
      case 'approve_transaction': {
        const { alert_id, approved, notes } = body;
        if (!alert_id) {
          return createSecureResponse({ error: 'alert_id required' }, 400);
        }
        result = await approveTransaction(base44, { alert_id, approved, notes, admin_email: user.email });
        break;
      }
      default:
        return createSecureResponse({ error: 'Invalid action' }, 400);
    }

    // Audit log with hashed emails for privacy
    const hashedAdminEmail = await hashSensitiveData(user.email);
    const hashedUserEmail = user_email ? await hashSensitiveData(user_email) : '';

    await base44.asServiceRole.entities.PlaidAuditLog.create({
      action: action,
      user_email_hash: hashedUserEmail,
      admin_email_hash: hashedAdminEmail,
      plaid_item_id: plaid_item_id || '',
      success: true,
      metadata: JSON.stringify({ action, timestamp: new Date().toISOString() })
    });

    return createSecureResponse({ success: true, result });

  } catch (error) {
    console.error('Admin action error:', error);
    return createSecureResponse({ error: 'Action failed' }, 500);
  }
});

async function revokeToken(base44, plaidItemId, userEmail) {
  const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID");
  const PLAID_SECRET = Deno.env.get("PLAID_SECRET");
  const PLAID_ENV = Deno.env.get("PLAID_ENVIRONMENT") || "sandbox";

  if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
    throw new Error('Plaid credentials not configured');
  }

  let plaidUrl = "https://sandbox.plaid.com";
  if (PLAID_ENV === "production") {
    plaidUrl = "https://production.plaid.com";
  } else if (PLAID_ENV === "development") {
    plaidUrl = "https://development.plaid.com";
  }

  const userEmailHash = await hashSensitiveData(userEmail);
  const records = await base44.asServiceRole.entities.EncryptedFinancialData.filter({
    user_email: userEmailHash,
    plaid_item_id: plaidItemId
  });

  if (!records || records.length === 0) {
    throw new Error('Payment method not found');
  }

  await fetch(`${plaidUrl}/item/remove`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
    body: JSON.stringify({
      access_token: plaidItemId
    })
  });

  const paymentMethods = await base44.asServiceRole.entities.PlaidPaymentMethod.filter({
    plaid_item_id: plaidItemId
  });

  for (const method of paymentMethods) {
    await base44.asServiceRole.entities.PlaidPaymentMethod.update(method.id, {
      status: 'inactive'
    });
  }

  return { revoked: true, item_id: plaidItemId };
}

async function deletePaymentMethod(base44, paymentMethodId) {
  const method = await base44.asServiceRole.entities.PlaidPaymentMethod.filter({
    id: paymentMethodId
  });

  if (!method || method.length === 0) {
    throw new Error('Payment method not found');
  }

  const pm = method[0];

  const userEmailHash = await hashSensitiveData(pm.user_email);
  const financialRecords = await base44.asServiceRole.entities.EncryptedFinancialData.filter({
    user_email: userEmailHash,
    plaid_item_id: pm.plaid_item_id
  });

  for (const record of financialRecords) {
    await base44.asServiceRole.entities.EncryptedFinancialData.delete({ id: record.id });
  }

  await base44.asServiceRole.entities.PlaidPaymentMethod.delete({ id: paymentMethodId });

  return { deleted: true, payment_method_id: paymentMethodId };
}

async function deleteFinancialData(base44, userEmail) {
  const userEmailHash = await hashSensitiveData(userEmail);

  const records = await base44.asServiceRole.entities.EncryptedFinancialData.filter({
    user_email: userEmailHash
  });

  let deleted = 0;
  for (const record of records) {
    if (record.data_type === 'transaction') {
      const expiresAt = new Date(record.expires_at).getTime();
      if (expiresAt > Date.now()) {
        continue;
      }
    }

    await base44.asServiceRole.entities.EncryptedFinancialData.delete({ id: record.id });
    deleted++;
  }

  return { deleted_count: deleted };
}

async function approveTransaction(base44, data) {
  const { alert_id, approved, notes, admin_email } = data;

  const hashedAdminEmail = await hashSensitiveData(admin_email);

  await base44.asServiceRole.entities.PlaidFraudAlert.update(alert_id, {
    status: approved ? 'approved' : 'rejected',
    reviewed_by_hash: hashedAdminEmail,
    reviewed_at: new Date().toISOString(),
    action_taken: notes
  });

  return { alert_id, approved };
}
