import { NextRequest, NextResponse } from 'next/server';
import { getStockPrice } from '@/lib/stockPriceService';
import { WeekHighStock, weekHigh52Stocks } from '@/data/52WeekHighs';
import yahooFinance from 'yahoo-finance2';

// Extended Yahoo Finance API for fetching detailed stock data including 52-week highs
const fetchStockDetails = async (symbol: string): Promise<any> => {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching stock details for ${symbol}:`, error);
    return null;
  }
};

// Get stock data using yahoo-finance2 library (same as quote API)
const getStockWithHighData = async (symbol: string): Promise<Partial<WeekHighStock> | null> => {
  try {
    // Get basic quote data using the same method as the working quote API
    const quote = await yahooFinance.quote(symbol.toUpperCase());
    
    if (!quote) {
      return null;
    }

    const currentPrice = quote.regularMarketPrice || 0;
    const previousClose = quote.regularMarketPreviousClose || currentPrice;
    const change = quote.regularMarketChange || 0;
    const changePercent = quote.regularMarketChangePercent || 0;
    const fiftyTwoWeekHigh = quote.fiftyTwoWeekHigh;
    const marketCap = quote.marketCap || 0;
    const volume = quote.regularMarketVolume || 0;
    
    if (!currentPrice || !fiftyTwoWeekHigh) {
      return null;
    }

    const percentFromHigh = ((currentPrice - fiftyTwoWeekHigh) / fiftyTwoWeekHigh) * 100;
    
    console.log(`${symbol} DEBUG - Using yahoo-finance2 quote data:`, {
      currentPrice,
      previousClose,
      change,
      changePercent,
      fiftyTwoWeekHigh,
      percentFromHigh,
      marketCap,
      volume
    });

    return {
      symbol: symbol.toUpperCase(),
      price: Math.round(currentPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      weekHigh52: Math.round(fiftyTwoWeekHigh * 100) / 100,
      percentFromHigh: Math.round(percentFromHigh * 100) / 100,
      avgVolume: 0, // Not available in basic quote
      marketCap: marketCap || 0,
      volume: volume || 0,
      optionVolume: 0
    };
  } catch (error) {
    console.error(`Error getting stock data for ${symbol}:`, error);
    return null;
  }
};

// Get stocks that are within 2% of their 52-week high
const get52WeekHighStocks = async (): Promise<WeekHighStock[]> => {
  try {
    // For demo purposes, we'll use a curated list of symbols that commonly hit 52-week highs
    // In production, you'd scan the entire market or use a screener API
    const candidateSymbols = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'ADBE', 'CRM', 'NFLX',
      'AVGO', 'COST', 'AMD', 'QCOM', 'INTC', 'PYPL', 'UBER', 'SHOP', 'ROKU', 'ZM',
      'DOCU', 'SQ', 'SNAP', 'PINS', 'COIN', 'RBLX', 'HOOD', 'PLTR', 'CRWD', 'SNOW'
    ];

    console.log('Fetching 52-week high data for', candidateSymbols.length, 'symbols');

    const stockPromises = candidateSymbols.map(async (symbol) => {
      const stockData = await getStockWithHighData(symbol);
      if (!stockData) return null;

      // Get the company name from our static data or use a default
      const knownStock = weekHigh52Stocks.find(s => s.symbol === symbol);
      const name = knownStock?.name || `${symbol} Company`;

      return {
        ...stockData,
        name,
        symbol
      } as WeekHighStock;
    });

    const allStocks = await Promise.all(stockPromises);
    
    console.log('Raw API results:', allStocks.filter(s => s !== null).length, 'valid responses out of', candidateSymbols.length);
    
    // Debug each stock's filtering criteria
    const debugStocks = allStocks.filter(stock => stock !== null).map(stock => {
      const priceCheck = stock!.price >= 25;
      const highCheck = stock!.percentFromHigh >= -2.0;
      const volumeCheck = (stock!.volume || stock!.avgVolume || 0) >= 1000000;
      const marketCapCheck = (stock!.marketCap || 0) >= 50000000000;
      
      console.log(`${stock!.symbol}: price=$${stock!.price} (${priceCheck}), %FromHigh=${stock!.percentFromHigh}% (${highCheck}), volume=${stock!.volume || stock!.avgVolume} (${volumeCheck}), marketCap=${stock!.marketCap} (${marketCapCheck})`);
      
      return {
        stock: stock!,
        passes: priceCheck && highCheck && volumeCheck && marketCapCheck
      };
    });
    
    console.log('Stocks passing all criteria:', debugStocks.filter(d => d.passes).length);
    
    // Focus on criteria we can get from Yahoo Finance
    const validStocks = allStocks.filter((stock): stock is WeekHighStock => 
      stock !== null && 
      stock.price >= 25 && // Price >= $25
      stock.percentFromHigh >= -5.0 && // Within 5% of 52-week high (tightened from 10%)
      (stock.volume || stock.avgVolume || 0) >= 100000 // Volume >= 100,000 (much more relaxed)
      // Removed market cap requirement since it's not available from this endpoint
    );

    // Sort by how close they are to their 52-week high (closest first)
    const sorted = validStocks.sort((a, b) => b.percentFromHigh - a.percentFromHigh);

    // Return top 25
    return sorted.slice(0, 25);

  } catch (error) {
    console.error('Error fetching 52-week highs:', error);
    // Return mock data on error
    return weekHigh52Stocks.slice(0, 25);
  }
};

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching 52-week highs data');

    const stocks = await get52WeekHighStocks();

    return NextResponse.json({
      success: true,
      data: stocks,
      count: stocks.length,
      lastUpdated: new Date().toISOString(),
      criteria: {
        withinPercentOfHigh: 5,
        minVolume: 100000,
        minPrice: 25
      }
    });

  } catch (error) {
    console.error('52-week highs API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch 52-week highs data',
      data: weekHigh52Stocks.slice(0, 25) // Fallback to mock data
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, symbol } = body;

    if (action === 'test-single-stock' && symbol) {
      console.log(`Testing 52-week high data for ${symbol}`);
      
      const details = await fetchStockDetails(symbol);
      if (!details) {
        throw new Error('Failed to fetch stock details');
      }

      const parsed = parseStockDetails(symbol, details);
      if (!parsed) {
        throw new Error('Failed to parse stock details');
      }

      return NextResponse.json({
        success: true,
        data: parsed,
        rawData: details.chart.result[0].meta // Include raw data for debugging
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('52-week highs POST API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}