import type { Provider, ServerMeta, SubmitOpts, SubmitResult } from './types.ts';
import { Octokit } from '@octokit/rest';
import { checkDuplicate, forkAndCreatePR, buildAwesomeListEntry } from '../utils/github.ts';

export const awesomeAppcypherProvider: Provider = {
  name: 'awesome-mcp-servers (appcypher)',
  url: 'https://github.com/appcypher/awesome-mcp-servers',
  method: 'GitHub PR',

  detect() {
    return { eligible: true };
  },

  async submit(meta: ServerMeta, opts: SubmitOpts): Promise<SubmitResult> {
    if (!opts.githubToken) {
      return { status: 'failed', message: 'GitHub token required' };
    }

    const octokit = new Octokit({ auth: opts.githubToken });
    const upstream = { owner: 'appcypher', repo: 'awesome-mcp-servers' };

    const isDuplicate = await checkDuplicate(octokit, upstream.owner, upstream.repo, 'README.md', meta.repoUrl);
    if (isDuplicate) {
      return { status: 'skipped', message: 'Already listed in this directory' };
    }

    const { data: file } = await octokit.repos.getContent({
      owner: upstream.owner, repo: upstream.repo, path: 'README.md',
    });
    const currentContent = Buffer.from((file as any).content, 'base64').toString('utf-8');
    const entry = buildAwesomeListEntry(meta);
    const newContent = currentContent.trimEnd() + '\n' + entry + '\n';

    const branch = `add-${meta.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
    const { url } = await forkAndCreatePR(
      octokit, upstream, 'README.md', newContent, branch,
      `Add ${meta.name}`,
      `Adding ${meta.name}.\n\n${meta.description}\n\n**Repository**: ${meta.repoUrl}\n\n---\n*Submitted via [mcp-submit](https://github.com/jordanlyall/mcp-submit)*`,
    );

    return { status: 'submitted', url, message: 'PR created' };
  },
};
