import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        subcategory: true,
        brand: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: true,
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Fetch similar products from the same category or brand, or other published products
    const similarProducts = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        status: 'PUBLISHED',
      },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: true,
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ product, similarProducts });
  } catch (error) {
    console.error('Single product fetch error:', error);
    return NextResponse.json({ message: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  let staffUser;
  try {
    staffUser = await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {

    const { id } = params;
    const body = await request.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.mrp !== undefined) updateData.mrp = parseFloat(body.mrp);
    if (body.price !== undefined) {
      updateData.price = parseFloat(body.price);
      const mrp = body.mrp !== undefined ? parseFloat(body.mrp) : existing.mrp;
      updateData.discountPercent = Math.max(0, Math.round(((mrp - parseFloat(body.price)) / mrp) * 100));
    }
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock, 10);
    if (body.lowStockThreshold !== undefined) updateData.lowStockThreshold = parseInt(body.lowStockThreshold, 10);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured);
    if (body.isTrending !== undefined) updateData.isTrending = Boolean(body.isTrending);
    if (body.isBestSeller !== undefined) updateData.isBestSeller = Boolean(body.isBestSeller);
    if (body.isDealOfTheDay !== undefined) updateData.isDealOfTheDay = Boolean(body.isDealOfTheDay);
    if (body.description !== undefined) updateData.description = body.description;
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.subcategoryId !== undefined) updateData.subcategoryId = body.subcategoryId;
    if (body.brandId !== undefined) updateData.brandId = body.brandId;
    if (body.specifications !== undefined) {
      updateData.specifications = typeof body.specifications === 'string' ? body.specifications : JSON.stringify(body.specifications);
    }
    if (body.highlights !== undefined) {
      updateData.highlights = typeof body.highlights === 'string' ? body.highlights : JSON.stringify(body.highlights);
    }

    // Handle images update if provided
    let newImages = (body.images && Array.isArray(body.images)) ? body.images : [];
    if (newImages.length === 0 && body.imageUrl && typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
      newImages = [{ url: body.imageUrl.trim(), isPrimary: true }];
    }
    if (newImages.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: newImages.map((img: { url: string; altText?: string; isPrimary?: boolean }, index: number) => ({
          productId: id,
          url: img.url,
          altText: img.altText || existing.title,
          isPrimary: img.isPrimary || index === 0,
          displayOrder: index,
        })),
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        brand: true,
        images: true,
      },
    });

    if (staffUser) {
      await prisma.auditLog.create({
        data: {
          userId: staffUser.id,
          action: 'PRODUCT_UPDATE',
          entity: 'Product',
          entityId: id,
          details: JSON.stringify(updateData),
        },
      });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ message: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  let staffUser;
  try {
    staffUser = await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required to delete products.' }, { status: err?.statusCode || 403 });
  }

  try {

    const { id } = params;

    // Clean up dependent records first
    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.wishlistItem.deleteMany({ where: { productId: id } });
    await prisma.review.deleteMany({ where: { productId: id } });
    await prisma.inventory.deleteMany({ where: { productId: id } });
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    await prisma.productImage.deleteMany({ where: { productId: id } });

    await prisma.product.delete({
      where: { id },
    });

    if (staffUser) {
      await prisma.auditLog.create({
        data: {
          userId: staffUser.id,
          action: 'PRODUCT_DELETE',
          entity: 'Product',
          entityId: id,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ message: 'Failed to delete product' }, { status: 500 });
  }
}
