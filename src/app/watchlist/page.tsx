'use client';

import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useAuthContext } from '@/contexts/AuthContext';

export default function WatchlistPage() {
  const { user } = useAuthContext();
  const { isLoading } = useRequireAuth();
  const { watchlist, addToWatchlist, removeFromWatchlist, isLoading: watchlistLoading } = useWatchlist();
  const { addHolding, isLoading: portfolioLoading } = usePortfolio();
  
  const [newSymbol, setNewSymbol] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Modal state for adding holdings
  const [showHoldingModal, setShowHoldingModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [holdingForm, setHoldingForm] = useState({
    shares: '',
    price: ''
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
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

  const handleRemoveStock = (id: string, symbol: string) => {
    console.log(`Attempting to remove stock: ${symbol} with id: ${id}`);
    
    // Add confirmation dialog
    if (window.confirm(`Are you sure you want to remove ${symbol} from your watchlist?`)) {
      removeFromWatchlist(id);
      console.log(`Removed ${symbol} from watchlist`);
    }
  };

  const handleAddToHoldings = (stock: any) => {
    setSelectedStock(stock);
    setHoldingForm({ shares: '', price: stock.price.toString() });
    setShowHoldingModal(true);
  };

  const handleHoldingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !holdingForm.shares || !holdingForm.price) return;

    try {
      await addHolding({
        symbol: selectedStock.symbol,
        name: selectedStock.name,
        shares: parseFloat(holdingForm.shares),
        avgPrice: parseFloat(holdingForm.price)
      });
      
      setShowHoldingModal(false);
      setSelectedStock(null);
      setHoldingForm({ shares: '', price: '' });
      
      alert(`Successfully added ${selectedStock.symbol} to your portfolio!`);
    } catch (err) {
      console.error('Error adding holding:', err);
      alert('Failed to add holding. Please try again.');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2 transition-colors">My Watchlist</h1>
            <p className="text-gray-600 dark:text-dark-text-secondary transition-colors">Track your favorite stocks and monitor their performance</p>
          </div>

          {/* Add Stock Form */}
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg p-6 mb-8 border dark:border-dark-border transition-colors">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-4 transition-colors">Add Stock to Watchlist</h2>
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
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg border dark:border-dark-border transition-colors">
            <div className="p-6 border-b dark:border-dark-border">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                Stocks ({watchlist.length})
              </h2>
            </div>
            
            {watchlist.length === 0 ? (
              <div className="p-12 text-center border-b dark:border-dark-border">
                <div className="text-4xl mb-4">👁️</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2 transition-colors">No stocks in watchlist</h3>
                <p className="text-gray-600 dark:text-dark-text-secondary transition-colors">Add some stocks to start tracking their performance</p>
              </div>
            ) : (
              <div className="divide-y dark:divide-dark-border">
                {watchlist.map((stock) => (
                  <div key={stock.id} className="p-6 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">{stock.symbol}</h3>
                            <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{stock.name}</p>
                            <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Added {stock.addedAt}</p>
                            {/* Debug info */}
                            <p className="text-xs text-gray-400 dark:text-dark-text-secondary">ID: {stock.id}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-dark-text-primary">{formatCurrency(stock.price)}</p>
                          <p className={`text-sm ${stock.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)} 
                            ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAddToHoldings(stock)}
                            variant="primary"
                            size="sm"
                            className="bg-blue-600 text-white hover:bg-blue-700 hover:text-yellow-400 border border-blue-600 hover:border-blue-700 transition-colors"
                          >
                            Add to Holdings
                          </Button>
                          
                          <Button
                            onClick={() => handleRemoveStock(stock.id, stock.symbol)}
                            variant="secondary"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add to Holdings Modal */}
      <Modal
        isOpen={showHoldingModal}
        onClose={() => setShowHoldingModal(false)}
        title={`Add ${selectedStock?.symbol} to Portfolio`}
      >
        <form onSubmit={handleHoldingSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-black mb-1">
              Number of Shares
            </label>
            <Input
              type="number"
              value={holdingForm.shares}
              onChange={(e) => setHoldingForm({...holdingForm, shares: e.target.value})}
              placeholder="e.g., 10"
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-black mb-1">
              Average Price per Share ($)
            </label>
            <Input
              type="number"
              step="0.01"
              value={holdingForm.price}
              onChange={(e) => setHoldingForm({...holdingForm, price: e.target.value})}
              placeholder="e.g., 150.00"
              className="w-full"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowHoldingModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={portfolioLoading}
              className="flex-1"
            >
              {portfolioLoading ? 'Adding...' : 'Add to Portfolio'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}