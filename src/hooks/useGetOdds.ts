import { useState, useEffect } from "react";
import { useBettingContext } from "../context/useBetting";
import { SportType, GameType } from "../types/odds";
import { getOdds } from "../services/oddsApi";

const useGetSportsOdds = () => {

    const [isOddsLoading, setIsOddsLoading] = useState(false);
    const [sportsOdds, setSportsOdds] = useState<GameType[]>([]);

    const fetchSportsOdds = async (selectedLeague: string, selectedMarket: string) => {
        try {
            setIsOddsLoading(true);
            const response = await getOdds(selectedLeague, selectedMarket);
            setSportsOdds(response);
            setIsOddsLoading(false);
        } catch (error) {
            console.error("Failed to fetch odds:", error);
        } finally {
            setIsOddsLoading(false);
        }
    }


    return { sportsOdds, isOddsLoading, fetchSportsOdds };
};

export default useGetSportsOdds;
