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

// Lazy-load supabase only when actually needed — avoids loading ~300KB + IndexedDB init on every page
async function getSupabase() {
  const { supabase } = await import('@/lib/supabase');
  return supabase;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user) {
          localStorage.setItem('almarto_user', '1');
        } else {
          localStorage.removeItem('almarto_user');
        }
      } else {
        setUser(null);
        localStorage.removeItem('almarto_user');
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    // Only wire up supabase auth listener after initial user check
    let unsubscribe: (() => void) | null = null;
    let syncing = false; // prevent concurrent sync calls
    getSupabase().then((supabase) => {
      if (!supabase) return;
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        // Only act on actual sign-in events, not token refreshes with clock skew
        if (event === 'SIGNED_IN' && session?.user && !syncing) {
          syncing = true;
          try {
            await fetch('/api/auth/sync-session', {
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
            await fetchCurrentUser();
          } catch (err) {
            console.error('Error syncing onAuthStateChange:', err);
          } finally {
            syncing = false;
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('almarto_user');
        }
        // Ignore TOKEN_REFRESHED, INITIAL_SESSION etc. to avoid loops
      });
      unsubscribe = () => authListener.subscription.unsubscribe();
    });

    return () => { unsubscribe?.(); };
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

      return { success: false, message: 'No authorization URL returned from Supabase.' };
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
      const supabase = await getSupabase();

      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (error) {
            if (error.message.toLowerCase().includes('email not confirmed')) {
              return {
                success: false,
                needsVerification: true,
                message: 'Your email has not been verified yet. Please check your inbox for the confirmation link sent by Supabase.',
              };
            }
          } else if (data?.user) {
            const syncRes = await fetch('/api/auth/sync-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: data.user.email,
                name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
                phone: data.user.user_metadata?.phone,
                supabaseId: data.user.id,
              }),
            });
            const syncData = await syncRes.json();
            if (syncRes.ok && syncData.user) {
              setUser(syncData.user);
              return { success: true };
            }
          }
        } catch (supaErr) {
          console.warn('Supabase signInWithPassword fallback:', supaErr);
        }
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        return { success: true };
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
      let needsVerification = false;
      const supabase = await getSupabase();

      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: { full_name: name, name, phone },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) {
            console.warn('Supabase auth signUp response:', error.message);
          } else if (data?.user && !data.session) {
            needsVerification = true;
          }
        } catch (supaErr) {
          console.warn('Supabase signUp error:', supaErr);
        }
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail, password, phone }),
      });
      const data = await res.json();

      if (res.ok && data.user) {
        if (!needsVerification) {
          setUser(data.user);
        }
        return {
          success: true,
          needsVerification,
          message: needsVerification
            ? `Verification email sent to ${cleanEmail}! Please check your email inbox to confirm your account.`
            : 'Account created successfully! Welcome to ALMARTO.',
        };
      }

      return { success: false, message: data.message || 'Registration failed' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error during registration';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      const supabase = await getSupabase();
      if (supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      localStorage.removeItem('almarto_user');
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
    }
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
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
