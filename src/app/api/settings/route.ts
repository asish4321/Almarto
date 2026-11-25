import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSettingsCache, setSettingsCache, CACHE_TTL } from '@/lib/siteCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const cached = getSettingsCache();
    // Serve from memory if fresh
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json({ settings: cached.data });
    }

    const settings = await Promise.race([
      prisma.websiteSetting.findMany({ select: { key: true, value: true } }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      ),
    ]);

    const settingsMap = (settings as { key: string; value: string }[]).reduce(
      (acc, s) => { acc[s.key] = s.value; return acc; },
      {} as Record<string, string>
    );

    setSettingsCache(settingsMap);
    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Settings fetch error:', error);
    const cached = getSettingsCache();
    return NextResponse.json({ settings: cached?.data ?? {} }, { status: 200 });
  }
}
