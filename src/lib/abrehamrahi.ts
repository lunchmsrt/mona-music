// src/lib/abrehamrahi.ts

const ABREHAMRAHI_BASE_URL = process.env.ABREHAMRAHI_BASE_URL || 'https://abrehamrahi.ir';
const ABREHAMRAHI_TOKEN = process.env.ABREHAMRAHI_TOKEN || '';

export interface AbrehamrahiFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  directUrl: string;
  thumbnailUrl?: string;
  modifiedAt: string;
}

/**
 * دریافت لیست فایل‌های یک پوشه از ابرهمراهی
 * ⚠️ این تابع به API عمومی ابرهمراهی وابسته است.
 *    اگر API رسمی ندارد، از Web Scraping استفاده می‌کنیم.
 */
export async function fetchFolderFiles(folderPath: string = '/'): Promise<AbrehamrahiFile[]> {
  try {
    const response = await fetch(
      `${ABREHAMRAHI_BASE_URL}/api/files?path=${encodeURIComponent(folderPath)}`,
      {
        headers: {
          'Authorization': `Bearer ${ABREHAMRAHI_TOKEN}`,
          'Accept': 'application/json',
        },
        // کش نکن تا همیشه لیست به‌روز باشد
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Abrehamrahi API error: ${response.status}`);
    }

    const data = await response.json();

    // نگاشت پاسخ API به ساختار داخلی
    return (data.files || []).map((file: any) => ({
      id: file.id || file.hash,
      name: file.name,
      path: file.path,
      size: file.size,
      mimeType: file.mimeType || 'audio/mpeg',
      directUrl: file.directUrl || `${ABREHAMRAHI_BASE_URL}/download/${file.id}`,
      thumbnailUrl: file.thumbnailUrl,
      modifiedAt: file.modifiedAt,
    }));
  } catch (error) {
    console.error('[Abrehamrahi] خطا در دریافت لیست فایل‌ها:', error);
    return [];
  }
}

/**
 * جستجوی فایل‌های صوتی در یک پوشه (فیلتر بر اساس پسوند)
 */
export async function fetchAudioFiles(folderPath: string = '/'): Promise<AbrehamrahiFile[]> {
  const files = await fetchFolderFiles(folderPath);
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];

  return files.filter((file) =>
    audioExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  );
}