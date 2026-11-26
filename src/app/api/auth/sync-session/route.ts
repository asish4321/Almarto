import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, name, phone, supabaseId, avatarUrl } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isOwner = cleanEmail === 'aswak761@gmail.com';

    let user;
    try {
      user = await prisma.user.upsert({
        where: { email: cleanEmail },
        update: {
          ...(name ? { name } : {}),
          ...(phone ? { phone } : {}),
          ...(isOwner ? { role: 'SUPER_ADMIN' } : {}),
        },
        create: {
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0],
          phone: phone || null,
          passwordHash: 'supabase_auth_' + (supabaseId || Date.now()),
          role: isOwner ? 'SUPER_ADMIN' : 'CUSTOMER',
          profile: {
            create: {
              loyaltyPoints: 100,
              avatar: avatarUrl || null,
            },
          },
        },
        include: { profile: true },
      });
    } catch (dbErr) {
      console.error('DB upsert error in sync-session:', dbErr);
      return NextResponse.json({ message: 'Database error during session sync' }, { status: 500 });
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { message: 'This account has been suspended.' },
        { status: 403 }
      );
    }

    const token = createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      loyaltyPoints: user.profile?.loyaltyPoints || 0,
    });
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        loyaltyPoints: user.profile?.loyaltyPoints || 0,
      },
    });

    response.cookies.set('almarto_session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Session sync error:', error);
    return NextResponse.json({ message: 'Failed to sync session' }, { status: 500 });
  }
}
