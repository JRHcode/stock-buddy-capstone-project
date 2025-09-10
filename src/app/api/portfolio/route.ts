import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
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

// GET - Fetch user's portfolio
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user's portfolio or empty array if no portfolio exists
    return NextResponse.json({ holdings: user.portfolio || [] });
  } catch (error) {
    console.error('GET Portfolio Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add holding to portfolio
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol, name, shares, avgPrice } = await request.json();

    if (!symbol || !name || !shares || !avgPrice) {
      return NextResponse.json({ error: 'Symbol, name, shares, and avgPrice are required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize portfolio if it doesn't exist
    if (!user.portfolio) {
      user.portfolio = [];
    }

    // Check if holding already exists in portfolio
    const existingHolding = user.portfolio.find(holding => holding.symbol === symbol.toUpperCase());
    if (existingHolding) {
      return NextResponse.json({ error: 'Holding already in portfolio' }, { status: 409 });
    }

    // Add holding to portfolio
    const newHolding = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      name,
      shares: parseFloat(shares),
      avgPrice: parseFloat(avgPrice),
      purchaseDate: new Date().toISOString().split('T')[0]
    };

    user.portfolio.push(newHolding);
    await user.save();

    return NextResponse.json({ 
      message: 'Holding added to portfolio',
      holdings: user.portfolio 
    });
  } catch (error) {
    console.error('POST Portfolio Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update entire portfolio (sync from frontend)
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { holdings } = await request.json();

    if (!Array.isArray(holdings)) {
      return NextResponse.json({ error: 'Holdings must be an array' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the entire portfolio array
    user.portfolio = holdings.map((holding: any) => ({
      id: holding.id,
      symbol: holding.symbol?.toUpperCase(),
      name: holding.name,
      shares: parseFloat(holding.shares),
      avgPrice: parseFloat(holding.avgPrice),
      purchaseDate: holding.purchaseDate || new Date().toISOString().split('T')[0]
    }));

    await user.save();

    return NextResponse.json({ 
      message: 'Portfolio updated',
      holdings: user.portfolio 
    });
  } catch (error) {
    console.error('PUT Portfolio Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove holding from portfolio
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const holdingId = url.searchParams.get('id');

    if (!holdingId) {
      return NextResponse.json({ error: 'Holding ID is required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Remove holding from portfolio
    user.portfolio = user.portfolio.filter(holding => holding.id !== holdingId);
    await user.save();

    return NextResponse.json({ 
      message: 'Holding removed from portfolio',
      holdings: user.portfolio 
    });
  } catch (error) {
    console.error('DELETE Portfolio Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}