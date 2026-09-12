'use client';

import { useEffect, useState } from 'react';
import type { Song } from '@/types/song';
import { SongList } from '@/components/SongList';
import { AudioPlayer } from '@/components/AudioPlayer';
import { BackgroundSlideshow } from '@/components/BackgroundSlideshow';
import { Music2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string>('');

  const loadSongs = async () => {
    try {
      const res = await fetch('/api/songs');
      const data = await res.json();
      setSongs(data.songs || []);
      setLastSync(new Date().toLocaleTimeString('fa-IR'));
    } catch (err) {
      console.error('خطا در خواندن آهنگ‌ها:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSongs();
    const interval = setInterval(loadSongs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* پس‌زمینه اسلایدشو */}
      <BackgroundSlideshow />

      <main className="relative min-h-screen p-6 pb-40">
        <div className="mx-auto max-w-6xl">
          {/* هدر */}
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
                  {lastSync ? `آخرین همگام‌سازی: ${lastSync}` : 'در حال بارگذاری...'}
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={loadSongs}>
              <RefreshCw className="mr-2 h-4 w-4" />
              به‌روزرسانی
            </Button>
          </header>

          {/* بنر خوش‌آمد */}
          <div className="mb-8 overflow-hidden rounded-2xl bg-black/30 p-8 backdrop-blur-xl">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary to-purple-500 opacity-60 blur-2xl" />
                <img
                  src="/mona/qermezdasht.jpg"
                  alt="Mona"
                  className="relative h-32 w-32 rounded-full border-4 border-white/30 object-cover shadow-2xl"
                />
              </div>
              <div>
                <h2 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold text-transparent">
                  به Mona Music خوش آمدید
                </h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  دنیای موسیقی شخصی شما ✨
                </p>
              </div>
            </div>
          </div>

          {/* لیست آهنگ‌ها */}
          {loading ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              در حال بارگذاری آهنگ‌ها...
            </div>
          ) : songs.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
              <p>هنوز آهنگی همگام‌سازی نشده است.</p>
              <p className="text-sm">منتظر بمانید تا Cron هر ۵ دقیقه یکبار اجرا شود.</p>
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