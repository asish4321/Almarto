import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/auth';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      '';

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data?.user) {
          const supaUser = data.user;
          const cleanEmail = supaUser.email?.toLowerCase().trim();

          if (cleanEmail) {
            let dbUser = await prisma.user.findUnique({
              where: { email: cleanEmail },
              include: { profile: true },
            });

            if (!dbUser) {
              dbUser = await prisma.user.create({
                data: {
                  email: cleanEmail,
                  name:
                    supaUser.user_metadata?.full_name ||
                    supaUser.user_metadata?.name ||
                    cleanEmail.split('@')[0],
                  phone: supaUser.user_metadata?.phone || null,
                  passwordHash: 'supabase_oauth_' + supaUser.id,
                  role: 'CUSTOMER',
                  profile: {
                    create: {
                      loyaltyPoints: 100,
                      avatar: supaUser.user_metadata?.avatar_url || null,
                    },
                  },
                },
                include: { profile: true },
              });
            }

            const token = createSessionToken(dbUser);
            const response = NextResponse.redirect(`${origin}/`);
            response.cookies.set('almarto_session_token', token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 60 * 60 * 24 * 30,
            });
            return response;
          }
        }
      } catch (err) {
        console.error('OAuth callback exchange error:', err);
      }
    }
  }

  // Fallback to client-side callback page if code was not exchanged directly
  return NextResponse.redirect(`${origin}/auth/callback`);
}
