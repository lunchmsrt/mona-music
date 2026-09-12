'use client';

import { useState, useRef } from 'react';
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
} from 'lucide-react';

type UploadResult = {
  filename: string;
  success: boolean;
  message: string;
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

  // فرم تکی
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleTitle, setSingleTitle] = useState('');

  // فرم گروهی
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);

  // فرم فولدری
  const [folderFiles, setFolderFiles] = useState<File[]>([]);

  const bulkInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // ---------- آپلود یک فایل ----------
  const uploadOne = async (file: File, title: string): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name.replace(/\.[^/.]+$/, ''));
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
        return { filename: file.name, success: true, message: data.message };
      }
      return {
        filename: file.name,
        success: false,
        message: data.error || 'خطای ناشناخته',
      };
    } catch (err) {
      return { filename: file.name, success: false, message: String(err) };
    }
  };

  // ---------- آپلود گروهی ----------
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

      const percent = Math.round(((i + 1) / files.length) * 100);
      setProgress(percent);
      setDone(i + 1);
      setResults([...newResults]);
    }

    setLoading(false);
  };

  // ---------- آپلود تکی ----------
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleFile) return;
    await uploadMany([singleFile]);
    setSingleFile(null);
    setSingleTitle('');
  };

  // ---------- آپلود گروهی ----------
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkFiles.length === 0) return;
    await uploadMany(bulkFiles);
    setBulkFiles([]);
    if (bulkInputRef.current) bulkInputRef.current.value = '';
  };

  // ---------- آپلود فولدری ----------
  const handleFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (folderFiles.length === 0) return;
    await uploadMany(folderFiles);
    setFolderFiles([]);
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  // ---------- استخراج نام فولدر از مسیر ----------
  const getFolderName = (file: File) => {
    const path = (file as any).webkitRelativePath || '';
    const parts = path.split('/');
    return parts.length > 1 ? parts[0] : '';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="mx-auto max-w-3xl">
        {/* هدر */}
        <header className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/30">
            <Music2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold text-transparent">
              داشبورد مدیریت Mona Music
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              آپلود تکی، گروهی یا فولدری به GitHub
            </p>
          </div>
        </header>

        {/* فیلدهای مشترک */}
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
              <label className="mb-1 block text-sm font-medium">خواننده (اختیاری)</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2"
                placeholder="Mona"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">آلبوم (اختیاری)</label>
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

        {/* تب‌های آپلود */}
        <Card className="p-6">
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
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
            </TabsList>

            {/* ---------- تب تکی ---------- */}
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

            {/* ---------- تب گروهی ---------- */}
            <TabsContent value="bulk" className="mt-6">
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    انتخاب چند فایل صوتی (Ctrl+کلیک)
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

            {/* ---------- تب فولدری ---------- */}
            <TabsContent value="folder" className="mt-6">
              <form onSubmit={handleFolderSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    انتخاب یک فولدر کامل
                  </label>
                  <input
                    ref={folderInputRef}
                    type="file"
                    accept="audio/*"
                    multiple
                    // @ts-expect-error webkitdirectory is not in React types
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
                        تعداد فایل‌های صوتی: {folderFiles.length}
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
          </Tabs>

          {/* نوار پیشرفت */}
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

          {/* نتایج */}
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
                    <span className="mr-auto truncate text-[10px] opacity-70">
                      {r.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          هر فایل به صورت جداگانه آپلود می‌شود تا محدودیت ۴.۵ مگابایتی Vercel رعایت شود.
        </p>
      </div>
    </main>
  );
}