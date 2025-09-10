import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam) : 30;

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    console.log(`API: Fetching historical data for: ${symbol.toUpperCase()} (${days} days)`);
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const historicalData = await yahooFinance.historical(symbol.toUpperCase(), {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    });
    
    console.log(`API: Retrieved ${historicalData?.length || 0} historical data points`);
    
    if (!historicalData || historicalData.length === 0) {
      console.log('API: No historical data received');
      return NextResponse.json(null);
    }

    // Transform the Yahoo Finance response to our format
    const transformedData = historicalData.reverse().map((item, index) => {
      const currentClose = item.close || 0;
      const previousClose = index < historicalData.length - 1 ? historicalData[index + 1].close || 0 : currentClose;
      const change = currentClose - previousClose;
      const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

      return {
        date: item.date ? item.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        open: item.open || 0,
        high: item.high || 0,
        low: item.low || 0,
        close: currentClose,
        adjClose: item.adjClose || currentClose,
        volume: item.volume || 0,
        unadjustedVolume: item.volume || 0,
        change: change,
        changePercent: changePercent,
        vwap: currentClose, // Using close as vwap approximation
        label: item.date ? item.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        changeOverTime: 0 // Could be calculated if needed
      };
    });

    return NextResponse.json(transformedData);
    
  } catch (error) {
    console.error('API: Error fetching historical prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}