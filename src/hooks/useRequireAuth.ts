'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Redirects to /login if the user is not authenticated.
 * Waits for auth to finish loading before deciding.
 */
export function useRequireAuth(redirect?: string) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (loading) return;
    // Don't redirect if user is logged in
    if (user) return;
    // Only redirect once
    if (redirected.current) return;

    redirected.current = true;
    const target = redirect || (typeof window !== 'undefined' ? window.location.pathname : '/');
    router.replace(`/login?redirect=${encodeURIComponent(target)}`);
  }, [user, loading, router, redirect]);

  return { user, loading };
}
