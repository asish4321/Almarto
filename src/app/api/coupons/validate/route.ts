import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json({ message: 'Coupon code is required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ message: 'Invalid or inactive coupon code' }, { status: 404 });
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return NextResponse.json({ message: 'This coupon has expired' }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ message: 'This coupon has reached its maximum usage limit' }, { status: 400 });
    }

    const numericSubtotal = parseFloat(subtotal) || 0;
    if (numericSubtotal < coupon.minOrderValue) {
      return NextResponse.json({
        message: `Minimum order value of ₹${coupon.minOrderValue.toLocaleString('en-IN')} required to use this coupon.`,
      }, { status: 400 });
    }

    let discountApplied = 0;
    if (coupon.type === 'PERCENTAGE') {
      const calculated = (numericSubtotal * coupon.value) / 100;
      discountApplied = coupon.maxDiscount ? Math.min(calculated, coupon.maxDiscount) : calculated;
    } else {
      discountApplied = coupon.value;
    }

    discountApplied = Math.min(discountApplied, numericSubtotal);

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
        description: coupon.description,
      },
      discountApplied: Math.round(discountApplied),
    });
  } catch (error) {
    console.error('Coupon validate error:', error);
    return NextResponse.json({ message: 'Error checking coupon' }, { status: 500 });
  }
}
