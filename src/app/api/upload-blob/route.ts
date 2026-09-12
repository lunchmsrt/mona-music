// src/app/api/upload-blob/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSongs, saveSongs } from '@/lib/github';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const password = formData.get('password') as string;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'رمز عبور اشتباه است' }, { status: 401 });
    }

    const file = formData.get('file') as File;
    const title = (formData.get('title') as string) || file.name.replace(/\.[^/.]+$/, '');
    const artist = (formData.get('artist') as string) || 'Mona';
    const album = (formData.get('album') as string) || 'Mona Music';

    if (!file) {
      return NextResponse.json({ error: 'فایلی ارسال نشده' }, { status: 400 });
    }

    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'فقط فایل صوتی مجاز است' }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
    const filename = `music/${Date.now()}-${safeName}`;

    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    const newSong = {
      id: `blob-${Date.now()}`,
      title,
      artist,
      album,
      audioUrl: blob.url,
      coverUrl: 'https://picsum.photos/seed/mona/400',
      source: 'blob',
      uploadedAt: new Date().toISOString(),
    };

    const songs = await getSongs();
    songs.push(newSong);
    await saveSongs(songs);

    return NextResponse.json({
      success: true,
      song: newSong,
      message: `آهنگ "${title}" با موفقیت آپلود شد`,
    });
  } catch (error) {
    console.error('[Upload Blob] خطا:', error);
    return NextResponse.json(
      { error: 'خطا در آپلود', details: String(error) },
      { status: 500 }
    );
  }
}