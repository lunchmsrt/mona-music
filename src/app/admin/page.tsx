'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('artist', artist || 'Mona');
    formData.append('album', album || 'Mona Music');
    formData.append('password', password);

    try {
      const res = await fetch('/api/upload-github', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: data.message });
        setFile(null);
        setTitle('');
        setArtist('');
        setAlbum('');
      } else {
        setResult({ success: false, message: data.error });
      }
    } catch (err) {
      setResult({ success: false, message: 'خطای شبکه: ' + String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">🎛️ داشبورد مدیریت Mona Music</h1>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* رمز عبور */}
            <div>
              <label className="mb-1 block text-sm font-medium">رمز عبور Admin</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border bg-background px-3 py-2"
                placeholder="رمز عبور را وارد کنید"
              />
            </div>

            {/* انتخاب فایل */}
            <div>
              <label className="mb-1 block text-sm font-medium">فایل صوتی (MP3)</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                className="w-full rounded-lg border bg-background px-3 py-2"
              />
              {file && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* عنوان */}
            <div>
              <label className="mb-1 block text-sm font-medium">عنوان آهنگ</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border bg-background px-3 py-2"
                placeholder="مثلاً Belakhare"
              />
            </div>

            {/* خواننده */}
            <div>
              <label className="mb-1 block text-sm font-medium">خواننده</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2"
                placeholder="مثلاً Majid Razavi"
              />
            </div>

            {/* آلبوم */}
            <div>
              <label className="mb-1 block text-sm font-medium">آلبوم</label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2"
                placeholder="مثلاً Belakhare [Single]"
              />
            </div>

            {/* دکمه */}
            <Button type="submit" disabled={loading || !file} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  در حال آپلود...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  آپلود به GitHub
                </>
              )}
            </Button>
          </form>

          {/* نتیجه */}
          {result && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-lg p-3 ${
                result.success
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span>{result.message}</span>
            </div>
          )}
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          پس از آپلود، آهنگ به طور خودکار در صفحه اصلی نمایش داده میشود.
        </p>
      </div>
    </main>
  );
}