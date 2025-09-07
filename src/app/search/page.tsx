
'use client';

import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useWatchlist } from '@/contexts/WatchlistContext';

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
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock search results
    const mockResults: SearchResult[] = [
      {
        symbol: searchQuery.toUpperCase(),
        name: `${searchQuery.toUpperCase()} Company Inc.`,
        price: Math.random() * 200 + 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 10000000),
        marketCap: `${(Math.random() * 500 + 50).toFixed(1)}B`
      },
      {
        symbol: `${searchQuery.toUpperCase()}2`,
        name: `${searchQuery.toUpperCase()} Technologies Ltd.`,
        price: Math.random() * 150 + 30,
        change: (Math.random() - 0.5) * 8,
        changePercent: (Math.random() - 0.5) * 4,
        volume: Math.floor(Math.random() * 8000000),
        marketCap: `${(Math.random() * 300 + 20).toFixed(1)}B`
      }
    ];

    setSearchResults(mockResults);
    setIsSearching(false);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
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
