Research and create formatted guitar songbook entries for: $ARGUMENTS

## How to parse the input

The user provides song names and artists as free text. Parse as best you can:
- "Cissy Strut by The Meters" → title: "Cissy Strut", artist: "The Meters"
- "Use Me - Bill Withers" → title: "Use Me", artist: "Bill Withers"
- "Superstition, Stevie Wonder" → title: "Superstition", artist: "Stevie Wonder"
- Multiple songs may be separated by newlines, semicolons, or commas between entries

If a song or artist is ambiguous, use AskUserQuestion to clarify before proceeding.

## Workflow

If there are multiple songs, spawn a **subagent per song** using the Agent tool so they are researched in parallel. Each subagent should:

1. **Research the song** using WebSearch:
   - Search for "[song title] [artist] guitar chords key capo tuning bpm"
   - Extract: sounding key, capo position, tuning, approximate tempo, song structure with chord progressions
   - If any field can't be confirmed, mark it `[UNVERIFIED - please check]`

2. **Get scale suggestions** by calling the `suggest_scales` MCP tool with the song's key, then call `generate_scale` for each suggested scale (3 total) to get ASCII tab diagrams.

3. **Format the entry** using the exact format specified in CLAUDE.md under "Songbook entry format".

4. **Return the complete formatted entry** as text.

After all subagents complete, the main conversation should:

1. Collect all formatted entries
2. Save each entry to `output/` as a `.md` file (e.g. `output/use-me.md`). Use a sanitized lowercase kebab-case filename based on the song title.
3. Present the entries in the conversation
4. Ask the user if they want to export to a .docx file
5. If yes, use the `/docx` skill to generate a .docx from the combined entries

## Important rules

- **Never reproduce copyrighted lyrics.** Always use placeholders: `[Verse 1 - see official lyrics source]`
- Each subagent prompt must include the full formatting spec from CLAUDE.md so it can work independently
- Tell each subagent: "Research this song and return a formatted songbook entry. Do NOT write to any files. Just return the formatted text."
