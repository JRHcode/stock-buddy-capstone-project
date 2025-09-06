'use client';

import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useAlerts } from '@/contexts/AlertsContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isLoading } = useRequireAuth();
  const { watchlist, addToWatchlist, isLoading: watchlistLoading } = useWatchlist();
  const { holdings, addHolding, getTotalValue, getTotalGainLoss, isLoading: portfolioLoading } = usePortfolio();
  const { addAlert, isLoading: alertsLoading } = useAlerts();

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

    try {
      await addAlert({
        symbol: alertForm.symbol.toUpperCase(),
        targetPrice: parseFloat(alertForm.targetPrice),
        condition: alertForm.condition
      });
      
      setAlertForm({ symbol: '', targetPrice: '', condition: 'above' });
      setShowAlertModal(false);
      
      // Show success message
      alert(`Alert set for ${alertForm.symbol.toUpperCase()} when price goes ${alertForm.condition} ${alertForm.targetPrice}!`);
    } catch (error) {
      console.error('Error setting alert:', error);
      alert(error instanceof Error ? error.message : 'Failed to set alert. Please try again.');
    }
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Welcome back, {user?.name}!
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats Cards */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Value</h3>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
              <p className={`text-sm ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)} ({totalGainLossPercent.toFixed(2)}%)
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Watchlist</h3>
              <p className="text-3xl font-bold text-blue-600">{watchlist.length}</p>
              <p className="text-sm text-gray-500">stocks tracked</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Holdings</h3>
              <p className="text-3xl font-bold text-purple-600">{holdings.length}</p>
              <p className="text-sm text-gray-500">investments</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setShowWatchlistModal(true)}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <h3 className="font-medium text-gray-900">Add to Watchlist</h3>
                  <p className="text-sm text-gray-500">Track your favorite stocks</p>
                </div>
              </button>
              
              <button 
                onClick={() => setShowHoldingsModal(true)}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">💼</div>
                  <h3 className="font-medium text-gray-900">Add Holdings</h3>
                  <p className="text-sm text-gray-500">Record your investments</p>
                </div>
              </button>
              
              <button 
                onClick={() => setShowAlertModal(true)}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🔔</div>
                  <h3 className="font-medium text-gray-900">Set Alert</h3>
                  <p className="text-sm text-gray-500">Get notified of price changes</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alert Condition
            </label>
            <select
              value={alertForm.condition}
              onChange={(e) => setAlertForm({...alertForm, condition: e.target.value as 'above' | 'below'})}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              disabled={alertsLoading}
              className="flex-1"
            >
              {alertsLoading ? 'Setting...' : 'Set Alert'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}