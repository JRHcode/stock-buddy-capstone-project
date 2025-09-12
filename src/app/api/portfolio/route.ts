import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

type PortfolioHolding = {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  purchaseDate: string;
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

// GET - Fetch user's portfolio
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { userId } = getUserFromToken(request);
    
    const user = await User.findById(userId).select('portfolio');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      holdings: user.portfolio || [] 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch portfolio';
    console.error('Portfolio GET error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage === 'Invalid token' || errorMessage === 'No token provided' ? 401 : 500 }
    );
  }
}

// POST - Add holding to portfolio
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { userId } = getUserFromToken(request);
    const body = await request.json();
    const { symbol, name, shares, avgPrice, purchaseDate } = body;

    if (!symbol || !name || !shares || !avgPrice) {
      return NextResponse.json(
        { error: 'Symbol, name, shares, and avgPrice are required' },
        { status: 400 }
      );
    }

    if (shares <= 0 || avgPrice <= 0) {
      return NextResponse.json(
        { error: 'Shares and avgPrice must be positive numbers' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize portfolio if it doesn't exist
    if (!user.portfolio) {
      user.portfolio = [];
    }

    // Check if holding already exists for this symbol
    const existingHolding = user.portfolio.find(
      (holding: PortfolioHolding) => holding.symbol.toUpperCase() === symbol.toUpperCase()
    );

    if (existingHolding) {
      return NextResponse.json(
        { error: 'Holding for this symbol already exists. Use PUT to update.' },
        { status: 400 }
      );
    }

    // Create new holding
    const newHolding = {
      id: Date.now().toString(), // Simple ID generation
      symbol: symbol.toUpperCase(),
      name,
      shares: Number(shares),
      avgPrice: Number(avgPrice),
      purchaseDate: purchaseDate || new Date().toISOString()
    };

    user.portfolio.unshift(newHolding); // Add to beginning
    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Holding added to portfolio',
      holding: newHolding
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add holding to portfolio';
    console.error('Portfolio POST error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage === 'Invalid token' || errorMessage === 'No token provided' ? 401 : 500 }
    );
  }
}

// PUT - Update entire portfolio
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { userId } = getUserFromToken(request);
    const body = await request.json();
    const { holdings } = body;

    if (!Array.isArray(holdings)) {
      return NextResponse.json(
        { error: 'Holdings must be an array' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the entire portfolio
    user.portfolio = holdings.map((holding: {
      id?: string;
      symbol: string;
      name: string;
      shares: number;
      avgPrice: number;
      purchaseDate?: string;
    }) => ({
      id: holding.id || Date.now().toString(),
      symbol: holding.symbol.toUpperCase(),
      name: holding.name,
      shares: Number(holding.shares),
      avgPrice: Number(holding.avgPrice),
      purchaseDate: holding.purchaseDate || new Date().toISOString()
    }));

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Portfolio updated successfully'
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update portfolio';
    console.error('Portfolio PUT error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage === 'Invalid token' || errorMessage === 'No token provided' ? 401 : 500 }
    );
  }
}

// DELETE - Remove holding from portfolio
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

    if (!user.portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Find and remove the holding from portfolio
    const initialLength = user.portfolio.length;
    user.portfolio = user.portfolio.filter(
      (holding: PortfolioHolding) => holding.symbol.toUpperCase() !== symbol.toUpperCase()
    );

    // Check if holding was actually removed
    if (user.portfolio.length === initialLength) {
      return NextResponse.json(
        { error: 'Holding not found in portfolio' },
        { status: 404 }
      );
    }

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Holding removed from portfolio' 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove holding from portfolio';
    console.error('Portfolio DELETE error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage === 'Invalid token' || errorMessage === 'No token provided' ? 401 : 500 }
    );
  }
}