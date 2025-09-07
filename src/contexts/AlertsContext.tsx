'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Alert {
  id: string;
  symbol: string;
  name: string;
  targetPrice: number;
  condition: 'above' | 'below';
  currentPrice: number;
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

  // Load alerts from localStorage on mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('stockBuddy_alerts');
    if (savedAlerts) {
      try {
        const parsedAlerts = JSON.parse(savedAlerts).map((alert: any) => ({
          ...alert,
          createdAt: new Date(alert.createdAt),
          triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined
        }));
        setAlerts(parsedAlerts);
      } catch (error) {
        console.error('Error loading alerts from localStorage:', error);
      }
    }
  }, []);

  // Save alerts to localStorage whenever alerts change
  useEffect(() => {
    localStorage.setItem('stockBuddy_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const addAlert = async (alertData: Omit<Alert, 'id' | 'createdAt' | 'isActive'>) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAlert: Alert = {
        ...alertData,
        id: Date.now().toString(),
        createdAt: new Date(),
        isActive: true
      };
      
      setAlerts(prev => [...prev, newAlert]);
    } catch (error) {
      console.error('Error adding alert:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const toggleAlert = (id: string) => {
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