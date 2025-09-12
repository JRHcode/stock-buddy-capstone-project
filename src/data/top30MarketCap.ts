// Top 30 S&P 500 companies by market capitalization
// This data would typically be updated daily after market close
export interface MarketCapStock {
  symbol: string;
  name: string;
  marketCap: number; // in billions
  price: number;
  change: number;
  changePercent: number;
}

export const top30MarketCapStocks: MarketCapStock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    marketCap: 3000.0,
    price: 189.50,
    change: 2.15,
    changePercent: 1.15
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    marketCap: 2800.0,
    price: 378.85,
    change: -1.20,
    changePercent: -0.32
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc. Class A',
    marketCap: 1700.0,
    price: 138.21,
    change: 0.85,
    changePercent: 0.62
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    marketCap: 1600.0,
    price: 153.75,
    change: -0.95,
    changePercent: -0.61
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    marketCap: 1500.0,
    price: 875.30,
    change: 15.60,
    changePercent: 1.81
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    marketCap: 800.0,
    price: 248.50,
    change: 3.75,
    changePercent: 1.53
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    marketCap: 750.0,
    price: 296.75,
    change: -2.10,
    changePercent: -0.70
  },
  {
    symbol: 'BRK.B',
    name: 'Berkshire Hathaway Inc. Class B',
    marketCap: 700.0,
    price: 454.20,
    change: 1.85,
    changePercent: 0.41
  },
  {
    symbol: 'LLY',
    name: 'Eli Lilly and Company',
    marketCap: 650.0,
    price: 692.15,
    change: -5.30,
    changePercent: -0.76
  },
  {
    symbol: 'V',
    name: 'Visa Inc.',
    marketCap: 500.0,
    price: 245.80,
    change: 1.20,
    changePercent: 0.49
  },
  {
    symbol: 'UNH',
    name: 'UnitedHealth Group Incorporated',
    marketCap: 480.0,
    price: 512.45,
    change: -3.15,
    changePercent: -0.61
  },
  {
    symbol: 'XOM',
    name: 'Exxon Mobil Corporation',
    marketCap: 450.0,
    price: 108.75,
    change: 0.95,
    changePercent: 0.88
  },
  {
    symbol: 'JNJ',
    name: 'Johnson & Johnson',
    marketCap: 420.0,
    price: 162.30,
    change: -0.45,
    changePercent: -0.28
  },
  {
    symbol: 'WMT',
    name: 'Walmart Inc.',
    marketCap: 410.0,
    price: 159.85,
    change: 0.75,
    changePercent: 0.47
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    marketCap: 400.0,
    price: 148.90,
    change: -1.85,
    changePercent: -1.23
  },
  {
    symbol: 'MA',
    name: 'Mastercard Incorporated',
    marketCap: 380.0,
    price: 398.75,
    change: 2.40,
    changePercent: 0.61
  },
  {
    symbol: 'PG',
    name: 'The Procter & Gamble Company',
    marketCap: 360.0,
    price: 152.85,
    change: -0.30,
    changePercent: -0.20
  },
  {
    symbol: 'AVGO',
    name: 'Broadcom Inc.',
    marketCap: 350.0,
    price: 865.40,
    change: 8.20,
    changePercent: 0.96
  },
  {
    symbol: 'HD',
    name: 'The Home Depot Inc.',
    marketCap: 340.0,
    price: 328.50,
    change: -1.75,
    changePercent: -0.53
  },
  {
    symbol: 'CVX',
    name: 'Chevron Corporation',
    marketCap: 320.0,
    price: 158.65,
    change: 1.10,
    changePercent: 0.70
  },
  {
    symbol: 'MRK',
    name: 'Merck & Co. Inc.',
    marketCap: 310.0,
    price: 124.75,
    change: -0.85,
    changePercent: -0.68
  },
  {
    symbol: 'ABBV',
    name: 'AbbVie Inc.',
    marketCap: 300.0,
    price: 169.30,
    change: 0.95,
    changePercent: 0.56
  },
  {
    symbol: 'KO',
    name: 'The Coca-Cola Company',
    marketCap: 290.0,
    price: 67.85,
    change: -0.15,
    changePercent: -0.22
  },
  {
    symbol: 'COST',
    name: 'Costco Wholesale Corporation',
    marketCap: 280.0,
    price: 628.45,
    change: 4.30,
    changePercent: 0.69
  },
  {
    symbol: 'PEP',
    name: 'PepsiCo Inc.',
    marketCap: 270.0,
    price: 195.40,
    change: -0.60,
    changePercent: -0.31
  },
  {
    symbol: 'TMO',
    name: 'Thermo Fisher Scientific Inc.',
    marketCap: 260.0,
    price: 675.20,
    change: -2.85,
    changePercent: -0.42
  },
  {
    symbol: 'ADBE',
    name: 'Adobe Inc.',
    marketCap: 250.0,
    price: 548.75,
    change: 6.45,
    changePercent: 1.19
  },
  {
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    marketCap: 240.0,
    price: 548.25,
    change: -3.20,
    changePercent: -0.58
  },
  {
    symbol: 'BAC',
    name: 'Bank of America Corporation',
    marketCap: 230.0,
    price: 28.95,
    change: -0.35,
    changePercent: -1.19
  },
  {
    symbol: 'CRM',
    name: 'Salesforce Inc.',
    marketCap: 220.0,
    price: 225.80,
    change: 2.90,
    changePercent: 1.30
  }
];

// Function to get fresh market cap data (would integrate with real API)
export const getTop30MarketCap = async (): Promise<MarketCapStock[]> => {
  // In a real implementation, this would fetch from a financial API
  // For now, return the static data with some randomized price movements
  return top30MarketCapStocks.map(stock => ({
    ...stock,
    price: stock.price + (Math.random() - 0.5) * 5, // Add some random price movement
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 3
  }));
};