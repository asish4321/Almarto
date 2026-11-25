'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Redirects to /login if the user is not authenticated.
 * Pass `redirect` to return them to the original page after login.
 */
export function useRequireAuth(redirect?: string) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const target = redirect || (typeof window !== 'undefined' ? window.location.pathname : '/');
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [user, loading, router, redirect]);

  return { user, loading };
}
