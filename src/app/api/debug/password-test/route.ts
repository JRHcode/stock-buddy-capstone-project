// app/api/debug/password-test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    console.log('🧪 PASSWORD DEBUG TEST:');
    console.log('🧪 Input password:', password);
    console.log('🧪 Input password length:', password.length);
    
    const hashed = await bcrypt.hash(password, 12);
    console.log('🧪 Hashed result:', hashed);
    
    const isValid = await bcrypt.compare(password, hashed);
    console.log('🧪 Self-comparison result:', isValid);
    
    // Test with your actual stored hash
    const storedHash = '$2b$12$stm8c966lUp4M...'; // Copy the actual hash from your logs
    const matchesStored = await bcrypt.compare(password, storedHash);
    console.log('🧪 Comparison with stored hash:', matchesStored);
    
    return NextResponse.json({
      inputPassword: password,
      hashedPassword: hashed,
      selfComparison: isValid,
      storedComparison: matchesStored
    });
  } catch (error) {
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}