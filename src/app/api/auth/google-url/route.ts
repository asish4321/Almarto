import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const defaultSite = process.env.NEXT_PUBLIC_SITE_URL || 'https://almartoo.netlify.app';
    const redirectUrl = body.redirectUrl || `${defaultSite.replace(/\/$/, '')}/auth/callback`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mnftlaxcqpwpylswkkjm.supabase.co';
    const authorizeUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;

    return NextResponse.json({
      enabled: true,
      url: authorizeUrl,
    });
  } catch (error) {
    console.error('Check Google provider error:', error);
    return NextResponse.json(
      {
        enabled: false,
        message: 'Could not contact authentication provider.',
      },
      { status: 500 }
    );
  }
}
