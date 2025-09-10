'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext'; // Import auth context

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
  const { user, token } = useAuthContext(); // Get current user and token from auth

  // Generate a user-specific storage key
  const getStorageKey = () => {
    return user ? `stockBuddyWatchlist_${user.id}` : 'stockBuddyWatchlist_guest';
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

  // Load watchlist from database (with localStorage fallback)
  const loadWatchlistFromDatabase = async () => {
    if (!user || !token) {
      setWatchlist([]);
      return;
    }

    try {
      const response = await makeAuthenticatedRequest('/api/watchlist');
      
      if (response.ok) {
        const data = await response.json();
        const dbStocks = (data.stocks || []).map((stock: any) => ({
          id: stock._id || stock.id || `${stock.symbol}_${Date.now()}`,
          symbol: stock.symbol,
          name: stock.name,
          price: stock.lastPrice || stock.price || 0,
          change: stock.change || 0,
          changePercent: stock.changePercent || 0,
          addedAt: stock.addedAt ? new Date(stock.addedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }));
        
        console.log('Loaded watchlist from database:', dbStocks);
        setWatchlist(dbStocks);
        
        // Update localStorage as backup
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(dbStocks));
      } else {
        throw new Error('Failed to load watchlist from database');
      }
    } catch (error) {
      console.error('Error loading watchlist from database, falling back to localStorage:', error);
      
      // Fall back to localStorage
      const storageKey = getStorageKey();
      const savedWatchlist = localStorage.getItem(storageKey);
      if (savedWatchlist) {
        try {
          const parsed = JSON.parse(savedWatchlist);
          console.log('Loaded watchlist from localStorage (fallback):', parsed);
          setWatchlist(parsed);
        } catch (parseError) {
          console.error('Error parsing localStorage watchlist:', parseError);
          localStorage.removeItem(storageKey);
          setWatchlist([]);
        }
      } else {
        setWatchlist([]);
        console.log('No saved watchlist found for user');
      }
    }
  };

  // Save watchlist to database
  const saveWatchlistToDatabase = async (updatedWatchlist: WatchlistStock[]) => {
    if (!user || !token) return;

    try {
      const stocksForDb = updatedWatchlist.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        lastPrice: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        addedAt: new Date(stock.addedAt)
      }));

      await makeAuthenticatedRequest('/api/watchlist', {
        method: 'PUT',
        body: JSON.stringify({ stocks: stocksForDb }),
      });

      console.log('Watchlist saved to database successfully');
    } catch (error) {
      console.error('Error saving watchlist to database:', error);
      // Continue with localStorage as fallback
    }
  };

  // Load watchlist on mount or when user changes
  useEffect(() => {
    if (user && token) {
      loadWatchlistFromDatabase();
    } else {
      setWatchlist([]); // Clear watchlist when user logs out
      console.log('User logged out, clearing watchlist');
    }
  }, [user, token]); // Reload when user or token changes

  // Save watchlist to localStorage and database whenever it changes
  useEffect(() => {
    if (user && watchlist.length >= 0) { // Allow empty arrays to be saved
      const storageKey = getStorageKey();
      console.log('Saving watchlist to localStorage:', watchlist);
      localStorage.setItem(storageKey, JSON.stringify(watchlist));
      
      // Also save to database (async, don't wait)
      saveWatchlistToDatabase(watchlist);
    }
  }, [watchlist, user]); // Save when watchlist or user changes

  const addToWatchlist = async (stock: { symbol: string; name: string; price: number; change: number; changePercent: number }) => {
    if (!user) {
      throw new Error('You must be logged in to add to watchlist');
    }

    setIsLoading(true);
    
    try {
      // Check if stock is already in watchlist
      if (isInWatchlist(stock.symbol)) {
        throw new Error(`${stock.symbol} is already in your watchlist`);
      }

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
      
      // Try to add to database first
      try {
        if (token) {
          await makeAuthenticatedRequest('/api/watchlist', {
            method: 'POST',
            body: JSON.stringify({
              symbol: newStock.symbol,
              name: newStock.name,
              lastPrice: newStock.price,
              change: newStock.change,
              changePercent: newStock.changePercent
            }),
          });
          console.log('Stock added to database successfully');
        }
      } catch (dbError) {
        console.error('Error adding to database, continuing with local storage:', dbError);
        // Continue with local addition even if database fails
      }

      // Update local state
      setWatchlist(prev => [newStock, ...prev]);
      
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = async (id: string) => {
    if (!user) return;
    
    console.log('Removing stock with id:', id);
    console.log('Current watchlist:', watchlist);
    
    // Find the stock to get its symbol for database deletion
    const stockToRemove = watchlist.find(stock => stock.id === id);
    
    if (stockToRemove && token) {
      try {
        await makeAuthenticatedRequest(`/api/watchlist/${stockToRemove.symbol}`, {
          method: 'DELETE',
        });
        console.log('Stock removed from database successfully');
      } catch (error) {
        console.error('Error removing from database:', error);
        // Continue with local removal even if database fails
      }
    }
    
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