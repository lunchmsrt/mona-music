'use client';

import type { Song } from '@/types/song';
import { usePlayerStore } from '@/store/playerStore';
import { Play, Pause, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SongListProps {
  songs: Song[];
}

export function SongList({ songs }: SongListProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();

  const handleClick = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, songs);
    }
  };

  const handleDownload = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation(); // جلوگیری از پخش آهنگ
    const params = new URLSearchParams({
      url: song.audioUrl,
      filename: `${song.title}.mp3`,
    });
    window.location.href = `/api/download?${params.toString()}`;
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {songs.map((song) => {
        const isCurrent = currentSong?.id === song.id;
        const showPause = isCurrent && isPlaying;

        return (
          <Card
            key={song.id}
            className={cn(
              'group relative cursor-pointer overflow-hidden border-0 bg-card/50 p-3 backdrop-blur transition-all hover:bg-card hover:shadow-xl hover:shadow-primary/10',
              isCurrent && 'ring-2 ring-primary shadow-lg shadow-primary/20'
            )}
            onClick={() => handleClick(song)}
          >
            <div className="relative aspect-square overflow-hidden rounded-xl">
              <img
                src={song.coverUrl || 'https://picsum.photos/seed/mona/400'}
                alt={song.title}
                className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
              />

              {/* دکمه دانلود */}
              <Button
                variant="secondary"
                size="icon"
                onClick={(e) => handleDownload(e, song)}
                className="absolute right-2 top-2 h-8 w-8 rounded-full opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:scale-110"
                title="دانلود"
              >
                <Download className="h-4 w-4" />
              </Button>

              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                <div className="rounded-full bg-primary/90 p-3 shadow-xl backdrop-blur-sm transition-transform hover:scale-110">
                  {showPause ? (
                    <Pause className="h-6 w-6 text-primary-foreground" />
                  ) : (
                    <Play className="h-6 w-6 text-primary-foreground" />
                  )}
                </div>
              </div>

              {/* Now playing indicator */}
              {isCurrent && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-primary/80 px-2 py-1 backdrop-blur-sm">
                  <div className="flex gap-0.5">
                    <span className="h-3 w-0.5 animate-pulse bg-white" />
                    <span className="h-3 w-0.5 animate-pulse bg-white" style={{ animationDelay: '150ms' }} />
                    <span className="h-3 w-0.5 animate-pulse bg-white" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] font-medium text-white">Playing</span>
                </div>
              )}
            </div>

            <div className="mt-3">
              <p className="truncate text-sm font-semibold">{song.title}</p>
              <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}