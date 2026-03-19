import { describe, it } from 'node:test';
import assert from 'node:assert';
import { mcpSoProvider } from '../../src/providers/mcp-so.ts';

describe('mcp.so provider', () => {
  it('should always detect as eligible', () => {
    const result = mcpSoProvider.detect({
      name: 'test', description: '', version: '', repoUrl: '',
      tools: [], transport: 'stdio', readme: '',
    });
    assert.strictEqual(result.eligible, true);
  });

  it('should have correct metadata', () => {
    assert.strictEqual(mcpSoProvider.name, 'mcp.so');
    assert.strictEqual(mcpSoProvider.method, 'GitHub Issue');
  });
});
