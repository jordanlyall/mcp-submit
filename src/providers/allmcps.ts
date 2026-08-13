import type { Provider, SubmitResult } from './types.ts';
import { openInBrowser } from '../utils/browser.ts';

export const allMcpsProvider: Provider = {
  name: 'AllMCPs',
  url: 'https://allmcps.com',
  method: 'Browser',
  detect() { return { eligible: true }; },
  async submit(): Promise<SubmitResult> {
    openInBrowser('https://allmcps.com/submit');
    return { status: 'manual', url: 'https://allmcps.com/submit', message: 'Opened in browser' };
  },
};
