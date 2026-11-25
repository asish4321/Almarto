import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Verify Razorpay payment signature to prevent tampering
export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ verified: false, error: 'Razorpay not configured' }, { status: 500 });
    }

    // HMAC-SHA256 signature verification
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    const verified = expectedSignature === razorpay_signature;

    if (!verified) {
      console.error('Razorpay signature mismatch');
      return NextResponse.json({ verified: false }, { status: 400 });
    }

    return NextResponse.json({ verified: true, paymentId: razorpay_payment_id });
  } catch (err) {
    console.error('Razorpay verify error:', err);
    return NextResponse.json({ verified: false }, { status: 500 });
  }
}
