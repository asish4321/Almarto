import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Keep-alive endpoint — ping this every few days to prevent Supabase free tier from pausing.
// Use an external cron service (cron-job.org, UptimeRobot, etc.) to call:
//   GET https://your-domain.com/api/health
// every 3–4 days.

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Lightweight query — just checks DB is alive
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', db: 'connected', ts: new Date().toISOString() });
  } catch (err) {
    console.error('Health check failed:', err);
    return NextResponse.json({ status: 'error', db: 'unreachable' }, { status: 503 });
  }
}
