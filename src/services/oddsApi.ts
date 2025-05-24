import axios from "axios";
import { API, BOOKMAKERS } from "../const";
import { SportType, GameType } from "../types/odds";

// Get all available sports
export const getSports = async (): Promise<SportType[]> => {
  try {
    const response = await axios.get(`${API.BASE_URL}/sports`, {
      params: {
        apiKey: API.KEY,
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
): Promise<GameType[]> => {
  try {
    const response = await axios.get(`${API.BASE_URL}/sports/${sportKey}/odds`, {
      params: {
        apiKey: API.KEY,
        bookmakers: BOOKMAKERS.join(","),
        includeLinks: true,
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