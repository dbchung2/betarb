import { SportType } from '../types/odds';
import { BettingAction, SortOption } from './types';

export const setSportsGroup = (sportsGroup: Record<string, SportType[]>): BettingAction => ({
  type: 'SET_SPORTS_GROUP',
  payload: sportsGroup,
});

export const setSelectedSport = (sport: string): BettingAction => ({
  type: 'SET_SPORT',
  payload: sport,
});

export const setSelectedLeague = (league: string): BettingAction => ({
  type: 'SET_LEAGUE',
  payload: league,
});

export const setSelectedMarket = (market: string): BettingAction => ({
  type: 'SET_MARKET',
  payload: market,
});

export const setSort = (sortOption: SortOption): BettingAction => ({
  type: 'SET_SORT',
  payload: sortOption,
});

export const setOddsFormat = (oddsFormat: 'decimal' | 'american'): BettingAction => ({
  type: 'SET_ODDS_FORMAT',
  payload: oddsFormat,
});