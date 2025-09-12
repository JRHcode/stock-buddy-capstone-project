'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { stockApi, HistoricalPrice } from '@/services/stockApi';

interface StockChartProps {
  symbol: string;
}

// Simplified mock data generator
const generateMockData = (symbol: string): HistoricalPrice[] => {
  const data: HistoricalPrice[] = [];
  const basePrice = 150;
  let currentPrice = basePrice;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const change = (Math.random() - 0.5) * 5;
    currentPrice = Math.max(currentPrice + change, 50);
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: currentPrice,
      high: currentPrice + Math.random() * 2,
      low: currentPrice - Math.random() * 2,
      close: currentPrice,
      adjClose: currentPrice,
      volume: Math.floor(Math.random() * 1000000) + 500000,
      unadjustedVolume: Math.floor(Math.random() * 1000000) + 500000,
      change: 0,
      changePercent: 0,
      vwap: currentPrice,
      label: date.toISOString().split('T')[0],
      changeOverTime: 0
    });
  }
  
  return data;
};

export default function StockChart({ symbol }: StockChartProps) {
  const [data, setData] = useState<HistoricalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('StockChart useEffect running for symbol:', symbol);
    let isMounted = true;

    const fetchHistoricalData = async () => {
      if (!symbol || symbol.trim() === '') {
        console.log('No symbol provided, skipping fetch');
        if (isMounted) setLoading(false);
        return;
      }
      
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
      
      try {
        console.log(`Fetching historical data for ${symbol}...`);
        
        // Try to get real historical data with timeout
        const historicalData = await Promise.race([
          stockApi.getHistoricalPrices(symbol),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000)) // 10 second timeout
        ]);
        
        if (!historicalData) {
          throw new Error('API request timeout');
        }
        
        console.log('Raw historical data:', historicalData);
        console.log('Data length:', historicalData?.length);
        
        if (historicalData && historicalData.length > 0) {
          // Take only the last 30 days and ensure it's sorted oldest to newest
          const recentData = historicalData.slice(0, 30).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          console.log('Processed data for chart:', recentData);
          if (isMounted) {
            setData(recentData);
            setError(null);
            setLoading(false);
          }
        } else {
          console.log('No real data available, using mock data');
          const mockData = generateMockData(symbol);
          if (isMounted) {
            setData(mockData);
            setError('Real historical data not available - showing mock data');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error fetching historical data:', err);
        if (isMounted) {
          const mockData = generateMockData(symbol);
          setData(mockData);
          setError('API error - showing mock data for demonstration');
          setLoading(false);
        }
      }
    };

    fetchHistoricalData();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [symbol]); // <-- CRITICAL: Add dependency array

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (value: number) => {
    return `${value.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading chart data...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No Chart Data</p>
          <p className="text-gray-500 text-sm mt-1">No historical data available for {symbol}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h4 className="text-lg font-medium text-gray-900">
          {symbol} - Last 30 Days ({data.length} data points)
        </h4>
        <p className="text-sm text-gray-600">
          {data.length > 0 && `${formatDate(data[0].date)} to ${formatDate(data[data.length - 1].date)}`}
        </p>
        {error && (
          <p className="text-sm text-yellow-600 mt-1">
            ⚠️ {error}
          </p>
        )}
      </div>
      
      <div className="h-64 w-full bg-gray-50 border rounded">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={formatPrice}
              stroke="#666"
              fontSize={12}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip 
              labelFormatter={(value) => `Date: ${formatDate(value as string)}`}
              formatter={(value: number) => [formatPrice(value), 'Close Price']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#2563eb', strokeWidth: 2 }}
              name="Close Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}