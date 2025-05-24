import { useState, useCallback } from "react";
import { useBettingContext } from "../context/useBetting";
import { GameType } from "../types/odds";
import { getOdds } from "../services/oddsApi";

const useGetSportsOdds = () => {
    const { state } = useBettingContext(); // Get state from context
    const [isOddsLoading, setIsOddsLoading] = useState(false);
    const [sportsOdds, setSportsOdds] = useState<GameType[]>([]);

    // fetchSportsOdds will now use state.oddsFormat from its closure
    const fetchSportsOdds = useCallback(async (selectedLeague: string, selectedMarket: string) => {
        try {
            setIsOddsLoading(true);
            // Pass state.oddsFormat to getOdds
            const response = await getOdds(selectedLeague, selectedMarket, state.oddsFormat);
            setSportsOdds(response);
        } catch (error) {
            console.error("Failed to fetch odds:", error);
            setSportsOdds([]); // Clear odds on error
        } finally {
            setIsOddsLoading(false);
        }
    }, [state.oddsFormat]); // Add state.oddsFormat to dependency array


    return { sportsOdds, isOddsLoading, fetchSportsOdds };
};

export default useGetSportsOdds;
