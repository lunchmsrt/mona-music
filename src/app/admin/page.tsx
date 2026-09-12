'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  FileAudio,
  FolderUp,
  Files,
  Music2,
  Image as ImageIcon,
  Disc3,
  Trash2,
} from 'lucide-react';

type UploadResult = {
  filename: string;
  success: boolean;
  message: string;
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

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(0);

  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleTitle, setSingleTitle] = useState('');
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [folderFiles, setFolderFiles] = useState<File[]>([]);

  // آلبوم‌ها
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumName, setAlbumName] = useState('');
  const [albumArtist, setAlbumArtist] = useState('');
  const [albumCover, setAlbumCover] = useState<File | null>(null);
  const [albumCoverPreview, setAlbumCoverPreview] = useState<string>('');
  const [albumsLoading, setAlbumsLoading] = useState(false);

  // پس‌زمینه‌ها
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState('');
  const [bgLoading, setBgLoading] = useState(false);

  const bulkInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAlbums();
    loadBackgrounds();
  }, []);

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

  // ---------- آپلود آهنگ ----------
  const uploadOne = async (file: File, title: string): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name.replace(/\.[^/.]+$/, ''));
    formData.append('artist', artist || 'Mona');
    formData.append('album', album || 'Mona Music');
    formData.append('password', password);

    try {
      const res = await fetch('/api/upload-github', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) return { filename: file.name, success: true, message: data.message };
      return { filename: file.name, success: false, message: data.error || 'خطا' };
    } catch (err) {
      return { filename: file.name, success: false, message: String(err) };
    }
  };

  const uploadMany = async (files: File[]) => {
    setLoading(true);
    setResults([]);
    setTotal(files.length);
    setDone(0);
    setProgress(0);
    const newResults: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = file.name.replace(/\.[^/.]+$/, '');
      const result = await uploadOne(file, title);
      newResults.push(result);
      setProgress(Math.round(((i + 1) / files.length) * 100));
      setDone(i + 1);
      setResults([...newResults]);
    }
    setLoading(false);
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleFile) return;
    await uploadMany([singleFile]);
    setSingleFile(null);
    setSingleTitle('');
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkFiles.length === 0) return;
    await uploadMany(bulkFiles);
    setBulkFiles([]);
    if (bulkInputRef.current) bulkInputRef.current.value = '';
  };

  const handleFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (folderFiles.length === 0) return;
    await uploadMany(folderFiles);
    setFolderFiles([]);
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  // ---------- آپلود آلبوم ----------
  const handleAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumCover || !albumName) return;

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
            artist: albumArtist || artist || 'Mona',
            coverUrl: data.url,
          }),
        });

        if (saveRes.ok) {
          setAlbumName('');
          setAlbumArtist('');
          setAlbumCover(null);
          setAlbumCoverPreview('');
          await loadAlbums();
          alert('✅ آلبوم با موفقیت ذخیره شد');
        }
      } else {
        alert('❌ ' + (data.error || 'خطا در آپلود'));
      }
    } catch (err) {
      alert('❌ خطا: ' + String(err));
    } finally {
      setAlbumsLoading(false);
    }
  };

  const handleDeleteAlbum = async (id: string, name: string) => {
    if (!confirm(`آیا از حذف آلبوم "${name}" مطمئنید؟`)) return;

    try {
      const res = await fetch('/api/albums', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, id }),
      });
      if (res.ok) {
        await loadAlbums();
      } else {
        alert('خطا در حذف آلبوم');
      }
    } catch (err) {
      alert('خطا: ' + String(err));
    }
  };

  // ---------- آپلود پس‌زمینه ----------
  const handleBackgroundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bgFile || !password) return;

    setBgLoading(true);
    const formData = new FormData();
    formData.append('file', bgFile);
    formData.append('password', password);

    try {
      const res = await fetch('/api/backgrounds', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok) {
        setBgFile(null);
        setBgPreview('');
        await loadBackgrounds();
        alert('✅ عکس پس‌زمینه آپلود شد');
      } else {
        alert('❌ ' + (data.error || 'خطا'));
      }
    } catch (err) {
      alert('❌ خطا: ' + String(err));
    } finally {
      setBgLoading(false);
    }
  };

  const handleDeleteBackground = async (filename: string) => {
    if (!confirm(`آیا از حذف "${filename}" مطمئنید؟`)) return;

    try {
      const res = await fetch('/api/backgrounds', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, filename }),
      });
      if (res.ok) {
        await loadBackgrounds();
      } else {
        alert('خطا در حذف');
      }
    } catch (err) {
      alert('خطا: ' + String(err));
    }
  };

  const getFolderName = (file: File) => {
    const path = (file as any).webkitRelativePath || '';
    const parts = path.split('/');
    return parts.length > 1 ? parts[0] : '';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/30">
            <Music2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold text-transparent">
              داشبورد مدیریت Mona Music
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              آپلود آهنگ، مدیریت آلبوم و پس‌زمینه
            </p>
          </div>
        </header>

        <Card className="mb-6 space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium">رمز عبور Admin</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2"
              placeholder="رمز عبور را وارد کنید"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">خواننده پیش‌فرض</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2"
                placeholder="Mona"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">آلبوم پیش‌فرض</label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2"
                placeholder="Mona Music"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="single" className="gap-2">
                <FileAudio className="h-4 w-4" />
                تکی
              </TabsTrigger>
              <TabsTrigger value="bulk" className="gap-2">
                <Files className="h-4 w-4" />
                گروهی
              </TabsTrigger>
              <TabsTrigger value="folder" className="gap-2">
                <FolderUp className="h-4 w-4" />
                فولدری
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

            {/* تب تکی */}
            <TabsContent value="single" className="mt-6">
              <form onSubmit={handleSingleSubmit} className="space-y-4">
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
                <div>
                  <label className="mb-1 block text-sm font-medium">عنوان آهنگ</label>
                  <input
                    type="text"
                    value={singleTitle}
                    onChange={(e) => setSingleTitle(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2"
                    placeholder="مثلاً Belakhare"
                  />
                </div>
                <Button type="submit" disabled={loading || !singleFile || !password} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      در حال آپلود...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      آپلود تکی
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* تب گروهی */}
            <TabsContent value="bulk" className="mt-6">
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    انتخاب چند فایل (Ctrl+کلیک)
                  </label>
                  <input
                    ref={bulkInputRef}
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={(e) => setBulkFiles(Array.from(e.target.files || []))}
                    className="w-full rounded-lg border bg-background px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-primary-foreground"
                  />
                  {bulkFiles.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {bulkFiles.length} فایل انتخاب شد
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading || bulkFiles.length === 0 || !password}
                  className="w-full"
                >
                  {loading ? (
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
            </TabsContent>

            {/* تب فولدری */}
            <TabsContent value="folder" className="mt-6">
              <form onSubmit={handleFolderSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">انتخاب فولدر کامل</label>
                  <input
                    ref={folderInputRef}
                    type="file"
                    accept="audio/*"
                    multiple
                    // @ts-expect-error webkitdirectory
                    webkitdirectory="true"
                    directory="true"
                    onChange={(e) => setFolderFiles(Array.from(e.target.files || []))}
                    className="w-full rounded-lg border bg-background px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-primary-foreground"
                  />
                  {folderFiles.length > 0 && (
                    <div className="mt-2 rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">
                        فولدر: <span className="font-bold">{getFolderName(folderFiles[0])}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        تعداد فایل صوتی: {folderFiles.length}
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading || folderFiles.length === 0 || !password}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      در حال آپلود {done} از {total}...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      آپلود فولدری ({folderFiles.length} فایل)
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* تب آلبوم‌ها */}
            <TabsContent value="albums" className="mt-6 space-y-6">
              <form onSubmit={handleAlbumSubmit} className="space-y-4 rounded-lg border p-4">
                <h3 className="text-lg font-bold">➕ افزودن آلبوم جدید</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">نام آلبوم</label>
                    <input
                      type="text"
                      value={albumName}
                      onChange={(e) => setAlbumName(e.target.value)}
                      required
                      className="w-full rounded-lg border bg-background px-3 py-2"
                      placeholder="مثلاً Belakhare"
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
                <h3 className="mb-3 text-lg font-bold">
                  📀 آلبوم‌های موجود ({albums.length})
                </h3>

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
                        <img
                          src={a.coverUrl}
                          alt={a.name}
                          className="aspect-square w-full object-cover"
                        />
                        <div className="p-2">
                          <p className="truncate text-sm font-semibold">{a.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{a.artist}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteAlbum(a.id, a.name)}
                          className="absolute right-2 top-2 rounded-full bg-red-500/80 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-red-500"
                          title="حذف"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* تب پس‌زمینه‌ها */}
            <TabsContent value="backgrounds" className="mt-6 space-y-6">
              <form onSubmit={handleBackgroundSubmit} className="space-y-4 rounded-lg border p-4">
                <h3 className="text-lg font-bold">🖼️ افزودن عکس پس‌زمینه جدید</h3>

                <div>
                  <label className="mb-1 block text-sm font-medium">انتخاب عکس</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setBgFile(f);
                      if (f) {
                        const reader = new FileReader();
                        reader.onloadend = () => setBgPreview(reader.result as string);
                        reader.readAsDataURL(f);
                      }
                    }}
                    required
                    className="w-full rounded-lg border bg-background px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-primary-foreground"
                  />
                </div>

                {bgPreview && (
                  <div className="flex justify-center">
                    <img
                      src={bgPreview}
                      alt="پیش‌نمایش"
                      className="h-48 w-96 rounded-xl object-cover shadow-lg"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={bgLoading || !bgFile || !password}
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
                      آپلود پس‌زمینه
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
                    هنوز عکس پس‌زمینه‌ای اضافه نشده
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {backgrounds.map((bg) => (
                      <div
                        key={bg.name}
                        className="group relative overflow-hidden rounded-xl border bg-card"
                      >
                        <img
                          src={bg.url}
                          alt={bg.name}
                          className="aspect-video w-full object-cover"
                        />
                        <div className="p-2">
                          <p className="truncate text-xs text-muted-foreground">{bg.name}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteBackground(bg.name)}
                          className="absolute right-2 top-2 rounded-full bg-red-500/80 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-red-500"
                          title="حذف"
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

          {loading && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>پیشرفت آپلود</span>
                <span>
                  {done} از {total}
                </span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-bold">نتیجه آپلود:</h3>
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 rounded-lg p-2 text-xs ${
                      r.success
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {r.success ? (
                      <CheckCircle className="h-4 w-4 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate">{r.filename}</span>
                    <span className="mr-auto truncate text-[10px] opacity-70">{r.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}