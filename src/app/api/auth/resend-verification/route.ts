import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { generateVerificationToken, getTokenExpiry, canResendEmail, getResendWaitTime } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Resending verification email for:', email);

    // Find user with this email
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      emailVerified: false 
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an unverified account with this email exists, a verification email has been sent.' }
      );
    }

    // Check rate limiting (2 minutes between resends)
    if (!canResendEmail(user.lastResendAt)) {
      const waitTime = getResendWaitTime(user.lastResendAt);
      return NextResponse.json(
        { 
          error: `Please wait ${Math.ceil(waitTime / 60)} minutes before requesting another verification email.`,
          waitTime: waitTime 
        },
        { status: 429 }
      );
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = getTokenExpiry();

    // Update user with new token and resend timestamp
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          verificationToken,
          verificationTokenExpires: tokenExpiry,
          lastResendAt: new Date()
        }
      }
    );

    // Send verification email
    const emailResult = await sendVerificationEmail(email, user.name, verificationToken);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      );
    }

    console.log('Verification email resent successfully to:', email);

    return NextResponse.json({
      message: 'Verification email sent! Please check your inbox and spam folder.',
      success: true
    });

  } catch (error) {
    console.error('Resend verification email error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email. Please try again.' },
      { status: 500 }
    );
  }
}