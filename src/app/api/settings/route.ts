import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// In-memory cache — avoids a DB round-trip on every page that calls /api/settings
let _cache: { data: Record<string, string>; ts: number } | null = null;
const TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    // Serve from memory if fresh
    if (_cache && Date.now() - _cache.ts < TTL) {
      return NextResponse.json({ settings: _cache.data });
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

    _cache = { data: settingsMap, ts: Date.now() };
    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Settings fetch error:', error);
    // Return cached data if available, otherwise empty
    return NextResponse.json({ settings: _cache?.data ?? {} }, { status: 200 });
  }
}
