import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseRepoUrl, buildIssueBody, buildAwesomeListEntry } from '../../src/utils/github.ts';

describe('GitHub helpers', () => {
  it('parseRepoUrl extracts owner and repo', () => {
    const result = parseRepoUrl('https://github.com/artblocks/mcp-server');
    assert.deepStrictEqual(result, { owner: 'artblocks', repo: 'mcp-server' });
  });

  it('parseRepoUrl handles trailing slash', () => {
    const result = parseRepoUrl('https://github.com/artblocks/mcp-server/');
    assert.deepStrictEqual(result, { owner: 'artblocks', repo: 'mcp-server' });
  });

  it('parseRepoUrl returns null for non-GitHub URLs', () => {
    assert.strictEqual(parseRepoUrl('https://gitlab.com/foo/bar'), null);
  });

  it('buildIssueBody includes server details', () => {
    const body = buildIssueBody({
      name: 'test-mcp', description: 'A test server',
      repoUrl: 'https://github.com/test/test-mcp', npmPackage: 'test-mcp',
      tools: [{ name: 'get_data', description: 'Fetches data' }],
    });
    assert.ok(body.includes('test-mcp'));
    assert.ok(body.includes('get_data'));
    assert.ok(body.includes('https://github.com/test/test-mcp'));
  });

  it('buildAwesomeListEntry creates markdown item', () => {
    const entry = buildAwesomeListEntry({
      name: 'test-mcp', description: 'A test server',
      repoUrl: 'https://github.com/test/test-mcp',
    });
    assert.strictEqual(entry, '- [test-mcp](https://github.com/test/test-mcp) - A test server');
  });
});
