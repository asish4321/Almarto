import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        validUntil: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
        minOrderValue: true,
        maxDiscount: true,
        validUntil: true,
        description: true,
      },
    });

    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    console.error('Fetch public coupons error:', error);
    return NextResponse.json({ message: 'Failed to fetch coupons', coupons: [] }, { status: 500 });
  }
}
