'use client';

import { useState, useEffect, useCallback } from 'react';
import { stockApi, StockSearchResult, FREE_PLAN_SYMBOLS } from '@/services/stockApi';
import StockChart from './StockChart';

export default function StockSearch() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showChart, setShowChart] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 1) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await stockApi.searchStocks(searchQuery);
        setSearchResults(results.slice(0, 10)); // Limit to 10 results
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleStockSelect = async (stock: StockSearchResult) => {
    setIsLoadingDetails(true);
    setShowChart(false);
    try {
      const details = await stockApi.getStockQuote(stock.symbol);
      setSelectedStock(details);
      setQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error fetching stock details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    
    if (num >= 1e12) {
      return `${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `${(num / 1e3).toFixed(2)}K`;
    } else {
      return `${num.toFixed(2)}`;
    }
  };

  const formatPercentage = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  const formatLargeNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Search</h1>
        <p className="text-gray-600">Search for stocks and view detailed information</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for stocks (e.g., AAPL, Tesla, Microsoft)..."
            className="w-full px-4 py-3 pl-10 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {(searchResults.length > 0 || isSearching) && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="px-4 py-3 text-gray-500">Searching...</div>
            ) : (
              searchResults.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleStockSelect(stock)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">{stock.symbol}</div>
                      <div className="text-sm text-gray-600 truncate">{stock.name}</div>
                    </div>
                    <div className="text-sm text-gray-500">{stock.exchangeShortName}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoadingDetails && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Stock Details */}
      {selectedStock && !isLoadingDetails && (
        <div className="space-y-6">
          {/* Stock Header */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                {selectedStock.image && (
                  <img 
                    src={selectedStock.image} 
                    alt={selectedStock.name}
                    className="w-16 h-16 rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedStock.name}</h2>
                  <p className="text-lg text-gray-600">{selectedStock.symbol}</p>
                  <p className="text-sm text-gray-500">{selectedStock.exchange}</p>
                </div>
              </div>
              
              {/* Chart Toggle Button */}
              {selectedStock.hasHistoricalData && (
                <button
                  onClick={() => setShowChart(!showChart)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {showChart ? 'Hide Chart' : 'Show Chart'}
                </button>
              )}
            </div>

            {/* Price Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Current Price</div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(selectedStock.price)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Change</div>
                <div className={`text-2xl font-bold ${selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatNumber(selectedStock.change)}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Change %</div>
                <div className={`text-2xl font-bold ${selectedStock.changesPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(selectedStock.changesPercentage)}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Market Cap</div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(selectedStock.marketCap)}</div>
              </div>
            </div>

            {/* Chart availability notice */}
            {!selectedStock.hasHistoricalData && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-yellow-800">
                    Historical chart data is not available for {selectedStock.symbol} on the free plan. 
                    Available symbols: {FREE_PLAN_SYMBOLS.slice(0, 10).join(', ')}...
                  </span>
                </div>
              </div>
            )}

            {/* Company Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Company Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Industry:</span>
                    <span className="text-gray-900">{selectedStock.industry || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sector:</span>
                    <span className="text-gray-900">{selectedStock.sector || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Country:</span>
                    <span className="text-gray-900">{selectedStock.country || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="text-gray-900">{selectedStock.city || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">State:</span>
                    <span className="text-gray-900">{selectedStock.state || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CEO:</span>
                    <span className="text-gray-900">{selectedStock.ceo || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Full-Time Employees:</span>
                    <span className="text-gray-900">{formatLargeNumber(selectedStock.fullTimeEmployees)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volume:</span>
                    <span className="text-gray-900">{formatLargeNumber(selectedStock.volume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Beta:</span>
                    <span className="text-gray-900">{selectedStock.beta ? selectedStock.beta.toFixed(2) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Dividend:</span>
                    <span className="text-gray-900">{formatNumber(selectedStock.lastDiv)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">52 Week Range:</span>
                    <span className="text-gray-900">{selectedStock.range || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">DCF:</span>
                    <span className="text-gray-900">{formatNumber(selectedStock.dcf)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">DCF Difference:</span>
                    <span className="text-gray-900">{selectedStock.dcfDiff ? `${selectedStock.dcfDiff.toFixed(2)}%` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          {showChart && selectedStock.hasHistoricalData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Historical Chart</h3>
              <StockChart symbol={selectedStock.symbol} />
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!selectedStock && !isLoadingDetails && query.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Search for stocks</h3>
          <p className="text-gray-600">Enter a company name or stock symbol to get started</p>
        </div>
      )}
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => func(...args), wait);
  };
}
