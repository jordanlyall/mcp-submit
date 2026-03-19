import type { Provider, ServerMeta, SubmitResult } from './types.ts';
import { openInBrowser } from '../utils/browser.ts';

export const pulseMcpProvider: Provider = {
  name: 'PulseMCP',
  url: 'https://pulsemcp.com',
  method: 'Browser',
  detect() { return { eligible: true }; },
  async submit(): Promise<SubmitResult> {
    openInBrowser('https://pulsemcp.com/submit');
    return { status: 'manual', url: 'https://pulsemcp.com/submit', message: 'Opened in browser' };
  },
};
