import { useContext } from 'react';
import { BettingContext } from './BettingContext';

export const useBettingContext = () => {
  const context = useContext(BettingContext);
  if (context === undefined) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
}; 