import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import UserData from '@/models/UserData';
import { connectToDatabase } from '@/lib/mongodb';

// Helper function to verify JWT token
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  } catch (error) {
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

// DELETE - Remove stock from watchlist by symbol
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    await connectToDatabase();
    
    const { userId } = getUserFromToken(request);
    const { symbol } = await params;

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    // Find UserData document
    const userData = await UserData.findOne({ userId });
    if (!userData) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }

    // Find and remove the stock from watchlist
    const initialLength = userData.watchlist.length;
    userData.watchlist = userData.watchlist.filter(
      (stock: any) => stock.symbol.toUpperCase() !== symbol.toUpperCase()
    );

    // Check if stock was actually removed
    if (userData.watchlist.length === initialLength) {
      return NextResponse.json(
        { error: 'Stock not found in watchlist' },
        { status: 404 }
      );
    }

    await userData.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Stock removed from watchlist' 
    });

  } catch (error: any) {
    console.error('Watchlist DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove stock from watchlist' },
      { status: error.message === 'Invalid token' || error.message === 'No token provided' ? 401 : 500 }
    );
  }
}