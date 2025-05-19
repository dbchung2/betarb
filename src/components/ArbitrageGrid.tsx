import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameRow from "./GameRow";
import {
  getOdds,
  processGamesForArbitrage,
  GameWithArbitrage,
} from "@/services/oddsApi";

interface ArbitrageGridProps {
  selectedSport?: string;
  selectedLeague?: string;
  selectedMarket?: string;
  sortOption?: string;
  isLoading?: boolean;
}

const ArbitrageGrid = ({
  selectedSport = "all",
  selectedLeague = "all",
  selectedMarket = "h2h",
  sortOption = "profit",
  isLoading: propsIsLoading = false,
}: ArbitrageGridProps) => {
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [games, setGames] = useState<GameWithArbitrage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(propsIsLoading);
  const [error, setError] = useState<string | null>(null);

  // Track previous market type to avoid unnecessary API calls
  const [previousMarket, setPreviousMarket] = useState<string>(selectedMarket);
  const [previousSport, setPreviousSport] = useState<string>(selectedSport);
  const [previousLeague, setPreviousLeague] = useState<string>(selectedLeague);

  useEffect(() => {
    const fetchGames = async () => {
      // Check if we only changed market type for player markets
      const isPlayerMarketSwitch =
        previousMarket.startsWith("player_") &&
        selectedMarket.startsWith("player_") &&
        previousSport === selectedSport &&
        previousLeague === selectedLeague;

      // Only set loading if not just switching between player markets
      if (!isPlayerMarketSwitch) {
        setIsLoading(true);
      }

      setError(null);
      try {
        // Determine which sport/league to fetch
        let sportKey = "basketball_nba"; // Default

        if (selectedLeague !== "all") {
          // If a specific league is selected, use that
          sportKey = selectedLeague;
        } else if (selectedSport !== "all") {
          // If only a sport category is selected, fetch a popular league from that sport
          // This is a simplified approach - in a real app you might want to fetch multiple leagues
          switch (selectedSport) {
            case "Basketball":
              sportKey = "basketball_nba";
              break;
            case "Soccer":
              sportKey = "soccer_epl";
              break;
            case "Baseball":
              sportKey = "baseball_mlb";
              break;
            case "American Football":
              sportKey = "americanfootball_nfl";
              break;
            case "Ice Hockey":
              sportKey = "icehockey_nhl";
              break;
            default:
              sportKey = "basketball_nba";
          }
        }

        // Fetch the odds with the selected market type
        const fetchedGames = await getOdds(sportKey, selectedMarket);
        const processedGames = processGamesForArbitrage(fetchedGames);
        setGames(processedGames);

        // Update previous values
        setPreviousMarket(selectedMarket);
        setPreviousSport(selectedSport);
        setPreviousLeague(selectedLeague);
      } catch (err) {
        console.error("Error fetching games:", err);
        setError(
          "Failed to load games. Please check your API key and try again later.",
        );
        setGames([]);
      } finally {
        if (!isPlayerMarketSwitch) {
          setIsLoading(false);
        }
      }
    };

    fetchGames();
  }, [
    selectedSport,
    selectedLeague,
    selectedMarket,
    previousMarket,
    previousSport,
    previousLeague,
  ]);

  const toggleGameExpansion = (gameId: string) => {
    setExpandedGameId(expandedGameId === gameId ? null : gameId);
  };

  // Sort games based on sortOption parameter
  const sortedGames = [...games].sort((a, b) => {
    if (sortOption === "profit") {
      return (b.arbitrageProfit || 0) - (a.arbitrageProfit || 0);
    } else if (sortOption === "time") {
      return (
        new Date(a.commence_time).getTime() -
        new Date(b.commence_time).getTime()
      );
    } else if (sortOption === "sport") {
      return a.sport_title.localeCompare(b.sport_title);
    }
    return 0;
  });

  // Group games by arbitrage status
  const arbitrageGames = sortedGames.filter((game) => game.hasArbitrage);
  const nonArbitrageGames = sortedGames.filter((game) => !game.hasArbitrage);

  if (isLoading) {
    return (
      <Card className="w-full bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-64 text-red-500">
            <p className="text-lg font-medium">{error}</p>
            <p className="text-sm mt-2">
              Please check your API key and try again
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white">
      <CardContent className="p-4">
        <Tabs defaultValue="arbitrage" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="arbitrage" className="flex items-center gap-2">
              Arbitrage Opportunities
              <Badge variant="secondary" className="ml-1">
                {arbitrageGames.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              All Games
              <Badge variant="secondary" className="ml-1">
                {sortedGames.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="arbitrage" className="mt-0">
            {arbitrageGames.length > 0 ? (
              <div className="space-y-4">
                {arbitrageGames.map((game) => (
                  <GameRow
                    key={game.id}
                    gameId={game.id}
                    homeTeam={game.home_team}
                    awayTeam={game.away_team}
                    startTime={game.commence_time}
                    sport={game.sport_title}
                    marketType={selectedMarket}
                    bookmakerOdds={game.bookmakers.map((bm) => ({
                      bookmaker: bm.title,
                      odds: {
                        home:
                          bm.markets[0]?.outcomes.find(
                            (o) => o.name === game.home_team,
                          )?.price || 0,
                        away:
                          bm.markets[0]?.outcomes.find(
                            (o) => o.name === game.away_team,
                          )?.price || 0,
                        draw: bm.markets[0]?.outcomes.find(
                          (o) => o.name === "Draw",
                        )?.price,
                        point: bm.markets[0]?.outcomes.find(
                          (o) => o.name === game.home_team,
                        )?.point,
                      },
                    }))}
                    arbitrageOpportunity={game.arbitrageOpportunity}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <p className="text-lg">No arbitrage opportunities found</p>
                <p className="text-sm">
                  Try selecting a different sport or check back later
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-0">
            <div className="space-y-4">
              {sortedGames.length > 0 ? (
                sortedGames.map((game) => (
                  <GameRow
                    key={game.id}
                    gameId={game.id}
                    homeTeam={game.home_team}
                    awayTeam={game.away_team}
                    startTime={game.commence_time}
                    sport={game.sport_title}
                    marketType={selectedMarket}
                    bookmakerOdds={game.bookmakers.map((bm) => ({
                      bookmaker: bm.title,
                      odds: {
                        home:
                          bm.markets[0]?.outcomes.find(
                            (o) => o.name === game.home_team,
                          )?.price || 0,
                        away:
                          bm.markets[0]?.outcomes.find(
                            (o) => o.name === game.away_team,
                          )?.price || 0,
                        draw: bm.markets[0]?.outcomes.find(
                          (o) => o.name === "Draw",
                        )?.price,
                        point: bm.markets[0]?.outcomes.find(
                          (o) => o.name === game.home_team,
                        )?.point,
                      },
                    }))}
                    arbitrageOpportunity={game.arbitrageOpportunity}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <p className="text-lg">No games found</p>
                  <p className="text-sm">
                    Try selecting a different sport or league
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ArbitrageGrid;
