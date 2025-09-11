
'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useRequireAuth(redirectUrl: string = '/auth/login') {
  const { user, loading: authLoading, initializing } = useAuthContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only check authentication after both auth context initialization and loading are done
    if (!initializing && !authLoading) {
      if (!user) {
        console.log('No user found, redirecting to:', redirectUrl);
        router.push(redirectUrl);
      } else {
        console.log('User found, allowing access:', user.email);
        setIsLoading(false);
      }
    }
  }, [user, authLoading, initializing, router, redirectUrl]);

  return { 
    isLoading: isLoading || authLoading || initializing,
    isAuthLoading: authLoading
  };
}