/**
 * Data Protection Utility
 * Provides functions for masking sensitive data and sanitizing inputs
 * to prevent data leaks and XSS attacks.
 */

// Keys that likely contain sensitive data
const SENSITIVE_KEYS = [
  'password',
  'passwd',
  'secret',
  'token',
  'access_token',
  'api_key',
  'credit_card',
  'card_number',
  'cvv',
  'cvc',
  'ssn',
  'social_security',
  'account_number',
  'routing_number',
  'iban'
];

// Regex for detecting potential credit card numbers (simple check)
const CREDIT_CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/g;

// Regex for detecting potential SSNs
const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;

/**
 * Masks a string if it looks like sensitive data
 * @param {string} str 
 * @returns {string}
 */
const maskString = (str) => {
  if (!str || typeof str !== 'string') return str;
  
  // Mask Credit Cards
  if (str.match(CREDIT_CARD_REGEX)) {
    return str.replace(CREDIT_CARD_REGEX, '****-****-****-****');
  }

  // Mask SSNs
  if (str.match(SSN_REGEX)) {
    return str.replace(SSN_REGEX, '***-**-****');
  }

  return str;
};

/**
 * Recursively masks sensitive data in an object
 * @param {Object|Array|string} data 
 * @returns {Object|Array|string}
 */
export const maskSensitiveData = (data) => {
  if (!data) return data;

  if (typeof data === 'string') {
    return maskString(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item));
  }

  if (typeof data === 'object') {
    const masked = {};
    for (const [key, value] of Object.entries(data)) {
      // Check if key itself indicates sensitive data
      if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
        masked[key] = '[REDACTED]';
      } else {
        masked[key] = maskSensitiveData(value);
      }
    }
    return masked;
  }

  return data;
};

/**
 * Sanitizes input to prevent XSS
 * @param {string} input 
 * @returns {string}
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
