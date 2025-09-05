
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database - in a real app, this would be in your backend
const MOCK_USERS_KEY = 'stock_buddy_users';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string; // In real app, this would be hashed
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('stock_buddy_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Helper functions for mock database
  const getStoredUsers = (): StoredUser[] => {
    const users = localStorage.getItem(MOCK_USERS_KEY);
    return users ? JSON.parse(users) : [];
  };

  const saveStoredUsers = (users: StoredUser[]) => {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  };

  const findUserByEmail = (email: string): StoredUser | undefined => {
    const users = getStoredUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const storedUser = findUserByEmail(email);
      
      if (!storedUser) {
        console.log('User not found');
        return false;
      }
      
      if (storedUser.password !== password) {
        console.log('Invalid password');
        return false;
      }
      
      // Login successful
      const userSession: User = {
        id: storedUser.id,
        name: storedUser.name,
        email: storedUser.email
      };
      
      setUser(userSession);
      localStorage.setItem('stock_buddy_user', JSON.stringify(userSession));
      return true;
      
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const users = getStoredUsers();
      
      // Check if user already exists
      if (findUserByEmail(email)) {
        console.log('User already exists');
        return false;
      }
      
      // Create new user
      const newUser: StoredUser = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.toLowerCase(),
        password // In real app, hash this password
      };
      
      // Save to mock database
      users.push(newUser);
      saveStoredUsers(users);
      
      // Auto-login after signup
      const userSession: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      };
      
      setUser(userSession);
      localStorage.setItem('stock_buddy_user', JSON.stringify(userSession));
      return true;
      
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stock_buddy_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
