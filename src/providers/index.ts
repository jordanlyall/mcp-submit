import type { Provider } from './types.ts';
import { mcpRegistryProvider } from './mcp-registry.ts';
import { smitheryProvider } from './smithery.ts';
import { mcpCentralProvider } from './mcpcentral.ts';
import { mcpSoProvider } from './mcp-so.ts';
import { awesomePunkpeyeProvider } from './awesome-punkpeye.ts';
import { awesomeAppcypherProvider } from './awesome-appcypher.ts';
import { dockerRegistryProvider } from './docker-registry.ts';
import { pulseMcpProvider } from './pulsemcp.ts';
import { mcpServersOrgProvider } from './mcpservers-org.ts';
import { claudeDesktopProvider } from './claude-desktop.ts';
import { allMcpsProvider } from './allmcps.ts';

export const allProviders: Provider[] = [
  mcpRegistryProvider,
  smitheryProvider,
  mcpCentralProvider,
  mcpSoProvider,
  awesomePunkpeyeProvider,
  awesomeAppcypherProvider,
  dockerRegistryProvider,
  pulseMcpProvider,
  mcpServersOrgProvider,
  claudeDesktopProvider,
  allMcpsProvider,
];
