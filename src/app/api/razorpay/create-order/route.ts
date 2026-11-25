import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Create a Razorpay order server-side (keeps secret key secure)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { amount, currency = 'INR', receipt } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 });
    }

    // Call Razorpay Orders API
    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // paise
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Razorpay order error:', err);
      return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
    }

    const order = await response.json();
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
