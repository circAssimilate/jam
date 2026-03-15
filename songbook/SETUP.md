# Songbook — Setup Guide

## 1. Scales MCP Server (required)

Already built. Just compile it:

```bash
cd songbook/scales-mcp
npm install
npm run build
```

The MCP server is configured in `.claude/settings.json` and will be available
as tools `generate_scale` and `suggest_scales` when you open Claude Code in
the `jam/` directory.

## 2. Google Docs MCP (optional)

To enable writing songbook entries directly to Google Docs, set up a Google Docs
MCP server. Without this, `/songbook` will output formatted markdown in the
conversation instead.

### Option A: google-docs-mcp (community, most popular)

1. Install and authenticate:
   ```bash
   npx google-docs-mcp auth
   ```
   This opens a browser for Google OAuth consent. Tokens are saved locally.

2. Add to `.claude/settings.json`:
   ```json
   {
     "mcpServers": {
       "songbook-scales": {
         "command": "node",
         "args": ["songbook/scales-mcp/dist/index.js"]
       },
       "google-docs": {
         "command": "npx",
         "args": ["-y", "google-docs-mcp"]
       }
     }
   }
   ```

### Option B: Any other Google Docs MCP

Add it to `.claude/settings.json` under `mcpServers` with key `"google-docs"`.
The `/songbook` command checks for `mcp__google-docs__*` tools and will use
whatever Google Docs MCP you configure.

### Google Cloud setup (if needed by your chosen MCP)

1. Go to https://console.cloud.google.com/
2. Create a project or select an existing one
3. Enable the **Google Docs API** and **Google Drive API**
4. Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Set application type to **Desktop app**
6. Download the credentials JSON
7. Follow your MCP server's auth instructions with those credentials

## 3. Usage

Open Claude Code in the `jam/` directory:

```bash
cd ~/Development/jam
claude
```

Then use the `/songbook` command:

```
/songbook Cissy Strut by The Meters
/songbook Use Me - Bill Withers; Superstition - Stevie Wonder
/songbook Ain't No Sunshine, Bill Withers; Brick House, The Commodores; Pick Up the Pieces, Average White Band
```

### What happens

1. Claude parses your song list
2. For multiple songs, spawns parallel subagents (one per song)
3. Each subagent researches the song (key, capo, tuning, tempo, chords)
4. Calls the scales MCP to generate 3 scale diagrams per song
5. Returns a formatted songbook entry
6. If Google Docs MCP is configured, offers to push to a Google Doc
7. Otherwise, outputs everything as formatted text in the conversation
