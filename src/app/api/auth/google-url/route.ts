import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const redirectUrl = body.redirectUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mnftlaxcqpwpylswkkjm.supabase.co';
    const authorizeUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;

    // Probe Supabase Auth to check if Google provider is enabled
    const probe = await fetch(authorizeUrl, { redirect: 'manual' });

    if (probe.status === 400) {
      const errorJson = await probe.json().catch(() => null);
      if (
        errorJson?.msg?.toLowerCase().includes('provider is not enabled') ||
        errorJson?.error_code === 'validation_failed'
      ) {
        return NextResponse.json({
          enabled: false,
          error: 'GOOGLE_NOT_ENABLED',
          message:
            'Google Sign-In is not enabled in your Supabase project yet. Please toggle Google ON in your Supabase Dashboard.',
          setupUrl: 'https://supabase.com/dashboard/project/mnftlaxcqpwpylswkkjm/auth/providers',
        });
      }
    }

    // Google provider is enabled and redirects to accounts.google.com!
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
