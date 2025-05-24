import { describe, it, expect } from 'vitest';
import {
  convertAmericanToDecimal,
  convertDecimalToAmerican,
  formatDisplayOdds,
  formatArbitrageOddsForDisplay,
} from './oddsUtils';

describe('oddsUtils', () => {
  describe('convertAmericanToDecimal', () => {
    it('should convert positive American odds to decimal', () => {
      expect(convertAmericanToDecimal(150)).toBe(2.5);
      expect(convertAmericanToDecimal(100)).toBe(2.0);
      expect(convertAmericanToDecimal(200)).toBe(3.0);
    });

    it('should convert negative American odds to decimal', () => {
      expect(convertAmericanToDecimal(-110)).toBeCloseTo(1.9090909);
      expect(convertAmericanToDecimal(-100)).toBe(2.0);
      expect(convertAmericanToDecimal(-200)).toBe(1.5);
    });

    it('should handle edge cases for American odds', () => {
      // Based on the implementation, 0 is not a standard input but would return 1.
      // Test if this behavior is consistent if it's an expected edge case.
      // However, standard American odds are non-zero.
    });
  });

  describe('convertDecimalToAmerican', () => {
    it('should convert decimal odds >= 2.0 to positive American odds', () => {
      expect(convertDecimalToAmerican(2.5)).toBe(150);
      expect(convertDecimalToAmerican(2.0)).toBe(100);
      expect(convertDecimalToAmerican(3.0)).toBe(200);
    });

    it('should convert decimal odds < 2.0 (and > 1.0) to negative American odds', () => {
      expect(convertDecimalToAmerican(1.9090909090909092)).toBe(-110);
      expect(convertDecimalToAmerican(1.5)).toBe(-200);
      expect(convertDecimalToAmerican(1.01)).toBe(-10000); // Example of very low decimal
    });
    
    it('should handle decimal odds of 2.0 for American conversion (edge case)', () => {
        expect(convertDecimalToAmerican(2.0)).toBe(100);
    });

    it('should handle invalid decimal odds <= 1.0', () => {
      expect(convertDecimalToAmerican(1.0)).toBe(0); // As per current implementation
      expect(convertDecimalToAmerican(0.5)).toBe(0); // As per current implementation
    });
  });

  describe('formatDisplayOdds', () => {
    it('should format decimal odds for display when format is decimal', () => {
      expect(formatDisplayOdds(2.5, 'decimal')).toBe('2.50');
      expect(formatDisplayOdds(1.888, 'decimal')).toBe('1.89'); // Test rounding
    });

    it('should format positive American odds for display when format is american', () => {
      expect(formatDisplayOdds(150, 'american')).toBe('+150');
      expect(formatDisplayOdds(100, 'american')).toBe('+100');
    });

    it('should format negative American odds for display when format is american', () => {
      expect(formatDisplayOdds(-110, 'american')).toBe('-110');
      expect(formatDisplayOdds(-200, 'american')).toBe('-200');
    });
  });

  describe('formatArbitrageOddsForDisplay', () => {
    it('should format decimal arbitrage odds for display when target is decimal', () => {
      expect(formatArbitrageOddsForDisplay(1.8, 'decimal')).toBe('1.80');
      expect(formatArbitrageOddsForDisplay(2.256, 'decimal')).toBe('2.26'); // Test rounding
    });

    it('should convert and format decimal arbitrage odds to positive American when target is american', () => {
      expect(formatArbitrageOddsForDisplay(2.2, 'american')).toBe('+120'); // 2.2 -> +120
      expect(formatArbitrageOddsForDisplay(3.0, 'american')).toBe('+200'); // 3.0 -> +200
    });

    it('should convert and format decimal arbitrage odds to negative American when target is american', () => {
      expect(formatArbitrageOddsForDisplay(1.5, 'american')).toBe('-200');  // 1.5 -> -200
      expect(formatArbitrageOddsForDisplay(1.90909, 'american')).toBe('-110'); // 1.90909 -> -110
    });
     it('should handle decimal odds of 2.0 for American display (edge case)', () => {
        expect(formatArbitrageOddsForDisplay(2.0, 'american')).toBe('+100');
    });
  });
});
