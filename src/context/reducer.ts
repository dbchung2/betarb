import { BettingState, BettingAction } from './types';
import { MARKETS } from '@/const';
export const initialState: BettingState = {
  sportsGroup: {},
  filter: {
    selectedSport: null,
    selectedLeague: null,
    selectedMarket: MARKETS[0].id,
  },
  sortOption: 'profit',
};

export const bettingReducer = (state: BettingState, action: BettingAction): BettingState => {
  switch (action.type) {
    case 'SET_SPORTS_GROUP':
      const sportsGroup = action.payload;
      const listOfSports = Object.keys(sportsGroup);
      const firstSport = listOfSports[0];
      const firstLeague = sportsGroup[firstSport][0].key;
      return { ...state, sportsGroup: action.payload, filter: { ...state.filter, selectedSport: firstSport, selectedLeague: firstLeague } };
    case 'SET_SPORT':
      return { ...state, filter: { ...state.filter, selectedSport: action.payload } };
    case 'SET_LEAGUE':
      return { ...state, filter: { ...state.filter, selectedLeague: action.payload } };
    case 'SET_MARKET':
      return { ...state, filter: { ...state.filter, selectedMarket: action.payload } };
    case 'SET_SORT':
      return { ...state, sortOption: action.payload };
    default:
      return state;
  }
}; 