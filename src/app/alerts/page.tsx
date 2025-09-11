'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAlerts } from '@/contexts/AlertsContext';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

export default function AlertsPage() {
  const { isLoading } = useRequireAuth();
  const { alerts, addAlert, removeAlert, isLoading: alertsLoading } = useAlerts();
  const { token } = useAuthContext();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    targetValue: '',
    condition: 'above' as 'above' | 'below' | 'change'
  });
  
  const [testingAlert, setTestingAlert] = useState(false);

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
        condition: newAlert.condition
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

  // Testing functions
  const testEmailConfiguration = async () => {
    setTestingAlert(true);
    try {
      const response = await fetch('/api/alerts/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'test-email' }),
      });
      
      const data = await response.json();
      if (data.success) {
        alert('✅ Email configuration is working!');
      } else {
        alert('❌ Email configuration failed. Check your environment variables.');
      }
    } catch (error) {
      console.error('Email test error:', error);
      alert('❌ Failed to test email configuration.');
    } finally {
      setTestingAlert(false);
    }
  };

  const checkMyAlerts = async () => {
    setTestingAlert(true);
    try {
      const response = await fetch('/api/alerts/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'check-user' }),
      });
      
      const data = await response.json();
      if (data.success) {
        const { results } = data;
        alert(`✅ Alert check completed!\n\nChecked: ${results.totalAlertsChecked} alerts\nTriggered: ${results.alertsTriggered} alerts\nEmails sent: ${results.emailsSent}\n\n${results.errors.length > 0 ? 'Errors: ' + results.errors.join(', ') : 'No errors!'}`);
      } else {
        alert('❌ Failed to check alerts: ' + data.error);
      }
    } catch (error) {
      console.error('Alert check error:', error);
      alert('❌ Failed to check alerts.');
    } finally {
      setTestingAlert(false);
    }
  };

  const simulatePrice = async (symbol: string, price: number) => {
    if (process.env.NODE_ENV === 'production') {
      alert('Price simulation is only available in development mode.');
      return;
    }

    setTestingAlert(true);
    try {
      const response = await fetch('/api/alerts/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'simulate-price',
          symbol,
          targetPrice: price 
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`✅ Simulated ${symbol} price to $${price}!\n\nNow run "Check My Alerts" to trigger any matching alerts.`);
      } else {
        alert('❌ Failed to simulate price: ' + data.error);
      }
    } catch (error) {
      console.error('Price simulation error:', error);
      alert('❌ Failed to simulate price.');
    } finally {
      setTestingAlert(false);
    }
  };

  const testRealPrice = async (symbol: string = 'AAPL') => {
    setTestingAlert(true);
    try {
      const response = await fetch('/api/alerts/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'test-real-price',
          symbol 
        }),
      });
      
      const data = await response.json();
      if (data.success && data.price) {
        const { price } = data;
        alert(`✅ Yahoo Finance API working!\n\n${symbol}: $${price.price}\nChange: ${price.change >= 0 ? '+' : ''}${price.change} (${price.changePercent}%)\nUpdated: ${new Date(price.lastUpdated).toLocaleTimeString()}`);
      } else {
        alert(`❌ Failed to fetch real price for ${symbol}: ` + data.message);
      }
    } catch (error) {
      console.error('Real price test error:', error);
      alert('❌ Failed to test real price fetching.');
    } finally {
      setTestingAlert(false);
    }
  };

  const clearCache = async () => {
    setTestingAlert(true);
    try {
      const response = await fetch('/api/alerts/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'clear-cache' }),
      });
      
      const data = await response.json();
      if (data.success) {
        alert('✅ Price cache cleared!');
      } else {
        alert('❌ Failed to clear cache.');
      }
    } catch (error) {
      console.error('Clear cache error:', error);
      alert('❌ Failed to clear cache.');
    } finally {
      setTestingAlert(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary transition-colors">
            Price Alerts
          </h1>
          <p className="mt-2 text-gray-600 dark:text-dark-text-secondary transition-colors">
            Get notified when stocks reach your target prices
          </p>
        </div>

        {/* Testing Section */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6 border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
            🧪 Testing & Development
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-4">
            Test your email alerts and Yahoo Finance API integration
          </p>
          
          {/* First row: Core functionality tests */}
          <div className="flex flex-wrap gap-3 mb-3">
            <Button
              onClick={testEmailConfiguration}
              disabled={testingAlert}
              variant="secondary"
              size="sm"
              className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-800/30 dark:text-yellow-200 dark:border-yellow-600"
            >
              {testingAlert ? 'Testing...' : 'Test Email Config'}
            </Button>
            <Button
              onClick={() => testRealPrice('AAPL')}
              disabled={testingAlert}
              variant="secondary"
              size="sm"
              className="bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 dark:bg-purple-800/30 dark:text-purple-200 dark:border-purple-600"
            >
              {testingAlert ? 'Testing...' : 'Test Yahoo Finance (AAPL)'}
            </Button>
            <Button
              onClick={checkMyAlerts}
              disabled={testingAlert || !token}
              variant="secondary"
              size="sm"
              className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 dark:bg-blue-800/30 dark:text-blue-200 dark:border-blue-600"
            >
              {testingAlert ? 'Checking...' : 'Check My Alerts'}
            </Button>
            <Button
              onClick={clearCache}
              disabled={testingAlert}
              variant="secondary"
              size="sm"
              className="bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200 dark:bg-orange-800/30 dark:text-orange-200 dark:border-orange-600"
            >
              {testingAlert ? 'Clearing...' : 'Clear Price Cache'}
            </Button>
          </div>
          
          {/* Second row: Alert trigger tests */}
          {alerts.length > 0 && (
            <div>
              <p className="text-yellow-600 dark:text-yellow-400 text-xs mb-2">Trigger specific alerts:</p>
              <div className="flex gap-2">
                {alerts.slice(0, 4).map(alert => (
                  <Button
                    key={alert.id}
                    onClick={() => simulatePrice(alert.symbol, alert.targetValue + 1)}
                    disabled={testingAlert}
                    variant="secondary"
                    size="sm"
                    className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200 dark:bg-green-800/30 dark:text-green-200 dark:border-green-600"
                  >
                    Trigger {alert.symbol}
                  </Button>
                ))}
              </div>
            </div>
          )}
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
                    {alert.currentValue ? formatCurrency(alert.currentValue) : 
                     <span className="text-gray-400 italic">Loading...</span>}
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