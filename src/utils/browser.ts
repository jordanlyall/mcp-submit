import { execFile } from 'node:child_process';
import { platform } from 'node:os';

export function openInBrowser(url: string): void {
  const plat = platform();
  if (plat === 'darwin') {
    execFile('open', [url]);
  } else if (plat === 'win32') {
    execFile('cmd', ['/c', 'start', url]);
  } else {
    execFile('xdg-open', [url]);
  }
}
