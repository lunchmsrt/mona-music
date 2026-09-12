'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentSong,
    isPlaying,
    volume,
    progress,
    duration,
    togglePlay,
    setVolume,
    setProgress,
    setDuration,
    next,
    prev,
  } = usePlayerStore();

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  if (!currentSong) return null;

  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (value: number | readonly number[]) => {
    const v = Array.isArray(value) ? value[0] : value;
    if (audioRef.current) {
      audioRef.current.currentTime = v;
      setProgress(v);
    }
  };

  const handleVolumeChange = (value: number | readonly number[]) => {
    const v = Array.isArray(value) ? value[0] : value;
    setVolume(v / 100);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-xl">
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={next}
      />

      <div className="mx-auto max-w-6xl space-y-2 p-4">
        <div className="flex items-center gap-2">
          <span className="w-10 text-right text-[10px] tabular-nums text-muted-foreground">
            {formatTime(progress)}
          </span>
          <Slider
            value={[progress]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="w-10 text-[10px] tabular-nums text-muted-foreground">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex w-64 items-center gap-3">
            {currentSong.coverUrl && (
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="h-12 w-12 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{currentSong.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {currentSong.artist}
              </p>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center gap-2">
            <Button variant="ghost" size="icon" onClick={prev}>
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={next}>
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex w-48 items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}