import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { ArrowUpDown, Clock, Percent } from "lucide-react";
import { MARKETS } from "@/const";
import { useBettingContext, setSelectedSport, setSelectedLeague, setSelectedMarket, setSort } from "@/context";

interface FilterControlsProps {
  isSportsLoading: boolean;
}

const FilterControls = ({
  isSportsLoading,
}: FilterControlsProps) => {
  const { state, dispatch } = useBettingContext();
  const markets = MARKETS;
  const { sportsGroup , filter: { selectedSport, selectedLeague } } = state;
  const listOfSports = Object.keys(sportsGroup);
  const listOfLeagues = sportsGroup[selectedSport] || [];

  const handleSportChange = (sportName  : string) => {
    dispatch(setSelectedSport(sportName));
    dispatch(setSelectedLeague(sportsGroup[sportName][0].key));
  };

  const handleLeagueChange = (leagueKey: string) => {
    dispatch(setSelectedLeague(leagueKey));
  };

  const handleMarketChange = (value: string) => {
    dispatch(setSelectedMarket(value));
  };

  const handleSortChange = (value: string) => {
    dispatch(setSort(value as any));
  };

  return (
    <div
      className={`w-full p-4 bg-background border-b flex flex-col gap-4`}
    >
      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium mb-1 block">
            Sport Category
          </label>
          <Select
            value={selectedSport}
            onValueChange={handleSportChange}
            disabled={isSportsLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={isSportsLoading ? "Loading..." : "Select Sport Category"}
              />
            </SelectTrigger>
            <SelectContent>
              {listOfSports.map((sportName) => (
                <SelectItem key={sportName} value={sportName}>
                  {sportName}
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
            disabled={isSportsLoading || selectedSport === "all"}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  isSportsLoading
                    ? "Loading..."
                    : state.filter.selectedSport === "all"
                      ? "Select Sport First"
                      : "Select League"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {listOfLeagues.map((league) => (
                <SelectItem key={league.key} value={league.key}>
                  {league.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium mb-1 block">Market Type</label>
          <Select value={state.filter.selectedMarket} onValueChange={handleMarketChange}>
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
          variant={state.sortOption === "profit" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortChange("profit")}
          className="flex items-center gap-1"
        >
          <Percent className="h-4 w-4" />
          Profit %
        </Button>
        <Button
          variant={state.sortOption === "sport" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortChange("sport")}
          className="flex items-center gap-1"
        >
          <ArrowUpDown className="h-4 w-4" />
          Sport
        </Button>
        <Button
          variant={state.sortOption === "time" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortChange("time")}
          className="flex items-center gap-1"
        >
          <Clock className="h-4 w-4" />
          Time
        </Button>
      </div>
    </div>
  );
};

export default FilterControls;
