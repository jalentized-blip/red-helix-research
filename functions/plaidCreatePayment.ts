import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { decryptFinancialData, hashSensitiveData } from './encryptionUtils.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id, amount, plaid_item_id } = await req.json();

    if (!order_id || !amount || !plaid_item_id) {
      return Response.json({ 
        error: 'Order ID, amount, and payment method required' 
      }, { status: 400 });
    }

    // Verify order exists and belongs to user
    const orders = await base44.entities.Order.filter({ 
      order_number: order_id,
      created_by: user.email 
    });

    if (!orders || orders.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    // Fraud check: Verify amount matches order
    if (Math.abs(order.total_amount - amount) > 0.01) {
      console.error('Payment amount mismatch', { 
        order_amount: order.total_amount, 
        payment_amount: amount 
      });
      return Response.json({ 
        error: 'Payment amount mismatch' 
      }, { status: 400 });
    }

    const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID");
    const PLAID_SECRET = Deno.env.get("PLAID_SECRET");
    const PLAID_ENV = Deno.env.get("PLAID_ENVIRONMENT") || "sandbox";

    const plaidUrl = PLAID_ENV === "production" 
      ? "https://production.plaid.com"
      : "https://sandbox.plaid.com";

    // Retrieve encrypted financial data
    const userEmailHash = await hashSensitiveData(user.email);
    const financialRecords = await base44.asServiceRole.entities.EncryptedFinancialData.filter({
      user_email: userEmailHash,
      plaid_item_id: plaid_item_id,
      data_type: 'plaid_account'
    });

    if (!financialRecords || financialRecords.length === 0) {
      return Response.json({ 
        error: 'Payment method not found' 
      }, { status: 404 });
    }

    const financialRecord = financialRecords[0];
    const decryptedData = JSON.parse(
      await decryptFinancialData(financialRecord.encrypted_data)
    );

    // Create ACH transfer
    const transferResponse = await fetch(`${plaidUrl}/transfer/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET,
      },
      body: JSON.stringify({
        access_token: decryptedData.access_token,
        account_id: decryptedData.account_id,
        type: 'debit',
        network: 'ach',
        amount: amount.toFixed(2),
        ach_class: 'ppd', // Prearranged Payment and Deposit
        user: {
          legal_name: user.full_name || user.email,
          email_address: user.email
        },
        description: `Red Helix Research Order ${order_id}`,
        metadata: {
          order_id: order_id,
          user_id: user.id
        }
      })
    });

    const transferData = await transferResponse.json();

    if (!transferResponse.ok) {
      console.error('ACH transfer error:', transferData);
      
      // Log failed payment attempt
      await base44.asServiceRole.entities.EncryptedFinancialData.create({
        user_email: userEmailHash,
        data_type: 'transaction',
        encrypted_data: await encryptFinancialData(JSON.stringify({
          order_id,
          amount,
          status: 'failed',
          error: transferData.error_message,
          timestamp: new Date().toISOString()
        })),
        data_hash: await hashSensitiveData(order_id),
        expires_at: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString() // 7 years
      });

      return Response.json({ 
        error: transferData.error_message || 'Payment failed' 
      }, { status: 500 });
    }

    // Update order with payment information
    await base44.asServiceRole.entities.Order.update(order.id, {
      status: 'processing',
      payment_method: 'plaid_ach',
      payment_id: transferData.transfer.id,
      payment_status: transferData.transfer.status
    });

    // Store encrypted transaction record (7-year retention for tax compliance)
    await base44.asServiceRole.entities.EncryptedFinancialData.create({
      user_email: userEmailHash,
      data_type: 'transaction',
      encrypted_data: await encryptFinancialData(JSON.stringify({
        order_id,
        amount,
        transfer_id: transferData.transfer.id,
        status: transferData.transfer.status,
        account_mask: decryptedData.account_mask,
        timestamp: new Date().toISOString()
      })),
      data_hash: await hashSensitiveData(transferData.transfer.id),
      expires_at: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString() // 7 years
    });

    return Response.json({
      success: true,
      transfer_id: transferData.transfer.id,
      status: transferData.transfer.status,
      expected_settlement: transferData.transfer.expected_settlement_schedule
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return Response.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
});