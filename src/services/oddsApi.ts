import axios from "axios";

const API_KEY = "4a85f506eb3a30bf22496b8732c996c2";
const BASE_URL = "https://api.the-odds-api.com/v4";

export interface Sport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

export interface Market {
  key: string;
  last_update: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number;
}

export interface Game {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

export interface ArbitrageOpportunity {
  profit: number;
  bets: {
    bookmaker: string;
    team: string;
    odds: number;
    stake: number;
    return: number;
  }[];
}

export interface GameWithArbitrage extends Game {
  hasArbitrage: boolean;
  arbitrageProfit?: number;
  arbitrageOpportunity?: ArbitrageOpportunity;
}

// Get all available sports
export const getSports = async (): Promise<Sport[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/sports`, {
      params: {
        apiKey: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sports:", error);
    return [];
  }
};

// Get odds for a specific sport
export const getOdds = async (
  sportKey: string,
  marketType: string = "h2h",
): Promise<Game[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/sports/${sportKey}/odds`, {
      params: {
        apiKey: API_KEY,
        regions: "us",
        markets: marketType,
        oddsFormat: "decimal",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching odds for ${sportKey} with market ${marketType}:`,
      error,
    );
    return [];
  }
};

// Calculate if there's an arbitrage opportunity
export const calculateArbitrage = (game: Game): GameWithArbitrage => {
  const result: GameWithArbitrage = {
    ...game,
    hasArbitrage: false,
  };

  // Need at least 2 bookmakers to compare
  if (game.bookmakers.length < 2) {
    return result;
  }

  // Get the best odds for each outcome across all bookmakers
  const bestOdds: Record<string, { odds: number; bookmaker: string }> = {};

  // First, identify all possible outcomes from this game
  const allOutcomes = new Set<string>();
  game.bookmakers.forEach((bookmaker) => {
    bookmaker.markets.forEach((market) => {
      market.outcomes.forEach((outcome) => {
        allOutcomes.add(outcome.name);
      });
    });
  });

  // Make sure we have all possible outcomes (home, away, and possibly draw)
  if (allOutcomes.size < 2) return result;

  // Find the best odds for each outcome across all bookmakers
  game.bookmakers.forEach((bookmaker) => {
    // Find the h2h market (or whatever market type we're analyzing)
    const market = bookmaker.markets[0]; // Assuming the first market is what we want
    if (!market) return;

    market.outcomes.forEach((outcome) => {
      if (
        !bestOdds[outcome.name] ||
        outcome.price > bestOdds[outcome.name].odds
      ) {
        bestOdds[outcome.name] = {
          odds: outcome.price,
          bookmaker: bookmaker.title,
        };
      }
    });
  });

  // Make sure we have odds for all outcomes
  const outcomes = Array.from(allOutcomes);
  for (const outcome of outcomes) {
    if (!bestOdds[outcome]) return result; // Missing odds for an outcome
  }

  // Calculate the arbitrage percentage (sum of inverse odds)
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
        stake: Math.round(stake * 100) / 100, // Round to 2 decimal places
        return: Math.round(stake * odds * 100) / 100,
      };
    });

    result.hasArbitrage = true;
    result.arbitrageProfit = Math.round(profit * 100) / 100; // Round to 2 decimal places
    result.arbitrageOpportunity = {
      profit: Math.round(profit * 100) / 100,
      bets,
    };
  }

  return result;
};

// Process games to identify arbitrage opportunities
export const processGamesForArbitrage = (
  games: Game[],
): GameWithArbitrage[] => {
  return games.map((game) => calculateArbitrage(game));
};
