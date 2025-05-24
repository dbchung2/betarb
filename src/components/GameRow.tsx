import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArbitrageOpportunityType } from "../types/odds";

interface BookmakerOdds {
  bookmaker: string;
  link: string;
  odds: {
    home: number;
    away: number;
    draw?: number;
    point?: number;
  };
}

interface GameRowProps {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  sport: string;
  bookmakerOdds: BookmakerOdds[];
  arbitrageOpportunity?: ArbitrageOpportunityType;
  marketType?: string;
}

const GameRow = ({
  gameId,
  homeTeam,
  awayTeam,
  startTime,
  sport,
  bookmakerOdds,
  arbitrageOpportunity,
  marketType = "h2h",
}: GameRowProps) => {
  const [expanded, setExpanded] = useState(false);

  // Format date for display
  const formattedDate = new Date(startTime).toLocaleString();

  // Determine if there's an arbitrage opportunity
  const hasArbitrageOpportunity =
    arbitrageOpportunity && arbitrageOpportunity.profit > 0;

  // Format market type for display
  const getMarketDisplay = () => {
    switch (marketType) {
      case "h2h":
        return "Moneyline";
      case "spreads":
        return "Point Spread";
      case "totals":
        return "Over/Under";
      default:
        return marketType;
    }
  };

  return (
    <Card
      className="w-full bg-white border-l-4 overflow-hidden"
      style={{
        borderLeftColor: hasArbitrageOpportunity ? "#10b981" : "#e5e7eb",
      }}
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 w-full"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4 flex-grow">
          <div className="flex-shrink-0">
            {hasArbitrageOpportunity && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {arbitrageOpportunity.profit.toFixed(2)}% Profit
              </Badge>
            )}
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-medium">
              {homeTeam} vs {awayTeam}
            </h3>
            <div className="text-sm text-gray-500">
              <span>{sport}</span> • <span>{formattedDate}</span> • <span>{getMarketDisplay()}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
      </div>

      {expanded && (
        <CardContent className="border-t pt-4 pb-2">
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Bookmaker Odds</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bookmakerOdds.map((bookmaker, index) => (
                <div key={index} className="p-3 border rounded-md" onClick={() => window.open(bookmaker.link, "_blank")}>
                  <div className="font-medium">{bookmaker.bookmaker}</div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <div className="text-xs text-gray-500">{homeTeam}</div>
                      <div className="font-semibold">
                        {bookmaker.odds.home.toFixed(2)}
                        {bookmaker.odds.point !== undefined && (
                          <span className="text-gray-500 ml-1">
                            ({bookmaker.odds.point > 0 ? "+" : ""}{bookmaker.odds.point})
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{awayTeam}</div>
                      <div className="font-semibold">
                        {bookmaker.odds.away.toFixed(2)}
                        {bookmaker.odds.point !== undefined && (
                          <span className="text-gray-500 ml-1">
                            ({bookmaker.odds.point > 0 ? "+" : ""}{bookmaker.odds.point})
                          </span>
                        )}
                      </div>
                    </div>
                    {bookmaker.odds.draw !== undefined && (
                      <div>
                        <div className="text-xs text-gray-500">Draw</div>
                        <div className="font-semibold">
                          {bookmaker.odds.draw.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {hasArbitrageOpportunity && (
            <div className="bg-green-50 p-4 rounded-md">
              <h4 className="text-green-800 font-semibold mb-2">
                Arbitrage Opportunity
              </h4>
              <div className="text-green-700 mb-2">
                Guaranteed profit:{" "}
                <span className="font-bold">
                  {arbitrageOpportunity.profit.toFixed(2)}%
                </span>{" "}
                on total stake
              </div>

              <Separator className="my-3" />

              <h5 className="text-sm font-medium mb-2">Recommended Bets:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {arbitrageOpportunity.bets.map((bet, index) => (
                  <div
                    key={index}
                    className="bg-white p-3 rounded-md border border-green-200"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{bet.bookmaker}</span>
                      <span className="text-sm">{bet.team}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>
                        Odds:{" "}
                        <span className="font-semibold">
                          {bet.odds.toFixed(2)}
                        </span>
                        {bet.point !== undefined && (
                          <span className="text-gray-500 ml-1">
                            ({bet.point > 0 ? "+" : ""}{bet.point})
                          </span>
                        )}
                      </span>
                      <span>
                        Stake:{" "}
                        <span className="font-semibold">
                          ${bet.stake.toFixed(2)}
                        </span>
                      </span>
                    </div>
                    <div className="text-sm text-right mt-1">
                      Potential return:{" "}
                      <span className="font-semibold">
                        ${bet.return.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default GameRow;
