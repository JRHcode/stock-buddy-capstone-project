
'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import Navigation from '@/components/layout/Navigation';
import StockSearch from '@/components/stock/StockSearch';

export default function SearchPage() {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Search</h1>
            <p className="text-gray-600">Search for stocks and view detailed information</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <StockSearch />
          </div>
        </div>
      </div>
    </div>
  );
}