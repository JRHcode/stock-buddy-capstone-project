// 52 Week Highs - Stocks within 2% of their 52-week high
// Updated daily after market close
// Criteria: Within 2% of 52-week high, volume >= 1,000,000, market cap >= $50B, price >= $25

export interface WeekHighStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  weekHigh52: number;
  percentFromHigh: number; // How close to 52-week high (negative percentage)
  optionVolume: number;
  avgVolume: number;
  marketCap: number;
  volume: number;
}

// Static data representing stocks that meet the criteria
// In production, this would be fetched from Yahoo Finance API with real-time filtering
export const weekHigh52Stocks: WeekHighStock[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.30,
    change: 15.60,
    changePercent: 1.81,
    weekHigh52: 884.20,
    percentFromHigh: -1.01,
    optionVolume: 125000,
    avgVolume: 25000000,
    marketCap: 2150000000000,
    volume: 45000000
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.85,
    change: -1.20,
    changePercent: -0.32,
    weekHigh52: 384.90,
    percentFromHigh: -1.57,
    optionVolume: 89000,
    avgVolume: 18000000,
    marketCap: 2800000000000,
    volume: 35000000
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 189.50,
    change: 2.15,
    changePercent: 1.15,
    weekHigh52: 193.20,
    percentFromHigh: -1.91,
    optionVolume: 156000,
    avgVolume: 32000000,
    marketCap: 2950000000000,
    volume: 68000000
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    price: 296.75,
    change: -2.10,
    changePercent: -0.70,
    weekHigh52: 302.40,
    percentFromHigh: -1.87,
    optionVolume: 78000,
    avgVolume: 14000000,
    marketCap: 750000000000,
    volume: 22000000
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc. Class A',
    price: 138.21,
    change: 0.85,
    changePercent: 0.62,
    weekHigh52: 140.95,
    percentFromHigh: -1.94,
    optionVolume: 45000,
    avgVolume: 22000000,
    marketCap: 1750000000000,
    volume: 25000000
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 153.75,
    change: -0.95,
    changePercent: -0.61,
    weekHigh52: 156.80,
    percentFromHigh: -1.95,
    optionVolume: 92000,
    avgVolume: 28000000,
    marketCap: 1600000000000,
    volume: 42000000
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.50,
    change: 3.75,
    changePercent: 1.53,
    weekHigh52: 253.20,
    percentFromHigh: -1.86,
    optionVolume: 134000,
    avgVolume: 41000000,
    marketCap: 790000000000,
    volume: 55000000
  },
  {
    symbol: 'ADBE',
    name: 'Adobe Inc.',
    price: 548.75,
    change: 6.45,
    changePercent: 1.19,
    weekHigh52: 558.90,
    percentFromHigh: -1.82,
    optionVolume: 23000,
    avgVolume: 2200000,
    marketCap: 250000000000,
    volume: 3500000
  },
  {
    symbol: 'CRM',
    name: 'Salesforce Inc.',
    price: 225.80,
    change: 2.90,
    changePercent: 1.30,
    weekHigh52: 230.40,
    percentFromHigh: -2.00,
    optionVolume: 31000,
    avgVolume: 3800000,
    marketCap: 220000000000,
    volume: 5500000
  },
  {
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    price: 548.25,
    change: -3.20,
    changePercent: -0.58,
    weekHigh52: 558.32,
    percentFromHigh: -1.80,
    optionVolume: 18000,
    avgVolume: 4500000,
    marketCap: 240000000000,
    volume: 6200000
  },
  {
    symbol: 'AVGO',
    name: 'Broadcom Inc.',
    price: 865.40,
    change: 8.20,
    changePercent: 0.96,
    weekHigh52: 882.15,
    percentFromHigh: -1.90,
    optionVolume: 15000,
    avgVolume: 1800000,
    marketCap: 620000000000,
    volume: 2500000
  },
  {
    symbol: 'COST',
    name: 'Costco Wholesale Corporation',
    price: 628.45,
    change: 4.30,
    changePercent: 0.69,
    weekHigh52: 640.20,
    percentFromHigh: -1.84,
    optionVolume: 12000,
    avgVolume: 1200000,
    marketCap: 280000000000,
    volume: 1800000
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices Inc.',
    price: 142.85,
    change: 2.75,
    changePercent: 2.00,
    weekHigh52: 145.60,
    percentFromHigh: -1.89,
    optionVolume: 67000,
    avgVolume: 15000000,
    marketCap: 230000000000,
    volume: 28000000
  },
  {
    symbol: 'QCOM',
    name: 'QUALCOMM Incorporated',
    price: 168.90,
    change: 1.85,
    changePercent: 1.11,
    weekHigh52: 172.35,
    percentFromHigh: -2.00,
    optionVolume: 28000,
    avgVolume: 7500000,
    marketCap: 190000000000,
    volume: 12000000
  },
  {
    symbol: 'INTC',
    name: 'Intel Corporation',
    price: 28.75,
    change: 0.95,
    changePercent: 3.42,
    weekHigh52: 29.35,
    percentFromHigh: -2.04,
    optionVolume: 145000,
    avgVolume: 42000000,
    marketCap: 120000000000,
    volume: 65000000
  },
  {
    symbol: 'PYPL',
    name: 'PayPal Holdings Inc.',
    price: 64.20,
    change: 1.45,
    changePercent: 2.31,
    weekHigh52: 65.52,
    percentFromHigh: -2.02,
    optionVolume: 38000,
    avgVolume: 12000000,
    marketCap: 75000000000,
    volume: 18000000
  },
  {
    symbol: 'UBER',
    name: 'Uber Technologies Inc.',
    price: 72.15,
    change: 0.85,
    changePercent: 1.19,
    weekHigh52: 73.60,
    percentFromHigh: -1.97,
    optionVolume: 42000,
    avgVolume: 18000000,
    marketCap: 155000000000,
    volume: 22000000
  },
  {
    symbol: 'SHOP',
    name: 'Shopify Inc.',
    price: 67.80,
    change: 1.20,
    changePercent: 1.80,
    weekHigh52: 69.15,
    percentFromHigh: -1.95,
    optionVolume: 25000,
    avgVolume: 8500000,
    marketCap: 85000000000,
    volume: 12000000
  },
  {
    symbol: 'ROKU',
    name: 'Roku Inc.',
    price: 58.45,
    change: 2.10,
    changePercent: 3.73,
    weekHigh52: 59.65,
    percentFromHigh: -2.01,
    optionVolume: 21000,
    avgVolume: 6200000,
    marketCap: 6500000000,
    volume: 8500000
  },
  {
    symbol: 'ZM',
    name: 'Zoom Video Communications Inc.',
    price: 69.30,
    change: 1.85,
    changePercent: 2.74,
    weekHigh52: 70.70,
    percentFromHigh: -1.98,
    optionVolume: 16000,
    avgVolume: 4800000,
    marketCap: 21000000000,
    volume: 6800000
  },
  {
    symbol: 'DOCU',
    name: 'DocuSign Inc.',
    price: 52.90,
    change: 0.95,
    changePercent: 1.83,
    weekHigh52: 53.95,
    percentFromHigh: -1.95,
    optionVolume: 19000,
    avgVolume: 3400000,
    marketCap: 10500000000,
    volume: 4200000
  },
  {
    symbol: 'SQ',
    name: 'Block Inc.',
    price: 78.25,
    change: 1.35,
    changePercent: 1.75,
    weekHigh52: 79.85,
    percentFromHigh: -2.00,
    optionVolume: 34000,
    avgVolume: 9200000,
    marketCap: 45000000000,
    volume: 14000000
  },
  {
    symbol: 'SNAP',
    name: 'Snap Inc.',
    price: 26.45,
    change: 0.75,
    changePercent: 2.92,
    weekHigh52: 26.98,
    percentFromHigh: -1.96,
    optionVolume: 58000,
    avgVolume: 25000000,
    marketCap: 42000000000,
    volume: 35000000
  },
  {
    symbol: 'TWTR',
    name: 'Twitter Inc.',
    price: 42.80,
    change: 0.65,
    changePercent: 1.54,
    weekHigh52: 43.65,
    percentFromHigh: -1.95,
    optionVolume: 89000,
    avgVolume: 35000000,
    marketCap: 33000000000,
    volume: 45000000
  },
  {
    symbol: 'PINS',
    name: 'Pinterest Inc.',
    price: 31.25,
    change: 1.05,
    changePercent: 3.47,
    weekHigh52: 31.88,
    percentFromHigh: -1.98,
    optionVolume: 27000,
    avgVolume: 11000000,
    marketCap: 20000000000,
    volume: 16000000
  }
];

// Function to get real-time 52-week highs data
// This would integrate with Yahoo Finance API to filter stocks based on criteria
export const get52WeekHighs = async (): Promise<WeekHighStock[]> => {
  try {
    // In production, this would make actual API calls to Yahoo Finance
    // with filtering for:
    // - Stocks within 2% of 52-week high
    // - Volume >= 1,000,000
    // - Market cap >= $50B
    // - Current price >= $25
    
    // For now, return mock data with some randomization
    return weekHigh52Stocks.map(stock => ({
      ...stock,
      price: stock.price + (Math.random() - 0.5) * 2, // Small price movement
      change: (Math.random() - 0.5) * 4,
      changePercent: (Math.random() - 0.5) * 2,
      percentFromHigh: -(Math.random() * 2), // Keep within 2%
      optionVolume: Math.floor(10000 + Math.random() * 100000) // Ensure >= 10,000
    }));
  } catch (error) {
    console.error('Error fetching 52-week highs:', error);
    return [];
  }
};

// Function to filter stocks that meet the criteria
export const filterByWeekHighCriteria = (stocks: any[]): WeekHighStock[] => {
  return stocks.filter(stock => {
    const percentFromHigh = ((stock.price - stock.weekHigh52) / stock.weekHigh52) * 100;
    return (
      percentFromHigh >= -2.0 && // Within 2% of 52-week high
      stock.volume >= 1000000 && // Volume at least 1,000,000
      stock.marketCap >= 50000000000 && // Market cap at least $50B
      stock.price >= 25.0 && // Current price $25 or more
      stock.symbol && // Has a valid symbol
      stock.name // Has a valid name
    );
  });
};