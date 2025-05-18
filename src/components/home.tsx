import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ArbitrageGrid from "./ArbitrageGrid";
import FilterControls from "./FilterControls";
import { Sport as ApiSport } from "@/services/oddsApi";

// Define the sort options
export type SortOption = "profit" | "sport" | "time";

export default function Home() {
  // State for selected filters and sort option
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [selectedMarket, setSelectedMarket] = useState<string>("h2h");
  const [sortOption, setSortOption] = useState<SortOption>("profit");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle sport selection change
  const handleSportChange = (sportId: string) => {
    setIsLoading(true);
    setSelectedSport(sportId);
    // Loading will be handled by the ArbitrageGrid component
    setTimeout(() => setIsLoading(false), 100);
  };

  // Handle league selection change
  const handleLeagueChange = (leagueId: string) => {
    setIsLoading(true);
    setSelectedLeague(leagueId);
    setTimeout(() => setIsLoading(false), 100);
  };

  // Handle market selection change
  const handleMarketChange = (market: string) => {
    setIsLoading(true);
    setSelectedMarket(market);
    setTimeout(() => setIsLoading(false), 100);
  };

  // Handle sort option change
  const handleSortChange = (option: string) => {
    setSortOption(option as SortOption);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="w-full bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl md:text-3xl font-bold text-center">

          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <FilterControls
              selectedSport={selectedSport}
              selectedLeague={selectedLeague}
              selectedMarket={selectedMarket}
              sortOption={sortOption}
              onSportChange={handleSportChange}
              onLeagueChange={handleLeagueChange}
              onMarketChange={handleMarketChange}
              onSortChange={handleSortChange}
            />

            <ArbitrageGrid
              selectedSport={selectedSport}
              selectedLeague={selectedLeague}
              selectedMarket={selectedMarket}
              sortOption={sortOption}
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
