import { NextRequest, NextResponse } from 'next/server';
import { MarketCapStock } from '@/data/top30MarketCap';
import yahooFinance from 'yahoo-finance2';

// Top 30 S&P 500 companies by market cap (symbols)
const SP30_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 
  'TSLA', 'META', 'BRK.B', 'LLY', 'V',
  'UNH', 'XOM', 'JNJ', 'WMT', 'JPM',
  'MA', 'PG', 'AVGO', 'HD', 'CVX',
  'MRK', 'ABBV', 'KO', 'COST', 'PEP',
  'TMO', 'ADBE', 'NFLX', 'BAC', 'CRM'
];

// Company names mapping
const COMPANY_NAMES: { [key: string]: string } = {
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc. Class A',
  'AMZN': 'Amazon.com Inc.',
  'NVDA': 'NVIDIA Corporation',
  'TSLA': 'Tesla Inc.',
  'META': 'Meta Platforms Inc.',
  'BRK.B': 'Berkshire Hathaway Inc. Class B',
  'LLY': 'Eli Lilly and Company',
  'V': 'Visa Inc.',
  'UNH': 'UnitedHealth Group Incorporated',
  'XOM': 'Exxon Mobil Corporation',
  'JNJ': 'Johnson & Johnson',
  'WMT': 'Walmart Inc.',
  'JPM': 'JPMorgan Chase & Co.',
  'MA': 'Mastercard Incorporated',
  'PG': 'The Procter & Gamble Company',
  'AVGO': 'Broadcom Inc.',
  'HD': 'The Home Depot Inc.',
  'CVX': 'Chevron Corporation',
  'MRK': 'Merck & Co. Inc.',
  'ABBV': 'AbbVie Inc.',
  'KO': 'The Coca-Cola Company',
  'COST': 'Costco Wholesale Corporation',
  'PEP': 'PepsiCo Inc.',
  'TMO': 'Thermo Fisher Scientific Inc.',
  'ADBE': 'Adobe Inc.',
  'NFLX': 'Netflix Inc.',
  'BAC': 'Bank of America Corporation',
  'CRM': 'Salesforce Inc.'
};

// Fetch stock data using yahoo-finance2 library (same as 52 Week Highs)
const fetchStockData = async (symbol: string): Promise<MarketCapStock | null> => {
  try {
    // Yahoo Finance uses BRK-B instead of BRK.B
    const yahooSymbol = symbol === 'BRK.B' ? 'BRK-B' : symbol;
    
    // Use yahoo-finance2 library to get quote data
    const quote = await yahooFinance.quote(yahooSymbol);
    
    if (!quote) {
      console.error(`No quote data for ${symbol}`);
      return null;
    }

    const currentPrice = quote.regularMarketPrice || 0;
    const previousClose = quote.regularMarketPreviousClose || currentPrice;
    const change = quote.regularMarketChange || 0;
    const changePercent = quote.regularMarketChangePercent || 0;
    const marketCap = quote.marketCap || 0;

    console.log(`${symbol}: price=${currentPrice}, marketCap=${marketCap}, change=${change}`);

    return {
      symbol: symbol.toUpperCase(), // Keep original symbol (BRK.B not BRK-B)
      name: COMPANY_NAMES[symbol] || `${symbol} Company`,
      marketCap: marketCap || 0, // Keep raw value for proper formatting
      price: Math.round(currentPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return null;
  }
};

// Get S&P 30 stocks with real EOD data
const getSP30Stocks = async (): Promise<MarketCapStock[]> => {
  try {
    console.log('Fetching S&P 30 data for', SP30_SYMBOLS.length, 'symbols');
    
    // Fetch all stocks in parallel
    const stockPromises = SP30_SYMBOLS.map(symbol => fetchStockData(symbol));
    const allStocks = await Promise.all(stockPromises);
    
    // Filter out nulls and sort by market cap
    const validStocks = allStocks
      .filter((stock): stock is MarketCapStock => stock !== null)
      .sort((a, b) => b.marketCap - a.marketCap);
    
    console.log(`Successfully fetched ${validStocks.length} out of ${SP30_SYMBOLS.length} stocks`);
    
    return validStocks;
  } catch (error) {
    console.error('Error fetching S&P 30 data:', error);
    throw error;
  }
};

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching S&P 30 real-time data');
    
    const stocks = await getSP30Stocks();
    
    if (stocks.length === 0) {
      throw new Error('No stock data retrieved');
    }
    
    return NextResponse.json({
      success: true,
      data: stocks,
      count: stocks.length,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('S&P 30 API error:', error);
    
    // Return error response with fallback to static data
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch S&P 30 data',
      message: 'Using cached data as fallback'
    }, { status: 500 });
  }
}