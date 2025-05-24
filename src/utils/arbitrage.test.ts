import { describe, it, expect } from 'vitest';
import { calculateArbitrage } from './arbitrage'; // Assuming correct path
import { GameType } from '../types/odds'; // Assuming correct path

describe('calculateArbitrage with American Odds', () => {
  const mockGameBase: Omit<GameType, 'bookmakers' | 'id' | 'commence_time' | 'sport_key' | 'sport_title' | 'home_team' | 'away_team'> = {};

  it('should correctly identify and calculate arbitrage when oddsFormat is american (H2H)', () => {
    const gameWithArbitrage: GameType = {
      ...mockGameBase,
      id: 'testGame1',
      commence_time: '2023-01-01T00:00:00Z',
      sport_key: 'americanfootball_nfl',
      sport_title: 'NFL',
      home_team: 'Team A',
      away_team: 'Team B',
      bookmakers: [
        {
          key: 'bookie1',
          title: 'Bookmaker 1',
          last_update: '2023-01-01T00:00:00Z',
          markets: [
            {
              key: 'h2h',
              last_update: '2023-01-01T00:00:00Z',
              outcomes: [
                { name: 'Team A', price: 120 }, // Decimal 2.2
                { name: 'Team B', price: -130 }, // Decimal 1.76923
              ],
            },
          ],
        },
        {
          key: 'bookie2',
          title: 'Bookmaker 2',
          last_update: '2023-01-01T00:00:00Z',
          markets: [
            {
              key: 'h2h',
              last_update: '2023-01-01T00:00:00Z',
              outcomes: [
                { name: 'Team A', price: 110 }, // Decimal 2.1
                { name: 'Team B', price: -120 }, // Decimal 1.83333
              ],
            },
          ],
        },
      ],
    };

    // Best odds: Team A: +120 (2.2 from Bookmaker 1), Team B: -120 (1.83333 from Bookmaker 2)
    // Implied probabilities: (1 / 2.2) + (1 / 1.8333333333)
    // = 0.4545454545 + 0.5454545455 = 1.00
    // This specific example results in almost exactly 0% profit, let's adjust for clearer arbitrage
    // Let Bookmaker 1 offer Team A at +120 (2.2)
    // Let Bookmaker 2 offer Team B at -110 (1.90909)
    // Arbitrage % = (1/2.2) + (1/1.90909090909) = 0.454545 + 0.523809 = 0.978354
    // Profit = (1 - 0.978354) / 0.978354 * 100 = 2.212%
    
    gameWithArbitrage.bookmakers[1].markets[0].outcomes[1].price = -110; // Team B at -110

    const result = calculateArbitrage(gameWithArbitrage, 'american');

    expect(result.hasArbitrage).toBe(true);
    expect(result.arbitrageProfit).toBeCloseTo(2.21); // ((1 - (1/2.2 + 1/1.90909090909)) / (1/2.2 + 1/1.90909090909)) * 100

    // Check bets for correctness (optional but good)
    expect(result.arbitrageOpportunity?.bets).toHaveLength(2);
    const betOnTeamA = result.arbitrageOpportunity?.bets.find(b => b.team === 'Team A');
    const betOnTeamB = result.arbitrageOpportunity?.bets.find(b => b.team === 'Team B');

    expect(betOnTeamA?.odds).toBeCloseTo(2.2); // Should be the decimal equivalent
    expect(betOnTeamB?.odds).toBeCloseTo(1.9090909);
  });

  it('should correctly determine no arbitrage when oddsFormat is american and no opportunity exists (H2H)', () => {
    const gameWithoutArbitrage: GameType = {
      ...mockGameBase,
      id: 'testGame2',
      commence_time: '2023-01-01T00:00:00Z',
      sport_key: 'americanfootball_nfl',
      sport_title: 'NFL',
      home_team: 'Team C',
      away_team: 'Team D',
      bookmakers: [
        {
          key: 'bookie1',
          title: 'Bookmaker 1',
          last_update: '2023-01-01T00:00:00Z',
          markets: [
            {
              key: 'h2h',
              last_update: '2023-01-01T00:00:00Z',
              outcomes: [
                { name: 'Team C', price: -150 }, // Decimal 1.66667
                { name: 'Team D', price: 130 },  // Decimal 2.3
              ],
            },
          ],
        },
        {
          key: 'bookie2',
          title: 'Bookmaker 2',
          last_update: '2023-01-01T00:00:00Z',
          markets: [
            {
              key: 'h2h',
              last_update: '2023-01-01T00:00:00Z',
              outcomes: [
                { name: 'Team C', price: -160 }, // Decimal 1.625
                { name: 'Team D', price: 120 },  // Decimal 2.2
              ],
            },
          ],
        },
      ],
    };
    // Best odds: Team C: -150 (1.66667 from Bookie1), Team D: +130 (2.3 from Bookie1)
    // (1 / 1.66667) + (1 / 2.3) = 0.6 + 0.43478 = 1.03478 > 1. No arbitrage.

    const result = calculateArbitrage(gameWithoutArbitrage, 'american');
    expect(result.hasArbitrage).toBe(false);
    expect(result.arbitrageProfit).toBeUndefined();
  });

  // Test for points-based market (e.g., spreads) with American odds
  it('should correctly calculate arbitrage for points market with American odds', () => {
    const gameWithPointsArbitrage: GameType = {
      ...mockGameBase,
      id: 'testGame3',
      commence_time: '2023-01-01T00:00:00Z',
      sport_key: 'basketball_nba',
      sport_title: 'NBA',
      home_team: 'Team X', // Not directly used in points outcomes by name
      away_team: 'Team Y', // Not directly used in points outcomes by name
      bookmakers: [
        {
          key: 'bookie1',
          title: 'Bookmaker 1',
          last_update: '2023-01-01T00:00:00Z',
          markets: [
            {
              key: 'spreads',
              last_update: '2023-01-01T00:00:00Z',
              outcomes: [
                // Price is American odds
                { name: 'Over', price: -110, point: 200.5 }, // Decimal 1.90909
                { name: 'Under', price: -110, point: 200.5 },// Decimal 1.90909
              ],
            },
          ],
        },
        {
          key: 'bookie2',
          title: 'Bookmaker 2',
          last_update: '2023-01-01T00:00:00Z',
          markets: [
            {
              key: 'spreads',
              last_update: '2023-01-01T00:00:00Z',
              outcomes: [
                { name: 'Over', price: 105, point: 200.5 },  // Decimal 2.05
                { name: 'Under', price: -125, point: 200.5 }, // Decimal 1.8
              ],
            },
          ],
        },
      ],
    };

    // For point 200.5:
    // Best Over: +105 (2.05) from Bookmaker 2
    // Best Under: -110 (1.90909) from Bookmaker 1
    // Arbitrage % = (1/2.05) + (1/1.90909090909) = 0.487804878 + 0.5238095238 = 1.0116144
    // No arbitrage in this specific case. Let's adjust for one.
    // Bookie1: Over -110 (1.90909), Under +100 (2.0)
    // Bookie2: Over +110 (2.1), Under -120 (1.83333)
    // Best Over: +110 (2.1) from Bookie2
    // Best Under: +100 (2.0) from Bookie1
    // (1/2.1) + (1/2.0) = 0.47619 + 0.5 = 0.97619
    // Profit = (1 - 0.97619047619) / 0.97619047619 * 100 = 2.439%

    gameWithPointsArbitrage.bookmakers[0].markets[0].outcomes = [
        { name: 'Over', price: -110, point: 200.5 },
        { name: 'Under', price: 100, point: 200.5 }, // Under +100 (2.0)
    ];
    gameWithPointsArbitrage.bookmakers[1].markets[0].outcomes = [
        { name: 'Over', price: 110, point: 200.5 },   // Over +110 (2.1)
        { name: 'Under', price: -120, point: 200.5 },
    ];

    const result = calculateArbitrage(gameWithPointsArbitrage, 'american');
    expect(result.hasArbitrage).toBe(true);
    expect(result.arbitrageProfit).toBeCloseTo(2.44); // ((1 - (1/2.1 + 1/2.0)) / (1/2.1 + 1/2.0)) * 100

    const arbOpp = result.arbitrageOpportunity;
    expect(arbOpp?.bets).toHaveLength(2);
    const betOver = arbOpp?.bets.find(b => b.team === 'Over'); // team property holds 'Over' or 'Under'
    const betUnder = arbOpp?.bets.find(b => b.team === 'Under');

    expect(betOver?.odds).toBeCloseTo(2.1);
    expect(betOver?.point).toBe(200.5);
    expect(betUnder?.odds).toBeCloseTo(2.0);
    expect(betUnder?.point).toBe(200.5);
  });
});
