import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// ── GET single order ──────────────────────────────────────────────────────────
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const { id } = params;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: {
        items: { include: { product: { select: { id: true, slug: true, title: true } } } },
        payments: true,
        refunds: true,
        shipment: { include: { trackingSteps: { orderBy: { timestamp: 'desc' } } } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'ORDER_MANAGER', 'CUSTOMER_SUPPORT', 'FINANCE_MANAGER'].includes(user.role);
    if (!isStaff && order.userId !== user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Fetch order error:', error);
    return NextResponse.json({ message: 'Failed to fetch order' }, { status: 500 });
  }
}

// ── PATCH order (cancel, return, status update, shipment update) ──────────────
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const { id } = params;
    const body = await request.json();
    const { action, status, cancellationReason, returnReason, courierPartner, awbNumber, trackingActivity, location } = body;

    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { shipment: true },
    });

    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'ORDER_MANAGER', 'CUSTOMER_SUPPORT', 'FINANCE_MANAGER'].includes(user.role);

    // Customer cancellation
    if (action === 'CANCEL') {
      if (order.userId !== user.id && !isStaff) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
      if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
        return NextResponse.json({ message: `Order cannot be cancelled at status ${order.status}` }, { status: 400 });
      }
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED', cancellationReason: cancellationReason || 'Cancelled by customer' },
      });
      const orderItems = await prisma.orderItem.findMany({ where: { orderId: order.id } });
      for (const item of orderItems) {
        await prisma.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
      return NextResponse.json({ success: true, order: updated });
    }

    // Customer return request
    if (action === 'REQUEST_RETURN') {
      if (order.userId !== user.id && !isStaff) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
      if (order.status !== 'DELIVERED') {
        return NextResponse.json({ message: 'Only delivered orders can be returned' }, { status: 400 });
      }
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: 'RETURN_REQUESTED' },
      });
      await prisma.orderReturn.create({
        data: { orderId: order.id, reason: returnReason || 'Defective / Not as described', status: 'REQUESTED' },
      });
      return NextResponse.json({ success: true, order: updated });
    }

    // Delete shipment tracking history (staff only)
    if (action === 'DELETE_SHIPMENT') {
      if (!isStaff) return NextResponse.json({ message: 'Staff privileges required' }, { status: 403 });
      if (order.shipment) {
        await prisma.shipmentTracking.deleteMany({ where: { shipmentId: order.shipment.id } });
        await prisma.shipment.delete({ where: { id: order.shipment.id } });
      }
      return NextResponse.json({ success: true, message: 'Shipment and tracking history deleted' });
    }

    // Staff-only: status update + shipment tracking
    if (!isStaff) return NextResponse.json({ message: 'Staff privileges required' }, { status: 403 });

    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
      if (status === 'DELIVERED') updateData.paymentStatus = 'PAID';
    }

    const updated = await prisma.order.update({ where: { id: order.id }, data: updateData });

    if (order.shipment) {
      const shipmentUpdates: Record<string, unknown> = {};
      if (courierPartner) shipmentUpdates.courierPartner = courierPartner;
      if (awbNumber) shipmentUpdates.awbNumber = awbNumber;
      if (status) shipmentUpdates.status = status;
      if (Object.keys(shipmentUpdates).length > 0) {
        await prisma.shipment.update({ where: { id: order.shipment.id }, data: shipmentUpdates });
      }
      if (trackingActivity) {
        await prisma.shipmentTracking.create({
          data: {
            shipmentId: order.shipment.id,
            status: status || order.status,
            location: location || 'Transit Hub',
            activity: trackingActivity,
          },
        });
      }
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ message: 'Failed to update order' }, { status: 500 });
  }
}

// ── DELETE order entirely (admin only) ───────────────────────────────────────
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
    }

    const { id } = params;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

    // Restore stock
    for (const item of order.items) {
      await prisma.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      if (item.variantId) {
        await prisma.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      }
    }

    await prisma.order.delete({ where: { id: order.id } });

    return NextResponse.json({ success: true, message: `Order ${order.orderNumber} deleted` });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json({ message: 'Failed to delete order' }, { status: 500 });
  }
}
