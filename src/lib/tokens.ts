import crypto from 'crypto';

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function getTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // 24 hours from now
  return expiry;
}

export function canResendEmail(lastResendAt?: Date): boolean {
  if (!lastResendAt) return true;
  
  const twoMinutesAgo = new Date();
  twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);
  
  return lastResendAt < twoMinutesAgo;
}

export function getResendWaitTime(lastResendAt?: Date): number {
  if (!lastResendAt) return 0;
  
  const twoMinutesFromLast = new Date(lastResendAt);
  twoMinutesFromLast.setMinutes(twoMinutesFromLast.getMinutes() + 2);
  
  const now = new Date();
  const waitTime = Math.max(0, twoMinutesFromLast.getTime() - now.getTime());
  
  return Math.ceil(waitTime / 1000); // Return seconds remaining
}