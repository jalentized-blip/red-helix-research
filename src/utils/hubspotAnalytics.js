/**
 * HubSpot Analytics Utility
 * Handles tracking of events and e-commerce actions in HubSpot
 */

// Check if HubSpot script is loaded
const isHubSpotLoaded = () => {
  return typeof window !== 'undefined' && window._hsq;
};

// Initialize the queue if it doesn't exist
const ensureQueue = () => {
  if (typeof window !== 'undefined' && !window._hsq) {
    window._hsq = [];
  }
};

/**
 * Track a custom event in HubSpot
 * @param {string} eventId - The ID of the custom event from HubSpot
 * @param {number} [value] - Optional value associated with the event
 */
export const trackEvent = (eventId, value) => {
  ensureQueue();
  if (value !== undefined) {
    window._hsq.push(['trackEvent', { id: eventId, value }]);
  } else {
    window._hsq.push(['trackEvent', { id: eventId }]);
  }
};

/**
 * Track a page view
 * @param {string} path - The path of the page viewed
 */
export const trackPageView = (path) => {
  ensureQueue();
  window._hsq.push(['setPath', path]);
  window._hsq.push(['trackPageView']);
};

/**
 * Track identity of the user
 * @param {string} email - User's email
 * @param {Object} properties - Additional contact properties
 */
export const identifyUser = (email, properties = {}) => {
  ensureQueue();
  window._hsq.push(['identify', {
    email: email,
    ...properties
  }]);
};

import { maskSensitiveData } from './dataProtection';

/**
 * Track a completed purchase
 * Note: HubSpot requires specific e-commerce bridge setup for full deal tracking,
 * but we can track the "Purchase" custom event here.
 * @param {Object} order - The order details
 */
export const trackPurchase = (order) => {
  ensureQueue();

  // Mask sensitive data before tracking
  const safeOrder = maskSensitiveData(order);

  // Track the purchase event
  // You should replace 'pept_purchase' with your actual HubSpot Custom Event ID for purchases
  window._hsq.push(['trackEvent', {
    id: 'pept_purchase', 
    value: safeOrder.total_amount
  }]);

  // Also update contact properties if email is available
  if (safeOrder.customer_email) {
    identifyUser(safeOrder.customer_email, {
      last_purchase_date: new Date().toISOString(),
      last_order_amount: safeOrder.total_amount,
      total_revenue: safeOrder.total_amount // Ideally this would be cumulative
    });
  }
};
