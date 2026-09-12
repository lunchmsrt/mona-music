// src/lib/archive.ts

const ARCHIVE_UPLOADER = process.env.ARCHIVE_UPLOADER || 'hamidreza_keshavarz640';
const ARCHIVE_BASE = 'https://archive.org';

export interface ArchiveSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  audioUrl: string;
  coverUrl?: string;
  size?: number;
  format?: string;
}

/**
 * دریافت لیست آیتم‌های آپلودشده توسط یک کاربر
 */
async function fetchUserItems(): Promise<string[]> {
  const url = `${ARCHIVE_BASE}/advancedsearch.php?q=uploader:${ARCHIVE_UPLOADER}&fl[]=identifier&rows=200&output=json`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Archive search failed: ${res.status}`);

  const data = await res.json();
  const docs = data?.response?.docs || [];
  return docs.map((d: any) => d.identifier).filter(Boolean);
}

/**
 * دریافت لیست فایل‌های صوتی یک آیتم
 */
async function fetchItemAudioFiles(identifier: string): Promise<ArchiveSong[]> {
  const url = `${ARCHIVE_BASE}/metadata/${identifier}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Archive metadata failed for ${identifier}`);

  const data = await res.json();
  const files = data?.files || [];
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];

  return files
    .filter((file: any) => {
      const name = (file.name || '').toLowerCase();
      return audioExtensions.some((ext) => name.endsWith(ext));
    })
    .map((file: any) => ({
      id: `${identifier}/${file.name}`,
      title: (file.name || 'Untitled').replace(/\.[^/.]+$/, ''),
      artist: 'Hamidreza Keshavarz',
      album: identifier,
      audioUrl: `${ARCHIVE_BASE}/download/${identifier}/${encodeURIComponent(file.name)}`,
      coverUrl: undefined, // می‌توانید بعداً از thumbnail آیتم استفاده کنید
      size: Number(file.size) || 0,
      format: file.format || 'MP3',
    }));
}

/**
 * دریافت همه آهنگ‌های آپلودشده توسط کاربر
 */
export async function fetchAllUserSongs(): Promise<ArchiveSong[]> {
  try {
    const identifiers = await fetchUserItems();
    const allSongs: ArchiveSong[] = [];

    for (const id of identifiers) {
      try {
        const songs = await fetchItemAudioFiles(id);
        allSongs.push(...songs);
      } catch (err) {
        console.warn(`[Archive] خطا در آیتم ${id}:`, err);
      }
    }

    return allSongs;
  } catch (error) {
    console.error('[Archive] خطا در دریافت آهنگ‌ها:', error);
    return [];
  }
}