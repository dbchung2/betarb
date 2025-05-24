import { useState } from "react";
import { getSports } from "../services/oddsApi";
import { SportType as ApiSport } from "../types/odds";

const useGetSports = () => {

    const [sports, setSports] = useState<ApiSport[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchSports = async () => {
        try {
            setIsLoading(true);
            const response = await getSports();
            setSports(response);
        } catch (error) {
            console.error("Failed to fetch sports:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        sports,
        fetchSports,
        isGetSportsLoading: isLoading,
    };
}

export default useGetSports;
