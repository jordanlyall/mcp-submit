import { Octokit } from '@octokit/rest';

// Minimal shape accepted by build helpers — subset of ServerMeta
interface BuildMeta {
  name: string;
  description: string;
  repoUrl: string;
  npmPackage?: string;
  tools?: { name: string; description: string }[];
}

/**
 * Parse a GitHub repo URL into { owner, repo }.
 * Returns null for non-GitHub URLs or malformed paths.
 */
export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

/**
 * Build a formatted markdown body for mcp.so GitHub issue submissions.
 */
export function buildIssueBody(meta: BuildMeta): string {
  const toolList = (meta.tools ?? [])
    .map((t) => `- \`${t.name}\`: ${t.description}`)
    .join('\n');

  return [
    `## MCP Server Submission: ${meta.name}`,
    '',
    `**Description**: ${meta.description}`,
    `**Repository**: ${meta.repoUrl}`,
    meta.npmPackage ? `**npm package**: \`${meta.npmPackage}\`` : null,
    '',
    '### Tools',
    toolList || '_No tools listed._',
  ]
    .filter((line) => line !== null)
    .join('\n');
}

/**
 * Build a single markdown list item for awesome-list PRs.
 */
export function buildAwesomeListEntry(meta: Pick<BuildMeta, 'name' | 'description' | 'repoUrl'>): string {
  return `- [${meta.name}](${meta.repoUrl}) - ${meta.description}`;
}

/**
 * Fetch a file from a GitHub repo and check whether searchTerm appears in it.
 * Returns true if a duplicate is found.
 */
export async function checkDuplicate(
  octokit: Octokit,
  owner: string,
  repo: string,
  filePath: string,
  searchTerm: string,
): Promise<boolean> {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path: filePath });
    if (Array.isArray(data) || data.type !== 'file') return false;
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return content.includes(searchTerm);
  } catch {
    return false;
  }
}

/**
 * Fork an upstream repo, create a branch, update a file, and open a PR.
 * Returns the PR URL.
 */
export async function forkAndCreatePR(
  octokit: Octokit,
  upstream: { owner: string; repo: string },
  filePath: string,
  newContent: string,
  branch: string,
  title: string,
  body: string,
): Promise<{ url: string }> {
  // Fork the upstream repo into the authenticated user's account
  const { data: fork } = await octokit.repos.createFork({
    owner: upstream.owner,
    repo: upstream.repo,
  });

  const forkOwner = fork.owner.login;
  const forkRepo = fork.name;

  // Get the default branch SHA to branch from
  const { data: ref } = await octokit.git.getRef({
    owner: forkOwner,
    repo: forkRepo,
    ref: `heads/${fork.default_branch}`,
  });
  const baseSha = ref.object.sha;

  // Create the new branch
  await octokit.git.createRef({
    owner: forkOwner,
    repo: forkRepo,
    ref: `refs/heads/${branch}`,
    sha: baseSha,
  });

  // Get current file SHA (required for updates)
  let fileSha: string | undefined;
  try {
    const { data: existing } = await octokit.repos.getContent({
      owner: forkOwner,
      repo: forkRepo,
      path: filePath,
      ref: branch,
    });
    if (!Array.isArray(existing) && existing.type === 'file') {
      fileSha = existing.sha;
    }
  } catch {
    // File doesn't exist yet — create it
  }

  // Create or update the file
  await octokit.repos.createOrUpdateFileContents({
    owner: forkOwner,
    repo: forkRepo,
    path: filePath,
    message: title,
    content: Buffer.from(newContent).toString('base64'),
    branch,
    sha: fileSha,
  });

  // Open the PR against upstream
  const { data: pr } = await octokit.pulls.create({
    owner: upstream.owner,
    repo: upstream.repo,
    title,
    body,
    head: `${forkOwner}:${branch}`,
    base: fork.default_branch,
  });

  return { url: pr.html_url };
}
