import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionToken, isSecureCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists' }, { status: 409 });
    }

    const isOwner = cleanEmail === 'aswak761@gmail.com' || cleanEmail === 'admin@almarto.com';

    const newUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash: password || 'customer123',
        phone: phone || null,
        role: isOwner ? 'SUPER_ADMIN' : 'CUSTOMER',
        profile: {
          create: {
            loyaltyPoints: 100, // Welcome gift
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const token = createSessionToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      phone: newUser.phone,
      loyaltyPoints: newUser.profile?.loyaltyPoints || 100,
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone,
        loyaltyPoints: newUser.profile?.loyaltyPoints || 100,
      },
    });

    const secure = isSecureCookie(request);

    response.cookies.set('almarto_session_token', token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Failed to create account' }, { status: 500 });
  }
}
