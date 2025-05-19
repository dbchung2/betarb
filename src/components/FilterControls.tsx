import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { ArrowUpDown, SortAsc, Clock, Percent, Filter } from "lucide-react";
import { getSports, Sport as ApiSport } from "@/services/oddsApi";

interface FilterControlsProps {
  sports?: ApiSport[];
  selectedSport?: string;
  selectedLeague?: string;
  selectedMarket?: string;
  sortOption?: string;
  onSportChange?: (sport: string) => void;
  onLeagueChange?: (league: string) => void;
  onMarketChange?: (market: string) => void;
  onSortChange?: (sortBy: string) => void;
  className?: string;
}

const FilterControls = ({
  sports: propsSports,
  selectedSport: propsSelectedSport = "all",
  selectedLeague: propsSelectedLeague = "all",
  selectedMarket: propsSelectedMarket = "h2h",
  sortOption: propsSortOption = "profit",
  onSportChange = () => {},
  onLeagueChange = () => {},
  onMarketChange = () => {},
  onSortChange = () => {},
  className = "",
}: FilterControlsProps) => {
  const [selectedSport, setSelectedSport] =
    useState<string>(propsSelectedSport);
  const [selectedLeague, setSelectedLeague] =
    useState<string>(propsSelectedLeague);
  const [selectedMarket, setSelectedMarket] =
    useState<string>(propsSelectedMarket);
  const [sortBy, setSortBy] = useState<string>(propsSortOption);
  const [sports, setSports] = useState<ApiSport[]>(propsSports || []);
  const [leagues, setLeagues] = useState<ApiSport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Available markets
  const markets = [
    { id: "h2h", name: "Moneyline (H2H)" },
    { id: "spreads", name: "Point Spreads" },
    { id: "totals", name: "Totals (Over/Under)" },
    // { id: "player_points", name: "Player Points" },
    // { id: "player_rebounds", name: "Player Rebounds" },
    // { id: "player_assists", name: "Player Assists" },
  ];

  useEffect(() => {
    const fetchSports = async () => {
      if (propsSports) {
        setSports(propsSports);
        return;
      }

      setIsLoading(true);
      try {
        const apiSports = await getSports();
        // Group sports by their group property
        const sportGroups = apiSports.reduce(
          (acc, sport) => {
            if (!acc[sport.group]) {
              acc[sport.group] = [];
            }
            acc[sport.group].push(sport);
            return acc;
          },
          {} as Record<string, ApiSport[]>,
        );

        // Create a list of sport groups
        const sportGroupsList = Object.keys(sportGroups).map((group) => ({
          key: group,
          title: group,
          group: "category",
          description: "",
          active: true,
          has_outrights: false,
        }));

        setSports(sportGroupsList);

        // If a sport is selected, filter leagues by that sport group
        if (selectedSport !== "all" && selectedSport !== "") {
          setLeagues(sportGroups[selectedSport] || []);
        }
      } catch (error) {
        console.error("Failed to fetch sports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSports();
  }, [propsSports]);

  // Update leagues when sport changes
  useEffect(() => {
    const fetchLeagues = async () => {
      if (selectedSport === "all" || selectedSport === "") {
        setLeagues([]);
        return;
      }

      setIsLoading(true);
      try {
        const apiSports = await getSports();
        const filteredLeagues = apiSports.filter(
          (sport) => sport.group === selectedSport && sport.active,
        );
        setLeagues(filteredLeagues);
      } catch (error) {
        console.error("Failed to fetch leagues:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagues();
  }, [selectedSport]);

  const handleSportChange = (value: string) => {
    setSelectedSport(value);
    setSelectedLeague("all"); // Reset league when sport changes
    onSportChange(value);
    onLeagueChange("all");
  };

  const handleLeagueChange = (value: string) => {
    setSelectedLeague(value);
    onLeagueChange(value);
  };

  const handleMarketChange = (value: string) => {
    setSelectedMarket(value);
    onMarketChange(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
  };

  return (
    <div
      className={`w-full p-4 bg-background border-b flex flex-col gap-4 ${className}`}
    >
      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium mb-1 block">
            Sport Category
          </label>
          <Select
            value={selectedSport}
            onValueChange={handleSportChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={isLoading ? "Loading..." : "Select Sport Category"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              {sports.map((sport) => (
                <SelectItem key={sport.key} value={sport.key}>
                  {sport.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium mb-1 block">League</label>
          <Select
            value={selectedLeague}
            onValueChange={handleLeagueChange}
            disabled={isLoading || selectedSport === "all"}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  isLoading
                    ? "Loading..."
                    : selectedSport === "all"
                      ? "Select Sport First"
                      : "Select League"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leagues</SelectItem>
              {leagues.map((league) => (
                <SelectItem key={league.key} value={league.key}>
                  {league.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium mb-1 block">Market Type</label>
          <Select value={selectedMarket} onValueChange={handleMarketChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Market" />
            </SelectTrigger>
            <SelectContent>
              {markets.map((market) => (
                <SelectItem key={market.id} value={market.id}>
                  {market.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 w-full justify-start md:justify-end">
        <Button
          variant={sortBy === "profit" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortChange("profit")}
          className="flex items-center gap-1"
        >
          <Percent className="h-4 w-4" />
          Profit %
        </Button>
        <Button
          variant={sortBy === "sport" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortChange("sport")}
          className="flex items-center gap-1"
        >
          <ArrowUpDown className="h-4 w-4" />
          Sport
        </Button>
        <Button
          variant={sortBy === "time" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortChange("time")}
          className="flex items-center gap-1"
        >
          <Clock className="h-4 w-4" />
          Game Time
        </Button>
      </div>
    </div>
  );
};

export default FilterControls;
