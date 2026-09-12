// src/app/api/albums/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAlbums, saveAlbums, type Album } from '@/lib/github';

export const dynamic = 'force-dynamic';

// ---------- GET: خواندن لیست آلبوم‌ها ----------
export async function GET() {
  try {
    const albums = await getAlbums();
    return NextResponse.json({ success: true, albums });
  } catch (error) {
    console.error('[Albums GET] خطا:', error);
    return NextResponse.json({ success: true, albums: [] });
  }
}

// ---------- POST: افزودن آلبوم جدید ----------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, name, artist, coverUrl } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'رمز عبور اشتباه است' }, { status: 401 });
    }

    if (!name || !coverUrl) {
      return NextResponse.json({ error: 'نام و کاور الزامی است' }, { status: 400 });
    }

    const albums = await getAlbums();
    const newAlbum: Album = {
      id: `album-${Date.now()}`,
      name,
      artist: artist || 'Mona',
      coverUrl,
      createdAt: new Date().toISOString(),
    };

    albums.push(newAlbum);
    await saveAlbums(albums);

    return NextResponse.json({ success: true, album: newAlbum });
  } catch (error) {
    console.error('[Albums POST] خطا:', error);
    return NextResponse.json({ error: 'خطا در ذخیره آلبوم' }, { status: 500 });
  }
}

// ---------- DELETE: حذف آلبوم ----------
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, id } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'رمز عبور اشتباه است' }, { status: 401 });
    }

    const albums = await getAlbums();
    const filtered = albums.filter((a) => a.id !== id);

    if (albums.length === filtered.length) {
      return NextResponse.json({ error: 'آلبوم پیدا نشد' }, { status: 404 });
    }

    await saveAlbums(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Albums DELETE] خطا:', error);
    return NextResponse.json({ error: 'خطا در حذف' }, { status: 500 });
  }
}