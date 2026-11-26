import { createClient, Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

// Single shared Supabase client instance across the entire application
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Safe URL token extractor: handles both Implicit flow (#access_token=...) and PKCE (?code=...)
export async function extractAndSetSessionFromUrl(): Promise<Session | null> {
  if (typeof window === 'undefined' || !supabase) return null;

  try {
    // 1. Check URL hash (e.g. #access_token=...&refresh_token=...&provider_token=...)
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.substring(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);

    // 2. Check query params (e.g. ?code=... or ?access_token=...)
    const searchParams = new URLSearchParams(window.location.search);

    const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
    const code = searchParams.get('code') || hashParams.get('code');

    let session: Session | null = null;

    if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (!error && data.session) {
        session = data.session;
      }
    } else if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.session) {
        session = data.session;
      }
    }

    if (!session) {
      const { data } = await supabase.auth.getSession();
      session = data?.session || null;
    }

    // Always sanitize and clear the URL so tokens are never exposed in browser history or address bar
    if (
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('token=') ||
      window.location.search.includes('access_token') ||
      window.location.search.includes('code=')
    ) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return session;
  } catch (err) {
    // Silently handle error — never log raw error with sensitive query params
    return null;
  }
}
