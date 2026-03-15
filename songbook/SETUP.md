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

## 2. Usage

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
6. Offers to export to `.docx` via the `/docx` skill
