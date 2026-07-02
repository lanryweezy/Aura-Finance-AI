import { describe, it, expect } from 'vitest';
import { sanitizeHTML, sanitizeInput, validateEmail, validatePassword, checkRateLimit } from '../securityUtils';

describe('Security Utils', () => {
  describe('sanitizeHTML', () => {
    it('should escape angle brackets', () => {
      expect(sanitizeHTML('<script>')).toContain('&lt;');
      expect(sanitizeHTML('<script>')).toContain('&gt;');
    });

    it('should escape quotes', () => {
      expect(sanitizeHTML('"hello"')).toContain('&quot;');
    });

    it('should pass through clean text', () => {
      expect(sanitizeHTML('Hello World')).toBe('Hello World');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove angle brackets', () => {
      expect(sanitizeInput('<script>')).toBe('script');
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
    });

    it('should remove event handlers', () => {
      expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });
  });

  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.ng')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('no@')).toBe(false);
      expect(validateEmail('@no.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      const result = validatePassword('StrongPass1');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject short passwords', () => {
      const result = validatePassword('Ab1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should require uppercase', () => {
      const result = validatePassword('lowercase1');
      expect(result.errors).toContain('Password must contain an uppercase letter');
    });

    it('should require numbers', () => {
      const result = validatePassword('NoNumbers');
      expect(result.errors).toContain('Password must contain a number');
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      expect(checkRateLimit('test1', 5, 60000)).toBe(true);
    });

    it('should block requests over limit', () => {
      for (let i = 0; i < 5; i++) checkRateLimit('test2', 5, 60000);
      expect(checkRateLimit('test2', 5, 60000)).toBe(false);
    });
  });
});
