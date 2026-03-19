import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Provider types', () => {
  it('should export SUBMIT_STATUSES', async () => {
    const types = await import('../../src/providers/types.ts');
    assert.deepStrictEqual(types.SUBMIT_STATUSES, ['submitted', 'skipped', 'failed', 'manual']);
  });
});
