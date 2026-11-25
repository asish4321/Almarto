import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Super Admin access required.' }, { status: err?.statusCode || 403 });
  }

  try {

    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'CUSTOMER_SUPPORT', 'FINANCE_MANAGER'],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Fetch staff error:', error);
    return NextResponse.json({ message: 'Failed to fetch staff members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Super Admin access required.' }, { status: err?.statusCode || 403 });
  }

  try {
    const { name, email, role, phone, password = 'StaffPassword@123' } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json({ message: 'Name, email, and role are required' }, { status: 400 });
    }

    const staffMember = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        role,
        phone: phone || null,
        passwordHash: password,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'STAFF_CREATE',
        entity: 'User',
        entityId: staffMember.id,
        details: JSON.stringify({ email: staffMember.email, role: staffMember.role }),
      },
    });

    return NextResponse.json({ success: true, staff: staffMember });
  } catch (error: unknown) {
    const errObj = error as { code?: string; message?: string };
    if (errObj.code === 'P2002') {
      return NextResponse.json({ message: 'A user with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create staff member' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Only Super Admin can modify staff roles.' }, { status: err?.statusCode || 403 });
  }

  try {
    const { staffId, role, isActive } = await request.json();

    if (!staffId) return NextResponse.json({ message: 'Staff ID required' }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.user.update({
      where: { id: staffId },
      data: updateData,
    });

    return NextResponse.json({ success: true, staff: updated });
  } catch (error) {
    console.error('Update staff error:', error);
    return NextResponse.json({ message: 'Failed to update staff member' }, { status: 500 });
  }
}
