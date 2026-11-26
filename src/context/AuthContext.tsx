'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '@/lib/types';
import { supabase, extractAndSetSessionFromUrl } from '@/lib/supabase';

interface AuthResponse {
  success: boolean;
  message?: string;
  needsVerification?: boolean;
  setupUrl?: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<AuthResponse>;
  loginWithGoogle: () => Promise<AuthResponse>;
  sendOtp: (email: string, name?: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (email: string, code: string, name?: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password?: string, phone?: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize user immediately from localStorage to avoid "Login" flash on page load
  const [user, setUser] = useState<UserSession | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('almarto_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const syncUserWithBackend = async (sessionUser: any): Promise<UserSession | null> => {
    try {
      const res = await fetch('/api/auth/sync-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: sessionUser.email,
          name:
            sessionUser.user_metadata?.full_name ||
            sessionUser.user_metadata?.name ||
            sessionUser.email?.split('@')[0],
          phone: sessionUser.user_metadata?.phone,
          supabaseId: sessionUser.id,
          avatarUrl: sessionUser.user_metadata?.avatar_url,
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        if (data.token) localStorage.setItem('almarto_token', data.token);
        localStorage.setItem('almarto_user_session', JSON.stringify(data.user));
        localStorage.setItem('almarto_user', '1');
        return data.user;
      }
    } catch (err) {
      console.warn('Sync session error:', err);
    }
    return null;
  };

  const fetchCurrentUser = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('almarto_token') : null;
      const res = await fetch('/api/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('almarto_user_session', JSON.stringify(data.user));
          localStorage.setItem('almarto_user', '1');
        } else {
          // If server says no user and there are no auth tokens in URL, clear local session
          const hasUrlTokens =
            typeof window !== 'undefined' &&
            (window.location.hash.includes('access_token') ||
              window.location.search.includes('access_token') ||
              window.location.search.includes('code='));

          if (!hasUrlTokens) {
            setUser(null);
            localStorage.removeItem('almarto_user_session');
            localStorage.removeItem('almarto_user');
            localStorage.removeItem('almarto_token');
          }
        }
      }
    } catch (err) {
      console.warn('fetchCurrentUser network error:', err);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let syncing = false;

    async function initializeAuth() {
      try {
        // 1. Check if OAuth tokens exist in the URL (both hash and query)
        const urlSession = await extractAndSetSessionFromUrl();
        if (urlSession?.user) {
          syncing = true;
          await syncUserWithBackend(urlSession.user);
          syncing = false;
        }

        // 2. Also check if Supabase has an active persisted session
        if (!urlSession && supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            syncing = true;
            await syncUserWithBackend(data.session.user);
            syncing = false;
          }
        }

        // 3. Verify server-side session cookie / token
        await fetchCurrentUser();
      } finally {
        setLoading(false);
      }

      // 4. Wire up single shared Supabase auth listener
      if (supabase) {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user && !syncing) {
            syncing = true;
            await syncUserWithBackend(session.user);
            syncing = false;
            setLoading(false);
          }
        });
        unsubscribe = () => authListener.subscription.unsubscribe();
      }
    }

    initializeAuth();

    return () => {
      unsubscribe?.();
    };
  }, []);

  const loginWithGoogle = async (): Promise<AuthResponse> => {
    try {
      if (!supabase) {
        return {
          success: false,
          message: 'Supabase authentication is not configured in this environment.',
        };
      }

      // Determine the canonical site URL without trailing slash
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== 'undefined' ? window.location.origin : 'https://almartoo.netlify.app');
      const redirectTo = `${siteUrl.replace(/\/$/, '')}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        return {
          success: false,
          message: error.message || 'Google OAuth failed to start. Please try again.',
        };
      }

      if (data?.url) {
        window.location.href = data.url;
        return { success: true };
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google OAuth sign-in failed';
      return { success: false, message };
    }
  };

  const sendOtp = async (
    email: string,
    name?: string,
    phone?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, phone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to send verification code' };
    } catch {
      return { success: false, message: 'Network error sending verification code' };
    }
  };

  const verifyOtp = async (email: string, code: string, name?: string): Promise<AuthResponse> => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, name }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        if (data.token) localStorage.setItem('almarto_token', data.token);
        localStorage.setItem('almarto_user_session', JSON.stringify(data.user));
        localStorage.setItem('almarto_user', '1');
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Verification failed' };
    } catch {
      return { success: false, message: 'Network error during verification' };
    }
  };

  const login = async (email: string, password = 'password123'): Promise<AuthResponse> => {
    try {
      const cleanEmail = email.toLowerCase().trim();

      // Primary: Call backend login endpoint directly — fast, robust, sets cookie and returns session token
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        if (data.token) localStorage.setItem('almarto_token', data.token);
        localStorage.setItem('almarto_user_session', JSON.stringify(data.user));
        localStorage.setItem('almarto_user', '1');
        return { success: true };
      }

      // Secondary fallback: check if account was registered via Supabase Auth
      if (supabase) {
        try {
          const { data: supaData, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (!error && supaData?.user) {
            const syncedUser = await syncUserWithBackend(supaData.user);
            if (syncedUser) {
              return { success: true };
            }
          }
        } catch (supaErr) {
          console.warn('Supabase signInWithPassword fallback error:', supaErr);
        }
      }

      return { success: false, message: data.message || 'Invalid email or password' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error during login';
      return { success: false, message };
    }
  };

  const register = async (
    name: string,
    email: string,
    password = 'password123',
    phone?: string
  ): Promise<AuthResponse> => {
    try {
      const cleanEmail = email.toLowerCase().trim();

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail, password, phone }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        if (data.token) localStorage.setItem('almarto_token', data.token);
        localStorage.setItem('almarto_user_session', JSON.stringify(data.user));
        localStorage.setItem('almarto_user', '1');
        return { success: true };
      }
      return { success: false, message: data.message || 'Failed to create account' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error during registration';
      return { success: false, message };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem('almarto_user_session');
      localStorage.removeItem('almarto_user');
      localStorage.removeItem('almarto_token');
      window.location.href = '/';
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        sendOtp,
        verifyOtp,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
