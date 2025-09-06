'use client';

import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useAlerts, Alert } from '@/contexts/AlertsContext';

export default function AlertsPage() {
  const { user } = useAuth();
  const { isLoading } = useRequireAuth();
  const { alerts, addAlert, removeAlert, toggleAlert, isLoading: alertsLoading } = useAlerts();

  const [showAddModal, setShowAddModal] = useState(false);
  const [alertForm, setAlertForm] = useState({
    symbol: '',
    targetPrice: '',
    condition: 'above' as 'above' | 'below'
  });
  const [isAddingAlert, setIsAddingAlert] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertForm.symbol || !alertForm.targetPrice) return;

    setIsAddingAlert(true);
    
    try {
      await addAlert({
        symbol: alertForm.symbol.toUpperCase(),
        targetPrice: parseFloat(alertForm.targetPrice),
        condition: alertForm.condition
      });
      
      setAlertForm({ symbol: '', targetPrice: '', condition: 'above' });
      setShowAddModal(false);
      
    } catch (err) {
      console.error('Error adding alert:', err);
      alert('Failed to add alert. Please try again.');
    } finally {
      setIsAddingAlert(false);
    }
  };

  const handleRemoveAlert = (id: string, symbol: string) => {
    if (confirm(`Are you sure you want to remove the alert for ${symbol}?`)) {
      removeAlert(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAlertStatus = (alert: Alert) => {
    if (!alert.isActive) return { status: 'Paused', color: 'text-gray-500' };
    
    const isTriggered = alert.condition === 'above' 
      ? alert.currentPrice >= alert.targetPrice
      : alert.currentPrice <= alert.targetPrice;
    
    return isTriggered 
      ? { status: 'Triggered', color: 'text-red-600' }
      : { status: 'Active', color: 'text-green-600' };
  };

  const activeAlerts = alerts.filter(alert => alert.isActive);
  const pausedAlerts = alerts.filter(alert => !alert.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Price Alerts</h1>
              <p className="text-gray-600">Manage your stock price alerts and notifications</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              Add New Alert
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Alerts</h3>
              <p className="text-3xl font-bold text-blue-600">{alerts.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Alerts</h3>
              <p className="text-3xl font-bold text-green-600">{activeAlerts.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Paused Alerts</h3>
              <p className="text-3xl font-bold text-gray-600">{pausedAlerts.length}</p>
            </div>
          </div>

          {/* Alerts List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Alerts ({alerts.length})
              </h2>
            </div>
            
            {alerts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">🔔</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts set</h3>
                <p className="text-gray-600 mb-4">Create your first price alert to get notified when stocks reach your target prices</p>
                <Button onClick={() => setShowAddModal(true)}>
                  Create Your First Alert
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {alerts.map((alert) => {
                  const alertStatus = getAlertStatus(alert);
                  return (
                    <div key={alert.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{alert.symbol}</h3>
                                <span className={`text-sm font-medium ${alertStatus.color}`}>
                                  {alertStatus.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Alert when price goes {alert.condition} {formatCurrency(alert.targetPrice)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Created {formatDate(alert.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Current Price</p>
                            <p className="font-semibold text-gray-900">{formatCurrency(alert.currentPrice)}</p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Target Price</p>
                            <p className="font-semibold text-gray-900">{formatCurrency(alert.targetPrice)}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => toggleAlert(alert.id)}
                              variant="outline"
                              size="sm"
                              className={alert.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                            >
                              {alert.isActive ? 'Pause' : 'Resume'}
                            </Button>
                            <Button
                              onClick={() => handleRemoveAlert(alert.id, alert.symbol)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Alert Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Price Alert"
      >
        <form onSubmit={handleAddAlert} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Symbol
            </label>
            <Input
              type="text"
              value={alertForm.symbol}
              onChange={(e) => setAlertForm({...alertForm, symbol: e.target.value})}
              placeholder="e.g., AAPL"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Price
            </label>
            <Input
              type="number"
              value={alertForm.targetPrice}
              onChange={(e) => setAlertForm({...alertForm, targetPrice: e.target.value})}
              placeholder="Enter target price"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="condition"
                  checked={alertForm.condition === 'above'}
                  onChange={() => setAlertForm({...alertForm, condition: 'above'})}
                  className="mr-2"
                />
                <span>Above</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="condition"
                  checked={alertForm.condition === 'below'}
                  onChange={() => setAlertForm({...alertForm, condition: 'below'})}
                  className="mr-2"
                />
                <span>Below</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isAddingAlert}
            >
              {isAddingAlert ? 'Adding...' : 'Add Alert'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}