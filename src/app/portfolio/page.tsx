'use client';

import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio } from '@/contexts/PortfolioContext';

export default function PortfolioPage() {
  const { user } = useAuth();
  const { isLoading } = useRequireAuth();
  const { holdings, addHolding, removeHolding, getTotalValue, getTotalGainLoss, isLoading: portfolioLoading } = usePortfolio();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newHolding, setNewHolding] = useState({
    symbol: '',
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

  const totalValue = getTotalValue();
  const totalGainLoss = getTotalGainLoss();
  const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolding.symbol || !newHolding.shares || !newHolding.price) return;

    try {
      await addHolding({
        symbol: newHolding.symbol.toUpperCase(),
        name: `${newHolding.symbol.toUpperCase()} Company`,
        shares: parseFloat(newHolding.shares),
        avgPrice: parseFloat(newHolding.price)
      });
      
      setNewHolding({ symbol: '', shares: '', price: '' });
      setShowAddForm(false);
      
    } catch (err) {
      console.error('Error adding holding:', err);
      alert('Failed to add holding. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewHolding(prev => ({ ...prev, [name]: value }));
  };

  const handleRemoveHolding = (id: string) => {
    if (confirm('Are you sure you want to remove this holding?')) {
      removeHolding(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
          <p className="mt-2 text-gray-600">Manage your investment holdings</p>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total Gain/Loss</p>
              <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total Return</p>
              <p className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLossPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Add Holding Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Your Holdings</h2>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            variant="primary"
          >
            {showAddForm ? 'Cancel' : 'Add Holding'}
          </Button>
        </div>

        {/* Add Holding Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Holding</h3>
            <form onSubmit={handleAddHolding} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Symbol"
                name="symbol"
                value={newHolding.symbol}
                onChange={handleInputChange}
                placeholder="AAPL"
                required
              />
              <Input
                label="Shares"
                name="shares"
                type="number"
                value={newHolding.shares}
                onChange={handleInputChange}
                placeholder="10"
                required
              />
              <Input
                label="Average Price"
                name="price"
                type="number"
                value={newHolding.price}
                onChange={handleInputChange}
                placeholder="150.00"
                required
              />
              <div className="flex items-end">
                <Button 
                  type="submit" 
                  variant="primary"
                  className="w-full"
                >
                  Add Holding
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Holdings Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {holdings.map((holding) => (
                <tr key={holding.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{holding.symbol}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{holding.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {holding.shares}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${holding.avgPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(holding.avgPrice + (Math.random() - 0.5) * 20).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${(holding.shares * (holding.avgPrice + (Math.random() - 0.5) * 20)).toFixed(2)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(holding.gainLoss).toFixed(2)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${holding.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {holding.gainLossPercent.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleRemoveHolding(holding.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {holdings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No holdings found. Add your first holding to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}