'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('Verifying your identity...');
  const [step, setStep] = useState(0); // 0 = verifying, 1 = setting up, 2 = done

  useEffect(() => {
    // Cycle through friendly messages while waiting
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
      setStatus('Setting up your account, almost there...');
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
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Animated logo area */}
      <div className="relative mb-6">
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-[#2E4A3E]/20 animate-ping" />
        <div className="relative w-20 h-20 rounded-full bg-[#DFE8DD] flex items-center justify-center shadow-lg">
          {/* Spinning arc */}
          <svg className="absolute inset-0 w-20 h-20 -rotate-90 animate-spin" style={{ animationDuration: '1.4s' }}>
            <circle cx="40" cy="40" r="36" fill="none" stroke="#527863" strokeWidth="4"
              strokeDasharray="80 150" strokeLinecap="round" />
          </svg>
          {/* Lock icon center */}
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#2E4A3E]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      </div>

      <h2 className="text-xl font-black text-[#1B2721] mb-2">Logging you in...</h2>
      <p className="text-sm text-[#527863] font-semibold mb-1 transition-all">{status}</p>
      <p className="text-[11px] text-gray-400">Please don&apos;t close this page</p>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mt-6">
        {[0, 1, 2, 3].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#527863] opacity-40"
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
