import { describe, it, expect } from 'vitest';
import { formatCurrencySync, getCurrencySymbol, CURRENCIES } from '../../lib/utils/currencyAndTimezone';

describe('Currency Utilities', () => {
  describe('getCurrencySymbol', () => {
    it('should return correct symbol for USD', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
    });

    it('should return correct symbol for EUR', () => {
      expect(getCurrencySymbol('EUR')).toBe('€');
    });

    it('should return correct symbol for GBP', () => {
      expect(getCurrencySymbol('GBP')).toBe('£');
    });

    it('should return correct symbol for INR', () => {
      expect(getCurrencySymbol('INR')).toBe('₹');
    });

    it('should return currency code for unknown currency', () => {
      expect(getCurrencySymbol('UNKNOWN')).toBe('UNKNOWN');
    });

    it('should handle all currencies in CURRENCIES array', () => {
      CURRENCIES.forEach((currency) => {
        expect(getCurrencySymbol(currency.code)).toBe(currency.symbol);
      });
    });
  });

  describe('formatCurrencySync', () => {
    it('should format USD currency correctly', () => {
      const result = formatCurrencySync(100, 'USD');
      expect(result).toMatch(/\$100\.00/);
    });

    it('should format EUR currency correctly', () => {
      const result = formatCurrencySync(100, 'EUR');
      expect(result).toMatch(/€100\.00/);
    });

    it('should format INR currency correctly', () => {
      const result = formatCurrencySync(1000, 'INR');
      expect(result).toMatch(/₹1,000\.00/);
    });

    it('should handle decimal amounts', () => {
      const result = formatCurrencySync(99.99, 'USD');
      expect(result).toMatch(/\$99\.99/);
    });

    it('should handle zero', () => {
      const result = formatCurrencySync(0, 'USD');
      expect(result).toMatch(/\$0\.00/);
    });

    it('should handle negative amounts', () => {
      const result = formatCurrencySync(-100, 'USD');
      expect(result).toMatch(/-/);
    });

    it('should handle null and return 0.00', () => {
      const result = formatCurrencySync(null as any, 'USD');
      expect(result).toBe('0.00');
    });

    it('should handle undefined and return 0.00', () => {
      const result = formatCurrencySync(undefined as any, 'USD');
      expect(result).toBe('0.00');
    });

    it('should handle NaN and return 0.00', () => {
      const result = formatCurrencySync(NaN, 'USD');
      expect(result).toBe('0.00');
    });

    it('should use fallback for invalid currency code', () => {
      const result = formatCurrencySync(100, 'INVALID');
      // Should use fallback symbol (currency code itself)
      expect(result).toContain('100.00');
    });

    it('should format large numbers with thousand separators', () => {
      const result = formatCurrencySync(1000000, 'USD');
      expect(result).toMatch(/1,000,000\.00/);
    });

    it('should use custom locale', () => {
      const result = formatCurrencySync(1000, 'EUR', 'de-DE');
      // German locale uses different formatting
      expect(result).toContain('1000');
    });
  });
});





