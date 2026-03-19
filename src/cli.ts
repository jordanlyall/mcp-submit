import { parseArgs } from 'node:util';
import { execFileSync } from 'node:child_process';
import { detectMetadata } from './detect.ts';
import { runSubmissions, type ProviderResult } from './core.ts';
import { allProviders } from './providers/index.ts';
import { getAuth, saveAuth, getCache, saveCache, hasVersionChanged } from './utils/config.ts';
import { confirm, password } from '@inquirer/prompts';

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    only: { type: 'string' },
    skip: { type: 'string' },
    status: { type: 'boolean', default: false },
    yes: { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
    introspect: { type: 'boolean', default: false },
    serve: { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
  },
  strict: false,
});

if (values.help) {
  console.log(`
  mcp-submit — Submit your MCP server to all major directories

  Usage: npx mcp-submit [options]

  Options:
    --dry-run      Show what would happen, don't submit
    --only <dirs>  Target specific directories (comma-separated)
    --skip <dirs>  Exclude specific directories
    --status       Check status of previous submissions
    --yes          Skip confirmation prompt
    --force        Re-submit even if cached
    --introspect   Auto-discover tools by starting server locally
    --serve        Start as MCP server
    --help         Show this help
  `);
  process.exit(0);
}

if (values.serve) {
  const { startServer } = await import('./serve.ts');
  startServer();
} else {
  await main();
}

async function main() {
  console.log('\n  mcp-submit\n');

  // Detect metadata
  console.log('  Detecting server metadata...');
  const meta = await detectMetadata(process.cwd());

  if (!meta.name) {
    console.error('  Could not detect server metadata. Run this in an MCP server directory.');
    process.exit(1);
  }

  console.log(`  ✓ ${meta.name} v${meta.version} (${meta.tools.length} tools, ${meta.transport})\n`);

  // Check cache for re-run
  const cache = await getCache(meta.name);
  if (cache && !values.force) {
    if (hasVersionChanged(cache, meta.version)) {
      console.log(`  New version detected (${cache._version} → ${meta.version}).`);
    } else {
      console.log('  Previous submissions found. Use --force to re-submit or --status to check.');
    }
  }

  // Resolve GitHub token (skip prompt in dry-run)
  let githubToken: string | undefined;
  if (!values['dry-run']) {
    const auth = await getAuth();
    if (auth?.githubToken) {
      githubToken = auth.githubToken;
    } else {
      try {
        githubToken = execFileSync('gh', ['auth', 'token'], { encoding: 'utf-8' }).trim();
      } catch {
        // gh not installed or not authenticated
      }
    }

    if (!githubToken) {
      githubToken = await password({ message: '  GitHub token (repo scope):' });
      if (githubToken) await saveAuth({ githubToken });
    }
  }

  // Filter providers
  let providers = allProviders;
  if (values.only) {
    const names = (values.only as string).split(',').map(s => s.trim().toLowerCase());
    providers = providers.filter(p => names.some(n => p.name.toLowerCase().includes(n)));
  }
  if (values.skip) {
    const names = (values.skip as string).split(',').map(s => s.trim().toLowerCase());
    providers = providers.filter(p => !names.some(n => p.name.toLowerCase().includes(n)));
  }

  // Show eligibility table
  console.log('  Eligible directories:\n');
  console.log('  Directory                  Method         Status');
  console.log('  ─────────────────────────  ─────────────  ──────');

  const detections = providers.map(p => ({ provider: p, detection: p.detect(meta) }));
  for (const { provider, detection } of detections) {
    const status = detection.eligible ? 'Ready' : `Skipped (${detection.reason})`;
    console.log(`  ${provider.name.padEnd(27)} ${provider.method.padEnd(15)} ${status}`);
  }

  const eligible = detections.filter(d => d.detection.eligible);
  const automated = eligible.filter(d => d.provider.method !== 'Browser');
  const manual = eligible.filter(d => d.provider.method === 'Browser');

  if (eligible.length === 0) {
    console.log('\n  No eligible directories found.');
    process.exit(0);
  }

  console.log(`\n  ${automated.length} automated, ${manual.length} browser-open\n`);

  // Confirm
  if (!values.yes && !values['dry-run']) {
    const ok = await confirm({ message: '  Proceed?', default: true });
    if (!ok) {
      console.log('  Cancelled.');
      process.exit(0);
    }
  }

  // Submit
  console.log('\n  Submitting...');
  const results = await runSubmissions(meta, providers, {
    dryRun: values['dry-run'] as boolean,
    force: values.force as boolean,
    githubToken,
  });

  // Print results
  console.log('');
  for (const r of results) {
    const icon = r.result.status === 'submitted' ? '✓'
      : r.result.status === 'manual' ? '⤳'
      : r.result.status === 'skipped' ? '–'
      : '✗';
    const urlStr = r.result.url ? `  ${r.result.url}` : '';
    console.log(`  ${icon} ${r.provider.padEnd(27)} ${r.result.message}${urlStr}`);
  }

  // Cache results
  const submitted = results.filter(r => r.result.status === 'submitted' || r.result.status === 'manual');
  if (submitted.length > 0) {
    const cacheData: Record<string, any> = { _version: meta.version };
    for (const r of submitted) {
      cacheData[r.provider] = { url: r.result.url, status: r.result.status, timestamp: new Date().toISOString() };
    }
    await saveCache(meta.name, cacheData);
  }

  const successCount = results.filter(r => r.result.status === 'submitted').length;
  const manualCount = results.filter(r => r.result.status === 'manual').length;
  console.log(`\n  ${successCount} submitted, ${manualCount} opened in browser.\n`);
}
