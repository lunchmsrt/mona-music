// src/app/api/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchAllUserSongs } from '@/lib/archive';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CACHE_FILE = path.join(process.cwd(), 'src/data/songs-cache.json');

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const songs = await fetchAllUserSongs();

    if (songs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'هیچ فایل صوتی در Archive.org پیدا نشد',
        count: 0,
      });
    }

    await fs.writeFile(CACHE_FILE, JSON.stringify(songs, null, 2), 'utf-8');

    console.log(`[Sync] ✅ ${songs.length} آهنگ از Archive.org همگام‌سازی شد`);

    return NextResponse.json({
      success: true,
      count: songs.length,
      songs: songs.slice(0, 5),
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Sync] ❌ خطا:', error);
    return NextResponse.json(
      { error: 'خطا در همگام‌سازی', details: String(error) },
      { status: 500 }
    );
  }
}