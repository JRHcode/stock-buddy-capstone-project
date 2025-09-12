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

  // Fetch real-time prices for watchlist stocks
  const fetchRealTimePrices = async (stocks: WatchlistStock[]): Promise<WatchlistStock[]> => {
    if (stocks.length === 0) return stocks;

    try {
      const symbols = stocks.map(s => s.symbol);
      console.log('Fetching real-time prices for:', symbols);

      const response = await fetch('/api/stocks/batch-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch real-time prices');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Update stocks with real prices
        return stocks.map(stock => {
          const realData = result.data[stock.symbol];
          if (realData) {
            return {
              ...stock,
              price: realData.price,
              change: realData.change,
              changePercent: realData.changePercent
            };
          }
          return stock;
        });
      }
    } catch (error) {
      console.error('Error fetching real-time prices:', error);
    }

    return stocks;
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
    console.log('loadWatchlistFromDatabase called with user:', !!user, 'token:', !!token);
    
    if (!user || !token) {
      console.log('No user or token, setting empty watchlist');
      setWatchlist([]);
      return;
    }

    try {
      console.log('Making GET request to /api/watchlist');
      const response = await makeAuthenticatedRequest('/api/watchlist');
      console.log('GET watchlist response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('GET watchlist response data:', data);
        
        const dbStocks = (data.stocks || []).map((stock: any) => ({
          id: stock.id || stock._id || `${stock.symbol}_${Date.now()}`,
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price || 0,
          change: stock.change || 0,
          changePercent: stock.changePercent || 0,
          addedAt: stock.addedAt ? new Date(stock.addedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }));
        
        console.log('Processed watchlist stocks:', dbStocks);
        
        // Fetch real-time prices for the stocks
        const stocksWithRealPrices = await fetchRealTimePrices(dbStocks);
        
        console.log('Setting watchlist with', stocksWithRealPrices.length, 'stocks with real prices');
        setWatchlist(stocksWithRealPrices);
        
        // Update localStorage as backup
        // const storageKey = getStorageKey();
        // localStorage.setItem(storageKey, JSON.stringify(dbStocks));
      } else {
        throw new Error('Failed to load watchlist from database');
      }
    } catch (error) {
      console.error('Error loading watchlist from database, falling back to localStorage:', error);
      
      // Fall back to localStorage
      // const storageKey = getStorageKey();
      // const savedWatchlist = localStorage.getItem(storageKey);
      // if (savedWatchlist) {
      //   try {
      //     const parsed = JSON.parse(savedWatchlist);
      //     console.log('Loaded watchlist from localStorage (fallback):', parsed);
      //     setWatchlist(parsed);
      //   } catch (parseError) {
      //     console.error('Error parsing localStorage watchlist:', parseError);
      //     localStorage.removeItem(storageKey);
      //     setWatchlist([]);
      //   }
      // } else {
      //   setWatchlist([]);
      //   console.log('No saved watchlist found for user');
      // }
    }
  };

  // Save watchlist to database
  const saveWatchlistToDatabase = async (updatedWatchlist: WatchlistStock[]) => {
    if (!user || !token) {
      console.log('saveWatchlistToDatabase: No user or token, skipping save');
      return;
    }

    console.log('saveWatchlistToDatabase called with', updatedWatchlist.length, 'stocks');

    try {
      const stocksForDb = updatedWatchlist.map(stock => ({
        id: stock.id,
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        addedAt: new Date(stock.addedAt)
      }));

      console.log('Sending PUT request to /api/watchlist with data:', stocksForDb);

      const response = await makeAuthenticatedRequest('/api/watchlist', {
        method: 'PUT',
        body: JSON.stringify({ stocks: stocksForDb }),
      });

      console.log('PUT watchlist response status:', response.status);
      const responseData = await response.json();
      console.log('PUT watchlist response data:', responseData);

      console.log('Watchlist saved to database successfully');
    } catch (error) {
      console.error('Error saving watchlist to database:', error);
      // Continue with localStorage as fallback
    }
  };

  // Load watchlist on mount or when user changes
  useEffect(() => {
    console.log('WatchlistContext useEffect triggered with user:', !!user, 'token:', !!token);
    console.log('User details:', user ? { id: user.id, email: user.email } : 'null');
    
    if (user && token) {
      console.log('Both user and token present, calling loadWatchlistFromDatabase');
      loadWatchlistFromDatabase();
    } else if (user === null && token === null) {
      // Only clear when explicitly logged out (both user and token are null)
      console.log('Both user and token are null, clearing watchlist');
      setWatchlist([]);
      console.log('User logged out, clearing watchlist');
    } else {
      console.log('User or token missing - user:', !!user, 'token:', !!token);
    }
  }, [user, token]); // Reload when user or token changes

  // Periodically update prices (every 30 seconds)
  useEffect(() => {
    if (watchlist.length === 0) return;

    const updatePrices = async () => {
      console.log('Updating watchlist prices...');
      const updatedStocks = await fetchRealTimePrices(watchlist);
      setWatchlist(updatedStocks);
    };

    // Update immediately on mount
    updatePrices();

    // Then update every 30 seconds
    const interval = setInterval(updatePrices, 30000);

    return () => clearInterval(interval);
  }, [watchlist.length]); // Only re-run if watchlist length changes

  // Save watchlist to localStorage and database whenever it changes
  useEffect(() => {
    if (user && token && watchlist.length >= 0) { // Require both user and token to be present
      // Also save to database (async, don't wait)
      saveWatchlistToDatabase(watchlist);
    }
  }, [watchlist, user, token]); // Save when watchlist, user, or token changes

  const addToWatchlist = async (stock: { symbol: string; name: string; price: number; change: number; changePercent: number }) => {
    console.log('addToWatchlist called with stock:', stock);
    console.log('Current user and token state:', { user: !!user, token: !!token });
    
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
          console.log('Attempting to add stock to database:', {
            symbol: newStock.symbol,
            name: newStock.name,
            price: newStock.price,
            change: newStock.change,
            changePercent: newStock.changePercent
          });
          
          const response = await makeAuthenticatedRequest('/api/watchlist', {
            method: 'POST',
            body: JSON.stringify({
              symbol: newStock.symbol,
              name: newStock.name,
              price: newStock.price,
              change: newStock.change,
              changePercent: newStock.changePercent
            }),
          });
          
          console.log('API response status:', response.status);
          const responseData = await response.json();
          console.log('API response data:', responseData);
          
          if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${responseData.error || 'Unknown error'}`);
          }
          
          console.log('Stock added to database successfully');
        }
      } catch (dbError) {
        console.error('Error adding to database, continuing with local storage:', dbError);
        if (dbError instanceof Error) {
          console.error('Error details:', dbError.message);
        }
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
        await makeAuthenticatedRequest(`/api/watchlist?symbol=${stockToRemove.symbol}`, {
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