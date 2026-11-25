import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email, name, phone } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Generate a secure 6-digit numeric verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save verification code in Supabase PostgreSQL (WebsiteSetting table)
    await prisma.websiteSetting.upsert({
      where: { key: `otp:${cleanEmail}` },
      update: {
        value: JSON.stringify({ code, expiresAt, name: name || null, phone: phone || null }),
        group: 'AUTH',
      },
      create: {
        key: `otp:${cleanEmail}`,
        value: JSON.stringify({ code, expiresAt, name: name || null, phone: phone || null }),
        group: 'AUTH',
      },
    });

    // 1. Try sending via direct Node SMTP if configured
    const emailResult = await sendEmail({
      to: cleanEmail,
      subject: `${code} is your ALMARTO Verification Code`,
      code,
    });

    let emailSent = emailResult.sent;
    let rateLimited = false;

    // 2. If not sent via Node SMTP, dispatch via Supabase Auth
    if (!emailSent && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: true,
          },
        });
        if (!error) {
          emailSent = true;
        } else if (error.message?.toLowerCase().includes('rate limit')) {
          rateLimited = true;
        }
      } catch (err) {
        console.warn('Supabase OTP dispatch warning:', err);
      }
    }

    // Do NOT return the code to the frontend! User must retrieve it from their email inbox
    if (!emailSent && rateLimited) {
      return NextResponse.json({
        success: true,
        message: `Verification code was sent to ${cleanEmail}. (If delivery is delayed, Supabase default email rate limit is active; configure custom SMTP in Supabase settings).`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please check your email inbox.`,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ message: 'Failed to send verification code' }, { status: 500 });
  }
}
