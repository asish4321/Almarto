import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('rating');
    const inStock = searchParams.get('inStock') === 'true';
    const isDeal = searchParams.get('isDeal') === 'true';
    const isBestSeller = searchParams.get('isBestSeller') === 'true';
    const isTrending = searchParams.get('isTrending') === 'true';
    const isFeatured = searchParams.get('isFeatured') === 'true';
    const sort = searchParams.get('sort') || 'relevance';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      status: 'PUBLISHED',
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { shortDescription: { contains: q } },
        { brand: { name: { contains: q } } },
        { category: { name: { contains: q } } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (subcategory) {
      where.subcategory = { slug: subcategory };
    }

    if (brand) {
      where.brand = { slug: brand };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    if (inStock) {
      where.stock = { gt: 0 };
    }

    if (isDeal) {
      where.isDealOfTheDay = true;
    }

    if (isBestSeller) {
      where.isBestSeller = true;
    }

    if (isTrending) {
      where.isTrending = true;
    }

    if (isFeatured) {
      where.isFeatured = true;
    }

    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'rating_desc') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          subcategory: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true, logo: true } },
          images: { orderBy: { displayOrder: 'asc' } },
          variants: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let staffUser;
  try {
    staffUser = await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {
    const body = await request.json();
    let {
      title,
      slug,
      description,
      shortDescription,
      categoryId,
      newCategoryName,
      subcategoryId,
      brandId,
      sku,
      barcode,
      mrp,
      price,
      taxRate = 18.0,
      stock = 50,
      lowStockThreshold = 10,
      isFeatured = true,
      isTrending = true,
      isBestSeller = false,
      isDealOfTheDay = false,
      dealEndTime,
      status = 'PUBLISHED',
      sellerName = 'Almarto Pop Studio Direct',
      warrantyInfo = '100% Non-Toxic & Free Missing Part Replacement',
      returnPolicyDays = 7,
      highlights,
      specifications,
      images = [],
      variants = [],
    } = body;

    // If a new category name was entered, auto-create it
    if (newCategoryName && newCategoryName.trim()) {
      const catSlug = newCategoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const createdCategory = await prisma.category.upsert({
        where: { slug: catSlug },
        update: {},
        create: {
          name: newCategoryName.trim(),
          slug: catSlug,
          icon: 'Palette',
          isFeatured: true,
          displayOrder: 10,
        },
      });
      categoryId = createdCategory.id;
    }

    if (!title || !categoryId || !mrp || !price) {
      return NextResponse.json({ message: 'Title, Category, MRP, and Price are required.' }, { status: 400 });
    }

    if (!sku) {
      sku = `POP-${Date.now().toString().slice(-6)}`;
    }

    const generatedSlug = slug || `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString().slice(-4)}`;
    const numMrp = parseFloat(String(mrp));
    const numPrice = parseFloat(String(price));
    const discountPercent = numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;

    // Prepare images array only from user provided images/urls
    let finalImages = Array.isArray(images) && images.length > 0 ? images : [];
    if (finalImages.length === 0 && body.imageUrl && typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
      finalImages = [{ url: body.imageUrl.trim(), isPrimary: true }];
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        slug: generatedSlug,
        description: description || title,
        shortDescription: shortDescription || title,
        categoryId,
        subcategoryId: subcategoryId || null,
        brandId: brandId || null,
        sku,
        barcode: barcode || null,
        mrp: numMrp,
        price: numPrice,
        discountPercent,
        taxRate: parseFloat(String(taxRate)),
        stock: parseInt(String(stock), 10),
        lowStockThreshold: parseInt(String(lowStockThreshold), 10),
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isBestSeller: Boolean(isBestSeller),
        isDealOfTheDay: Boolean(isDealOfTheDay),
        dealEndTime: dealEndTime ? new Date(dealEndTime) : null,
        status,
        sellerName,
        warrantyInfo,
        returnPolicyDays: parseInt(String(returnPolicyDays), 10),
        highlights: typeof highlights === 'string' ? highlights : JSON.stringify(highlights || [
          'Authentic Pop DIY Toy Kit with complete accessories',
          '100% Non-Toxic & Safe Materials',
          'Includes step-by-step illustrated creation manual',
        ]),
        specifications: typeof specifications === 'string' ? specifications : JSON.stringify(specifications || {
          'Material': 'BPA-Free Eco Vinyl & Acrylic',
          'Skill Level': 'All Skill Levels (Ages 6+)',
          'Included': 'Figures, Paint Pots, Brushes, Display Plaque',
        }),
        images: {
          create: finalImages.map((img: { url: string; altText?: string; isPrimary?: boolean }, index: number) => ({
            url: img.url,
            altText: img.altText || title,
            isPrimary: img.isPrimary || index === 0,
            displayOrder: index,
          })),
        },
        variants: {
          create: variants.map((v: { title: string; sku: string; price: number; mrp: number; stock: number; colorName?: string; colorHex?: string; size?: string; storage?: string }) => ({
            title: v.title,
            sku: v.sku || `${sku}-VAR-${Math.random().toString().slice(2, 6)}`,
            price: parseFloat(String(v.price)),
            mrp: parseFloat(String(v.mrp)),
            stock: parseInt(String(v.stock), 10),
            colorName: v.colorName || null,
            colorHex: v.colorHex || null,
            size: v.size || null,
            storage: v.storage || null,
          })),
        },
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });

    // Auto-create initial inventory in first warehouse
    const defaultWarehouse = await prisma.warehouse.findFirst();
    if (defaultWarehouse) {
      await prisma.inventory.create({
        data: {
          productId: newProduct.id,
          warehouseId: defaultWarehouse.id,
          quantityAvailable: parseInt(String(stock), 10),
          quantityReserved: 0,
        },
      });
    }

    // Record audit log
    if (staffUser) {
      await prisma.auditLog.create({
        data: {
          userId: staffUser.id,
          action: 'PRODUCT_CREATE',
          entity: 'Product',
          entityId: newProduct.id,
          details: JSON.stringify({ title: newProduct.title, sku: newProduct.sku, price: newProduct.price }),
        },
      });
    }

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: unknown) {
    const errObj = error as { code?: string; message?: string };
    console.error('Product creation error:', error);
    if (errObj.code === 'P2002') {
      return NextResponse.json({ message: 'A product with this SKU or slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
  }
}
