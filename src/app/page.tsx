import { songs } from '@/data/songs';
import { SongList } from '@/components/SongList';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Music2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 pb-40">
      <div className="mx-auto max-w-6xl">
        {/* Header with logo */}
        <header className="mb-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/30">
            <Music2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Mona Music
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your music, your mood. ✨
            </p>
          </div>
        </header>

        {/* Featured banner */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/20 p-6 backdrop-blur">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-primary to-purple-500 opacity-60 blur-xl" />
              <img
                src="https://picsum.photos/seed/mona-hero/200"
                alt="Mona"
                className="relative h-24 w-24 rounded-full border-4 border-white/20 object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome to Mona Music</h2>
              <p className="mt-1 text-muted-foreground">
                Listen to your favorite tracks with the best quality.
              </p>
            </div>
          </div>
        </div>

        <SongList songs={songs} />
      </div>
      <AudioPlayer />
    </main>
  );
}