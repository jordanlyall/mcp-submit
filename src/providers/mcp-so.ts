import type { Provider, ServerMeta, SubmitOpts, SubmitResult } from './types.ts';
import { buildIssueBody } from '../utils/github.ts';
import { Octokit } from '@octokit/rest';

export const mcpSoProvider: Provider = {
  name: 'mcp.so',
  url: 'https://mcp.so',
  method: 'GitHub Issue',

  detect() {
    return { eligible: true };
  },

  async submit(meta: ServerMeta, opts: SubmitOpts): Promise<SubmitResult> {
    if (!opts.githubToken) {
      return { status: 'failed', message: 'GitHub token required' };
    }

    const octokit = new Octokit({ auth: opts.githubToken });
    const body = buildIssueBody(meta);

    const { data: issue } = await octokit.issues.create({
      owner: 'chatmcp',
      repo: 'mcpso',
      title: `[Submit] ${meta.name} — ${meta.description}`,
      body,
    });

    return {
      status: 'submitted',
      url: issue.html_url,
      message: `Issue #${issue.number}`,
    };
  },
};
