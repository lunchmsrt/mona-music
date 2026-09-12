// src/app/api/songs/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const CACHE_FILE = path.join(process.cwd(), 'src/data/songs-cache.json');

export async function GET() {
  try {
    const content = await fs.readFile(CACHE_FILE, 'utf-8');
    const songs = JSON.parse(content);

    return NextResponse.json({
      success: true,
      count: songs.length,
      songs,
    });
  } catch (error) {
    // اگر کش وجود نداشت، آرایه خالی برگردان
    console.warn('[Songs] کش پیدا نشد، ابتدا sync را اجرا کنید');
    return NextResponse.json({
      success: true,
      count: 0,
      songs: [],
      message: 'کش خالی است. منتظر همگام‌سازی خودکار باشید.',
    });
  }
}