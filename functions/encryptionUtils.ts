// Encryption utilities for consumer financial data
// Uses Web Crypto API for secure encryption

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 600000; // OWASP recommended minimum for SHA-256

/**
 * Generate encryption key from app secret using PBKDF2
 * Requires ENCRYPTION_KEY and ENCRYPTION_SALT environment variables
 */
async function getEncryptionKey(salt?: Uint8Array) {
  const secret = Deno.env.get("ENCRYPTION_KEY");
  if (!secret) {
    throw new Error("ENCRYPTION_KEY environment variable is required");
  }

  const saltEnv = Deno.env.get("ENCRYPTION_SALT");
  if (!saltEnv && !salt) {
    throw new Error("ENCRYPTION_SALT environment variable is required");
  }

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const derivationSalt = salt || encoder.encode(saltEnv);

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: derivationSalt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false, // non-extractable
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt sensitive financial data (Plaid data, payment info, etc.)
 * Uses AES-256-GCM with random IV and PBKDF2-derived key
 * @param {string} plaintext - Data to encrypt
 * @returns {Promise<string>} - Base64 encoded (salt + IV + ciphertext)
 */
export async function encryptFinancialData(plaintext: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Generate random salt per encryption for key derivation
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await getEncryptionKey(salt);

    // Generate random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );

    // Combine salt + IV + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Return as base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error.message);
    throw new Error('Failed to encrypt financial data');
  }
}

/**
 * Decrypt financial data
 * @param {string} encryptedData - Base64 encoded (salt + IV + ciphertext)
 * @returns {Promise<string>} - Decrypted plaintext
 */
export async function decryptFinancialData(encryptedData: string): Promise<string> {
  try {
    // Decode from base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    );

    // Extract salt, IV and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);

    const key = await getEncryptionKey(salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt financial data');
  }
}

/**
 * Hash sensitive data for indexing/searching without exposing plaintext
 * Uses HMAC-SHA256 with a server-side key for keyed hashing (prevents rainbow tables)
 * @param {string} data - Data to hash
 * @returns {Promise<string>} - Hex string hash
 */
export async function hashSensitiveData(data: string): Promise<string> {
  const hmacKey = Deno.env.get("HMAC_SECRET");
  const encoder = new TextEncoder();

  if (hmacKey) {
    // Use HMAC for keyed hashing - prevents rainbow table attacks
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(hmacKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const hashBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback to plain SHA-256 if HMAC_SECRET not set (log warning)
  console.warn("HMAC_SECRET not set - using plain SHA-256 for hashing. Set HMAC_SECRET for production.");
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(data)
  );

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
