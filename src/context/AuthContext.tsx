'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '@/lib/types';

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

// Lazy-load supabase only when actually needed
async function getSupabase() {
  const { supabase } = await import('@/lib/supabase');
  return supabase;
}

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
          // Only clear if server explicitly returned user=null AND we didn't just log in locally
          const hasLocalSession = typeof window !== 'undefined' && localStorage.getItem('almarto_user_session');
          if (!hasLocalSession) {
            setUser(null);
            localStorage.removeItem('almarto_user');
          }
        }
      }
    } catch (err) {
      console.warn('fetchCurrentUser network error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    // Only wire up supabase auth listener for OAuth sign-in events
    let unsubscribe: (() => void) | null = null;
    let syncing = false;
    getSupabase().then((supabase) => {
      if (!supabase) return;
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user && !syncing) {
          syncing = true;
          try {
            const res = await fetch('/api/auth/sync-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
                phone: session.user.user_metadata?.phone,
                supabaseId: session.user.id,
                avatarUrl: session.user.user_metadata?.avatar_url,
              }),
            });
            const syncData = await res.json();
            if (res.ok && syncData.user) {
              setUser(syncData.user);
              if (syncData.token) localStorage.setItem('almarto_token', syncData.token);
              localStorage.setItem('almarto_user_session', JSON.stringify(syncData.user));
              localStorage.setItem('almarto_user', '1');
            }
          } catch (err) {
            console.error('Error syncing onAuthStateChange:', err);
          } finally {
            syncing = false;
          }
        }
        // NOTE: We deliberately do NOT call setUser(null) on Supabase SIGNED_OUT,
        // because password & OTP logins are managed by our secure session token.
      });
      unsubscribe = () => authListener.subscription.unsubscribe();
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  const loginWithGoogle = async (): Promise<AuthResponse> => {
    try {
      const res = await fetch('/api/auth/google-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redirectUrl: `${window.location.origin}/auth/callback`,
        }),
      });

      const data = await res.json();

      if (!data.enabled) {
        return {
          success: false,
          message:
            data.message ||
            'Google Sign-In is not enabled yet in your Supabase project. Please enable Google provider in your Supabase Dashboard.',
          setupUrl: data.setupUrl || 'https://supabase.com/dashboard/project/mnftlaxcqpwpylswkkjm/auth/providers',
        };
      }

      if (data.url) {
        window.location.href = data.url;
        return { success: true };
      }

      return { success: false, message: 'Could not generate Google sign-in URL' };
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

      // Primary: Call our backend login endpoint directly — fast, robust, sets cookie and returns session token
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
      const supabase = await getSupabase();
      if (supabase) {
        try {
          const { data: supaData, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (!error && supaData?.user) {
            const syncRes = await fetch('/api/auth/sync-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: supaData.user.email,
                name: supaData.user.user_metadata?.full_name || supaData.user.user_metadata?.name,
                phone: supaData.user.user_metadata?.phone,
                supabaseId: supaData.user.id,
              }),
            });
            const syncData = await syncRes.json();
            if (syncRes.ok && syncData.user) {
              setUser(syncData.user);
              if (syncData.token) localStorage.setItem('almarto_token', syncData.token);
              localStorage.setItem('almarto_user_session', JSON.stringify(syncData.user));
              localStorage.setItem('almarto_user', '1');
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
      const supabase = await getSupabase();
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
