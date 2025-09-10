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
  const { user, token } = useAuthContext(); // Get current user and token from auth

  // Generate a user-specific storage key
  const getStorageKey = () => {
    return user ? `stockBuddyPortfolio_${user.id}` : 'stockBuddyPortfolio_guest';
  };

  // Helper function to make authenticated API requests
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('No authentication token');
    }

    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  // Helper function to calculate current price and metrics
  const calculateHoldingMetrics = (holding: any, mockCurrentPrice?: number) => {
    // Generate mock current price if not provided
    const currentPrice = mockCurrentPrice || holding.avgPrice + (Math.random() - 0.5) * 20;
    const totalValue = holding.shares * currentPrice;
    const gainLoss = totalValue - (holding.shares * holding.avgPrice);
    const gainLossPercent = (gainLoss / (holding.shares * holding.avgPrice)) * 100;

    return {
      ...holding,
      currentPrice,
      totalValue,
      gainLoss,
      gainLossPercent
    };
  };

  // Load portfolio from database (with localStorage fallback)
  const loadPortfolioFromDatabase = async () => {
    if (!user || !token) {
      setHoldings([]);
      return;
    }

    try {
      const response = await makeAuthenticatedRequest('/api/portfolio');
      
      if (response.ok) {
        const data = await response.json();
        const dbHoldings = (data.holdings || []).map((holding: any) => {
          const holdingWithMetrics = calculateHoldingMetrics({
            id: holding._id || holding.id || `${holding.symbol}_${Date.now()}`,
            symbol: holding.symbol,
            name: holding.name,
            shares: holding.shares,
            avgPrice: holding.avgPrice,
            purchaseDate: holding.purchaseDate || new Date().toISOString().split('T')[0]
          });
          
          return holdingWithMetrics;
        });
        
        console.log('Loaded portfolio from database:', dbHoldings);
        setHoldings(dbHoldings);
        
        // Update localStorage as backup
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(dbHoldings));
      } else {
        throw new Error('Failed to load portfolio from database');
      }
    } catch (error) {
      console.error('Error loading portfolio from database, falling back to localStorage:', error);
      
      // Fall back to localStorage
      const storageKey = getStorageKey();
      const savedPortfolio = localStorage.getItem(storageKey);
      if (savedPortfolio) {
        try {
          const parsed = JSON.parse(savedPortfolio);
          console.log('Loaded portfolio from localStorage (fallback):', parsed);
          setHoldings(parsed);
        } catch (parseError) {
          console.error('Error parsing localStorage portfolio:', parseError);
          localStorage.removeItem(storageKey);
          setHoldings([]);
        }
      } else {
        setHoldings([]);
        console.log('No saved portfolio found for user');
      }
    }
  };

  // Save portfolio to database
  const savePortfolioToDatabase = async (updatedHoldings: PortfolioHolding[]) => {
    if (!user || !token) return;

    try {
      const holdingsForDb = updatedHoldings.map(holding => ({
        id: holding.id,
        symbol: holding.symbol,
        name: holding.name,
        shares: holding.shares,
        avgPrice: holding.avgPrice,
        purchaseDate: holding.purchaseDate
      }));

      await makeAuthenticatedRequest('/api/portfolio', {
        method: 'PUT',
        body: JSON.stringify({ holdings: holdingsForDb }),
      });

      console.log('Portfolio saved to database successfully');
    } catch (error) {
      console.error('Error saving portfolio to database:', error);
      // Continue with localStorage as fallback
    }
  };

  // Load portfolio on mount or when user changes
  useEffect(() => {
    if (user && token) {
      loadPortfolioFromDatabase();
    } else {
      setHoldings([]); // Clear portfolio when user logs out
      console.log('User logged out, clearing portfolio');
    }
  }, [user, token]); // Reload when user or token changes

  // Save portfolio to localStorage and database whenever it changes
  useEffect(() => {
    if (user && holdings.length >= 0) { // Allow empty arrays to be saved
      const storageKey = getStorageKey();
      console.log('Saving portfolio to localStorage:', holdings);
      localStorage.setItem(storageKey, JSON.stringify(holdings));
      
      // Also save to database (async, don't wait)
      savePortfolioToDatabase(holdings);
    }
  }, [holdings, user]); // Save when holdings or user changes

  const addHolding = async (holding: { symbol: string; name: string; shares: number; avgPrice: number }) => {
    if (!user) {
      throw new Error('You must be logged in to add holdings');
    }

    setIsLoading(true);
    
    try {
      // Check if holding already exists in portfolio
      const existingHolding = holdings.find(h => h.symbol.toUpperCase() === holding.symbol.toUpperCase());
      if (existingHolding) {
        throw new Error(`${holding.symbol} is already in your portfolio`);
      }

      // Try to add to database first
      try {
        if (token) {
          await makeAuthenticatedRequest('/api/portfolio', {
            method: 'POST',
            body: JSON.stringify({
              symbol: holding.symbol.toUpperCase(),
              name: holding.name,
              shares: holding.shares,
              avgPrice: holding.avgPrice
            }),
          });
          console.log('Holding added to database successfully');
        }
      } catch (dbError) {
        console.error('Error adding to database, continuing with local storage:', dbError);
        // Continue with local addition even if database fails
      }

      // Calculate metrics for the new holding
      const newHolding = calculateHoldingMetrics({
        id: Date.now().toString(),
        symbol: holding.symbol.toUpperCase(),
        name: holding.name,
        shares: holding.shares,
        avgPrice: holding.avgPrice,
        purchaseDate: new Date().toISOString().split('T')[0]
      });

      console.log('Adding holding to portfolio:', newHolding);
      
      // Update local state
      setHoldings(prev => [newHolding, ...prev]);
      
    } finally {
      setIsLoading(false);
    }
  };

  const removeHolding = async (id: string) => {
    if (!user) return;
    
    console.log('Removing holding with id:', id);
    console.log('Current portfolio:', holdings);
    
    // Try to remove from database first
    if (token) {
      try {
        await makeAuthenticatedRequest(`/api/portfolio?id=${id}`, {
          method: 'DELETE',
        });
        console.log('Holding removed from database successfully');
      } catch (error) {
        console.error('Error removing from database:', error);
        // Continue with local removal even if database fails
      }
    }
    
    setHoldings(prev => {
      const updated = prev.filter(holding => holding.id !== id);
      console.log('Updated portfolio after removal:', updated);
      return updated;
    });
  };

  const updateHoldingPrice = (symbol: string, newPrice: number) => {
    if (!user) return;
    setHoldings(prev => prev.map(holding => {
      if (holding.symbol === symbol) {
        return calculateHoldingMetrics(holding, newPrice);
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