// 'use client';

// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { useAuthContext } from './AuthContext'; // Import auth context

// export interface Alert {
//   id: string;
//   symbol: string;
//   name: string;
//   targetPrice: number;
//   condition: 'above' | 'below';
//   currentPrice: number;
//   isActive: boolean;
//   createdAt: Date;
//   triggeredAt?: Date;
// }

// interface AlertsContextType {
//   alerts: Alert[];
//   addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'isActive'>) => Promise<void>;
//   removeAlert: (id: string) => void;
//   toggleAlert: (id: string) => void;
//   isLoading: boolean;
// }

// const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

// interface AlertsProviderProps {
//   children: ReactNode;
// }

// export function AlertsProvider({ children }: AlertsProviderProps) {
//   const [alerts, setAlerts] = useState<Alert[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const { user } = useAuthContext(); // Get current user from auth

//   // Generate a user-specific storage key
//   const getStorageKey = () => {
//     return user ? `stockBuddy_alerts_${user.id}` : 'stockBuddy_alerts_guest';
//   };

//   // Load alerts from localStorage on mount or when user changes
//   useEffect(() => {
//     if (user) {
//       const storageKey = getStorageKey();
//       const savedAlerts = localStorage.getItem(storageKey);
//       if (savedAlerts) {
//         try {
//           const parsedAlerts = JSON.parse(savedAlerts).map((alert: any) => ({
//             ...alert,
//             createdAt: new Date(alert.createdAt),
//             triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined
//           }));
//           setAlerts(parsedAlerts);
//         } catch (error) {
//           console.error('Error loading alerts from localStorage:', error);
//         }
//       } else {
//         setAlerts([]); // Clear alerts for new user
//       }
//     } else {
//       setAlerts([]); // Clear alerts when user logs out
//     }
//   }, [user]); // Reload when user changes

//   // Save alerts to localStorage whenever alerts change or user changes
//   useEffect(() => {
//     if (user) {
//       const storageKey = getStorageKey();
//       localStorage.setItem(storageKey, JSON.stringify(alerts));
//     }
//   }, [alerts, user]); // Save when alerts or user changes

//   const addAlert = async (alertData: Omit<Alert, 'id' | 'createdAt' | 'isActive'>) => {
//     if (!user) {
//       throw new Error('You must be logged in to create alerts');
//     }

//     setIsLoading(true);
    
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 500));
      
//       const newAlert: Alert = {
//         ...alertData,
//         id: Date.now().toString(),
//         createdAt: new Date(),
//         isActive: true
//       };
      
//       setAlerts(prev => [...prev, newAlert]);
//     } catch (error) {
//       console.error('Error adding alert:', error);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const removeAlert = (id: string) => {
//     if (!user) return;
//     setAlerts(prev => prev.filter(alert => alert.id !== id));
//   };

//   const toggleAlert = (id: string) => {
//     if (!user) return;
//     setAlerts(prev => prev.map(alert => 
//       alert.id === id 
//         ? { ...alert, isActive: !alert.isActive }
//         : alert
//     ));
//   };

//   const value: AlertsContextType = {
//     alerts,
//     addAlert,
//     removeAlert,
//     toggleAlert,
//     isLoading
//   };

//   return (
//     <AlertsContext.Provider value={value}>
//       {children}
//     </AlertsContext.Provider>
//   );
// }

// export function useAlerts(): AlertsContextType {
//   const context = useContext(AlertsContext);
//   if (context === undefined) {
//     throw new Error('useAlerts must be used within an AlertsProvider');
//   }
//   return context;
// }

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext'; // Import auth context

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
  const { user } = useAuthContext(); // Get current user from auth

  // Generate a user-specific storage key
  const getStorageKey = () => {
    return user ? `stockBuddy_alerts_${user.id}` : 'stockBuddy_alerts_guest';
  };

  // Load alerts from localStorage on mount or when user changes
  useEffect(() => {
    if (user) {
      const storageKey = getStorageKey();
      const savedAlerts = localStorage.getItem(storageKey);
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
      } else {
        setAlerts([]); // Clear alerts for new user
      }
    } else {
      setAlerts([]); // Clear alerts when user logs out
    }
  }, [user]); // Reload when user changes

  // Save alerts to localStorage whenever alerts change or user changes
  useEffect(() => {
    if (user) {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(alerts));
    }
  }, [alerts, user]); // Save when alerts or user changes

  const addAlert = async (alertData: Omit<Alert, 'id' | 'createdAt' | 'isActive'>) => {
    if (!user) {
      throw new Error('You must be logged in to create alerts');
    }

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
    if (!user) return;
    setAlerts(prev => prev.filter(alert => alert.id !== id));
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