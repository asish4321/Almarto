import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { invalidateAllCaches } from '@/lib/siteCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ message: 'Unauthorized. Admin privileges required.' }, { status: err?.statusCode || 403 });
  }

  try {
    const [banners, settings] = await Promise.all([
      prisma.banner.findMany({ orderBy: { displayOrder: 'asc' } }),
      prisma.websiteSetting.findMany(),
    ]);

    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({ banners, settings: settingsMap });
  } catch (error) {
    console.error('Content fetch error:', error);
    return NextResponse.json({ message: 'Failed to fetch content' }, { status: 500 });
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
    const { action, bannerData, settingsData } = body;

    if (action === 'ADD_BANNER' && bannerData) {
      const banner = await prisma.banner.create({
        data: {
          title: bannerData.title,
          subtitle: bannerData.subtitle || null,
          imageUrl: bannerData.imageUrl,
          linkUrl: bannerData.linkUrl || '/products',
          buttonText: bannerData.buttonText || 'Shop Now',
          position: bannerData.position || 'HERO',
          displayOrder: bannerData.displayOrder ? parseInt(bannerData.displayOrder, 10) : 0,
          isActive: bannerData.isActive !== false,
        },
      });
      invalidateAllCaches();
      revalidatePath('/', 'layout');
      revalidatePath('/');
      return NextResponse.json({ success: true, banner });
    }

    if (action === 'UPDATE_SETTINGS' && settingsData) {
      for (const [key, value] of Object.entries(settingsData)) {
        await prisma.websiteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), group: 'STORE' },
        });
      }
      invalidateAllCaches();
      revalidatePath('/', 'layout');
      revalidatePath('/');
      return NextResponse.json({ success: true, message: 'Settings updated' });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Content update error:', error);
    return NextResponse.json({ message: 'Failed to update content' }, { status: 500 });
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
    const bannerId = searchParams.get('bannerId');

    if (!bannerId) return NextResponse.json({ message: 'Banner ID required' }, { status: 400 });

    await prisma.banner.delete({ where: { id: bannerId } });
    invalidateAllCaches();
    revalidatePath('/', 'layout');
    revalidatePath('/');
    return NextResponse.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    console.error('Delete banner error:', error);
    return NextResponse.json({ message: 'Failed to delete banner' }, { status: 500 });
  }
}
