'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WatchlistStock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  addedAt: string;
}

interface WatchlistContextType {
  watchlist: WatchlistStock[];
  addToWatchlist: (stock: { symbol: string; name: string; price: number; change: number; changePercent: number }) => Promise<void>;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  isLoading: boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('stockBuddyWatchlist');
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (error) {
        console.error('Error loading watchlist from localStorage:', error);
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('stockBuddyWatchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = async (stock: { symbol: string; name: string; price: number; change: number; changePercent: number }) => {
    setIsLoading(true);
    
    try {
      // Check if stock is already in watchlist
      if (isInWatchlist(stock.symbol)) {
        throw new Error(`${stock.symbol} is already in your watchlist`);
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newStock: WatchlistStock = {
        id: Date.now().toString(),
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        addedAt: new Date().toISOString().split('T')[0]
      };

      setWatchlist(prev => [newStock, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlist(prev => prev.filter(stock => stock.id !== id));
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(stock => stock.symbol.toLowerCase() === symbol.toLowerCase());
  };

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      isLoading
    }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}