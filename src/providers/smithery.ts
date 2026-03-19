import { execFileSync } from 'node:child_process';
import type { Provider, ServerMeta, SubmitOpts, SubmitResult } from './types.ts';

function isSmitheryInstalled(): boolean {
  try {
    execFileSync('smithery', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export const smitheryProvider: Provider = {
  name: 'Smithery',
  url: 'https://smithery.ai',
  method: 'CLI',

  detect(meta: ServerMeta) {
    if (meta.transport === 'stdio' || !meta.remoteUrl) {
      return { eligible: false, reason: 'Requires remote HTTP endpoint' };
    }
    if (!isSmitheryInstalled()) {
      return { eligible: false, reason: 'Smithery CLI not installed (npm i -g smithery)' };
    }
    return { eligible: true };
  },

  async submit(meta: ServerMeta): Promise<SubmitResult> {
    try {
      const name = meta.npmPackage ?? meta.name;
      execFileSync('smithery', ['mcp', 'publish', meta.remoteUrl!, '-n', name], { stdio: 'pipe' });
      return { status: 'submitted', url: `https://smithery.ai/server/${name}`, message: 'Published' };
    } catch (err) {
      return { status: 'failed', message: err instanceof Error ? err.message : 'smithery publish failed' };
    }
  },
};
