import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { isTokenExpired } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    console.log('Verifying email with token:', token);

    // Find user with this token
    const user = await User.findOne({
      verificationToken: token,
      emailVerified: false
    });

    if (!user) {
      console.log('No user found with token or already verified');
      return NextResponse.json(
        { error: 'Invalid verification token or email already verified' },
        { status: 400 }
      );
    }

    // Check if token expired
    if (!user.verificationTokenExpires || isTokenExpired(user.verificationTokenExpires)) {
      console.log('Verification token has expired');
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new verification email.' },
        { status: 400 }
      );
    }

    // Update user as verified
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerified: true
        },
        $unset: {
          verificationToken: 1,
          verificationTokenExpires: 1
        }
      }
    );

    console.log('Email verified successfully for user:', user.email);

    return NextResponse.json({
      message: 'Email verified successfully! You can now log in to your account.',
      success: true
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}