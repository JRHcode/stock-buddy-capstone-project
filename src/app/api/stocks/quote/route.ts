import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    console.log(`API: Fetching stock quote for: ${symbol.toUpperCase()}`);
    
    const quote = await yahooFinance.quote(symbol.toUpperCase());
    
    if (!quote) {
      console.log('API: No quote data received');
      return NextResponse.json(
        { error: 'No quote data found for this symbol' },
        { status: 404 }
      );
    }

    console.log('API: Yahoo Finance quote response received');
    
    // Transform the Yahoo Finance response to match our StockQuote interface
    const transformedQuote = {
      symbol: quote.symbol || symbol.toUpperCase(),
      name: quote.longName || quote.shortName || `${symbol.toUpperCase()} Company`,
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changesPercentage: quote.regularMarketChangePercent ? quote.regularMarketChangePercent * 100 : 0,
      volume: quote.regularMarketVolume || 0,
      marketCap: quote.marketCap || 0,
      pe: quote.trailingPE || quote.forwardPE || 0,
      dayHigh: quote.regularMarketDayHigh || 0,
      dayLow: quote.regularMarketDayLow || 0,
      open: quote.regularMarketOpen || 0,
      previousClose: quote.regularMarketPreviousClose || 0,
      yearHigh: quote.fiftyTwoWeekHigh || 0,
      yearLow: quote.fiftyTwoWeekLow || 0,
      priceAvg50: quote.fiftyDayAverage || 0,
      priceAvg200: quote.twoHundredDayAverage || 0,
      eps: (quote as any).trailingEps || (quote as any).forwardEps || 0,
      sharesOutstanding: quote.sharesOutstanding || 0,
      exchange: quote.fullExchangeName || quote.exchange || 'N/A',
      avgVolume: quote.averageDailyVolume3Month || quote.averageDailyVolume10Day || 0,
      earningsAnnouncement: quote.earningsTimestamp ? new Date(quote.earningsTimestamp * 1000).toISOString().split('T')[0] : '',
      timestamp: Math.floor(Date.now() / 1000),
      // Additional fields from profile - these will be populated if available
      industry: (quote as any).industry || 'N/A',
      sector: (quote as any).sector || 'N/A',
      country: (quote as any).country || 'N/A',
      city: (quote as any).city || 'N/A',
      state: (quote as any).state || 'N/A',
      ceo: 'N/A', // Not available in quote endpoint
      fullTimeEmployees: (quote as any).fullTimeEmployees || 0,
      beta: quote.beta || 0,
      lastDiv: (quote as any).dividendRate || 0,
      range: quote.fiftyTwoWeekLow && quote.fiftyTwoWeekHigh 
        ? `${quote.fiftyTwoWeekLow} - ${quote.fiftyTwoWeekHigh}` 
        : 'N/A',
      dcf: 0, // Not available in Yahoo Finance
      dcfDiff: 0, // Not available in Yahoo Finance
      image: '', // Not available in basic quote
      hasHistoricalData: true // Yahoo Finance generally has historical data for most stocks
    };

    return NextResponse.json(transformedQuote);
    
  } catch (error) {
    console.error('API: Error fetching stock quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock quote' },
      { status: 500 }
    );
  }
}