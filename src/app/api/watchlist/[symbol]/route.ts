
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Watchlist } from '@/models/Watchlist';
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

// DELETE - Remove stock from watchlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    await connectToDatabase();

    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const symbol = params.symbol.toUpperCase();

    const watchlist = await Watchlist.findOne({ userId });
    if (!watchlist) {
      return NextResponse.json({ error: 'Watchlist not found' }, { status: 404 });
    }

    // Remove stock from watchlist
    const initialLength = watchlist.stocks.length;
    watchlist.stocks = watchlist.stocks.filter(stock => stock.symbol !== symbol);

    if (watchlist.stocks.length === initialLength) {
      return NextResponse.json({ error: 'Stock not found in watchlist' }, { status: 404 });
    }

    await watchlist.save();

    return NextResponse.json({ 
      message: 'Stock removed from watchlist',
      stocks: watchlist.stocks 
    });
  } catch (error) {
    console.error('DELETE Watchlist Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}