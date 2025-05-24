import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SportType as ApiSport } from "@/types/odds";
import ArbitrageGrid from "./ArbitrageGrid";
import FilterControls from "./FilterControls";
import useGetSports from "../hooks/useGetSports";
import useGetSportsOdds from "../hooks/useGetOdds";
import { setSportsGroup, useBettingContext } from "@/context";

export default function Home() {
  const { sports, isGetSportsLoading, fetchSports } = useGetSports();
  const { sportsOdds: games, isOddsLoading, fetchSportsOdds } = useGetSportsOdds();
  const { state, dispatch } = useBettingContext();
  const { filter: { selectedLeague, selectedMarket } } = state;
  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    if (sports.length > 0) {
      const sportGroups = sports.reduce(
        (acc, sport) => {
          if (!acc[sport.group]) {
            acc[sport.group] = [];
          }
          acc[sport.group].push(sport);
          return acc;
        },
        {} as Record<string, ApiSport[]>,
      );
      dispatch(setSportsGroup(sportGroups)); 
    }
  }, [sports]);

  useEffect(() => {
    if (selectedLeague && selectedMarket) {
      fetchSportsOdds(selectedLeague, selectedMarket);
    }
  }, [selectedLeague, selectedMarket]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="w-full bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl md:text-3xl font-bold text-center">
            <h1>Arbitrage Finder</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <FilterControls isSportsLoading={isGetSportsLoading} />
            <ArbitrageGrid isLoading={isOddsLoading} games={games} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
