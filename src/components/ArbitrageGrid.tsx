import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameRow from "./GameRow";
import { getOdds } from "../services/oddsApi.ts";
import { GameWithArbitrageType, GameType } from "../types/odds.ts";
import { processGamesForArbitrage } from "../utils/arbitrage.ts";
import { useBettingContext } from "../context/useBetting";

interface ArbitrageGridProps {
  isLoading?: boolean;
  games: GameType[];
}

const ArbitrageGrid = ({
  isLoading = false,
  games,
}: ArbitrageGridProps) => {

  const processedGames = processGamesForArbitrage(games);
  const sortedGames = [...processedGames].sort((a, b) => {
    return (b.arbitrageProfit || 0) - (a.arbitrageProfit || 0);
  });
  const { state: { filter: { selectedMarket } } } = useBettingContext();

  // Sort logic goes here


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
                      link: bm.link,
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
                      link: bm.link,
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
                    Try selecting a different sport or check back later
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
