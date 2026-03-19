import { readFile, writeFile, mkdir, chmod } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CONFIG_DIR = join(homedir(), '.mcp-submit');
const AUTH_FILE = join(CONFIG_DIR, 'auth.json');

async function ensureConfigDir(): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
}

export async function getAuth(): Promise<{ githubToken?: string } | null> {
  try {
    const content = await readFile(AUTH_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function saveAuth(auth: { githubToken: string }): Promise<void> {
  await ensureConfigDir();
  await writeFile(AUTH_FILE, JSON.stringify(auth, null, 2));
  await chmod(AUTH_FILE, 0o600);
}

export async function getCache(packageName: string): Promise<Record<string, any> | null> {
  try {
    const cachePath = join(CONFIG_DIR, 'cache', `${packageName.replace(/\//g, '__')}.json`);
    const content = await readFile(cachePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function saveCache(packageName: string, data: Record<string, any>): Promise<void> {
  const cacheDir = join(CONFIG_DIR, 'cache');
  await mkdir(cacheDir, { recursive: true });
  const cachePath = join(cacheDir, `${packageName.replace(/\//g, '__')}.json`);
  await writeFile(cachePath, JSON.stringify(data, null, 2));
}

export function hasVersionChanged(cache: Record<string, any> | null, currentVersion: string): boolean {
  if (!cache) return false;
  return cache._version !== undefined && cache._version !== currentVersion;
}
