// Create a simple test route: app/api/test-bcrypt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const testPassword = 'test123';
    const hashed = await bcrypt.hash(testPassword, 12);
    const isValid = await bcrypt.compare(testPassword, hashed);
    
    return NextResponse.json({
      testPassword,
      hashedPassword: hashed,
      isValid,
      bcryptWorking: isValid
    });
  } catch (error) {
    return NextResponse.json({ error: 'BCrypt test failed' }, { status: 500 });
  }
}