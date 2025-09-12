import { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  try {
    // Use non-null assertion since we checked JWT_SECRET above
    const decoded = jwt.verify(token, JWT_SECRET!) as AuthTokenPayload;
    
    if (!decoded.userId) {
      throw new Error('Invalid token: missing userId');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
    throw new Error('Token verification failed: Unknown error');
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  return authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
}

export function generateAuthToken(userId: string): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Helper function to validate the token structure
export function isValidTokenPayload(payload: any): payload is AuthTokenPayload {
  return payload && typeof payload === 'object' && 'userId' in payload;
}