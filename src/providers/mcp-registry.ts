import type { Provider, ServerMeta, SubmitOpts, SubmitResult } from './types.ts';

export const mcpRegistryProvider: Provider = {
  name: 'Official MCP Registry',
  url: 'https://registry.modelcontextprotocol.io',
  method: 'API',
  detect() { return { eligible: true }; },
  async submit(): Promise<SubmitResult> {
    return { status: 'failed', message: 'MCP Registry API integration pending — use mcp-publisher CLI directly' };
  },
};
