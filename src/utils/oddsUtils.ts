export const convertAmericanToDecimal = (americanOdds: number): number => {
  if (americanOdds > 0) {
    return (americanOdds / 100) + 1;
  } else if (americanOdds < 0) {
    return (100 / Math.abs(americanOdds)) + 1;
  }
  // Return a default or throw an error for invalid American odds like 0
  // For now, let's assume valid inputs based on typical odds.
  return 1; // Or handle error appropriately
};

export const convertDecimalToAmerican = (decimalOdds: number): number => {
  if (decimalOdds >= 2.0) {
    return Math.round((decimalOdds - 1) * 100);
  } else if (decimalOdds > 1.0 && decimalOdds < 2.0) { // decimalOdds must be > 1 for valid conversion
    return Math.round(-100 / (decimalOdds - 1));
  }
  // Handle cases like decimalOdds <= 1 or invalid inputs
  // For American odds, 0 is not a standard representation, but can result from edge cases.
  // +100 is the equivalent of 2.0 decimal. -100 is equivalent of 2.0 decimal.
  // Odds like 1.01 would be -10000. Odds like 1.99 would be -101. Odds like 2.01 would be +101.
  // Let's ensure we don't return 0 for valid conversions that might round to 0 if not handled.
  // However, the current logic Math.round might make values like -100.4 to -100 and -100.6 to -101.
  // And 100.4 to 100 and 100.6 to 101. This is standard.
  // The main concern is decimalOdds very close to 1 or <= 1.
  if (decimalOdds <= 1.0) return 0; // Or throw error: Cannot convert invalid decimal odds

  // Fallback for any other edge cases, though covered by above.
  return 0; 
};

// Assumes 'apiPrice' is the value directly from the API response.
// 'currentApiOddsFormat' is the format setting used for the API call (i.e., state.oddsFormat)
export const formatDisplayOdds = (apiPrice: number, currentApiOddsFormat: 'decimal' | 'american'): string => {
    if (currentApiOddsFormat === 'american') {
        const americanPrice = Math.round(apiPrice); // American odds are integers
        return americanPrice > 0 ? `+${americanPrice}` : `${americanPrice}`;
    } else { // currentApiOddsFormat is 'decimal'
        return apiPrice.toFixed(2);
    }
};

// For arbitrage bets, the 'bet.odds' is ALWAYS decimal because calculations converted it.
export const formatArbitrageBetOddsForDisplay = (decimalBetOdd: number, targetDisplayFormat: 'decimal' | 'american'): string => {
    if (targetDisplayFormat === 'american') {
        const americanOdd = convertDecimalToAmerican(decimalBetOdd);
        return americanOdd > 0 ? `+${americanOdd}` : `${americanOdd}`;
    } else { // targetDisplayFormat is 'decimal'
        return decimalBetOdd.toFixed(2);
    }
};
