import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { createSessionToken, isSecureCookie } from '@/lib/auth';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code && supabase) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
        const supaUser = data.user;
        const cleanEmail = supaUser.email?.toLowerCase().trim();

        if (cleanEmail) {
          const isOwner = cleanEmail === 'aswak761@gmail.com' || cleanEmail === 'admin@almarto.com';
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
                role: isOwner ? 'SUPER_ADMIN' : 'CUSTOMER',
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

          const token = createSessionToken({
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: isOwner ? 'SUPER_ADMIN' : dbUser.role,
            phone: dbUser.phone,
            loyaltyPoints: dbUser.profile?.loyaltyPoints || 100,
          });

          const destination = isOwner ? `${origin}/admin` : `${origin}/`;
          const response = NextResponse.redirect(destination);
          response.cookies.set('almarto_session_token', token, {
            httpOnly: true,
            secure: isSecureCookie(request),
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

  // Fallback to client-side callback page
  return NextResponse.redirect(`${origin}/auth/callback`);
}
