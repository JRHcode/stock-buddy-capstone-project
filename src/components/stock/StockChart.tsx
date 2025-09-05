'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { stockApi, HistoricalPrice } from '@/services/stockApi';

interface StockChartProps {
  symbol: string;
}

// Add this mock data generator function at the top of the component:
const generateMockData = (symbol: string): HistoricalPrice[] => {
  const data: HistoricalPrice[] = [];
  const today = new Date();
  let basePrice = 150; // Starting price
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate some realistic price movement
    const change = (Math.random() - 0.5) * 10; // Random change between -5 and +5
    basePrice += change;
    const open = basePrice + (Math.random() - 0.5) * 2;
    const close = basePrice;
    const high = Math.max(open, close) + Math.random() * 3;
    const low = Math.min(open, close) - Math.random() * 3;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      adjClose: Number(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 500000,
      unadjustedVolume: Math.floor(Math.random() * 1000000) + 500000,
      change: Number(change.toFixed(2)),
      changePercent: Number((change / basePrice * 100).toFixed(2)),
      vwap: Number(((open + high + low + close) / 4).toFixed(2)),
      label: `${date.toISOString().split('T')[0]}`,
      changeOverTime: Number((change / basePrice).toFixed(4))
    });
  }
  
  return data;
};

export default function StockChart({ symbol }: StockChartProps) {
  const [data, setData] = useState<HistoricalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!symbol) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching historical data for ${symbol}...`);
        const historicalData = await stockApi.getHistoricalPrices(symbol);
        
        console.log('Raw historical data:', historicalData);
        console.log('Data length:', historicalData?.length);
        
        if (historicalData && historicalData.length > 0) {
          // Take only the last 30 days for better performance and readability
          const recentData = historicalData.slice(0, 30).reverse(); // Reverse to show oldest to newest
          console.log('Processed data for chart:', recentData);
          setData(recentData);
        } else {
          console.log('No real data available, using mock data for demonstration');
          const mockData = generateMockData(symbol);
          setData(mockData);
          setError('Using mock data - real historical data not available');
        }
      } catch (err) {
        console.error('Error fetching historical data:', err);
        console.log('API failed, using mock data for demonstration');
        const mockData = generateMockData(symbol);
        setData(mockData);
        setError('API error - showing mock data for demonstration');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">Chart Error</p>
          <p className="text-gray-600 text-sm mt-1">{error}</p>
        </div>
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
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              interval="preserveStartEnd"
            />
            <YAxis 
              tickFormatter={formatPrice}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip 
              labelFormatter={(value) => formatDate(value as string)}
              formatter={(value: number) => [formatPrice(value), 'Close Price']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={false}
              name="Close Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}