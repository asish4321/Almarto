import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, code, name } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ message: 'Email and verification code are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    // 1. Check our database OTP record
    const otpRecord = await prisma.websiteSetting.findUnique({
      where: { key: `otp:${cleanEmail}` },
    });

    let isValid = false;
    let storedName = name || null;
    let storedPhone: string | null = null;

    if (otpRecord) {
      try {
        const parsed = JSON.parse(otpRecord.value);
        if (parsed.code === cleanCode && Date.now() <= parsed.expiresAt) {
          isValid = true;
          storedName = storedName || parsed.name || null;
          storedPhone = parsed.phone || null;
        }
      } catch (err) {
        console.error('Error parsing OTP record:', err);
      }
    }

    // 2. Also check Supabase OTP verification as secondary check
    if (!isValid && supabase) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanCode,
          type: 'email',
        });
        if (!error && data?.user) {
          isValid = true;
        }
      } catch (supaErr) {
        console.warn('Supabase verifyOtp error:', supaErr);
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid or expired verification code. Please request a new one.' },
        { status: 400 }
      );
    }

    // 3. User is verified! Find or create user in Supabase PostgreSQL
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { profile: true },
    });

    const isOwner = cleanEmail === 'aswak761@gmail.com' || cleanEmail === 'admin@almarto.com';

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: storedName || cleanEmail.split('@')[0],
          phone: storedPhone,
          passwordHash: 'otp_verified_' + Date.now(),
          role: isOwner ? 'SUPER_ADMIN' : 'CUSTOMER',
          profile: {
            create: {
              loyaltyPoints: 100, // 100 Welcome SuperCoins
            },
          },
        },
        include: { profile: true },
      });
    } else if (isOwner && user.role !== 'SUPER_ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'SUPER_ADMIN' },
        include: { profile: true },
      });
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { message: 'This account has been suspended by administration.' },
        { status: 403 }
      );
    }

    // Remove used OTP
    await prisma.websiteSetting.deleteMany({
      where: { key: `otp:${cleanEmail}` },
    });

    // Create session token & set cookie
    const token = createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      message: 'Email successfully verified!',
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
    console.error('Verify OTP error:', error);
    return NextResponse.json({ message: 'Verification failed' }, { status: 500 });
  }
}
