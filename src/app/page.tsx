'use client';

import { useAuthContext } from '@/contexts/AuthContext'; 
import Navigation from '@/components/layout/Navigation';
import StockSearch from '@/components/stock/StockSearch';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuthContext(); 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {user ? (
        // Logged in user view - Show StockSearch
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome back, {user.name}!
              </h1>
              <p className="text-xl text-gray-600">
                Search for stocks and manage your portfolio
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <StockSearch />
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/dashboard" className="block">
                <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="text-3xl mb-3">📊</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard</h3>
                    <p className="text-gray-600">View your portfolio overview</p>
                  </div>
                </div>
              </Link>

              <Link href="/watchlist" className="block">
                <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="text-3xl mb-3">👁️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Watchlist</h3>
                    <p className="text-gray-600">Track your favorite stocks</p>
                  </div>
                </div>
              </Link>

              <Link href="/portfolio" className="block">
                <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="text-3xl mb-3">💼</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio</h3>
                    <p className="text-gray-600">Manage your investments</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // Not logged in - Show landing page
        <div className="min-h-screen flex flex-col">
          {/* Hero Section */}
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Track Your Stocks with <span className="text-blue-600">Stock Buddy</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Stay informed about your investments with real-time stock data, 
                personalized watchlists, and comprehensive portfolio tracking.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Everything you need to track your investments
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl mb-4">📈</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Data</h3>
                  <p className="text-gray-600">
                    Get up-to-date stock prices and market information instantly.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl mb-4">👁️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Watchlists</h3>
                  <p className="text-gray-600">
                    Create custom watchlists to monitor your favorite stocks.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl mb-4">💼</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Portfolio Tracking</h3>
                  <p className="text-gray-600">
                    Track your investments and see how your portfolio performs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}