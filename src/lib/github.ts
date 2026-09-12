// src/lib/github.ts

const GITHUB_API = 'https://api.github.com';

interface GitHubFileResponse {
  content: string;
  sha: string;
}

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

export async function putFile(
  path: string,
  contentBase64: string,
  message: string
): Promise<{ content: any; commit: any }> {
  const existing = await getFile(path);

  const url = `${GITHUB_API}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`;
  const body: any = {
    message,
    content: contentBase64,
    branch: process.env.GITHUB_BRANCH,
  };

  if (existing?.sha) {
    body.sha = existing.sha;
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

export async function saveSongs(songs: any[]): Promise<void> {
  const contentBase64 = Buffer.from(JSON.stringify(songs, null, 2)).toString('base64');
  await putFile(
    process.env.GITHUB_DATA_PATH || 'src/data/songs.json',
    contentBase64,
    `chore: update songs list (${songs.length} tracks)`
  );
}

// -------------------- مدیریت آلبوم‌ها --------------------

export interface Album {
  id: string;
  name: string;
  artist: string;
  coverUrl: string;
  createdAt: string;
}

export async function getAlbums(): Promise<Album[]> {
  const path = process.env.GITHUB_ALBUMS_PATH || 'src/data/albums.json';
  const file = await getFile(path);
  if (!file) return [];
  const content = Buffer.from(file.content, 'base64').toString('utf-8');
  try {
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function saveAlbums(albums: Album[]): Promise<void> {
  const path = process.env.GITHUB_ALBUMS_PATH || 'src/data/albums.json';
  const contentBase64 = Buffer.from(JSON.stringify(albums, null, 2)).toString('base64');
  await putFile(path, contentBase64, `chore: update albums (${albums.length})`);
}

// -------------------- خواندن لیست فایل‌های یک پوشه --------------------

export async function listFolder(path: string): Promise<{ name: string; path: string; url: string }[]> {
  const url = `${GITHUB_API}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}?ref=${process.env.GITHUB_BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`GitHub listFolder error: ${res.status}`);
  }

  const files = await res.json();
  if (!Array.isArray(files)) return [];

  const rawBase = `https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/${process.env.GITHUB_BRANCH}`;

  return files
    .filter((f: any) => f.type === 'file')
    .map((f: any) => ({
      name: f.name,
      path: f.path,
      url: `${rawBase}/${f.path}`,
    }));
}