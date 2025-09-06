'use client';

import { useState } from 'react';
import { stockApi, StockQuote } from '@/services/stockApi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StockChart from './StockChart';
import { useWatchlist } from '@/contexts/WatchlistContext';

export default function StockSearch() {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { addToWatchlist, isInWatchlist, isLoading: watchlistLoading } = useWatchlist();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setLoading(true);
    setError(null);
    setStockData(null);

    try {
      console.log(`Searching for stock: ${symbol}`);
      const data = await stockApi.getStockQuote(symbol.trim().toUpperCase());
      
      if (data) {
        console.log('Stock data received:', data);
        setStockData(data);
      } else {
        console.log('No data received, using mock data');
        // Create mock data for demonstration with all required properties
        const basePrice = Math.random() * 200 + 50;
        const mockData: StockQuote = {
          symbol: symbol.toUpperCase(),
          name: `${symbol.toUpperCase()} Company`,
          price: basePrice,
          change: (Math.random() - 0.5) * 10,
          changesPercentage: (Math.random() - 0.5) * 5,
          volume: Math.floor(Math.random() * 10000000),
          marketCap: Math.floor(Math.random() * 1000000000000),
          pe: Math.random() * 30 + 5,
          dayHigh: basePrice + Math.random() * 10,
          dayLow: basePrice - Math.random() * 10,
          open: basePrice + (Math.random() - 0.5) * 5,
          previousClose: basePrice - (Math.random() - 0.5) * 5,
          yearHigh: basePrice + Math.random() * 50,
          yearLow: basePrice - Math.random() * 30,
          priceAvg50: basePrice + (Math.random() - 0.5) * 20,
          priceAvg200: basePrice + (Math.random() - 0.5) * 40,
          eps: Math.random() * 10,
          sharesOutstanding: Math.floor(Math.random() * 1000000000),
          exchange: 'NASDAQ',
          avgVolume: Math.floor(Math.random() * 5000000),
          earningsAnnouncement: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          timestamp: Math.floor(Date.now() / 1000)
        };
        setStockData(mockData);
        setError('Using mock data - real stock data not available');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!stockData) return;

    try {
      await addToWatchlist({
        symbol: stockData.symbol,
        name: stockData.name,
        price: stockData.price,
        change: stockData.change,
        changePercent: stockData.changesPercentage
      });
      
      // Show success message
      alert(`${stockData.symbol} has been added to your watchlist!`);
      
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      alert(err instanceof Error ? err.message : 'Failed to add to watchlist. Please try again.');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    }
    return value.toLocaleString();
  };

  // Check if current stock is already in watchlist
  const isCurrentStockInWatchlist = stockData ? isInWatchlist(stockData.symbol) : false;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Enter stock symbol (e.g., AAPL, GOOGL, TSLA)"
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            isLoading={loading}
            disabled={!symbol.trim()}
          >
            Search
          </Button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stock Data Display */}
      {stockData && (
        <div className="space-y-6">
          {/* Stock Header with Add to Watchlist Button */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{stockData.symbol}</h2>
                <p className="text-gray-600">{stockData.name}</p>
              </div>
              <Button
                onClick={handleAddToWatchlist}
                isLoading={watchlistLoading}
                disabled={isCurrentStockInWatchlist}
                className="flex items-center gap-2"
                variant={isCurrentStockInWatchlist ? "secondary" : "primary"}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {isCurrentStockInWatchlist 
                  ? 'Already in Watchlist' 
                  : watchlistLoading 
                    ? 'Adding...' 
                    : 'Add to Watchlist'
                }
              </Button>
            </div>

            {/* Price Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Current Price</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stockData.price)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Change</p>
                <p className={`text-lg font-semibold ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stockData.change >= 0 ? '+' : ''}{formatCurrency(stockData.change)} 
                  ({stockData.changesPercentage >= 0 ? '+' : ''}{stockData.changesPercentage.toFixed(2)}%)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Volume</p>
                <p className="text-lg font-semibold text-gray-900">{formatNumber(stockData.volume)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Market Cap</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(stockData.marketCap)}</p>
              </div>
            </div>
          </div>

          {/* Stock Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <StockChart symbol={stockData.symbol} />
          </div>
        </div>
      )}
    </div>
  );
}