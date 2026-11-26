import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { UserRole, UserSession } from './types';

export const SESSION_COOKIE_NAME = 'almarto_session_token';

export function isSecureCookie(request?: Request): boolean {
  if (process.env.NODE_ENV !== 'production') return false;
  if (!request) return false;
  const host = request.headers.get('host') || '';
  if (host.includes('localhost') || host.includes('127.0.0.1')) return false;
  return true;
}

export async function getCurrentUser(tokenOverride?: string): Promise<UserSession | null> {
  let token = tokenOverride;
  if (!token) {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // In case cookies() is accessed outside Next.js request context
    }
  }

  if (!token) return null;

  try {
    // Token is base64-encoded JSON containing full user session data
    // This avoids a DB round-trip on every request
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));

    // Validate token has required fields
    if (!decoded.id || !decoded.email || !decoded.role) return null;

    // Token expiry check — 30 days
    if (decoded.createdAt && Date.now() - decoded.createdAt > 30 * 24 * 60 * 60 * 1000) {
      return null;
    }

    // Return user directly from token — no DB call needed
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0],
      role: decoded.role as UserRole,
      phone: decoded.phone || null,
      loyaltyPoints: decoded.loyaltyPoints || 0,
    };
  } catch {
    // Token malformed — try legacy format or DB lookup
    try {
      let userId = token;
      if (token.startsWith('user_')) userId = token.replace('user_', '');

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.isActive || user.isBlocked) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        phone: user.phone,
        loyaltyPoints: 100,
      };
    } catch (err) {
      console.error('getCurrentUser fallback error:', err);
      return null;
    }
  }
}

// Store full user data in token so auth/me doesn't need a DB call
export function createSessionToken(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  loyaltyPoints?: number;
}): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone || null,
    loyaltyPoints: user.loyaltyPoints || 0,
    createdAt: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function checkRolePermission(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  if (userRole === 'SUPER_ADMIN') return true;
  return allowedRoles.includes(userRole);
}

export const AUTHORIZED_ADMIN_EMAIL = 'aswak761@gmail.com';

export async function requireAdmin(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) {
    const error: any = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }

  const isAllowed =
    user.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() ||
    user.role === 'SUPER_ADMIN' ||
    user.role === 'ADMIN';

  if (!isAllowed) {
    const error: any = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }

  return user;
}
