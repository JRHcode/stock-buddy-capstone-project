'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext'; // Import auth context

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  purchaseDate: string;
}

interface PortfolioContextType {
  holdings: PortfolioHolding[];
  addHolding: (holding: { symbol: string; name: string; shares: number; avgPrice: number }) => Promise<void>;
  removeHolding: (id: string) => void;
  updateHoldingPrice: (symbol: string, newPrice: number) => void;
  getTotalValue: () => number;
  getTotalGainLoss: () => number;
  isLoading: boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthContext(); // Get current user from auth

  // Generate a user-specific storage key
  const getStorageKey = () => {
    return user ? `stockBuddyPortfolio_${user.id}` : 'stockBuddyPortfolio_guest';
  };

  // Load portfolio from localStorage on mount or when user changes
  useEffect(() => {
    if (user) {
      const storageKey = getStorageKey();
      const savedPortfolio = localStorage.getItem(storageKey);
      if (savedPortfolio) {
        try {
          setHoldings(JSON.parse(savedPortfolio));
        } catch (error) {
          console.error('Error loading portfolio from localStorage:', error);
        }
      } else {
        setHoldings([]); // Clear holdings for new user
      }
    } else {
      setHoldings([]); // Clear holdings when user logs out
    }
  }, [user]); // Reload when user changes

  // Save portfolio to localStorage whenever it changes or user changes
  useEffect(() => {
    if (user) {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(holdings));
    }
  }, [holdings, user]); // Save when holdings or user changes

  const addHolding = async (holding: { symbol: string; name: string; shares: number; avgPrice: number }) => {
    if (!user) {
      throw new Error('You must be logged in to add holdings');
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock current price
      const currentPrice = holding.avgPrice + (Math.random() - 0.5) * 20;
      const totalValue = holding.shares * currentPrice;
      const gainLoss = totalValue - (holding.shares * holding.avgPrice);
      const gainLossPercent = (gainLoss / (holding.shares * holding.avgPrice)) * 100;

      const newHolding: PortfolioHolding = {
        id: Date.now().toString(),
        symbol: holding.symbol.toUpperCase(),
        name: holding.name,
        shares: holding.shares,
        avgPrice: holding.avgPrice,
        currentPrice: currentPrice,
        totalValue: totalValue,
        gainLoss: gainLoss,
        gainLossPercent: gainLossPercent,
        purchaseDate: new Date().toISOString().split('T')[0]
      };

      setHoldings(prev => [newHolding, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeHolding = (id: string) => {
    if (!user) return;
    setHoldings(prev => prev.filter(holding => holding.id !== id));
  };

  const updateHoldingPrice = (symbol: string, newPrice: number) => {
    if (!user) return;
    setHoldings(prev => prev.map(holding => {
      if (holding.symbol === symbol) {
        const totalValue = holding.shares * newPrice;
        const gainLoss = totalValue - (holding.shares * holding.avgPrice);
        const gainLossPercent = (gainLoss / (holding.shares * holding.avgPrice)) * 100;
        
        return {
          ...holding,
          currentPrice: newPrice,
          totalValue: totalValue,
          gainLoss: gainLoss,
          gainLossPercent: gainLossPercent
        };
      }
      return holding;
    }));
  };

  const getTotalValue = () => {
    return holdings.reduce((total, holding) => total + holding.totalValue, 0);
  };

  const getTotalGainLoss = () => {
    return holdings.reduce((total, holding) => total + holding.gainLoss, 0);
  };

  return (
    <PortfolioContext.Provider value={{
      holdings,
      addHolding,
      removeHolding,
      updateHoldingPrice,
      getTotalValue,
      getTotalGainLoss,
      isLoading
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}