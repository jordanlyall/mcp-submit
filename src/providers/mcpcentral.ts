import type { Provider, ServerMeta, SubmitOpts, SubmitResult } from './types.ts';

export const mcpCentralProvider: Provider = {
  name: 'MCPCentral',
  url: 'https://mcpcentral.io',
  method: 'API',
  detect() { return { eligible: true }; },
  async submit(): Promise<SubmitResult> {
    return { status: 'failed', message: 'MCPCentral API integration pending' };
  },
};
