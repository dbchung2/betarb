export interface SportType {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

export interface BookmakerType {
  key: string;
  title: string;
  last_update: string;
  markets: MarketType[];
  link: string;
}

export interface MarketType {
  key: string;
  last_update: string;
  outcomes: OutcomeType[];
}

export interface OutcomeType {
  name: string;
  price: number;
  point?: number;
}

export interface GameType {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: BookmakerType[];
}

export interface ArbitrageOpportunityType {
  profit: number;
  bets: {
    bookmaker: string;
    team: string;
    odds: number;
    point?: number;
    stake: number;
    return: number;
  }[];
}

export interface GameWithArbitrageType extends GameType {
  hasArbitrage: boolean;
  arbitrageProfit?: number;
  arbitrageOpportunity?: ArbitrageOpportunityType;
} 