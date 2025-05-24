import React, { createContext, useReducer, ReactNode } from 'react';
import { BettingState, BettingAction } from './types';
import { initialState, bettingReducer } from './reducer';

// Types
type SortOption = 'profit' | 'sport' | 'time';


// Context
interface BettingContextType {
  state: BettingState;
  dispatch: React.Dispatch<BettingAction>;
}

export const BettingContext = createContext<BettingContextType | undefined>(undefined);

// Provider
export const BettingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bettingReducer, initialState);

  return (
    <BettingContext.Provider value={{ state, dispatch }}>
      {children}
    </BettingContext.Provider>
  );
};