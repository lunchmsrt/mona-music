// src/lib/github.ts

const GITHUB_API = 'https://api.github.com';

interface GitHubFileResponse {
  content: string;
  sha: string;
}

/**
 * خواندن یک فایل از GitHub
 */
export async function getFile(path: string): Promise<GitHubFileResponse | null> {
  const url = `${GITHUB_API}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}?ref=${process.env.GITHUB_BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`GitHub getFile error: ${res.status}`);
  }

  return res.json();
}

/**
 * آپلود یا بهروزرسانی یک فایل در GitHub
 */
export async function putFile(
  path: string,
  contentBase64: string,
  message: string
): Promise<{ content: any; commit: any }> {
  // اول بررسی میکنیم فایل قبلاً وجود دارد یا نه (برای گرفتن SHA)
  const existing = await getFile(path);

  const url = `${GITHUB_API}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`;
  const body: any = {
    message,
    content: contentBase64,
    branch: process.env.GITHUB_BRANCH,
  };

  if (existing?.sha) {
    body.sha = existing.sha; // برای بهروزرسانی الزامی است
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitHub putFile error: ${res.status} - ${error}`);
  }

  return res.json();
}

/**
 * حذف یک فایل از GitHub
 */
export async function deleteFile(path: string, message: string): Promise<void> {
  const existing = await getFile(path);
  if (!existing?.sha) throw new Error('File not found');

  const url = `${GITHUB_API}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      sha: existing.sha,
      branch: process.env.GITHUB_BRANCH,
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub deleteFile error: ${res.status}`);
  }
}

/**
 * خواندن لیست آهنگها از فایل songs.json
 */
export async function getSongs(): Promise<any[]> {
  const file = await getFile(process.env.GITHUB_DATA_PATH || 'src/data/songs.json');
  if (!file) return [];

  const content = Buffer.from(file.content, 'base64').toString('utf-8');
  try {
    return JSON.parse(content);
  } catch {
    return [];
  }
}

/**
 * ذخیره لیست آهنگها در فایل songs.json
 */
export async function saveSongs(songs: any[]): Promise<void> {
  const contentBase64 = Buffer.from(JSON.stringify(songs, null, 2)).toString('base64');
  await putFile(
    process.env.GITHUB_DATA_PATH || 'src/data/songs.json',
    contentBase64,
    `chore: update songs list (${songs.length} tracks)`
  );
}