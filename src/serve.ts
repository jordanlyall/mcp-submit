import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { detectMetadata } from './detect.ts';
import { runSubmissions } from './core.ts';
import { allProviders } from './providers/index.ts';
import { getCache } from './utils/config.ts';

export async function startServer(): Promise<void> {
  const server = new McpServer(
    { name: 'mcp-submit', version: '0.1.0' },
  );

  server.tool(
    'mcp_submit_detect',
    'Detect MCP server metadata and check eligibility for each directory',
    { path: z.string().optional().describe('Path to MCP server directory (defaults to cwd)') },
    async ({ path }) => {
      const dir = path ?? process.cwd();
      const meta = await detectMetadata(dir);
      const eligibility = allProviders.map((p) => ({
        provider: p.name,
        url: p.url,
        method: p.method,
        ...p.detect(meta),
      }));
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ meta, eligibility }, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    'mcp_submit_run',
    'Submit the MCP server to directories. Skips already-submitted providers unless --force.',
    {
      path: z.string().optional().describe('Path to MCP server directory (defaults to cwd)'),
      directories: z.array(z.string()).optional().describe('Target specific provider names (omit for all)'),
      dryRun: z.boolean().optional().describe('Show what would happen without submitting'),
    },
    async ({ path, directories, dryRun }) => {
      const dir = path ?? process.cwd();
      const meta = await detectMetadata(dir);

      let providers = allProviders;
      if (directories && directories.length > 0) {
        const names = new Set(directories.map((d) => d.toLowerCase()));
        providers = allProviders.filter((p) => names.has(p.name.toLowerCase()));
      }

      const results = await runSubmissions(meta, providers, {
        dryRun: dryRun ?? false,
        force: false,
      });

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    'mcp_submit_status',
    'Return cached submission statuses for this MCP server',
    { path: z.string().optional().describe('Path to MCP server directory (defaults to cwd)') },
    async ({ path }) => {
      const dir = path ?? process.cwd();
      const meta = await detectMetadata(dir);
      const packageName = meta.npmPackage ?? meta.name;
      const cache = packageName ? await getCache(packageName) : null;

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              cache ?? { message: 'No cached submission data found' },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
