import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { usages: true } },
      },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Coupons fetch error:', error);
    return NextResponse.json({ message: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {
    const body = await request.json();
    const { code, type = 'PERCENTAGE', value, minOrderValue = 0, maxDiscount, usageLimit, validUntil, description, isActive = true } = body;

    if (!code || value === undefined || !validUntil) {
      return NextResponse.json({ message: 'Code, value, and expiry date are required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        type,
        value: parseFloat(value),
        minOrderValue: parseFloat(minOrderValue),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        validUntil: new Date(validUntil),
        description: description || null,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: unknown) {
    const errObj = error as { code?: string; message?: string };
    if (errObj.code === 'P2002') {
      return NextResponse.json({ message: 'A coupon with this code already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create coupon' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'Coupon ID required' }, { status: 400 });

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return NextResponse.json({ message: 'Failed to delete coupon' }, { status: 500 });
  }
}
