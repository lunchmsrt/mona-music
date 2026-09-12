'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Song } from '@/types/song';
import { SongList } from '@/components/SongList';
import { AudioPlayer } from '@/components/AudioPlayer';
import { BackgroundSlideshow } from '@/components/BackgroundSlideshow';
import { Music2, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSongs = async () => {
    try {
      const res = await fetch('/api/songs-github');
      const data = await res.json();
      setSongs(data.songs || []);
    } catch (err) {
      console.error('خطا در خواندن آهنگ‌ها:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSongs();
    const interval = setInterval(loadSongs, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <BackgroundSlideshow />
      <main className="relative min-h-screen p-6 pb-40">
        <div className="mx-auto max-w-6xl">
          <header className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/30">
                <Music2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                  Mona Music
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {songs.length} آهنگ
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadSongs}>
                <RefreshCw className="mr-2 h-4 w-4" />
                به‌روزرسانی
              </Button>
              <Link href="/admin">
                <Button variant="default" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  مدیر
                </Button>
              </Link>
            </div>
          </header>

          {loading ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              در حال بارگذاری آهنگ‌ها...
            </div>
          ) : songs.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
              <p>هنوز آهنگی آپلود نشده است.</p>
              <Link href="/admin" className="text-primary underline">
                از داشبورد مدیریت آهنگ اضافه کنید
              </Link>
            </div>
          ) : (
            <SongList songs={songs} />
          )}
        </div>
        <AudioPlayer />
      </main>
    </>
  );
}