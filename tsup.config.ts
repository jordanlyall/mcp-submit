import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
    serve: 'src/serve.ts',
  },
  format: ['esm'],
  target: 'node18',
  clean: true,
  splitting: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
