// src/app/api/download/route.ts
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileUrl = searchParams.get('url');
  const filename = searchParams.get('filename') || 'song.mp3';

  if (!fileUrl) {
    return new Response('پارامتر url الزامی است', { status: 400 });
  }

  try {
    // ۱. دریافت فایل از ابرهمراهی
    const response = await fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.ABREHAMRAHI_TOKEN || ''}`,
      },
    });

    if (!response.ok) {
      return new Response('خطا در دریافت فایل از منبع', { status: response.status });
    }

    // ۲. Stream کردن پاسخ به کاربر با هدر دانلود
    return new Response(response.body, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[Download] خطا:', error);
    return new Response('خطا در دانلود فایل', { status: 500 });
  }
}