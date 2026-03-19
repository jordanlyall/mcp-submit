import { describe, it } from 'node:test';
import assert from 'node:assert';
import { awesomePunkpeyeProvider } from '../../src/providers/awesome-punkpeye.ts';

describe('awesome-punkpeye provider', () => {
  it('should always detect as eligible', () => {
    const result = awesomePunkpeyeProvider.detect({
      name: 'test', description: '', version: '', repoUrl: '',
      tools: [], transport: 'stdio', readme: '',
    });
    assert.strictEqual(result.eligible, true);
  });

  it('should have correct metadata', () => {
    assert.strictEqual(awesomePunkpeyeProvider.name, 'awesome-mcp-servers (punkpeye)');
    assert.strictEqual(awesomePunkpeyeProvider.method, 'GitHub PR');
  });
});
