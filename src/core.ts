import type { Provider, ServerMeta, SubmitOpts, SubmitResult } from './providers/types.ts';

export interface ProviderResult {
  provider: string;
  url: string;
  method: string;
  result: SubmitResult;
}

export async function runSubmissions(
  meta: ServerMeta,
  providers: Provider[],
  opts: SubmitOpts,
): Promise<ProviderResult[]> {
  const results: ProviderResult[] = [];

  for (const provider of providers) {
    const detection = provider.detect(meta);

    if (!detection.eligible) {
      results.push({
        provider: provider.name,
        url: provider.url,
        method: provider.method,
        result: { status: 'skipped', message: detection.reason ?? 'Not eligible' },
      });
      continue;
    }

    if (opts.dryRun) {
      results.push({
        provider: provider.name,
        url: provider.url,
        method: provider.method,
        result: { status: 'skipped', message: 'Skipped (dry run)' },
      });
      continue;
    }

    try {
      const result = await provider.submit(meta, opts);
      results.push({
        provider: provider.name,
        url: provider.url,
        method: provider.method,
        result,
      });
    } catch (err) {
      results.push({
        provider: provider.name,
        url: provider.url,
        method: provider.method,
        result: {
          status: 'failed',
          message: err instanceof Error ? err.message : 'Unknown error',
        },
      });
    }
  }

  return results;
}
