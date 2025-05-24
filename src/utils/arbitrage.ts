import { GameType, GameWithArbitrageType, ArbitrageOpportunityType, OutcomeType } from "../types/odds";

// Calculate arbitrage for h2h (moneyline) markets
const calculateH2HArbitrage = (game: GameType): GameWithArbitrageType => {
  const result: GameWithArbitrageType = {
    ...game,
    hasArbitrage: false,
  };

  const bestOdds: Record<string, { odds: number; bookmaker: string }> = {};

  // Find the best odds for each outcome across all bookmakers
  game.bookmakers.forEach((bookmaker) => {
    const market = bookmaker.markets[0];
    if (!market) return;

    market.outcomes.forEach((outcome) => {
      if (!bestOdds[outcome.name] || outcome.price > bestOdds[outcome.name].odds) {
        bestOdds[outcome.name] = {
          odds: outcome.price,
          bookmaker: bookmaker.title,
        };
      }
    });
  });

  // Calculate arbitrage percentage
  const outcomes = Object.keys(bestOdds);
  if (outcomes.length < 2) return result;

  const arbitragePercentage = outcomes.reduce(
    (sum, outcome) => sum + 1 / (bestOdds[outcome]?.odds || 999999),
    0,
  );

  // If arbitragePercentage < 1, there's an arbitrage opportunity
  if (arbitragePercentage < 1) {
    const profit = ((1 - arbitragePercentage) / arbitragePercentage) * 100;
    const totalStake = 100; // Assuming a total stake of $100

    const bets = outcomes.map((outcome) => {
      const odds = bestOdds[outcome]?.odds || 0;
      const impliedProbability = 1 / odds;
      const stake = totalStake * (impliedProbability / arbitragePercentage);

      return {
        bookmaker: bestOdds[outcome]?.bookmaker || "",
        team: outcome,
        odds: odds,
        stake: Math.round(stake * 100) / 100,
        return: Math.round(stake * odds * 100) / 100,
      };
    });

    result.hasArbitrage = true;
    result.arbitrageProfit = Math.round(profit * 100) / 100;
    result.arbitrageOpportunity = {
      profit: Math.round(profit * 100) / 100,
      bets,
    };
  }

  return result;
};

// Calculate arbitrage for points-based markets (spreads/totals)
const calculatePointsArbitrage = (game: GameType): GameWithArbitrageType => {
  const result: GameWithArbitrageType = {
    ...game,
    hasArbitrage: false,
  };

  // Group outcomes by points
  const outcomesByPoints: Record<number, { bookmaker: string; outcome: OutcomeType }[]> = {};
  
  game.bookmakers.forEach((bookmaker) => {
    const market = bookmaker.markets[0];
    if (!market) return;

    market.outcomes.forEach((outcome) => {
      if (outcome.point !== undefined) {
        const point = outcome.point;
        if (!outcomesByPoints[point]) {
          outcomesByPoints[point] = [];
        }
        outcomesByPoints[point].push({
          bookmaker: bookmaker.title,
          outcome,
        });
      }
    });
  });

  let bestArbitrageOpportunity: ArbitrageOpportunityType | null = null;
  let bestArbitragePercentage = 1; // Initialize with no arbitrage (>= 1)

  // Check arbitrage opportunities for each point spread/total group
  Object.entries(outcomesByPoints).forEach(([point, outcomes]) => {
    // Get the best odds for each outcome name at this point spread/total
    const bestOdds: Record<string, { odds: number; bookmaker: string }> = {};
    
    outcomes.forEach(({ bookmaker, outcome }) => {
      if (!bestOdds[outcome.name] || outcome.price > bestOdds[outcome.name].odds) {
        bestOdds[outcome.name] = {
          odds: outcome.price,
          bookmaker: bookmaker,
        };
      }
    });

    // Calculate arbitrage for this point spread/total group
    const outcomeNames = Object.keys(bestOdds);
    if (outcomeNames.length < 2) return; // Need at least 2 outcomes

    // Calculate the arbitrage percentage
    const arbitragePercentage = outcomeNames.reduce(
      (sum, name) => sum + 1 / (bestOdds[name]?.odds || 999999),
      0,
    );

    // If this is the best arbitrage opportunity so far, save it
    if (arbitragePercentage < 1 && arbitragePercentage < bestArbitragePercentage) {
      bestArbitragePercentage = arbitragePercentage;
      const profit = ((1 - arbitragePercentage) / arbitragePercentage) * 100;
      const totalStake = 100; // Assuming a total stake of $100

      const bets = outcomeNames.map((name) => {
        const odds = bestOdds[name]?.odds || 0;
        const impliedProbability = 1 / odds;
        const stake = totalStake * (impliedProbability / arbitragePercentage);

        return {
          bookmaker: bestOdds[name]?.bookmaker || "",
          team: name,
          odds: odds,
          point: Number(point),
          stake: Math.round(stake * 100) / 100,
          return: Math.round(stake * odds * 100) / 100,
        };
      });

      bestArbitrageOpportunity = {
        profit: Math.round(profit * 100) / 100,
        bets,
      };
    }
  });

  // If we found an arbitrage opportunity, add it to the result
  if (bestArbitrageOpportunity) {
    result.hasArbitrage = true;
    result.arbitrageProfit = bestArbitrageOpportunity.profit;
    result.arbitrageOpportunity = bestArbitrageOpportunity;
  }

  return result;
};

// Main arbitrage calculation function that delegates to the appropriate helper
export const calculateArbitrage = (game: GameType): GameWithArbitrageType => {
  // Need at least 2 bookmakers to compare
  if (game.bookmakers.length < 2) {
    return {
      ...game,
      hasArbitrage: false,
    };
  }

  // Check if this is a points-based market (spreads/totals)
  const firstMarket = game.bookmakers[0]?.markets[0];
  const isPointsMarket = firstMarket?.outcomes.some(outcome => outcome.point !== undefined);

  return isPointsMarket ? calculatePointsArbitrage(game) : calculateH2HArbitrage(game);
};

// Process games to identify arbitrage opportunities
export const processGamesForArbitrage = (
  games: GameType[],
): GameWithArbitrageType[] => {
  return games.map((game) => calculateArbitrage(game));
}; 