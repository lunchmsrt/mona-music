'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentSong, isPlaying, volume, progress, duration,
    togglePlay, setVolume, setProgress, setDuration, next, prev,
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
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={next}
      />

      {/* Background blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-background/80 to-primary/20 backdrop-blur-2xl" />

      <div className="relative mx-auto max-w-6xl p-4">
        {/* Progress bar */}
        <div className="mb-3 flex items-center gap-3">
          <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
            {formatTime(progress)}
          </span>
          <Slider
            value={[progress]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="flex-1 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary"
          />
          <span className="w-10 text-xs tabular-nums text-muted-foreground">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-6">
          {/* Song info with glowing cover */}
          <div className="flex w-72 items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary to-purple-500 opacity-75 blur-md" />
              <img
                src={currentSong.coverUrl || 'https://picsum.photos/seed/mona/400'}
                alt={currentSong.title}
                className="relative h-14 w-14 rounded-xl object-cover ring-2 ring-white/20"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{currentSong.title}</p>
              <p className="truncate text-xs text-muted-foreground">{currentSong.artist}</p>
            </div>
          </div>

          {/* Playback controls with fancy buttons */}
          <div className="flex flex-1 items-center justify-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={prev}>
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/30 transition-transform hover:scale-110"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={next}>
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Repeat className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume and like */}
          <div className="flex w-56 items-center justify-end gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500">
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
            >
              {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={([v]) => setVolume(v / 100)}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}