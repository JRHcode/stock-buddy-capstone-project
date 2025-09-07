'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WatchlistStock {
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
        const parsed = JSON.parse(savedWatchlist);
        console.log('Loaded watchlist from localStorage:', parsed);
        setWatchlist(parsed);
      } catch (error) {
        console.error('Error loading watchlist from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('stockBuddyWatchlist');
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    console.log('Saving watchlist to localStorage:', watchlist);
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

      console.log('Adding stock to watchlist:', newStock);
      setWatchlist(prev => [newStock, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = (id: string) => {
    console.log('Removing stock with id:', id);
    console.log('Current watchlist:', watchlist);
    
    setWatchlist(prev => {
      const updated = prev.filter(stock => stock.id !== id);
      console.log('Updated watchlist after removal:', updated);
      return updated;
    });
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