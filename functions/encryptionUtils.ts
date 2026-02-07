// Encryption utilities for consumer financial data
// Uses Web Crypto API for secure encryption

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

/**
 * Generate encryption key from app secret
 * In production, use a dedicated encryption key from environment variables
 */
async function getEncryptionKey() {
  const secret = Deno.env.get("BASE44_APP_ID") || "fallback-key-development-only";
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("red-helix-financial-salt"),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt sensitive financial data (Plaid data, payment info, etc.)
 * @param {string} plaintext - Data to encrypt
 * @returns {Promise<string>} - Base64 encoded encrypted data with IV
 */
export async function encryptFinancialData(plaintext) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const key = await getEncryptionKey();
    
    // Generate random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Return as base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt financial data');
  }
}

/**
 * Decrypt financial data
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @returns {Promise<string>} - Decrypted plaintext
 */
export async function decryptFinancialData(encryptedData) {
  try {
    // Decode from base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    );

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const key = await getEncryptionKey();
    
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt financial data');
  }
}

/**
 * Hash sensitive data for indexing/searching without exposing plaintext
 * @param {string} data - Data to hash
 * @returns {Promise<string>} - Hex string hash
 */
export async function hashSensitiveData(data) {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(data)
  );
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}