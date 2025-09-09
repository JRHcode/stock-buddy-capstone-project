// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { generateAuthToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { email, password } = await request.json();
    
    console.log('🔍 LOGIN ATTEMPT for email:', email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user with password field included - CRITICAL: use .select('+password')
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password').exec();
    
    console.log('👤 USER FOUND:', user ? 'Yes' : 'No');
    if (user) {
      console.log('📧 User email:', user.email);
      console.log('🔐 Password hash exists:', !!user.password);
      console.log('🔐 Password hash starts with:', user.password ? user.password.substring(0, 10) + '...' : 'None');
    }

    // Check if user exists
    if (!user) {
      console.log('❌ USER NOT FOUND');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!user.password) {
      console.log('❌ NO PASSWORD HASH IN USER DOCUMENT');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password using bcrypt.compare
    console.log('🔑 COMPARING PASSWORDS...');
    console.log('🔑 Input password:', password);
    console.log('🔑 Stored hash:', user.password.substring(0, 20) + '...');
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('✅ PASSWORD VALID:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ PASSWORD MISMATCH - Possible issues:');
      console.log('   - Different bcrypt salt rounds during signup vs login');
      console.log('   - Password was not properly hashed during signup');
      console.log('   - User document was modified manually');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('🎯 LOGIN SUCCESSFUL');
    
    // Generate JWT token
    const token = generateAuthToken(user._id.toString());

    // Return success response with user's name
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error: any) {
    console.error('💥 LOGIN ERROR:', error.message);
    console.error('💥 ERROR STACK:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}