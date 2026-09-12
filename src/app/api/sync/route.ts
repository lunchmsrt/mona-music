// src/app/api/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchAudioFiles } from '@/lib/abrehamrahi';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // حداکثر ۶۰ ثانیه

// مسیر کش محلی
const CACHE_FILE = path.join(process.cwd(), 'src/data/songs-cache.json');

export async function GET(request: NextRequest) {
  // ✅ احراز هویت Cron Secret (امنیت)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // خواندن زمان‌بندی از هدر (اختیاری)
  const schedule = request.headers.get('x-vercel-cron-schedule');
  console.log(`[Sync] شروع همگام‌سازی - زمان‌بندی: ${schedule || 'دستی'}`);

  try {
    // ۱. دریافت لیست آهنگ‌ها از ابرهمراهی
    const audioFiles = await fetchAudioFiles('/Music');

    if (audioFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'هیچ فایل صوتی پیدا نشد',
        count: 0,
      });
    }

    // ۲. تبدیل به ساختار Song
    const songs = audioFiles.map((file) => ({
      id: file.id,
      title: file.name.replace(/\.[^/.]+$/, ''), // حذف پسوند
      artist: 'Mona',
      album: 'Mona Music',
      audioUrl: file.directUrl,
      coverUrl: file.thumbnailUrl || 'https://picsum.photos/seed/mona/400',
      size: file.size,
      mimeType: file.mimeType,
      updatedAt: file.modifiedAt,
    }));

    // ۳. ذخیره در کش محلی
    await fs.writeFile(CACHE_FILE, JSON.stringify(songs, null, 2), 'utf-8');

    console.log(`[Sync] ✅ ${songs.length} آهنگ همگام‌سازی شد`);

    return NextResponse.json({
      success: true,
      count: songs.length,
      songs: songs.slice(0, 5), // فقط ۵ مورد اول را برگردان
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