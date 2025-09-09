import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    console.log('🧪 HASH DEBUG TEST:');
    console.log('🔑 Input password:', `"${password}"`);
    console.log('🔑 Input length:', password.length);
    
    // Test with the EXACT hash from your database
    const storedHash = '$2b$12$stm8c966lUp4MJXRriDUw.QMMVwUhReboH1VZ2yb5A6GA.X.r.rr6';
    console.log('🔐 Stored hash:', storedHash);
    console.log('🔐 Stored hash length:', storedHash.length);
    
    // Test 1: Compare with the exact hash from DB
    const result1 = await bcrypt.compare(password, storedHash);
    console.log('✅ Direct comparison result:', result1);
    
    // Test 2: Create a new hash and compare
    const newHash = await bcrypt.hash(password, 12);
    console.log('🔐 New generated hash:', newHash);
    const result2 = await bcrypt.compare(password, newHash);
    console.log('✅ New hash comparison result:', result2);
    
    // Test 3: Compare new hash with stored hash (should be false)
    const result3 = await bcrypt.compare(password + ' ', storedHash); // Test with wrong password
    console.log('❌ Wrong password test:', result3);
    
    return NextResponse.json({
      inputPassword: password,
      storedHash: storedHash,
      directComparison: result1,
      newHashComparison: result2,
      wrongPasswordTest: result3
    });
  } catch (error: any) {
    console.error('💥 HASH TEST ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}