'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('Completing authorization with Supabase...');

  useEffect(() => {
    async function handleAuth() {
      if (!supabase) {
        router.push('/login');
        return;
      }

      try {
        let session = null;

        // Check if there is a code param from OAuth PKCE
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data?.session) {
            session = data.session;
          }
        }

        if (!session) {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Auth error:', error);
            router.push('/login?error=' + encodeURIComponent(error.message));
            return;
          }
          session = data?.session;
        }

        if (session?.user) {
          setStatus('Synchronizing user profile to database...');
          const supaUser = session.user;
          const res = await fetch('/api/auth/sync-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: supaUser.email,
              name:
                supaUser.user_metadata?.full_name ||
                supaUser.user_metadata?.name ||
                supaUser.email?.split('@')[0],
              phone: supaUser.user_metadata?.phone || null,
              supabaseId: supaUser.id,
              avatarUrl: supaUser.user_metadata?.avatar_url || null,
            }),
          });

          if (res.ok) {
            await refreshUser();
            router.push('/');
            return;
          }
        }

        router.push('/');
      } catch (err) {
        console.error('Error in auth callback:', err);
        router.push('/login');
      }
    }

    handleAuth();
  }, [router, refreshUser]);

  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#F2EFFF] flex items-center justify-center mb-4">
        <Loader2 className="w-8 h-8 text-[#35109B] animate-spin" />
      </div>
      <h2 className="text-lg font-bold text-[#19152B] mb-1">Connecting with Google &amp; Supabase</h2>
      <p className="text-xs text-gray-500">{status}</p>
    </div>
  );
}
