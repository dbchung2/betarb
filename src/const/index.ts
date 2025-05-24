// API Configuration
export const API = {
  KEY: "355bda79602fc8e23729a966294d50a6",
  BASE_URL: "https://api.the-odds-api.com/v4",
};

export const MARKETS = [
  { id: "h2h", name: "Moneyline (H2H)" },
  { id: "totals", name: "Totals (Over/Under)" },
] as const;

// Supported Bookmakers
export const BOOKMAKERS = [
  "betmgm",
  "betriver",
  "betus",
  "betway",
  //"bovada",
  "casumo",
  "williamhill_us",
  "draftkings",
  "fanduel",
  "ballybet",
  "espnbet",
  "underdog",
  //"novig",
  "betopenly",
  "sport888",
  "betvictor",
  "coolbet",
  "pinnacle"
] as const;

// Create a type from the bookmakers array
export type BookmakerType = typeof BOOKMAKERS[number];
