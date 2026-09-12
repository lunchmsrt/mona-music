export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  audioUrl: string;
  coverUrl?: string;
  duration?: number;
}