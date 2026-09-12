'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  Loader2,
  Music2,
  Image as ImageIcon,
  Disc3,
  Trash2,
  FileAudio,
  Files,
  CheckCircle,
  XCircle,
} from 'lucide-react';

type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  audioUrl: string;
  coverUrl?: string;
};

type Album = {
  id: string;
  name: string;
  artist: string;
  coverUrl: string;
  createdAt: string;
};

type Background = {
  name: string;
  path: string;
  url: string;
};

type UploadResult = {
  filename: string;
  success: boolean;
  message: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState('');

  // آهنگ‌ها
  const [songs, setSongs] = useState<Song[]>([]);
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single');
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleTitle, setSingleTitle] = useState('');
  const [singleArtist, setSingleArtist] = useState('');
  const [singleAlbum, setSingleAlbum] = useState('');
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkArtist, setBulkArtist] = useState('');
  const [bulkAlbum, setBulkAlbum] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState<UploadResult[]>([]);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  // آلبوم‌ها
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumName, setAlbumName] = useState('');
  const [albumArtist, setAlbumArtist] = useState('');
  const [albumCover, setAlbumCover] = useState<File | null>(null);
  const [albumCoverPreview, setAlbumCoverPreview] = useState('');
  const [albumsLoading, setAlbumsLoading] = useState(false);

  // پس‌زمینه‌ها
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [bgFiles, setBgFiles] = useState<File[]>([]);
  const [bgLoading, setBgLoading] = useState(false);
  const bgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSongs();
    loadAlbums();
    loadBackgrounds();
  }, []);

  const loadSongs = async () => {
    try {
      const res = await fetch('/api/songs-github');
      const data = await res.json();
      setSongs(data.songs || []);
    } catch (err) {
      console.error('خطا در خواندن آهنگ‌ها:', err);
    }
  };

  const loadAlbums = async () => {
    try {
      const res = await fetch('/api/albums');
      const data = await res.json();
      setAlbums(data.albums || []);
    } catch (err) {
      console.error('خطا در خواندن آلبوم‌ها:', err);
    }
  };

  const loadBackgrounds = async () => {
    try {
      const res = await fetch('/api/backgrounds');
      const data = await res.json();
      setBackgrounds(data.backgrounds || []);
    } catch (err) {
      console.error('خطا در خواندن پس‌زمینه‌ها:', err);
    }
  };

  // ---------- آپلود یک آهنگ ----------
  const uploadOneSong = async (
    file: File,
    title: string,
    artist: string,
    album: string
  ): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name.replace(/\.[^/.]+$/, ''));
    formData.append('artist', artist || 'Mona');
    formData.append('album', album || 'Mona Music');
    formData.append('password', password);

    const useBlob = file.size > 4 * 1024 * 1024;
    const endpoint = useBlob ? '/api/upload-blob' : '/api/upload-github';

    try {
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return {
          filename: file.name,
          success: false,
          message: `خطای سرور (${res.status}) — حجم: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
        };
      }
      const data = await res.json();
      if (res.ok) {
        return {
          filename: file.name,
          success: true,
          message: `${data.message} ${useBlob ? '(Blob)' : '(GitHub)'}`,
        };
      }
      return { filename: file.name, success: false, message: data.error || 'خطا' };
    } catch (err) {
      return { filename: file.name, success: false, message: String(err) };
    }
  };

  const uploadManySongs = async (files: File[], artist: string, album: string) => {
    setUploading(true);
    setResults([]);
    setTotal(files.length);
    setDone(0);
    setProgress(0);
    const newResults: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = file.name.replace(/\.[^/.]+$/, '');
      const result = await uploadOneSong(file, title, artist, album);
      newResults.push(result);
      setProgress(Math.round(((i + 1) / files.length) * 100));
      setDone(i + 1);
      setResults([...newResults]);
    }

    setUploading(false);
    await loadSongs();
  };

  const handleSingleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleFile || !password) return;
    await uploadManySongs([singleFile], singleArtist, singleAlbum);
    setSingleFile(null);
    setSingleTitle('');
    setSingleArtist('');
    setSingleAlbum('');
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkFiles.length === 0 || !password) return;
    await uploadManySongs(bulkFiles, bulkArtist, bulkAlbum);
    setBulkFiles([]);
    setBulkArtist('');
    setBulkAlbum('');
    if (bulkInputRef.current) bulkInputRef.current.value = '';
  };

  const handleDeleteSong = async (songId: string, title: string) => {
    if (!confirm(`آیا از حذف آهنگ "${title}" مطمئنید؟`)) return;
    try {
      const res = await fetch('/api/delete-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await loadSongs();
      } else {
        alert('خطا: ' + (data.error || 'خطا در حذف'));
      }
    } catch (err) {
      alert('خطا: ' + String(err));
    }
  };

  // ---------- آلبوم ----------
  const handleAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumCover || !albumName || !password) return;

    setAlbumsLoading(true);
    const formData = new FormData();
    formData.append('file', albumCover);
    formData.append('albumName', albumName);
    formData.append('password', password);

    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok) {
        const saveRes = await fetch('/api/albums', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password,
            name: albumName,
            artist: albumArtist || 'Mona',
            coverUrl: data.url,
          }),
        });
        if (saveRes.ok) {
          setAlbumName('');
          setAlbumArtist('');
          setAlbumCover(null);
          setAlbumCoverPreview('');
          await loadAlbums();
          alert('✅ آلبوم ذخیره شد');
        }
      } else {
        alert('❌ ' + (data.error || 'خطا'));
      }
    } catch (err) {
      alert('❌ خطا: ' + String(err));
    } finally {
      setAlbumsLoading(false);
    }
  };

  const handleDeleteAlbum = async (id: string, name: string) => {
    if (!confirm(`حذف آلبوم "${name}"؟`)) return;
    try {
      const res = await fetch('/api/albums', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, id }),
      });
      if (res.ok) await loadAlbums();
      else alert('خطا در حذف');
    } catch (err) {
      alert('خطا: ' + String(err));
    }
  };

  // ---------- پس‌زمینه ----------
  const handleBackgroundUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bgFiles.length === 0 || !password) return;

    setBgLoading(true);
    const newResults: UploadResult[] = [];

    for (const file of bgFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password);
      try {
        const res = await fetch('/api/backgrounds', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok) {
          newResults.push({ filename: file.name, success: true, message: 'موفق' });
        } else {
          newResults.push({ filename: file.name, success: false, message: data.error || 'خطا' });
        }
      } catch (err) {
        newResults.push({ filename: file.name, success: false, message: String(err) });
      }
    }

    setResults(newResults);
    setBgFiles([]);
    if (bgInputRef.current) bgInputRef.current.value = '';
    await loadBackgrounds();
    setBgLoading(false);
    alert(`✅ ${newResults.filter(r => r.success).length} عکس آپلود شد`);
  };

  const handleDeleteBackground = async (filename: string) => {
    if (!confirm(`حذف "${filename}"؟`)) return;
    try {
      const res = await fetch('/api/backgrounds', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, filename }),
      });
      if (res.ok) await loadBackgrounds();
      else alert('خطا در حذف');
    } catch (err) {
      alert('خطا: ' + String(err));
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/30">
            <Music2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold text-transparent">
              داشبورد مدیریت Mona Music
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">مدیریت آهنگ‌ها، آلبوم‌ها و پس‌زمینه‌ها</p>
          </div>
        </header>

        <Card className="mb-6 p-6">
          <label className="mb-1 block text-sm font-medium">رمز عبور Admin</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2"
            placeholder="رمز عبور"
          />
        </Card>

        <Card className="p-6">
          <Tabs defaultValue="songs" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="songs" className="gap-2">
                <FileAudio className="h-4 w-4" />
                آهنگ‌ها
              </TabsTrigger>
              <TabsTrigger value="albums" className="gap-2">
                <Disc3 className="h-4 w-4" />
                آلبوم‌ها
              </TabsTrigger>
              <TabsTrigger value="backgrounds" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                پس‌زمینه
              </TabsTrigger>
            </TabsList>

            {/* ============ تب آهنگ‌ها ============ */}
            <TabsContent value="songs" className="mt-6 space-y-6">
              {/* دکمه انتخاب حالت */}
              <div className="flex gap-2 rounded-lg border p-1">
                <button
                  type="button"
                  onClick={() => setUploadMode('single')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm transition ${
                    uploadMode === 'single'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <FileAudio className="h-4 w-4" />
                  آپلود تکی
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('bulk')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm transition ${
                    uploadMode === 'bulk'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Files className="h-4 w-4" />
                  آپلود گروهی
                </button>
              </div>

              {/* فرم تکی */}
              {uploadMode === 'single' && (
                <form onSubmit={handleSingleUpload} className="space-y-4 rounded-lg border p-4">
                  <h3 className="text-lg font-bold">➕ افزودن آهنگ</h3>
                  <div>
                    <label className="mb-1 block text-sm font-medium">فایل صوتی</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setSingleFile(e.target.files?.[0] || null)}
                      required
                      className="w-full rounded-lg border bg-background px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-primary-foreground"
                    />
                    {singleFile && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {singleFile.name} ({(singleFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium">عنوان</label>
                      <input
                        type="text"
                        value={singleTitle}
                        onChange={(e) => setSingleTitle(e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-2"
                        placeholder="Belakhare"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">خواننده</label>
                      <input
                        type="text"
                        value={singleArtist}
                        onChange={(e) => setSingleArtist(e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-2"
                        placeholder="Majid Razavi"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">آلبوم</label>
                      <input
                        type="text"
                        value={singleAlbum}
                        onChange={(e) => setSingleAlbum(e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-2"
                        placeholder="Belakhare"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={uploading || !singleFile || !password}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        در حال آپلود...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        آپلود آهنگ
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* فرم گروهی */}
              {uploadMode === 'bulk' && (
                <form onSubmit={handleBulkUpload} className="space-y-4 rounded-lg border p-4">
                  <h3 className="text-lg font-bold">➕ افزودن چند آهنگ</h3>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      انتخاب فایل‌ها (Ctrl+کلیک)
                    </label>
                    <input
                      ref={bulkInputRef}
                      type="file"
                      accept="audio/*"
                      multiple
                      onChange={(e) => setBulkFiles(Array.from(e.target.files || []))}
                      required
                      className="w-full rounded-lg border bg-background px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-primary-foreground"
                    />
                    {bulkFiles.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {bulkFiles.length} فایل انتخاب شد
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium">خواننده (همه)</label>
                      <input
                        type="text"
                        value={bulkArtist}
                        onChange={(e) => setBulkArtist(e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-2"
                        placeholder="Mona"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">آلبوم (همه)</label>
                      <input
                        type="text"
                        value={bulkAlbum}
                        onChange={(e) => setBulkAlbum(e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-2"
                        placeholder="Mona Music"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={uploading || bulkFiles.length === 0 || !password}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        در حال آپلود {done} از {total}...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        آپلود گروهی ({bulkFiles.length} فایل)
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* نوار پیشرفت */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>پیشرفت</span>
                    <span>{done} از {total}</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {/* نتایج آپلود */}
              {results.length > 0 && (
                <div className="space-y-1 rounded-lg border p-3">
                  <h4 className="text-sm font-bold">نتیجه آپلود:</h4>
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {results.map((r, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 rounded p-1.5 text-xs ${
                          r.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {r.success ? (
                          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="truncate">{r.filename}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* لیست آهنگ‌های موجود */}
              <div>
                <h3 className="mb-3 text-lg font-bold">
                  🎵 آهنگ‌های موجود ({songs.length})
                </h3>
                {songs.length === 0 ? (
                  <p className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                    هنوز آهنگی اضافه نشده
                  </p>
                ) : (
                  <div className="space-y-2">
                    {songs.map((song) => (
                      <div
                        key={song.id}
                        className="group flex items-center gap-3 rounded-lg border bg-card p-3"
                      >
                        {song.coverUrl && (
                          <img
                            src={song.coverUrl}
                            alt={song.title}
                            className="h-12 w-12 rounded object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{song.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {song.artist} — {song.album}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteSong(song.id, song.title)}
                          className="rounded-full bg-red-500/80 p-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-red-500"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ============ تب آلبوم‌ها ============ */}
            <TabsContent value="albums" className="mt-6 space-y-6">
              <form onSubmit={handleAlbumSubmit} className="space-y-4 rounded-lg border p-4">
                <h3 className="text-lg font-bold">➕ افزودن آلبوم</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">نام آلبوم</label>
                    <input
                      type="text"
                      value={albumName}
                      onChange={(e) => setAlbumName(e.target.value)}
                      required
                      className="w-full rounded-lg border bg-background px-3 py-2"
                      placeholder="Belakhare"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">خواننده</label>
                    <input
                      type="text"
                      value={albumArtist}
                      onChange={(e) => setAlbumArtist(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2"
                      placeholder="Majid Razavi"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">عکس کاور</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setAlbumCover(f);
                      if (f) {
                        const reader = new FileReader();
                        reader.onloadend = () => setAlbumCoverPreview(reader.result as string);
                        reader.readAsDataURL(f);
                      }
                    }}
                    required
                    className="w-full rounded-lg border bg-background px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-primary-foreground"
                  />
                </div>
                {albumCoverPreview && (
                  <div className="flex justify-center">
                    <img
                      src={albumCoverPreview}
                      alt="پیش‌نمایش"
                      className="h-40 w-40 rounded-xl object-cover shadow-lg"
                    />
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={albumsLoading || !albumCover || !albumName || !password}
                  className="w-full"
                >
                  {albumsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      آپلود آلبوم
                    </>
                  )}
                </Button>
              </form>

              <div>
                <h3 className="mb-3 text-lg font-bold">📀 آلبوم‌های موجود ({albums.length})</h3>
                {albums.length === 0 ? (
                  <p className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                    هنوز آلبومی اضافه نشده
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {albums.map((a) => (
                      <div
                        key={a.id}
                        className="group relative overflow-hidden rounded-xl border bg-card"
                      >
                        <img src={a.coverUrl} alt={a.name} className="aspect-square w-full object-cover" />
                        <div className="p-2">
                          <p className="truncate text-sm font-semibold">{a.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{a.artist}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteAlbum(a.id, a.name)}
                          className="absolute right-2 top-2 rounded-full bg-red-500/80 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ============ تب پس‌زمینه ============ */}
            <TabsContent value="backgrounds" className="mt-6 space-y-6">
              <form onSubmit={handleBackgroundUpload} className="space-y-4 rounded-lg border p-4">
                <h3 className="text-lg font-bold">🖼️ افزودن پس‌زمینه</h3>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    انتخاب عکس‌ها (چندتایی)
                  </label>
                  <input
                    ref={bgInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setBgFiles(Array.from(e.target.files || []))}
                    required
                    className="w-full rounded-lg border bg-background px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-primary-foreground"
                  />
                  {bgFiles.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {bgFiles.length} عکس انتخاب شد
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={bgLoading || bgFiles.length === 0 || !password}
                  className="w-full"
                >
                  {bgLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      در حال آپلود...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      آپلود پس‌زمینه ({bgFiles.length})
                    </>
                  )}
                </Button>
              </form>

              <div>
                <h3 className="mb-3 text-lg font-bold">
                  🎨 پس‌زمینه‌های موجود ({backgrounds.length})
                </h3>
                {backgrounds.length === 0 ? (
                  <p className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                    هنوز عکسی اضافه نشده
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {backgrounds.map((bg) => (
                      <div
                        key={bg.name}
                        className="group relative overflow-hidden rounded-xl border bg-card"
                      >
                        <img src={bg.url} alt={bg.name} className="aspect-video w-full object-cover" />
                        <div className="p-2">
                          <p className="truncate text-xs text-muted-foreground">{bg.name}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteBackground(bg.name)}
                          className="absolute right-2 top-2 rounded-full bg-red-500/80 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </main>
  );
}