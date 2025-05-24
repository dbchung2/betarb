import { SportType } from "@/types/odds";
export type SortOption = 'profit' | 'sport' | 'time';

export interface BettingState {
  sportsGroup: Record<string, SportType[]>;
  filter: {
    selectedSport: string | null;
    selectedLeague: string | null;
    selectedMarket: string;
  };
  sortOption: SortOption;
}

export type BettingAction =
  | { type: 'SET_SPORTS_GROUP'; payload: Record<string, SportType[]> }
  | { type: 'SET_SPORT'; payload: string }
  | { type: 'SET_LEAGUE'; payload: string }
  | { type: 'SET_MARKET'; payload: string }
  | { type: 'SET_SORT'; payload: SortOption }; 