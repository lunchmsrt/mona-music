// src/app/api/songs-github/route.ts
import { NextResponse } from 'next/server';
import { getSongs } from '@/lib/github';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // کش ۶۰ ثانیهای

export async function GET() {
  try {
    const songs = await getSongs();
    return NextResponse.json({
      success: true,
      count: songs.length,
      songs,
    });
  } catch (error) {
    console.error('[Songs] خطا:', error);
    return NextResponse.json({
      success: true,
      count: 0,
      songs: [],
      message: 'خطا در خواندن آهنگها',
    });
  }
}