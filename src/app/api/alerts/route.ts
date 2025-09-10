import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

type Alert = {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'change';
  targetValue: number;
  currentValue?: number;
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
};

// Helper function to verify JWT token
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
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

// GET - Fetch user's alerts
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { id: userId } = getUserFromToken(request);
    console.log('GET Alerts - User ID:', userId);
    
    const user = await User.findById(userId).select('alerts');
    console.log('GET Alerts - User found:', !!user, 'Alerts length:', user?.alerts?.length || 0);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      alerts: user.alerts || [] 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch alerts';
    console.error('Alerts GET error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage === 'Invalid token' || errorMessage === 'No token provided' ? 401 : 500 }
    );
  }
}

// POST - Add alert
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { id: userId } = getUserFromToken(request);
    const body = await request.json();
    const { symbol, condition, targetValue, currentValue } = body;
    console.log('POST Alerts - User ID:', userId, 'Data:', { symbol, condition, targetValue, currentValue });

    if (!symbol || !condition || !targetValue) {
      return NextResponse.json(
        { error: 'Symbol, condition, and targetValue are required' },
        { status: 400 }
      );
    }

    if (!['above', 'below', 'change'].includes(condition)) {
      return NextResponse.json(
        { error: 'Condition must be above, below, or change' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize alerts if it doesn't exist
    if (!user.alerts) {
      user.alerts = [];
    }

    // Create new alert
    const newAlert = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      condition,
      targetValue: Number(targetValue),
      currentValue: currentValue ? Number(currentValue) : undefined,
      isActive: true,
      createdAt: new Date()
    };

    user.alerts.unshift(newAlert); // Add to beginning
    await user.save();
    console.log('POST Alerts - Alert saved, new alerts length:', user.alerts.length);

    return NextResponse.json({ 
      success: true, 
      message: 'Alert added successfully',
      alert: newAlert
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add alert';
    console.error('Alerts POST error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage === 'Invalid token' || errorMessage === 'No token provided' ? 401 : 500 }
    );
  }
}

// PUT - Update entire alerts list
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { id: userId } = getUserFromToken(request);
    const body = await request.json();
    const { alerts } = body;

    if (!Array.isArray(alerts)) {
      return NextResponse.json(
        { error: 'Alerts must be an array' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the entire alerts list
    user.alerts = alerts.map((alert: {
      id?: string;
      symbol: string;
      condition: 'above' | 'below' | 'change';
      targetValue: number;
      currentValue?: number;
      isActive?: boolean;
      createdAt?: Date | string;
      triggeredAt?: Date | string;
    }) => ({
      id: alert.id || Date.now().toString(),
      symbol: alert.symbol.toUpperCase(),
      condition: alert.condition,
      targetValue: Number(alert.targetValue),
      currentValue: alert.currentValue ? Number(alert.currentValue) : undefined,
      isActive: alert.isActive !== undefined ? alert.isActive : true,
      createdAt: alert.createdAt ? new Date(alert.createdAt) : new Date(),
      triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined
    }));

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Alerts updated successfully'
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update alerts';
    console.error('Alerts PUT error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage === 'Invalid token' || errorMessage === 'No token provided' ? 401 : 500 }
    );
  }
}

// DELETE - Remove alert
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { id: userId } = getUserFromToken(request);
    const url = new URL(request.url);
    const alertId = url.searchParams.get('id');

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.alerts) {
      return NextResponse.json({ error: 'Alerts not found' }, { status: 404 });
    }

    // Find and remove the alert
    const initialLength = user.alerts.length;
    user.alerts = user.alerts.filter(
      (alert: Alert) => alert.id !== alertId
    );

    // Check if alert was actually removed
    if (user.alerts.length === initialLength) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Alert removed successfully' 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove alert';
    console.error('Alerts DELETE error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage === 'Invalid token' || errorMessage === 'No token provided' ? 401 : 500 }
    );
  }
}