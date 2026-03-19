# mcp-submit

Submit your MCP server to all major directories in one command.

## Usage

```
npx mcp-submit
```

No install required.

## Example

```
$ npx mcp-submit

  mcp-submit

  Detecting server metadata...
  ✓ @artblocks/mcp v1.1.0 (21 tools, http)

  Eligible directories:

  Directory                  Method         Status
  ─────────────────────────  ─────────────  ──────
  Official MCP Registry      API            Ready
  Smithery                   CLI            Ready
  MCPCentral                 API            Ready
  mcp.so                     GitHub Issue   Ready
  awesome (punkpeye)         GitHub PR      Ready
  awesome (appcypher)        GitHub PR      Ready
  PulseMCP                   Browser        Manual step
  mcpservers.org             Browser        Manual step
  Claude Desktop             Browser        Manual step

  6 automated, 3 browser-open

  Submitting...
  ✓ Official MCP Registry    Published  registry.modelcontextprotocol.io/...
  ✓ Smithery                 Published  smithery.ai/server/@artblocks/mcp
  ✓ MCPCentral               Published  mcpcentral.io/server/artblocks-mcp
  ✓ mcp.so                   Issue #42  github.com/chatmcp/mcpso/issues/42
  ✓ awesome (punkpeye)       PR #2041   github.com/punkpeye/awesome.../pull/2041
  ✓ awesome (appcypher)      PR #301    github.com/appcypher/awesome.../pull/301
  ⤳ PulseMCP                 Opened     pulsemcp.com/submit
  ⤳ mcpservers.org           Opened     mcpservers.org/submit
  ⤳ Claude Desktop           Opened     forms.gle/...

  6 submitted, 3 opened in browser.
```

## Supported Directories

| Directory | Method | Automated? |
|-----------|--------|------------|
| Official MCP Registry | API | Yes |
| Smithery | CLI | Yes (if installed) |
| MCPCentral | API | Yes |
| mcp.so | GitHub Issue | Yes |
| awesome-mcp-servers (punkpeye) | GitHub PR | Yes |
| awesome-mcp-servers (appcypher) | GitHub PR | Yes |
| Docker MCP Registry | GitHub PR | Yes (if Dockerfile) |
| PulseMCP | Browser | Opens form |
| mcpservers.org | Browser | Opens form |
| Claude Desktop Extensions | Browser | Opens form |
| GitHub MCP Registry | Auto | Free (syncs from official) |
| Glama.ai | Auto | Free (indexes from GitHub) |

## Flags

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview what would be submitted, no action taken |
| `--only <dirs>` | Submit to specific directories only (comma-separated) |
| `--skip <dirs>` | Skip specific directories |
| `--status` | Check submission status across directories |
| `--yes` | Skip confirmation prompts |
| `--force` | Resubmit even if already listed |
| `--introspect` | Connect to running server to detect tools/metadata |
| `--serve` | Run as an MCP server |

## MCP Server

Wire mcp-submit into your `.mcp.json` to submit directly from Claude Code or any MCP client:

```json
{
  "mcpServers": {
    "mcp-submit": {
      "command": "npx",
      "args": ["mcp-submit", "--serve"]
    }
  }
}
```

## How It Works

mcp-submit reads `server.json` > `package.json` > `README.md` to detect your server name, version, description, tools, and transport type. It then determines which directories you are eligible for and submits automatically where possible, opening browser tabs for directories that require manual forms.

## License

MIT
