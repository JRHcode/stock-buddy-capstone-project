'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';
import InfoTooltip from '@/components/ui/InfoTooltip';
import Button from '@/components/ui/Button';

// Generic stock interface for the dropdown
interface GenericStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
}

interface DropdownWatchlistProps {
  title: string;
  tooltip: string;
  stocks: GenericStock[];
  isLoading?: boolean;
  onAddToWatchlist?: (stock: GenericStock) => void;
  onAddToHoldings?: (stock: GenericStock) => void;
  icon?: string; // Optional emoji or icon to display next to title
}

export default function DropdownWatchlist({ 
  title, 
  tooltip, 
  stocks, 
  isLoading = false,
  onAddToWatchlist,
  onAddToHoldings,
  icon
}: DropdownWatchlistProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1000000000000) { // 1 trillion
      return `$${(value / 1000000000000).toFixed(1)}T`;
    } else if (value >= 1000000000) { // 1 billion  
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) { // 1 million
      return `$${(value / 1000000).toFixed(1)}M`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };

  const formatChange = (change: number, changePercent: number) => {
    // Handle null/undefined values
    const safeChange = change || 0;
    const safeChangePercent = changePercent || 0;
    
    const isPositive = safeChange >= 0;
    const sign = isPositive ? '+' : '';
    return {
      change: `${sign}${formatCurrency(safeChange)}`,
      percent: `${sign}${safeChangePercent.toFixed(2)}%`,
      isPositive
    };
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg border dark:border-dark-border transition-colors">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
      >
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary transition-colors flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </h2>
          <InfoTooltip content={tooltip} position="top" />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-dark-text-secondary">
            {stocks.length} stocks
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500 dark:text-dark-text-secondary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 dark:text-dark-text-secondary" />
          )}
        </div>
      </button>

      {/* Dropdown Content */}
      {isExpanded && (
        <div className="border-t dark:border-dark-border">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500 dark:text-dark-text-secondary">Loading stocks...</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {stocks.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className="p-4 border-b dark:border-dark-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900 dark:text-dark-text-primary">
                              {String(stock.symbol)}
                            </span>
                            {(stock.marketCap && stock.marketCap > 0) ? (
                              <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                                {formatMarketCap(stock.marketCap)}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-dark-text-secondary truncate max-w-48">
                            {String(stock.name)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Price and Change */}
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-dark-text-primary">
                          {formatCurrency(stock.price)}
                        </div>
                        <div className={`text-sm flex items-center justify-end space-x-1 ${
                          formatChange(stock.change, stock.changePercent).isPositive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatChange(stock.change, stock.changePercent).isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>
                            {formatChange(stock.change, stock.changePercent).change} (
                            {formatChange(stock.change, stock.changePercent).percent})
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      {(onAddToWatchlist || onAddToHoldings) && (
                        <div className="flex flex-col space-y-2">
                          {onAddToWatchlist && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToWatchlist(stock);
                              }}
                              className="text-xs px-2 py-1"
                            >
                              + Watchlist
                            </Button>
                          )}
                          {onAddToHoldings && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToHoldings(stock);
                              }}
                              className="text-xs px-2 py-1"
                            >
                              + Holdings
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}