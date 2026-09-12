// src/app/api/delete-song/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { deleteFile, getSongs, saveSongs } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { songId, password } = body;

    // احراز هویت Admin
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'رمز عبور اشتباه است' }, { status: 401 });
    }

    if (!songId) {
      return NextResponse.json({ error: 'شناسه آهنگ الزامی است' }, { status: 400 });
    }

    // ۱. خواندن لیست آهنگ‌ها
    const songs = await getSongs();
    const song = songs.find((s: any) => s.id === songId);

    if (!song) {
      return NextResponse.json({ error: 'آهنگ پیدا نشد' }, { status: 404 });
    }

    // ۲. حذف فایل صوتی از GitHub (فقط اگر از GitHub آپلود شده باشد)
    if (song.source === 'github' && song.audioUrl) {
      try {
        // استخراج مسیر فایل از URL
        const urlParts = song.audioUrl.split('/main/');
        if (urlParts[1]) {
          const filePath = decodeURIComponent(urlParts[1]);
          await deleteFile(filePath, `chore: delete ${song.title}`);
        }
      } catch (err) {
        console.warn('خطا در حذف فایل صوتی:', err);
        // ادامه می‌دهیم حتی اگر حذف فایل شکست بخورد
      }
    }

    // ۳. حذف از لیست آهنگ‌ها
    const updatedSongs = songs.filter((s: any) => s.id !== songId);
    await saveSongs(updatedSongs);

    return NextResponse.json({
      success: true,
      message: `آهنگ "${song.title}" حذف شد`,
      remaining: updatedSongs.length,
    });
  } catch (error) {
    console.error('[Delete] خطا:', error);
    return NextResponse.json(
      { error: 'خطا در حذف آهنگ', details: String(error) },
      { status: 500 }
    );
  }
}