// Shared helper for resending order confirmation emails.
// Used by Account.jsx and OrderTracking.jsx.

export async function resendOrderConfirmationEmail(base44, order) {
  if (!order?.customer_email) {
    throw new Error('No customer email found for this order.');
  }

  // Build items list
  const orderItemsList = (order.items || []).map(item => {
    const name = item.product_name || item.productName;
    const price = (item.price * item.quantity).toFixed(2);
    return '<li>' + name + ' (' + item.specification + ') x' + item.quantity + ' - $' + price + '</li>';
  }).join('');

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
    const addr = order.shipping_address;
    shippingInfo = '<h3>Shipping Address:</h3><p>' + (order.customer_name || 'Customer') + '<br>' +
      (addr.address || addr.shippingAddress || '') + '<br>' +
      (addr.city || addr.shippingCity || '') + ', ' + (addr.state || addr.shippingState || '') + ' ' + (addr.zip || addr.shippingZip || '') + '</p>';
  }

  const emailBody = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
    '<h2 style="color: #8B2635;">Thank You for Your Order!</h2>' +
    '<p>Hi ' + (order.customer_name || 'Customer') + ',</p>' +
    '<p>We\'ve received your order and it\'s being processed.</p>' +
    '<div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">' +
      '<h3 style="margin-top: 0;">Order #' + order.order_number + '</h3>' +
      paymentInfo +
      '<p><strong>Total:</strong> $' + (order.total_amount?.toFixed(2) || '0.00') + ' USD</p>' +
      '<p><strong>Status:</strong> ' + (order.status || 'pending') + '</p>' +
      trackingInfo +
    '</div>' +
    '<h3>Order Items:</h3>' +
    '<ul>' + orderItemsList + '</ul>' +
    shippingInfo +
    '<p style="margin-top: 20px;">You will receive tracking information once your order ships.</p>' +
    '</div>';

  await base44.integrations.Core.SendEmail({
    from_name: 'Red Helix Research',
    to: order.customer_email,
    subject: 'Order Confirmation - ' + order.order_number,
    body: emailBody
  });

  return { success: true };
}
