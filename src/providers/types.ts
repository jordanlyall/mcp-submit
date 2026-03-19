export const SUBMIT_STATUSES = ['submitted', 'skipped', 'failed', 'manual'] as const;

export type SubmitStatus = typeof SUBMIT_STATUSES[number];

export interface ServerMeta {
  name: string;
  description: string;
  version: string;
  repoUrl: string;
  npmPackage?: string;
  homepage?: string;
  author?: string;
  license?: string;
  tools: { name: string; description: string }[];
  transport: 'stdio' | 'http' | 'both';
  remoteUrl?: string;
  categories?: string[];
  readme: string;
}

export interface SubmitOpts {
  dryRun: boolean;
  force: boolean;
  githubToken?: string;
}

export interface SubmitResult {
  status: SubmitStatus;
  url?: string;
  message: string;
}

export interface DetectResult {
  eligible: boolean;
  reason?: string;
}

export interface Provider {
  name: string;
  url: string;
  method: string;
  detect(meta: ServerMeta): DetectResult;
  submit(meta: ServerMeta, opts: SubmitOpts): Promise<SubmitResult>;
}
