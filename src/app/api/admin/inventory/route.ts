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

    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        sku: true,
        stock: true,
        lowStockThreshold: true,
        price: true,
        mrp: true,
        status: true,
        category: { select: { name: true } },
        variants: {
          select: { id: true, title: true, sku: true, stock: true },
        },
      },
      orderBy: { stock: 'asc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json({ message: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {
    const { productId, variantId, adjustment, reason, newStock } = await request.json();

    if (!productId) {
      return NextResponse.json({ message: 'Product ID required' }, { status: 400 });
    }

    let finalStock = 0;
    if (newStock !== undefined) {
      finalStock = Math.max(0, parseInt(newStock, 10));
    } else if (adjustment !== undefined) {
      const prod = await prisma.product.findUnique({ where: { id: productId } });
      if (!prod) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      finalStock = Math.max(0, prod.stock + parseInt(adjustment, 10));
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { stock: finalStock },
    });

    if (variantId) {
      await prisma.productVariant.update({
        where: { id: variantId },
        data: { stock: finalStock },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'INVENTORY_ADJUSTMENT',
        entity: 'Product',
        entityId: productId,
        details: JSON.stringify({ finalStock, reason: reason || 'Manual adjustment' }),
      },
    });

    return NextResponse.json({ success: true, product: updated, finalStock });
  } catch (error) {
    console.error('Inventory adjust error:', error);
    return NextResponse.json({ message: 'Failed to adjust inventory' }, { status: 500 });
  }
}
