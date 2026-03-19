import type { Provider, ServerMeta, SubmitOpts, SubmitResult } from './types.ts';

export const dockerRegistryProvider: Provider = {
  name: 'Docker MCP Registry',
  url: 'https://github.com/docker/mcp-registry',
  method: 'GitHub PR',
  detect() { return { eligible: true }; },
  async submit(): Promise<SubmitResult> {
    return { status: 'failed', message: 'Docker Registry integration pending — verify catalog entry format' };
  },
};
