import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getCart, getCartTotal } from '@/components/utils/cart';

export default function AbandonedCartTracker() {
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const cart = getCart();
      const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || 'null');
      
      // Only send if cart has items and we have customer email
      if (cart.length === 0 || !customerInfo?.email) {
        return;
      }

      // Check if order was recently completed (within last 5 minutes)
      const lastOrderComplete = localStorage.getItem('lastOrderComplete');
      if (lastOrderComplete) {
        const timeSinceOrder = Date.now() - parseInt(lastOrderComplete);
        if (timeSinceOrder < 5 * 60 * 1000) {
          return; // Don't send email if order was just completed
        }
      }

      // Check if we already sent an email today
      const lastEmailSent = localStorage.getItem('abandonedCartLastSent');
      if (lastEmailSent) {
        const lastSentDate = new Date(parseInt(lastEmailSent));
        const now = new Date();
        
        // Check if it's the same day
        if (
          lastSentDate.getFullYear() === now.getFullYear() &&
          lastSentDate.getMonth() === now.getMonth() &&
          lastSentDate.getDate() === now.getDate()
        ) {
          return; // Already sent an email today
        }
      }

      // Send abandoned cart email
      try {
        await base44.functions.invoke('sendAbandonedCartEmail', {
          email: customerInfo.email,
          name: customerInfo.firstName,
          cartItems: cart,
          totalAmount: getCartTotal() + 15.00 // Include shipping
        });

        // Mark as sent with timestamp
        localStorage.setItem('abandonedCartLastSent', Date.now().toString());
      } catch (error) {
        console.error('Failed to send abandoned cart email:', error);
      }
    };

    // Listen for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null; // This component doesn't render anything
}