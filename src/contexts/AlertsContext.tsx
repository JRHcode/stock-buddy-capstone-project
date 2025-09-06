'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Alert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  currentPrice: number;
  createdAt: string;
  isActive: boolean;
}

interface AlertsContextType {
  alerts: Alert[];
  addAlert: (alert: { symbol: string; targetPrice: number; condition: 'above' | 'below' }) => Promise<void>;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  isLoading: boolean;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load alerts from localStorage on mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('stockBuddyAlerts');
    if (savedAlerts) {
      try {
        setAlerts(JSON.parse(savedAlerts));
      } catch (error) {
        console.error('Error loading alerts from localStorage:', error);
      }
    }
  }, []);

  // Save alerts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('stockBuddyAlerts', JSON.stringify(alerts));
  }, [alerts]);

  const addAlert = async (alertData: { symbol: string; targetPrice: number; condition: 'above' | 'below' }) => {
    setIsLoading(true);
    
    try {
      // Check if alert already exists for this symbol and condition
      const existingAlert = alerts.find(
        alert => alert.symbol === alertData.symbol && 
        alert.condition === alertData.condition &&
        alert.targetPrice === alertData.targetPrice
      );
      
      if (existingAlert) {
        throw new Error(`Alert already exists for ${alertData.symbol} when price goes ${alertData.condition} ${alertData.targetPrice}`);
      }

      // Generate mock current price
      const currentPrice = Math.random() * 200 + 50;
      
      const newAlert: Alert = {
        id: Date.now().toString(),
        symbol: alertData.symbol,
        targetPrice: alertData.targetPrice,
        condition: alertData.condition,
        currentPrice: currentPrice,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      setAlerts(prev => [...prev, newAlert]);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } finally {
      setIsLoading(false);
    }
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const value = {
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

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
}