import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { UserRole, UserSession } from './types';

const SESSION_COOKIE_NAME = 'almarto_session_token';

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    // In production we verify JWT / HMAC signature.
    // For demo/standalone, token contains base64 encoded user info or userId
    let userId = token;
    if (token.startsWith('user_')) {
      userId = token.replace('user_', '');
    } else {
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        userId = decoded.id;
      } catch {
        userId = token;
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.isActive || user.isBlocked) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      phone: user.phone,
      loyaltyPoints: user.profile?.loyaltyPoints || 0,
    };
  } catch (err) {
    console.error('Failed to get current user:', err);
    return null;
  }
}

export function createSessionToken(user: { id: string; email: string; role: string }): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
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
    const error: any = new Error('Forbidden: Admin access only');
    error.statusCode = 403;
    throw error;
  }

  return user;
}
