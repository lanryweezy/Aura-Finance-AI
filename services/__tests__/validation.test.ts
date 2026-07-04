import { describe, it, expect } from 'vitest';
import { validateRequired, validateEmail, validateNumber, validateMinLength, validatePhone } from '../../components/ui/FormField';

describe('Form Validation Utilities — Hardened', () => {
  describe('validateRequired', () => {
    it('should reject empty string', () => {
      expect(validateRequired('', 'name')).toEqual({ field: 'name', message: 'name is required' });
    });

    it('should reject null', () => {
      expect(validateRequired(null, 'email')).toEqual({ field: 'email', message: 'email is required' });
    });

    it('should reject undefined', () => {
      expect(validateRequired(undefined, 'amount')).toEqual({ field: 'amount', message: 'amount is required' });
    });

    it('should accept valid string', () => {
      expect(validateRequired('hello', 'name')).toBeNull();
    });

    it('should accept zero as valid number', () => {
      expect(validateRequired(0, 'amount')).toBeNull();
    });

    it('should accept false as valid boolean', () => {
      expect(validateRequired(false, 'agree')).toBeNull();
    });

    it('should reject whitespace-only string', () => {
      expect(validateRequired('   ', 'name')).toEqual({ field: 'name', message: 'name is required' });
    });
  });

  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('user@example.com')).toBeNull();
      expect(validateEmail('test.co.ng@domain.com')).toBeNull();
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).not.toBeNull();
      expect(validateEmail('no@')).not.toBeNull();
      expect(validateEmail('@no.com')).not.toBeNull();
      expect(validateEmail('user@')).not.toBeNull();
    });

    it('should accept empty string (optional field)', () => {
      expect(validateEmail('')).toBeNull();
    });
  });

  describe('validateNumber', () => {
    it('should accept valid numbers', () => {
      expect(validateNumber(100)).toBeNull();
      expect(validateNumber(0)).toBeNull();
    });

    it('should reject NaN', () => {
      expect(validateNumber(NaN)).not.toBeNull();
    });

    it('should reject below minimum', () => {
      expect(validateNumber(5, 10)).not.toBeNull();
    });

    it('should reject above maximum', () => {
      expect(validateNumber(100, undefined, 50)).not.toBeNull();
    });

    it('should accept number within range', () => {
      expect(validateNumber(50, 10, 100)).toBeNull();
    });
  });

  describe('validateMinLength', () => {
    it('should accept strings meeting minimum length', () => {
      expect(validateMinLength('hello', 3, 'name')).toBeNull();
    });

    it('should reject strings below minimum length', () => {
      expect(validateMinLength('hi', 5, 'name')).not.toBeNull();
    });

    it('should accept empty string (optional)', () => {
      expect(validateMinLength('', 5, 'name')).toBeNull();
    });
  });

  describe('validatePhone', () => {
    it('should accept valid phone numbers', () => {
      expect(validatePhone('+2348012345678')).toBeNull();
      expect(validatePhone('08012345678')).toBeNull();
      expect(validatePhone('+1-555-123-4567')).toBeNull();
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('abc')).not.toBeNull();
      expect(validatePhone('12')).not.toBeNull();
    });

    it('should accept empty string (optional)', () => {
      expect(validatePhone('')).toBeNull();
    });
  });
});
