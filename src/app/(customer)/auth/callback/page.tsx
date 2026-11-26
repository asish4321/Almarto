'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, extractAndSetSessionFromUrl } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('Verifying your identity...');

  useEffect(() => {
    const msgs = [
      'Verifying your identity...',
      'Signing you in securely...',
      'Loading your account...',
      'Almost there, hang tight...',
    ];
    let i = 0;
    const ticker = setInterval(() => {
      i = (i + 1) % msgs.length;
      setStatus(msgs[i]);
    }, 1800);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    async function handleAuth() {
      try {
        // 1. Extract tokens from URL (handles both implicit #access_token=... and PKCE ?code=...)
        const session = await extractAndSetSessionFromUrl();

        let finalSession = session;
        if (!finalSession && supabase) {
          const { data } = await supabase.auth.getSession();
          finalSession = data?.session || null;
        }

        if (finalSession?.user) {
          setStatus('Setting up your account, almost there...');
          const supaUser = finalSession.user;

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
            const data = await res.json();
            if (data.token) localStorage.setItem('almarto_token', data.token);
            if (data.user) {
              localStorage.setItem('almarto_user_session', JSON.stringify(data.user));
              localStorage.setItem('almarto_user', '1');
            }
            await refreshUser();

            // Clear any lingering tokens from the URL
            window.history.replaceState({}, document.title, window.location.pathname);

            const isOwner =
              supaUser.email?.toLowerCase() === 'aswak761@gmail.com' ||
              supaUser.email?.toLowerCase() === 'admin@almarto.com';

            router.replace(isOwner ? '/admin' : '/');
            return;
          }
        }

        // Clean URL before leaving
        window.history.replaceState({}, document.title, '/login');
        router.replace('/login');
      } catch (err) {
        // Never log tokens or sensitive data to console
        window.history.replaceState({}, document.title, '/login');
        router.replace('/login');
      }
    }

    handleAuth();
  }, [router, refreshUser]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Animated logo area */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-[#35109B]/20 animate-ping" />
        <div className="relative w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center shadow-lg border border-purple-100">
          <svg className="absolute inset-0 w-20 h-20 -rotate-90 animate-spin" style={{ animationDuration: '1.4s' }}>
            <circle cx="40" cy="40" r="36" fill="none" stroke="#FF7900" strokeWidth="4"
              strokeDasharray="80 150" strokeLinecap="round" />
          </svg>
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#35109B]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      </div>

      <h2 className="text-xl font-black text-[#19152B] mb-2">Signing you in securely...</h2>
      <p className="text-sm text-[#FF7900] font-semibold mb-1 transition-all">{status}</p>
      <p className="text-[11px] text-gray-400">Please do not close this window</p>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mt-6">
        {[0, 1, 2, 3].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#FF7900] opacity-40"
            style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
