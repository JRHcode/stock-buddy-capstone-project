
'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useRequireAuth(redirectUrl: string = '/auth/login') {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only check authentication after the auth context has finished loading
    if (!authLoading) {
      if (!user) {
        router.push(redirectUrl);
      } else {
        setIsLoading(false);
      }
    }
  }, [user, authLoading, router, redirectUrl]);

  return { 
    isLoading: isLoading || authLoading,
    isAuthLoading: authLoading
  };
}