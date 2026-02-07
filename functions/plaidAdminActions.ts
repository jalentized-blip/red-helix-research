import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { hashSensitiveData } from './encryptionUtils.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { action, plaid_item_id, user_email, payment_method_id } = await req.json();

    let result;
    switch (action) {
      case 'revoke_token':
        result = await revokeToken(base44, plaid_item_id, user_email);
        break;
      case 'delete_payment_method':
        result = await deletePaymentMethod(base44, payment_method_id);
        break;
      case 'delete_financial_data':
        result = await deleteFinancialData(base44, user_email);
        break;
      case 'approve_transaction':
        result = await approveTransaction(base44, await req.json());
        break;
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Create audit log
    await base44.asServiceRole.entities.PlaidAuditLog.create({
      action: action,
      user_email: user_email || '',
      admin_email: user.email,
      plaid_item_id: plaid_item_id || '',
      success: true,
      metadata: JSON.stringify({ result })
    });

    return Response.json({ success: true, result });

  } catch (error) {
    console.error('Admin action error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function revokeToken(base44, plaidItemId, userEmail) {
  const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID");
  const PLAID_SECRET = Deno.env.get("PLAID_SECRET");
  const PLAID_ENV = Deno.env.get("PLAID_ENVIRONMENT") || "sandbox";

  const plaidUrl = PLAID_ENV === "production" 
    ? "https://production.plaid.com"
    : "https://sandbox.plaid.com";

  // Get access token from encrypted data
  const userEmailHash = await hashSensitiveData(userEmail);
  const records = await base44.asServiceRole.entities.EncryptedFinancialData.filter({
    user_email: userEmailHash,
    plaid_item_id: plaidItemId
  });

  if (!records || records.length === 0) {
    throw new Error('Payment method not found');
  }

  // Revoke via Plaid API
  const response = await fetch(`${plaidUrl}/item/remove`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
    body: JSON.stringify({ 
      access_token: plaidItemId // In real implementation, decrypt this
    })
  });

  // Update payment method status
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

  // Delete encrypted financial data
  const userEmailHash = await hashSensitiveData(pm.user_email);
  const financialRecords = await base44.asServiceRole.entities.EncryptedFinancialData.filter({
    user_email: userEmailHash,
    plaid_item_id: pm.plaid_item_id
  });

  for (const record of financialRecords) {
    await base44.asServiceRole.entities.EncryptedFinancialData.delete({ id: record.id });
  }

  // Delete payment method
  await base44.asServiceRole.entities.PlaidPaymentMethod.delete({ id: paymentMethodId });

  return { deleted: true, payment_method_id: paymentMethodId };
}

async function deleteFinancialData(base44, userEmail) {
  const userEmailHash = await hashSensitiveData(userEmail);
  
  // Get all financial data for user
  const records = await base44.asServiceRole.entities.EncryptedFinancialData.filter({
    user_email: userEmailHash
  });

  let deleted = 0;
  for (const record of records) {
    // Check if legally required to retain
    if (record.data_type === 'transaction') {
      const expiresAt = new Date(record.expires_at).getTime();
      if (expiresAt > Date.now()) {
        continue; // Skip - still in retention period
      }
    }
    
    await base44.asServiceRole.entities.EncryptedFinancialData.delete({ id: record.id });
    deleted++;
  }

  return { deleted_count: deleted, user_email: userEmail };
}

async function approveTransaction(base44, data) {
  const { alert_id, approved, notes } = data;

  await base44.asServiceRole.entities.PlaidFraudAlert.update(alert_id, {
    status: approved ? 'approved' : 'rejected',
    reviewed_by: data.admin_email,
    reviewed_at: new Date().toISOString(),
    action_taken: notes
  });

  return { alert_id, approved };
}