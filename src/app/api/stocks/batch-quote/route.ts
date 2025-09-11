import { NextRequest, NextResponse } from 'next/server';

// Fetch real-time price data for multiple stocks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols } = body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        { error: 'Symbols array is required' },
        { status: 400 }
      );
    }

    console.log('Fetching batch quotes for symbols:', symbols);

    // Fetch data for all symbols in parallel
    const promises = symbols.map(async (symbol: string) => {
      try {
        // Yahoo Finance uses different format for BRK.B
        const yahooSymbol = symbol === 'BRK.B' ? 'BRK-B' : symbol;
        
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
        
        const change = currentPrice - previousClose;
        const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

        return {
          symbol: symbol, // Keep original symbol format
          price: Math.round(currentPrice * 100) / 100,
          change: Math.round(change * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
          previousClose: Math.round(previousClose * 100) / 100
        };
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    
    // Filter out failed requests and create a map
    const priceMap: { [key: string]: any } = {};
    results.forEach(result => {
      if (result) {
        priceMap[result.symbol] = result;
      }
    });

    console.log(`Successfully fetched ${Object.keys(priceMap).length} out of ${symbols.length} stocks`);

    return NextResponse.json({
      success: true,
      data: priceMap,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch quote API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stock prices'
    }, { status: 500 });
  }
}