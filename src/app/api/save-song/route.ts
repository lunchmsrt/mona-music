import { NextRequest, NextResponse } from 'next/server';
import { getSongs, saveSongs } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, title, artist, album, audioUrl } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'رمز عبور اشتباه است' }, { status: 401 });
    }

    if (!audioUrl || !title) {
      return NextResponse.json({ error: 'فیلدهای ضروری ناقص است' }, { status: 400 });
    }

    const songs = await getSongs();
    const newSong = {
      id: `blob-${Date.now()}`,
      title,
      artist: artist || 'Mona',
      album: album || 'Mona Music',
      audioUrl: audioUrl, // ← این آدرس Blob است، نه GitHub Raw
      coverUrl: 'https://github.com/lunchmsrt/mona-music/blob/main/public/mona/qermezdasht.jpg',
      source: 'blob',
      uploadedAt: new Date().toISOString(),
    };

    songs.push(newSong);
    await saveSongs(songs);

    return NextResponse.json({ success: true, song: newSong });
  } catch (error) {
    console.error('[Save Song] خطا:', error);
    return NextResponse.json({ error: 'خطا در ذخیره' }, { status: 500 });
  }
}