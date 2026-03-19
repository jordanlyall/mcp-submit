import { describe, it } from 'node:test';
import assert from 'node:assert';
import { runSubmissions } from '../src/core.ts';
import type { Provider, ServerMeta, SubmitOpts } from '../src/providers/types.ts';

const fakeMeta: ServerMeta = {
  name: 'test-mcp',
  description: 'A test server',
  version: '1.0.0',
  repoUrl: 'https://github.com/test/test-mcp',
  tools: [],
  transport: 'stdio',
  readme: '',
};

const fakeProvider: Provider = {
  name: 'Fake Directory',
  url: 'https://fake.dev',
  method: 'API',
  detect: () => ({ eligible: true }),
  submit: async () => ({ status: 'submitted', url: 'https://fake.dev/listing', message: 'Published' }),
};

const ineligibleProvider: Provider = {
  name: 'Ineligible',
  url: 'https://nope.dev',
  method: 'API',
  detect: () => ({ eligible: false, reason: 'No remote URL' }),
  submit: async () => ({ status: 'skipped', message: 'Should not be called' }),
};

describe('Core orchestrator', () => {
  it('should run eligible providers and skip ineligible ones', async () => {
    const results = await runSubmissions(fakeMeta, [fakeProvider, ineligibleProvider], { dryRun: false, force: false });
    assert.strictEqual(results.length, 2);
    assert.strictEqual(results[0].provider, 'Fake Directory');
    assert.strictEqual(results[0].result.status, 'submitted');
    assert.strictEqual(results[1].provider, 'Ineligible');
    assert.strictEqual(results[1].result.status, 'skipped');
  });

  it('should not call submit in dry-run mode', async () => {
    let submitCalled = false;
    const spy: Provider = {
      ...fakeProvider,
      submit: async () => { submitCalled = true; return { status: 'submitted', message: 'ok' }; },
    };
    const results = await runSubmissions(fakeMeta, [spy], { dryRun: true, force: false });
    assert.strictEqual(submitCalled, false);
    assert.strictEqual(results[0].result.status, 'skipped');
    assert.ok(results[0].result.message.includes('dry run'));
  });

  it('should catch provider errors as failed status', async () => {
    const errorProvider: Provider = {
      ...fakeProvider,
      name: 'Error Provider',
      submit: async () => { throw new Error('Network failed'); },
    };
    const results = await runSubmissions(fakeMeta, [errorProvider], { dryRun: false, force: false });
    assert.strictEqual(results[0].result.status, 'failed');
    assert.ok(results[0].result.message.includes('Network failed'));
  });
});
