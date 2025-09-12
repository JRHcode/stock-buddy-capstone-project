import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { generateVerificationToken, getTokenExpiry } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = getTokenExpiry();

    // Create and save the new user (unverified)
    // The pre-save middleware will handle password hashing
    const newUser = new User({
      name,
      email,
      password, // Pass plain text password - pre-save hook will hash it
      emailVerified: false,
      verificationToken,
      verificationTokenExpires: tokenExpiry,
    });

    await newUser.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(email, name, verificationToken);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Still continue - user is created, they can request resend later
    }

    // Return a success response without sensitive data
    return NextResponse.json({
      message: 'Account created successfully! Please check your email to verify your account before logging in.',
      requiresVerification: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        emailVerified: false,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Signup API Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}