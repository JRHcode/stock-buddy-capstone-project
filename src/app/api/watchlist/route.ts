import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

type WatchlistItem = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  addedAt: Date;
};

// Helper function to verify JWT token
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  } catch {
    throw new Error('Invalid token');
  }
};

// Helper function to get user from token
const getUserFromToken = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  
  const token = authHeader.substring(7);
  return verifyToken(token);
};

// GET - Fetch user's watchlist
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { userId } = getUserFromToken(request);
    console.log('GET Watchlist - User ID:', userId);
    
    const user = await User.findById(userId).select('watchlist');
    console.log('GET Watchlist - User found:', !!user, 'Watchlist length:', user?.watchlist?.length || 0);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      stocks: user.watchlist || [] 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch watchlist';
    console.error('Watchlist GET error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage === 'Invalid token' || errorMessage === 'No token provided' ? 401 : 500 }
    );
  }
}

// POST - Add stock to watchlist
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { userId } = getUserFromToken(request);
    const body = await request.json();
    const { symbol, name, price, change, changePercent } = body;
    console.log('POST Watchlist - User ID:', userId, 'Data:', { symbol, name, price, change, changePercent });

    if (!symbol || !name) {
      return NextResponse.json(
        { error: 'Symbol and name are required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize watchlist if it doesn't exist
    if (!user.watchlist) {
      user.watchlist = [];
    }

    // Check if stock already exists in watchlist
    const existingStock = user.watchlist.find(
      (stock: WatchlistItem) => stock.symbol.toUpperCase() === symbol.toUpperCase()
    );

    if (existingStock) {
      return NextResponse.json(
        { error: 'Stock already in watchlist' },
        { status: 400 }
      );
    }

    // Add new stock to watchlist
    const newStock = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      name,
      price: price || 0,
      change: change || 0,
      changePercent: changePercent || 0,
      addedAt: new Date()
    };

    user.watchlist.unshift(newStock); // Add to beginning
    await user.save();
    console.log('POST Watchlist - Stock saved, new watchlist length:', user.watchlist.length);

    return NextResponse.json({ 
      success: true, 
      message: 'Stock added to watchlist',
      stock: newStock
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add stock to watchlist';
    console.error('Watchlist POST error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage === 'Invalid token' || errorMessage === 'No token provided' ? 401 : 500 }
    );
  }
}

// PUT - Update entire watchlist
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { userId } = getUserFromToken(request);
    const body = await request.json();
    const { stocks } = body;

    if (!Array.isArray(stocks)) {
      return NextResponse.json(
        { error: 'Stocks must be an array' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the entire watchlist
    user.watchlist = stocks.map((stock: {
      id?: string;
      symbol: string;
      name: string;
      price?: number;
      change?: number;
      changePercent?: number;
      addedAt?: Date | string;
    }) => ({
      id: stock.id || Date.now().toString(),
      symbol: stock.symbol.toUpperCase(),
      name: stock.name,
      price: stock.price || 0,
      change: stock.change || 0,
      changePercent: stock.changePercent || 0,
      addedAt: stock.addedAt ? new Date(stock.addedAt) : new Date()
    }));

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Watchlist updated successfully'
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update watchlist';
    console.error('Watchlist PUT error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage === 'Invalid token' || errorMessage === 'No token provided' ? 401 : 500 }
    );
  }
}

// DELETE - Remove stock from watchlist
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { userId } = getUserFromToken(request);
    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.watchlist) {
      return NextResponse.json({ error: 'Watchlist not found' }, { status: 404 });
    }

    // Find and remove the stock from watchlist
    const initialLength = user.watchlist.length;
    user.watchlist = user.watchlist.filter(
      (stock: WatchlistItem) => stock.symbol.toUpperCase() !== symbol.toUpperCase()
    );

    // Check if stock was actually removed
    if (user.watchlist.length === initialLength) {
      return NextResponse.json(
        { error: 'Stock not found in watchlist' },
        { status: 404 }
      );
    }

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Stock removed from watchlist' 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove stock from watchlist';
    console.error('Watchlist DELETE error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage === 'Invalid token' || errorMessage === 'No token provided' ? 401 : 500 }
    );
  }
}