

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext'; // Import auth context

export interface Alert {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'change';
  targetValue: number;
  currentValue?: number;
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

interface AlertsContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'isActive'>) => Promise<void>;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  isLoading: boolean;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

interface AlertsProviderProps {
  children: ReactNode;
}

export function AlertsProvider({ children }: AlertsProviderProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useAuthContext(); // Get current user and token from auth

  // Helper function to make authenticated API requests
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('No authentication token');
    }

    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  // Load alerts from database
  const loadAlertsFromDatabase = async () => {
    console.log('loadAlertsFromDatabase called with user:', !!user, 'token:', !!token);
    
    if (!user || !token) {
      console.log('No user or token, setting empty alerts');
      setAlerts([]);
      return;
    }

    try {
      console.log('Making GET request to /api/alerts');
      const response = await makeAuthenticatedRequest('/api/alerts');
      console.log('GET alerts response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('GET alerts response data:', data);
        
        const dbAlerts = (data.alerts || []).map((alert: any) => ({
          id: alert.id || alert._id || `${alert.symbol}_${Date.now()}`,
          symbol: alert.symbol,
          condition: alert.condition,
          targetValue: alert.targetValue,
          currentValue: alert.currentValue,
          isActive: alert.isActive,
          createdAt: alert.createdAt ? new Date(alert.createdAt) : new Date(),
          triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined
        }));
        
        console.log('Processed alerts:', dbAlerts);
        console.log('Setting alerts with', dbAlerts.length, 'alerts');
        setAlerts(dbAlerts);
        
      } else {
        throw new Error('Failed to load alerts from database');
      }
    } catch (error) {
      console.error('Error loading alerts from database:', error);
      setAlerts([]);
    }
  };

  // Function to fetch current prices for all alerts
  const fetchCurrentPrices = async () => {
    if (!alerts.length) return;

    console.log('Fetching current prices for', alerts.length, 'alerts');
    const updatedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        try {
          const response = await fetch('/api/alerts/check', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'test-real-price',
              symbol: alert.symbol
            }),
          });

          const data = await response.json();
          if (data.success && data.price) {
            return {
              ...alert,
              currentValue: data.price.price
            };
          }
        } catch (error) {
          console.error(`Failed to fetch price for ${alert.symbol}:`, error);
        }
        return alert;
      })
    );

    setAlerts(updatedAlerts);
  };

  // Load alerts on mount or when user changes
  useEffect(() => {
    console.log('AlertsContext useEffect triggered with user:', !!user, 'token:', !!token);
    console.log('User details:', user ? { id: user.id, email: user.email } : 'null');
    
    if (user && token) {
      console.log('Both user and token present, calling loadAlertsFromDatabase');
      loadAlertsFromDatabase();
    } else if (user === null && token === null) {
      // Only clear when explicitly logged out (both user and token are null)
      console.log('Both user and token are null, clearing alerts');
      setAlerts([]);
      console.log('User logged out, clearing alerts');
    } else {
      console.log('User or token missing - user:', !!user, 'token:', !!token);
    }
  }, [user, token]); // Reload when user or token changes

  // Fetch current prices when alerts are first loaded
  useEffect(() => {
    if (alerts.length > 0 && alerts.some(alert => alert.currentValue === undefined || alert.currentValue === 0)) {
      fetchCurrentPrices();
    }
  }, [alerts.length]); // Only trigger when the number of alerts changes

  // Add periodic price updates (every 5 minutes)
  useEffect(() => {
    if (alerts.length === 0) return;

    const interval = setInterval(() => {
      fetchCurrentPrices();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [alerts.length]);

  // Save alerts to database
  const saveAlertsToDatabase = async (updatedAlerts: Alert[]) => {
    if (!user || !token) {
      console.log('saveAlertsToDatabase: No user or token, skipping save');
      return;
    }

    console.log('saveAlertsToDatabase called with', updatedAlerts.length, 'alerts');

    try {
      const alertsForDb = updatedAlerts.map(alert => ({
        id: alert.id,
        symbol: alert.symbol,
        condition: alert.condition,
        targetValue: alert.targetValue,
        currentValue: alert.currentValue,
        isActive: alert.isActive,
        createdAt: alert.createdAt,
        triggeredAt: alert.triggeredAt
      }));

      console.log('Sending PUT request to /api/alerts with data:', alertsForDb);

      const response = await makeAuthenticatedRequest('/api/alerts', {
        method: 'PUT',
        body: JSON.stringify({ alerts: alertsForDb }),
      });

      console.log('PUT alerts response status:', response.status);
      const responseData = await response.json();
      console.log('PUT alerts response data:', responseData);

      console.log('Alerts saved to database successfully');
    } catch (error) {
      console.error('Error saving alerts to database:', error);
    }
  };

  // Save alerts to database whenever it changes
  useEffect(() => {
    if (user && token && alerts.length >= 0) { // Require both user and token to be present
      // Save to database (async, don't wait)
      saveAlertsToDatabase(alerts);
    }
  }, [alerts, user, token]); // Save when alerts, user, or token changes

  const addAlert = async (alertData: Omit<Alert, 'id' | 'createdAt' | 'isActive'>) => {
    console.log('addAlert called with alertData:', alertData);
    console.log('Current user and token state:', { user: !!user, token: !!token });
    
    if (!user) {
      throw new Error('You must be logged in to create alerts');
    }

    setIsLoading(true);
    
    try {
      const newAlert: Alert = {
        ...alertData,
        id: Date.now().toString(),
        createdAt: new Date(),
        isActive: true
      };

      console.log('Adding alert:', newAlert);
      
      // Try to add to database first
      try {
        if (token) {
          console.log('Attempting to add alert to database:', {
            symbol: newAlert.symbol,
            condition: newAlert.condition,
            targetValue: newAlert.targetValue,
            currentValue: newAlert.currentValue
          });
          
          const response = await makeAuthenticatedRequest('/api/alerts', {
            method: 'POST',
            body: JSON.stringify({
              symbol: newAlert.symbol,
              condition: newAlert.condition,
              targetValue: newAlert.targetValue,
              currentValue: newAlert.currentValue
            }),
          });
          
          console.log('API response status:', response.status);
          const responseData = await response.json();
          console.log('API response data:', responseData);
          
          if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${responseData.error || 'Unknown error'}`);
          }
          
          console.log('Alert added to database successfully');
        }
      } catch (dbError) {
        console.error('Error adding to database, continuing with local addition:', dbError);
        if (dbError instanceof Error) {
          console.error('Error details:', dbError.message);
        }
        // Continue with local addition even if database fails
      }
      
      // Update local state
      setAlerts(prev => [...prev, newAlert]);
    } catch (error) {
      console.error('Error adding alert:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeAlert = async (id: string) => {
    if (!user) return;
    
    console.log('Removing alert with id:', id);
    console.log('Current alerts:', alerts);
    
    // Try to remove from database first
    if (token) {
      try {
        await makeAuthenticatedRequest(`/api/alerts?id=${id}`, {
          method: 'DELETE',
        });
        console.log('Alert removed from database successfully');
      } catch (error) {
        console.error('Error removing from database:', error);
        // Continue with local removal even if database fails
      }
    }
    
    setAlerts(prev => {
      const updated = prev.filter(alert => alert.id !== id);
      console.log('Updated alerts after removal:', updated);
      return updated;
    });
  };

  const toggleAlert = (id: string) => {
    if (!user) return;
    setAlerts(prev => prev.map(alert => 
      alert.id === id 
        ? { ...alert, isActive: !alert.isActive }
        : alert
    ));
  };

  const value: AlertsContextType = {
    alerts,
    addAlert,
    removeAlert,
    toggleAlert,
    isLoading
  };

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts(): AlertsContextType {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
}