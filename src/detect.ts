import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ServerMeta } from './providers/types.ts';

async function readJsonFile(path: string): Promise<any | null> {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function readTextFile(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf-8');
  } catch {
    return '';
  }
}

export async function detectMetadata(dir: string): Promise<ServerMeta> {
  const serverJson = await readJsonFile(join(dir, 'server.json'));
  const packageJson = await readJsonFile(join(dir, 'package.json'));
  const readme = await readTextFile(join(dir, 'README.md'));

  const hasRemote = serverJson?.remotes?.length > 0;
  const hasStdio = !hasRemote;
  let transport: ServerMeta['transport'] = 'stdio';
  if (hasRemote && !hasStdio) transport = 'http';
  if (hasRemote && hasStdio) transport = 'both';

  let repoUrl = '';
  if (packageJson?.repository) {
    if (typeof packageJson.repository === 'string') {
      repoUrl = packageJson.repository;
    } else if (packageJson.repository.url) {
      repoUrl = packageJson.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
    }
  }

  return {
    name: serverJson?.name ?? packageJson?.name ?? '',
    description: serverJson?.description ?? packageJson?.description ?? '',
    version: serverJson?.version ?? packageJson?.version ?? '',
    repoUrl,
    npmPackage: serverJson?.packages?.find((p: any) => p.registry_name === 'npm')?.name
      ?? packageJson?.name,
    homepage: packageJson?.homepage,
    author: typeof packageJson?.author === 'string'
      ? packageJson.author
      : packageJson?.author?.name,
    license: packageJson?.license,
    tools: serverJson?.tools ?? [],
    transport,
    remoteUrl: serverJson?.remotes?.[0]?.url,
    categories: [],
    readme,
  };
}
