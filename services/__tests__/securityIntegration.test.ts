import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanitizeHTML, sanitizeInput, validateEmail, validatePassword, checkRateLimit, generateCSRFToken, validateCSRFToken } from '../securityUtils';

describe('Security Utils Integration', () => {
  describe('Input Sanitization Chain', () => {
    it('should sanitize then validate email', () => {
      const raw = '  user@example.com  ';
      const sanitized = sanitizeInput(raw);
      expect(validateEmail(sanitized)).toBe(true);
    });

    it('should sanitize XSS in email input', () => {
      const raw = '<script>alert("xss")</script>@email.com';
      const sanitized = sanitizeInput(raw);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
      expect(sanitized).toContain('alert'); // sanitizeInput removes tags, not content
    });

    it('should sanitize then validate password', () => {
      const raw = '  MyP@ssw0rd  ';
      const sanitized = sanitizeInput(raw);
      const result = validatePassword(sanitized);
      expect(result.valid).toBe(true);
    });
  });

  describe('CSRF Token Flow', () => {
    it('should generate and validate CSRF token', () => {
      const token = generateCSRFToken();
      expect(token.length).toBe(64);
      expect(validateCSRFToken(token, token)).toBe(true);
    });

    it('should reject invalid CSRF token', () => {
      const token = generateCSRFToken();
      expect(validateCSRFToken('wrong-token', token)).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      expect(checkRateLimit('test-integration-1', 5, 60000)).toBe(true);
    });

    it('should block requests over limit', () => {
      for (let i = 0; i < 5; i++) checkRateLimit('test-integration-2', 5, 60000);
      expect(checkRateLimit('test-integration-2', 5, 60000)).toBe(false);
    });
  });

  describe('HTML Sanitization', () => {
    it('should strip all HTML tags', () => {
      const input = '<div><script>alert("xss")</script>Hello</div>';
      const sanitized = sanitizeHTML(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello');
    });

    it('should handle nested HTML', () => {
      const input = '<p><strong>Bold</strong> <em>italic</em></p>';
      const sanitized = sanitizeHTML(input);
      expect(sanitized).toContain('&lt;');
    });
  });
});
