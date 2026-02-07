import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { decryptFinancialData, hashSensitiveData } from './encryptionUtils.js';

Deno.serve(async (req) => {
  try {
    // Verify webhook signature
    const signature = req.headers.get('plaid-verification');
    const webhookBody = await req.text();
    
    // In production, verify the webhook signature
    // const isValid = await verifyPlaidWebhook(webhookBody, signature);
    // if (!isValid) {
    //   return Response.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const webhook = JSON.parse(webhookBody);
    const base44 = createClientFromRequest(req);

    console.log('Plaid webhook received:', webhook.webhook_type, webhook.webhook_code);

    // Handle different webhook types
    switch (webhook.webhook_type) {
      case 'TRANSFER':
        await handleTransferWebhook(base44, webhook);
        break;
      
      case 'ITEM':
        await handleItemWebhook(base44, webhook);
        break;
      
      case 'AUTH':
        await handleAuthWebhook(base44, webhook);
        break;
      
      default:
        console.log('Unhandled webhook type:', webhook.webhook_type);
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
});

async function handleTransferWebhook(base44, webhook) {
  const { transfer_id, transfer_status } = webhook;

  // Find order with this transfer ID
  const orders = await base44.asServiceRole.entities.Order.filter({
    payment_id: transfer_id
  });

  if (!orders || orders.length === 0) {
    console.error('Order not found for transfer:', transfer_id);
    return;
  }

  const order = orders[0];

  // Update order based on transfer status
  const statusMap = {
    'pending': 'processing',
    'posted': 'processing',
    'settled': 'processing',
    'failed': 'pending',
    'cancelled': 'pending',
    'returned': 'pending'
  };

  await base44.asServiceRole.entities.Order.update(order.id, {
    payment_status: transfer_status,
    status: statusMap[transfer_status] || order.status
  });

  // Send notification email based on status
  if (transfer_status === 'settled') {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: order.created_by,
      subject: 'Payment Confirmed - Order Processing',
      body: `Your payment for order ${order.order_number} has been confirmed. Your order is now being processed and will ship soon.`
    });
  } else if (transfer_status === 'failed' || transfer_status === 'returned') {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: order.created_by,
      subject: 'Payment Failed - Action Required',
      body: `Your payment for order ${order.order_number} could not be processed. Please update your payment method or contact support.`
    });
  }
}

async function handleItemWebhook(base44, webhook) {
  const { item_id, error } = webhook;

  if (webhook.webhook_code === 'ERROR') {
    console.error('Plaid item error:', error);
    
    // Find user with this item
    const records = await base44.asServiceRole.entities.EncryptedFinancialData.filter({
      plaid_item_id: item_id
    });

    if (records && records.length > 0) {
      // Notify user to reconnect their bank account
      // Note: Would need to decrypt user_email hash to get actual email
      console.log('Bank account needs reconnection for item:', item_id);
    }
  }
}

async function handleAuthWebhook(base44, webhook) {
  const { item_id } = webhook;

  if (webhook.webhook_code === 'AUTOMATICALLY_VERIFIED') {
    console.log('Bank account automatically verified:', item_id);
  } else if (webhook.webhook_code === 'VERIFICATION_EXPIRED') {
    console.log('Bank account verification expired:', item_id);
  }
}