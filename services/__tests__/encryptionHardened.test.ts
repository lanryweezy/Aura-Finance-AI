import { describe, it, expect } from 'vitest';
import { encryptField, decryptField, isEncrypted } from '../encryptionService';

describe('Encryption Service — Hardened', () => {
  it('should encrypt and decrypt text', async () => {
    const original = 'Sensitive data: ₦1,000,000';
    const encrypted = await encryptField(original);
    expect(encrypted).not.toBe(original);
    expect(encrypted.length).toBeGreaterThan(0);

    const decrypted = await decryptField(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should handle empty string', async () => {
    const encrypted = await encryptField('');
    const decrypted = await decryptField(encrypted);
    expect(decrypted).toBe('');
  });

  it('should handle special characters', async () => {
    const original = '₦1,000,000 & <script>alert("xss")</script>';
    const encrypted = await encryptField(original);
    const decrypted = await decryptField(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should handle long strings', async () => {
    const original = 'A'.repeat(10000);
    const encrypted = await encryptField(original);
    const decrypted = await decryptField(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should identify encrypted strings', async () => {
    const encrypted = await encryptField('test');
    expect(isEncrypted(encrypted)).toBe(true);
    expect(isEncrypted('not encrypted')).toBe(false);
    expect(isEncrypted('')).toBe(false);
  });

  it('should return original text on decrypt failure', async () => {
    const result = await decryptField('not-valid-base64');
    expect(result).toBe('not-valid-base64');
  });
});
