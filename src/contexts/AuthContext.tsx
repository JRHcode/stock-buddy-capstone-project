'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthResponse {
  message: string;
  user: User;
  token?: string;
  requiresVerification?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  signup: (name: string, email: string, password: string) => Promise<AuthResponse | null>;
  login: (email: string, password: string) => Promise<AuthResponse | null>;
  logout: () => void;
  getCurrentUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Signup attempt for:', name, email);
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      console.log('Signup response:', data);

      // ✅ Moved this check BEFORE setting user data
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // ✅ Only set user and token if email verification is not required
      if (data.user && !data.requiresVerification) {
        setUser(data.user);
        console.log('User set in context:', data.user);
        
        // Only store token if user doesn't need verification
        if (data.token) {
          console.log('Storing token in localStorage after signup:', data.token);
          localStorage.setItem('token', data.token);
          setToken(data.token);
        }
      } else if (data.requiresVerification) {
        console.log('User requires email verification, not setting user in context');
      }

      return data;
    } catch (err: any) {
      console.error('Signup error:', err.message);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Login attempt for:', email);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login API response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      
      if (data.token) {
        console.log('Storing token in localStorage:', data.token);
        localStorage.setItem('token', data.token);
        setToken(data.token); // Set token in state
        console.log('Token set in AuthContext state');
      } else {
        console.warn('No token received in login response');
      }
      
      return data;
    } catch (err: any) {
      console.log('Login error:', err.message);
      const errorMessage = err.message || err.toString() || 'Unknown login error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    console.log('Logging out user');
    setUser(null);
    setToken(null); // Clear token from state
    localStorage.removeItem('token');
  }, []);

  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    const token = localStorage.getItem('token');
    console.log('Retrieving current user, token exists:', !!token);
    
    if (!token) {
      console.log('No token found in localStorage');
      return null;
    }

    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}. ${errorData.error || ''}`);
      }

      const data = await response.json();
      console.log('getCurrentUser - API response:', data);
      setUser(data.user);
      setToken(token); // Ensure token is set in state
      return data.user;
    } catch (err) {
      console.error('Failed to get current user:', err);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      return null;
    }
  }, []);

  // Initialize authentication on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      console.log('AuthContext initializing - storedToken:', !!storedToken);
      
      if (storedToken) {
        console.log('Setting token from localStorage and getting current user');
        setToken(storedToken);
        await getCurrentUser();
      }
      
      setInitializing(false);
    };

    initializeAuth();
  }, []); // Only run once on mount 

  const value = {
    user,
    token,
    loading,
    initializing,
    error,
    signup,
    login,
    logout,
    getCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}