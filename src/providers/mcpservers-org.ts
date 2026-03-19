import type { Provider, ServerMeta, SubmitResult } from './types.ts';
import { openInBrowser } from '../utils/browser.ts';

export const mcpServersOrgProvider: Provider = {
  name: 'mcpservers.org',
  url: 'https://mcpservers.org',
  method: 'Browser',
  detect() { return { eligible: true }; },
  async submit(): Promise<SubmitResult> {
    openInBrowser('https://mcpservers.org/submit');
    return { status: 'manual', url: 'https://mcpservers.org/submit', message: 'Opened in browser' };
  },
};
