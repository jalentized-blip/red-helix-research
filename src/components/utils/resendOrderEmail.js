// Shared helper for resending order confirmation emails.
// Used by Account.jsx and OrderTracking.jsx.

export async function resendOrderConfirmationEmail(base44, order) {
  // Resolve email from the order — try multiple field names that may store it
  let toEmail = order?.customer_email
    || order?.email
    || order?.customerEmail
    || order?.created_by;

  // Last resort: get from logged-in user
  if (!toEmail) {
    try {
      const currentUser = await base44.auth.me();
      toEmail = currentUser?.email;
    } catch (_) {
      // ignore
    }
  }

  if (!toEmail) {
    throw new Error('No customer email found for this order.');
  }

  console.log('[RESEND_EMAIL] Sending to:', toEmail, 'Order:', order?.order_number, 'Fields available:', Object.keys(order || {}));

  // Build items list — null-safe for all fields
  let orderItemsList = '';
  try {
    orderItemsList = (order.items || []).map(item => {
      const name = item.product_name || item.productName || 'Product';
      const spec = item.specification || '';
      const qty = item.quantity || 1;
      const unitPrice = Number(item.price) || 0;
      const lineTotal = (unitPrice * qty).toFixed(2);
      const specLabel = spec ? ' (' + spec + ')' : '';
      return '<li>' + name + specLabel + ' x' + qty + ' - $' + lineTotal + '</li>';
    }).join('');
  } catch (err) {
    console.error('[RESEND_EMAIL] Error building items list:', err);
    orderItemsList = '<li>Order items unavailable</li>';
  }

  // Payment info
  let paymentInfo = '';
  if (order.crypto_amount && order.crypto_currency) {
    paymentInfo = '<p><strong>Payment:</strong> ' + order.crypto_amount + ' ' + order.crypto_currency + '</p>';
  }
  if (order.transaction_id) {
    paymentInfo += '<p><strong>Transaction ID:</strong> ' + order.transaction_id + '</p>';
  }

  // Tracking info
  let trackingInfo = '';
  if (order.tracking_number) {
    trackingInfo = '<p><strong>Tracking Number:</strong> ' + order.tracking_number + '</p>';
    trackingInfo += '<p><strong>Carrier:</strong> ' + (order.carrier || 'N/A') + '</p>';
    if (order.estimated_delivery) {
      trackingInfo += '<p><strong>Est. Delivery:</strong> ' + new Date(order.estimated_delivery).toLocaleDateString() + '</p>';
    }
  }

  // Shipping address
  let shippingInfo = '';
  if (order.shipping_address) {
    try {
      const addr = order.shipping_address;
      shippingInfo = '<h3>Shipping Address:</h3><p>' + (order.customer_name || 'Customer') + '<br>' +
        (addr.address || addr.shippingAddress || '') + '<br>' +
        (addr.city || addr.shippingCity || '') + ', ' + (addr.state || addr.shippingState || '') + ' ' + (addr.zip || addr.shippingZip || '') + '</p>';
    } catch (_) {
      shippingInfo = '';
    }
  }

  const totalStr = order.total_amount != null ? Number(order.total_amount).toFixed(2) : '0.00';

  const emailBody = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
    '<h2 style="color: #8B2635;">Thank You for Your Order!</h2>' +
    '<p>Hi ' + (order.customer_name || 'Customer') + ',</p>' +
    '<p>We\'ve received your order and it\'s being processed.</p>' +
    '<div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">' +
      '<h3 style="margin-top: 0;">Order #' + (order.order_number || 'N/A') + '</h3>' +
      paymentInfo +
      '<p><strong>Total:</strong> $' + totalStr + ' USD</p>' +
      '<p><strong>Status:</strong> ' + (order.status || 'pending') + '</p>' +
      trackingInfo +
    '</div>' +
    '<h3>Order Items:</h3>' +
    '<ul>' + orderItemsList + '</ul>' +
    shippingInfo +
    '<p style="margin-top: 20px;">You will receive tracking information once your order ships.</p>' +
    '</div>';

  try {
    await base44.integrations.Core.SendEmail({
      from_name: 'Red Helix Research',
      to: toEmail,
      subject: 'Order Confirmation - ' + (order.order_number || 'N/A'),
      body: emailBody
    });
  } catch (err) {
    console.error('[RESEND_EMAIL] SendEmail failed:', err?.message || err, 'to:', toEmail, 'order:', order?.order_number);
    throw err;
  }

  return { success: true };
}
