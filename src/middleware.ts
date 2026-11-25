import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTHORIZED_ADMIN_EMAIL = 'aswak761@gmail.com';
const SESSION_COOKIE_NAME = 'almarto_session_token';

function parseSessionToken(token?: string): { id?: string; email?: string; role?: string } | null {
  if (!token) return null;
  try {
    let raw = token;
    if (raw.startsWith('user_')) {
      return { id: raw.replace('user_', '') };
    }
    // Base64 decode
    const jsonStr = typeof atob === 'function' ? atob(raw) : Buffer.from(raw, 'base64').toString('utf-8');
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function isAuthorizedAdmin(session: { email?: string; role?: string } | null): boolean {
  if (!session) return false;
  return (
    session.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() ||
    session.role === 'SUPER_ADMIN' ||
    session.role === 'ADMIN'
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = parseSessionToken(token);
  const isAdmin = isAuthorizedAdmin(session);

  // 1. Strict Protection for Admin API Routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!isAdmin) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Access Denied: Administrator privileges required.',
        },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // 2. Strict Protection for Admin Pages (/admin and /admin/*)
  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      // Unauthenticated or non-admin user trying to access admin pages -> redirect strictly to /almarto_admin
      const loginUrl = new URL('/almarto_admin', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Admin Login Portal (/almarto_admin)
  if (pathname === '/almarto_admin') {
    // If already authenticated as admin, redirect directly to /admin dashboard
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // 4. Customer Login Page (/login)
  if (pathname === '/login') {
    // If admin is visiting customer login, strictly redirect to admin portal
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // If standard customer is already logged in, redirect to homepage
    if (session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/almarto_admin',
    '/login',
    '/api/admin/:path*',
  ],
};
