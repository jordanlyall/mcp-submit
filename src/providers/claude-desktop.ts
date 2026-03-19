import type { Provider, ServerMeta, SubmitResult } from './types.ts';
import { openInBrowser } from '../utils/browser.ts';

export const claudeDesktopProvider: Provider = {
  name: 'Claude Desktop Extensions',
  url: 'https://claude.ai',
  method: 'Browser',
  detect() { return { eligible: true }; },
  async submit(): Promise<SubmitResult> {
    openInBrowser('https://forms.gle/tyiAZvch1kDADKoP9');
    return { status: 'manual', url: 'https://forms.gle/tyiAZvch1kDADKoP9', message: 'Opened Google Form in browser' };
  },
};
