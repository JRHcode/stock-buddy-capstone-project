'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAlerts } from '@/contexts/AlertsContext';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useState } from 'react';

export default function AlertsPage() {
  const { isLoading } = useRequireAuth();
  const { alerts, addAlert, removeAlert, isLoading: alertsLoading } = useAlerts();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    targetValue: '',
    condition: 'above' as 'above' | 'below' | 'change'
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg transition-colors">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.symbol || !newAlert.targetValue) return;
  
    try {
      await addAlert({
        symbol: newAlert.symbol.toUpperCase(),
        targetValue: parseFloat(newAlert.targetValue),
        condition: newAlert.condition,
        currentValue: 0 // Initialize with 0, will be updated by the context
      });
      
      setNewAlert({ symbol: '', targetValue: '', condition: 'above' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding alert:', error);
      alert('Failed to add alert. Please try again.');
    }
  };

  const handleRemoveAlert = (id: string) => {
    if (confirm('Are you sure you want to remove this alert?')) {
      removeAlert(id);
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary transition-colors">
            Price Alerts
          </h1>
          <p className="mt-2 text-gray-600 dark:text-dark-text-secondary transition-colors">
            Get notified when stocks reach your target prices
          </p>
        </div>

        {/* Add Alert Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary transition-colors">
            Your Alerts
          </h2>
          <Button 
            onClick={() => setShowAddModal(true)}
            variant="primary"
          >
            Add Alert
          </Button>
        </div>

        {/* Alerts Table */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md dark:shadow-lg border dark:border-dark-border overflow-hidden transition-colors">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead className="bg-gray-50 dark:bg-dark-bg transition-colors">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider transition-colors">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider transition-colors">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider transition-colors">
                  Target Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider transition-colors">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider transition-colors">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider transition-colors">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider transition-colors">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-dark-border transition-colors">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary transition-colors">
                      {alert.symbol}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-dark-text-primary transition-colors">
                      Price goes {alert.condition}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary transition-colors">
                    {formatCurrency(alert.targetValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary transition-colors">
                    {formatCurrency(alert.currentValue || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      alert.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    } transition-colors`}>
                      {alert.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary transition-colors">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleRemoveAlert(alert.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {alerts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-dark-text-secondary transition-colors">
                No alerts found. Add your first alert to get started.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Add Alert Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Price Alert"
      >
        <form onSubmit={handleAddAlert} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-black mb-1 transition-colors">
              Stock Symbol
            </label>
            <Input
              type="text"
              value={newAlert.symbol}
              onChange={(e) => setNewAlert({...newAlert, symbol: e.target.value})}
              placeholder="e.g., AAPL, GOOGL, TSLA"
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-black mb-1 transition-colors">
              Target Price ($)
            </label>
            <Input
              type="number"
              step="0.01"
              value={newAlert.targetValue}
              onChange={(e) => setNewAlert({...newAlert, targetValue: e.target.value})}
              placeholder="e.g., 200.00"
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-black mb-1 transition-colors">
              Alert Condition
            </label>
            <select
              value={newAlert.condition}
              onChange={(e) => setNewAlert({...newAlert, condition: e.target.value as 'above' | 'below'})}
              className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary transition-colors"
            >
              <option value="above">Price goes above</option>
              <option value="below">Price goes below</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
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
              {alertsLoading ? 'Adding...' : 'Add Alert'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}