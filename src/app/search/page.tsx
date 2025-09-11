
'use client';

import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { stockApi } from '@/services/stockApi';

interface SearchResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
}

export default function SearchPage() {
  const { isLoading } = useRequireAuth();
  const { addToWatchlist, watchlist } = useWatchlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    try {
      // Use Yahoo Finance API to search for stocks
      const searchResults = await stockApi.searchStocks(searchQuery.trim());
      
      // Get quotes for each search result to populate price data
      const resultsWithPrices = await Promise.all(
        searchResults.slice(0, 5).map(async (result) => {
          try {
            const quote = await stockApi.getStockQuote(result.symbol);
            return {
              symbol: result.symbol,
              name: result.name,
              price: quote?.price || 0,
              change: quote?.change || 0,
              changePercent: quote?.changesPercentage || 0,
              volume: quote?.volume || 0,
              marketCap: quote?.marketCap ? formatMarketCap(quote.marketCap) : 'N/A'
            };
          } catch (error) {
            console.error(`Error fetching quote for ${result.symbol}:`, error);
            return {
              symbol: result.symbol,
              name: result.name,
              price: 0,
              change: 0,
              changePercent: 0,
              volume: 0,
              marketCap: 'N/A'
            };
          }
        })
      );

      setSearchResults(resultsWithPrices);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToWatchlist = async (stock: SearchResult) => {
    try {
      await addToWatchlist({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent
      });
      alert(`${stock.symbol} added to watchlist!`);
    } catch (error) {
      alert('Failed to add to watchlist. Please try again.');
    }
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) {
      return `${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    }
    return value.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-8 transition-colors">
            Search Stocks
          </h1>

          {/* Search Form */}
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg p-6 mb-8 border dark:border-dark-border transition-colors">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter stock symbol or company name (e.g., AAPL, Tesla)"
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-8"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg border dark:border-dark-border transition-colors">
              <div className="p-6 border-b dark:border-dark-border">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary transition-colors">
                  Search Results
                </h2>
              </div>
              
              <div className="divide-y dark:divide-dark-border">
                {searchResults.map((stock) => (
                  <div key={stock.symbol} className="p-6 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary transition-colors">
                            {stock.symbol}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-dark-text-secondary transition-colors">
                            {stock.name}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-dark-text-secondary transition-colors">Price:</span>
                            <p className="font-medium text-gray-900 dark:text-dark-text-primary transition-colors">
                              {formatCurrency(stock.price)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-dark-text-secondary transition-colors">Change:</span>
                            <p className={`font-medium ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'} transition-colors`}>
                              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-dark-text-secondary transition-colors">Volume:</span>
                            <p className="font-medium text-gray-900 dark:text-dark-text-primary transition-colors">
                              {formatNumber(stock.volume)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-dark-text-secondary transition-colors">Market Cap:</span>
                            <p className="font-medium text-gray-900 dark:text-dark-text-primary transition-colors">
                              {stock.marketCap}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAddToWatchlist(stock)}
                          disabled={isInWatchlist(stock.symbol)}
                          variant={isInWatchlist(stock.symbol) ? 'secondary' : 'primary'}
                          size="sm"
                        >
                          {isInWatchlist(stock.symbol) ? 'Added' : 'Add to Watchlist'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
