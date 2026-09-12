// src/app/api/backgrounds/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { listFolder, putFile, deleteFile } from '@/lib/github';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BG_PATH = 'public/mona';

export async function GET() {
  try {
    const files = await listFolder(BG_PATH);
    const images = files.filter((f) =>
      /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f.name)
    );
    return NextResponse.json({ success: true, backgrounds: images });
  } catch (error) {
    console.error('[Backgrounds GET] خطا:', error);
    return NextResponse.json({ success: true, backgrounds: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const password = formData.get('password') as string;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'رمز عبور اشتباه است' }, { status: 401 });
    }

    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'فایلی ارسال نشده' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'فقط فایل تصویری مجاز است' }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
    const filename = `${Date.now()}-${safeName}`;
    const filePath = `${BG_PATH}/${filename}`;

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    await putFile(filePath, base64, `feat: upload background ${filename}`);

    const rawUrl = `https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/${process.env.GITHUB_BRANCH}/${filePath}`;

    return NextResponse.json({
      success: true,
      name: filename,
      url: rawUrl,
      message: `عکس پس‌زمینه با موفقیت آپلود شد`,
    });
  } catch (error) {
    console.error('[Backgrounds POST] خطا:', error);
    return NextResponse.json(
      { error: 'خطا در آپلود', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, filename } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'رمز عبور اشتباه است' }, { status: 401 });
    }

    if (!filename) {
      return NextResponse.json({ error: 'نام فایل الزامی است' }, { status: 400 });
    }

    await deleteFile(`${BG_PATH}/${filename}`, `chore: delete background ${filename}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Backgrounds DELETE] خطا:', error);
    return NextResponse.json({ error: 'خطا در حذف' }, { status: 500 });
  }
}
