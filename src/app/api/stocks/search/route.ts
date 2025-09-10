import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter (q) is required' },
        { status: 400 }
      );
    }

    console.log(`API: Searching for stocks with query: ${query}`);
    
    const searchResults = await yahooFinance.search(query);
    
    if (!searchResults || !searchResults.quotes || searchResults.quotes.length === 0) {
      console.log('API: No search results found');
      return NextResponse.json([]);
    }

    console.log(`API: Found ${searchResults.quotes.length} search results`);

    // Transform Yahoo Finance search results to our format
    const transformedResults = searchResults.quotes.slice(0, 10).map(result => ({
      symbol: (result as any).symbol || '',
      name: (result as any).longname || (result as any).shortname || (result as any).symbol || '',
      currency: (result as any).currency || 'USD',
      stockExchange: (result as any).exchDisp || (result as any).exchange || '',
      exchangeShortName: (result as any).exchange || ''
    }));

    return NextResponse.json(transformedResults);
    
  } catch (error) {
    console.error('API: Error searching stocks:', error);
    return NextResponse.json(
      { error: 'Failed to search stocks' },
      { status: 500 }
    );
  }
}