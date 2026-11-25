import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {
    const slugsToDelete = [
      'paint-your-own-vinyl',
      'diy-mystery-blind-boxes',
      'miniature-pop-dioramas',
      'pop-brick-mech-kits',
      'pop-beads-craft-studio',
      'sensory-fidget-diys',
    ];

    const deletedNames: string[] = [];

    for (const slug of slugsToDelete) {
      const cat = await prisma.category.findUnique({ where: { slug } });
      if (cat) {
        const products = await prisma.product.findMany({
          where: { categoryId: cat.id },
          select: { id: true },
        });
        const pIds = products.map((p) => p.id);

        if (pIds.length > 0) {
          await prisma.productImage.deleteMany({ where: { productId: { in: pIds } } });
          await prisma.productVariant.deleteMany({ where: { productId: { in: pIds } } });
          await prisma.inventory.deleteMany({ where: { productId: { in: pIds } } });
          await prisma.cartItem.deleteMany({ where: { productId: { in: pIds } } });
          await prisma.wishlistItem.deleteMany({ where: { productId: { in: pIds } } });
          await prisma.review.deleteMany({ where: { productId: { in: pIds } } });
          await prisma.orderItem.deleteMany({ where: { productId: { in: pIds } } });
          await prisma.product.deleteMany({ where: { id: { in: pIds } } });
        }

        await prisma.subcategory.deleteMany({ where: { categoryId: cat.id } });
        await prisma.category.delete({ where: { id: cat.id } });
        deletedNames.push(cat.name);
      }
    }

    const remaining = await prisma.category.findMany({
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json({
      success: true,
      deleted: deletedNames,
      remainingCategories: remaining,
    });
  } catch (error) {
    console.error('Clean categories error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
