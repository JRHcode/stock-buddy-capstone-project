
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/models/Watchlist';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded.id;
  } catch (error) {
    return null;
  }
}

// GET - Fetch user's watchlist
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const watchlist = await Watchlist.findOne({ userId });
    
    if (!watchlist) {
      // Create empty watchlist if it doesn't exist
      const newWatchlist = new Watchlist({
        userId,
        stocks: []
      });
      await newWatchlist.save();
      return NextResponse.json({ stocks: [] });
    }

    return NextResponse.json({ stocks: watchlist.stocks });
  } catch (error) {
    console.error('GET Watchlist Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add stock to watchlist
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol, name, lastPrice, change, changePercent } = await request.json();

    if (!symbol || !name) {
      return NextResponse.json({ error: 'Symbol and name are required' }, { status: 400 });
    }

    let watchlist = await Watchlist.findOne({ userId });

    if (!watchlist) {
      watchlist = new Watchlist({ userId, stocks: [] });
    }

    // Check if stock already exists in watchlist
    const existingStock = watchlist.stocks.find(stock => stock.symbol === symbol.toUpperCase());
    if (existingStock) {
      return NextResponse.json({ error: 'Stock already in watchlist' }, { status: 409 });
    }

    // Add stock to watchlist
    watchlist.stocks.push({
      symbol: symbol.toUpperCase(),
      name,
      lastPrice,
      change,
      changePercent,
      addedAt: new Date()
    });

    await watchlist.save();

    return NextResponse.json({ 
      message: 'Stock added to watchlist',
      stocks: watchlist.stocks 
    });
  } catch (error) {
    console.error('POST Watchlist Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update entire watchlist (sync from frontend)
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stocks } = await request.json();

    if (!Array.isArray(stocks)) {
      return NextResponse.json({ error: 'Stocks must be an array' }, { status: 400 });
    }

    let watchlist = await Watchlist.findOne({ userId });

    if (!watchlist) {
      watchlist = new Watchlist({ userId, stocks: [] });
    }

    // Update the entire stocks array
    watchlist.stocks = stocks.map((stock: any) => ({
      symbol: stock.symbol?.toUpperCase(),
      name: stock.name,
      lastPrice: stock.lastPrice,
      change: stock.change,
      changePercent: stock.changePercent,
      addedAt: stock.addedAt || new Date()
    }));

    await watchlist.save();

    return NextResponse.json({ 
      message: 'Watchlist updated',
      stocks: watchlist.stocks 
    });
  } catch (error) {
    console.error('PUT Watchlist Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}