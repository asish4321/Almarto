import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('all') === 'true';

    const legacyMockSlugs = [
      'paint-your-own-vinyl',
      'diy-mystery-blind-boxes',
      'miniature-pop-dioramas',
      'pop-brick-mech-kits',
      'pop-beads-craft-studio',
      'sensory-fidget-diys',
    ];

    const categories = await prisma.category.findMany({
      where: {
        ...(includeAll ? {} : { isActive: true }),
        slug: { notIn: legacyMockSlugs },
      },
      include: {
        subcategories: {
          where: includeAll ? {} : { isActive: true },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json({ message: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {
    const { name, slug, description, image, icon, isFeatured, displayOrder, isActive } = await request.json();

    if (!name) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const cleanSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-+|-+$/g, '');

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        description: description?.trim() || null,
        image: image?.trim() || null,
        icon: icon || 'Tag',
        isFeatured: Boolean(isFeatured),
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: unknown) {
    const errObj = error as { code?: string; message?: string };
    if (errObj.code === 'P2002') {
      return NextResponse.json({ message: 'Category with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {
    const { id, name, slug, description, image, icon, isFeatured, displayOrder, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Category ID is required for update' }, { status: 400 });
    }

    const cleanSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : undefined;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(cleanSlug ? { slug: cleanSlug } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(image !== undefined ? { image: image?.trim() || null } : {}),
        ...(icon !== undefined ? { icon } : {}),
        ...(isFeatured !== undefined ? { isFeatured: Boolean(isFeatured) } : {}),
        ...(displayOrder !== undefined ? { displayOrder: parseInt(displayOrder, 10) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return NextResponse.json({ success: true, category: updatedCategory });
  } catch (error: unknown) {
    const errObj = error as { code?: string; message?: string };
    if (errObj.code === 'P2002') {
      return NextResponse.json({ message: 'Category with this slug already exists' }, { status: 409 });
    }
    console.error('Update category error:', error);
    return NextResponse.json({ message: 'Failed to update category' }, { status: 500 });
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
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json({ message: 'Category ID is required for deletion' }, { status: 400 });
    }

    // Safely delete category and cascading references in transaction
    await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { categoryId: id! },
        select: { id: true },
      });
      const productIds = products.map((p) => p.id);

      if (productIds.length > 0) {
        await tx.productImage.deleteMany({ where: { productId: { in: productIds } } });
        await tx.productVariant.deleteMany({ where: { productId: { in: productIds } } });
        await tx.inventory.deleteMany({ where: { productId: { in: productIds } } });
        await tx.cartItem.deleteMany({ where: { productId: { in: productIds } } });
        await tx.wishlistItem.deleteMany({ where: { productId: { in: productIds } } });
        await tx.review.deleteMany({ where: { productId: { in: productIds } } });
        await tx.orderItem.deleteMany({ where: { productId: { in: productIds } } });
        await tx.product.deleteMany({ where: { id: { in: productIds } } });
      }

      await tx.subcategory.deleteMany({ where: { categoryId: id! } });
      await tx.category.delete({ where: { id: id! } });
    });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ message: 'Failed to delete category' }, { status: 500 });
  }
}

