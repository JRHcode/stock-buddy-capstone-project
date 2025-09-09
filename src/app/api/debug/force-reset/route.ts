import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { email, password } = await request.json();
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('🔄 FORCE RESETTING PASSWORD');
    console.log('🔐 OLD HASH:', user.password);
    
    // Create a fresh hash
    const newHash = await bcrypt.hash(password, 12);
    user.password = newHash;
    await user.save();
    
    console.log('🔐 NEW HASH:', newHash);
    
    // Test it immediately
    const isValid = await bcrypt.compare(password, newHash);
    console.log('✅ IMMEDIATE TEST RESULT:', isValid);
    
    return NextResponse.json({
      success: isValid,
      message: isValid ? 'Password reset successfully' : 'Reset failed',
      newHash: newHash
    });
  } catch (error: any) {
    console.error('💥 FORCE RESET ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}