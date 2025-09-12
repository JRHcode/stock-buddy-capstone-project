// Stock Price Service for fetching real-time stock prices using Yahoo Finance API

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

// Cache for storing recent price data to avoid excessive API calls
interface PriceCache {
  data: StockPrice;
  timestamp: number;
}

const priceCache = new Map<string, PriceCache>();
const CACHE_DURATION = 60000; // 1 minute cache

// Yahoo Finance API endpoints
const YAHOO_FINANCE_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

// Parse Yahoo Finance response
const parseYahooResponse = (symbol: string, data: any): StockPrice | null => {
  try {
    if (!data.chart?.result?.[0]) {
      console.warn(`No data found for symbol: ${symbol}`);
      return null;
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    
    if (!meta) {
      console.warn(`No meta data found for symbol: ${symbol}`);
      return null;
    }

    const currentPrice = meta.regularMarketPrice || meta.previousClose;
    const previousClose = meta.previousClose;
    
    if (currentPrice === undefined || previousClose === undefined) {
      console.warn(`Missing price data for symbol: ${symbol}`);
      return null;
    }

    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol: symbol.toUpperCase(),
      price: Math.round(currentPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error(`Error parsing Yahoo Finance response for ${symbol}:`, error);
    return null;
  }
};

// Fetch stock price from Yahoo Finance API
const fetchFromYahooFinance = async (symbol: string): Promise<StockPrice | null> => {
  try {
    console.log(`Fetching real-time price for ${symbol} from Yahoo Finance`);
    
    const url = `${YAHOO_FINANCE_BASE_URL}/${encodeURIComponent(symbol)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.warn(`Yahoo Finance API responded with status: ${response.status} for ${symbol}`);
      return null;
    }

    const data = await response.json();
    return parseYahooResponse(symbol, data);
  } catch (error) {
    console.error(`Error fetching from Yahoo Finance for ${symbol}:`, error);
    return null;
  }
};

// Fallback mock data generator (used when API fails)
const generateFallbackPrice = (symbol: string): StockPrice => {
  const basePrices: Record<string, number> = {
    'AAPL': 175,
    'GOOGL': 140,
    'MSFT': 380,
    'TSLA': 200,
    'AMZN': 155,
    'NFLX': 450,
    'META': 320,
    'NVDA': 500,
    'JPM': 480,
    'SPY': 450,
    'QQQ': 350,
    'VOO': 400,
    'VTI': 220,
  };
  
  const basePrice = basePrices[symbol.toUpperCase()] || 100;
  const changePercent = (Math.random() - 0.5) * 4; // -2% to +2%
  const change = (basePrice * changePercent) / 100;
  const currentPrice = basePrice + change;
  
  console.warn(`Using fallback mock price for ${symbol}`);
  
  return {
    symbol: symbol.toUpperCase(),
    price: Math.round(currentPrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    lastUpdated: new Date(),
  };
};

// Main function to get stock price with caching and fallback
export const getStockPrice = async (symbol: string): Promise<StockPrice | null> => {
  const normalizedSymbol = symbol.toUpperCase();
  const now = Date.now();
  
  // Check cache first
  const cached = priceCache.get(normalizedSymbol);
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`Using cached price for ${symbol}`);
    return cached.data;
  }

  try {
    // Try to fetch from Yahoo Finance
    const price = await fetchFromYahooFinance(normalizedSymbol);
    
    if (price) {
      // Cache the successful result
      priceCache.set(normalizedSymbol, {
        data: price,
        timestamp: now,
      });
      console.log(`Fetched real-time price for ${symbol}: $${price.price}`);
      return price;
    }
    
    // If Yahoo Finance fails, use fallback
    const fallbackPrice = generateFallbackPrice(normalizedSymbol);
    
    // Cache fallback for shorter duration
    priceCache.set(normalizedSymbol, {
      data: fallbackPrice,
      timestamp: now - (CACHE_DURATION / 2), // Shorter cache time for fallback
    });
    
    return fallbackPrice;
    
  } catch (error) {
    console.error(`Error in getStockPrice for ${symbol}:`, error);
    
    // Return cached data if available, even if expired
    if (cached) {
      console.log(`Using expired cache for ${symbol} due to error`);
      return cached.data;
    }
    
    // Last resort: generate fallback
    return generateFallbackPrice(normalizedSymbol);
  }
};

// Get multiple stock prices at once
export const getMultipleStockPrices = async (symbols: string[]): Promise<Record<string, StockPrice | null>> => {
  console.log(`Fetching prices for ${symbols.length} symbols:`, symbols);
  
  const prices: Record<string, StockPrice | null> = {};
  
  // Fetch prices for all symbols
  const pricePromises = symbols.map(async (symbol) => {
    const price = await getStockPrice(symbol);
    prices[symbol.toUpperCase()] = price;
  });
  
  await Promise.all(pricePromises);
  
  console.log('Fetched prices:', Object.keys(prices).length);
  return prices;
};

// Force update a stock price (simulate price movement for testing)
export const simulatePriceMovement = (symbol: string, targetPrice: number): void => {
  const normalizedSymbol = symbol.toUpperCase();
  const now = Date.now();
  
  // Create simulated price data
  const simulatedPrice: StockPrice = {
    symbol: normalizedSymbol,
    price: targetPrice,
    change: targetPrice * 0.02, // Simulate 2% change
    changePercent: 2.0,
    lastUpdated: new Date(),
  };
  
  // Override cache with simulated data (short duration for testing)
  priceCache.set(normalizedSymbol, {
    data: simulatedPrice,
    timestamp: now,
  });
  
  console.log(`Simulated price movement for ${symbol} to $${targetPrice}`);
};

// Clear price cache (useful for testing or refreshing data)
export const clearPriceCache = (symbol?: string): void => {
  if (symbol) {
    const normalizedSymbol = symbol.toUpperCase();
    priceCache.delete(normalizedSymbol);
    console.log(`Cleared cache for ${symbol}`);
  } else {
    priceCache.clear();
    console.log('Cleared all price cache');
  }
};

// Get cache status for debugging
export const getCacheStatus = (): Array<{symbol: string, age: number, price: number}> => {
  const now = Date.now();
  return Array.from(priceCache.entries()).map(([symbol, cache]) => ({
    symbol,
    age: Math.round((now - cache.timestamp) / 1000), // age in seconds
    price: cache.data.price,
  }));
};

/* 
YAHOO FINANCE API INTEGRATION:

This service now uses the Yahoo Finance API for real-time stock prices.

Features:
- Real-time price data from Yahoo Finance
- 1-minute caching to reduce API calls
- Automatic fallback to mock data if API fails
- Support for all major stock symbols
- Price simulation for testing alerts

The Yahoo Finance API is free and doesn't require an API key, but:
- Rate limits may apply for high-volume usage
- For production apps with heavy usage, consider paid alternatives like:
  - Alpha Vantage (free tier: 5 calls/minute, 500 calls/day)
  - IEX Cloud (free tier: 50,000 calls/month)
  - Polygon.io (free tier: 5 calls/minute)
  - Quandl/Nasdaq Data Link

Alternative API Integration Example (Alpha Vantage):

export const getStockPriceAlphaVantage = async (symbol: string): Promise<StockPrice | null> => {
  const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
  if (!API_KEY) return null;
  
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
  );
  
  const data = await response.json();
  const quote = data['Global Quote'];
  
  if (!quote) return null;
  
  return {
    symbol: quote['01. symbol'],
    price: parseFloat(quote['05. price']),
    change: parseFloat(quote['09. change']),
    changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
    lastUpdated: new Date(),
  };
};
*/