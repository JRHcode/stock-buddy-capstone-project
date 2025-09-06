'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import Input from '@/components/ui/Input';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { usePortfolio } from '@/contexts/PortfolioContext';
import Navigation from '@/components/layout/Navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function WatchlistPage() {
  const { user } = useAuth();
  const { isLoading } = useRequireAuth();
  const { watchlist, addToWatchlist, removeFromWatchlist, isLoading: watchlistLoading } = useWatchlist();
  const { addHolding, isLoading: portfolioLoading } = usePortfolio();
  
  const [newSymbol, setNewSymbol] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Modal states
  const [showHoldingModal, setShowHoldingModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [holdingForm, setHoldingForm] = useState({
    shares: '',
    price: ''
  });

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

  const handleAddToHoldings = (stock: any) => {
    setSelectedStock(stock);
    setHoldingForm({ shares: '', price: stock.price.toString() });
    setShowHoldingModal(true);
  };

  const handleSubmitHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !holdingForm.shares || !holdingForm.price) return;

    try {
      await addHolding({
        symbol: selectedStock.symbol,
        name: selectedStock.name,
        shares: parseFloat(holdingForm.shares),
        avgPrice: parseFloat(holdingForm.price)
      });
      
      setHoldingForm({ shares: '', price: '' });
      setSelectedStock(null);
      setShowHoldingModal(false);
      
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
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAddToHoldings(stock)}
                            variant="primary"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Add to Holdings
                          </Button>
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
        onClose={() => {
          setShowHoldingModal(false);
          setSelectedStock(null);
          setHoldingForm({ shares: '', price: '' });
        }}
        title={`Add ${selectedStock?.symbol} to Portfolio`}
      >
        <form onSubmit={handleSubmitHolding} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedStock?.symbol}</h3>
                <p className="text-sm text-gray-600">{selectedStock?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {selectedStock && formatCurrency(selectedStock.price)}
                </p>
                <p className="text-sm text-gray-500">Current Price</p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Price per Share ($)
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
            <p className="text-xs text-gray-500 mt-1">
              Pre-filled with current price. Adjust if needed.
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowHoldingModal(false);
                setSelectedStock(null);
                setHoldingForm({ shares: '', price: '' });
              }}
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