import { describe, it } from 'node:test';
import assert from 'node:assert';
import { detectMetadata } from '../src/detect.ts';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, 'fixtures');

describe('detectMetadata', () => {
  it('should detect from server.json when present', async () => {
    const meta = await detectMetadata(fixturesDir);
    assert.strictEqual(meta.name, 'test-mcp');
    assert.strictEqual(meta.description, 'A test MCP server');
    assert.strictEqual(meta.version, '1.0.0');
    assert.strictEqual(meta.transport, 'http');
    assert.strictEqual(meta.remoteUrl, 'https://example.com/mcp');
    assert.strictEqual(meta.tools.length, 2);
    assert.strictEqual(meta.npmPackage, 'test-mcp');
  });

  it('should fall back to package.json fields', async () => {
    const meta = await detectMetadata(fixturesDir);
    assert.strictEqual(meta.repoUrl, 'https://github.com/test/test-mcp');
    assert.strictEqual(meta.homepage, 'https://test-mcp.dev');
    assert.strictEqual(meta.author, 'Test Author');
    assert.strictEqual(meta.license, 'MIT');
  });

  it('should include readme content', async () => {
    const meta = await detectMetadata(fixturesDir);
    assert.ok(meta.readme.includes('# test-mcp'));
  });
});
