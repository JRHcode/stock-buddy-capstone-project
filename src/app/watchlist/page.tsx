'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Navigation from '@/components/layout/Navigation';

export default function WatchlistPage() {
  const { user } = useAuth();
  const { isLoading } = useRequireAuth();
  const { watchlist, addToWatchlist, removeFromWatchlist, isLoading: watchlistLoading } = useWatchlist();
  
  const [newSymbol, setNewSymbol] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;

    setIsAdding(true);
    
    try {
      // Create mock stock data for the symbol
      const mockStock = {
        symbol: newSymbol.toUpperCase(),
        name: `${newSymbol.toUpperCase()} Company`,
        price: Math.random() * 200 + 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5
      };
      
      await addToWatchlist(mockStock);
      setNewSymbol('');
      
    } catch (err) {
      console.error('Error adding stock:', err);
      alert(err instanceof Error ? err.message : 'Failed to add stock to watchlist');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveStock = (id: string) => {
    removeFromWatchlist(id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Watchlist</h1>
            <p className="text-gray-600">Track your favorite stocks and monitor their performance</p>
          </div>

          {/* Add Stock Form */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Stock to Watchlist</h2>
            <form onSubmit={handleAddStock} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  placeholder="Enter stock symbol (e.g., AAPL, GOOGL)"
                  className="w-full"
                />
              </div>
              <Button 
                type="submit" 
                isLoading={isAdding || watchlistLoading}
                disabled={!newSymbol.trim()}
              >
                Add Stock
              </Button>
            </form>
          </div>

          {/* Watchlist */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Stocks ({watchlist.length})
              </h2>
            </div>
            
            {watchlist.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">👁️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stocks in watchlist</h3>
                <p className="text-gray-600">Add some stocks to start tracking their performance</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {watchlist.map((stock) => (
                  <div key={stock.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{stock.symbol}</h3>
                            <p className="text-sm text-gray-600">{stock.name}</p>
                            <p className="text-xs text-gray-500">Added {stock.addedAt}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(stock.price)}</p>
                          <p className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)} 
                            ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                          </p>
                        </div>
                        
                        <Button
                          onClick={() => handleRemoveStock(stock.id)}
                          variant="secondary"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}