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

    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isBlocked: true,
        createdAt: true,
        profile: { select: { loyaltyPoints: true } },
        _count: { select: { orders: true } },
        orders: {
          select: { totalAmount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || 'N/A',
      isBlocked: c.isBlocked,
      createdAt: c.createdAt,
      loyaltyPoints: c.profile?.loyaltyPoints || 0,
      totalOrders: c._count.orders,
      totalSpent: c.orders.reduce((sum, o) => sum + o.totalAmount, 0),
    }));

    return NextResponse.json({ customers: formatted });
  } catch (error) {
    console.error('Customers fetch error:', error);
    return NextResponse.json({ message: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  let user;
  try {
    user = await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {
    const { customerId, isBlocked } = await request.json();
    if (!customerId) return NextResponse.json({ message: 'Customer ID required' }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id: customerId },
      data: { isBlocked: Boolean(isBlocked) },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: isBlocked ? 'CUSTOMER_BLOCK' : 'CUSTOMER_UNBLOCK',
        entity: 'User',
        entityId: customerId,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('Update customer status error:', error);
    return NextResponse.json({ message: 'Failed to update customer status' }, { status: 500 });
  }
}
