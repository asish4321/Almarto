import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d'; // today, 7d, 30d, 90d, all

    const now = new Date();
    let startDate = new Date();
    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === '90d') {
      startDate.setDate(now.getDate() - 90);
    } else {
      startDate = new Date(0); // All time
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Aggregate queries
    const [
      totalOrders,
      ordersInRange,
      todayOrders,
      monthOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      returnRequests,
      recentOrders,
      topCategories,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          id: true,
          totalAmount: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: todayStart } },
        select: { totalAmount: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: monthStart } },
        select: { totalAmount: true },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
      prisma.product.count({ where: { stock: { lte: 10, gt: 0 } } }),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.orderReturn.count({ where: { status: 'REQUESTED' } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        },
      }),
      prisma.category.findMany({
        take: 6,
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { products: { _count: 'desc' } },
      }),
    ]);

    const totalRevenue = ordersInRange
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const monthRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrders = ordersInRange.filter((o) => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status)).length;
    const deliveredOrders = ordersInRange.filter((o) => o.status === 'DELIVERED').length;
    const cancelledOrders = ordersInRange.filter((o) => o.status === 'CANCELLED').length;

    // Daily revenue chart series for the last 7 or 14 intervals
    const chartData = [];
    const daysToMap = range === 'today' ? 1 : range === '7d' ? 7 : 14;
    for (let i = daysToMap - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const dayTotal = ordersInRange
        .filter((o) => {
          const od = new Date(o.createdAt);
          return od.toDateString() === d.toDateString() && o.status !== 'CANCELLED';
        })
        .reduce((sum, o) => sum + o.totalAmount, 0);

      chartData.push({
        date: dateStr,
        revenue: Math.round(dayTotal),
        orders: ordersInRange.filter((o) => {
          const od = new Date(o.createdAt);
          return od.toDateString() === d.toDateString();
        }).length,
      });
    }

    return NextResponse.json({
      metrics: {
        totalRevenue: Math.round(totalRevenue),
        todayRevenue: Math.round(todayRevenue),
        monthRevenue: Math.round(monthRevenue),
        totalOrders,
        rangeOrdersCount: ordersInRange.length,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        returnRequests,
      },
      chartData,
      recentOrders,
      topCategories: topCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c._count.products,
      })),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ message: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
