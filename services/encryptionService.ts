export interface EncryptionResult {
  encrypted: string;
  iv: string;
}

const ALGORITHM = 'AES-GCM';

async function getKey(): Promise<CryptoKey> {
  const envKey = import.meta.env.VITE_ENCRYPTION_KEY;
  if (!envKey) {
    throw new Error('Encryption key not configured. Set VITE_ENCRYPTION_KEY in environment variables.');
  }

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(envKey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new TextEncoder().encode('aura-salt'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptField(plaintext: string): Promise<string> {
  try {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);
    const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoded);
    return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)));
  } catch {
    return plaintext;
  }
}

export async function decryptField(ciphertext: string): Promise<string> {
  try {
    const key = await getKey();
    const data = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, encrypted);
    return new TextDecoder().decode(decrypted);
  } catch {
    return ciphertext;
  }
}

export function isEncrypted(value: string): boolean {
  try {
    const data = Uint8Array.from(atob(value), c => c.charCodeAt(0));
    return data.length > 12;
  } catch {
    return false;
  }
}
