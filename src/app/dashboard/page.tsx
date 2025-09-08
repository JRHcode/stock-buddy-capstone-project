'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { usePortfolio } from '@/contexts/PortfolioContext';
import Modal from '@/components/ui/Modal';
import Navigation from '@/components/layout/Navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import StockSearch from '@/components/stock/StockSearch';
import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { isLoading } = useRequireAuth();
  const { watchlist, addToWatchlist, isLoading: watchlistLoading } = useWatchlist();
  const { holdings, addHolding, getTotalValue, getTotalGainLoss, isLoading: portfolioLoading } = usePortfolio();

  // Modal states
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [showHoldingsModal, setShowHoldingsModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  // Form states
  const [watchlistSymbol, setWatchlistSymbol] = useState('');
  const [holdingForm, setHoldingForm] = useState({
    symbol: '',
    shares: '',
    price: ''
  });
  const [alertForm, setAlertForm] = useState({
    symbol: '',
    targetPrice: '',
    condition: 'above' as 'above' | 'below'
  });
  const [isSettingAlert, setIsSettingAlert] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg transition-colors">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleAddToWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!watchlistSymbol.trim()) return;
  
    try {
      // Create mock stock data for the symbol
      const mockStock = {
        symbol: watchlistSymbol.toUpperCase(),
        name: `${watchlistSymbol.toUpperCase()} Company`,
        price: Math.random() * 200 + 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5
      };
      
      await addToWatchlist(mockStock);
      setWatchlistSymbol('');
      setShowWatchlistModal(false);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert('Failed to add stock to watchlist. Please try again.');
    }
  };

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdingForm.symbol || !holdingForm.shares || !holdingForm.price) return;

    try {
      await addHolding({
        symbol: holdingForm.symbol.toUpperCase(),
        name: `${holdingForm.symbol.toUpperCase()} Company`,
        shares: parseFloat(holdingForm.shares),
        avgPrice: parseFloat(holdingForm.price)
      });
      
      setHoldingForm({ symbol: '', shares: '', price: '' });
      setShowHoldingsModal(false);
      
    } catch (err) {
      console.error('Error adding holding:', err);
      alert('Failed to add holding. Please try again.');
    }
  };

  const handleSetAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertForm.symbol || !alertForm.targetPrice) return;

    setIsSettingAlert(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Setting alert:', alertForm);
    
    setIsSettingAlert(false);
    setAlertForm({ symbol: '', targetPrice: '', condition: 'above' });
    setShowAlertModal(false);
    
    // Show success message
    alert(`Alert set for ${alertForm.symbol.toUpperCase()} when price goes ${alertForm.condition} ${alertForm.targetPrice}!`);
  };

  // Calculate portfolio stats
  const totalValue = getTotalValue();
  const totalGainLoss = getTotalGainLoss();
  const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

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
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-8 transition-colors">
            Welcome back, {user?.name}!
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Stats Cards */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg border dark:border-dark-border p-6 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2 transition-colors">Portfolio Value</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 transition-colors">{formatCurrency(totalValue)}</p>
              <p className={`text-sm transition-colors ${totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)} ({totalGainLossPercent.toFixed(2)}%)
              </p>
            </div>
            
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg border dark:border-dark-border p-6 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2 transition-colors">Watchlist</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 transition-colors">{watchlist.length}</p>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary transition-colors">stocks tracked</p>
            </div>
            
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg border dark:border-dark-border p-6 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2 transition-colors">Holdings</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 transition-colors">{holdings.length}</p>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary transition-colors">investments</p>
            </div>
          </div>

          {/* Stock Search Section */}
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg border dark:border-dark-border p-6 mb-8 transition-colors">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-4 transition-colors">Search Stocks</h2>
            <StockSearch />
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg border dark:border-dark-border p-6 transition-colors">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-4 transition-colors">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setShowWatchlistModal(true)}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <h3 className="font-medium text-gray-900 dark:text-dark-text-primary transition-colors">Add to Watchlist</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary transition-colors">Track your favorite stocks</p>
                </div>
              </button>
              
              <button 
                onClick={() => setShowHoldingsModal(true)}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">💼</div>
                  <h3 className="font-medium text-gray-900 dark:text-dark-text-primary transition-colors">Add Holdings</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary transition-colors">Record your investments</p>
                </div>
              </button>
              
              <button 
                onClick={() => setShowAlertModal(true)}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🔔</div>
                  <h3 className="font-medium text-gray-900 dark:text-dark-text-primary transition-colors">Set Alert</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary transition-colors">Get notified of price changes</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Watchlist Modal */}
      <Modal
        isOpen={showWatchlistModal}
        onClose={() => setShowWatchlistModal(false)}
        title="Add Stock to Watchlist"
      >
        <form onSubmit={handleAddToWatchlist} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1 transition-colors">
              Stock Symbol
            </label>
            <Input
              type="text"
              value={watchlistSymbol}
              onChange={(e) => setWatchlistSymbol(e.target.value)}
              placeholder="e.g., AAPL, GOOGL, TSLA"
              className="w-full"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowWatchlistModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={watchlistLoading}
              className="flex-1"
            >
              {watchlistLoading ? 'Adding...' : 'Add to Watchlist'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Holdings Modal */}
      <Modal
        isOpen={showHoldingsModal}
        onClose={() => setShowHoldingsModal(false)}
        title="Add Investment Holding"
      >
        <form onSubmit={handleAddHolding} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1 transition-colors">
              Stock Symbol
            </label>
            <Input
              type="text"
              value={holdingForm.symbol}
              onChange={(e) => setHoldingForm({...holdingForm, symbol: e.target.value})}
              placeholder="e.g., AAPL, GOOGL, TSLA"
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1 transition-colors">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1 transition-colors">
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
              onClick={() => setShowHoldingsModal(false)}
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
              {portfolioLoading ? 'Adding...' : 'Add Holding'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Set Alert Modal */}
      <Modal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="Set Price Alert"
      >
        <form onSubmit={handleSetAlert} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1 transition-colors">
              Stock Symbol
            </label>
            <Input
              type="text"
              value={alertForm.symbol}
              onChange={(e) => setAlertForm({...alertForm, symbol: e.target.value})}
              placeholder="e.g., AAPL, GOOGL, TSLA"
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1 transition-colors">
              Target Price ($)
            </label>
            <Input
              type="number"
              step="0.01"
              value={alertForm.targetPrice}
              onChange={(e) => setAlertForm({...alertForm, targetPrice: e.target.value})}
              placeholder="e.g., 200.00"
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1 transition-colors">
              Alert Condition
            </label>
            <select
              value={alertForm.condition}
              onChange={(e) => setAlertForm({...alertForm, condition: e.target.value as 'above' | 'below'})}
              className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
            >
              <option value="above">Price goes above</option>
              <option value="below">Price goes below</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAlertModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSettingAlert}
              className="flex-1"
            >
              {isSettingAlert ? 'Setting...' : 'Set Alert'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}