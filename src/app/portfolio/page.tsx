'use client';

import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { usePortfolio } from '@/contexts/PortfolioContext';

export default function PortfolioPage() {
  const { isLoading } = useRequireAuth();
  const { holdings, addHolding, removeHolding, getTotalValue, getTotalGainLoss, isLoading: portfolioLoading } = usePortfolio();
  const [showAddModal, setShowAddModal] = useState(false);
  const [holdingForm, setHoldingForm] = useState({
    symbol: '',
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
      setShowAddModal(false);
    } catch (error) {
      alert('Failed to add holding. Please try again.');
    }
  };

  const handleRemoveHolding = (id: string) => {
    if (confirm(`Remove this holding from portfolio?`)) {
      try {
        removeHolding(id);
      } catch (error) {
        alert('Failed to remove holding. Please try again.');
      }
    }
  };

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
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary transition-colors">
              My Portfolio
            </h1>
            <Button onClick={() => setShowAddModal(true)}>
              Add Holding
            </Button>
          </div>

          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg p-6 border dark:border-dark-border transition-colors">
              <h3 className="text-lg font-medium text-gray-500 dark:text-dark-text-secondary mb-2 transition-colors">Total Value</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary transition-colors">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg p-6 border dark:border-dark-border transition-colors">
              <h3 className="text-lg font-medium text-gray-500 dark:text-dark-text-secondary mb-2 transition-colors">Total Gain/Loss</h3>
              <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} transition-colors`}>
                {formatCurrency(totalGainLoss)}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg p-6 border dark:border-dark-border transition-colors">
              <h3 className="text-lg font-medium text-gray-500 dark:text-dark-text-secondary mb-2 transition-colors">Total Return</h3>
              <p className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} transition-colors`}>
                {totalGainLossPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Holdings List */}
          {holdings.length === 0 ? (
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg p-12 text-center border dark:border-dark-border transition-colors">
              <div className="text-6xl mb-4">💼</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2 transition-colors">
                Your portfolio is empty
              </h2>
              <p className="text-gray-500 dark:text-dark-text-secondary mb-6 transition-colors">
                Start building your portfolio by adding your first holding
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                Add Your First Holding
              </Button>
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-lg border dark:border-dark-border transition-colors">
              <div className="p-6 border-b dark:border-dark-border">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary transition-colors">
                  Holdings ({holdings.length})
                </h2>
              </div>
              
              <div className="divide-y dark:divide-dark-border">
                {holdings.map((holding) => (
                  <div key={holding.id} className="p-6 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary transition-colors">
                            {holding.symbol}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-dark-text-secondary transition-colors">
                            {holding.name}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-dark-text-secondary transition-colors">Shares:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-dark-text-primary transition-colors">{holding.shares}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-dark-text-secondary transition-colors">Avg Price:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-dark-text-primary transition-colors">{formatCurrency(holding.avgPrice)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-dark-text-secondary transition-colors">Current:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-dark-text-primary transition-colors">{formatCurrency(holding.currentPrice)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-dark-text-secondary transition-colors">Value:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-dark-text-primary transition-colors">{formatCurrency(holding.totalValue)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-4">
                          <div className={`flex items-center gap-1 ${
                            holding.gainLoss >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          } transition-colors`}>
                            <span>{holding.gainLoss >= 0 ? '↗' : '↘'}</span>
                            <span className="font-medium">
                              {formatCurrency(Math.abs(holding.gainLoss))} ({Math.abs(holding.gainLossPercent).toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRemoveHolding(holding.id)}
                        >
                          Remove
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

      {/* Add Holding Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Investment Holding"
      >
        <form onSubmit={handleAddHolding} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-black mb-1">
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
              value={holdingForm.price}
              onChange={(e) => setHoldingForm({...holdingForm, price: e.target.value})}
              placeholder="e.g., 150.00"
              className="w-full"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
            >
              Add Holding
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}