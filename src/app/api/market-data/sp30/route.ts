import { NextRequest, NextResponse } from 'next/server';
import { MarketCapStock } from '@/data/top30MarketCap';

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

// Fetch stock data from Yahoo Finance
const fetchStockData = async (symbol: string): Promise<MarketCapStock | null> => {
  try {
    // Yahoo Finance uses BRK-B instead of BRK.B
    const yahooSymbol = symbol === 'BRK.B' ? 'BRK-B' : symbol;
    
    // Use the same endpoint as 52-week highs for consistency
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=1d&interval=1d`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.chart?.result?.[0]?.meta) {
      console.error(`No data for ${symbol}`);
      return null;
    }

    const meta = data.chart.result[0].meta;
    const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
    const previousClose = meta.previousClose || meta.chartPreviousClose || currentPrice;
    const marketCap = meta.marketCap || 0;
    
    const change = currentPrice - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

    console.log(`${symbol}: price=${currentPrice}, marketCap=${marketCap}, change=${change}`);

    return {
      symbol: symbol.toUpperCase(), // Keep original symbol (BRK.B not BRK-B)
      name: COMPANY_NAMES[symbol] || `${symbol} Company`,
      marketCap: marketCap > 0 ? Math.round(marketCap / 1000000000) : 0, // Convert to billions
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