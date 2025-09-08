import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, IUser } from '@/models/User';
import { generateAuthToken } from '@/lib/auth';

// Define a type for user with password
interface UserWithPassword extends IUser {
  password: string;
  name: string; // Add name property
  email: string;
  createdAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Parse request body
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user with password field included
    const user = await User.findOne({ email }).select('+password').exec() as UserWithPassword | null;
    
    // Check if user exists and password matches
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token - convert _id to string
    const token = generateAuthToken(user._id.toString());

    // Return success response with user's name
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        name: user.name, // Added name field
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle specific error types
    if (error.message.includes('JWT_SECRET')) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (error.message.includes('Token verification')) {
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}