import { create } from 'zustand';
import type { Song } from '@/types/song';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Song[];
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  setProgress: (p: number) => void;
  setDuration: (d: number) => void;
  next: () => void;
  prev: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  volume: 0.8,
  progress: 0,
  duration: 0,
  queue: [],

  playSong: (song, queue) =>
    set({
      currentSong: song,
      isPlaying: true,
      progress: 0,
      queue: queue ?? get().queue,
    }),

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setVolume: (v) => set({ volume: v }),
  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),

  next: () => {
    const { queue, currentSong } = get();
    if (!currentSong || queue.length === 0) return;
    const idx = queue.findIndex((s) => s.id === currentSong.id);
    const nextSong = queue[(idx + 1) % queue.length];
    set({ currentSong: nextSong, isPlaying: true, progress: 0 });
  },

  prev: () => {
    const { queue, currentSong } = get();
    if (!currentSong || queue.length === 0) return;
    const idx = queue.findIndex((s) => s.id === currentSong.id);
    const prevSong = queue[(idx - 1 + queue.length) % queue.length];
    set({ currentSong: prevSong, isPlaying: true, progress: 0 });
  },
}));