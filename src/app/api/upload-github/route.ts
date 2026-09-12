// src/app/api/upload-github/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { putFile, getSongs, saveSongs } from '@/lib/github';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // حداکثر ۶۰ ثانیه برای آپلود

export async function POST(request: NextRequest) {
  try {
    // ۱. احراز هویت Admin
    const formData = await request.formData();
    const password = formData.get('password') as string;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'رمز عبور اشتباه است' }, { status: 401 });
    }

    // ۲. دریافت فایل و متادیتا
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string || 'Mona';
    const album = formData.get('album') as string || 'Mona Music';

    if (!file) {
      return NextResponse.json({ error: 'فایلی ارسال نشده' }, { status: 400 });
    }

    // ۳. بررسی نوع فایل
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'فقط فایل صوتی مجاز است' }, { status: 400 });
    }

    // ۴. ساخت نام فایل امن
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
    const timestamp = Date.now();
    const filename = `${timestamp}-${safeName}`;
    const filePath = `${process.env.GITHUB_MUSIC_PATH || 'public/music'}/${filename}`;

    // ۵. تبدیل فایل به Base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // ۶. آپلود فایل صوتی به GitHub
    console.log(`[Upload] آپلود ${filename} به GitHub...`);
    await putFile(filePath, base64, `feat: upload ${title} by ${artist}`);

    // ۷. لینک مستقیم فایل در GitHub (Raw URL)
    const rawUrl = `https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/${process.env.GITHUB_BRANCH}/${filePath}`;

    // ۸. بهروزرسانی songs.json
    const songs = await getSongs();
    const newSong = {
      id: `gh-${timestamp}`,
      title,
      artist,
      album,
      audioUrl: rawUrl,
      coverUrl: 'https://picsum.photos/seed/mona/400',
      source: 'github',
      uploadedAt: new Date().toISOString(),
    };

    songs.push(newSong);
    await saveSongs(songs);

    console.log(`[Upload] ✅ ${title} با موفقیت آپلود شد`);

    return NextResponse.json({
      success: true,
      song: newSong,
      message: `آهنگ "${title}" با موفقیت آپلود شد`,
    });
  } catch (error) {
    console.error('[Upload] خطا:', error);
    return NextResponse.json(
      { error: 'خطا در آپلود', details: String(error) },
      { status: 500 }
    );
  }
}